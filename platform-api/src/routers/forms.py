from typing import List
from fastapi import HTTPException, Depends, Request, APIRouter, Query
from models.forms import SubmissionResponse, FormSubmission, SubmissionListItem
from models.settings import WorkerSettings
from services.http_client import get_client
from services.sanity_client import SanityClient
from services.turnstile import verify_turnstile
from dependencies import get_settings, verify_admin_api_key, get_sanity
from datetime import datetime, timezone
from utils.dataset import resolve_dataset
import uuid

router = APIRouter(prefix="/forms", tags=["forms"])

@router.post("/submit", response_model=SubmissionResponse)
async def submit_form(request: Request, body: FormSubmission, settings: WorkerSettings = Depends(get_settings), sanity = Depends(get_sanity)):
    client_ip = request.headers.get("CF-Connecting-IP", "unknown")

    # Rate limit
    if await check_and_increment_rate_limit(client_ip, settings.kv):
        raise HTTPException(429, "Rate limit exceeded — max 5 submissions per hour")

    # Turnstile
    if not await verify_turnstile(body.turnstile_token, client_ip, settings.optional_secrets.get("turnstile_secret_key")):
        raise HTTPException(400, "Turnstile verification failed")

    # Create Sanity draft
    doc_id = await create_submission(body, settings, sanity)

    # Discord notification (fire-and-forget)
    # FIXME currently this has been removed, maybe replaced with settings.kv.get("discord-webhook:{channel}") from 12.6
    webhook_url = settings.optional_secrets.get("discord_webhook_url") 

    # Fire and forget to Discord
    await notify_discord(body, webhook_url)

    return SubmissionResponse(id=doc_id)

@router.get("/submissions", response_model=List[SubmissionListItem])
async def list_submissions(
    site: str = Query("capstone", description="Target site/workspace"),
    status: str = Query("submitted", description="Submission status filter (use 'all' for no filter)"),
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    sanity: SanityClient = Depends(get_sanity),
    _admin: bool = Depends(verify_admin_api_key) # Protect route
):
    """Admin-only endpoint to list recent submissions."""
    dataset, _ = resolve_dataset(site)
    
    # GROQ query now filters by status (unless status='all') and selects 'status'
    query = """
    *[_type == 'submission' && ($status == 'all' || status == $status)] | order(submittedAt desc)[0...$limit] { 
        _id, name, email, organization, submittedAt, status 
    }
    """
    
    return await sanity.query(query, dataset, {"limit": limit, "status": status})

RATE_LIMIT_MAX = 5
RATE_LIMIT_WINDOW_SECS = 3600

async def check_and_increment_rate_limit(ip: str, kv) -> bool:
    """Increment first, then check; preserve original TTL on subsequent puts."""
    key = f"rate:forms:{ip}"
    raw = await kv.get(key)
    count = int(raw or "0") + 1
    # Only set TTL on first write so the window doesn't slide on every hit.
    if raw is None:
        await kv.put(key, str(count), expirationTtl=RATE_LIMIT_WINDOW_SECS)
    else:
        await kv.put(key, str(count))
    return count > RATE_LIMIT_MAX

async def notify_discord(body: FormSubmission, settings: WorkerSettings):
    webhook_url = await settings.kv.get("discord-webhook:...") # currently we do not have a webhook for this.
    if not webhook_url:
        return
        
    embed = {
        "title": "New Form Submission",
        "color": 0x0066cc, # Blue
        "fields": [
            {"name": "Name", "value": body.name, "inline": True},
            {"name": "Email", "value": body.email, "inline": True},
            {"name": "Organization", "value": body.organization or "N/A", "inline": True},
            {"name": "Message", "value": body.message[:1024]} # Discord limit is 1024
        ],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    try:
        async with get_client() as client:
            await client.post(webhook_url, json={"embeds": [embed]})
    except Exception:
        pass # Fire and forget, don't break the user's submission if Discord fails

async def create_submission(body: FormSubmission, settings: WorkerSettings, sanity: SanityClient) -> str:
    """Creates a new submission document in Sanity."""
    write_token = settings.optional_secrets.get("sanity_api_write_token")
    if not write_token:
        raise HTTPException(status_code=500, detail="Missing sanity_api_write_token")

    doc_id = f"submission.{uuid.uuid4()}"
    doc = {
        "_id": doc_id,
        "_type": "submission",
        "name": body.name,
        "email": body.email,
        "organization": body.organization,
        "message": body.message,
        "formType": body.form_type,
        "status": "submitted",
        "submittedAt": datetime.now(timezone.utc).isoformat()
    }
    
    # unsure if the form ID is required to be returned
    # if body.form_id:
    #     doc["form"] = {"_type": "reference", "_ref": body.form_id}

    dataset, _ = resolve_dataset(body.site)

    # Submissions are global, default to production dataset
    await sanity.mutate([{"create": doc}], dataset=dataset, write_token=write_token)
    
    return doc_id