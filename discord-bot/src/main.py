import asyncio
import os

from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI

from Bot import client as discord_client

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the Discord bot in the background when FastAPI starts
    token = os.getenv("DISCORD_TOKEN")
    if not token:
        raise RuntimeError("DISCORD_TOKEN is not set.")
    task = asyncio.create_task(discord_client.start(token))
    yield
    # Shut down the Discord bot when FastAPI shuts down
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

