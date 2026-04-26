from fastapi import HTTPException, Depends, Request, APIRouter, Query, BackgroundTasks
from models.forms import SubmissionResponse, FormSubmission, SubmissionListItem
from models.settings import WorkerSettings
from services.http_client import get_client
from services.sanity_client import SanityClient
from services.turnstile import verify_turnstile
from dependencies import get_settings, verify_admin_api_key, get_sanity
from datetime import datetime, timezone
from utils.dataset import resolve_dataset
from urllib.parse import urlparse
import logging
import uuid

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/forms", tags=["forms"])

@router.post("/submit", response_model=SubmissionResponse)
async def submit_form(request: Request, body: FormSubmission, background_tasks: BackgroundTasks, settings: WorkerSettings = Depends(get_settings), sanity = Depends(get_sanity)):
    client_ip = request.headers.get("CF-Connecting-IP")
    if not client_ip:
        raise HTTPException(400, "Missing CF-Connecting-IP header")

    # Rate limit - use composite key to mitigate distributed abuse
    rate_limit_key = f"{client_ip}:{body.email}:{body.site}"
    if await check_and_increment_rate_limit(rate_limit_key, settings.kv):
        raise HTTPException(429, "Rate limit exceeded — max 5 submissions per hour")

    # Turnstile
    if not await verify_turnstile(body.turnstile_token, client_ip, settings.optional_secrets.get("turnstile_secret_key")):
        raise HTTPException(400, "Turnstile verification failed")

    # Create Sanity submission document
    doc_id = await create_submission(body, settings, sanity)

    # Discord notification (fire-and-forget via background task)
    background_tasks.add_task(notify_discord, body, settings)

    return SubmissionResponse(id=doc_id)

@router.get("/submissions", response_model=list[SubmissionListItem])
async def list_submissions(
    site: str = Query("capstone", description="Target site/workspace"),
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    sanity: SanityClient = Depends(get_sanity),
    admin_ok: bool = Depends(verify_admin_api_key)  # Protect route
):
    """Admin-only endpoint to list recent submissions."""
    dataset, _ = resolve_dataset(site)

    # GROQ query to fetch submissions with pagination using parameters
    end_index = offset + limit
    query = """
    *[_type == 'submission'] | order(submittedAt desc)[$offset...$end] {
        _id, name, email, organization, submittedAt
    }
    """

    return await sanity.query(query, dataset, {"offset": offset, "end": end_index})

RATE_LIMIT_MAX = 5
RATE_LIMIT_WINDOW_SECS = 3600

async def check_and_increment_rate_limit(composite_key: str, kv) -> bool:
    """Increment first, then check; preserve original TTL on subsequent puts."""
    import json
    import time

    key = f"rate:forms:{composite_key}"
    raw = await kv.get(key)
    now = int(time.time())

    if raw is None:
        # First write: initialize count and timestamp
        data = {"count": 1, "started_at": now}
        await kv.put(key, json.dumps(data), expirationTtl=RATE_LIMIT_WINDOW_SECS)
        return 1 > RATE_LIMIT_MAX
    else:
        # Subsequent writes: increment count and preserve TTL
        data = json.loads(raw)
        count = data.get("count", 0) + 1
        started_at = data.get("started_at", now)
        data["count"] = count

        # Calculate remaining TTL
        remaining_ttl = RATE_LIMIT_WINDOW_SECS - (now - started_at)
        if remaining_ttl > 0:
            await kv.put(key, json.dumps(data), expirationTtl=remaining_ttl)

        return count > RATE_LIMIT_MAX

async def notify_discord(body: FormSubmission, settings: WorkerSettings):
    # Look up webhook URL from KV using a configurable key per site
    webhook_key = "discord-webhook:form-submissions"
    webhook_url = await settings.kv.get(webhook_key) if settings.kv else None
    if not webhook_url:
        return

    embed = {
        "title": "New Form Submission",
        "color": 0x0066cc,  # Blue
        "fields": [
            {"name": "Name", "value": body.name, "inline": True},
            {"name": "Email", "value": body.email, "inline": True},
            {"name": "Organization", "value": body.organization or "N/A", "inline": True},
            {"name": "Message", "value": body.message[:1024]}  # Discord limit is 1024
        ],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    webhook_host = urlparse(webhook_url).hostname if webhook_url else "unknown"
    request_id = uuid.uuid4().hex[:8]

    try:
        async with get_client(timeout=5.0) as client:
            resp = await client.post(webhook_url, json={"embeds": [embed]}, timeout=5.0)
            resp.raise_for_status()
    except Exception as e:
        # Log the exception with context, but don't break submission flow
        import httpx
        if isinstance(e, httpx.HTTPStatusError):
            logger.exception(
                "Discord notification failed for webhook host %s, request_id=%s",
                webhook_host, request_id
            )
        elif isinstance(e, httpx.HTTPError):
            logger.exception(
                "Discord notification failed for webhook host %s, request_id=%s",
                webhook_host, request_id
            )
        else:
            logger.exception(
                "Discord notification failed for webhook host %s, request_id=%s",
                webhook_host, request_id
            )

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
        "submittedAt": datetime.now(timezone.utc).isoformat()
    }
    
    # unsure if the form ID is required to be returned
    # if body.form_id:
    #     doc["form"] = {"_type": "reference", "_ref": body.form_id}

    dataset, _ = resolve_dataset(body.site)

    # Submissions are global, default to production dataset
    await sanity.mutate([{"create": doc}], dataset=dataset, write_token=write_token)
    
    return doc_id