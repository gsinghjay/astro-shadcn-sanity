"""
Sanity CMS client for querying project and event data.
"""

import os
import httpx
from typing import Any

SANITY_API_VERSION = "2024-01-01"


async def query_sanity(dataset: str, groq: str) -> Any:
    """Run a GROQ query against a Sanity dataset.

    Args:
        dataset: The Sanity dataset name (e.g. 'production' or 'rwc').
        groq: The GROQ query string.

    Returns:
        The result from the Sanity API.
    """
    sanity_project_id = os.getenv("SANITY_PROJECT_ID")
    url = f"https://{sanity_project_id}.api.sanity.io/v{SANITY_API_VERSION}/data/query/{dataset}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params={"query": groq})
        response.raise_for_status()
        return response.json().get("result")


async def get_project(project_name: str) -> dict | None:
    """Search for a project by name across both datasets.

    Searches 'production' first, then 'rwc'. Returns the first match found.

    Args:
        project_name: The project title to search for (case-insensitive).

    Returns:
        A dict with project data, or None if not found.
    """
    groq = f"""
    *[_type == "project" && lower(title) match lower("*{project_name}*")][0]{{
        title,
        status,
        semester,
        technologyTags,
        "sponsor": sponsor->{{name}},
    }}
    """

    for dataset in ["production", "rwc"]:
        result = await query_sanity(dataset, groq)
        if result:
            result["_dataset"] = dataset
            return result

    return None


async def get_upcoming_events(limit: int = 5) -> list:
    """Fetch upcoming events from Sanity ordered by date.

    Args:
        limit: Maximum number of events to return (default 5, max 15).

    Returns:
        A list of event dicts with title, date, endDate, location, category, and eventType.
    """
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
    return await query_sanity("production", groq) or []

async def get_all_sponsors() -> list:
    """Fetch all sponsor names and tiers from Sanity.

    Returns:
        A list of sponsor dicts with name and tier.
    """
    groq = '*[_type == "sponsor"] | order(tier asc){name, tier}'
    return await query_sanity("production", groq) or []

async def get_sponsor(sponsor_name: str) -> dict | None:
    """Search for a sponsor by name across both datasets.

    Searches 'production' first, then 'rwc'. Returns the first match found,
    including a count of projects associated with the sponsor.

    Args:
        sponsor_name: The sponsor name to search for (case-insensitive).

    Returns:
        A dict with sponsor data and project count, or None if not found.
    """
    groq = f"""
    *[_type == "sponsor" && lower(name) match lower("*{sponsor_name}*")][0]{{
        name,
        tier,
        website,
        industry,
        description,
        "projectCount": count(*[_type == "project" && references(^._id)]),
    }}
    """

    for dataset in ["production", "rwc"]:
        result = await query_sanity(dataset, groq)
        if result:
            result["_dataset"] = dataset
            return result

    return None