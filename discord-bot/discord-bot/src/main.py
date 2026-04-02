import binascii
import json
import os
import time
from datetime import datetime

from fastapi import BackgroundTasks, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError
import httpx
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from cryptography.exceptions import InvalidSignature
from dotenv import load_dotenv

from models import (
    Interaction,
    InteractionType,
    ImmediateResponse,
    MessageResponseData,
)
from sanity import get_project, get_upcoming_events, get_sponsor, get_all_sponsors

load_dotenv()

PUBLIC_KEY = os.getenv("DISCORD_PUBLIC_KEY")
APPLICATION_ID = os.getenv("DISCORD_APPLICATION_ID")

if not PUBLIC_KEY:
    raise RuntimeError("DISCORD_PUBLIC_KEY is not set.")
if not APPLICATION_ID:
    raise RuntimeError("DISCORD_APPLICATION_ID is not set.")

TIMESTAMP_TOLERANCE_SECONDS = 300
_start_time = time.time()


def verify_discord_signature(public_key_hex: str, signature_hex: str, timestamp: str, body: bytes) -> bool:
    """Verify a Discord Ed25519 signature using the cryptography library.

    Args:
        public_key_hex: The Discord application's public key as a hex string.
        signature_hex: The Ed25519 signature from the X-Signature-Ed25519 header.
        timestamp: The request timestamp from the X-Signature-Timestamp header.
        body: The raw request body bytes.

    Returns:
        True if the signature is valid, False otherwise.
    """
    try:
        key_bytes = binascii.unhexlify(public_key_hex)
        sig_bytes = binascii.unhexlify(signature_hex)
        public_key = Ed25519PublicKey.from_public_bytes(key_bytes)
        public_key.verify(sig_bytes, timestamp.encode() + body)
        return True
    except (InvalidSignature, Exception):
        return False


def verify_timestamp(timestamp: str) -> bool:
    """Check that the request timestamp is within the allowed replay window.

    Args:
        timestamp: The Unix timestamp string from the X-Signature-Timestamp header.

    Returns:
        True if the timestamp is within 5 minutes of the current time.
    """
    try:
        request_time = int(timestamp)
        return abs(time.time() - request_time) <= TIMESTAMP_TOLERANCE_SECONDS
    except ValueError:
        return False


def get_uptime() -> str:
    """Calculate and format the bot uptime since process start.

    Returns:
        A human-readable uptime string (e.g. '2h 15m 30s').
    """
    elapsed = int(time.time() - _start_time)
    hours, remainder = divmod(elapsed, 3600)
    minutes, seconds = divmod(remainder, 60)
    parts = []
    if hours:
        parts.append(f"{hours}h")
    if minutes:
        parts.append(f"{minutes}m")
    parts.append(f"{seconds}s")
    return " ".join(parts)


def format_event_date(date_str: str, is_all_day: bool = False) -> str:
    """Format an ISO datetime string into a readable date/time string.

    Args:
        date_str: ISO 8601 datetime string from Sanity.
        is_all_day: If True, only show the date without time.

    Returns:
        A formatted date string.
    """
    try:
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        if is_all_day:
            return dt.strftime("%B %d, %Y")
        return dt.strftime("%B %d, %Y at %I:%M %p UTC")
    except Exception:
        return date_str


async def send_followup(token: str, content: str = None, embeds: list = None) -> None:
    """Send a followup message to a deferred Discord interaction.

    Args:
        token: The interaction token from the original interaction payload.
        content: Optional plain text message content.
        embeds: Optional list of embed dicts to include in the followup.
    """
    url = f"https://discord.com/api/v10/webhooks/{APPLICATION_ID}/{token}"
    payload = {
        "allowed_mentions": {"parse": []},  # prevent @everyone and role pings
    }
    if content:
        payload["content"] = content
    if embeds:
        payload["embeds"] = embeds
    async with httpx.AsyncClient() as client:
        await client.post(url, json=payload)


