"""Reusable FastAPI dependencies for accessing Cloudflare Workers bindings.

In Cloudflare Workers, all external services (KV storage, D1 databases,
Workers AI, secrets, environment variables) are accessed through an ``env``
object that the runtime injects into each request. Rather than reading
``request.scope["env"]`` directly in every route handler, this module
provides typed ``Depends()`` functions that extract, validate, and cache
the configuration.

What are "bindings"?
    Bindings are the connections between your Worker code and Cloudflare
    services. You declare them in ``wrangler.jsonc`` (e.g., "I need a KV
    store called KV"), and at runtime Cloudflare makes them available as
    properties on the ``env`` object (e.g., ``env.KV``).

    Think of it like dependency injection: you declare what you need in
    config, and the runtime provides it at request time.

Why must all dependencies be ``async``?
    FastAPI runs synchronous dependencies in a **thread pool**. Inside the
    Workers Pyodide runtime, the thread pool **cannot** access the
    JavaScript-backed ``request.scope`` — it causes silent 500 errors from
    the ``workerd`` layer that FastAPI's own error handlers never see.
    Making every dependency ``async`` ensures it runs on the main event
    loop where the JS scope is accessible.

Usage in route handlers::

    from dependencies import get_settings, verify_api_key, get_kv

    @router.get("/my-route")
    async def my_route(settings=Depends(get_settings)):
        val = await settings.kv.get("some-key")
        return {"value": val, "env": settings.environment}

    @router.get("/protected")
    async def protected(_=Depends(verify_api_key)):
        return {"message": "You have access"}
"""

import hmac

from fastapi import Request, HTTPException, Depends

from models.settings import WorkerSettings


async def get_env(request: Request):
    """Extract the raw Cloudflare env proxy from the ASGI request scope.

    When ``main.py`` calls ``asgi.fetch(app, request, self.env)``, the
    ``self.env`` object gets injected into the ASGI scope as
    ``request.scope["env"]``. This function retrieves that raw proxy.

    In most cases, prefer ``get_settings()`` instead — it wraps the raw
    proxy in a validated Pydantic model with typed fields. Use this only
    when you need to access a binding that hasn't been added to
    ``WorkerSettings`` yet.

    Args:
        request: The incoming FastAPI request.

    Returns:
        The raw Cloudflare ``env`` JavaScript proxy object. Access
        bindings as attributes: ``env.KV``, ``env.DB``, ``env.API_KEY``.
    """
    return request.scope["env"]


async def get_settings(request: Request) -> WorkerSettings:
    """Extract and validate all configuration into a typed Pydantic model.

    This is the **primary dependency** for route handlers. It reads every
    env var, secret, and binding from the Cloudflare ``env`` proxy and
    packages them into a ``WorkerSettings`` instance with proper types.

    The result is cached on ``request.state`` so that if multiple
    dependencies in the same request call ``Depends(get_settings)``, the
    env proxy is only read once.

    Args:
        request: The incoming FastAPI request. Must have
            ``scope["env"]`` set by the Workers ASGI bridge.

    Returns:
        A ``WorkerSettings`` instance with typed access to all
        configuration. For example: ``settings.api_key``,
        ``settings.kv``, ``settings.environment``.

    Example::

        @router.get("/example")
        async def example(settings: WorkerSettings = Depends(get_settings)):
            env_name = settings.environment  # str
            kv_val = await settings.kv.get("my-key")  # KV read
    """
    if not hasattr(request.state, "worker_settings"):
        env = request.scope["env"]
        request.state.worker_settings = WorkerSettings.from_worker_env(env)
    return request.state.worker_settings


async def verify_api_key(
    request: Request,
    settings: WorkerSettings = Depends(get_settings),
):
    """Validate the ``X-API-Key`` header against the configured API_KEY secret.

    Use this as a dependency on routes that require authentication::

        @router.get("/admin", dependencies=[Depends(verify_api_key)])
        async def admin_endpoint():
            ...

    The comparison uses ``hmac.compare_digest()`` for constant-time string
    comparison, which prevents **timing attacks** — an attacker cannot
    guess the key character-by-character by measuring response times.

    Args:
        request: The incoming FastAPI request (reads ``X-API-Key`` header).
        settings: Auto-injected via ``Depends(get_settings)``.

    Returns:
        The validated API key string (if you need it downstream).

    Raises:
        HTTPException(503): If ``API_KEY`` secret is not configured.
        HTTPException(401): If the header is missing or doesn't match.
    """
    if not settings.api_key:
        raise HTTPException(status_code=503, detail="API key not configured")

    key = request.headers.get("X-API-Key")
    if not key or not hmac.compare_digest(key, settings.api_key):
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return key


async def get_kv(settings: WorkerSettings = Depends(get_settings)):
    """Provide the Cloudflare KV namespace binding.

    **KV** (Key-Value) is Cloudflare's global, low-latency key-value store.
    It's ideal for caching, feature flags, rate-limit counters, and
    configuration data. Values can be up to 25 MiB each.

    The binding is declared in ``wrangler.jsonc`` under ``kv_namespaces``
    and appears as ``env.KV`` at runtime.

    Args:
        settings: Auto-injected via ``Depends(get_settings)``.

    Returns:
        The KV namespace proxy object. Use it with:
        ``await kv.get("key")``, ``await kv.put("key", "value")``,
        ``await kv.delete("key")``, ``await kv.list()``.

    Raises:
        HTTPException(503): If the KV binding is not configured in
            ``wrangler.jsonc``.
    """
    if settings.kv is None:
        raise HTTPException(status_code=503, detail="KV namespace not configured")
    return settings.kv


async def get_db(settings: WorkerSettings = Depends(get_settings)):
    """Provide the Cloudflare D1 database binding.

    **D1** is Cloudflare's serverless SQLite database. It runs at the edge
    alongside your Worker, giving you SQL queries with sub-millisecond
    latency for reads. It supports standard SQLite syntax.

    The binding is declared in ``wrangler.jsonc`` under ``d1_databases``
    and appears as ``env.DB`` at runtime.

    Args:
        settings: Auto-injected via ``Depends(get_settings)``.

    Returns:
        The D1 database proxy object. Use it with:
        ``await db.prepare("SELECT * FROM users WHERE id = ?").bind(42).all()``.

    Raises:
        HTTPException(503): If the D1 binding is not configured in
            ``wrangler.jsonc``.
    """
    if settings.db is None:
        raise HTTPException(status_code=503, detail="D1 database not configured")
    return settings.db
