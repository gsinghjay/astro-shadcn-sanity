import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from models.settings import WorkerSettings
from models.discord import DiscordNotification, NotificationResult, COLOR_PRESETS
from dependencies import get_settings
from services.discord_client import post_webhook

router = APIRouter(prefix="/discord", tags=["Discord"])

# --- Helpers ---

async def check_and_increment_channel_rate(channel: str, kv, limit: int = 30) -> bool:
    """Atomically check and increment rate limit counter.

    Returns True if rate limit is exceeded (deny request), False otherwise.
    """
    if not kv:
        return False
    key = f"rate:discord:{channel}"
    raw = await kv.get(key)
    count = int(raw or "0") + 1
    # Only set TTL on first write so the window doesn't slide on every hit.
    if raw is None:
        await kv.put(key, str(count), expirationTtl=60)
    else:
        await kv.put(key, str(count))
    return count > limit


# --- Endpoints ---

@router.post("/notify", response_model=NotificationResult)
async def send_notification(
    body: DiscordNotification, 
    settings: WorkerSettings = Depends(get_settings)
):
    if not settings.kv:
        raise HTTPException(500, "KV namespace not configured")

    # 1. Get webhook URL from KV
    webhook_url = await settings.kv.get(f"discord-webhook:{body.channel}")
    if not webhook_url:
        raise HTTPException(400, f"Unknown channel: {body.channel}")

    # 2. Rate limit (Max 30 per minute per channel) - check and increment atomically before sending
    if await check_and_increment_channel_rate(body.channel, settings.kv, limit=30):
        raise HTTPException(429, "Rate limit: max 30 notifications per minute per channel")

    # 3. Build Embed
    embed = {
        "title": body.title,
        "description": body.message,
        "color": COLOR_PRESETS.get(body.color, COLOR_PRESETS["blue"]),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    if body.fields:
        embed["fields"] = [f.model_dump() for f in body.fields]

    # 4. Send (Sync or Async)
    if body.async_mode:
        # Fire-and-forget: Return 202 immediately, send in background
        # TODO: Before deploying to Cloudflare Workers, open a follow-up issue to track:
        # - Affected symbols: post_webhook, body.async_mode, webhook_url, embed, JSONResponse
        # - Runtime change required: wire request.scope["ctx"] -> ctx and replace
        #   asyncio.create_task with ctx.waitUntil(post_webhook(webhook_url, embed))
        # - Alternative: consider Cloudflare Queues handoff for async notifications
        # Currently using asyncio.create_task which will be killed on Workers when response returns.
        asyncio.create_task(post_webhook(webhook_url, embed))
        return JSONResponse(
            status_code=202,
            content={"channel": body.channel, "sent": True, "message": "Queued"}
        )

    # Synchronous send
    await post_webhook(webhook_url, embed)

    return NotificationResult(channel=body.channel, sent=True)