# Project Overview

**Project:** ywcc-capstone-template
**Version:** 1.18.0
**Repository:** https://github.com/gsinghjay/astro-shadcn-sanity
**Branch documented:** `preview`
**Generated:** 2026-04-15

## Executive summary

The YWCC Industry Capstone platform is a multi-site, content-driven marketing site plus authenticated sponsor/student portal for NJIT's Ying Wu College of Computing capstone program. A single Astro 5 frontend serves three branded variants (capstone, RWC US, RWC International) from one Sanity Content Lake schema, with Better Auth for sign-in and a small fleet of Cloudflare Workers for rate limiting and scheduled email/Discord reminders.

The codebase is a **npm monorepo** containing six parts: an Astro frontend, a Sanity Studio, and four backends (one production TS Worker, one production cron Worker, one scaffolded Python Worker, and one scaffolded Discord bot).

## At a glance

| Attribute | Value |
|---|---|
| Repository type | monorepo (npm workspaces: `astro-app`, `studio`, `platform-api`) + standalone parts |
| Primary languages | TypeScript, Python |
| Frontend | Astro 5.18.1 (SSG + per-route SSR), React 19.2, Tailwind 4.1 |
| CMS | Sanity Studio 5.20 (3 workspaces) |
| Auth | Better Auth 1.5 (Google OAuth, GitHub OAuth, Resend Magic Link) |
| Database | Cloudflare D1 (`ywcc-capstone-portal`) via Drizzle ORM |
| Edge storage | Cloudflare KV (`SESSION_CACHE`), Durable Objects (`RATE_LIMITER`) |
| Deployment | Cloudflare Pages (astro-app) + Workers; Sanity hosted Studio |
| Testing | Vitest (75 test files), Playwright (19 specs × 5 browsers), Storybook (187 stories), Lighthouse CI, Pa11y CI |
| Release | semantic-release on `main` (conventional commits) |
| Current version | 1.18.0 (7 releases since last docs scan) |

## Parts

| Part | Path | Type | Status | Framework |
|---|---|---|---|---|
| astro-app | `astro-app/` | Web (SSG + SSR) | Production (3 Pages projects: `ywcc-capstone`, `rwc-us`, `rwc-intl`) | Astro 5.18 + React 19 + Tailwind 4 |
| studio | `studio/` | CMS | Production (Sanity hosted, 3 workspaces, deploy hooks wired to Pages) | Sanity Studio 5.20 |
| rate-limiter-worker | `rate-limiter-worker/` | Edge service | Production (Worker `rate-limiter-worker`) | TS Cloudflare Worker + Durable Object |
| event-reminders-worker | `event-reminders-worker/` | Cron service | Production (Worker `ywcc-event-reminders`) | TS Cloudflare Worker (daily 09:00 UTC) |
| platform-api | `platform-api/` | API (scaffold) | Scaffolding (not deployed) | FastAPI on Python Cloudflare Worker |
| discord-bot | `discord-bot/discord-bot/` | Bot (scaffold) | Scaffolding (Python in repo); production bot runs as Worker `capstone-bot` + `capstone-ask-worker` (RAG) | Python FastAPI in repo; TS Workers in prod |

## Key metrics

| Surface | Count |
|---|---|
| Public routes (SSG) | 22 pages + 3 APIs |
| Authenticated routes (SSR) | 8 pages + 6 APIs |
| Custom Sanity blocks | 38 |
| UI primitive families | 40 |
| Sanity document types | 11 |
| Sanity object types | 23 |
| GROQ `defineQuery` exports | 30 |
| D1 tables (via Drizzle) | 7 |
| D1 SQL migrations | 7 |
| Sanity migrations | 3 |
| Storybook stories | 187 |
| Vitest unit/component test files | 75 |
| Playwright E2E specs | 19 (×5 browser projects) |
| GitHub Actions workflows | 6 |
| Docker Compose services | 5 |
| Wiki pages | 33 |
| BMad implementation artifacts | 189 |

## Tech stack summary

### Frontend
Astro 5.18 SSG (Cloudflare adapter), React 19.2 islands, Tailwind 4.1 with container queries + 12-column grid, shadcn/ui (new-york style), Iconify (lucide, simple-icons), `@sanity/astro` 3.2 with visual editing, `@sanity/visual-editing` 5.2, Portable Text via `astro-portabletext`, Better Auth 1.5, Drizzle ORM 0.45 on D1, nanostores 1.1, `@schedule-x/react` for calendar, Resend 6.9 for email, Astro Fonts API (self-hosted Inter via Fontsource).

