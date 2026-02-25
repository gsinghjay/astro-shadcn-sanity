"""
Health check endpoint.

GET /health → returns overall service status with per-binding probes.

Each Cloudflare service (KV, D1, AI, env vars, secrets) is probed
independently with latency tracking. A single failing probe doesn't
block the others — you get a full picture of what's up and what's down.

Checks are driven by WorkerSettings — add a field there and the health
endpoint auto-discovers it. No hardcoded lists to keep in sync.
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
    """Probe KV namespace with a read."""
    if settings.kv is None:
        return ServiceCheck(status="not_configured", message="KV binding missing")

    start = time.monotonic()
    try:
        val = await settings.kv.get("config:version")
        ms = (time.monotonic() - start) * 1000
        msg = f"config:version={val}" if val else "readable (key not found)"
        return ServiceCheck(status="ok", latency_ms=round(ms, 2), message=msg)
    except BaseException as e:
        ms = (time.monotonic() - start) * 1000
        return ServiceCheck(status="error", latency_ms=round(ms, 2), message=f"{type(e).__name__}: {e}")


async def _check_d1(settings: WorkerSettings) -> ServiceCheck:
    """Probe D1 database with a trivial query."""
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
    """Verify Workers AI binding is accessible (does NOT run a model)."""
    if settings.ai is None:
        return ServiceCheck(status="not_configured", message="AI binding missing")
    return ServiceCheck(status="ok", message="binding available")


def _check_env_vars(settings: WorkerSettings) -> ServiceCheck:
    """Verify env vars from wrangler.jsonc vars — reads from settings.env_vars."""
    env_vars = settings.env_vars
    found = [f"{k}={v}" for k, v in env_vars.items() if v is not None]
    missing = [k for k, v in env_vars.items() if v is None]

    if missing:
        return ServiceCheck(status="error", message=f"missing: {', '.join(missing)}")
    return ServiceCheck(status="ok", message="; ".join(found))


def _check_secrets(settings: WorkerSettings) -> ServiceCheck:
    """Verify required secrets are set (never logs values)."""
    required = settings.required_secrets
    configured = [k for k, v in required.items() if v is not None]
    missing = [k for k, v in required.items() if v is None]

    if missing:
        return ServiceCheck(
            status="degraded",
            message=f"missing: {', '.join(missing)}; configured: {', '.join(configured) or 'none'}",
        )
    return ServiceCheck(status="ok", message=f"{len(configured)} required secret(s) configured")


def _check_optional_secrets(settings: WorkerSettings) -> ServiceCheck:
    """Report which optional secrets are configured (informational)."""
    optional = settings.optional_secrets
    configured = [k for k, v in optional.items() if v is not None]
    not_set = [k for k, v in optional.items() if v is None]

    msg_parts = []
    if configured:
        msg_parts.append(f"configured: {', '.join(configured)}")
    if not_set:
        msg_parts.append(f"not set: {', '.join(not_set)}")
    return ServiceCheck(status="ok", message="; ".join(msg_parts))


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.get("/health", response_model=HealthResponse)
async def health(settings: WorkerSettings = Depends(get_settings)):
    """
    Probe every Cloudflare service binding and return per-check status.

    - **kv**: reads a key from KV namespace
    - **d1**: runs `SELECT 1` against D1 database
    - **ai**: verifies Workers AI binding exists
    - **env_vars**: confirms wrangler.jsonc `vars` are accessible
    - **secrets**: confirms required secrets are set (never logs values)
    - **optional_secrets**: reports which optional secrets are configured
    """
    checks: dict[str, ServiceCheck] = {}

    # I/O probes (async)
    checks["kv"] = await _check_kv(settings)
    checks["d1"] = await _check_d1(settings)

    # Binding existence checks (sync)
    checks["ai"] = _check_ai(settings)

    # Configuration checks (sync, driven by WorkerSettings properties)
    checks["env_vars"] = _check_env_vars(settings)
    checks["secrets"] = _check_secrets(settings)
    checks["optional_secrets"] = _check_optional_secrets(settings)

    # Determine overall status
    statuses = [c.status for c in checks.values()]
    if all(s == "ok" for s in statuses):
        status = "ok"
    elif any(s == "error" for s in statuses):
        status = "degraded"
    elif any(s == "degraded" for s in statuses):
        status = "degraded"
    else:
        status = "ok"

    return HealthResponse(
        status=status,
        checks=checks,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
