# Architecture

**Project:** ywcc-capstone-template v1.18.0
**Repository:** monorepo (npm workspaces + standalone Cloudflare workers)
**Generated:** 2026-04-15

## Executive summary

The repository hosts the **YWCC Industry Capstone** website platform for NJIT. It combines a content-driven **Astro 5 SSG frontend** (with per-route SSR for authenticated areas) and a **Sanity Studio v5** CMS, backed by Cloudflare's edge platform (Pages, Workers, D1, KV, Durable Objects). A small fleet of purpose-built Workers handles rate limiting, cron-driven event reminders, and (in scaffolding) a typed Python platform API. Authentication is unified under **Better Auth** with Google OAuth, GitHub OAuth, and Resend Magic Link, with sessions persisted in D1 and cached in KV.

Design principles:

- **Content-first, static-by-default.** Most routes are prerendered via GROQ queries; only authenticated/API surfaces run on the edge.
- **Multi-site, one codebase.** A single schema serves three workspaces (capstone production, rwc-us, rwc-intl) via a `site` field and site-aware desk filtering.
- **Block-composed page builder.** Every page body is an array of 38 typed blocks, each with a matching Astro component dispatched by `_type`.
- **Strict typing end-to-end.** Sanity TypeGen outputs to `astro-app/src/sanity.types.ts` (22,303 lines). `astro:env` schema types every public and server env var.
- **Performance budget enforced in CI.** Lighthouse CI and Pa11y CI run on every PR; `/demo/` pages must meet LCP and accessibility thresholds.

## Topology

```
                ┌─────────────────────────────────────────────────┐
                │  Sanity Content Lake (hosted)                   │
                │  • 3 workspaces: capstone, rwc-us, rwc-intl     │
                │  • 11 docs, 38 blocks, 23 objects               │
                └──▲─────────────────────────────────┬────────────┘
          publish │ GROQ reads                       │ GROQ reads
                  │                                  │
┌─────────────┐   │    ┌─────────────────────────┐   │   ┌───────────────────────┐
│ Editors     │───┘    │ astro-app               │───┘   │ event-reminders-worker│
│ (Studio)    │        │ (Cloudflare Pages +     │       │ (CF Worker, cron)     │
└─────────────┘        │  adapter Worker)        │       │ daily 09:00 UTC       │
                       │ • SSG public routes     │       │                       │
                       │ • SSR /portal /auth /api│       │ ─── Resend (emails)   │
                       │                         │       │ ─── Discord webhook   │
                       │ middleware.ts           │       └──┬────────────────────┘
                       │   ↓ DO RPC              │          │ D1 read/write
                       │   rate-limiter-worker   │   ┌──────▼──────────────────┐
                       │   (SlidingWindowRL)     │   │ D1 ywcc-capstone-portal │
                       │                         │──▶│  • Better Auth tables   │
                       │ Drizzle (D1 PORTAL_DB)  │   │  • subscribers          │
                       │ Better Auth + KV cache  │   │  • sent_reminders       │
                       │                         │   │  • project_github_repos │
                       │ Resend  /  GitHub API   │   └─────────────────────────┘
                       └─────────────────────────┘
```

`platform-api` (FastAPI on Python Worker) and `discord-bot` (Python, traditional server) are **scaffolding**; both are in the tree but not yet wired to astro-app.

## Architectural patterns

