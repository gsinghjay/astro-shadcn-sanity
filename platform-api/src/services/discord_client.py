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
    parsed = urlparse(webhook_url)
    if parsed.hostname not in ALLOWED_WEBHOOK_HOSTS:
        raise HTTPException(400, f"Invalid webhook host: {parsed.hostname}")

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
        elif resp.status_code >= 300:
            # Translate other non-2xx to 502 with sanitized upstream info
            raise HTTPException(
                status_code=502,
                detail=f"Discord webhook error: {resp.status_code}"
            )
        # 2xx is success, return normally