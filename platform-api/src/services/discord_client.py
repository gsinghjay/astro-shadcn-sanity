from urllib.parse import urlparse
from fastapi import HTTPException
from services.http_client import get_client

# Allowlist of Discord webhook hosts
ALLOWED_WEBHOOK_HOSTS = {"discord.com", "discordapp.com"}

async def post_webhook(webhook_url: str, embed: dict):
    """Sends a formatted embed to a Discord webhook URL.

    Validates the webhook destination and handles upstream errors properly.
    """
    # Parse and validate webhook host
    webhook_url = webhook_url.strip('"')
    if "wait=true" not in webhook_url:
        raise HTTPException(500, "Webhook incorrectly configured (missing wait=true query param)")

    parsed = urlparse(webhook_url)
    if not parsed.hostname or parsed.hostname not in ALLOWED_WEBHOOK_HOSTS:
        raise HTTPException(500, f"Invalid webhook host: {parsed.hostname}")
    if parsed.scheme != "https":
        raise HTTPException(500, f"Invalid webhook scheme: {parsed.scheme}")
    if not parsed.path.startswith("/api/webhooks/"):
        raise HTTPException(500, f"Invalid webhook path: {parsed.path}")

    async with get_client() as client:
        resp = await client.post(
            webhook_url,
            json={"embeds": [embed]}
        )

        # Handle upstream errors
        if resp.status_code == 429:
            # Forward rate limit with Retry-After header if available
            retry_after = resp.headers.get("Retry-After", "60")
            raise HTTPException(
                status_code=503,
                detail=f"Discord rate limited, retry after {retry_after}s",
                headers={"Retry-After": retry_after}
            )
        if resp.status_code >= 300:
            # Translate other non-2xx to 502 with sanitized upstream info
            raise HTTPException(
                status_code=502,
                detail=f"Discord webhook error: {resp.status_code}"
            )
        # 2xx is success, return normally