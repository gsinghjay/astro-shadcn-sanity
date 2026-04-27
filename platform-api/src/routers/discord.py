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

async def is_channel_rate_limited(channel: str, kv) -> bool:
    key = f"rate:discord:{channel}"
    count = int(await kv.get(key) or "0")
    return count >= 30

async def increment_channel_rate(channel: str, kv):
    key = f"rate:discord:{channel}"
    count = int(await kv.get(key) or "0")
    await kv.put(key, str(count + 1), expirationTtl=60)


# --- Endpoints ---

@router.post("/notify", response_model=NotificationResult, responses={202: {"model": NotificationResult, "description": "Queued (async)"}})
async def send_notification(
    body: DiscordNotification,
    background_tasks: BackgroundTasks,
    settings: WorkerSettings = Depends(get_settings)
):
    if not settings.kv:
        raise HTTPException(500, "KV namespace not configured")

    # 1. Get webhook URL from KV
    webhook_url = await settings.kv.get(f"discord-webhook:{body.channel}")
    webhook_url = webhook_url[1:-1]
    if not webhook_url:
        raise HTTPException(400, f"Unknown channel: {body.channel}")

    # 2. Rate limit (Max 30 per minute per channel) - check and increment atomically before sending
    await increment_channel_rate(body.channel, settings.kv)
    if await is_channel_rate_limited(body.channel, settings.kv):
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
        result = NotificationResult(channel=body.channel, sent=True, message="Queued")
        return JSONResponse(
            status_code=202,
            content=result.model_dump()
        )

    # Synchronous send
    await post_webhook(webhook_url, embed)

    return NotificationResult(channel=body.channel, sent=True)