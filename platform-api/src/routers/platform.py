# src/routers/platform.py
import asyncio
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException, Query
from models.platform import DeployStatus, RebuildResponse, AnalyticsResponse
from models.settings import WorkerSettings
from dependencies import get_settings, verify_admin_api_key
from services.cf_client import get_deploy_status, get_cf_analytics
from services.http_client import get_client

router = APIRouter(prefix="/platform", tags=["Platform"])

@router.get("/deploy-status", response_model=DeployStatus)
async def deploy_status(
    site: str = Query(..., description="Target site (e.g., capstone)"),
    settings: WorkerSettings = Depends(get_settings)
):
    data = await get_deploy_status(site, settings)
    if not data:
        return DeployStatus(site=site, status="unknown")
    # Explicitly map "no_deployments" sentinel to "unknown" status before the cf_status mapping below
    if data.get("status") == "no_deployments":
        return DeployStatus(site = site, status = "unknown")

    # Map Cloudflare Pages status to our model
    cf_status = data.get("latest_stage", {}).get("status", "unknown")
    status_map = {
        "success": "active",
        "active": "active",
        "building": "building",
        "failure": "failed",
        "failed": "failed",
        "canceled": "failed",
    }
    normalized_status = status_map.get(cf_status, "unknown")

    return DeployStatus(
        site=site,
        status=normalized_status,
        url=data.get("url"),
        created_on=data.get("created_on"),
        environment=data.get("environment", "production")
    )

@router.post("/rebuild", response_model=RebuildResponse)
async def rebuild(
    site: str = Query(..., description="Target site to rebuild"),
    settings: WorkerSettings = Depends(get_settings),
    _ = Depends(verify_admin_api_key)
):
    # Import SITE_TO_CF_PROJECT for validation
    from services.cf_client import SITE_TO_CF_PROJECT

    # Validate the incoming site against known sites
    if site not in SITE_TO_CF_PROJECT:
        raise HTTPException(400, f"Unknown site: {site}")

    # Normalize site name (replace hyphens with underscores for secret lookup)
    normalized_site = site.replace("-", "_")
    hook_key = f"cf_deploy_hook_{normalized_site}"
    hook_url = settings.optional_secrets.get(hook_key)

    if not hook_url:
        raise HTTPException(500, f"Deploy hook not configured for site: {site}")

    # Validate that the hook URL doesn't contain placeholder tokens
    if "{hook_id}" in hook_url or not hook_url.startswith("https://"):
        raise HTTPException(500, f"Invalid deploy hook URL for site: {site}")

    async with get_client() as client:
        resp = await client.post(hook_url)
        success = 200 <= resp.status_code < 300
        return RebuildResponse(
            site=site,
            triggered=success,
            message="Rebuild triggered" if success else f"Rebuild failed: {resp.status_code}"
        )

@router.get("/health")
async def aggregated_health(settings: WorkerSettings = Depends(get_settings)):
    """Unauthenticated aggregated health check across all external services."""
    checks = {}
    
    async def probe(name: str, coroutine):
        try:
            # Enforce 5-second timeout for external probes (AC3)
            await asyncio.wait_for(coroutine, timeout=5.0)
            checks[name] = "ok"
        except Exception as e:
            # Map exceptions to fixed labels; log detailed error server-side
            import logging
            logger = logging.getLogger(__name__)
            logger.error("Health probe failed for %s: %s", name, str(e), exc_info=True)
            checks[name] = "error"

    async def check_sanity():
        pid = settings.env_vars.get("sanity_project_id")
        dataset = (settings.env_vars.get("sanity_dataset_capstone") or settings.env_vars.get("sanity_dataset_rwc"))
        if not pid or not dataset:
            raise ValueError("No Sanity Project ID or Dataset")
        async with get_client(timeout=4.0) as client:
            resp = await client.get(f"https://{pid}.api.sanity.io/v2024-01-01/data/query/{dataset}?query=*[_type=='page'][0]")
            resp.raise_for_status()

    async def check_discord():
        from urllib.parse import urlparse
        from services.discord_client import ALLOWED_WEBHOOK_HOSTS

        webhook = settings.optional_secrets.get("discord_webhook_url")
        if not webhook:
            raise ValueError("not_configured")

        # Validate webhook URL locally without making a network request
        parsed = urlparse(webhook)
        if not parsed.hostname or parsed.hostname not in ALLOWED_WEBHOOK_HOSTS:
            raise ValueError("invalid_webhook")
        if parsed.scheme != "https":
            raise ValueError("invalid_webhook")
        if not parsed.path.startswith("/api/webhooks/"):
            raise ValueError("invalid_webhook")

    # Run network probes concurrently
    await asyncio.gather(
        probe("sanity", check_sanity()),
        probe("discord", check_discord()),
    )
    
    # Fast local checks
    checks["kv"] = "ok" if settings.kv else "not_configured"
    checks["d1"] = "ok" if settings.db else "not_configured"

    status = "degraded" if any("error" in v or "not_configured" in v for v in checks.values()) else "ok"
    return {"status": status, "checks": checks}

@router.get("/analytics", response_model=AnalyticsResponse)
async def analytics(
    metric: Literal["chatbot_queries", "form_submissions", "webhook_events"] = Query("chatbot_queries", description="Metric to fetch"),
    period: str = Query("24h", description="Time period"),
    settings: WorkerSettings = Depends(get_settings),
    _ = Depends(verify_admin_api_key)
):
    data = await get_cf_analytics(metric, period, settings)
    return AnalyticsResponse(metric=metric, period=period, data=data)