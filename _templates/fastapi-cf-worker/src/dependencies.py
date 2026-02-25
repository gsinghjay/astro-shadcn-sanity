"""
Reusable FastAPI dependencies for Cloudflare Workers.

All dependencies that need configuration go through WorkerSettings —
the single source of truth for env vars, secrets, and bindings.

Usage in route handlers:
    from dependencies import get_settings, verify_api_key, get_kv

    @router.get("/my-route")
    async def my_route(settings=Depends(get_settings)):
        val = await settings.kv.get("some-key")
        return {"value": val, "env": settings.environment}

    @router.get("/protected")
    async def protected(_=Depends(verify_api_key)):
        return {"message": "You have access"}

IMPORTANT: All dependencies that touch request.scope must be async.
FastAPI runs sync dependencies in a thread pool, which cannot access
the JS-backed scope in the Workers Pyodide runtime.
"""

from fastapi import Request, HTTPException, Depends

from models.settings import WorkerSettings


async def get_env(request: Request):
    """Extract the raw Cloudflare env proxy from ASGI scope.

    Prefer get_settings() for typed access. Use this only when you
    need the raw proxy (e.g., accessing a binding not yet in WorkerSettings).
    """
    return request.scope["env"]


async def get_settings(request: Request) -> WorkerSettings:
    """Extract and validate all env vars, secrets, and bindings into a typed model.

    This is the primary dependency for route handlers. It reads the raw
    Workers env proxy once and returns a validated Pydantic model.
    """
    env = request.scope["env"]
    return WorkerSettings.from_worker_env(env)


async def verify_api_key(
    request: Request,
    settings: WorkerSettings = Depends(get_settings),
):
    """Validate the X-API-Key header against the API_KEY secret.

    Use as a dependency on protected routes:
        @router.get("/admin", dependencies=[Depends(verify_api_key)])
    """
    if not settings.api_key:
        raise HTTPException(status_code=503, detail="API key not configured")

    key = request.headers.get("X-API-Key")
    if not key or key != settings.api_key:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return key


async def get_kv(settings: WorkerSettings = Depends(get_settings)):
    """Provides the KV namespace binding for dependency injection."""
    if settings.kv is None:
        raise HTTPException(status_code=503, detail="KV namespace not configured")
    return settings.kv


async def get_db(settings: WorkerSettings = Depends(get_settings)):
    """Provides the D1 database binding for dependency injection."""
    if settings.db is None:
        raise HTTPException(status_code=503, detail="D1 database not configured")
    return settings.db
