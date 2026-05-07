# tests/test_discord.py
import pytest, time
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from app import app
from dependencies import get_settings
from models.settings import WorkerSettings

import pytest, time

class MockKV:
    def __init__(self):
        self.store = {"discord-webhook:announcements": ("http://fake-discord.url?wait=true", None)}
        self.custom_time = None 
        
    def now(self):
        return self.custom_time if self.custom_time is not None else time.time()
        
    async def get(self, key):
        entry = self.store.get(key)
        if not entry:
            return None
        
        if entry[1] is not None and entry[1] <= self.now():
            del self.store[key]
            return None
        
        return entry[0]
        
    async def put(self, key, value, expirationTtl=None):
        expires = self.now() + expirationTtl if expirationTtl else None
        self.store[key] = (value, expires)

@pytest.fixture
def client(monkeypatch):
    # Mock the discord client so it never makes real HTTP requests
    async def fake_post_webhook(url, embed):
        if url != "http://fake-discord.url?wait=true":
            raise AssertionError("Invalid Webhook URL hit")
        return True

    monkeypatch.setattr("routers.discord.post_webhook", fake_post_webhook)

    mock_kv = MockKV()
    
    def _mock_settings():
        mock = MagicMock(spec=WorkerSettings)
        mock.kv = mock_kv
        return mock

    app.dependency_overrides[get_settings] = _mock_settings

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


# --- Tests ---

def test_successful_notification(client):
    payload = {
        "channel": "announcements",
        "title": "Test Alert",
        "message": "This is a test",
        "color": "green"
    }
    response = client.post("/api/v1/discord/notify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["sent"] is True
    assert data["channel"] == "announcements"

def test_unknown_channel(client):
    payload = {
        "channel": "unknown-channel",
        "title": "Test Alert",
        "message": "This is a test"
    }
    response = client.post("/api/v1/discord/notify", json=payload)
    assert response.status_code == 400
    assert "Unknown channel" in response.json()["detail"]

def test_rate_limiting(client):
    payload = {
        "channel": "announcements",
        "title": "Spam Alert",
        "message": "Spamming the channel"
    }
    # Send 30 requests to max out the limit
    for _ in range(30):
        response = client.post("/api/v1/discord/notify", json=payload)
        assert response.status_code == 200
        
    # The 31st request should be rate limited
    response = client.post("/api/v1/discord/notify", json=payload)
    assert response.status_code == 429
    assert "Rate limit" in response.json()["detail"]

def test_time_to_live(client):
    """Verify that the rate-limit window resets after the 60-second TTL expires."""
    import time
    
    # Grab the KV store instance from our mocked settings
    settings = app.dependency_overrides[get_settings]()
    mock_kv = settings.kv
    
    # Lock the KV's clock to a specific time
    base_time = time.time()
    mock_kv.custom_time = base_time

    payload = {
        "channel": "announcements",
        "title": "TTL Test",
        "message": "Testing window expiry",
    }

    # Fill up the rate limit: 30 requests should all succeed
    for _ in range(30):
        response = client.post("/api/v1/discord/notify", json=payload)
        assert response.status_code == 200

    # 31st request must be rejected
    response = client.post("/api/v1/discord/notify", json=payload)
    assert response.status_code == 429
    assert "Rate limit" in response.json()["detail"]

    # Fast-forward the KV clock by 61 seconds
    mock_kv.custom_time = base_time + 61

    # After expiry, MockKV will delete the key → request succeeds!
    response = client.post("/api/v1/discord/notify", json=payload)
    assert response.status_code == 200, "Request should succeed after TTL window resets"
    assert response.json()["sent"] is True

def test_async_mode(client, monkeypatch):
    # Track invocations of the webhook dispatcher
    webhook_calls = []

    async def tracking_post_webhook(url, embed):
        webhook_calls.append({"url": url, "embed": embed})
        if url != "http://fake-discord.url?wait=true":
            raise AssertionError("Invalid Webhook URL hit")
        return True

    monkeypatch.setattr("routers.discord.post_webhook", tracking_post_webhook)

    # We use the python variable name 'async_mode' or the alias 'async'
    payload = {
        "channel": "announcements",
        "title": "Async Alert",
        "message": "This is a test",
        "async": True
    }
    response = client.post("/api/v1/discord/notify", json=payload)
    assert response.status_code == 202
    data = response.json()
    assert data["message"] == "Queued"

    # The TestClient (anyio-backed) drains background tasks before returning the response,
    # so webhook_calls should already be populated.
    assert len(webhook_calls) == 1
    assert webhook_calls[0]["url"] == "http://fake-discord.url?wait=true"
    assert webhook_calls[0]["embed"]["title"] == "Async Alert"

def test_with_fields(client, monkeypatch):
    # Track invocations of the webhook dispatcher
    webhook_calls = []

    async def tracking_post_webhook(url, embed):
        webhook_calls.append({"url": url, "embed": embed})
        if url != "http://fake-discord.url?wait=true":
            raise AssertionError("Invalid Webhook URL hit")
        return True

    monkeypatch.setattr("routers.discord.post_webhook", tracking_post_webhook)

    payload = {
        "channel": "announcements",
        "title": "Test with Fields",
        "message": "Testing",
        "fields": [
            {"name": "Status", "value": "Online", "inline": True},
            {"name": "Errors", "value": "0", "inline": True}
        ]
    }
    response = client.post("/api/v1/discord/notify", json=payload)
    assert response.status_code == 200

    # Verify that the embed was sent with the fields
    assert len(webhook_calls) == 1
    embed = webhook_calls[0]["embed"]
    assert "fields" in embed
    assert len(embed["fields"]) == 2
    assert embed["fields"][0]["name"] == "Status"
    assert embed["fields"][0]["value"] == "Online"