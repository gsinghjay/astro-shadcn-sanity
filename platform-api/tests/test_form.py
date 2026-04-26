import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from app import app
from dependencies import get_settings, get_sanity
from models.settings import WorkerSettings

# --- Mocks ---

class MockKV:
    def __init__(self):
        self.store = {}
    async def get(self, key):
        return self.store.get(key)
    async def put(self, key, value, expirationTtl=None):
        self.store[key] = value

class MockSanityClient:
    async def query(self, groq: str, dataset: str, params: dict | None = None):
        return [{
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
    # Mock verify_turnstile so it doesn't make real HTTP requests during tests
    async def fake_verify_turnstile(token, ip, secret):
        return token == "1x0000000000000000000000000000000AA"
    
    monkeypatch.setattr("routers.forms.verify_turnstile", fake_verify_turnstile)

    mock_kv = MockKV()
    
    def _mock_settings():
        mock = MagicMock(spec=WorkerSettings)
        mock.required_secrets = {
            "admin_api_key": "test-admin-key",
        }
        mock.optional_secrets = {
            "sanity_api_write_token": "test-write-token",
            "turnstile_secret_key": "test-turnstile-secret",
            "discord_webhook_url": "http://fake-discord.url"
        }
        mock.env_vars = {
            "sanity_project_id": "test",
        }
        mock.kv = mock_kv
        return mock

    app.dependency_overrides[get_sanity] = lambda: MockSanityClient()
    app.dependency_overrides[get_settings] = _mock_settings

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()

# --- Tests ---

# Use the exact Pydantic alias for the Turnstile token
VALID_PAYLOAD = {
    "site": "capstone",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "message": "This is a test message that is long enough.",
    "cf-turnstile-response": "1x0000000000000000000000000000000AA"
}

def test_successful_submission(client, monkeypatch):
    # Track notify_discord invocations to ensure it receives WorkerSettings
    notify_calls = []

    async def mock_notify_discord(body, settings):
        from models.settings import WorkerSettings
        assert isinstance(settings, WorkerSettings), "notify_discord should receive WorkerSettings instance"
        notify_calls.append({"body": body, "settings": settings})

    monkeypatch.setattr("routers.forms.notify_discord", mock_notify_discord)

    response = client.post("/api/v1/forms/submit", json=VALID_PAYLOAD, headers={"CF-Connecting-IP": "1.2.3.4"})
    assert response.status_code == 200
    assert response.json()["status"] == "submitted"
    # Verify Discord notification was attempted
    assert len(notify_calls) == 1

def test_turnstile_failure(client):
    payload = {**VALID_PAYLOAD, "cf-turnstile-response": "2x0000000000000000000000000000000AA"}
    response = client.post("/api/v1/forms/submit", json=payload, headers={"CF-Connecting-IP": "1.2.3.4"})
    assert response.status_code == 400
    assert "Turnstile verification failed" in response.json()["detail"]

def test_rate_limiting(client):
    for _ in range(5):
        response = client.post("/api/v1/forms/submit", json=VALID_PAYLOAD, headers={"CF-Connecting-IP": "1.2.3.4"})
        assert response.status_code == 200

    response = client.post("/api/v1/forms/submit", json=VALID_PAYLOAD, headers={"CF-Connecting-IP": "1.2.3.4"})
    assert response.status_code == 429
    assert "Rate limit exceeded" in response.json()["detail"]

def test_validation_errors(client):
    payload = {**VALID_PAYLOAD, "name": ""}
    response = client.post("/api/v1/forms/submit", json=payload, headers={"CF-Connecting-IP": "1.2.3.4"})
    assert response.status_code == 422

    payload = {**VALID_PAYLOAD, "email": "not-an-email"}
    response = client.post("/api/v1/forms/submit", json=payload, headers={"CF-Connecting-IP": "1.2.3.4"})
    assert response.status_code == 422

def test_list_submissions_requires_auth(client):
    response = client.get("/api/v1/forms/submissions")
    assert response.status_code == 403

def test_list_submissions_with_auth(client):
    response = client.get(
        "/api/v1/forms/submissions",
        headers={"X-Admin-API-Key": "test-admin-key"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["email"] == "jane@example.com"