| Concern | Pattern | Where |
|---|---|---|
| Rendering | Jamstack (SSG-first) with selective SSR | `astro.config.mjs` output=static + `prerender=false` per page |
| Content | Structured content + page builder (composable blocks) | `studio/src/schemaTypes/**`, `astro-app/src/components/blocks/custom/**` |
| Dispatch | `BlockRenderer` dispatches by `_type`; `BlockWrapper` normalizes spacing/background | `astro-app/src/components/BlockRenderer.astro`, `BlockWrapper.astro` |
| Data | Module-level cached GROQ via `defineQuery` | `astro-app/src/lib/sanity.ts` |
| Typing | Schema → GROQ → TypeScript via Sanity TypeGen | `studio/sanity.cli.ts` → `astro-app/src/sanity.types.ts` |
| Env | `astro:env` schema (client/server/secret split) | `astro-app/astro.config.mjs` envSchema |
| Auth | Better Auth w/ D1 (Drizzle) + optional KV session cache | `astro-app/src/lib/auth-config.ts`, `db.ts`, `drizzle-schema.ts` |
| Authorization | Middleware-level RBAC + sponsor whitelist from Sanity | `astro-app/src/middleware.ts`, `SPONSOR_WHITELIST_QUERY` |
| Rate limit | Durable Object with SQLite sliding window | `rate-limiter-worker/src/index.ts` |
| Visual editing | Stega + Presentation resolvers | `@sanity/astro` stega, `studio/src/presentation/resolve.ts` |
| Multi-site | One schema, `site` field + workspace-aware hide/show | `studio/src/schemaTypes/fields/site-field.ts`, `workspace-utils.ts` |
| Scheduled work | Cron Worker | `event-reminders-worker` cron `0 9 * * *` |

## Technology stack

### astro-app (frontend)
| Category | Technology | Version |
|---|---|---|
| Framework | Astro | 5.18.1 |
| Runtime | Cloudflare Pages + Workers adapter | `@astrojs/cloudflare` 12.6.12 |
| UI | React + Astro islands | React 19.2.4 |
| Styling | Tailwind CSS | 4.1.18 |
| UI kit | shadcn/ui (new-york) | v4 |
| Icons | Iconify (lucide, simple-icons) | 1.2.x |
| CMS client | @sanity/astro | 3.2.11 |
| Visual editing | @sanity/visual-editing | 5.2.1 |
| Portable Text | astro-portabletext, @portabletext/to-html | 0.10 / 5.0 |
| Auth | Better Auth | 1.5.0 |
| DB | Drizzle ORM over Cloudflare D1 | 0.45.1 |
| State | nanostores + @nanostores/react | 1.1 / 1.0 |
| Calendar UI | @schedule-x/react | 4.x |
| Email | Resend | 6.9.3 |
| Fonts | Astro Fonts API + Fontsource Inter | experimental |
| Typing | TypeScript | 5.9.3 |
| Test (unit) | Vitest | 3.2.1 |
| Stories | Storybook + storybook-astro | 10.2.7 |

### studio (CMS)
| Category | Technology | Version |
|---|---|---|
| CMS | Sanity Studio | 5.20 |
| Plugins | @sanity/vision, @sanity/form-toolkit, sanity-plugin-media | 5.20 / 2.2.3 / 4.1.1 |
| Deploy | Sanity hosted; 3 workspaces (capstone, rwc-us, rwc-intl) | app id `zi1cig2o607y1js5cfoyird6` |
| TypeGen | sanity extract + typegen | → `astro-app/src/sanity.types.ts` |

### Workers
| Part | Runtime | Notes |
|---|---|---|
| rate-limiter-worker | TS / CF Workers (DO) | SQLite sliding window, RPC via `checkLimit(windowMs, maxRequests)` |
| event-reminders-worker | TS / CF Workers (cron) | Binds same D1 (`ywcc-capstone-portal`); uses Resend + Discord |
| platform-api | Python 3.12 / CF Python Workers (Pyodide) | FastAPI + workers-py ASGI bridge; placeholders in `wrangler.jsonc` |
| discord-bot | Python 3.11+ / traditional server | FastAPI + discord.py; not deployed |

### Infra / CI
- Cloudflare Pages (astro-app), Cloudflare Workers (each backend), Sanity-hosted Studio.
- CI on GitHub Actions (6 workflows): unit tests, Lighthouse CI, Pa11y CI, semantic-release, Storybook deploy, preview-branch sync, branch policy.
- Chromatic for visual regression (Storybook 10).
- Node 22 for CI, Node 24 for release; Python 3.12 for platform-api, 3.11+ for discord-bot.

## Data architecture

Two stores:

1. **Sanity Content Lake** — editorial data (see [data-models.md](./data-models.md) for schema).
2. **Cloudflare D1** — relational auth + operational data (`ywcc-capstone-portal`, id `76887418-c356-46d8-983b-fa6e395d8b16`).

