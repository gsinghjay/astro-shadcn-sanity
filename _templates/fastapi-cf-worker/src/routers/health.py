"""Health check endpoint for Cloudflare Workers.

``GET /health`` probes every configured Cloudflare service binding and
returns a structured report of what's working and what isn't. This is the
first endpoint you should check after deploying — if ``/health`` returns
``200 OK``, your Worker is up.

How it works:
    Each Cloudflare service (KV, D1, AI, env vars, secrets) gets its own
    **probe function**. Probes run independently — a failing KV read
    doesn't prevent the D1 check from running. You get the full picture
    in one request.

    The checks are **driven by WorkerSettings** properties
    (``required_secrets``, ``optional_secrets``, ``env_vars``,
    ``bindings``). When you add a new field to ``WorkerSettings``, the
    health check discovers it automatically — no hardcoded lists to keep
    in sync.

Security:
    The health endpoint is designed to be safe for public access. Probe
    results report **counts and status only** — never secret values,
    secret names, stored data, or environment variable values. This
    prevents information leakage to attackers probing your endpoints.

Overall status logic:
    - ``"ok"`` — every probe returned ``"ok"`` or ``"not_configured"``.
    - ``"degraded"`` — at least one probe returned ``"error"`` or
      ``"degraded"``.

    A ``"not_configured"`` binding does NOT degrade the overall status
    because this is a template — not every fork needs every binding.
"""

import time
from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from dependencies import get_settings
from models.common import HealthResponse, ServiceCheck
from models.settings import WorkerSettings

router = APIRouter(tags=["health"])


# ---------------------------------------------------------------------------
# Individual probes
# ---------------------------------------------------------------------------

async def _check_kv(settings: WorkerSettings) -> ServiceCheck:
    """Probe the Cloudflare KV namespace with a test read.

    **KV** (Key-Value) is Cloudflare's globally distributed key-value
    store. It's optimized for read-heavy workloads with eventual
    consistency (writes propagate globally within ~60 seconds).

    This probe attempts to read a well-known key (``config:version``)
    to verify that the KV binding is functional. The actual value is
    NOT included in the response for security reasons.

    Args:
        settings: The validated Worker configuration.

    Returns:
        A ``ServiceCheck`` with:
        - ``"ok"`` and latency if the read succeeded.
        - ``"not_configured"`` if the KV binding is None.
        - ``"error"`` with latency and error type if the read failed.
    """
    if settings.kv is None:
        return ServiceCheck(status="not_configured", message="KV binding missing")

    start = time.monotonic()
    try:
        val = await settings.kv.get("config:version")
        ms = (time.monotonic() - start) * 1000
        msg = "readable (key found)" if val else "readable (key not found)"
        return ServiceCheck(status="ok", latency_ms=round(ms, 2), message=msg)
    except BaseException as e:
        ms = (time.monotonic() - start) * 1000
        return ServiceCheck(status="error", latency_ms=round(ms, 2), message=f"{type(e).__name__}: {e}")


async def _check_d1(settings: WorkerSettings) -> ServiceCheck:
    """Probe the Cloudflare D1 database with a trivial SQL query.

    **D1** is Cloudflare's serverless SQLite database. It runs on the
    same edge network as your Worker, giving you SQL queries with very
    low latency. D1 uses standard SQLite syntax, supports transactions,
    and replicates reads globally.

    This probe runs ``SELECT 1 AS ok`` — a no-op query that verifies
    the database connection is alive without touching any user data.

    Args:
        settings: The validated Worker configuration.

    Returns:
        A ``ServiceCheck`` with:
        - ``"ok"`` and latency if the query succeeded.
        - ``"not_configured"`` if the D1 binding is None.
        - ``"error"`` with latency and error type if the query failed.
    """
    if settings.db is None:
        return ServiceCheck(status="not_configured", message="D1 binding missing")

    start = time.monotonic()
    try:
        await settings.db.prepare("SELECT 1 AS ok").all()
        ms = (time.monotonic() - start) * 1000
        return ServiceCheck(status="ok", latency_ms=round(ms, 2), message="query executed")
    except BaseException as e:
        ms = (time.monotonic() - start) * 1000
        return ServiceCheck(status="error", latency_ms=round(ms, 2), message=f"{type(e).__name__}: {e}")


def _check_ai(settings: WorkerSettings) -> ServiceCheck:
    """Verify the Workers AI binding is accessible.

    **Workers AI** lets you run machine learning models (LLMs, image
    generation, embeddings, etc.) directly on Cloudflare's GPU network.
    No API keys or external services needed — just call
    ``await settings.ai.run("@cf/meta/llama-3-8b-instruct", {...})``.

    This probe only checks that the binding *exists* — it does NOT run
    a model (which would consume AI credits and add latency).

    Args:
        settings: The validated Worker configuration.

    Returns:
        A ``ServiceCheck`` with ``"ok"`` if the AI binding is set, or
        ``"not_configured"`` if it's None.
    """
    if settings.ai is None:
        return ServiceCheck(status="not_configured", message="AI binding missing")
    return ServiceCheck(status="ok", message="binding available")


