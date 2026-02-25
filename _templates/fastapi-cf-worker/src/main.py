"""Cloudflare Workers entrypoint — bridges HTTP requests and cron triggers to FastAPI.

Cloudflare Workers are serverless functions that run on Cloudflare's global
edge network (300+ cities). Instead of running on a single server, your code
runs in the data center closest to each user.

Python Workers run inside **Pyodide** — a WebAssembly build of CPython that
executes inside Cloudflare's V8 JavaScript engine. This means standard Python
works, but some modules (like ``workers`` and ``asgi`` imported below) only
exist inside this Pyodide runtime and cannot be imported by regular Python
(e.g., during ``pytest`` runs).

Architecture (request flow)::

    User request
        → Cloudflare edge (nearest data center)
        → Default.fetch()           [this file — Workers entrypoint]
        → asgi.fetch(app, request)  [bridges Workers request → ASGI scope]
        → FastAPI app               [app.py — standard Python, fully testable]
        → Your route handler        [routers/*.py]

Architecture (cron flow)::

    Cron schedule fires (UTC)
        → Cloudflare edge
        → Default.scheduled()       [this file — bypasses FastAPI entirely]
        → Your cron handler logic

Key constraints of the Workers runtime:
    - 128 MB memory limit — paginate large datasets, never load everything.
    - ~1 second cold start — first request after idle spins up the isolate.
    - No persistent connections — create a new ``httpx.AsyncClient`` per request.
    - Global mutable state leaks across requests (isolates are reused).

Note:
    This file CANNOT be imported by standard Python (pytest, local scripts).
    Tests import from ``app.py`` instead, which has zero Workers-specific
    imports. See ``tests/conftest.py`` for how mocking works.
"""

from workers import WorkerEntrypoint
import asgi

from app import app


class Default(WorkerEntrypoint):
    """Cloudflare Workers entrypoint class.

    Cloudflare's runtime looks for a class named ``Default`` that extends
    ``WorkerEntrypoint``. It calls specific methods on this class depending
    on what triggered the Worker:

    - ``fetch()`` — called for every HTTP request (GET, POST, etc.).
    - ``scheduled()`` — called by cron triggers (time-based schedules).

    The class name ``Default`` is a convention from the Cloudflare Python
    Workers SDK (as of Aug 2025). The ``main`` field in ``wrangler.jsonc``
    points to this file, and the runtime finds the ``Default`` class
    automatically.

    Attributes:
        env: A JavaScript proxy object provided by the Workers runtime.
            Contains all **bindings** (KV, D1, AI) and **secrets/env vars**
            configured in ``wrangler.jsonc`` and ``wrangler secret put``.
            Accessed as ``self.env.KV``, ``self.env.API_KEY``, etc.
    """

    async def fetch(self, request):
        """Bridge an incoming HTTP request to the FastAPI ASGI application.

        This is the main entry point for all HTTP traffic. The Workers runtime
        calls this method with a JavaScript ``Request`` object. We pass it to
        ``asgi.fetch()`` which:

        1. Converts the JS Request into a Python ASGI scope dict.
        2. Injects ``self.env`` into ``scope["env"]`` so FastAPI routes can
           access Cloudflare bindings via ``request.scope["env"]``.
        3. Runs the FastAPI app and returns the response to the client.

        Args:
            request: A Cloudflare Workers ``Request`` object (JavaScript).
                This is NOT a Python ``requests.Request`` or FastAPI ``Request``
                — it's a JS object that ``asgi.fetch()`` translates for us.

        Returns:
            A Workers ``Response`` object sent back to the client.
        """
        return await asgi.fetch(app, request, self.env)

    async def scheduled(self, event, env, ctx):
        """Handle cron trigger events (scheduled tasks).

        Cloudflare calls this method based on cron patterns defined in
        ``wrangler.jsonc`` under ``triggers.crons``. This runs completely
        outside of FastAPI — there is no HTTP request or response involved.

        All cron times are **UTC**. For example:
            ``"0 14 * * 1"`` = Monday 14:00 UTC = 9:00 AM US Eastern (EST).

        Args:
            event: A cron event object with a ``.cron`` attribute containing
                the matching cron expression string (e.g., ``"0 14 * * 1"``).
                Use this to dispatch to different handlers.
            env: The same bindings proxy as ``self.env``. Provides access to
                KV, D1, AI, secrets, and env vars. Both ``env`` and
                ``self.env`` work identically here.
            ctx: Execution context. Use ``ctx.wait_until(coroutine)`` to run
                background work that continues after this method returns.
                Useful for fire-and-forget tasks like logging or analytics.

        Example:
            To test cron triggers locally::

                uv run pywrangler dev --test-scheduled
                curl "http://localhost:8787/cdn-cgi/handler/scheduled?cron=*+*+*+*+*"

            Note: Python Workers use ``/cdn-cgi/handler/scheduled``, NOT
            ``/__scheduled`` (which is for JavaScript Workers only).
        """
        cron = event.cron
        # Route to the right handler based on cron pattern.
        # Uncomment and customize for your worker:
        # if cron == "*/5 * * * *":
        #     await self._five_minute_check()
        # elif cron == "0 14 * * 1":
        #     await self._weekly_digest()
        print(f"Cron trigger fired: {cron}")

    # async def _five_minute_check(self):
    #     """Example: periodic health check or data sync."""
    #     pass

    # async def _weekly_digest(self):
    #     """Example: weekly summary email or Discord message."""
    #     pass
