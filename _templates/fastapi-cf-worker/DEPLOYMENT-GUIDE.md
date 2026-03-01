# Deployment Guide: FastAPI + Cloudflare Python Worker

**Estimated time:** ~12 minutes
**Video chapters:** Each section below maps to a video chapter with exact commands, expected output, and "What you should see" callouts.

---

## Chapter 1: Intro (30s)

**What we're building:** Taking the FastAPI CF Worker template from local development to a live, globally deployed Cloudflare Worker. By the end, you'll have a live URL serving `/health` and `/docs` with real KV and D1 bindings.

**What you'll have at the end:**
- A deployed Worker at `https://fastapi-cf-worker.<your-subdomain>.workers.dev`
- Working `/health` endpoint with real Cloudflare service probes
- Swagger UI at `/docs` accessible from anywhere
- Knowledge of the full deploy → verify → cleanup cycle

---

## Chapter 2: Prerequisites Check (1 min)

Verify you have the required tools installed:

```bash
node --version      # Should print v20.x or v22.x
python3 --version   # Should print 3.12.x or higher
uv --version        # Should print a version number
```

> **What you should see:** Three version numbers printed without errors. If any command fails, install the missing tool before continuing.

| Tool | Minimum Version | Install |
|------|----------------|---------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org/) |
| Python | 3.12+ | [python.org](https://www.python.org/downloads/) |
| uv | latest | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |

---

## Chapter 3: Clone & Install (1 min)

If you haven't already, navigate to the template and install dependencies:

```bash
cd _templates/fastapi-cf-worker/
uv sync
```

> **What you should see:** uv resolves dependencies and creates a `.venv/` directory. Output shows packages being installed (fastapi, httpx, pydantic, pytest, etc.).

**Common error:** If `uv sync` fails with a Python version error, ensure Python 3.12+ is on your PATH.

---

## Chapter 4: Create .dev.vars (1 min)

The `.dev.vars` file holds secrets for local development. Create it from the example template:

```bash
cp .dev.vars.example .dev.vars
```

Open `.dev.vars` in your editor and fill in the two required secrets:

```bash
# Generate random API keys (or use any test values)
API_KEY="test-api-key-12345"
ADMIN_API_KEY="test-admin-key-67890"
```

The other secrets (Sanity, Discord, etc.) can stay as placeholders — they're optional for the base template.

> **What you should see:** A new `.dev.vars` file in your project directory. This file is gitignored — it will never be committed.

**Common error:** If you skip this step, the dev server will still start, but `/health` will report `"degraded"` status for secrets.

---

## Chapter 5: Local Dev Verification (1 min)

Start the local dev server to confirm everything works before deploying:

```bash
uv run pywrangler dev
```

> **What you should see:**
> ```
> ⛅ wrangler ...
> Your worker has access to the following bindings:
> - KV Namespaces: KV
> - D1 Databases: DB
> - AI: AI
> ⎔ Starting local server...
> ╭──────────────────────────────────────╮
> │ [b]Ready on http://localhost:8787    │
> ╰──────────────────────────────────────╯
> ```

Test the endpoints:

```bash
# In another terminal:
curl http://localhost:8787/health | python3 -m json.tool
```

> **What you should see:** JSON response with `"status": "ok"` and per-service checks (KV, D1, AI, env_vars, secrets). All probes should show `"ok"` status.

Open http://localhost:8787/docs in your browser.

> **What you should see:** Swagger UI with the health endpoint documented, showing the request/response schema.

Press `Ctrl+C` to stop the dev server when done.

**Common error:** Port 8787 already in use — kill the other process or use `uv run pywrangler dev --port 8788`.

---

## Chapter 6: Verify Auth (30s)

Before creating Cloudflare resources, confirm your CLI is authenticated:

```bash
npx wrangler whoami
```

> **What you should see:**
> ```
> ⛅ wrangler ...
> Getting User settings...
> 👋 You are logged in with an API Token, associated with the email <your-email>
> ┌─────────────────┬──────────────────────────────────────┐
> │ Account Name    │ Account ID                           │
> ├─────────────────┼──────────────────────────────────────┤
> │ Your Account    │ abc123def456...                      │
> └─────────────────┴──────────────────────────────────────┘
> ```

If you see "Not authenticated", run:

```bash
npx wrangler login
```

This opens your browser to authorize Wrangler. You only need to do this once.

**Alternative (headless/CI):** Set `CLOUDFLARE_API_TOKEN` in your `.dev.vars` file — Wrangler auto-detects it without needing `wrangler login`. Create the token at [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) using the "Edit Cloudflare Workers" template.

---

## Chapter 7: Create Cloudflare Resources (2 min)

Create the KV namespace and D1 database that your Worker needs. The `--update-config` flag writes the resource IDs into `wrangler.jsonc` automatically.

> **Heads up:** `--update-config` *appends* a new entry rather than replacing the placeholder. After each command, you'll need to remove the old placeholder entry and keep only the new one. The D1 command also defaults the binding name to a snake_case version of the database name — you must change it to `DB` to match the code.

### Create KV Namespace

```bash
npx wrangler kv namespace create "KV" --update-config
```

> **What you should see:**
> ```
> 🌀 Creating namespace with title "fastapi-cf-worker-KV"
> ✨ Success!
> Add the following to your wrangler.jsonc:
> kv_namespaces = [
>   { binding = "KV", id = "abc123..." }
> ]
> ✅ Updated wrangler.jsonc with KV namespace ID
> ```

**After running:** Open `wrangler.jsonc` — you'll see TWO KV entries (the placeholder and the new one). Delete the placeholder entry with `"id": "<your-kv-namespace-id>"` and keep only the new one with the real UUID.

### Create D1 Database

```bash
npx wrangler d1 create fastapi-cf-worker-db --update-config
```

> **What you should see:**
> ```
> ✅ Successfully created DB 'fastapi-cf-worker-db' in region ENAM
> database_id = "def456..."
> ✅ Updated wrangler.jsonc with D1 database ID
> ```

The `--location` flag is available if you want to specify a preferred data center region (e.g., `--location wnam` for Western North America). Defaults to the nearest location.

**After running:** Open `wrangler.jsonc` and make two fixes:
1. **Remove the placeholder** D1 entry (the one with `"<your-d1-database-id>"`)
2. **Change the binding name** from `"fastapi_cf_worker_db"` (the auto-generated name) to `"DB"` — this is what the Python code expects (`env.DB`)

### Verify wrangler.jsonc

Your KV and D1 sections should each have exactly one entry with real IDs:

```jsonc
"kv_namespaces": [
  { "binding": "KV", "id": "abc123..." }   // real UUID, no placeholder
],
"d1_databases": [
  { "binding": "DB", "database_name": "fastapi-cf-worker-db", "database_id": "def456..." }  // binding MUST be "DB"
],
```

> **What you should see:** One KV entry with binding `"KV"`, one D1 entry with binding `"DB"`, both with real UUIDs. No placeholder entries remaining.

**Important:** Do NOT commit these changes. The real IDs are account-specific and will be reverted after verification (see Chapter 11).

---

## Chapter 8: Deploy (1 min)

Deploy the Worker to Cloudflare:

```bash
uv run pywrangler deploy
```

> **What you should see:**
> ```
> Uploading fastapi-cf-worker...
> Published fastapi-cf-worker (2.1 sec)
>   https://fastapi-cf-worker.<your-subdomain>.workers.dev
> ```

Copy the URL from the output — you'll need it for verification.

**Note:** The Worker is now live, but required secrets aren't set yet. If you hit `/health` right now, it will show `"degraded"` status for secrets — that's expected. We'll fix it in the next step.

**Common error:** If prompted to select an account, choose your target account and press Enter. If deploy fails with "authentication required", re-run `npx wrangler login`.

---

## Chapter 9: Set Production Secrets (1 min)

Secrets must be set AFTER the initial deploy because `npx wrangler secret put` needs the Worker to already exist on Cloudflare.

```bash
npx wrangler secret put API_KEY
# Enter your production API key value when prompted

npx wrangler secret put ADMIN_API_KEY
# Enter your production admin API key value when prompted
```

> **What you should see (for each command):**
> ```
> 🌀 Creating the secret for the Worker "fastapi-cf-worker"
> ✨ Success! Uploaded secret API_KEY
> ```

Each `secret put` automatically deploys a new version of your Worker — no need to re-run `pywrangler deploy`.

**Common error:** "Worker not found" — make sure you ran `pywrangler deploy` first (Chapter 8). The Worker must exist before you can set secrets on it.

---

## Chapter 10: Verify Live (1 min)

### Health Endpoint

```bash
curl https://fastapi-cf-worker.<your-subdomain>.workers.dev/health | python3 -m json.tool
```

> **What you should see:**
> ```json
> {
>     "status": "ok",
>     "checks": {
>         "kv": {
>             "status": "ok",
>             "latency_ms": 3.5,
>             "message": "readable (key not found)"
>         },
>         "d1": {
>             "status": "ok",
>             "latency_ms": 7.2,
>             "message": "query executed"
>         },
>         "ai": {
>             "status": "ok",
>             "latency_ms": null,
>             "message": "binding available"
>         },
>         "env_vars": {
>             "status": "ok",
>             "latency_ms": null,
>             "message": "1 env var(s) configured"
>         },
>         "secrets": {
>             "status": "ok",
>             "latency_ms": null,
>             "message": "2 required secret(s) configured"
>         },
>         "optional_secrets": {
>             "status": "ok",
>             "latency_ms": null,
>             "message": "0 of 7 optional secret(s) configured"
>         }
>     },
>     "timestamp": "2026-02-27T..."
> }
> ```

Key things to verify:
- Overall `"status": "ok"` (not `"degraded"`)
- KV and D1 probes show real `latency_ms` values (proves real bindings are connected)
- Secrets shows `"2 required secret(s) configured"`

### Swagger UI

Open in your browser:

```
https://fastapi-cf-worker.<your-subdomain>.workers.dev/docs
```

> **What you should see:** The same Swagger UI that worked locally — FastAPI's interactive API documentation with the health endpoint listed. You can click "Try it out" to test the endpoint live.

---

## Chapter 11: Cleanup (1 min)

After verification (or after recording the video), tear down all resources to avoid dashboard clutter. Run these from the template directory:

### Delete the Worker

```bash
npx wrangler delete
```

> **What you should see:** Confirmation prompt, then successful deletion message. The Worker URL will stop working immediately.

### Delete the KV Namespace

```bash
npx wrangler kv namespace delete --namespace-id <your-kv-id>
```

Replace `<your-kv-id>` with the actual KV namespace ID from your `wrangler.jsonc` (the value that `--update-config` wrote).

> **What you should see:** Successful deletion confirmation.

### Delete the D1 Database

```bash
npx wrangler d1 delete fastapi-cf-worker-db
```

> **What you should see:** Confirmation prompt, then successful deletion message.

### Revert wrangler.jsonc

Restore the placeholder IDs so the template stays clean in git:

```bash
git checkout -- wrangler.jsonc
```

> **What you should see:** No output (silent success). Running `git diff wrangler.jsonc` should show no changes.

**Common error:** If `git checkout` fails because you have other uncommitted changes in the file, manually replace the real IDs with `<your-kv-namespace-id>`, `<your-db-name>`, and `<your-d1-database-id>`.

---

## Quick Reference

| Step | Command | Purpose |
|------|---------|---------|
| Install | `uv sync` | Install Python dependencies |
| Local dev | `uv run pywrangler dev` | Start local dev server |
| Auth check | `npx wrangler whoami` | Verify Cloudflare auth |
| Create KV | `npx wrangler kv namespace create "KV" --update-config` | Create KV + auto-update config |
| Create D1 | `npx wrangler d1 create fastapi-cf-worker-db --update-config` | Create D1 + auto-update config |
| Deploy | `uv run pywrangler deploy` | Deploy Worker to Cloudflare |
| Set secret | `npx wrangler secret put SECRET_NAME` | Set production secret |
| Verify | `curl https://<worker-url>/health` | Check live health |
| Delete Worker | `npx wrangler delete` | Remove Worker |
| Delete KV | `npx wrangler kv namespace delete --namespace-id <id>` | Remove KV namespace |
| Delete D1 | `npx wrangler d1 delete fastapi-cf-worker-db` | Remove D1 database |
| Revert config | `git checkout -- wrangler.jsonc` | Restore placeholder IDs |
