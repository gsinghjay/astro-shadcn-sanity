import asyncio
import json
import os
import subprocess

from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

from Bot import client as discord_client
from models import (
    Interaction,
    InteractionType,
    ImmediateResponse,
    MessageResponseData,
)

load_dotenv()

PUBLIC_KEY = os.getenv("DISCORD_PUBLIC_KEY")
VERIFY_SCRIPT = os.path.join(os.path.dirname(__file__), "verify.mjs")


async def verify_discord_signature(public_key: str, signature: str, timestamp: str, body: bytes) -> bool:
    """Verify a Discord Ed25519 signature using the Web Crypto API via Node.js FFI.

    Calls verify.mjs as a subprocess, which uses crypto.subtle to verify the
    signature. Returns True if the signature is valid, False otherwise.

    Args:
        public_key: The Discord application's public key as a hex string.
        signature: The Ed25519 signature from the X-Signature-Ed25519 header.
        timestamp: The request timestamp from the X-Signature-Timestamp header.
        body: The raw request body bytes.

    Returns:
        True if the signature is valid, False otherwise.
    """
    try:
        result = await asyncio.to_thread(
            subprocess.run,
            ["node", VERIFY_SCRIPT, public_key, signature, timestamp, body.decode()],
            capture_output=True,
        )
        return result.returncode == 0
    except Exception as e:
        print(f"Signature verification error: {e}")
        return False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage the lifecycle of the FastAPI app and Discord bot.

    Starts the Discord bot as a background asyncio task when the app starts,
    and shuts it down cleanly when the app stops.
    """
    token = os.getenv("DISCORD_TOKEN")
    if not token:
        raise RuntimeError("DISCORD_TOKEN is not set.")
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
async def interactions(request: Request):
    """Handle incoming Discord interactions.

    Verifies the Ed25519 signature on every request before processing.
    Routes interactions to the appropriate handler based on type:
    - PING (type 1): Returns a PONG response for endpoint verification.
    - APPLICATION_COMMAND (type 2): Handles slash commands.
    - MESSAGE_COMPONENT (type 3): Handles button and dropdown interactions.

    Raises:
        HTTPException: 401 if signature headers are missing or invalid.
        HTTPException: 400 if the interaction type or command is unknown.
    """
    signature = request.headers.get("X-Signature-Ed25519")
    timestamp = request.headers.get("X-Signature-Timestamp")
    body = await request.body()

    if not signature or not timestamp:
        raise HTTPException(status_code=401, detail="Missing signature headers")

    if not await verify_discord_signature(PUBLIC_KEY, signature, timestamp, body):
        raise HTTPException(status_code=401, detail="Invalid request signature")

    data = json.loads(body)
    interaction = Interaction(**data)

    if interaction.type == InteractionType.PING:
        return JSONResponse(content={"type": 1})

    if interaction.type == InteractionType.APPLICATION_COMMAND:
        command_name = interaction.data.get("name")
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
