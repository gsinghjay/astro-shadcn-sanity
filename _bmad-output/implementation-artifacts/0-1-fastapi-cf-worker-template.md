# Story 0.1: FastAPI Cloudflare Worker Template

> **Type:** Shared infrastructure — cross-cutting prerequisite
> **Unblocks:** Story 10.4 (FastAPI Discord Bot Worker), Story 12.1 (FastAPI Project Scaffold & Health Endpoint)
> **Assigned to:** Jay (creates the template; API Dev and Discord Bot Dev fork from it)

## User Story

As the project lead,
I want a production-ready FastAPI + Cloudflare Python Worker template in the monorepo,
So that both the Discord bot developer and the API developer can fork a working scaffold instead of figuring out the CF Workers + FastAPI integration from scratch.

## Background

Cloudflare Python Workers use a specific integration pattern that's not obvious from standard FastAPI docs:
- `asgi.fetch()` bridges the Workers entrypoint to FastAPI
- Bindings (KV, D1, AI, secrets) are accessed via `req.scope["env"]` inside route handlers
- Cron Triggers use a `scheduled()` method on the `WorkerEntrypoint` class, coexisting with FastAPI
- The `python_workers` compatibility flag is required (may be auto-detected from `.py` entrypoint in newer wrangler versions, but explicit inclusion is recommended)
- Packages are managed via **Pywrangler** + `pyproject.toml` — Pywrangler automatically downloads, vendors, and bundles Workers-compatible Python packages
- Module-level access to secrets/env vars is available via `from workers import env` (but KV/D1 I/O still requires request context)
- As of Aug 2025, Python Workers handlers live in a `WorkerEntrypoint` class by default (the old `@handler`/`on_fetch` top-level pattern is deprecated — requires `disable_python_no_global_handlers` compat flag)

This template eliminates the #1 blocker for a first-time Cloudflare developer: getting the initial scaffold deployed and working.

## Acceptance Criteria

### AC1: Template directory structure
**Given** the monorepo root exists
**When** the template is created
**Then** `_templates/fastapi-cf-worker/` contains a complete, deployable project structure:
```
_templates/fastapi-cf-worker/
├── src/
│   ├── main.py              # Workers entrypoint: WorkerEntrypoint + ASGI bridge (not importable in tests)
│   ├── app.py               # FastAPI app, CORS, exception handlers, router includes (testable)
│   ├── dependencies.py       # FastAPI Depends() — typed settings, auth, binding access
│   ├── routers/
│   │   ├── __init__.py
│   │   └── health.py         # GET /health — per-service probes with latency (KV, D1, AI, vars, secrets)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── common.py         # ErrorResponse, ServiceCheck, HealthResponse, PaginatedResponse[T]
│   │   └── settings.py       # WorkerSettings — Pydantic model, single source of truth for env/secrets/bindings
│   └── services/
│       ├── __init__.py
│       └── http_client.py    # httpx wrapper with timeout defaults + error handling
├── tests/
│   ├── __init__.py
│   ├── conftest.py           # Shared fixtures — WorkerSettings mock, mock KV/D1, TestClient
│   └── test_health.py        # 12 tests: per-probe checks, degraded states, secret leak prevention
├── scripts/
│   └── seed_kv.sh            # Helper to seed KV with initial config values
├── Dockerfile                 # Dev container: Node 20 + Python 3.12 + uv + Pywrangler
├── docker-compose.yml         # One-command dev environment
├── .dockerignore              # node_modules, .wrangler/, __pycache__
├── wrangler.jsonc             # Annotated with comments explaining every field
├── pyproject.toml             # Python deps + project metadata (Pywrangler-managed)
├── .dev.vars.example          # Template for local secrets (copy to .dev.vars)
├── .gitignore                 # .dev.vars, __pycache__, .wrangler/, .venv/
└── README.md                  # Setup guide: clone → configure → dev → deploy
```

### AC2: Working FastAPI + Workers entrypoint (src/main.py + src/app.py)
**Given** the template files exist
**When** a developer reads `src/main.py` and `src/app.py`
**Then** the code is split into two files for testability:
- **`src/main.py`** (Workers-only — imports `workers` and `asgi`, cannot be loaded by standard Python):
  - `WorkerEntrypoint` class with `fetch()` delegating to `asgi.fetch(app, request, self.env)`
  - `scheduled()` method on the same class for Cron Triggers, with a cron-routing example
  - Inline comments explaining the Workers-specific patterns