async def handle_project_status(token: str, project_name: str) -> None:
    """Fetch project data from Sanity and send a formatted embed as a followup.

    Args:
        token: The interaction token for sending the followup.
        project_name: The project name to search for in Sanity.
    """
    project = await get_project(project_name)

    if not project:
        await send_followup(token, content=f"No project found matching **{project_name}**.")
        return

    status = project.get("status", "unknown").capitalize()
    sponsor = project.get("sponsor", {})
    sponsor_name = sponsor.get("name", "N/A") if sponsor else "N/A"
    tech_tags = project.get("technologyTags") or []
    semester = project.get("semester", "N/A")
    dataset = project.get("_dataset", "unknown")

    status_colors = {
        "active": 0x57F287,
        "completed": 0x5865F2,
        "archived": 0x99AAB5,
    }
    color = status_colors.get(project.get("status", ""), 0x5865F2)

    embed = {
        "title": project.get("title", project_name),
        "color": color,
        "fields": [
            {"name": "Status", "value": status, "inline": True},
            {"name": "Sponsor", "value": sponsor_name, "inline": True},
            {"name": "Semester", "value": semester, "inline": True},
            {"name": "Tech Stack", "value": ", ".join(tech_tags) if tech_tags else "N/A", "inline": False},
        ],
        "footer": {"text": f"Dataset: {dataset}"},
    }

    await send_followup(token, embeds=[embed])


async def handle_upcoming_events(token: str, limit: int = 5) -> None:
    """Fetch upcoming events from Sanity and send a formatted embed as a followup.

    Args:
        token: The interaction token for sending the followup.
        limit: Maximum number of events to return (max 10 per Discord embed limit).
    """
    events = await get_upcoming_events(limit)

    if not events:
        await send_followup(token, content="No upcoming events found.")
        return

    category_colors = {
        "workshop": 0xFEE75C,
        "lecture": 0x5865F2,
        "social": 0x57F287,
        "competition": 0xED4245,
        "other": 0x99AAB5,
    }

    embeds = []
    for event in events:
        category = event.get("category", "other")
        event_type = event.get("eventType", "").capitalize()
        color = category_colors.get(category, 0x99AAB5)
        is_all_day = event.get("isAllDay", False)

        date_str = format_event_date(event.get("date", ""), is_all_day)
        end_date = event.get("endDate")
        if end_date:
            date_str += f" → {format_event_date(end_date, is_all_day)}"

        fields = [
            {"name": "Date", "value": date_str, "inline": False},
            {"name": "Location", "value": event.get("location") or "TBD", "inline": True},
            {"name": "Category", "value": (category or "other").capitalize(), "inline": True},
        ]
        if event_type:
            fields.append({"name": "Type", "value": event_type, "inline": True})

        embeds.append({
            "title": event.get("title", "Untitled Event"),
            "color": color,
            "fields": fields,
        })

    await send_followup(token, embeds=embeds)


async def handle_sponsor_info(token: str, sponsor_name: str = None) -> None:
    """Fetch sponsor data from Sanity and send a formatted embed as a followup.

    Args:
        token: The interaction token for sending the followup.
        sponsor_name: The sponsor name to search for. If None, lists all sponsors.
    """
    if not sponsor_name:
        sponsors = await get_all_sponsors()
        if not sponsors:
            await send_followup(token, content="No sponsors found.")
            return
        lines = []
        for s in sponsors:
            tier = (s.get("tier") or "unknown").capitalize()
            lines.append(f"**{s.get('name')}** — {tier}")
        await send_followup(token, content="\n".join(lines))
        return

    sponsor = await get_sponsor(sponsor_name)

    if not sponsor:
        await send_followup(token, content=f"No sponsor found matching **{sponsor_name}**.")
        return

    tier = (sponsor.get("tier") or "unknown")
    tier_colors = {
        "platinum": 0xE5E4E2,
        "gold": 0xFFD700,
        "silver": 0xC0C0C0,
        "bronze": 0xCD7F32,
    }
    color = tier_colors.get(tier, 0x5865F2)

    fields = [
        {"name": "Tier", "value": tier.capitalize(), "inline": True},
        {"name": "Industry", "value": sponsor.get("industry") or "N/A", "inline": True},
        {"name": "Projects", "value": str(sponsor.get("projectCount", 0)), "inline": True},
        {"name": "Website", "value": sponsor.get("website") or "N/A", "inline": False},
    ]

    embed = {
        "title": sponsor.get("name", sponsor_name),
        "description": sponsor.get("description") or "",
        "color": color,
        "fields": fields,
        "footer": {"text": f"Dataset: {sponsor.get('_dataset', 'unknown')}"},
    }

    await send_followup(token, embeds=[embed])


