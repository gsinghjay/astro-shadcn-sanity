import json
import logging
import os
from datetime import datetime

from fastapi import FastAPI, HTTPException, Request
from workers import WorkerEntrypoint

from sanity import get_all_sponsors, get_project, get_sponsor, get_upcoming_events

PING = 1
APPLICATION_COMMAND = 2
MESSAGE_COMPONENT = 3
PONG = 1
CHANNEL_MESSAGE_WITH_SOURCE = 4
TIMESTAMP_TOLERANCE_SECONDS = 300
logger = logging.getLogger(__name__)


class Default(WorkerEntrypoint):
    async def fetch(self, request, env, ctx):
        import asgi
        return await asgi.fetch(app, request, self.env)


app = FastAPI()


def get_env_value(request: Request, name: str) -> str | None:
    env = request.scope.get("env")
    if env is not None:
        value = getattr(env, name, None)
        if value:
            return value
    return os.getenv(name)


def get_worker_env(request: Request):
    return request.scope.get("env")


def verify_timestamp(timestamp: str) -> bool:
    try:
        request_time = int(timestamp)
        import time
        return abs(time.time() - request_time) <= TIMESTAMP_TOLERANCE_SECONDS
    except ValueError:
        return False


async def verify_discord_signature(
    public_key_hex: str,
    signature_hex: str,
    timestamp: str,
    body: bytes,
) -> bool:
    try:
        from js import Object, Uint8Array, crypto
        from pyodide.ffi import to_js

        key_bytes = list(bytes.fromhex(public_key_hex))
        signature_bytes = list(bytes.fromhex(signature_hex))
        message_bytes = list(timestamp.encode() + body)

        public_key = await crypto.subtle.importKey(
            "raw",
            Uint8Array.new(to_js(key_bytes)),
            to_js({"name": "Ed25519"}, dict_converter=Object.fromEntries),
            False,
            to_js(["verify"]),
        )
        return bool(
            await crypto.subtle.verify(
                "Ed25519",
                public_key,
                Uint8Array.new(to_js(signature_bytes)),
                Uint8Array.new(to_js(message_bytes)),
            )
        )
    except Exception:
        return False


def format_event_date(date_str: str, is_all_day: bool = False) -> str:
    try:
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        if is_all_day:
            return dt.strftime("%B %d, %Y")
        return dt.strftime("%B %d, %Y at %I:%M %p UTC")
    except Exception:
        return date_str


async def post_json(url: str, payload: dict) -> None:
    from js import Object, fetch
    from pyodide.ffi import to_js

    response = await fetch(
        url,
        to_js(
            {
                "method": "POST",
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps(payload),
            },
            dict_converter=Object.fromEntries,
        ),
    )
    if not response.ok:
        raise RuntimeError(f"Request failed with status {response.status}")


async def build_project_status_response(project_name: str, env=None) -> dict:
    project = await get_project(project_name, env=env)

    if not project:
        return {
            "type": CHANNEL_MESSAGE_WITH_SOURCE,
            "data": {"content": f"No project found matching **{project_name}**."},
        }

    status = str(project.get("status", "unknown")).capitalize()
    sponsor = project.get("sponsor", {})
    sponsor_name = sponsor.get("name", "N/A") if sponsor else "N/A"
    tech_tags = project.get("technologyTags") or []

    status_colors = {
        "active": 0x57F287,
        "completed": 0x5865F2,
        "archived": 0x99AAB5,
    }

    embed = {
        "title": project.get("title", project_name),
        "color": status_colors.get(project.get("status", ""), 0x5865F2),
        "fields": [
            {"name": "Status", "value": status, "inline": True},
            {"name": "Sponsor", "value": sponsor_name, "inline": True},
            {"name": "Semester", "value": project.get("semester", "N/A"), "inline": True},
            {
                "name": "Tech Stack",
                "value": ", ".join(tech_tags) if tech_tags else "N/A",
                "inline": False,
            },
        ],
        "footer": {"text": f"Dataset: {project.get('_dataset', 'unknown')}"},
    }

    return {
        "type": CHANNEL_MESSAGE_WITH_SOURCE,
        "data": {"embeds": [embed]},
    }


async def build_upcoming_events_response(limit: int = 5, env=None) -> dict:
    events = await get_upcoming_events(limit, env=env)

    if not events:
        return {
            "type": CHANNEL_MESSAGE_WITH_SOURCE,
            "data": {"content": "No upcoming events found."},
        }

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
        event_type = str(event.get("eventType", "")).capitalize()
        is_all_day = bool(event.get("isAllDay", False))

        date_str = format_event_date(event.get("date", ""), is_all_day)
        end_date = event.get("endDate")
        if end_date:
            date_str += f" -> {format_event_date(end_date, is_all_day)}"

        fields = [
            {"name": "Date", "value": date_str, "inline": False},
            {"name": "Location", "value": event.get("location") or "TBD", "inline": True},
            {"name": "Category", "value": str(category).capitalize(), "inline": True},
        ]
        if event_type:
            fields.append({"name": "Type", "value": event_type, "inline": True})

        embeds.append(
            {
                "title": event.get("title", "Untitled Event"),
                "color": category_colors.get(category, 0x99AAB5),
                "fields": fields,
            }
        )

    return {
        "type": CHANNEL_MESSAGE_WITH_SOURCE,
        "data": {"embeds": embeds},
    }


