---
title: "Cost Optimization Strategy: How This Project Runs at $0/Month"
description: "Explains every architecture choice that keeps the YWCC Capstone project within free-tier limits, what triggers a cost increase, and how to escape if needed."
date: 2026-03-01
last_revised: 2026-04-29
---

# Cost Optimization Strategy: How This Project Runs at $0/Month

Every architecture decision in this project serves one constraint: **$0/month operating cost**. This page explains which free tiers you depend on, how much headroom you have, what forces a cost increase, and what escape hatches exist.

> **Revised 2026-04-29 for the Cloudflare Workers cutover (PR #681).** All three sites are now Workers (`@astrojs/cloudflare` v13, `output: 'server'`), not Pages. The Pages projects are scheduled for deletion on 2026-05-03. Workers free-tier limits replace Pages limits in the tables below.

## The $0 Constraint

The YWCC Capstone project runs a public marketing site, a sponsor portal, and two RWC content sites across **six Cloudflare Workers** (3 production + 3 preview) in one CF account. All of it costs nothing to operate. That is not accidental -- it is the result of choosing each component specifically because it fits within a free tier.

```text
┌──────────────────────────────────────────────────────────┐
│              $0/month Architecture Stack                  │
│                                                          │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐ │
│  │ Astro 6 SSR  │   │ Sanity CMS   │   │ Better Auth  │ │
│  │ output:server│   │ API CDN      │   │ + D1 + KV    │ │
│  │ prerender=Y  │   │ Free images  │   │ Google/GH/ML │ │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘ │
│         │                  │                   │         │
│  ┌──────┴──────────────────┴───────────────────┴───────┐ │
│  │       Cloudflare Workers (Free Tier)                │ │
│  │  100K req/day  ·  10ms CPU/req  ·  Static Assets    │ │
│  │  6 Workers: 3 prod + 3 preview                      │ │
│  └──────┬──────────────────┬───────────────────┬───────┘ │
│         │                  │                   │         │
│  ┌──────┴───────┐   ┌─────┴────────┐   ┌─────┴───────┐ │
│  │ CF D1        │   │ CF KV        │   │ Cross-script │ │
│  │ Portal DB    │   │ SESSION_CACHE│   │ DO rate-     │ │
│  │ 5GB storage  │   │ 100K rd/day  │   │ limiter      │ │
│  └──────────────┘   └──────────────┘   └─────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## How Each Component Serves the Cost Goal

### Astro per-route prerender (only authenticated paths cost CPU)

`astro.config.mjs` sets `output: "server"` (required by Astro Actions and the new Astro 6 default). Static pages opt in via `export const prerender = true` -- 16 of the 41 page files do, and 20 explicitly opt out (`prerender = false`) for portal / SSR routes. The 16 prerendered pages bake to HTML at build time and are served from the Workers Static Assets binding (`ASSETS`) with zero Worker CPU. Public pages that need fresh content fetch from Sanity at request time but stay well under the 10ms CPU cap.

### Workers Static Assets (free hosting, unlimited bandwidth on free tier)

Each Worker has an `ASSETS` binding pointing at `./dist`. Cloudflare's edge serves prerendered HTML, JS, CSS, and images directly from the Workers Static Assets runtime -- no Worker CPU consumed for static hits. Bandwidth is unlimited on the free plan. The same codebase produces a separate Worker per environment (`CLOUDFLARE_ENV=<name> astro build && wrangler deploy`); environment-specific values come from `[env.<name>].vars` in `astro-app/wrangler.jsonc` and are baked at build time.

### Sanity CDN images (no Sharp, no build-time processing)

Sanity hosts all images on its own CDN and handles format conversion (WebP), resizing, and cropping server-side. The `urlFor()` helper in `lib/image.ts` applies `.auto('format')` and CDN resizing by default. You never run Sharp or any image processing library during builds or at runtime. This avoids the CPU and memory costs that image optimization typically demands.

### Better Auth + cross-script DO rate limiter (free auth for sponsors)

Sponsor portal authentication runs Better Auth with Google + GitHub OAuth + Resend Magic Link, sessions stored in D1 (`session` table) and cached in KV (`SESSION_CACHE`). Edge middleware enforces a 100 req / 60s sliding window via cross-script Durable Object RPC to `rate-limiter-worker`. There is no per-seat fee -- the only ceilings are 100K Worker requests/day and 1K KV writes/day on the free plan, both well above current portal traffic.

### D1 (free database for portal data)

Cloudflare D1 provides a SQLite-compatible database with 5GB storage, 5M row reads per day, and 100K row writes per day on the free plan. The portal database (`ywcc-capstone-portal`) stores Better Auth sessions, OAuth account linkages, sponsor agreement audit columns, GitHub repo linkages, newsletter subscribers, and event-reminder dedupe state -- all low-volume workloads that fit comfortably within these limits. Shared by `ywcc-capstone` and `ywcc-event-reminders` Workers.

### Better Auth with Google + GitHub OAuth + Magic Link (no bcrypt CPU)

Sponsor authentication uses Better Auth configured for Google OAuth, GitHub OAuth, and Resend-powered Magic Links. Identity providers handle credential verification. Better Auth stores sessions in D1 and sets cookies. This avoids password hashing (bcrypt), which is CPU-intensive and would push SSR routes past the 10ms CPU limit on the free Workers plan. Each portal login stays under ~3-6ms of CPU time.

## Free Tier Limits

Every external service this project depends on has a free tier. Here are the limits that matter:

| Service | Resource | Free Limit | Reset Cycle |
|:--------|:---------|:-----------|:------------|
| Sanity | API requests | 100K/month | Monthly |
| Sanity | Documents | 10K | -- |
| Sanity | Assets | 5GB | -- |
| CF Workers | Requests | 100K/day | Daily |
| CF Workers | CPU per invocation | 10ms | Per invocation |
| CF Workers | Subrequests per request | 50 | Per invocation |
| CF Workers | Static Assets bandwidth | Unlimited | -- |
| CF D1 | Row reads | 5M/day | Daily |
| CF D1 | Row writes | 100K/day | Daily |
| CF D1 | Storage | 5GB (500MB/database) | -- |
| CF KV | Reads | 100K/day | Daily |
| CF KV | Writes | 1K/day | Daily |
| CF Durable Objects | Requests | 100K/day | Daily |

> Build minutes are no longer a free-tier concern: builds run in CI (`ci.yml`) and are deployed via `wrangler deploy` from your machine or CI. There is no Pages-style 500/month build cap.

## Current Usage vs. Limits

These numbers reflect the current deployment: three Workers (capstone production + rwc-us + rwc-intl) plus three preview Workers, with a sponsor portal serving ~20 sponsors and the agreement gate active.

| Resource | Current Usage | Free Limit | Utilization | Headroom |
|:---------|:-------------|:-----------|:------------|:---------|
| Sanity API requests | ~10K/month (builds + portal) | 100K/month | 10% | 10x |
| Worker requests (all 6 Workers) | ~2.2K/day | 100K/day | 2.2% | 45x |
| CPU per SSR page | ~3-6ms | 10ms | 30-60% | 2-3x |
| Subrequests per SSR page | ~3-8 | 50 | 6-16% | 6-15x |
| D1 row reads | ~200/day | 5M/day | <0.01% | 25,000x |
| D1 row writes | ~50/day | 100K/day | <0.01% | 2,000x |
| D1 storage | ~5MB | 5GB | 0.1% | 1,000x |
| KV reads | ~2K/day | 100K/day | 2% | 50x |
| KV writes | ~100/day | 1K/day | 10% | 10x |
| DO requests (rate limiter) | ~2K/day | 100K/day | 2% | 50x |

**CPU per SSR page is the tightest limit.** Every other resource has at least 10x headroom. The 10ms CPU cap leaves 2-3x headroom per request, which is sufficient because Cloudflare measures CPU time (not wall-clock time) and network I/O does not count.

### How CPU Budget Breaks Down per SSR Page

| Operation | CPU Cost |
|:----------|:---------|
| Better Auth session check (D1 + KV) | ~1-2ms |
| Cross-script DO rate-limit RPC | ~0.5-1ms |
| Sanity GROQ fetch + parse | ~1-2ms |
| Response serialization | ~1-2ms |
| **Total** | **~3-6ms** (under 10ms cap) |

Network I/O (Sanity API calls, D1 round-trips, DO RPC over the wire) is wall-clock time, not CPU time. Only computation counts against the 10ms limit.

## What Triggers a Cost Increase

Two realistic upgrade paths exist. Both are incremental -- you do not jump from $0 to an expensive plan.

### Path 1: Workers Paid Plan ($5/month)

This upgrade unlocks platform features that the free plan cannot support:

| Feature | Why Free Plan Blocks It |
|:--------|:-----------------------|
| Python Workers (FastAPI API, Discord bot) production wiring | 10ms CPU cap -- Python needs 50-500ms |
| Multiple Cron Triggers | Free plan allows 5 -- the event-reminders Worker uses 1; planned features add more |
| Queue retry tolerance | 24-hour message retention -- outages lose messages |
| Subrequest fan-out | 50/request -- aggregated API patterns hit 3-5 services per request |

The $5/month plan changes daily limits to monthly budgets (eliminating daily cliffs), raises CPU time to 5 minutes per invocation, and includes 10M requests/month. Every current free-plan resource receives orders-of-magnitude more headroom.

**Trigger:** You need this upgrade when `platform-api` (currently a placeholder scaffold) goes live, or when any feature requires more than 5 cron triggers, or sustained Python Worker load.

### Path 2: VPS Migration ($6/month)

If the project outgrows Cloudflare's model entirely -- need for PostgreSQL, desire for unlimited SSR CPU, or operational preference for self-hosting -- a documented migration path exists. The VPS plan replaces the entire Cloudflare stack with a Dockerized self-hosted setup:

| Component | Cloudflare (Current) | VPS (Migration) |
|:----------|:--------------------|:----------------|
| Hosting | CF Workers + Static Assets (free) | nginx + Astro Node.js |
| Database | D1 (SQLite, daily limits) | PostgreSQL (no limits) |
| Auth | Better Auth on D1 (no seat limit) | Authentik or Better Auth on PG |
| Rate limiter | Cross-script Durable Object | nginx rate-limit module / Redis |
| CDN | Cloudflare edge (built-in) | Cloudflare DNS proxy (free) |
| Cost | $0/month | $6/month (existing VPS) |

The full migration plan, including Docker Compose configuration, CI/CD pipeline, and rollback procedures, is in [VPS Migration Plan](vps-migration-plan.md).

**Trigger:** You need this migration when you need full Node.js runtime without CPU caps, want PostgreSQL instead of D1, or want operational consolidation onto an existing VPS.

## Staying Within $0: The Rules

These practices keep the project inside free-tier limits:

1. **Prerender what you can.** Public pages with no per-request data (`articles/`, `authors/`, `events/`, `gallery/`, `projects/`, `sponsors/`) opt in via `export const prerender = true` and serve from Workers Static Assets. Only add SSR (`prerender = false`) when the page genuinely needs request-time data.

2. **Batch D1 queries.** Use `db.batch()` to combine multiple queries into one subrequest. Each subrequest counts against the 50/invocation free-plan limit.

```typescript
// One subrequest instead of three
const [user, links, agreement] = await db.batch([
  db.prepare('SELECT * FROM user WHERE id = ?').bind(userId),
  db.prepare('SELECT * FROM project_github_repos WHERE user_id = ?').bind(userId),
  db.prepare('SELECT agreement_version, agreement_accepted_at FROM user WHERE id = ?').bind(userId),
]);
```

3. **Index every WHERE column.** Unindexed queries do full table scans. Every scanned row counts against the 5M reads/day limit, even if it does not match the filter.

4. **Use Sanity CDN for images.** Never import Sharp or run image transforms at build time. The `urlFor()` helper handles format conversion and resizing via Sanity's CDN.

5. **Cache module-level lookups.** `_sponsorsCache` and `_siteSettingsCache` in `lib/sanity.ts` short-circuit repeated reads. Skip the cache when `visualEditingEnabled === true` (drafts must be fresh).

6. **Keep React island props minimal.** Large serialized props increase response size and CPU cost. Pass IDs and let islands fetch their own data if needed. Public pages have **zero React runtime** -- islands are restricted to portal (`client:load`) and visual editing (`client:only="react"`).

7. **Bind D1 / KV / DO only where needed.** RWC content Workers (`rwc-us`, `rwc-intl`) and all preview Workers do not bind D1, KV, or DO. Portal/auth/api routes return 503 if hit there. This keeps daily request counts focused on the capstone Worker.

## Decision Map

When evaluating a new feature, follow this sequence:

```text
Can it run at build time (prerender = true)?
  YES → Add it as a prerendered page. Cost: $0 (served from ASSETS).
  NO  ↓

Does it fit in 10ms CPU and 50 subrequests per invocation?
  YES → Add it as an SSR route. Cost: $0.
  NO  ↓

Does it need Python Workers, >5 crons, or >50 subrequests?
  YES → Upgrade to Workers Paid ($5/month).
  NO  ↓

Does it need PostgreSQL, full Node.js runtime, or self-hosted ops?
  YES → Migrate to VPS ($6/month).
```

## Summary

The $0/month constraint is not a limitation to work around -- it is the architectural north star that drives every component choice. Per-route prerender keeps Worker CPU off the public site. Sanity CDN eliminates image processing costs. Better Auth on D1 eliminates auth-vendor seat fees. D1 eliminates database hosting costs. OAuth + magic links eliminate password hashing costs. The cross-script Durable Object pattern keeps rate-limit state inside the free-tier DO budget without paying per-Worker.

The current deployment uses less than 10% of most free-tier limits and less than 60% of the tightest one (CPU per SSR page). When the project outgrows these limits, two documented upgrade paths exist: $5/month for expanded Cloudflare limits, or $6/month for a self-hosted VPS with no limits at all.
