# src/routers/content.py
from fastapi import APIRouter, Depends, Query, Response, HTTPException
from typing import List

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

@router.get("/pages", response_model=List[PageResponse])
async def get_pages(
    response: Response,
    site: str = Query("capstone", description="Target site/workspace"),
    sanity: SanityClient = Depends(get_sanity)
):
    dataset, site_filter = resolve_dataset(site)
    result = await sanity.query(GET_PAGES, dataset, {"site": site_filter})
    set_cache_header(response)
    return result

@router.get("/events", response_model=List[EventResponse])
async def get_events(
    response: Response,
    site: str = Query("capstone", description="Target site/workspace"),
    upcoming: bool = Query(True, description="Only show future events"),
    limit: int = Query(10, ge=1, le=100, description="Max events to return"),
    sanity: SanityClient = Depends(get_sanity)
):
    dataset, site_filter = resolve_dataset(site)
    result = await sanity.query(
        GET_EVENTS, dataset, 
        {"site": site_filter, "upcoming": upcoming, "limit": limit}
    )
    set_cache_header(response)
    return result

@router.get("/sponsors", response_model=List[SponsorResponse])
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
        {"site": site_filter, "tier": tier, "featured": featured}
    )
    set_cache_header(response)
    return result

@router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(
    response: Response,
    site: str = Query("capstone", description="Target site/workspace"),
    sponsor: str | None = Query(None, description="Filter by sponsor slug"),
    sanity: SanityClient = Depends(get_sanity)
):
    dataset, site_filter = resolve_dataset(site)
    result = await sanity.query(
        GET_PROJECTS, dataset, 
        {"site": site_filter, "sponsor": sponsor}
    )
    set_cache_header(response)
    return result

@router.post("/search", response_model=List[SearchResult])
async def search_content(
    request: SearchRequest,
    sanity: SanityClient = Depends(get_sanity)
):
    dataset, site_filter = resolve_dataset(request.site)
    
    # Add an asterisk for wildcard matching in GROQ
    search_term = f"{request.query}*"
    raw_results = await sanity.query(
        SEARCH_QUERY, dataset, 
        {"site": site_filter, "searchTerm": search_term, "types": request.types}
    )
    
    # Map 'name' to 'title' if it's a sponsor, format to SearchResult
    results = []
    for item in raw_results:
        results.append({
            "_id": item["_id"],
            "_type": item["_type"],
            "title": item.get("title") or item.get("name") or "Unknown",
            "_score": item.get("_score")
        })
        
    return results

@router.post("/mutations")
async def proxy_mutations(
    request: MutationRequest,
    sanity: SanityClient = Depends(get_sanity),
    settings: WorkerSettings = Depends(get_settings),
    _admin: bool = Depends(verify_admin_api_key) # Protect this route!
):
    """Proxies mutation requests directly to Sanity API."""
    # Write tokens should be stored in required_secrets or optional_secrets
    write_token = settings.optional_secrets.get("sanity_api_write_token")
    if not write_token:
        raise HTTPException(status_code=500, detail="Missing sanity_api_write_token")

    return await sanity.mutate(request.mutations, request.dataset, write_token)