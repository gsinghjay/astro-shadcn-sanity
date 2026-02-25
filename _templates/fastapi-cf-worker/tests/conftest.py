"""
Shared test fixtures for FastAPI + Cloudflare Workers.

These fixtures mock the Cloudflare env object so you can test your
FastAPI routes locally without deploying to Cloudflare.

How it works:
  - mock_settings creates a WorkerSettings with stubbed bindings
  - client creates a FastAPI TestClient with mock_settings injected
  - Tests use `client.get("/health")` just like a real HTTP request

IMPORTANT: Tests import from `app` (app.py), NOT from `main` (main.py).
main.py imports `workers` and `asgi` which only exist inside the CF
Workers Pyodide runtime and cannot be loaded by a regular Python interpreter.
"""

import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

# Add src/ to the path so imports work the same as in Workers
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))


class MockKV:
    """Stub for Cloudflare KV namespace."""

    def __init__(self):
        self._store = {}

    async def get(self, key, **kwargs):
        return self._store.get(key)

    async def put(self, key, value, **kwargs):
        self._store[key] = value

    async def delete(self, key):
        self._store.pop(key, None)

    async def list(self, **kwargs):
        return MagicMock(keys=[MagicMock(name=k) for k in self._store])


class MockD1:
    """Stub for Cloudflare D1 database."""

    def prepare(self, query):
        return self

    async def all(self):
        return MagicMock(results=[])

    async def first(self):
        return None

    async def run(self):
        return MagicMock(success=True)


@pytest.fixture
def mock_settings():
    """
    Create a WorkerSettings with all bindings and secrets stubbed.

    Customize in individual tests:
        def test_something(mock_settings):
            mock_settings.api_key = "custom-key"
    """
    from models.settings import WorkerSettings

    return WorkerSettings(
        # Env vars
        environment="test",
        # Secrets
        api_key="test-api-key",
        admin_api_key="test-admin-key",
        sanity_api_read_token=None,
        sanity_api_write_token=None,
        discord_bot_token=None,
        discord_app_id=None,
        discord_public_key=None,
        cf_api_token=None,
        turnstile_secret_key=None,
        # Bindings
        kv=MockKV(),
        db=MockD1(),
        ai=AsyncMock(run=AsyncMock(return_value={"response": "mocked AI response"})),
    )


@pytest.fixture
def client(mock_settings):
    """
    FastAPI TestClient with mocked WorkerSettings.

    Uses dependency_overrides to inject mock_settings into every route
    that depends on get_settings.
    """
    from app import app
    from dependencies import get_settings

    app.dependency_overrides[get_settings] = lambda: mock_settings

    with TestClient(app) as test_client:
        yield test_client

    # Clean up overrides after each test
    app.dependency_overrides.clear()
