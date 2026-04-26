# src/routers/platform.py
import asyncio
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
    # Lookup hook securely from secrets (e.g., CF_DEPLOY_HOOK_CAPSTONE)
    hook_key = f"cf_deploy_hook_{site}"
    hook_url = settings.optional_secrets.get(hook_key)

    if not hook_url:
        raise HTTPException(400, f"Deploy hook not configured for site: {site}")

    # Validate that the hook URL doesn't contain placeholder tokens
    if "{hook_id}" in hook_url or not hook_url.startswith("https://"):
        raise HTTPException(400, f"Invalid deploy hook URL for site: {site}")

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
            checks[name] = f"error: {str(e)}"

    async def check_sanity():
        pid = settings.env_vars.get("sanity_project_id")
        dataset = (settings.env_vars.get("sanity_dataset_capstone") or settings.env_vars.get("sanity_dataset_rwc"))
        if not pid or not dataset:
            raise ValueError("No Sanity Project ID or Dataset")
        async with get_client(timeout=4.0) as client:
            resp = await client.get(f"https://{pid}.api.sanity.io/v2024-01-01/data/query/{dataset}?query=*[_type=='page'][0]")
            resp.raise_for_status()

    async def check_discord():
        webhook = settings.optional_secrets.get("discord_webhook_url")
        if not webhook:
            raise ValueError("No Discord Webhook")
        async with get_client(timeout=4.0) as client:
            resp = await client.get(webhook)
            resp.raise_for_status()

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
    metric: str = Query("requests", description="Metric to fetch"),
    period: str = Query("24h", description="Time period"),
    settings: WorkerSettings = Depends(get_settings),
    _ = Depends(verify_admin_api_key)
):
    data = await get_cf_analytics(metric, period, settings)
    return AnalyticsResponse(metric=metric, period=period, data=data)