# tests/test_discord.py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from app import app
from dependencies import get_settings
from models.settings import WorkerSettings

class MockKV:
    def __init__(self):
        # Pre-seed our mock KV with one known channel
        self.store = {"discord-webhook:announcements": "http://fake-discord.url"}
        
    async def get(self, key):
        return self.store.get(key)
        
    async def put(self, key, value, expirationTtl=None):
        self.store[key] = value

@pytest.fixture
def client(monkeypatch):
    # Mock the discord client so it never makes real HTTP requests
    async def fake_post_webhook(url, embed):
        if url != "http://fake-discord.url":
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

def test_time_to_live(client, monkeypatch):
    """Verify that the rate-limit window resets after the 60-second TTL expires."""
    import time as _time
    import types
    import routers.discord as rd

    base_time = int(_time.time())
    current_time = [base_time]  # Mutable container so the closure can update it

    def fake_time():
        return current_time[0]

    # Patch the time module reference inside the discord router
    fake_time_module = types.SimpleNamespace(time=fake_time)
    monkeypatch.setattr(rd, "time", fake_time_module)

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

    # Advance the clock past the 60-second window
    current_time[0] = base_time + 61

    # After expiry, a fresh window should open → request succeeds
    response = client.post("/api/v1/discord/notify", json=payload)
    assert response.status_code == 200, "Request should succeed after TTL window resets"
    assert response.json()["sent"] is True

def test_async_mode(client, monkeypatch):
    # Track invocations of the webhook dispatcher
    webhook_calls = []

    async def tracking_post_webhook(url, embed):
        webhook_calls.append({"url": url, "embed": embed})
        if url != "http://fake-discord.url":
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
    assert webhook_calls[0]["url"] == "http://fake-discord.url"
    assert webhook_calls[0]["embed"]["title"] == "Async Alert"

def test_with_fields(client, monkeypatch):
    # Track invocations of the webhook dispatcher
    webhook_calls = []

    async def tracking_post_webhook(url, embed):
        webhook_calls.append({"url": url, "embed": embed})
        if url != "http://fake-discord.url":
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