def _check_env_vars(settings: WorkerSettings) -> ServiceCheck:
    """Verify that non-sensitive env vars from ``wrangler.jsonc`` are set.

    Env vars are defined in the ``vars`` section of ``wrangler.jsonc``
    and are visible in the Cloudflare dashboard. They're used for
    non-sensitive configuration like ``ENVIRONMENT=development``.

    For security, the response reports only the **count** of configured
    vars, not their names or values.

    Args:
        settings: The validated Worker configuration.

    Returns:
        A ``ServiceCheck`` with ``"ok"`` if all vars are set, or
        ``"error"`` if any are missing.
    """
    env_vars = settings.env_vars
    found = [k for k, v in env_vars.items() if v is not None]
    missing = [k for k, v in env_vars.items() if v is None]

    if missing:
        return ServiceCheck(status="error", message=f"{len(missing)} env var(s) missing")
    return ServiceCheck(status="ok", message=f"{len(found)} env var(s) configured")


def _check_secrets(settings: WorkerSettings) -> ServiceCheck:
    """Verify that required secrets are configured.

    Secrets are sensitive values (API keys, tokens) set via
    ``npx wrangler secret put`` (production) or ``.dev.vars`` (local
    development). They're encrypted at rest and never visible in the
    Cloudflare dashboard.

    This probe checks ``WorkerSettings.required_secrets`` — secrets that
    every route depends on. Missing required secrets trigger a
    ``"degraded"`` status.

    For security, the response reports only **counts** — never secret
    names or values.

    Args:
        settings: The validated Worker configuration.

    Returns:
        A ``ServiceCheck`` with ``"ok"`` if all required secrets are
        configured, or ``"degraded"`` with a count of how many are missing.
    """
    required = settings.required_secrets
    configured_count = sum(1 for v in required.values() if v is not None)
    total = len(required)

    if configured_count < total:
        return ServiceCheck(
            status="degraded",
            message=f"{configured_count} of {total} required secret(s) configured",
        )
    return ServiceCheck(status="ok", message=f"{configured_count} required secret(s) configured")


def _check_optional_secrets(settings: WorkerSettings) -> ServiceCheck:
    """Report how many optional secrets are configured.

    Optional secrets are only needed by specific features (e.g., Discord
    bot token is only needed if you're building a Discord bot). Missing
    optional secrets are always ``"ok"`` — they're informational only.

    For security, the response reports only **counts** — never secret
    names or values.

    Args:
        settings: The validated Worker configuration.

    Returns:
        A ``ServiceCheck`` with ``"ok"`` and a count of configured vs
        total optional secrets.
    """
    optional = settings.optional_secrets
    configured_count = sum(1 for v in optional.values() if v is not None)
    total = len(optional)

    return ServiceCheck(
        status="ok",
        message=f"{configured_count} of {total} optional secret(s) configured",
    )


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.get("/health", response_model=HealthResponse)
async def health(settings: WorkerSettings = Depends(get_settings)):
    """Probe every Cloudflare service binding and return a health report.

    This endpoint is the first thing to check after deploying. It runs
    independent probes against each configured service and returns a
    structured JSON response.

    Probes:
        - **kv**: Reads a test key from the KV namespace.
        - **d1**: Runs ``SELECT 1`` against the D1 database.
        - **ai**: Checks that the Workers AI binding exists.
        - **env_vars**: Confirms ``wrangler.jsonc`` vars are accessible.
        - **secrets**: Confirms required secrets are set (counts only).
        - **optional_secrets**: Reports optional secret counts.

    Returns:
        A ``HealthResponse`` with overall status and per-check details.
    """
    checks: dict[str, ServiceCheck] = {}

    # I/O probes (async — they make actual calls to Cloudflare services)
    checks["kv"] = await _check_kv(settings)
    checks["d1"] = await _check_d1(settings)

    # Binding existence checks (sync — just checks if the proxy is set)
    checks["ai"] = _check_ai(settings)

    # Configuration checks (sync, driven by WorkerSettings properties)
    checks["env_vars"] = _check_env_vars(settings)
    checks["secrets"] = _check_secrets(settings)
    checks["optional_secrets"] = _check_optional_secrets(settings)

    # Determine overall status.
    # "not_configured" is neutral — the template may not use every binding.
    statuses = [c.status for c in checks.values()]
    if any(s == "error" for s in statuses) or any(s == "degraded" for s in statuses):
        status = "degraded"
    else:
        status = "ok"

    return HealthResponse(
        status=status,
        checks=checks,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
