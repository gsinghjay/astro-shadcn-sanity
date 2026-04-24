from services.http_client import get_client

async def verify_turnstile(token: str, ip: str, secret_key: str) -> bool:
        async with get_client() as client:
            resp = await client.post(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                json={"secret": secret_key, "response": token, "remoteip": ip},
            )
            return resp.json().get("success", False)