- **`src/app.py`** (testable — zero Workers imports):
  - FastAPI `app` instance with CORS middleware, exception handlers, and router includes
  - Tests import from here instead of `main.py`

**Reference implementation (from Cloudflare docs):**
```python
from workers import WorkerEntrypoint
from fastapi import FastAPI, Request
from pydantic import BaseModel
import asgi

class Default(WorkerEntrypoint):
    async def fetch(self, request):
        return await asgi.fetch(app, request, self.env)

    async def scheduled(self, event, env, ctx):
        # Cron dispatch — route by cron pattern
        # Note: `event.cron` contains the matching cron expression string
        # `env` is the same as `self.env` — both provide access to bindings
        cron = event.cron
        if cron == "0 14 * * 1":
            await weekly_digest(env)
        elif cron == "0 14 * * *":
            await daily_check(env)

app = FastAPI(title="Worker Name", version="0.1.0")

@app.get("/health")
async def health(req: Request):
    env = req.scope["env"]
    return {"status": "ok"}
```

**Cron testing:** Use `--test-scheduled` flag with Pywrangler and hit the Python-specific endpoint:
```bash
uv run pywrangler dev --test-scheduled
curl "http://localhost:8787/cdn-cgi/handler/scheduled?cron=*+*+*+*+*"
```

