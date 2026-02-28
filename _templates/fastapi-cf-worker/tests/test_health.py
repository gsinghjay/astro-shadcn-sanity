"""Tests for the ``GET /health`` endpoint.

These tests verify that the health check correctly probes each Cloudflare
service binding and reports accurate status without leaking sensitive
information (secret values, KV data, env var values, or secret names).

Run with::

    uv run pytest tests/ -v

Or inside Docker::

    docker compose run --rm worker uv run pytest tests/ -v

Test categories:
    - **Happy path** — each probe returns ``"ok"`` with correct metadata.
    - **Degraded state** — failing probes cause overall ``"degraded"`` status.
    - **Not configured** — missing bindings report ``"not_configured"``.
    - **Information leakage** — verify that no sensitive data appears in
      health check messages.
    - **General** — Swagger UI accessibility, 404 for undefined routes.
"""

from models.settings import WorkerSettings


def test_health_returns_ok(client):
    """Health check returns ``"ok"`` when all bindings are working."""
    response = client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert "timestamp" in data

    # Every check should have a status field
    for name, check in data["checks"].items():
        assert "status" in check, f"check '{name}' missing status field"


def test_health_checks_kv(client, mock_settings):
    """KV probe reports ``"ok"`` with latency and no value leakage."""
    mock_settings.kv._store["config:version"] = "1.0.0"

    response = client.get("/health")
    assert response.status_code == 200

    kv = response.json()["checks"]["kv"]
    assert kv["status"] == "ok"
    assert kv["latency_ms"] is not None
    assert "readable (key found)" in kv["message"]
    # Must never contain actual KV values
    assert "1.0.0" not in kv["message"]


def test_health_checks_d1(client):
    """D1 probe reports ``"ok"`` with latency after executing ``SELECT 1``."""
    response = client.get("/health")
    d1 = response.json()["checks"]["d1"]
    assert d1["status"] == "ok"
    assert d1["latency_ms"] is not None


def test_health_checks_ai(client):
    """AI probe confirms the Workers AI binding exists."""
    response = client.get("/health")
    ai = response.json()["checks"]["ai"]
    assert ai["status"] == "ok"
    assert ai["message"] == "binding available"


def test_health_checks_env_vars(client):
    """Env vars probe reports count only, not names or values."""
    response = client.get("/health")
    env_vars = response.json()["checks"]["env_vars"]
    assert env_vars["status"] == "ok"
    assert "configured" in env_vars["message"]
    # Must never leak env var values
    assert "test" not in env_vars["message"]


def test_health_checks_required_secrets(client):
    """Secrets probe confirms required secrets are set without leaking values."""
    response = client.get("/health")
    secrets = response.json()["checks"]["secrets"]
    assert secrets["status"] == "ok"
    assert "configured" in secrets["message"]
    # Must never contain actual secret values
    assert "test-api-key" not in secrets["message"]
    assert "test-admin-key" not in secrets["message"]


def test_health_checks_optional_secrets(client):
    """Optional secrets probe reports count only, not secret names."""
    response = client.get("/health")
    optional = response.json()["checks"]["optional_secrets"]
    assert optional["status"] == "ok"
    # Should show count only, no secret names
    assert "0 of 7" in optional["message"]
    # Must never leak secret names
    assert "discord_bot_token" not in optional["message"]


def test_health_degraded_when_kv_fails(client, mock_settings):
    """Overall status becomes ``"degraded"`` when a binding probe errors."""
    async def failing_get(key, **kwargs):
        raise RuntimeError("connection refused")

    mock_settings.kv.get = failing_get

    response = client.get("/health")
    data = response.json()
    assert data["status"] == "degraded"
    assert data["checks"]["kv"]["status"] == "error"
    assert "RuntimeError" in data["checks"]["kv"]["message"]


def test_health_degraded_when_secret_missing(client, mock_settings):
    """Overall status becomes ``"degraded"`` when a required secret is missing."""
    mock_settings.api_key = None

    response = client.get("/health")
    data = response.json()
    assert data["status"] == "degraded"
    assert data["checks"]["secrets"]["status"] == "degraded"
    assert "1 of 2" in data["checks"]["secrets"]["message"]
    # Must never leak secret names
    assert "api_key" not in data["checks"]["secrets"]["message"]


def test_health_kv_not_configured(client, mock_settings):
    """KV probe reports ``"not_configured"`` when binding is None."""
    mock_settings.kv = None

    response = client.get("/health")
    kv = response.json()["checks"]["kv"]
    assert kv["status"] == "not_configured"


def test_root_returns_404(client):
    """Root path returns 404 — no accidental catch-all route."""
    response = client.get("/")
    assert response.status_code == 404


def test_docs_available(client):
    """Swagger UI is accessible at ``/docs`` for interactive API exploration."""
    response = client.get("/docs")
    assert response.status_code == 200
    assert "swagger" in response.text.lower()
