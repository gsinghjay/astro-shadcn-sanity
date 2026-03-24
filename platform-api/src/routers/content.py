# src/routers/content.py
from fastapi import APIRouter, Depends, Query, Response, HTTPException

from dependencies import get_sanity, get_settings, verify_admin_api_key
from models.settings import WorkerSettings
from services.sanity_client import SanityClient
from utils.dataset import resolve_dataset
from models.content import (
    PageResponse, EventResponse, SponsorResponse, ProjectResponse,
    SearchResult, SearchRequest, MutationRequest
)
from queries.sponsors import GET_SPONSORS
from queries.events import GET_EVENTS
from queries.pages import GET_PAGES
from queries.projects import GET_PROJECTS
from queries.search import SEARCH_QUERY

router = APIRouter(prefix="/content", tags=["Content"])

def set_cache_header(response: Response):
    """AC9: Set Cache-Control header for GET endpoints."""
    response.headers["Cache-Control"] = "public, max-age=60"


def _build_params(**kwargs) -> dict:
    """Build GROQ params dict, omitting None values so $param stays undefined."""
    return {k: v for k, v in kwargs.items() if v is not None}


@router.get("/pages", response_model=list[PageResponse])
async def get_pages(
    response: Response,
    site: str = Query("capstone", description="Target site/workspace"),
    sanity: SanityClient = Depends(get_sanity)
):
    dataset, site_filter = resolve_dataset(site)
    result = await sanity.query(GET_PAGES, dataset, _build_params(site=site_filter))
    set_cache_header(response)
    return result

@router.get("/events", response_model=list[EventResponse])
async def get_events(
    response: Response,
    site: str = Query("capstone", description="Target site/workspace"),
    upcoming: bool = Query(True, description="Only show future events"),
    limit: int = Query(10, ge=1, le=100, description="Max events to return"),
    sanity: SanityClient = Depends(get_sanity)
):
    dataset, site_filter = resolve_dataset(site)
    params = _build_params(site=site_filter)
    params["upcoming"] = upcoming
    params["limit"] = limit
    result = await sanity.query(GET_EVENTS, dataset, params)
    set_cache_header(response)
    return result

@router.get("/sponsors", response_model=list[SponsorResponse])
async def get_sponsors(
    response: Response,
    site: str = Query("capstone", description="Target site/workspace"),
    tier: str | None = Query(None, description="Filter by tier (e.g. platinum, gold)"),
    featured: bool | None = Query(None, description="Filter by featured status"),
    sanity: SanityClient = Depends(get_sanity)
):
    dataset, site_filter = resolve_dataset(site)
    result = await sanity.query(
        GET_SPONSORS, dataset,
        _build_params(site=site_filter, tier=tier, featured=featured)
    )
    set_cache_header(response)
    return result

@router.get("/projects", response_model=list[ProjectResponse])
async def get_projects(
    response: Response,
    site: str = Query("capstone", description="Target site/workspace"),
    sponsor: str | None = Query(None, description="Filter by sponsor slug"),
    sanity: SanityClient = Depends(get_sanity)
):
    dataset, site_filter = resolve_dataset(site)
    result = await sanity.query(
        GET_PROJECTS, dataset,
        _build_params(site=site_filter, sponsor=sponsor)
    )
    set_cache_header(response)
    return result

@router.post("/search", response_model=list[SearchResult])
async def search_content(
    request: SearchRequest,
    sanity: SanityClient = Depends(get_sanity)
):
    dataset, site_filter = resolve_dataset(request.site)

    search_term = f"{request.query}*"
    params = _build_params(site=site_filter)
    params["searchTerm"] = search_term
    params["types"] = request.types
    raw_results = await sanity.query(SEARCH_QUERY, dataset, params)

    return [
        {
            "_id": item["_id"],
            "_type": item["_type"],
            "title": item.get("title") or item.get("name") or "Unknown",
            "_score": item.get("_score"),
        }
        for item in raw_results
    ]

@router.post("/mutations")
async def proxy_mutations(
    request: MutationRequest,
    sanity: SanityClient = Depends(get_sanity),
    settings: WorkerSettings = Depends(get_settings),
    _admin: bool = Depends(verify_admin_api_key)
):
    """Proxies mutation requests directly to Sanity API."""
    write_token = settings.optional_secrets.get("sanity_api_write_token")
    if not write_token:
        raise HTTPException(status_code=500, detail="Missing sanity_api_write_token")

    # Convert typed mutation models back to dicts for the Sanity API
    raw_mutations = [m.model_dump(exclude_none=True) for m in request.mutations]
    return await sanity.mutate(raw_mutations, request.dataset, write_token)
