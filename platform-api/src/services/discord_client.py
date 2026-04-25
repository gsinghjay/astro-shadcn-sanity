from services.http_client import get_client, raise_for_status

async def post_webhook(webhook_url: str, embed: dict):
    """Sends a formatted embed to a Discord webhook URL."""
    async with get_client() as client:
        resp = await client.post(
            webhook_url, 
            json={"embeds": [embed]}
        )
        raise_for_status(resp)