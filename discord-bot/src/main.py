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
    return {"status": "ok"}


@app.get("/", tags=["meta"])
async def root() -> dict[str, str]:
    return {"message": "Hello, world!"}


@app.post("/interactions", tags=["interactions"])
async def interactions(request: Request):
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
