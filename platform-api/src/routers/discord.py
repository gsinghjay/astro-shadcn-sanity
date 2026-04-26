from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
import json
import time

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

    window_seconds = 60
    key = f"rate:discord:{channel}"
    raw = await kv.get(key)
    now = int(time.time())

    if raw is None:
        # First write: initialize count and timestamp
        data = {"count": 1, "started_at": now}
        await kv.put(key, json.dumps(data), {"expirationTtl": window_seconds})
        return False
    else:
        # Subsequent writes: increment count and preserve TTL
        data = json.loads(raw)
        count = data.get("count", 0) + 1
        started_at = data.get("started_at", now)

        # Calculate remaining TTL
        remaining_ttl = window_seconds - (now - started_at)

        if remaining_ttl <= 0:
            # Window has expired, start a fresh window
            data = {"count": 1, "started_at": now}
            await kv.put(key, json.dumps(data), {"expirationTtl": window_seconds})
            return False
        else:
            data["count"] = count
            await kv.put(key, json.dumps(data), {"expirationTtl": remaining_ttl})
            return count > limit


# --- Endpoints ---

@router.post("/notify", response_model=NotificationResult)
async def send_notification(
    body: DiscordNotification, 
    background_tasks: BackgroundTasks,
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
        background_tasks.add_task(post_webhook, webhook_url, embed)
        return JSONResponse(
            status_code=202,
            content={"channel": body.channel, "sent": True, "message": "Queued"}
        )

    # Synchronous send
    await post_webhook(webhook_url, embed)

    return NotificationResult(channel=body.channel, sent=True)