app = FastAPI(
    title="Capstone Bot",
    version="0.1.0",
)


@app.get("/health", tags=["meta"])
async def health() -> dict[str, str]:
    """Return the health status of the application."""
    return {"status": "ok"}


@app.get("/", tags=["meta"])
async def root() -> dict[str, str]:
    """Return a welcome message."""
    return {"message": "Hello, world!"}


@app.post("/interactions", tags=["interactions"])
async def interactions(request: Request, background_tasks: BackgroundTasks):
    """Handle incoming Discord interactions.

    Verifies the Ed25519 signature and timestamp on every request before processing.
    Routes interactions to the appropriate handler based on type:
    - PING (type 1): Returns a PONG response for endpoint verification.
    - APPLICATION_COMMAND (type 2): Handles slash commands.
    - MESSAGE_COMPONENT (type 3): Handles button and dropdown interactions.

    Raises:
        HTTPException: 401 if signature headers are missing, invalid, or timestamp is stale.
        HTTPException: 400 if the payload is malformed or the interaction type is unknown.
    """
    signature = request.headers.get("X-Signature-Ed25519")
    timestamp = request.headers.get("X-Signature-Timestamp")
    body = await request.body()

    if not signature or not timestamp:
        raise HTTPException(status_code=401, detail="Missing signature headers")

    if not verify_timestamp(timestamp):
        raise HTTPException(status_code=401, detail="Request timestamp is stale")

    if not verify_discord_signature(PUBLIC_KEY, signature, timestamp, body):
        raise HTTPException(status_code=401, detail="Invalid request signature")

    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    try:
        interaction = Interaction(**data)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=f"Invalid interaction payload: {e}")

    if interaction.type == InteractionType.PING:
        return JSONResponse(content={"type": 1})

    if interaction.type == InteractionType.APPLICATION_COMMAND:
        command_name = interaction.data.get("name")

        if command_name == "ping":
            background_tasks.add_task(
                send_followup,
                interaction.token,
                f"Capstone Bot is online! Uptime: {get_uptime()}"
            )
            return JSONResponse(content={"type": 5})

        if command_name == "project-status":
            options = interaction.data.get("options", [])
            project_name = next(
                (opt["value"] for opt in options if opt["name"] == "project-name"),
                None
            )
            if not project_name:
                raise HTTPException(status_code=400, detail="Missing project-name option")
            background_tasks.add_task(handle_project_status, interaction.token, project_name)
            return JSONResponse(content={"type": 5})

        if command_name == "upcoming-events":
            options = interaction.data.get("options", [])
            limit = next(
                (opt["value"] for opt in options if opt["name"] == "limit"),
                5
            )
            limit = max(1, min(int(limit), 10))
            background_tasks.add_task(handle_upcoming_events, interaction.token, limit)
            return JSONResponse(content={"type": 5})

        if command_name == "sponsor-info":
            options = interaction.data.get("options", [])
            sponsor_name = next(
                (opt["value"] for opt in options if opt["name"] == "sponsor-name"),
                None
            )
            background_tasks.add_task(handle_sponsor_info, interaction.token, sponsor_name)
            return JSONResponse(content={"type": 5})

        if command_name == "hello":
            return ImmediateResponse(
                data=MessageResponseData(content="Hello from a slash command!")
            )

        raise HTTPException(status_code=400, detail=f"Unknown command: {command_name}")

    if interaction.type == InteractionType.MESSAGE_COMPONENT:
        custom_id = interaction.data.get("custom_id")
        return ImmediateResponse(
            data=MessageResponseData(content=f"You triggered component: {custom_id}")
        )

    raise HTTPException(status_code=400, detail="Unknown interaction type")