async def build_sponsor_info_response(sponsor_name: str | None = None, env=None) -> dict:
    if not sponsor_name:
        sponsors = await get_all_sponsors(env=env)
        if not sponsors:
            return {
                "type": CHANNEL_MESSAGE_WITH_SOURCE,
                "data": {"content": "No sponsors found."},
            }

        lines = []
        for sponsor in sponsors:
            tier = str(sponsor.get("tier") or "unknown").capitalize()
            lines.append(f"**{sponsor.get('name', 'Unknown')}** - {tier}")
        return {
            "type": CHANNEL_MESSAGE_WITH_SOURCE,
            "data": {"content": "\n".join(lines)},
        }

    sponsor = await get_sponsor(sponsor_name, env=env)
    if not sponsor:
        return {
            "type": CHANNEL_MESSAGE_WITH_SOURCE,
            "data": {"content": f"No sponsor found matching **{sponsor_name}**."},
        }

    tier = str(sponsor.get("tier") or "unknown")
    tier_colors = {
        "platinum": 0xE5E4E2,
        "gold": 0xFFD700,
        "silver": 0xC0C0C0,
        "bronze": 0xCD7F32,
    }

    embed = {
        "title": sponsor.get("name", sponsor_name),
        "description": sponsor.get("description") or "",
        "color": tier_colors.get(tier, 0x5865F2),
        "fields": [
            {"name": "Tier", "value": tier.capitalize(), "inline": True},
            {"name": "Industry", "value": sponsor.get("industry") or "N/A", "inline": True},
            {"name": "Projects", "value": str(sponsor.get("projectCount", 0)), "inline": True},
            {"name": "Website", "value": sponsor.get("website") or "N/A", "inline": False},
        ],
        "footer": {"text": f"Dataset: {sponsor.get('_dataset', 'unknown')}"},
    }

    return {
        "type": CHANNEL_MESSAGE_WITH_SOURCE,
        "data": {"embeds": [embed]},
    }


@app.get("/")
async def root():
    return {"message": "Hello, world!"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/interactions")
async def interactions(request: Request):
    worker_env = get_worker_env(request)
    signature = request.headers.get("X-Signature-Ed25519")
    timestamp = request.headers.get("X-Signature-Timestamp")
    public_key = get_env_value(request, "DISCORD_PUBLIC_KEY")
    application_id = get_env_value(request, "DISCORD_APPLICATION_ID")
    body = await request.body()

    if not signature or not timestamp:
        raise HTTPException(status_code=401, detail="Missing signature headers")
    if not public_key or not application_id:
        raise HTTPException(status_code=500, detail="Missing Discord configuration")
    if not verify_timestamp(timestamp):
        raise HTTPException(status_code=401, detail="Request timestamp is stale")
    if not await verify_discord_signature(public_key, signature, timestamp, body):
        raise HTTPException(status_code=401, detail="Invalid request signature")

    try:
        interaction = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    interaction_type = interaction.get("type")
    if interaction_type == PING:
        return {"type": PONG}

    if interaction_type == APPLICATION_COMMAND:
        data = interaction.get("data") or {}
        command_name = data.get("name")
        options = data.get("options") or []

        if command_name == "ping":
            from datetime import timezone, timedelta
            edt = timezone(timedelta(hours=-4))
            now = datetime.now(edt).strftime("%B %d, %Y at %I:%M %p EDT")
            return {
                "type": CHANNEL_MESSAGE_WITH_SOURCE,
                "data": {"content": f"Capstone Bot is online! 🟢 {now}"},
            }

        if command_name == "project-status":
            project_name = next(
                (opt.get("value") for opt in options if opt.get("name") == "project-name"), None
            )
            if not project_name:
                raise HTTPException(status_code=400, detail="Missing project-name option")
            return await build_project_status_response(str(project_name), env=worker_env)

        if command_name == "upcoming-events":
            limit = next(
                (opt.get("value") for opt in options if opt.get("name") == "limit"), 5
            )
            try:
                limit = max(1, min(int(limit), 10))
            except (TypeError, ValueError):
                limit = 5
            return await build_upcoming_events_response(limit, env=worker_env)

        if command_name == "sponsor-info":
            sponsor_name = next(
                (opt.get("value") for opt in options if opt.get("name") == "sponsor-name"), None
            )
            return await build_sponsor_info_response(
                str(sponsor_name) if sponsor_name else None,
                env=worker_env,
            )

        raise HTTPException(status_code=400, detail=f"Unknown command: {command_name}")

    if interaction_type == MESSAGE_COMPONENT:
        custom_id = (interaction.get("data") or {}).get("custom_id")
        return {
            "type": CHANNEL_MESSAGE_WITH_SOURCE,
            "data": {"content": f"You triggered component: {custom_id}"},
        }

    raise HTTPException(status_code=400, detail="Unknown interaction type")