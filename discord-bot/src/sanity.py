"""
Sanity CMS client for querying project and event data.
"""

import json
import os
from typing import Any
from urllib.parse import urlencode

SANITY_API_VERSION = "2024-01-01"


def _get_env_value(env, name: str) -> str | None:
    if env is not None:
        value = getattr(env, name, None)
        if value:
            return value
    return os.getenv(name)


async def query_sanity(dataset: str, groq: str, params: dict | None = None, env=None) -> Any:
    sanity_project_id = _get_env_value(env, "SANITY_PROJECT_ID")
    if not sanity_project_id:
        raise RuntimeError("SANITY_PROJECT_ID is not set.")

    from js import Object, fetch
    from pyodide.ffi import to_js

    base_url = f"https://{sanity_project_id}.api.sanity.io/v{SANITY_API_VERSION}/data/query/{dataset}"
    query_params = {"query": groq}
    if params:
        for key, value in params.items():
            query_params[f"${key}"] = json.dumps(value)

    url = f"{base_url}?{urlencode(query_params)}"

    response = await fetch(
        url,
        to_js({"method": "GET"}, dict_converter=Object.fromEntries),
    )
    if not response.ok:
        raise RuntimeError(f"Sanity request failed with status {response.status}")

    # Get raw JSON text and parse with Python's json module
    text = await response.text()
    payload = json.loads(text)
    return payload.get("result")


async def get_project(project_name: str, env=None) -> dict | None:
    groq = """
    *[_type == "project" && lower(title) match lower($pattern)][0]{
        title,
        status,
        semester,
        technologyTags,
        "sponsor": sponsor->{name},
    }
    """
    params = {"pattern": f"*{project_name}*"}

    for dataset in ["production", "rwc"]:
        result = await query_sanity(dataset, groq, params, env=env)
        if result:
            result["_dataset"] = dataset
            return result

    return None


async def get_upcoming_events(limit: int = 5, env=None) -> list:
    groq = f"""
    *[_type == "event" && status == "upcoming"] | order(date asc) [0...{limit}]{{
        title,
        date,
        endDate,
        location,
        category,
        eventType,
        isAllDay,
    }}
    """
    return await query_sanity("production", groq, env=env) or []


async def get_all_sponsors(env=None) -> list:
    groq = '*[_type == "sponsor"] | order(tier asc){name, tier}'
    return await query_sanity("production", groq, env=env) or []


async def get_sponsor(sponsor_name: str, env=None) -> dict | None:
    groq = """
    *[_type == "sponsor" && lower(name) match lower($pattern)][0]{
        name,
        tier,
        website,
        industry,
        description,
        "projectCount": count(*[_type == "project" && references(^._id)]),
    }
    """
    params = {"pattern": f"*{sponsor_name}*"}

    for dataset in ["production", "rwc"]:
        result = await query_sanity(dataset, groq, params, env=env)
        if result:
            result["_dataset"] = dataset
            return result

    return None
