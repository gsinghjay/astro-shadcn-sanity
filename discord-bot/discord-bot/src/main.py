import asyncio
import binascii
import json
import os
import time

from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError
import httpx
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from cryptography.exceptions import InvalidSignature

from Bot import client as discord_client
from models import (
    Interaction,
    InteractionType,
    ImmediateResponse,
    MessageResponseData,
    DeferredResponse,
)

load_dotenv()

PUBLIC_KEY = os.getenv("DISCORD_PUBLIC_KEY")
APPLICATION_ID = os.getenv("DISCORD_APPLICATION_ID")
BOT_TOKEN = os.getenv("DISCORD_TOKEN")
TIMESTAMP_TOLERANCE_SECONDS = 300
START_TIME = time.time()


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
    """Calculate and format the bot uptime since server start.

    Returns:
        A human-readable uptime string (e.g. '2h 15m 30s').
    """
    elapsed = int(time.time() - START_TIME)
    hours, remainder = divmod(elapsed, 3600)
    minutes, seconds = divmod(remainder, 60)
    parts = []
    if hours:
        parts.append(f"{hours}h")
    if minutes:
        parts.append(f"{minutes}m")
    parts.append(f"{seconds}s")
    return " ".join(parts)


async def send_followup(token: str, content: str) -> None:
    """Send a followup message to a deferred Discord interaction.

    Args:
        token: The interaction token from the original interaction payload.
        content: The message content to send as a followup.
    """
    url = f"https://discord.com/api/v10/webhooks/{APPLICATION_ID}/{token}"
    async with httpx.AsyncClient() as client:
        await client.post(url, json={"content": content})


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage the lifecycle of the FastAPI app and Discord bot.

    Starts the Discord bot as a background asyncio task when the app starts,
    and shuts it down cleanly when the app stops.
    """
    token = os.getenv("DISCORD_TOKEN")
    if not token:
        raise RuntimeError("DISCORD_TOKEN is not set.")
    if not PUBLIC_KEY:
        raise RuntimeError("DISCORD_PUBLIC_KEY is not set.")
    task = asyncio.create_task(discord_client.start(token))
    yield
    await discord_client.close()
    task.cancel()


app = FastAPI(
    title="My FastAPI App",
    version="0.1.0",
    lifespan=lifespan,
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