### AC3: Typed settings + binding access (src/models/settings.py + src/dependencies.py)
**Given** the entrypoint passes `self.env` to ASGI
**When** a developer needs to access KV, D1, AI, or secrets from a route handler
**Then** `src/models/settings.py` defines `WorkerSettings` — a Pydantic model that is the single source of truth for all env vars, secrets, and bindings:
```python
class WorkerSettings(BaseModel):
    # Env vars (wrangler.jsonc vars)
    environment: str = "development"
    # Required secrets
    api_key: str | None = None
    admin_api_key: str | None = None
    # Optional secrets
    sanity_api_read_token: str | None = None
    # ... all secrets declared as typed fields
    # Bindings (CF service objects)
    kv: Any = None
    db: Any = None
    ai: Any = None

    @property
    def required_secrets(self) -> dict[str, str | None]: ...
    @property
    def optional_secrets(self) -> dict[str, str | None]: ...
    @property
    def env_vars(self) -> dict[str, str]: ...
    @property
    def bindings(self) -> dict[str, Any]: ...

    @classmethod
    def from_worker_env(cls, env) -> "WorkerSettings":
        """Extract + validate from the Workers JS env proxy."""
```
**And** `src/dependencies.py` exports typed `Depends()` functions:
```python
async def get_settings(request: Request) -> WorkerSettings:
    """Primary dependency — typed access to all config."""
    return WorkerSettings.from_worker_env(request.scope["env"])

async def verify_api_key(request: Request, settings=Depends(get_settings)):
    """API key auth — reads from typed settings, not raw env."""

async def get_kv(settings=Depends(get_settings)):
    """Returns KV binding or 503 if not configured."""

async def get_db(settings=Depends(get_settings)):
    """Returns D1 binding or 503 if not configured."""
```
- Route handlers use: `async def my_route(settings=Depends(get_settings)):`
- Auth-protected routes use: `async def my_route(_=Depends(verify_api_key)):`
- All dependencies are async (required — sync deps run in thread pool which can't access JS-backed scope)

**Note on global env access:** For module-level secrets/vars (e.g., initializing an API client), you can use:
```python
from workers import env
API_KEY = env.API_KEY  # Works at module level for secrets/vars
# But KV/D1 I/O (e.g., env.KV.get()) does NOT work outside request context
```

### AC4: Shared Pydantic models (src/models/common.py)
**Given** both workers need consistent response shapes
**When** a developer imports common models
**Then** `src/models/common.py` exports:
- `ErrorResponse` — `{ "detail": str, "status_code": int }`
- `ServiceCheck` — `{ "status": str, "latency_ms": float|null, "message": str|null }` — per-service health probe result
- `HealthResponse` — `{ "status": "ok"|"degraded"|"down", "checks": dict[str, ServiceCheck], "timestamp": str }`
- `PaginatedResponse[T]` — Generic model with `items: list[T]`, `total: int`, `offset: int`, `limit: int`
- All models include `model_config` with `json_schema_extra` examples for OpenAPI docs

### AC5: httpx wrapper service (src/services/http_client.py)
**Given** Workers don't support persistent connections
**When** a developer needs to make external HTTP calls
**Then** `src/services/http_client.py` provides an async context manager that:
- Creates a fresh `httpx.AsyncClient` per use (no connection reuse across requests)
- Sets default timeout (10s), `http2=False` (avoids Workers connection issues)
- Includes a `raise_for_status` helper that converts httpx errors to FastAPI `HTTPException`

### AC6: Wrangler config with annotations (wrangler.jsonc)
**Given** the developer has never seen a wrangler config before
**When** they open `wrangler.jsonc`
**Then** every field has a JSONC comment explaining what it does:
- `$schema` — enables IDE autocompletion from `./node_modules/wrangler/config-schema.json`
- `name` — Worker name (appears in CF dashboard)
- `main` — entrypoint file (must point to the Python file with `WorkerEntrypoint`)
- `compatibility_flags` — why `python_workers` is required (enables Python runtime; may be auto-detected from `.py` entrypoint but explicit is safer)
- `compatibility_date` — what this controls (runtime feature availability; use a recent date like `"2026-02-09"`)
- `kv_namespaces` — how binding name maps to Python `env.KV`
- `d1_databases` — same pattern for D1
- `ai` — Workers AI binding
- `vars` — non-sensitive config (visible in dashboard)
- `triggers.crons` — cron patterns with UTC timezone note

### AC7: Local development setup (.dev.vars.example + README.md)
**Given** the developer needs to run locally
**When** they follow the README
**Then** `.dev.vars.example` lists all required secrets with placeholder values and descriptions:
```bash
# Copy this file to .dev.vars (never commit .dev.vars!)
# API authentication
API_KEY="your-api-key-here"
ADMIN_API_KEY="your-admin-api-key-here"
# Sanity
SANITY_API_READ_TOKEN="sk..."
SANITY_API_WRITE_TOKEN="sk..."
# Discord (bot only)
DISCORD_BOT_TOKEN="your-bot-token"
DISCORD_APP_ID="your-app-id"
DISCORD_PUBLIC_KEY="your-public-key"
# Cloudflare (platform API only)
CF_API_TOKEN="your-cf-api-token"
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
```
**And** `README.md` covers:
1. Prerequisites (Node.js 20+, Python 3.12+, `uv` package manager)
2. One-time setup (`uv sync`, wrangler login, create KV, set secrets)
3. Local dev (`uv run pywrangler dev` → http://localhost:8787/docs)
4. Testing (`uv run pytest tests/`)
5. Deploy (`uv run pywrangler deploy`)
6. How to fork the template (copy directory, rename, update wrangler.jsonc + pyproject.toml)

### AC8: Working test scaffold (tests/)
**Given** the developer wants to test routes without deploying
**When** they run `uv run pytest`
**Then** `tests/conftest.py` provides:
- `MockKV` / `MockD1` classes with async stubs matching the CF binding API
- A `mock_settings` fixture returning a `WorkerSettings` instance with stubbed bindings and test secrets
- A `client` fixture that creates FastAPI `TestClient` with `get_settings` overridden via `app.dependency_overrides`
- Tests import from `app.py` (not `main.py`) since `main.py` requires the Workers Pyodide runtime
**And** `tests/test_health.py` includes 12 tests:
- Per-probe happy path: KV, D1, AI, env_vars, required secrets, optional secrets
- Degraded state on KV failure and missing required secret
- Not-configured state when binding is None
- Secret value leak prevention (values never appear in messages)
- Swagger UI and 404 checks

### AC9: KV seed script (scripts/seed_kv.sh)
**Given** the developer needs initial KV data for local dev
**When** they run the seed script
**Then** `scripts/seed_kv.sh` uses `npx wrangler kv key put` to seed common config values:
- `config:version` → `"1.0.0"`
- Example channel webhook mapping (for Discord notification endpoint)
- Usage: `bash scripts/seed_kv.sh` (preview namespace) or `bash scripts/seed_kv.sh --production`

### AC10: Docker dev container (Dockerfile + docker-compose.yml)
**Given** the developers may not have Node.js, Python 3.12, or uv installed locally
**When** they need to start development
**Then** `docker compose up` starts a fully configured dev environment with:
- Node.js 20 LTS (for Wrangler CLI)
- Python 3.12 (matches Cloudflare Workers Pyodide runtime)
- `uv` (fast Python package manager — used by Pywrangler)
- Wrangler (installed globally via npm)
- Working directory mounted as a volume (live code reloading)
- Port 8787 exposed (Wrangler dev server)
- `.dev.vars` loaded automatically (if present)

**Dockerfile requirements:**
```dockerfile
FROM node:20-slim

# Python 3.12 + uv (Python package manager used by Pywrangler)
RUN apt-get update && apt-get install -y python3 python3-pip curl \
    && npm install -g wrangler \
    && curl -LsSf https://astral.sh/uv/install.sh | sh \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.local/bin:$PATH"

WORKDIR /app

COPY pyproject.toml ./
RUN uv sync

COPY . .
EXPOSE 8787

CMD ["uv", "run", "pywrangler", "dev", "--ip", "0.0.0.0"]
```

**docker-compose.yml requirements:**
```yaml
services:
  worker:
    build: .
    ports:
      - "8787:8787"
    volumes:
      - .:/app
      - /app/node_modules        # Anonymous volume — don't overwrite container's node_modules
      - /app/.venv               # Anonymous volume — don't overwrite container's venv
    env_file:
      - path: .dev.vars
        required: false
    command: uv run pywrangler dev --ip 0.0.0.0
```

**And** developers can choose either workflow:
1. **Docker (recommended for onboarding):** `docker compose up` → http://localhost:8787/docs
2. **Native (for experienced devs):** `uv run pywrangler dev` → http://localhost:8787/docs

**And** `docker compose run worker uv run pytest tests/` runs the test suite inside the container
**And** `docker compose run worker uv run pywrangler deploy` deploys from inside the container (requires wrangler auth first)

### AC11: Wrangler auth for Docker containers
**Given** Wrangler requires Cloudflare account authentication
**When** a developer needs to authenticate inside the container
**Then** the README documents two auth approaches:
1. **OAuth flow (interactive):** `docker compose run -p 8976:8976 worker npx wrangler login` — opens browser callback on host machine
2. **API token (headless/CI):** Create a CF API token in the dashboard, add `CLOUDFLARE_API_TOKEN=your-token` to `.dev.vars` — Wrangler auto-detects it, no login needed

**And** the recommended approach for Docker is the API token method (simpler, no browser redirect issues)
**And** the README includes step-by-step instructions for creating the API token in the CF dashboard (My Profile → API Tokens → Create Token → "Edit Cloudflare Workers" template)

### AC12: Pywrangler + pyproject.toml configuration
**Given** the template uses Pywrangler for package management
**When** a developer opens `pyproject.toml`
**Then** it contains:
```toml
[project]
name = "fastapi-cf-worker"
version = "0.1.0"
description = "FastAPI + Cloudflare Python Worker template"
requires-python = ">=3.12"
dependencies = [
    "fastapi",
    "httpx",
    "pydantic",
]

[dependency-groups]
dev = [
    "workers-py",          # Provides Pywrangler CLI
    "workers-runtime-sdk", # Type stubs for Workers runtime
    "pytest",
    "ruff",
]
```
**And** `uv sync` installs all dependencies into a local `.venv`
**And** `uv run pywrangler dev` automatically vendors Workers-compatible packages and starts the dev server
**And** `uv run pywrangler deploy` bundles packages into the Worker and deploys to Cloudflare

## Technical Notes

### How FastAPI connects to Cloudflare Workers
1. `WorkerEntrypoint.fetch()` receives the raw Workers `Request` object
2. `asgi.fetch(app, request, self.env)` converts it to an ASGI scope and calls FastAPI
3. FastAPI routes access `env` via `request.scope["env"]` — this is where all bindings live
4. The same `WorkerEntrypoint` class can have a `scheduled()` method for Cron Triggers
5. HTTP requests → `fetch()` → FastAPI. Cron triggers → `scheduled()` → your cron logic.

### Architecture: main.py / app.py split
- **`main.py`** imports `workers` and `asgi` (Pyodide-only modules). It defines the `WorkerEntrypoint` class and bridges requests to FastAPI. It CANNOT be imported by standard Python (pytest).
- **`app.py`** defines the FastAPI app, middleware, exception handlers, and router includes. It has ZERO Workers-specific imports and is what tests import.
- **`models/settings.py`** defines `WorkerSettings` — a Pydantic model that validates all env vars, secrets, and bindings from the Workers env proxy. It's the single source of truth; health checks and dependencies read from it instead of raw `getattr(env, ...)`.

### Env access patterns (three levels)
1. **Inside FastAPI routes:** `Depends(get_settings)` → `WorkerSettings` (preferred, typed) or `request.scope["env"]` (raw proxy)
2. **Inside WorkerEntrypoint methods:** `self.env` — full access (same raw proxy)
3. **Module-level (top-level scope):** `from workers import env` — secrets and env vars only. KV/D1/Durable Objects I/O does NOT work outside request context.

### Key gotchas discovered during implementation
- **All FastAPI `Depends()` functions must be `async`** — FastAPI runs sync dependencies in a thread pool, which CANNOT access the JS-backed `request.scope` in the Workers Pyodide runtime. This causes silent 500s from the workerd layer (not even FastAPI error handlers catch it).
- **`workers` and `asgi` modules only exist in Pyodide** — importing them from standard Python (e.g., pytest) raises `ModuleNotFoundError: _pyodide_entrypoint_helper`. This forced the main.py / app.py split.
- **Wrangler uses `--ip` not `--host`** for binding the dev server to all interfaces. `--host 0.0.0.0` is silently ignored, causing Docker port-forwarding to get empty replies.
- **`docker-compose.yml` `env_file` must use `required: false`** — otherwise `docker compose run` fails if `.dev.vars` hasn't been created yet.
- **`asyncio.get_event_loop()` removed in Python 3.14** — tests that used it to seed async mocks fail. Seed mock stores directly instead.
- **`except BaseException`** needed for Workers runtime errors — some exceptions from the JS/Pyodide bridge don't inherit from `Exception`.
- **`req.scope["env"]`** is the way to access bindings from FastAPI routes. `from workers import env` works for secrets/vars at module level but NOT for KV/D1 I/O (requires request context).
- **New `httpx.AsyncClient` per request** — Workers don't support persistent connections. Never store a client in a global.
- **`http2=False`** on httpx clients — avoids intermittent connection errors in the Workers runtime.
- **Cron times are UTC** — `0 14 * * 1` = 14:00 UTC = 9:00 AM ET (EST). Note DST drift in comments.
- **128 MB memory limit** — don't load large datasets. Paginate and stream.
- **~1,000ms cold start** — first request after idle. Deploy-time memory snapshot helps (benchmarked at 1,027ms mean; compare AWS Lambda 2,502ms, GCR 3,069ms).
- **Avoid global mutable state** — Workers reuse isolates across requests. Storing request-scoped data in module-level variables causes cross-request data leaks.
- **Always `await` or `waitUntil` your Promises** — floating promises cause silent bugs and dropped work.
- **Test cron triggers locally** via `uv run pywrangler dev --test-scheduled` and `curl "http://localhost:8787/cdn-cgi/handler/scheduled?cron=*+*+*+*+*"` (note: Python Workers use `/cdn-cgi/handler/scheduled`, not `/__scheduled`).

### How developers fork the template
```bash
# Discord bot dev:
cp -r _templates/fastapi-cf-worker/ discord-bot/
# Edit discord-bot/wrangler.jsonc: name, bindings, crons
# Edit discord-bot/pyproject.toml: name, add discord-specific deps
# Edit discord-bot/src/main.py: add Discord-specific routers

# API dev:
cp -r _templates/fastapi-cf-worker/ platform-api/
# Edit platform-api/wrangler.jsonc: name, bindings
# Edit platform-api/pyproject.toml: name, add API-specific deps
# Edit platform-api/src/main.py: add API-specific routers
```

## Definition of Done
- [ ] Template deploys successfully to Cloudflare via `uv run pywrangler deploy` (blocked by placeholder binding IDs — upload + auth verified)
- [x] `http://localhost:8787/docs` shows Swagger UI with health endpoint (HTTP 200)
- [x] `http://localhost:8787/health` returns `{"status": "ok"}` (verified via Docker dev server)
- [x] `uv run pytest tests/` passes with mocked bindings (verified in Docker, 12/12 pass)
- [x] `docker compose up` starts dev server with zero local dependencies beyond Docker
- [x] `docker compose run worker uv run pytest tests/` passes inside container (12/12 pass)
- [x] `docker compose run worker uv run pywrangler deploy` deploys from container (API token auth works — upload succeeds, fails only on placeholder binding IDs)
- [ ] Both Discord bot dev and API dev can fork and deploy within 15 minutes following README
- [x] No hardcoded secrets — all sensitive values via `.dev.vars` or `npx wrangler secret put`

---

## Senior Developer Review (AI)

**Reviewer:** Amelia (Dev Agent) — 2026-02-25
**Scope:** Security, Cloudflare MCP docs validation, FastAPI best practices
**Result:** 9 issues fixed (4 High, 5 Medium), 12/12 tests passing

### Issues Found & Fixed

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| H1 | HIGH | `src/app.py` | CORS `allow_origins=["*"]` + `allow_credentials=True` allows any origin credentialed access (OWASP misconfiguration) | Removed `allow_credentials=True` |
| H2 | HIGH | `src/dependencies.py` | API key comparison used `!=` (timing attack vulnerable) | Replaced with `hmac.compare_digest()` |
| H3 | HIGH | `src/routers/health.py` | Unauthenticated `/health` leaked KV values, secret names, env var values | Redacted to counts only — no names or values in output |
| H4 | HIGH | `src/routers/health.py` | `not_configured` status fell through to `"ok"`; `"down"` status never produced | Simplified: any `error`/`degraded` → `"degraded"`, removed unreachable `"down"` |
| M1 | MEDIUM | `src/models/settings.py` | `_get_binding` used truthy check (`if val`) instead of `is not None` — may swallow valid JS proxy objects | Changed to `if val is not None` |
| M2 | MEDIUM | `src/dependencies.py` | `WorkerSettings.from_worker_env()` called on every `Depends()` — no caching | Cached on `request.state` per-request |
| M3 | MEDIUM | `src/services/http_client.py` | `http_get`/`http_post` annotated `-> dict` but `response.json()` returns `Any` | Removed incorrect return type annotation |
| M4 | MEDIUM | `.dockerignore` | Missing `.venv-workers/`, `python_modules/`, `.pytest_cache/`, `*.egg-info/` | Added all entries |
| M5 | MEDIUM | `scripts/seed_kv.sh` | Unquoted `$ENVIRONMENT` expansion could word-split | Refactored to bash array |

### Remaining (not fixed — cosmetic)

| # | Severity | Note |
|---|----------|------|
| L3 | LOW | AC12 spec doesn't list `pytest-asyncio` but implementation correctly includes it |
| L4 | LOW | Story comment says `python_workers` flag "may be auto-detected" — CF docs confirm it's still required |

### Cloudflare Docs Validation Summary

| Pattern | Validated Against | Status |
|---------|-------------------|--------|
| `WorkerEntrypoint` class | CF changelog 2025-08-14 | Correct |
| `asgi.fetch(app, request, self.env)` | CF Python Workers + FastAPI page | Correct |
| `python_workers` compat flag | D1 Python Workers example (2026-02-07) | Required — not auto-detected |
| `request.scope["env"]` binding access | CF Bindings page + D1 docs | Correct |
| `/cdn-cgi/handler/scheduled` endpoint | CF Scheduled Handler docs | Correct (JS uses `/__scheduled`) |
| `except BaseException` | Not documented by CF | Defensible (JS/Pyodide bridge errors) |
| `http2=False` for httpx | Not documented by CF | Empirical — safe default |

### File List (changed in review)

- `_templates/fastapi-cf-worker/src/app.py` — CORS fix
- `_templates/fastapi-cf-worker/src/dependencies.py` — hmac + caching
- `_templates/fastapi-cf-worker/src/models/common.py` — Literal types
- `_templates/fastapi-cf-worker/src/models/settings.py` — binding truthiness fix
- `_templates/fastapi-cf-worker/src/routers/health.py` — info leak + status logic
- `_templates/fastapi-cf-worker/src/services/http_client.py` — return type fix
- `_templates/fastapi-cf-worker/.dockerignore` — added missing entries
- `_templates/fastapi-cf-worker/scripts/seed_kv.sh` — bash array fix
- `_templates/fastapi-cf-worker/tests/test_health.py` — updated assertions for redacted messages
