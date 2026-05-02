from fastapi import HTTPException, Depends, Request, APIRouter, Query, BackgroundTasks
from models.forms import SubmissionResponse, FormSubmission, SubmissionListItem
from models.settings import WorkerSettings
from models.discord import DiscordNotification, EmbedField
from routers.discord import send_notification
from services.sanity_client import SanityClient
from services.turnstile import verify_turnstile
from dependencies import get_settings, verify_admin_api_key, get_sanity
from datetime import datetime, timezone
from utils.dataset import resolve_dataset
import logging, uuid, asyncio, httpx

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/forms", tags=["forms"])

@router.post("/submit", response_model=SubmissionResponse)
async def submit_form(request: Request, body: FormSubmission, background_tasks: BackgroundTasks, settings: WorkerSettings = Depends(get_settings), sanity = Depends(get_sanity)):
    client_ip = request.headers.get("CF-Connecting-IP")
    if not client_ip:
        raise HTTPException(400, "Missing CF-Connecting-IP header")

    # Rate limit - use composite key to mitigate distributed abuse
    rate_limit_key = f"{client_ip}:{body.email}:{body.site}"

    if await is_rate_limited(rate_limit_key, settings.kv):
        raise HTTPException(429, "Rate limit exceeded — max 5 submissions per hour")
    await increment_rate_limit(rate_limit_key, settings.kv)

    # Turnstile
    if not await verify_turnstile(body.turnstile_token, client_ip, settings.optional_secrets.get("turnstile_secret_key")):
        raise HTTPException(400, "Turnstile verification failed")

    # Create Sanity submission document
    doc_id = await create_submission(body, settings, sanity)

    # Discord notification
    await notify_discord(body, settings, background_tasks)

    return SubmissionResponse(id=doc_id)

@router.get("/submissions", response_model=list[SubmissionListItem])
async def list_submissions(
    site: str = Query("capstone", description="Target site/workspace"),
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    sanity: SanityClient = Depends(get_sanity),
    _ = Depends(verify_admin_api_key)  # Protect route
):
    """Admin-only endpoint to list recent submissions."""
    dataset, site_filter = resolve_dataset(site)

    # GROQ query to fetch submissions with pagination using parameters
    site_predicate = "&& site == $site" if site_filter else ""
    end_index = offset + limit
    query = f"""
    *[_type == 'submission' {site_predicate}] | order(submittedAt desc)[$offset...$end] {{
        _id, name, email, organization, submittedAt, status, formType, site
    }}
    """
    params = {"offset": offset, "end": end_index}
    if site_filter:
        params["site"] = site_filter

    return await sanity.query(query, dataset, params)

async def is_rate_limited(ip: str, kv) -> bool:
    key = f"rate:forms:{ip}"
    count = int(await kv.get(key) or "0")
    return count >= 5

async def increment_rate_limit(ip: str, kv):
    key = f"rate:forms:{ip}"
    count = int(await kv.get(key) or "0")
    await kv.put(key, str(count + 1), expirationTtl=3600)

async def notify_discord(body: FormSubmission, settings: WorkerSettings, background_tasks: BackgroundTasks):
    # Look up webhook URL from KV using a configurable key per site
    webhook_key = "discord-webhook:form-submissions"
    webhook_url = await settings.kv.get(webhook_key) if settings.kv else None
    if not webhook_url:
        return
    
    embed = DiscordNotification(
        channel = "form-submissions",
        title = "New Form Submission",
        message = "A new form submission has been added to sanity",
        color = "blue",
        fields = [
            EmbedField(name = "Name", value = body.name),
            EmbedField(name = "Email", value = body.email),
            EmbedField(name = "Organization", value = body.organization or "N/A"),
            EmbedField(name = "Message", value = body.message[:1024]) # discord imposes 1024 char limit
        ],
        async_mode = True
    )

    try:
        await send_notification(embed, background_tasks, settings)
    except (httpx.HTTPError, asyncio.TimeoutError):
        # Log the exception with context, but don't break submission flow
        logger.exception(
            "Discord notification failed for webhook"
        )
        raise

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
        "submittedAt": datetime.now(timezone.utc).isoformat(),
        "status": "submitted",
        "formType": body.form_type,
        "site": body.site
    }

    dataset, _ = resolve_dataset(body.site)

    # Submissions are global, default to production dataset
    await sanity.mutate([{"create": doc}], dataset=dataset, write_token=write_token)
    
    return doc_id