D1 tables (via Drizzle `astro-app/src/lib/drizzle-schema.ts` and 7 SQL migrations):

| Table | Purpose |
|---|---|
| `user` | Better Auth users (id, email, name, role `student`/`sponsor`, emailVerified, timestamps) |
| `session` | Better Auth sessions (token, expiresAt, userId, indexed by userId) |
| `account` | OAuth provider accounts (Google, GitHub) and Magic Link credentials, indexed by userId |
| `verification` | Email/password reset tokens |
| `subscribers` | Newsletter subscribers (from `/api/subscribe`) |
| `sent_reminders` | Idempotency log for event reminder emails (used by event-reminders-worker) |
| `project_github_repos` | Sponsor self-serve project → GitHub repo links (unique on user+project) |

KV: `SESSION_CACHE` — opportunistic cache for active Better Auth sessions. Middleware reads cache first, falls back to D1 on miss, fails open on KV error.

## API design

### astro-app public APIs
| Path | Method | Purpose |
|---|---|---|
| `/api/auth/[...all]` | Better Auth | OAuth callback, Magic Link, session |
| `/api/subscribe` | POST / DELETE | Newsletter signup via Resend |
| `/api/events/[slug].ics` | GET | iCalendar export of a single event |
| `/rss.xml` | GET | RSS feed for articles |
| `/robots.txt` | GET | Robots directives |

### astro-app portal APIs (auth-gated, SSR)
| Path | Method | Purpose |
|---|---|---|
| `/portal/api/me` | GET | Current user + resolved sponsor |
| `/portal/api/projects` | GET | Sponsor's projects (GROQ + D1 join) |
| `/portal/api/events` | GET | Sponsor's events |
| `/portal/api/db-health` | GET | D1 heartbeat |
| `/portal/api/github/repos` | GET | GitHub API (user repos) |
| `/portal/api/github/links` | GET/POST | Link/unlink project → repo |

See [api-contracts.md](./api-contracts.md).

### platform-api (scaffolding, not wired)
Routes under `/api/v1/platform/health`, `/api/v1/content/{pages,events,sponsors,projects}`, `/api/v1/content/search`, `/api/v1/content/mutations`. Bindings reference placeholder IDs in `platform-api/wrangler.jsonc`.

## Component architecture (astro-app)

- **38 custom Sanity blocks** (`src/components/blocks/custom/**`) map 1:1 to schema block types. All inherit spacing/background/maxWidth/alignment via `BlockWrapper.astro`. `BlockRenderer.astro` switches on `_type`.
- **40 UI primitive families** (`src/components/ui/**`) — mostly shadcn new-york plus custom: `section/*` (12-column grid, container queries), `json-ld`, `video`, `marquee`, `native-carousel`, `logo`, `rating`, `price`.
- **6 Portable Text components** (`src/components/portable-text/**`) resolved by `index.ts` map.
- **React islands** for interactive surfaces: calendar (Schedule X), portal forms, filter bars.
- **~187 Storybook stories** live next to components under `src/components/**/*.stories.*`.
- **Concept components** (`src/components/concepts/**`) are design-review scratchpads promoted to production (e.g., `ProjectFilterBar` now drives `/projects` sorting — Story 4.6).

See [component-inventory.md](./component-inventory.md) for the full catalog.

## Routing & rendering

| Kind | Count | Examples | Pattern |
|---|---|---|---|
| SSG (prerender default) | 22 pages + 3 APIs | `/`, `/articles`, `/articles/[slug]`, `/articles/category/[slug]`, `/authors`, `/authors/[slug]`, `/projects`, `/projects/[slug]`, `/sponsors`, `/sponsors/[slug]`, `/events`, `/events/[slug]`, `/gallery`, `/[...slug]`, `/robots.txt`, `/rss.xml`, `/api/events/[slug].ics` | `getStaticPaths()` with TypeGen result types |
| SSR (`prerender = false`) | 8 pages + 6 APIs | `/portal/**`, `/student`, `/auth/login`, `/portal/api/**`, `/api/subscribe`, `/api/auth/**` | `export const prerender = false` |

