import json
import logging
from fastapi import HTTPException
from services.http_client import get_client

from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

SITE_TO_CF_PROJECT = {
    "capstone": "ywcc-capstone",
    "rwc-us": "rwc-us",
    "rwc-intl": "rwc-intl"
}

async def get_deploy_status(site: str, settings) -> dict:
    project_name = SITE_TO_CF_PROJECT.get(site)
    if not project_name:
        raise HTTPException(400, f"Unknown site: {site}")

    # Check KV cache first (60s TTL)
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

        response_json = resp.json()
        if "result" not in response_json:
            raise HTTPException(502, "Malformed response from Cloudflare: missing 'result' key")

        deployments = response_json["result"]
        if not deployments:
            return {"status": "no_deployments"}

        result = deployments[0]

    # Cache the result in KV
    if settings.kv and result:
        await settings.kv.put(cache_key, json.dumps(result), {"expirationTtl": 60})
        
    return result

async def get_cf_analytics(metric: str, period: str, settings) -> list:
    """Queries Cloudflare's GraphQL Analytics API for custom Analytics Engine metrics."""

    account_id = settings.optional_secrets.get("cf_account_id")
    cf_api_token = settings.optional_secrets.get("cf_api_token")

    if not account_id or not cf_api_token:
        raise HTTPException(500, "Cloudflare credentials not configured")

    # AC4: Restrict to specific metrics
    allowed_metrics = {"chatbot_queries", "form_submissions", "webhook_events"}
    if metric not in allowed_metrics:
        raise HTTPException(400, f"Invalid metric. Allowed: {', '.join(allowed_metrics)}")

    # Calculate the start date based on the period
    now = datetime.now(timezone.utc)
    if period == "24h":
        start_dt = now - timedelta(days=1)
    elif period == "7d":
        start_dt = now - timedelta(days=7)
    elif period == "30d":
        start_dt = now - timedelta(days=30)
    else:
        raise HTTPException(400, "Invalid period. Allowed: 24h, 7d, 30d")

    datetime_geq = start_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

    # GraphQL query for Analytics Engine (Groups by Hour) - using variables for safety
    query = """
    query GetAnalytics($accountTag: String!, $since: String!, $metric: String!) {
      viewer {
        accounts(filter: {accountTag: $accountTag}) {
          analyticsEngineEventsAdaptiveGroups(
            filter: { datetime_geq: $since, blob1: $metric }
            limit: 1000
            orderBy: [datetimeHour_ASC]
          ) {
            dimensions {
              datetimeHour
            }
            sum {
              double1
            }
          }
        }
      }
    }
    """

    variables = {
        "accountTag": account_id,
        "since": datetime_geq,
        "metric": metric
    }

    async with get_client() as client:
        resp = await client.post(
            "https://api.cloudflare.com/client/v4/graphql",
            headers={"Authorization": f"Bearer {cf_api_token}"},
            json={"query": query, "variables": variables}
        )
        
        if resp.status_code != 200:
            raise HTTPException(502, f"Cloudflare GraphQL API error: {resp.status_code}")

        try:
            # Parse the GraphQL response
            response_json = resp.json()

            # Check for GraphQL errors first
            if "errors" in response_json:
                error_details = response_json["errors"]
                logger.error("GraphQL errors from Cloudflare Analytics API: %s", error_details)
                raise HTTPException(502, f"GraphQL errors from Cloudflare Analytics API")

            # Only proceed if data exists and is non-null
            if not response_json.get("data"):
                raise HTTPException(502, "Missing data in Cloudflare Analytics API response")

            # Validate nested structure before accessing
            if "viewer" not in response_json["data"]:
                raise HTTPException(502, "Missing 'viewer' in Cloudflare Analytics API response")
            if "accounts" not in response_json["data"]["viewer"]:
                raise HTTPException(502, "Missing 'accounts' in Cloudflare Analytics API response")

            accounts = response_json["data"]["viewer"]["accounts"]
            if not accounts or len(accounts) == 0:
                logger.error(f"No accounts found for account_id: {account_id}. Response {response_json}")
                raise HTTPException(
                    502,
                    f"No accounts found for provided account id. Check credentials/scope"
                )

            # Parse the deeply nested GraphQL response
            data = accounts[0]["analyticsEngineEventsAdaptiveGroups"]
            # Map it to a clean timeseries list
            return [{"datetime": d["dimensions"]["datetimeHour"], "value": d["sum"]["double1"]} for d in data]
        except (KeyError, IndexError) as e:
            # Log the full response and exception for debugging
            logger.exception("Failed to parse Cloudflare Analytics response, status=%s", resp.status_code)
            raise HTTPException(502, "Malformed response from Cloudflare Analytics API") from e