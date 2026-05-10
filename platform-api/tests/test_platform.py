# tests/test_platform.py
import pytest
from fastapi import Request, HTTPException
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from app import app
from dependencies import get_settings, require_authenticated_user
from models.settings import WorkerSettings

class MockKV:
    def __init__(self):
        self.store = {}
    async def get(self, key, *args, **kwargs):
        return self.store.get(key)
    async def put(self, key, value, *args, **kwargs):
        self.store[key] = value

@pytest.fixture
def client(monkeypatch):
    class MockResponse:
        def __init__(self, json_data, status_code=200):
            self._json = json_data
            self.status_code = status_code
        def json(self): return self._json
        def raise_for_status(self): pass

    class MockAsyncClient:
        async def __aenter__(self): return self
        async def __aexit__(self, exc_type, exc_val, exc_tb): pass
        
        async def get(self, url, **kwargs):
            if "deployments" in url:
                return MockResponse({"result":[{"latest_stage": {"status": "active"}, "url": "https://test.pages.dev", "environment": "production"}]})
            if "api.sanity.io" in url:
                return MockResponse({})
            return MockResponse({})
            
        async def post(self, url, **kwargs):
            if "graphql" in url:
                return MockResponse({
                    "data": {"viewer": {"accounts": [{"analyticsEngineEventsAdaptiveGroups":[{"sum": {"double1": 10}, "dimensions": {"datetimeHour": "2026-01-01T00:00:00Z"}}]}]}}
                })
            if "rebuild" in url:
                return MockResponse({"site": "capstone", "triggered": True, "message": "Rebuild triggered"})
            return MockResponse({})

    import services.cf_client
    import routers.platform
    monkeypatch.setattr(services.cf_client, "get_client", lambda **kw: MockAsyncClient())
    monkeypatch.setattr(routers.platform, "get_client", lambda **kw: MockAsyncClient())

    def _mock_settings():
        mock = MagicMock(spec=WorkerSettings)
        
        mock.required_secrets = {
            "admin_api_key": "test-admin"
        }
        
        mock.optional_secrets = {
            "cf_api_token": "fake-token",
            "cf_account_id": "fake-account-id",
            "sanity_api_write_token": "test-write-token",
            "cf_deploy_hook_capstone": "https://fake.url/hook"
        }
        
        mock.env_vars = {
            "sanity_project_id": "test",
            "cf_deploy_hook_capstone": "https://fake.url/hook"
        }
        
        mock.cf_account_id = "fake-account"
        mock.cf_api_token = "fake-token"
        mock.cf_deploy_hook_capstone = "https://fake.url/hook"
        mock.sanity_project_id = "test"
        
        mock.kv = MockKV()
        
        mock_db = MagicMock()
        mock_db.prepare.return_value.bind.return_value.first = MagicMock(return_value={"email": "admin@example.com"})
        mock.db = mock_db
        
        mock.ai = None
        return mock

    async def mock_require_auth(request: Request):
        auth = request.headers.get("Authorization")
        if not auth or auth != "Bearer valid-test-token":
            raise HTTPException(status_code=401, detail="Not authenticated")
        return "admin@example.com"

    app.dependency_overrides[get_settings] = _mock_settings
    app.dependency_overrides[require_authenticated_user] = mock_require_auth

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()

def test_deploy_status(client):
    response = client.get("/api/v1/platform/deploy-status?site=capstone")
    assert response.status_code == 200
    data = response.json()
    assert data["site"] == "capstone"
    assert data["status"] == "active"
    assert data["url"] == "https://test.pages.dev"

def test_rebuild_requires_auth(client):
    response = client.post("/api/v1/platform/rebuild?site=capstone")
    assert response.status_code == 401

def test_rebuild_success(client):
    response = client.post("/api/v1/platform/rebuild?site=capstone", headers={"Authorization": "Bearer valid-test-token"})
    assert response.status_code == 200
    assert response.json()["triggered"] is True

def test_rebuild_invalid_site(client):
    response = client.post("/api/v1/platform/rebuild?site=invalid", headers={"Authorization": "Bearer valid-test-token"})
    assert response.status_code == 400

def test_health_aggregate(client):
    # FIX: Ensure this hits the actual path defined in your router
    response = client.get("/api/v1/platform/health")
    assert response.status_code == 200
    data = response.json()
    assert "checks" in data
    assert "status" in data
    assert data["status"] in ("ok", "degraded", "error")

def test_analytics(client):
    response = client.get("/api/v1/platform/analytics?metric=form_submissions&period=24h", headers={"Authorization": "Bearer valid-test-token"})
    assert response.status_code == 200
    data = response.json()
    assert data["metric"] == "form_submissions"
    assert len(data["data"]) == 1
    assert data["data"][0]["value"] == 10