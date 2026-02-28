# FastAPI + Cloudflare Python Worker Template

Shared scaffold for the two FastAPI Python Workers in this project:

| Worker | Epic | Purpose |
|--------|------|---------|
| **discord-bot** | Epic 10 | Discord slash commands, webhooks, cron digests |
| **platform-api** | Epic 12 | Unified REST API (`/api/v1/*`) aggregating Sanity, KV, D1, Workers AI |

Fork this template, add your routes, and deploy globally in minutes.

## Table of Contents

- [What Is This?](#what-is-this)
- [How It Works](#how-it-works)
- [Prerequisites](#prerequisites)
- [Quick Start (5 minutes)](#quick-start-5-minutes)
- [Project Structure](#project-structure)
- [Development Guide](#development-guide)
  - [Running Locally](#running-locally)
  - [Adding Routes](#adding-routes)
  - [Adding a New Secret or Env Var](#adding-a-new-secret-or-env-var)
  - [Accessing Cloudflare Services](#accessing-cloudflare-services)
  - [Making External HTTP Calls](#making-external-http-calls)
  - [Adding Cron Jobs](#adding-cron-jobs)
  - [Environment Variables and Secrets](#environment-variables-and-secrets)
- [Testing](#testing)
- [Deploying to Cloudflare](#deploying-to-cloudflare)
- [Docker Setup](#docker-setup)
- [Forking This Template](#forking-this-template)
- [Concepts for Beginners](#concepts-for-beginners)
- [Troubleshooting](#troubleshooting)

---

## What Is This?

**Cloudflare Workers** let you run code on Cloudflare's global network (300+ cities). Your code runs close to your users, starts in ~1 second, and costs fractions of a penny per request. No servers to manage.

**FastAPI** is a Python web framework for building APIs. It gives you automatic Swagger docs, request validation, and async support out of the box.

This template wires them together and provides the common scaffold for both project Workers:

- **Epic 10 — Discord Bot Worker:** Receives Discord interactions (slash commands, buttons, modals), sends webhook notifications, runs cron-based weekly digests and daily event reminders
- **Epic 12 — Platform API Worker:** Serves `/api/v1/*` endpoints that aggregate Sanity CMS, KV, D1, and Workers AI behind a typed REST API with OpenAPI docs

Both Workers share the same patterns: FastAPI + ASGI bridge, typed `WorkerSettings` for configuration, httpx for external calls, Pydantic models, pytest + TestClient, and Pywrangler for dev/deploy.

## How It Works

Here's what happens when someone makes a request to your Worker:

```
User Request
    │
    ▼
┌─────────────────────────┐
│  Cloudflare Edge (CDN)  │  ← Runs in the nearest data center to the user
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Default.fetch()        │  ← WorkerEntrypoint class in main.py
│  (Workers runtime)      │
└────────────┬────────────┘
             │  asgi.fetch(app, request, self.env)
             ▼
┌─────────────────────────┐
│  FastAPI App (app.py)   │  ← Standard FastAPI — routes, middleware, validation
│                         │
│  Depends(get_settings)  │  ← Typed WorkerSettings model from models/settings.py
│    → settings.kv        │     KV namespace
│    → settings.db        │     D1 database
│    → settings.ai        │     Workers AI
│    → settings.api_key   │     Secrets (typed, validated)
│    → settings.environment    Env vars
└─────────────────────────┘
```

For **cron jobs**, Cloudflare calls `Default.scheduled()` instead — this bypasses FastAPI entirely and runs your cron logic directly.

## Prerequisites

You need these installed on your machine:

| Tool | Version | What It Does | Install |
|------|---------|--------------|---------|
| **Node.js** | 20+ | Runs the Wrangler CLI | [nodejs.org](https://nodejs.org/) |
| **Python** | 3.12+ | Your Worker's language | [python.org](https://www.python.org/downloads/) |
| **uv** | latest | Fast Python package manager | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| **Cloudflare account** | free tier | Where your Worker runs | [dash.cloudflare.com](https://dash.cloudflare.com/) |

Verify everything is installed:

```bash
node --version    # Should print v20.x or v22.x
python3 --version # Should print 3.12.x or higher
uv --version      # Should print a version number
```

## Quick Start (5 minutes)

### 1. Fork the template

```bash
# From the monorepo root — pick one:
cp -r _templates/fastapi-cf-worker/ discord-bot/    # Epic 10
cp -r _templates/fastapi-cf-worker/ platform-api/   # Epic 12

cd discord-bot/   # or platform-api/
```

### 2. Install dependencies

```bash
uv sync
```

This creates a `.venv/` folder and installs FastAPI, httpx, Pydantic, pytest, and the Workers dev tools. You only need to run this once (or after changing `pyproject.toml`).

### 3. Set up secrets for local development

```bash
cp .dev.vars.example .dev.vars
```

Open `.dev.vars` and fill in any secrets you need. For now, just having the file exist is enough to start the dev server.

### 4. Start the dev server

```bash
uv run pywrangler dev
```

You should see output like:

```
⛅ wrangler ...
Your worker has access to the following bindings:
- KV Namespaces: KV
- D1 Databases: DB
- AI: AI
⎔ Starting local server...
╭──────────────────────────────────────╮
│ [b]Ready on http://localhost:8787    │
╰──────────────────────────────────────╯
```

### 5. Test it

Open your browser:

- **http://localhost:8787/docs** — Swagger UI (interactive API docs)
- **http://localhost:8787/health** — Health check endpoint with per-service probes

Or use curl:

```bash
curl http://localhost:8787/health | python3 -m json.tool
# {
#   "status": "ok",
#   "checks": {
#     "kv": {"status": "ok", "latency_ms": 3.0, "message": "readable (key not found)"},
#     "d1": {"status": "ok", "latency_ms": 7.0, "message": "query executed"},
#     "ai": {"status": "ok", "latency_ms": null, "message": "binding available"},
#     "env_vars": {"status": "ok", "latency_ms": null, "message": "environment=development"},
#     "secrets": {"status": "ok", "latency_ms": null, "message": "2 required secret(s) configured"},
#     "optional_secrets": {"status": "ok", ...}
#   },
#   "timestamp": "2026-02-25T07:51:42.753999+00:00"
# }
```

You now have a working FastAPI app running on the Cloudflare Workers runtime locally.

## Project Structure

```
your-worker/
├── src/                        ← All your Python code lives here
│   ├── main.py                 ← Workers entrypoint: WorkerEntrypoint + ASGI bridge (Pyodide-only)
│   ├── app.py                  ← FastAPI app, middleware, routers (testable — no Workers imports)
│   ├── dependencies.py         ← Typed Depends() functions (settings, auth, bindings)
│   ├── routers/                ← API route modules (one file per resource)
│   │   └── health.py           ← GET /health — per-service probes with latency
│   ├── models/                 ← Pydantic models (request/response shapes + settings)
│   │   ├── common.py           ← ErrorResponse, ServiceCheck, HealthResponse, PaginatedResponse
│   │   └── settings.py         ← WorkerSettings — single source of truth for env/secrets/bindings
│   └── services/               ← Business logic and external API wrappers
│       └── http_client.py      ← Safe httpx wrapper for Workers runtime
├── tests/                      ← pytest tests (run without deploying)
│   ├── conftest.py             ← Shared fixtures (WorkerSettings mock, MockKV/MockD1, TestClient)
│   └── test_health.py          ← 12 tests: per-probe, degraded states, secret leak prevention
├── scripts/
│   └── seed_kv.sh              ← Populate KV with initial data
├── wrangler.jsonc              ← Cloudflare config (bindings, crons, name)
├── pyproject.toml              ← Python dependencies
├── .dev.vars.example           ← Template for local secrets
├── Dockerfile                  ← Dev container (optional)
└── docker-compose.yml          ← One-command Docker dev environment (optional)
```

### Why main.py and app.py are separate

`main.py` imports `workers` and `asgi` — modules that only exist inside Cloudflare's Pyodide runtime. They can't be loaded by standard Python (e.g., pytest). So:

- **`main.py`** — Workers entrypoint. Imports `workers`, `asgi`, and the `app` from `app.py`. Only runs inside the Workers runtime.
- **`app.py`** — The FastAPI application. Zero Workers imports. This is what tests import.

### WorkerSettings — the configuration model

Instead of reading `env.API_KEY` or `env.KV` directly from the raw Workers proxy, all configuration goes through `WorkerSettings` in `models/settings.py`. This Pydantic model:

- Declares every env var, secret, and binding as a typed field
- Validates values when extracted from the Workers env proxy
- Powers the health check automatically (add a field → health check discovers it)
- Is the dependency that route handlers use: `settings = Depends(get_settings)`

## Development Guide

### Running Locally

```bash
# Start the dev server (hot-reloads on file changes)
uv run pywrangler dev

# The server runs at http://localhost:8787
# Swagger UI is at http://localhost:8787/docs
```

The dev server simulates the Cloudflare Workers runtime locally. Your KV, D1, and AI bindings are mocked by Wrangler's local simulator — no Cloudflare account needed for basic development.

### Adding Routes

1. **Create a new router file** in `src/routers/`:

**Epic 12 example — content query endpoint:**

```python
# src/routers/content.py
from fastapi import APIRouter, Depends
from dependencies import get_settings, verify_api_key
from models.settings import WorkerSettings
from services.http_client import http_get

router = APIRouter(prefix="/api/v1/content", tags=["content"])


@router.get("/events")
async def list_events(settings: WorkerSettings = Depends(get_settings)):
    """Fetch upcoming events from Sanity."""
    # Check KV cache first (60s TTL)
    cached = await settings.kv.get("cache:events", type="json")
    if cached:
        return cached

    # Miss — query Sanity API
    data = await http_get(
        "https://<project-id>.api.sanity.io/v2024-01-01/data/query/production",
        params={"query": '*[_type == "event" && dateTime > now()] | order(dateTime asc)'},
        headers={"Authorization": f"Bearer {settings.sanity_api_read_token}"},
    )
    await settings.kv.put("cache:events", data, expirationTtl=60)
    return data
```

**Epic 10 example — Discord webhook endpoint:**

```python
# src/routers/notifications.py
from fastapi import APIRouter, Depends
from dependencies import get_settings, verify_api_key
from models.settings import WorkerSettings
from services.http_client import http_post

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("/sponsor-update", dependencies=[Depends(verify_api_key)])
async def notify_sponsor_update(
    name: str,
    settings: WorkerSettings = Depends(get_settings),
):
    """Post a sponsor update notification to Discord."""
    webhook_url = await settings.kv.get("webhooks:sponsors")
    await http_post(webhook_url, json={
        "embeds": [{
            "title": "Sponsor Update",
            "description": f"{name} has been updated",
            "color": 0x00B4D8,
        }]
    })
    return {"sent": True}
```

2. **Register it** in `src/app.py`:

```python
from routers.content import router as content_router

app.include_router(content_router)
```

3. **Refresh** http://localhost:8787/docs — your new routes appear automatically.

### Adding a New Secret or Env Var

All configuration is declared in `WorkerSettings` (`src/models/settings.py`). To add a new one:

1. **Add the field** to `WorkerSettings`:
   ```python
   # In models/settings.py
   class WorkerSettings(BaseModel):
       # ... existing fields ...
       my_new_secret: str | None = None  # Add here
   ```

2. **Map it** in `from_worker_env()`:
   ```python
   @classmethod
   def from_worker_env(cls, env) -> "WorkerSettings":
       return cls(
           # ... existing mappings ...
           my_new_secret=_get("MY_NEW_SECRET"),  # Add here
       )
   ```

3. **Categorize it** in the appropriate property (`required_secrets`, `optional_secrets`, or `env_vars`) so the health check picks it up automatically.

4. **Add it** to `.dev.vars.example` with a placeholder value.

That's it — the health endpoint auto-discovers it, and route handlers access it as `settings.my_new_secret`.

### Accessing Cloudflare Services

Every Cloudflare service is available through the typed `WorkerSettings` model. Use `Depends(get_settings)`:

```python
from dependencies import get_settings
from models.settings import WorkerSettings

@router.get("/example")
async def example(settings: WorkerSettings = Depends(get_settings)):
    # KV — rate limiting (Epic 10), response caching (both epics)
    last_notified = await settings.kv.get("ratelimit:sponsor:123")
    await settings.kv.put("cache:events", '[]', expirationTtl=60)

    # D1 — analytics, audit logs
    result = await settings.db.prepare(
        "SELECT * FROM audit_log WHERE action = ? ORDER BY ts DESC LIMIT 10"
    ).bind("sponsor_update").all()

    # Workers AI — RAG chat queries (Epic 12)
    response = await settings.ai.run("@cf/meta/llama-3-8b-instruct", {
        "prompt": "Summarize upcoming events"
    })

    # Typed secrets
    token = settings.sanity_api_read_token

    # Typed env vars
    environment = settings.environment
```

**Where do bindings come from?** Each binding in `wrangler.jsonc` becomes a property on the raw `env` object, which `WorkerSettings.from_worker_env()` maps to typed fields:

| wrangler.jsonc | WorkerSettings field | Type |
|----------------|---------------------|------|
| `kv_namespaces: [{binding: "KV", ...}]` | `settings.kv` | KV proxy |
| `d1_databases: [{binding: "DB", ...}]` | `settings.db` | D1 proxy |
| `ai: {binding: "AI"}` | `settings.ai` | AI proxy |
| `vars: {ENVIRONMENT: "dev"}` | `settings.environment` | `str` |
| Secrets (`wrangler secret put`) | `settings.api_key`, etc. | `str \| None` |

### Making External HTTP Calls

Use the provided `http_client` wrapper — it handles Workers-specific gotchas for you:

```python
from services.http_client import http_get, http_post, get_client

# Query Sanity CMS (Epic 12 — content endpoints)
events = await http_get(
    "https://<project-id>.api.sanity.io/v2024-01-01/data/query/production",
    params={"query": '*[_type == "event"]'},
    headers={"Authorization": f"Bearer {settings.sanity_api_read_token}"},
)

# Post to Discord webhook (Epic 10 — notifications)
await http_post(webhook_url, json={
    "embeds": [{"title": "New Sponsor", "description": name, "color": 0x2ECC71}]
})

# Custom request (full control)
async with get_client() as client:
    response = await client.patch(
        f"https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project}/deployments",
        headers={"Authorization": f"Bearer {settings.cf_api_token}"},
    )
```

**Why a wrapper?** Workers don't support persistent HTTP connections. The wrapper ensures:
- A fresh `httpx.AsyncClient` is created per request (no connection reuse)
- `http2=False` is set (avoids intermittent connection errors)
- Safe timeout defaults (10 seconds)

### Adding Cron Jobs

1. **Define the schedule** in `wrangler.jsonc`:

```jsonc
{
  "triggers": {
    "crons": [
      "0 14 * * *",    // Daily at 14:00 UTC — event reminders (Epic 10.8)
      "0 14 * * 1"     // Monday at 14:00 UTC — weekly digest (Epic 10.8)
    ]
  }
}
```

> All cron times are UTC. `0 14 * * 1` = 14:00 UTC = 9:00 AM Eastern (EST) or 10:00 AM Eastern (EDT). Watch out for DST!

2. **Add handler logic** in `src/main.py`:

```python
class Default(WorkerEntrypoint):
    # ... fetch() stays the same ...

    async def scheduled(self, event, env, ctx):
        cron = event.cron
        if cron == "0 14 * * *":
            await self._daily_event_reminders()
        elif cron == "0 14 * * 1":
            await self._weekly_digest()

    async def _daily_event_reminders(self):
        """Post reminders for events in the next 48 hours (Epic 10.8)."""
        # Query Sanity for upcoming events, post to Discord
        pass

    async def _weekly_digest(self):
        """Post weekly program digest to Discord (Epic 10.8)."""
        # Aggregate stats from Sanity, post embed to #announcements
        data = await self.env.KV.get("digest:weekly")
        pass
```

3. **Test locally:**

```bash
uv run pywrangler dev --test-scheduled

# In another terminal:
curl "http://localhost:8787/cdn-cgi/handler/scheduled?cron=*+*+*+*+*"
```

### Environment Variables and Secrets

There are three types of configuration:

| Type | Where to set | How to access | Visible in dashboard? |
|------|-------------|---------------|----------------------|
| **Env vars** | `wrangler.jsonc` → `vars` | `settings.environment` | Yes |
| **Secrets** | `npx wrangler secret put NAME` | `settings.api_key` | No (encrypted) |
| **Local dev secrets** | `.dev.vars` file | `settings.api_key` | N/A (local only) |

All three are declared as typed fields in `WorkerSettings` and accessed the same way.

**Setting secrets for production:**

```bash
# Interactive prompt (hides input):
npx wrangler secret put API_KEY
# Enter the value when prompted

# Or pipe it:
echo "my-secret-value" | npx wrangler secret put API_KEY
```

**Local development** uses `.dev.vars` instead of real secrets:

```bash
# .dev.vars (never commit this file!)
API_KEY="test-key-for-local-dev"
```

## Testing

Tests use FastAPI's `TestClient` with a mocked `WorkerSettings` — no Cloudflare account or deployment needed.

```bash
# Run all tests
uv run pytest tests/

# Run with verbose output
uv run pytest tests/ -v

# Run a specific test
uv run pytest tests/test_health.py::test_health_returns_ok -v
```

### How Tests Work

Tests import `app` from `app.py` (not `main.py`) because `main.py` requires the Workers Pyodide runtime which doesn't exist outside Cloudflare.

The test fixtures in `tests/conftest.py` create a `WorkerSettings` instance with stubbed bindings (`MockKV`, `MockD1`). FastAPI's `dependency_overrides` injects it into every route:

```python
# In conftest.py
from app import app
from dependencies import get_settings

# The mock replaces the real get_settings dependency
app.dependency_overrides[get_settings] = lambda: mock_settings
```

This means your test code looks like normal API testing:

```python
def test_my_endpoint(client):
    response = client.get("/my-endpoint")
    assert response.status_code == 200
```

### Writing New Tests

```python
# tests/test_content.py  (Epic 12 example)

def test_list_events_from_cache(client, mock_settings):
    """Events endpoint should return cached data when available."""
    # Seed the mock KV store directly (no async needed)
    mock_settings.kv._store["cache:events"] = '[{"title": "Demo Day"}]'

    response = client.get("/api/v1/content/events")
    assert response.status_code == 200


def test_protected_endpoint_requires_key(client):
    """Requests without API key should be rejected."""
    response = client.post("/notifications/sponsor-update?name=Acme")
    assert response.status_code == 401


def test_protected_endpoint_with_key(client):
    """Requests with valid API key should succeed."""
    response = client.post(
        "/notifications/sponsor-update?name=Acme",
        headers={"X-API-Key": "test-api-key"},  # Matches mock_settings.api_key
    )
    assert response.status_code == 200
```

### What the Health Check Tests Cover (12 tests)

| Test | What it verifies |
|------|-----------------|
| `test_health_returns_ok` | All probes pass, response shape correct |
| `test_health_checks_kv` | KV probe reads key, reports latency |
| `test_health_checks_d1` | D1 probe runs query, reports latency |
| `test_health_checks_ai` | AI binding existence confirmed |
| `test_health_checks_env_vars` | Environment variable accessible |
| `test_health_checks_required_secrets` | Required secrets detected, values never leaked |
| `test_health_checks_optional_secrets` | Optional secrets reported correctly |
| `test_health_degraded_when_kv_fails` | Overall status becomes "degraded" on error |
| `test_health_degraded_when_secret_missing` | Missing required secret triggers "degraded" |
| `test_health_kv_not_configured` | Null binding reports "not_configured" |
| `test_root_returns_404` | No accidental root route |
| `test_docs_available` | Swagger UI accessible |

## Deploying to Cloudflare

### First-Time Setup

1. **Authenticate with Cloudflare:**

```bash
npx wrangler login
```

This opens your browser to authorize Wrangler. You only need to do this once.

2. **Create your Cloudflare resources:**

```bash
# Create a KV namespace
npx wrangler kv namespace create "KV"
# Output: { binding = "KV", id = "abc123..." }
# Copy the id into wrangler.jsonc → kv_namespaces[0].id

# Create a D1 database
npx wrangler d1 create my-worker-db
# Output: database_id = "def456..."
# Copy the id into wrangler.jsonc → d1_databases[0].database_id
```

3. **Set production secrets:**

```bash
npx wrangler secret put API_KEY
# Enter your production API key when prompted
```

4. **Update `wrangler.jsonc`** with the real resource IDs from step 2.

### Deploy

```bash
uv run pywrangler deploy
```

Output:

```
Uploading discord-bot...
Published discord-bot (2.1 sec)
  https://discord-bot.YOUR_SUBDOMAIN.workers.dev
```

Your Worker is now live at that URL. Visit `https://<worker-name>.YOUR_SUBDOMAIN.workers.dev/docs` to see Swagger UI in production.

### Subsequent Deploys

Just run `uv run pywrangler deploy` again. Deploys take 2-3 seconds and are zero-downtime.

## Docker Setup

If you don't want to install Node, Python, or uv locally, use Docker instead.

### Start Development

```bash
# First, create your .dev.vars file (optional — server starts without it):
cp .dev.vars.example .dev.vars

# Start the dev server:
docker compose up

# Open http://localhost:8787/docs
```

### Run Tests in Docker

```bash
docker compose run --rm worker uv run pytest tests/ -v
```

### Deploy from Docker

```bash
# Option 1: API Token (recommended — no browser needed)
# Add to .dev.vars: CLOUDFLARE_API_TOKEN=your-token
# Then:
docker compose run --rm worker uv run pywrangler deploy

# Option 2: Interactive login (needs browser)
docker compose run -p 8976:8976 worker npx wrangler login
docker compose run --rm worker uv run pywrangler deploy
```

### Getting a Cloudflare API Token

1. Go to [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **"Edit Cloudflare Workers"** template
4. Click **Continue to summary** → **Create Token**
5. Copy the token and add it to `.dev.vars`:
   ```
   CLOUDFLARE_API_TOKEN=your-token-here
   ```

## Forking This Template

### Epic 10 — Discord Bot Worker

```bash
cp -r _templates/fastapi-cf-worker/ discord-bot/
cd discord-bot/
```

Then:
1. Update `wrangler.jsonc` → `"name": "discord-bot"`
2. Update `pyproject.toml` → `name = "discord-bot"`
3. Add `pynacl` to `pyproject.toml` dependencies (for Discord Ed25519 signature verification)
4. Add Discord-specific secrets to `.dev.vars`: `DISCORD_BOT_TOKEN`, `DISCORD_APP_ID`, `DISCORD_PUBLIC_KEY`
5. Add any new secrets to `WorkerSettings` in `models/settings.py` (see [Adding a New Secret](#adding-a-new-secret-or-env-var))
6. Create routers: `interactions.py` (slash commands), `webhooks.py` (notifications)
7. Enable cron triggers in `wrangler.jsonc` for daily reminders and weekly digest

### Epic 12 — Platform API Worker

```bash
cp -r _templates/fastapi-cf-worker/ platform-api/
cd platform-api/
```

Then:
1. Update `wrangler.jsonc` → `"name": "platform-api"`
2. Update `pyproject.toml` → `name = "platform-api"`
3. Add Sanity secrets to `.dev.vars`: `SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`
4. Create routers: `content.py`, `chat.py`, `forms.py`, `platform.py`, `discord.py`
5. All routes under `/api/v1/` prefix

### After Forking (both)

```bash
uv sync
cp .dev.vars.example .dev.vars
# Fill in your secrets, then:
uv run pywrangler dev
```

## Concepts for Beginners

### What is a "Worker"?

A Worker is a small program that runs on Cloudflare's servers worldwide. When someone makes an HTTP request to your Worker's URL, Cloudflare routes it to the nearest data center and runs your code there. This is called "edge computing" — your code runs at the edge of the network, close to users.

### What is the `env` object?

Think of `env` as a bag of connections to Cloudflare services. When you define a KV namespace in `wrangler.jsonc`, Cloudflare automatically gives your code an `env.KV` object that can read/write to that KV store. Same for D1 databases, AI models, and secrets.

In this template, the raw `env` proxy is wrapped by `WorkerSettings` — a typed Pydantic model that validates everything. Route handlers use `Depends(get_settings)` and access `settings.kv`, `settings.api_key`, etc. instead of the raw proxy.

### What is the `WorkerEntrypoint` class?

This is the "front door" of your Worker. Cloudflare's runtime calls its methods:

- `fetch(self, request)` — called for every HTTP request
- `scheduled(self, event, env, ctx)` — called by cron triggers

In this template, `fetch()` delegates to FastAPI via the `asgi.fetch()` bridge. This means you write standard FastAPI code for your HTTP routes, while cron logic goes directly in `scheduled()`.

### What is Pywrangler?

Pywrangler is a CLI tool that wraps Wrangler (Cloudflare's standard CLI) with Python-specific features:

- Automatically installs Workers-compatible Python packages from `pyproject.toml`
- Vendors and bundles packages into your Worker on deploy
- Handles the Pyodide (Python-in-the-browser) runtime setup

You use it instead of raw `npx wrangler` for `dev` and `deploy` commands:

| Instead of | Use |
|-----------|-----|
| `npx wrangler dev` | `uv run pywrangler dev` |
| `npx wrangler deploy` | `uv run pywrangler deploy` |

For non-Python commands (creating KV, setting secrets, etc.), you still use `npx wrangler` directly.

### What are "bindings"?

Bindings are the connections between your Worker code and Cloudflare services. You declare them in `wrangler.jsonc`, and Cloudflare makes them available as properties on the `env` object at runtime.

Think of it like dependency injection: you declare "I need a KV store called KV" in config, and at runtime you get `settings.kv` ready to use.

### Cold Starts

The first request after your Worker has been idle takes ~1 second (called a "cold start"). Cloudflare takes a memory snapshot at deploy time to minimize this. Subsequent requests while the Worker is warm are much faster (< 1ms overhead).

For comparison:
| Platform | Mean Cold Start |
|----------|----------------|
| Cloudflare Workers | ~1,000ms |
| AWS Lambda | ~2,500ms |
| Google Cloud Run | ~3,000ms |

### Memory Limit

Workers have a **128 MB memory limit**. Don't load large datasets into memory. Instead:
- Use KV or D1 for storage
- Paginate large result sets
- Stream responses for large payloads

## Troubleshooting

### "Module not found" errors when running tests

Tests must import from `app.py`, not `main.py`. If you see `ModuleNotFoundError: _pyodide_entrypoint_helper`, a test is importing `main.py` which requires the Workers runtime.

Also make sure you're running from the project root (where `pyproject.toml` is):

```bash
cd discord-bot/   # or platform-api/
uv run pytest tests/
```

### Routes return 500 with "Internal Server Error" (text/plain)

This is workerd (the Workers runtime) crashing, not FastAPI. Common causes:

1. **Sync dependency accessing `request.scope`** — All `Depends()` functions that touch `request.scope` MUST be `async`. FastAPI runs sync deps in a thread pool, which can't access the JS-backed scope in Pyodide.
2. **Importing `workers` or `asgi` in app.py** — These modules only exist in the Workers runtime. Keep them in `main.py` only.

### "No such binding" errors in local dev

Your `wrangler.jsonc` defines bindings, but the local simulator needs to know about them. Make sure:
1. KV namespace IDs are real (create with `npx wrangler kv namespace create "KV"`)
2. D1 database IDs are real (create with `npx wrangler d1 create my-db`)
3. Restart the dev server after changing `wrangler.jsonc`

For local-only development, Wrangler creates temporary local versions of KV/D1 — you don't need real resource IDs just to test.

### Docker: empty reply from server

The Wrangler dev server uses `--ip` (not `--host`) to bind to all interfaces. If you get empty replies when hitting `localhost:8787` from the host, check that `docker-compose.yml` uses:

```yaml
command: uv run pywrangler dev --ip 0.0.0.0
```

### Docker: ".dev.vars not found"

The `docker-compose.yml` uses `required: false` for the env file, so this shouldn't happen. If it does, either create the file (`cp .dev.vars.example .dev.vars`) or verify your `docker-compose.yml` has:

```yaml
env_file:
  - path: .dev.vars
    required: false
```

### `.dev.vars` not being loaded

- Make sure the file is named exactly `.dev.vars` (not `.dev.vars.example`)
- Restart the dev server after creating/modifying it
- Check there are no syntax errors (each line should be `KEY="value"`)

### "python_workers compatibility flag required"

Add this to your `wrangler.jsonc`:

```jsonc
"compatibility_flags": ["python_workers"]
```

### Deploy fails with "authentication required"

```bash
# Re-authenticate:
npx wrangler login

# Or use an API token (add to .dev.vars):
CLOUDFLARE_API_TOKEN=your-token
```

### Cron triggers not firing locally

You need the `--test-scheduled` flag:

```bash
uv run pywrangler dev --test-scheduled

# Then trigger manually:
curl "http://localhost:8787/cdn-cgi/handler/scheduled?cron=*+*+*+*+*"
```

Note: Python Workers use `/cdn-cgi/handler/scheduled`, not `/__scheduled` (which is for JavaScript Workers).

### httpx connection errors

Make sure you're using the `http_client.py` wrapper or setting `http2=False`:

```python
# Wrong — may fail in Workers:
async with httpx.AsyncClient() as client: ...

# Right:
async with httpx.AsyncClient(http2=False) as client: ...

# Best — use the wrapper:
from services.http_client import http_get
data = await http_get("https://<project-id>.api.sanity.io/...")
```
