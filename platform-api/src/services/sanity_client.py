# src/services/sanity_client.py
from services.http_client import get_client, raise_for_status

class SanityClient:
    def __init__(self, project_id: str, token: str, api_version: str = "2024-01-01"):
        self.project_id = project_id
        self.token = token
        self.api_version = api_version
        self.base_url = f"https://{project_id}.api.sanity.io/v{api_version}/data"

    async def query(self, groq: str, dataset: str, params: dict | None = None) -> list | dict:
        url = f"{self.base_url}/query/{dataset}"

        headers = {}
        token = str(self.token).strip() if self.token else ""
        if token and token.startswith("sk"):
            headers["Authorization"] = f"Bearer {token}"

        async with get_client() as client:
            resp = await client.post(
                url,
                headers=headers,
                json={"query": groq, "params": params or {}},
            )
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