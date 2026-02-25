"""
Cloudflare Workers entrypoint — bridges HTTP requests and cron triggers to FastAPI.

How it works:
  1. Cloudflare receives an HTTP request and calls Default.fetch()
  2. asgi.fetch() bridges the Workers request into an ASGI scope for FastAPI
  3. self.env is injected into the ASGI scope so routes can access bindings
  4. Cron Triggers call Default.scheduled() — completely separate from FastAPI

Key rules:
  - Access bindings in routes via request.scope["env"] (see dependencies.py)
  - Create a NEW httpx.AsyncClient per request — no persistent connections
  - Set http2=False on httpx clients (avoids Workers connection issues)
  - 128 MB memory limit — don't load large datasets, paginate and stream

NOTE: This file imports `workers` and `asgi`, which are only available inside
the Cloudflare Workers Pyodide runtime. For tests, import `app` from app.py
instead — it has no Workers-specific dependencies.
"""

from workers import WorkerEntrypoint
import asgi

from app import app


# ---------------------------------------------------------------------------
# Cloudflare Workers entrypoint
# ---------------------------------------------------------------------------
class Default(WorkerEntrypoint):
    """
    The Workers runtime calls methods on this class:
      - fetch()     → for every HTTP request
      - scheduled() → for cron triggers
    """

    async def fetch(self, request):
        """
        Bridge every HTTP request to the FastAPI ASGI app.

        self.env contains all bindings (KV, D1, AI, secrets, vars).
        asgi.fetch() injects it into request.scope["env"] so FastAPI
        routes can access it via Depends(get_env).
        """
        return await asgi.fetch(app, request, self.env)

    async def scheduled(self, event, env, ctx):
        """
        Handle cron triggers. Dispatches by cron pattern.

        Args:
            event: has .cron (the matching cron expression string)
            env:   same as self.env — all bindings and secrets
            ctx:   execution context (use ctx.wait_until() for background work)

        Configure cron patterns in wrangler.jsonc under triggers.crons.
        Test locally:
            uv run pywrangler dev --test-scheduled
            curl "http://localhost:8787/cdn-cgi/handler/scheduled?cron=*+*+*+*+*"
        """
        cron = event.cron
        # Route to the right handler based on cron pattern
        # if cron == "*/5 * * * *":
        #     await self._five_minute_check()
        # elif cron == "0 14 * * 1":
        #     await self._weekly_digest()
        print(f"Cron trigger fired: {cron}")

    # async def _five_minute_check(self):
    #     """Example: periodic health check or sync."""
    #     pass

    # async def _weekly_digest(self):
    #     """Example: weekly email digest."""
    #     pass
