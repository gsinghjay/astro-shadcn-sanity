---
title: "Cloudflare Guide"
description: "Operational guide for the YWCC Capstone Cloudflare deployment — Workers, D1, KV, DO, Turnstile."
date: 2026-02-25
last_revised: 2026-04-29
status: active
---

# Cloudflare Guide

Operational reference for the YWCC Capstone Cloudflare stack: deploy, monitor, and troubleshoot on Workers + D1 + KV + Durable Objects + Turnstile.

> **Revised 2026-04-29 for the Cloudflare Workers cutover (PR #681).** This project no longer uses Cloudflare Pages — all six sites (3 production + 3 preview) run as Workers via `@astrojs/cloudflare` v13 (`output: 'server'`). The legacy Pages projects are scheduled for deletion on **2026-05-03**. Cloudflare Access has also been retired in favor of Better Auth.

This doc previously claimed to be the "single source of truth" for the Cloudflare stack. With the cutover, that role is split across:

- **Topology + per-part architecture** → [architecture.md](architecture.md)
- **Resources, bindings, env vars, handoff** → [cloudflare-infrastructure-guide.md](cloudflare-infrastructure-guide.md)
- **Common commands, deploy, schema/D1 pipelines** → [development-guide.md](development-guide.md)
- **Cross-script rate-limit DO** → [rate-limiting-with-durable-objects.md](rate-limiting-with-durable-objects.md)
- **Free-tier limits and headroom** → [cost-optimization-strategy.md](cost-optimization-strategy.md)
- **Better Auth migration rationale** → [auth-consolidation-strategy.md](auth-consolidation-strategy.md)
- **D1 schema, GROQ queries** → [data-models.md](data-models.md)

This guide collects operational items that don't fit cleanly elsewhere: monitoring, observability, plan trade-offs, troubleshooting, VPS escape hatch, and platform features on the roadmap.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Plan Comparison: Free vs Workers Paid ($5/month)](#2-plan-comparison-free-vs-workers-paid-5month)
3. [Monitoring and Observability](#3-monitoring-and-observability)
4. [Troubleshooting](#4-troubleshooting)
5. [VPS Migration Path](#5-vps-migration-path)
6. [Platform Capabilities (current + roadmap)](#6-platform-capabilities-current--roadmap)

---

## 1. Overview

### Architecture (current)

Six Workers in **one** Cloudflare account host the YWCC public sites + Studio Presentation previews. The capstone Worker also has D1 + KV + a cross-script Durable Object for the rate limiter. RWC and preview Workers are content-only.

```
Visitor (any of 3 prod hosts) → CF edge
                                 ↓
                       Cloudflare Worker
            ┌─ ASSETS binding ──── prerendered HTML / JS / CSS / images
            │
            └─ Astro 6 SSR entry ─ middleware.ts
                                     ↓ (portal routes only)
                                   rate-limit DO RPC (cross-script → rate-limiter-worker)
                                     ↓
                                   Better Auth session check (D1 + KV cache)
                                     ↓
                                   sponsor agreement gate (audit columns on `user`)
                                     ↓
                                   route handler / Astro Action / API
```

### Services in use

| Service | Status | Purpose |
|:--------|:-------|:--------|
| **Workers** (6 in this repo) | Active | Astro SSR + ASSETS for ywcc-capstone, rwc-us, rwc-intl, *-preview |
| **D1** | Active | `ywcc-capstone-portal` — Better Auth + sponsor agreement audit + GitHub linkages |
| **KV** | Active | `SESSION_CACHE` for Better Auth (capstone Worker only) |
| **Durable Objects** | Active | `SlidingWindowRateLimiter` in `rate-limiter-worker`, cross-script-bound from capstone |
| **Cron Triggers** | Active | `ywcc-event-reminders` daily 09:00 UTC |
| **Turnstile** | Active | Bot protection for forms (capstone) |
| **Workers Static Assets** | Active | `ASSETS` binding on every Worker (free unlimited bandwidth) |
| **Deploy Hooks** | Active | Sanity webhook → 3 deploy hooks (one per production Worker) |
| **Workers AI** | Active (out-of-tree) | RAG via `capstone-ask-worker` over AI Search index `bf002610-…` |
| **AI Search** | Active (out-of-tree) | Index `bf002610-921a-4047-9298-cc2d2668451a` |
| **R2** | Not used | — |
| **Queues** | Not used | — |
| **Analytics Engine** | Not used | — |
| **Pages** | **Retired (deletion 2026-05-03)** | Custom domains detached and re-attached to Workers |
| **Cloudflare Access (Zero Trust)** | **Retired** | Replaced by Better Auth |

### Key files

| File | Role |
|:-----|:-----|
| `astro-app/astro.config.mjs` | `output: "server"`, `adapter: cloudflare({ imageService: 'compile' })`, env schema, Vite + sitemap + llms-md |
| `astro-app/wrangler.jsonc` | One config; six `[env.*]` blocks (capstone / rwc_us / rwc_intl + 3 preview). `main: "@astrojs/cloudflare/entrypoints/server"` |
| `astro-app/public/_headers` | Static-asset CSP, STS, Permissions-Policy (served via ASSETS) |
| `astro-app/src/env.d.ts` | `Cloudflare.Env` augmentation (DO RPC interface, secrets) |
| `astro-app/src/middleware.ts` | Rate-limit + Better Auth session check + agreement gate |
| `astro-app/src/lib/auth-config.ts` | Better Auth instance |
| `astro-app/src/lib/db.ts` + `drizzle-schema.ts` | D1 wrapper + Drizzle schema |
| `rate-limiter-worker/src/index.ts` | `SlidingWindowRateLimiter` Durable Object |
| `event-reminders-worker/src/index.ts` | Cron `scheduled()` handler |

---

## 2. Plan Comparison: Free vs Workers Paid ($5/month)

This project runs entirely on the **free plan** today. Below is what each plan includes for the surfaces this project actually uses.

### Free plan (current)

| Resource | Free allowance | Estimated daily usage |
|:---------|:--------------|:----------------------|
| Worker requests | 100K/day | ~2.2K (across all 6 Workers) |
| Worker CPU time | 10ms / invocation | ~3-6ms per SSR page |
| Worker subrequests | 50 / invocation | ~3-8 per SSR page |
| Workers Static Assets bandwidth | Unlimited | — |
| D1 row reads | 5M/day | ~200/day |
| D1 row writes | 100K/day | ~50/day |
| D1 storage | 5 GB (500MB per DB) | ~5 MB |
| KV reads | 100K/day | ~2K/day |
| KV writes | 1K/day | ~100/day |
| Durable Objects requests | 100K/day | ~2K/day (capstone only) |
| Durable Objects storage | 5 GB / account | Negligible (timestamps, pruned by alarm) |
| Cron Triggers | 5 active | 1 (ywcc-event-reminders) |
| Static Assets bandwidth | Unlimited | — |

The tightest constraint is **CPU per invocation** at 10ms — currently 30-60% utilized. See [cost-optimization-strategy.md](cost-optimization-strategy.md) for the per-operation breakdown and what triggers a paid upgrade.

### Workers Paid ($5/month)

Switching plans does not change any code. The wrangler config and bindings work identically on either plan.

| Resource | Paid plan |
|:---------|:----------|
| Worker requests | 10M/month included, then $0.30/M |
| Worker CPU time | Up to 5 minutes per invocation |
| Worker subrequests | 1000 per invocation |
| D1 storage | 50 GB included |
| D1 reads | 25B/month |
| D1 writes | 50M/month |
| KV reads | 10M/month |
| KV writes | 1M/month |
| Durable Objects | 1M requests/month, 400K GB-s compute |
| Cron Triggers | Unlimited |
| Python Workers | Production-eligible (free plan can run them but daily limits make this fragile) |
| Email Workers, Queues, Analytics Engine | Available |

**Trigger to upgrade:** any of these ship — `platform-api` going live in production, sustained Python Worker traffic, more than 5 cron triggers, real abuse traffic exhausting free-plan DO requests.

---

## 3. Monitoring and Observability

Every Worker has `observability.enabled: true` with `head_sampling_rate: 1` (100% of invocations sampled into Workers Logs). Logs are accessible from the dashboard or via `wrangler tail`.

### Tail logs locally

```bash
# Tail a single Worker
npx wrangler tail --name ywcc-capstone

# With format JSON for piping
npx wrangler tail --name ywcc-capstone --format json | jq .

# Filter to errors only
npx wrangler tail --name ywcc-capstone --status error

# Tail standalone Workers
npx wrangler tail --name rate-limiter-worker
npx wrangler tail --name ywcc-event-reminders
```

### Dashboard

- **Workers logs**: dashboard → Workers & Pages → `<worker>` → Logs.
- **Workers metrics**: requests, errors, CPU time per Worker (last 24h, 7d, 30d).
- **D1 metrics**: dashboard → Workers & Pages → D1 → `ywcc-capstone-portal` → Metrics.
- **KV metrics**: dashboard → Workers & Pages → KV → `<namespace>` → Metrics.
- **DO metrics**: dashboard → Workers & Pages → `rate-limiter-worker` → Durable Objects.

### Health checks

- `/portal/api/db-health` (capstone, authenticated): exposes table names and row counts. ⚠ Known risk — exposes SQLite metadata to any authenticated user. TODO: gate behind admin role.
- `event-reminders-worker` exposes a thin `fetch()` for uptime monitors (no auth, returns `200 ok`).

### Sanity webhook delivery

- Sanity dashboard → API → Webhooks → Attempts tab. Look for `200 OK` per deploy hook.
- If a webhook attempt is `5xx`, the corresponding production Worker did not get a content rebuild — re-trigger via dashboard or the deploy hook URL.

---

## 4. Troubleshooting

The most common problems and fixes. For installation / setup issues, see [development-guide.md](development-guide.md).

### `[object Object]` in SSR responses

**Symptom**: Pages render the literal string `[object Object]` instead of HTML, or middleware-routed responses break.

**Cause**: Astro 6 + `@astrojs/cloudflare` v13 + `nodejs_compat` emits SSR responses as async iterables that the `workerd` runtime stringifies incorrectly. Documented in Astro #15434 / #14511.

**Fix**: confirm `compatibility_flags` in `wrangler.jsonc` includes `disable_nodejs_process_v2`:

```jsonc
"compatibility_flags": [
  "nodejs_compat",
  "global_fetch_strictly_public",
  "disable_nodejs_process_v2"
]
```

This is a workaround. Remove `disable_nodejs_process_v2` only after `compatibility_date >= 2026-02-19` (which lands `fetch_iterable_type_support`). Bumping `compatibility_date` past `2025-12-01` requires re-validating the workaround flag set.

### `503 Service Unavailable` on `/portal/*`

**Cause**: Either the request hit `rwc-us` / `rwc-intl` (no D1/KV/DO bindings) or a binding is missing on `ywcc-capstone`.

**Fix**: confirm the URL hits `www.ywcccapstone1.com` (capstone). If yes, check D1 + KV + DO bindings in `[env.capstone]` of `wrangler.jsonc`, then regenerate types and redeploy:

```bash
npx wrangler types -C astro-app
npm run deploy:capstone -w astro-app
```

### Capstone deploy fails with "DO class not found"

**Cause**: `rate-limiter-worker` is not deployed (or has been deleted). The cross-script DO binding fails at deploy time.

**Fix**: deploy the rate limiter first, then capstone:

```bash
npm run deploy:rate-limiter        # (root)
npm run deploy:capstone -w astro-app
```

### OAuth `redirect_uri_mismatch`

**Cause**: The Google or GitHub OAuth app does not list the deployment URL as an authorized redirect URI.

**Fix**: in the OAuth provider:

```
https://www.ywcccapstone1.com/api/auth/callback/google
https://www.ywcccapstone1.com/api/auth/callback/github
```

For Studio Presentation preview iframe: `https://ywcc-capstone-preview.js426.workers.dev` (preview Workers don't run the auth flow but the URL must be valid for any test sign-in attempts).

### Login redirects in a loop

**Cause**: `BETTER_AUTH_URL` mismatch.

**Fix**: confirm `[env.capstone].vars.BETTER_AUTH_URL` is `https://www.ywcccapstone1.com` (the canonical `www` host — apex `ywcccapstone1.com` 301s to `www` via a zone-level Single Redirect rule and never reaches the Worker).

### Turnstile rejects all form submissions

**Cause**: `TURNSTILE_SECRET_KEY` is missing on `ywcc-capstone`, or the public key in `wrangler.jsonc` doesn't match the dashboard widget.

**Fix**:

```bash
# Confirm the public site key
grep PUBLIC_TURNSTILE_SITE_KEY astro-app/wrangler.jsonc

# Confirm the secret is set on the Worker
npx wrangler secret list --name ywcc-capstone | grep TURNSTILE_SECRET_KEY

# If missing
npx wrangler secret put TURNSTILE_SECRET_KEY --name ywcc-capstone
```

### `wrangler.jsonc` change doesn't take effect

**Cause**: stale `worker-configuration.d.ts` or cached `.wrangler/`.

**Fix**:

```bash
npx wrangler types -C astro-app
rm -rf astro-app/.wrangler astro-app/dist
npm run deploy:<env> -w astro-app
```

### GitHub OAuth fails with valid client ID

**Cause**: at production cutover, `GITHUB_CLIENT_SECRET` must be re-put with the **prod GitHub OAuth App's** secret (paired with `GITHUB_CLIENT_ID Ov23liFtOiWIyCqJXJMi`). The staging-phase secret paired with `Ov23li8R7jigMPatjOml` is no longer valid.

**Fix**:

```bash
npx wrangler secret put GITHUB_CLIENT_SECRET --name ywcc-capstone
# paste the prod GitHub OAuth App secret
```

### D1 query returns 0 rows where data should exist

**Cause**: querying via `ywcc-event-reminders` after migrations have only been applied to the local DB.

**Fix**: confirm migrations applied to remote:

```bash
cd astro-app
npx wrangler d1 migrations list PORTAL_DB --remote
npx wrangler d1 migrations apply PORTAL_DB --remote
```

Then redeploy both `ywcc-capstone` and `ywcc-event-reminders` (they both bind the same DB).

---

## 5. VPS Migration Path

If the project ever outgrows Cloudflare's model — needs PostgreSQL, full Node.js runtime without CPU caps, or operational consolidation onto an existing VPS — the [VPS Migration Plan](vps-migration-plan.md) documents the full escape hatch:

- nginx + Astro Node.js (replaces Workers)
- PostgreSQL (replaces D1)
- Better Auth on PG (no rewrite — same library, different adapter)
- nginx rate-limit module or Redis (replaces cross-script DO)
- Cloudflare DNS proxy (free, keeps the edge benefits)

Estimated cost: $6/month on an existing VPS. The migration is documented as Docker Compose-based with a CI/CD pipeline and rollback procedures.

---

## 6. Platform Capabilities (current + roadmap)

What's wired today versus what's available if needed.

### Currently wired

- **Astro 6 SSR** on Workers (3 prod + 3 preview).
- **D1** for portal data, sessions, audit columns.
- **KV** for session caching.
- **Cross-script Durable Object** for sliding-window rate limiting (100 req / 60s on portal routes).
- **Cron Trigger** (1) for daily event reminders.
- **Turnstile** for form bot protection.
- **Workers Static Assets** for prerendered HTML / JS / CSS / images (unlimited bandwidth).
- **Deploy Hooks** for Sanity content rebuilds (one per production Worker).

### Available but not yet wired

- **R2** (object storage) — could host Lighthouse / Pa11y report dumps if we want CI history persisted.
- **Queues** — async fan-out for any future notification or audit pipeline.
- **Analytics Engine** — typed time-series for portal activity tracking and admin dashboards.
- **Workers AI** — used today via the out-of-tree `capstone-ask-worker` (RAG over AI Search), but could also wire chatbot generation, form classification, or content moderation directly into `ywcc-capstone`.
- **Python Workers** — `platform-api` exists as a scaffold (placeholder KV/D1 IDs). Going live requires real binding IDs and a service binding from `ywcc-capstone`.
- **Hyperdrive** — for connecting to external Postgres (e.g. if a sponsor system integration ever needs a non-CF database).
- **Vectorize** — alternative RAG store; AI Search is currently sufficient.
- **Email Workers** — could replace Resend for transactional mail if we want to consolidate.

### Considered and explicitly NOT used

- **Cloudflare Pages** — retired. Pages projects scheduled for deletion 2026-05-03.
- **Cloudflare Access (Zero Trust)** — retired in favor of Better Auth (no per-seat cap, unified auth surface).
- **Cloudflare Images** — `imageService: 'compile'` is pinned in `astro.config.mjs` (the v13 default `cloudflare-binding` is deferred). Sanity images already bypass Astro's `<Image>` and use the Sanity CDN directly via `urlFor()`.

---

## See also

- [architecture.md](architecture.md) — full topology + per-part architecture
- [cloudflare-infrastructure-guide.md](cloudflare-infrastructure-guide.md) — resources, env vars, bindings, handoff checklist
- [development-guide.md](development-guide.md) — commands, deploy steps, schema/D1 pipelines
- [rate-limiting-with-durable-objects.md](rate-limiting-with-durable-objects.md) — cross-script DO design
- [auth-consolidation-strategy.md](auth-consolidation-strategy.md) — Better Auth migration
- [cost-optimization-strategy.md](cost-optimization-strategy.md) — free-tier limits + headroom
- [data-models.md](data-models.md) — Sanity schemas, GROQ inventory, D1 tables