Catch-all `/[...slug].astro` resolves any CMS-managed page (resolving `page` docs by `slug.current`).

## Authentication & authorization

**Stack:** Better Auth + Drizzle (D1) + optional KV session cache + Resend (Magic Link).

Providers configured in `src/lib/auth-config.ts`:
- Google OAuth
- GitHub OAuth
- Email Magic Link (Resend)

Role escalation:

1. New user signs in.
2. Middleware looks up sponsor whitelist in Sanity via `SPONSOR_WHITELIST_QUERY`.
3. If email matches a sponsor's whitelisted addresses, user role is set to `sponsor`; otherwise `student`.
4. `student` users hitting `/portal/**` are redirected to `/portal/denied`.
5. `sponsor` users hitting `/student` are redirected to `/portal`.

Session lookup fast path:
1. Read cookie → session token.
2. KV `SESSION_CACHE.get(token)` (fail-open on error).
3. Fallback to D1 (`session` table) via Drizzle.
4. `context.locals.user` carries `{ id, email, name, role }` downstream.

Rate limiting (in `middleware.ts`):
- IP-keyed sliding window via `RATE_LIMITER` Durable Object RPC (60s / 100 req).
- Fail-open on DO errors (never blocks legitimate traffic on infra glitches).

## Deployment architecture

| Target | Artifact | Pipeline |
|---|---|---|
| Cloudflare Pages — `ywcc-capstone` (production) | `astro-app/dist/` | Pages GitHub integration on `main` + Sanity deploy hook `sanity-content-update-capstone` |
| Cloudflare Pages — `rwc-us` (production) | `astro-app/dist/` | Pages GitHub integration on `main` + Sanity deploy hook `sanity-content-update-rwc-us` |
| Cloudflare Pages — `rwc-intl` (production) | `astro-app/dist/` | Pages GitHub integration on `main` + Sanity deploy hook `sanity-content-update-rwc-intl` |
| Cloudflare Worker (rate limiter) | TS bundle | `npm run deploy:rate-limiter` (manual) |
| Cloudflare Worker (event reminders) — `ywcc-event-reminders` | TS bundle | `wrangler deploy` (manual) |
| Cloudflare Worker (Discord bot) — `capstone-bot` | TS bundle | `wrangler deploy` (manual); binds service `ASK_WORKER` |
| Cloudflare Worker (RAG answer) — `capstone-ask-worker` | TS bundle | `wrangler deploy` (manual) |
| Cloudflare Worker (MCP / AI search) — `little-dawn-0015-nlweb` | TS bundle + DO + AI binding | `wrangler deploy` (manual) |
| Cloudflare Python Worker (platform-api) | Python bundle | `wrangler deploy` (scaffold; not deployed) |
| Sanity Studio | Hosted (app id `zi1cig2o607y1js5cfoyird6`) | `npx sanity deploy` |
| Storybook | Static | `.github/workflows/deploy-storybook.yml` → GitHub Pages |
| Chromatic | Visual regression | Chromatic Action / manual `chromatic` CLI |
| Release (CHANGELOG + git tag) | npm version | `.github/workflows/release.yml` via semantic-release |

