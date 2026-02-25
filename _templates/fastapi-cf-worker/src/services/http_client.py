"""Safe ``httpx`` wrapper for making external HTTP calls from Workers.

Cloudflare Workers have specific constraints around HTTP connections that
differ from a traditional Python application:

1. **No persistent connections.** Workers isolates are short-lived and
   share-nothing. You MUST create a new ``httpx.AsyncClient`` for every
   request. Never store a client in a module-level global — it will
   either fail on the next request or leak state across requests.

2. **HTTP/2 must be disabled.** Setting ``http2=True`` on httpx causes
   intermittent connection errors in the Workers runtime because the
   underlying ``h2`` library doesn't fully support the Pyodide/WASM
   network stack. Always use ``http2=False``.

3. **Reasonable timeouts.** Workers have a 30-second CPU time limit per
   request. A 10-second HTTP timeout is a safe default that leaves room
   for your own processing logic.

This wrapper sets all of these safe defaults so you don't have to remember
them every time you make an HTTP call.

Usage::

    from services.http_client import http_get, http_post, get_client

    # Simple GET (returns parsed JSON):
    data = await http_get("https://api.example.com/items")

    # Simple POST (returns parsed JSON):
    result = await http_post("https://api.example.com/items", json={"name": "foo"})

    # Custom request (full httpx control):
    async with get_client() as client:
        response = await client.patch(url, json=payload, headers=headers)
"""

from contextlib import asynccontextmanager

import httpx
from fastapi import HTTPException


# Default timeout for all requests (seconds).
# Workers have a 30s CPU limit; 10s leaves room for your own logic.
DEFAULT_TIMEOUT = 10.0


@asynccontextmanager
async def get_client(**kwargs):
    """Create a fresh ``httpx.AsyncClient`` with Workers-safe defaults.

    This is an async context manager that ensures the client is properly
    closed after use. Every call creates a **new** client instance — this
    is required because Workers don't support persistent connections.

    Args:
        **kwargs: Additional keyword arguments passed to
            ``httpx.AsyncClient()``. You can override ``timeout`` here.
            The ``http2`` flag is always forced to ``False``.

    Yields:
        An ``httpx.AsyncClient`` instance ready for use.

    Example::

        async with get_client() as client:
            response = await client.get("https://example.com")
            data = response.json()
    """
    async with httpx.AsyncClient(
        http2=False,  # REQUIRED — http2 causes issues in Workers runtime
        timeout=kwargs.pop("timeout", DEFAULT_TIMEOUT),
        **kwargs,
    ) as client:
        yield client


def raise_for_status(response: httpx.Response):
    """Convert an HTTP error response into a FastAPI ``HTTPException``.

    Call this after every HTTP request to ensure errors from upstream
    APIs are translated into proper FastAPI error responses. Without
    this, a 404 from an upstream API would appear as a 200 to your
    caller (because the HTTP call itself succeeded).

    Args:
        response: The httpx response to check.

    Raises:
        HTTPException: If the response status code indicates an error
            (4xx or 5xx). The exception includes the upstream status
            code and a generic error message (no raw response body
            is leaked to the caller).
    """
    if response.is_error:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Upstream API error: {response.status_code} {response.reason_phrase}",
        )


async def http_get(url: str, **kwargs):
    """Make a GET request and return the parsed JSON response.

    Creates a fresh ``httpx.AsyncClient``, sends the request, checks for
    HTTP errors, and returns the parsed JSON body. Suitable for simple
    read operations against external APIs.

    Args:
        url: The URL to request.
        **kwargs: Additional keyword arguments passed to
            ``client.get()`` (e.g., ``headers``, ``params``).

    Returns:
        The parsed JSON response body (could be a dict, list, or scalar
        depending on the API).

    Raises:
        HTTPException: If the upstream API returns an error status code.
    """
    async with get_client() as client:
        response = await client.get(url, **kwargs)
        raise_for_status(response)
        return response.json()


async def http_post(url: str, **kwargs):
    """Make a POST request and return the parsed JSON response.

    Creates a fresh ``httpx.AsyncClient``, sends the request, checks for
    HTTP errors, and returns the parsed JSON body. Suitable for creating
    resources or triggering actions on external APIs.

    Args:
        url: The URL to request.
        **kwargs: Additional keyword arguments passed to
            ``client.post()`` (e.g., ``json``, ``headers``, ``data``).

    Returns:
        The parsed JSON response body (could be a dict, list, or scalar
        depending on the API).

    Raises:
        HTTPException: If the upstream API returns an error status code.
    """
    async with get_client() as client:
        response = await client.post(url, **kwargs)
        raise_for_status(response)
        return response.json()
