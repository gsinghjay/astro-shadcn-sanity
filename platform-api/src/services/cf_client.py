import json
from fastapi import HTTPException
from services.http_client import get_client

SITE_TO_CF_PROJECT = {
    "capstone": "ywcc-capstone",
    "rwc-us": "rwc-us",
    "rwc-intl": "rwc-intl"
}

async def get_deploy_status(site: str, settings) -> dict:
    project_name = SITE_TO_CF_PROJECT.get(site)
    if not project_name:
        raise HTTPException(400, f"Unknown site: {site}")

    # Check KV cache first (30s TTL)
    cache_key = f"deploy-status:{site}"
    if settings.kv:
        cached = await settings.kv.get(cache_key)
        if cached:
            return json.loads(cached)

    account_id = settings.optional_secrets.get("cf_account_id")
    cf_api_token = settings.optional_secrets.get("cf_api_token")

    if not account_id or not cf_api_token:
        raise HTTPException(500, "Cloudflare credentials not configured")

    async with get_client() as client:
        url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}/deployments"
        resp = await client.get(
            url,
            headers={"Authorization": f"Bearer {cf_api_token}"},
            params={"per_page": 1},
        )
        if resp.status_code != 200:
            raise HTTPException(502, f"Cloudflare API error: {resp.status_code}")

        deployments = resp.json().get("result", [])
        result = deployments[0] if deployments else {}

    # Cache the result in KV
    if settings.kv and result:
        await settings.kv.put(cache_key, json.dumps(result), expirationTtl=30)
        
    return result

async def get_cf_analytics(metric: str, period: str, settings) -> list:
    """Queries Cloudflare's GraphQL Analytics API."""
    account_id = settings.optional_secrets.get("cf_account_id")
    cf_api_token = settings.optional_secrets.get("cf_api_token")

    if not account_id or not cf_api_token:
        raise HTTPException(500, "Cloudflare credentials not configured")

    # Basic GraphQL query for Workers Invocations (example metric)
    query = """
    query {
      viewer {
        accounts(filter: {accountTag: "%s"}) {
          workersInvocationsAdaptive(limit: 10, orderBy: [datetime_DESC]) {
            sum { requests }
            dimensions { datetime }
          }
        }
      }
    }
    """ % account_id

    async with get_client() as client:
        resp = await client.post(
            "https://api.cloudflare.com/client/v4/graphql",
            headers={"Authorization": f"Bearer {cf_api_token}"},
            json={"query": query}
        )
        if resp.status_code != 200:
            raise HTTPException(502, "Cloudflare GraphQL API error")
            
        try:
            data = resp.json()["data"]["viewer"]["accounts"][0]["workersInvocationsAdaptive"]
            return [{"datetime": d["dimensions"]["datetime"], "value": d["sum"]["requests"]} for d in data]
        except (KeyError, IndexError):
            return []