### CMS
Sanity Studio 5.20, plugins: structureTool, presentationTool, visionTool, sanity-plugin-media, @sanity/form-toolkit. Three workspaces (capstone, rwc-us, rwc-intl) sharing schemas with site-aware filtering.

### Backend workers
- `rate-limiter-worker`: TS CF Worker + Durable Object with SQLite sliding window (SQL-backed state, RPC interface `checkLimit`).
- `event-reminders-worker`: TS CF Worker, `0 9 * * *` cron, queries Sanity for upcoming events, sends per-subscriber Resend emails + Discord webhook embeds, writes to shared D1.
- `platform-api`: Python 3.12 on CF Python Workers (workers-py ASGI bridge), FastAPI + httpx + pydantic. Scaffold only.
- `discord-bot`: Python 3.11 FastAPI + discord.py. Registers `/ping`, `/project-status`, `/upcoming-events`, `/sponsor-info` slash commands. Scaffold only.

### Deployment & ops
Cloudflare Pages (astro-app), Cloudflare Workers (each backend), Sanity hosted Studio, GitHub Pages (Storybook), Chromatic (visual regression). Semantic-release for versioning.

## Repository structure

```
astro-shadcn-sanity/
├── astro-app/           # Astro frontend workspace
├── studio/              # Sanity Studio workspace
├── platform-api/        # Python CF Worker workspace (scaffold)
├── rate-limiter-worker/ # Standalone TS Worker (prod)
├── event-reminders-worker/ # Standalone TS Worker (prod cron)
├── discord-bot/         # Standalone Python bot (scaffold)
├── tests/               # Root Playwright E2E suite
├── scripts/             # Figma capture utilities
├── rules/               # Sanity agent rules (.mdc)
├── wiki/                # Human-authored wiki (33 md)
├── docs/                # This folder
└── _bmad-output/        # BMad planning artifacts
```

See [source-tree-analysis.md](./source-tree-analysis.md) for the full annotated tree.

## Recent highlights (2026-03 → 2026-04, versions 1.12 → 1.18)

- **Typed environment:** migrated to `astro:env` schema (Story 5.13) — compile-time typed `PUBLIC_*` + server-only vars.
- **Self-hosted fonts:** Astro Fonts API + Fontsource Inter (PR #639).
- **Layout system:** 12-column grid + container queries (Story 17.8), new `ColumnsBlock` page-builder block (Story 21.10).
- **Articles pipeline:** article detail pages with Article/NewsArticle JSON-LD (Story 19.6), newsletter CTA + articleList wiring (19.7), category archive pages (19.10).
- **Authors:** author listing + detail pages with Person JSON-LD (Stories 20.2, 20.3).
- **Gallery:** dedicated `/gallery` page with PhotoSwipe, Swiss-design filters, CMS listing page (Stories 22.3–22.5).
- **Listing pages:** CMS-editable singleton listing-page documents for articles, authors, events, gallery, projects, sponsors (Story 21.0).
- **Sorting:** `/projects` sorting controls (Story 4.6).
- **Sponsor logos:** new `logoSquare`, `logoHorizontal` fields; consistent crop across all surfaces.
- **Multi-workspace fix:** schema now deploys to all three workspaces (`rwc-us`, `rwc-intl` as well as `capstone`) — previously capstone-only (PR #8bcf552).
- **CI depth:** Lighthouse CI + Pa11y CI over every built `/demo/` page, asserting performance and accessibility thresholds.

## Who this documentation is for

- **New contributors:** start with the [development guide](./development-guide.md) and the [wiki](../wiki/).
- **Brownfield PRD authors:** use [architecture.md](./architecture.md), [data-models.md](./data-models.md), and [integration-architecture.md](./integration-architecture.md) as inputs.
- **Feature implementers:** cross-reference the [component inventory](./component-inventory.md) and the block list in [source-tree-analysis.md](./source-tree-analysis.md).
- **Operations / on-call:** read [cloudflare-guide.md](./cloudflare-guide.md), [rate-limiting-with-durable-objects.md](./rate-limiting-with-durable-objects.md), and [auth-consolidation-strategy.md](./auth-consolidation-strategy.md).

## Non-goals

- This repo is **not** a generic website template — branding, content models, and flows are tightly coupled to YWCC's capstone program and sponsor workflow.
- The `platform-api` and `discord-bot` parts are scaffolds. They are documented, but are not required to run or deploy the site.
