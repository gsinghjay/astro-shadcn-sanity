---
title: "Cost Optimization Strategy: How This Project Runs at $0/Month"
description: "Explains every architecture choice that keeps the YWCC Capstone project within free-tier limits, what triggers a cost increase, and how to escape if needed."
date: 2026-03-01
---

# Cost Optimization Strategy: How This Project Runs at $0/Month

Every architecture decision in this project serves one constraint: **$0/month operating cost**. This page explains which free tiers you depend on, how much headroom you have, what forces a cost increase, and what escape hatches exist.

## The $0 Constraint

The YWCC Capstone project runs a public marketing site, a sponsor portal, and a student portal across multiple Cloudflare Pages deployments. All of it costs nothing to operate. That is not accidental -- it is the result of choosing each component specifically because it fits within a free tier.

```text
┌──────────────────────────────────────────────────────────┐
│              $0/month Architecture Stack                  │
│                                                          │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐ │
│  │ Astro (SSG)  │   │ Sanity CMS   │   │ CF Access    │ │
│  │ Static HTML  │   │ API CDN      │   │ Edge auth    │ │
│  │ Zero CPU     │   │ Free images  │   │ <=50 seats   │ │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘ │
│         │                  │                   │         │
│  ┌──────┴──────────────────┴───────────────────┴───────┐ │
│  │           Cloudflare Pages (Free Tier)              │ │
│  │  500 builds/mo  ·  Unlimited bandwidth  ·  Global   │ │
│  └──────┬──────────────────┬───────────────────┬───────┘ │
│         │                  │                   │         │
│  ┌──────┴───────┐   ┌─────┴────────┐   ┌─────┴───────┐ │
│  │ CF Workers   │   │ CF D1        │   │ Better Auth  │ │
│  │ SSR portal   │   │ Portal DB    │   │ Student auth │ │
│  │ 10ms CPU cap │   │ 5GB storage  │   │ Google OAuth │ │
│  └──────────────┘   └──────────────┘   └─────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## How Each Component Serves the Cost Goal

### Astro static output (no SSR CPU for public pages)

`astro.config.mjs` sets `output: "static"`. Every public page -- home, sponsors, projects, events -- pre-renders to HTML at build time. Cloudflare's CDN serves these files from edge cache. Zero Worker invocations, zero CPU time, zero subrequests. The public site consumes no metered resources at all.

Only `/portal/*` and `/student/*` routes opt into SSR via `export const prerender = false`. This confines Worker CPU usage to authenticated pages where it is unavoidable.

### Sanity CDN images (no Sharp, no build-time processing)

Sanity hosts all images on its own CDN and handles format conversion (WebP), resizing, and cropping server-side. The `urlFor()` helper in `lib/image.ts` applies `.auto('format')` and CDN resizing by default. You never run Sharp or any image processing library during builds or at runtime. This avoids the CPU and memory costs that image optimization typically demands.

### Cloudflare Pages (free hosting, unlimited bandwidth)

Cloudflare Pages serves static assets from a global CDN with unlimited bandwidth and 500 builds per month. Three separate Pages projects (capstone, rwc-us, rwc-intl) share the same repository and build from the same codebase -- only environment variables differ. Each push triggers up to 3 builds, but with ~30-60 builds per month total, you stay well under the 500-build limit.

### Cloudflare Access (free auth for sponsors)

Cloudflare Access provides edge-level authentication for the sponsor portal at no cost for up to 50 seats. Unauthenticated requests to `/portal/*` never reach the Worker. This eliminates CPU consumption from unauthorized traffic and provides a security layer that costs nothing to maintain in code.

### D1 (free database for portal data)

Cloudflare D1 provides a SQLite-compatible database with 5GB storage, 5M row reads per day, and 100K row writes per day on the free plan. The portal database stores student records, event RSVPs, agreement signatures, and notification preferences -- all low-volume workloads that fit comfortably within these limits.

### Better Auth with Google OAuth only (no bcrypt CPU)

Student authentication uses Better Auth configured for Google OAuth exclusively. Google handles the identity verification. Better Auth stores the session in D1 and sets a cookie. This avoids password hashing (bcrypt), which is CPU-intensive and would push SSR routes past the 10ms CPU limit on the free Workers plan. By constraining the auth flow to Google-only, each student login stays under 3ms of CPU time.

## Free Tier Limits

Every external service this project depends on has a free tier. Here are the limits that matter:

| Service | Resource | Free Limit | Reset Cycle |
|:--------|:---------|:-----------|:------------|
| Sanity | API requests | 100K/month | Monthly |
| Sanity | Documents | 10K | -- |
| Sanity | Assets | 5GB | -- |
| CF Pages | Builds | 500/month | Monthly |
| CF Pages | Bandwidth | Unlimited | -- |
| CF Workers | Requests | 100K/day | Daily |
| CF Workers | CPU per invocation | 10ms | Per invocation |
| CF Access | Seats | 50 | -- |
| CF D1 | Row reads | 5M/day | Daily |
| CF D1 | Row writes | 100K/day | Daily |
| CF D1 | Storage | 5GB (500MB/database) | -- |
| CF KV | Reads | 100K/day | Daily |
| CF KV | Writes | 1K/day | Daily |

## Current Usage vs. Limits

These numbers reflect the current deployment: a public static site, a sponsor portal with ~20 users, and a student portal with ~400 students per semester.

| Resource | Current Usage | Free Limit | Utilization | Headroom |
|:---------|:-------------|:-----------|:------------|:---------|
| Sanity API requests | ~10K/month (builds) | 100K/month | 10% | 10x |
| CF Pages builds | ~30-60/month | 500/month | 6-12% | 8-16x |
| Worker requests | ~2.2K/day | 100K/day | 2.2% | 45x |
| CPU per SSR page | ~3-6ms | 10ms | 30-60% | 2-3x |
| CF Access seats | ~20 | 50 | 40% | 2.5x |
| D1 row reads | ~200/day | 5M/day | <0.01% | 25,000x |
| D1 row writes | ~50/day | 100K/day | <0.01% | 2,000x |
| D1 storage | ~5MB | 5GB | 0.1% | 1,000x |
| KV reads | ~2K/day | 100K/day | 2% | 50x |
| KV writes | ~100/day | 1K/day | 10% | 10x |

**CPU per SSR page is the tightest limit.** Every other resource has at least 10x headroom. The 10ms CPU cap leaves 2-3x headroom per request, which is sufficient because Cloudflare measures CPU time (not wall-clock time) and network I/O does not count.

### How CPU Budget Breaks Down per SSR Page

| Operation | CPU Cost |
|:----------|:---------|
| JWT validation (jose library) | ~1-2ms |
| D1 query (single, indexed) | ~0.5-1ms |
| Response serialization | ~1-2ms |
| **Total** | **~3-6ms** (under 10ms cap) |

Network I/O (Sanity API calls, D1 round-trips) is wall-clock time, not CPU time. Only computation counts against the 10ms limit.

## What Triggers a Cost Increase

Two realistic upgrade paths exist. Both are incremental -- you do not jump from $0 to an expensive plan.

### Path 1: Workers Paid Plan ($5/month)

This upgrade unlocks Phase 3 platform features that the free plan cannot support:

| Feature | Why Free Plan Blocks It |
|:--------|:-----------------------|
| Python Workers (FastAPI API, Discord bot) | 10ms CPU cap -- Python needs 50-500ms |
| Multiple Cron Triggers | Free plan allows 5 -- Phase 3 needs 6-8 |
| Queue retry tolerance | 24-hour message retention -- outages lose messages |
| Subrequest fan-out | 50/request -- Aggregated API calls 3-5 services per request |

The $5/month plan changes daily limits to monthly budgets (eliminating daily cliffs), raises CPU time to 5 minutes per invocation, and includes 10M requests/month. Every current free-plan resource receives orders-of-magnitude more headroom.

**Trigger:** You need this upgrade when any Phase 3 feature (Aggregated API, Discord bot, or more than 5 cron jobs) is ready to deploy.

### Path 2: VPS Migration ($6/month)

If the project outgrows Cloudflare's model entirely -- more than 50 sponsor seats, need for PostgreSQL, or desire for unlimited SSR CPU -- a documented migration path exists. The VPS plan replaces the entire Cloudflare stack with a Dockerized self-hosted setup:

| Component | Cloudflare (Current) | VPS (Migration) |
|:----------|:--------------------|:----------------|
| Hosting | CF Pages (free) | nginx + Astro Node.js |
| Database | D1 (SQLite, daily limits) | PostgreSQL (no limits) |
| Auth (sponsors) | CF Access (50 seats) | Authentik (no seat limit) |
| CDN | Cloudflare edge (built-in) | Cloudflare DNS proxy (free) |
| Cost | $0/month | $6/month (existing VPS) |

The full migration plan, including Docker Compose configuration, CI/CD pipeline, and rollback procedures, is in [VPS Migration Plan](vps-migration-plan.md).

**Trigger:** You need this migration when sponsor count exceeds 50, you need full Node.js runtime without CPU caps, or you want PostgreSQL instead of D1.

## Staying Within $0: The Rules

These practices keep the project inside free-tier limits:

1. **Default to static.** Every new public page pre-renders at build time. Only add `prerender = false` when the page requires authenticated data.

2. **Batch D1 queries.** Use `db.batch()` to combine multiple queries into one subrequest. Each subrequest counts against the 50/invocation free-plan limit.

```typescript
// One subrequest instead of three
const [rsvps, agreements, prefs] = await db.batch([
  db.prepare('SELECT * FROM event_rsvps WHERE sponsor_email = ?').bind(email),
  db.prepare('SELECT * FROM agreement_signatures WHERE sponsor_email = ?').bind(email),
  db.prepare('SELECT * FROM notification_preferences WHERE sponsor_email = ?').bind(email),
]);
```

3. **Index every WHERE column.** Unindexed queries do full table scans. Every scanned row counts against the 5M reads/day limit, even if it does not match the filter.

4. **Use Sanity CDN for images.** Never import Sharp or run image transforms at build time. The `urlFor()` helper handles format conversion and resizing via Sanity's CDN.

5. **Cache the JWKS public key.** Store Cloudflare's signing key in a module-level variable so JWT validation does not fetch it on every request.

6. **Keep React island props minimal.** Large serialized props increase response size and CPU cost. Pass IDs and let islands fetch their own data if needed.

## Decision Map

When evaluating a new feature, follow this sequence:

```text
Can it run at build time (static)?
  YES → Add it as a static page. Cost: $0.
  NO  ↓

Does it fit in 10ms CPU and 50 subrequests?
  YES → Add it as an SSR route. Cost: $0.
  NO  ↓

Does it need Python Workers, >5 crons, or >50 subrequests?
  YES → Upgrade to Workers Paid ($5/month).
  NO  ↓

Does it need >50 auth seats or PostgreSQL?
  YES → Migrate to VPS ($6/month).
```

## Summary

The $0/month constraint is not a limitation to work around -- it is the architectural north star that drives every component choice. Static output eliminates Worker costs for the public site. Sanity CDN eliminates image processing costs. Cloudflare Access eliminates auth infrastructure costs. D1 eliminates database hosting costs. Google-only OAuth eliminates password hashing costs.

The current deployment uses less than 10% of most free-tier limits and less than 60% of the tightest one (CPU per SSR page). When the project outgrows these limits, two documented upgrade paths exist: $5/month for expanded Cloudflare limits, or $6/month for a self-hosted VPS with no limits at all.
