# tests/test_platform.py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from app import app
from dependencies import get_settings
from models.settings import WorkerSettings

class MockKV:
    def __init__(self):
        self.store = {}
    async def get(self, key):
        return self.store.get(key)
    async def put(self, key, value, expirationTtl=None):
        self.store[key] = value

@pytest.fixture
def client(monkeypatch):
    # Mock HTTP client responses so we don't hit the real CF API
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
                return MockResponse({"result": [{"latest_stage": {"status": "success"}, "url": "https://test.pages.dev", "environment": "production"}]})
            if "api.sanity.io" in url or "discord" in url:
                return MockResponse({}) # For health checks
            return MockResponse({})
            
        async def post(self, url, **kwargs):
            if "deploy_hooks" in url:
                return MockResponse({}, 200)
            if "graphql" in url:
                return MockResponse({"data": {"viewer": {"accounts": [{"workersInvocationsAdaptive": [{"sum": {"requests": 10}, "dimensions": {"datetime": "2026-01-01"}}]}]}}})
            return MockResponse({})

    # Patch the HTTP client across the router and service
    import services.cf_client
    import routers.platform
    monkeypatch.setattr(services.cf_client, "get_client", lambda **kw: MockAsyncClient())
    monkeypatch.setattr(routers.platform, "get_client", lambda **kw: MockAsyncClient())

    def _mock_settings():
        mock = MagicMock(spec=WorkerSettings)
        mock.required_secrets = {"admin_api_key": "test-admin-key"}
        mock.optional_secrets = {
            "cf_account_id": "fake-account",
            "cf_api_token": "fake-token",
            "cf_deploy_hook_capstone": "https://fake.url/hook",
            "discord_webhook_url": "http://fake-discord.url"
        }
        mock.env_vars = {"sanity_project_id": "test"}
        mock.kv = MockKV()
        mock.db = True
        return mock

    app.dependency_overrides[get_settings] = _mock_settings

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()

def test_deploy_status(client):
    response = client.get("/api/v1/platform/deploy-status?site=capstone")
    assert response.status_code == 200
    data = response.json()
    assert data["site"] == "capstone"
    assert data["status"] == "success"
    assert data["url"] == "https://test.pages.dev"

def test_rebuild_requires_auth(client):
    response = client.post("/api/v1/platform/rebuild?site=capstone")
    assert response.status_code == 403

def test_rebuild_success(client):
    response = client.post("/api/v1/platform/rebuild?site=capstone", headers={"X-Admin-API-Key": "test-admin-key"})
    assert response.status_code == 200
    assert response.json()["triggered"] is True

def test_rebuild_invalid_site(client):
    response = client.post("/api/v1/platform/rebuild?site=invalid", headers={"X-Admin-API-Key": "test-admin-key"})
    assert response.status_code == 400

def test_health_aggregate(client):
    response = client.get("/api/v1/platform/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "sanity" in data["checks"]
    assert "discord" in data["checks"]

def test_analytics(client):
    response = client.get("/api/v1/platform/analytics?metric=requests&period=24h", headers={"X-Admin-API-Key": "test-admin-key"})
    assert response.status_code == 200
    data = response.json()
    assert data["metric"] == "requests"
    assert len(data["data"]) == 1
    assert data["data"][0]["value"] == 10