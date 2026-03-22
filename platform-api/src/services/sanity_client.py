# src/services/sanity_client.py
from typing import Any
from services.http_client import get_client, raise_for_status

class SanityClient:
    def __init__(self, project_id: str, token: str, api_version: str = "2024-01-01"):
        self.project_id = project_id
        self.token = token
        self.api_version = api_version
        self.base_url = f"https://{project_id}.api.sanity.io/v{api_version}/data"

    async def query(self, groq: str, dataset: str, params: dict | None = None) -> list | dict:
        url = f"{self.base_url}/query/{dataset}"
        
        # FIX 1: Safely build headers to prevent the 400 Bad Request token error
        headers = {}
        if self.token and self.token.strip():
            headers["Authorization"] = f"Bearer {self.token.strip()}"
            
        # FIX 2: Use get_client() wrapper to prevent Cloudflare HTTP/2 connection crashes
        async with get_client() as client:
            resp = await client.post(
                url,
                headers=headers,
                json={"query": groq, "params": params or {}},
            )
            # This is where Sanity's errors (401, 403, etc) are forwarded!
            raise_for_status(resp) 
            return resp.json().get("result", [])
        
    async def mutate(self, mutations: list[dict], dataset: str, write_token: str) -> dict:
        """Proxies mutations directly to Sanity's mutation API."""
        url = f"{self.base_url}/mutate/{dataset}"
        headers = {"Authorization": f"Bearer {write_token}"}
        
        async with get_client() as client:
            resp = await client.post(
                url,
                headers=headers,
                json={"mutations": mutations}
            )
            raise_for_status(resp)
            return resp.json()