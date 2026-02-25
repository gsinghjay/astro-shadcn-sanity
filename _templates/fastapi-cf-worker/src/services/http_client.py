"""
httpx wrapper for making external HTTP calls from Workers.

Why a wrapper?
  - Workers don't support persistent connections — you MUST create a new
    httpx.AsyncClient for every request. Never store one in a global.
  - http2 must be disabled (http2=False) to avoid intermittent connection
    errors in the Workers runtime.
  - This wrapper sets safe defaults so you don't have to remember them.

Usage:
    from services.http_client import http_get, http_post

    data = await http_get("https://api.example.com/items")
    result = await http_post("https://api.example.com/items", json={"name": "foo"})
"""

from contextlib import asynccontextmanager

import httpx
from fastapi import HTTPException


# Default timeout for all requests (seconds)
DEFAULT_TIMEOUT = 10.0


@asynccontextmanager
async def get_client(**kwargs):
    """
    Async context manager that creates a fresh httpx.AsyncClient.

    Usage:
        async with get_client() as client:
            response = await client.get("https://example.com")
    """
    async with httpx.AsyncClient(
        http2=False,  # REQUIRED — http2 causes issues in Workers runtime
        timeout=kwargs.pop("timeout", DEFAULT_TIMEOUT),
        **kwargs,
    ) as client:
        yield client


def raise_for_status(response: httpx.Response):
    """Convert an httpx error response into a FastAPI HTTPException."""
    if response.is_error:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Upstream API error: {response.status_code} {response.reason_phrase}",
        )


async def http_get(url: str, **kwargs):
    """
    Make a GET request and return the parsed JSON response.

    Raises HTTPException on error status codes.
    """
    async with get_client() as client:
        response = await client.get(url, **kwargs)
        raise_for_status(response)
        return response.json()


async def http_post(url: str, **kwargs):
    """
    Make a POST request and return the parsed JSON response.

    Raises HTTPException on error status codes.
    """
    async with get_client() as client:
        response = await client.post(url, **kwargs)
        raise_for_status(response)
        return response.json()
