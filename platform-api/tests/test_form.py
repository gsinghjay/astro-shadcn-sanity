import pytest
from fastapi import Request, HTTPException
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from app import app
from dependencies import get_settings, get_sanity, require_authenticated_user
from models.settings import WorkerSettings

class MockKV:
    def __init__(self):
        self.store = {}
    async def get(self, key, **kwargs):
        return self.store.get(key)
    async def put(self, key, value, **kwargs):
        self.store[key] = value

class MockSanityClient:
    async def query(self, groq: str, dataset: str, params: dict | None = None):
        return[{
            "_id": "sub-1", 
            "name": "Jane Doe", 
            "email": "jane@example.com", 
            "organization": "Acme",
            "submittedAt": "2026-01-01T00:00:00Z",
            "status": "submitted",
            "formType": "contact"
        }]
    async def mutate(self, mutations: list[dict], dataset: str, write_token: str):
        return {"results": [{"id": "new-doc"}]}

@pytest.fixture
def client(monkeypatch):
    async def fake_verify_turnstile(token, ip, secret):
        return token == "1x0000000000000000000000000000000AA"
    
    monkeypatch.setattr("routers.forms.verify_turnstile", fake_verify_turnstile)

    mock_kv = MockKV()
    
    def _mock_settings():
        mock = MagicMock(spec=WorkerSettings)
        # Populate all locations to satisfy however your app code reads them
        mock.required_secrets = {"admin_api_key": "test-admin-key", "ADMIN_API_KEY": "test-admin-key"}
        mock.optional_secrets = {
            "sanity_api_write_token": "test-write-token",
            "turnstile_secret_key": "test-turnstile-secret",
            "discord_webhook_url": "http://fake-discord.url"
        }
        mock.env_vars = {"sanity_project_id": "test"}
        
        # Top level attributes to prevent 500 errors
        mock.sanity_project_id = "test"
        mock.turnstile_secret_key = "test-turnstile-secret"
        mock.kv = mock_kv
        return mock

    async def mock_require_auth(request: Request):
        auth = request.headers.get("Authorization")
        if not auth or auth != "Bearer valid-test-token":
            raise HTTPException(status_code=401, detail="Not authenticated")
        return "admin@example.com"

    app.dependency_overrides[get_sanity] = lambda: MockSanityClient()
    app.dependency_overrides[get_settings] = _mock_settings
    app.dependency_overrides[require_authenticated_user] = mock_require_auth

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()

# --- Tests ---

VALID_PAYLOAD = {
    "site": "capstone",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "message": "this is a test message", 
    "organization": "Acme",
    "form_type": "contact",
    "cf-turnstile-response": "1x0000000000000000000000000000000AA"
}

def test_successful_submission(client, monkeypatch):
    notify_calls =[]
    async def mock_notify_discord(*args, **kwargs):
        notify_calls.append(True)

    monkeypatch.setattr("routers.forms.notify_discord", mock_notify_discord)
    
    response = client.post("/api/v1/forms/submit", json=VALID_PAYLOAD, headers={"CF-Connecting-IP": "1.2.3.4"})
    
    assert response.status_code == 200
    assert response.json()["status"] == "submitted"
    assert len(notify_calls) == 1

def test_turnstile_failure(client):
    payload = {**VALID_PAYLOAD, "cf-turnstile-response": "2x0000000000000000000000000000000AA"}
    response = client.post("/api/v1/forms/submit", json=payload, headers={"CF-Connecting-IP": "1.2.3.4"})
    assert response.status_code == 400

def test_rate_limiting(client, monkeypatch):
    # Mock the rate limiter check directly to avoid background-task timing issues in tests
    call_count = [0]
    async def mock_is_rate_limited(*args, **kwargs):
        call_count[0] += 1
        return call_count[0] > 5
        
    monkeypatch.setattr("routers.forms.is_rate_limited", mock_is_rate_limited)

    for _ in range(5):
        response = client.post("/api/v1/forms/submit", json=VALID_PAYLOAD, headers={"CF-Connecting-IP": "1.2.3.4"})
        assert response.status_code == 200

    response = client.post("/api/v1/forms/submit", json=VALID_PAYLOAD, headers={"CF-Connecting-IP": "1.2.3.4"})
    assert response.status_code == 429

def test_validation_errors(client):
    payload = {**VALID_PAYLOAD, "name": ""}
    assert client.post("/api/v1/forms/submit", json=payload).status_code == 422

    payload = {**VALID_PAYLOAD, "email": "not-an-email"}
    assert client.post("/api/v1/forms/submit", json=payload).status_code == 422

def test_list_submissions_requires_auth(client):
    response = client.get("/api/v1/forms/submissions")
    assert response.status_code == 401

def test_list_submissions_with_auth(client):
    response = client.get(
        "/api/v1/forms/submissions",
        headers={"Authorization": "Bearer valid-test-token"}
    )
    assert response.status_code == 200