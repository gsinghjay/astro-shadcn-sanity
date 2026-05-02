import logging
import httpx
from services.http_client import get_client

logger = logging.getLogger(__name__)

async def verify_turnstile(token: str, ip: str, secret_key: str | None) -> bool:
    if not secret_key:
        logger.error("verify_turnstile: turnstile_secret_key is not configured")
        return False
    try:
        async with get_client() as client:
            resp = await client.post(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                json={"secret": secret_key, "response": token, "remoteip": ip},
            )
        return bool(resp.json().get("success", False))
    except (httpx.HTTPError, ValueError) as e:
        logger.warning("Turnstile verification request failed: %s", e)
        return False