**Production content trigger:** Sanity publishes fire project-specific deploy hooks (listed in [integration-architecture.md](./integration-architecture.md#sanity--pages-deploy-hooks-confirmed-via-cloudflare-api-2026-04-15)) which cause the affected Pages project(s) to rebuild on `main`.

## Testing strategy

- **Unit & component (Vitest 3.2.1):** 75 test files in `astro-app/src/**/__tests__/` and shared `tests/integration/`. Covers auth, Sanity queries, image helpers, JSON-LD builders, middleware, blocks, forms. Coverage via v8.
- **E2E (Playwright 1.58.2):** 19 specs × 5 projects (chromium, firefox, webkit, mobile-chrome Pixel 7, mobile-safari iPhone 14). Reports to `test-results/` (HTML + JUnit). Builds then previews astro-app on `:4321` by default.
- **Visual (Storybook 10.2.7 + Chromatic):** 187 stories. Custom `lucide-static` SVG stub plugin to handle SSR edge cases.
- **Accessibility (Pa11y CI):** WCAG2AA scan of `/demo/**` pages on every PR via `.pa11yci.cjs`.
- **Performance (Lighthouse CI):** LCP + perf thresholds asserted per demo page. Reports archived under `.lhci/`.
- **Worker tests (Vitest):** `rate-limiter-worker/test/rate-limiter.test.ts`, `event-reminders-worker/src/__tests__/index.test.ts`, `platform-api/tests/test_*.py` (pytest).

Policy (from `CLAUDE.md`): LCP < 2s and Lighthouse Performance ≥ 89 on content pages. Above-the-fold images must use `fetchpriority="high"` + `loading="eager"` + Sanity LQIP placeholders.

## Security posture

- **Secrets** managed via Cloudflare Pages/Workers dashboard (never committed). Root `.env.example` documents required keys.
- **Security headers** set via `astro-app/public/_headers` (CSP, X-Frame-Options, Referrer-Policy, etc.).
- **Rate limiting** on all routes (fail-open on DO error to avoid outages).
- **Auth token cookies**: HttpOnly, Secure, SameSite=Lax.
- **Sanity write token** never leaks to the client; only server-side workers hold write access.
- **Stega markers** stripped at SSG build when visual editing is disabled.
- **Sponsor escalation** driven by editorial whitelist (`SPONSOR_WHITELIST_QUERY`), not by client claim.

## Changes since last scan (2026-03-11)

Features:
- Typed env via `astro:env` (Story 5.13 / PR #640).
- Astro Fonts API + self-hosted Inter via Fontsource (PR #639).
- 12-column grid system + container queries (Story 17.8).
- `ColumnsBlock` page-builder block (Story 21.10).
- Image gallery page + PhotoSwipe + Swiss filters + CMS listing (Stories 22.3–22.5).
- Article detail pages + Article/NewsArticle JSON-LD (Story 19.6) + newsletter CTA (19.7) + category archive (19.10).
- Author listing + detail + Person JSON-LD (Stories 20.2, 20.3).
- `listing-page` singleton documents (Story 21.0).
- `/projects` sorting controls (Story 4.6).
- Sponsor schema: `logoSquare`, `logoHorizontal` fields; consistent crop across components.

Quality:
- Schema deploy fixed to deploy to all three workspaces, not just capstone (PR #8bcf552).
- Lighthouse CI + Pa11y CI on every built `/demo/` page.
- Typegen result types enforced in `getStaticPaths` across all detail pages.

New parts:
- `event-reminders-worker` (production cron, deployed as `ywcc-event-reminders`).
- `platform-api` skeleton (workspace, Python Worker).
- `discord-bot` moved to nested path (standalone, scaffolding). A deployed counterpart exists as Worker `capstone-bot` (TS) with a service binding to `capstone-ask-worker` (RAG answer worker using Cloudflare AI Search / AutoRAG index `bf002610-921a-4047-9298-cc2d2668451a`).
- Cloudflare Worker `little-dawn-0015-nlweb` — MCP/NL-web worker with Durable Object `MCP_OBJECT`, AI + RAG bindings, ratelimit binding.

## Open risks & follow-ups

- `platform-api` wrangler.jsonc has placeholder KV/D1 IDs. Either wire to real bindings or remove from workspaces until ready.
- `discord-bot/discord-bot/` Python scaffold in the repo is **not** the deployed bot. The production bot is the `capstone-bot` Worker (TS) + `capstone-ask-worker` (RAG). Decide whether to keep the Python scaffold, port it to the TS worker, or archive.
- No root eslint config; only `astro-app/.eslintrc` (minimal). No Husky/pre-commit. Consider `lefthook` or CI-side strict mode if slippage increases.
- Sanity write token naming inconsistent (`sanity_api_write_token` vs `SANITY_API_TOKEN`). Pick one and document.
- `project_github_repos` table has no cleanup/archival policy.
