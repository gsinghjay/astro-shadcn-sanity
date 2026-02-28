"""Shared test fixtures for FastAPI + Cloudflare Workers.

Testing a Cloudflare Worker locally requires mocking the Cloudflare-specific
parts that only exist inside the Workers Pyodide runtime. This module provides:

1. **Mock bindings** (``MockKV``, ``MockD1``) — Python classes that mimic
   the Cloudflare KV and D1 APIs so your tests can read/write test data
   without a real Cloudflare account.

2. **``mock_settings`` fixture** — A pre-configured ``WorkerSettings``
   instance with all bindings stubbed and test secrets filled in.

3. **``client`` fixture** — A FastAPI ``TestClient`` that injects the mock
   settings via ``dependency_overrides``, so every route handler gets the
   mocked bindings instead of trying to access the real Workers env proxy.

How the mock injection works:
    In production, route handlers call ``Depends(get_settings)`` which reads
    ``request.scope["env"]`` to build ``WorkerSettings``. In tests, we
    replace ``get_settings`` entirely using FastAPI's ``dependency_overrides``
    mechanism::

        app.dependency_overrides[get_settings] = lambda: mock_settings

    This means the real ``get_settings`` never runs — FastAPI calls our
    lambda instead, which returns the pre-built mock.

Important:
    Tests import from ``app`` (``app.py``), NOT from ``main`` (``main.py``).
    ``main.py`` imports ``workers`` and ``asgi`` which only exist inside
    the Cloudflare Workers Pyodide runtime. Importing ``main.py`` from
    standard Python raises ``ModuleNotFoundError``.
"""

import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

# Add src/ to the path so imports work the same as in Workers.
# The Workers runtime uses src/ as its module root (configured in
# wrangler.jsonc via the "main" field pointing to "src/main.py").
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))


class MockKV:
    """In-memory mock of a Cloudflare KV namespace.

    Cloudflare KV is a global key-value store with an async API:
    ``await kv.get(key)``, ``await kv.put(key, value)``, etc.
    This mock stores data in a plain Python dict so tests can seed
    values and verify reads/writes without a real KV namespace.

    The real KV API methods this mock implements:
        - ``get(key)`` — Returns the value for a key, or None.
        - ``put(key, value)`` — Stores a value at a key.
        - ``delete(key)`` — Removes a key.
        - ``list()`` — Returns an object with a ``keys`` attribute.

    Example in tests::

        def test_kv_read(client, mock_settings):
            mock_settings.kv._store["my-key"] = "my-value"
            response = client.get("/my-route-that-reads-kv")
            assert response.status_code == 200
    """

    def __init__(self):
        self._store = {}

    async def get(self, key, **kwargs):
        """Read a value by key. Returns None if the key doesn't exist."""
        return self._store.get(key)

    async def put(self, key, value, **kwargs):
        """Write a value at a key. Accepts optional kwargs like ``expirationTtl``."""
        self._store[key] = value

    async def delete(self, key):
        """Remove a key from the store."""
        self._store.pop(key, None)

    async def list(self, **kwargs):
        """List all keys in the namespace."""
        return MagicMock(keys=[MagicMock(name=k) for k in self._store])


class MockD1:
    """In-memory mock of a Cloudflare D1 database.

    Cloudflare D1 is a serverless SQLite database with a chainable
    async API: ``await db.prepare(sql).bind(params).all()``.

    This mock returns empty/success results for any query. For tests
    that need specific query results, replace individual methods::

        mock_settings.db.prepare = lambda q: MockD1WithData(q)

    The real D1 API pattern this mock implements:
        - ``prepare(sql)`` — Returns a statement object (here, ``self``).
        - ``.bind(*params)`` — Binds parameters (not implemented in mock).
        - ``.all()`` — Executes and returns all rows.
        - ``.first()`` — Executes and returns the first row.
        - ``.run()`` — Executes a write query (INSERT, UPDATE, DELETE).
    """

    def prepare(self, query):
        """Prepare a SQL statement. Returns self for method chaining."""
        return self

    async def all(self):
        """Execute the query and return all results."""
        return MagicMock(results=[])

    async def first(self):
        """Execute the query and return the first result row."""
        return None

    async def run(self):
        """Execute a write query (INSERT, UPDATE, DELETE)."""
        return MagicMock(success=True)


@pytest.fixture
def mock_settings():
    """Create a ``WorkerSettings`` with all bindings and secrets stubbed.

    This fixture provides a fully populated settings object that mirrors
    what a real Worker would have at runtime, but with test values instead
    of real secrets and mock objects instead of real Cloudflare bindings.

    Customize in individual tests by mutating the returned object::

        def test_missing_secret(mock_settings):
            mock_settings.api_key = None  # Simulate missing secret
            # ... test behavior when API key is not configured

        def test_kv_with_data(mock_settings):
            mock_settings.kv._store["key"] = "value"  # Seed test data
    """
    from models.settings import WorkerSettings

    return WorkerSettings(
        # Env vars
        environment="test",
        # Secrets (test values — never use real secrets in tests!)
        api_key="test-api-key",
        admin_api_key="test-admin-key",
        sanity_api_read_token=None,
        sanity_api_write_token=None,
        discord_bot_token=None,
        discord_app_id=None,
        discord_public_key=None,
        cf_api_token=None,
        turnstile_secret_key=None,
        # Bindings (mocked Cloudflare services)
        kv=MockKV(),
        db=MockD1(),
        ai=AsyncMock(run=AsyncMock(return_value={"response": "mocked AI response"})),
    )


@pytest.fixture
def client(mock_settings):
    """Create a FastAPI ``TestClient`` with mocked Cloudflare bindings.

    This fixture uses FastAPI's ``dependency_overrides`` to replace the
    real ``get_settings`` dependency with a lambda that returns the
    ``mock_settings`` fixture. This means every route handler that uses
    ``Depends(get_settings)`` will receive the mock instead of trying
    to read from the real Workers env proxy.

    Usage in tests::

        def test_my_endpoint(client):
            response = client.get("/my-endpoint")
            assert response.status_code == 200

    The ``TestClient`` behaves like a real HTTP client — you call
    ``client.get()``, ``client.post()``, etc. and get back response
    objects with ``.status_code``, ``.json()``, ``.text``, etc.
    """
    from app import app
    from dependencies import get_settings

    app.dependency_overrides[get_settings] = lambda: mock_settings

    with TestClient(app) as test_client:
        yield test_client

    # Clean up overrides after each test to prevent cross-test pollution.
    app.dependency_overrides.clear()
