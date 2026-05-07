# Architecture

**Project:** ywcc-capstone-template v2.0.0
**Repository:** monorepo (npm workspaces + standalone Cloudflare workers)
**Generated:** 2026-04-29 (full rescan, deep)
**Refresh trigger:** Astro 6 + `@astrojs/cloudflare` v13 + Cloudflare-Workers-only cutover (PR #681). Prior architecture doc was authoritative for the Astro 5 / CF Pages topology.

## Executive summary

A six-Worker fleet on a single Cloudflare account hosts:

- **One full-stack tenant** (`ywcc-capstone`): Astro 6 SSR + Better Auth + D1 + KV + cross-script DO, with portal, agreement gate, scheduled events, and editorial preview.
- **Two content-only tenants** (`rwc-us`, `rwc-intl`): same codebase, no D1/KV/DO, no portal — `*.workers.dev`.
- **Three preview tenants** (`*-preview`): drafts perspective + stega for Sanity Studio's Presentation tool.

The architecture pattern is **edge-first hybrid SSR** with a **block-driven page builder** sourced from Sanity. The codebase is built once per environment (`CLOUDFLARE_ENV=<name> astro build`) — Astro 6 + the Cloudflare Vite plugin bake env vars at build time and emit a `dist/server/wrangler.json` that `wrangler deploy` consumes.

## Topology

```
                                            ┌─────────────────────────────────┐
                                            │         Sanity Content Lake     │
                                            │   project 49nk9b0w              │
                                            │   datasets: production / rwc    │
                                            │   3 workspaces / 38 blocks      │
                                            └────────┬────────────────────────┘
                                                     │
                          ┌──────────────────────────┼──────────────────────────┐
                          │   webhook (publish-only) │  CDN reads (useCdn=true) │
                          ▼                          │  Live Content API (preview only)
        ┌─────────────────────────────┐              │
        │   CF Deploy Hooks (×3)      │              │
        │ → wrangler deploy per env   │              │
        └─────────────────────────────┘              │
                          │                          │
                          ▼                          ▼
            ┌───────────────────────────────────────────────────────┐
            │  Cloudflare Workers (account 70bc6caa…2533bb)         │
            │  ┌─────────────────────────────────────────────────┐  │
            │  │  ywcc-capstone (env=capstone)                   │  │
            │  │  www.ywcccapstone1.com (apex 301→www)           │  │
            │  │  ┌─ Astro 6 SSR ─┐ ┌─ middleware ─────────────┐ │  │
            │  │  │ static assets │ │ rate-limit (DO RPC)       │ │  │
            │  │  │ via ASSETS    │ │ portal auth (Better Auth) │ │  │
            │  │  │               │ │ agreement gate            │ │  │
            │  │  └───────────────┘ └──────────────┬────────────┘ │  │
            │  │  D1: PORTAL_DB  KV: SESSION_CACHE │              │  │
            │  └────────────────────────────┬──────┼──────────────┘  │
            │                               │      │                 │
            │                               │      ▼                 │
            │  ┌─────────────────────────────────────────────────┐  │
            │  │  rate-limiter-worker (DO SlidingWindowRateLimiter│ │
            │  │  cross-script binding: script_name="rate-…"     │  │
            │  └─────────────────────────────────────────────────┘  │
            │                                                       │
            │  ┌─────────────────────────────────────────────────┐  │
            │  │  ywcc-event-reminders (cron 0 9 * * *)          │  │
            │  │  reads PORTAL_DB + Sanity, sends Resend + Discord│ │
            │  └─────────────────────────────────────────────────┘  │
            │                                                       │
            │  ┌─ rwc-us ───┐  ┌─ rwc-intl ─┐  (no D1/KV/DO)        │
            │  │ workers.dev│  │ workers.dev│                       │
            │  └────────────┘  └────────────┘                       │
            │                                                       │
            │  ┌─ ywcc-capstone-preview ─┐  rwc-us-preview          │
            │  │ stega + drafts          │  rwc-intl-preview        │
            │  │ (Studio Presentation)   │                          │
            │  └─────────────────────────┘                          │
            └───────────────────────────────────────────────────────┘
```

Outside the repo's deploy pipeline (production but managed elsewhere): `capstone-bot` + `capstone-ask-worker` (RAG over a CF AI Search index), bound via service binding.

## Per-part architecture

### astro-app — Astro 6 SSR site

**Pattern**: layered + component-driven. Server-side data fetching with build-time + per-request mix; React only for islands; strict server / client boundary via `astro:env`.

**Layers**:

```
src/
├── middleware.ts                   # Edge entry: rate-limit → auth → request handler
├── actions/index.ts                # Single Action (`submitForm`) — server-only
├── pages/                          # 41 routes (16 prerender, 20 SSR, rest inherit)
│   ├── api/* + portal/api/*        # 13 SSR endpoints (7 public, 6 portal)
│   └── *.astro                     # Pages compose layouts + blocks
├── layouts/Layout.astro            # JSON-LD root, fonts, CSP meta, theme attr
├── components/
│   ├── blocks/custom/ (38)         # Sanity-mapped custom blocks
│   ├── blocks/                     # UI template blocks from shadcn registry
│   ├── ui/ (41 families)           # shadcn primitives (CVA + cn() pattern)
│   ├── portable-text/ (6)          # PortableText* renderers
│   ├── portal/ (13)                # Portal-only React islands
│   └── react/ (4)                  # Public-page islands (visual-editing only)
├── lib/
│   ├── *.queries.ts                # 34 defineQuery() exports
│   ├── auth-config.ts              # Better Auth instance
│   ├── db.ts + drizzle-schema.ts   # 5 declared tables; 3 more via raw migrations
│   ├── sanity.ts + sanity-live.ts  # Client setup + live subscription
│   ├── image.ts                    # urlFor + safeUrlFor (urlFor is mandatory)
│   ├── *-jsonld.ts (5) + structured-data.ts
│   └── __tests__/__mocks__/astro-env-client.ts
├── stores/                         # Single nanostore atom (isCalendarView)
└── styles/global.css               # Tailwind v4 @theme; brutalist @utility
```

**Key patterns**:

- **Block dispatch**: `BlockRenderer.astro` looks up `allBlocks[block._type]`. The registry is built at module load via `import.meta.glob({ eager: true })` — adding a `.astro` to `blocks/custom/` auto-registers it. `BlockWrapper.astro` centralizes `backgroundVariant`, `spacing`, and `maxWidth`.
- **Block schema composition**: `studio/src/schemaTypes/helpers/defineBlock.ts` composes `block-base` fields + variants + custom fields with `hiddenByVariant` conditional visibility. Never use raw `defineType()` for blocks — the variant pipeline depends on `defineBlock()`.
- **Server Islands**: `<SanityPageContent server:defer />` in `index.astro` and `[...slug].astro` bridges static pages to live preview. Sets `Cache-Control: no-cache, no-store, must-revalidate` in preview mode.
- **Visual editing toggle**: `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` flips perspective (drafts ↔ published), stega encoding, read-token requirement, and CDN eligibility. The site has hard-fail behavior only when stega is on but `SANITY_API_READ_TOKEN` is missing.
- **Bindings access**: `import { env } from 'cloudflare:workers'`. `Astro.locals.cfContext` for `ExecutionContext` (`waitUntil`, `passThroughOnException`). `Astro.request.cf` for the `cf` object.
- **Env**: `astro:env` schema in `astro.config.mjs` (`validateSecrets: true`); 15 declared vars + secrets. Test mocks live in `src/lib/__tests__/__mocks__/astro-env-client.ts`.
- **Build-time env hydration**: `astro.config.mjs` reads `wrangler.jsonc`, strips comments / strings, looks up `cfg.env[CLOUDFLARE_ENV].vars`, and mirrors values into `process.env` before `defineConfig`. CI overrides win; wrangler block beats `.env`.

### studio — Sanity Studio v5.23

**Pattern**: shared schemas, multi-workspace. Three workspaces share project `49nk9b0w` and the same schema graph; differ only by dataset, basePath, desk, and preview origin.

```
sanity.config.ts
├── capstone   (dataset=production, /capstone, custom SponsorAcceptancesTool)
├── rwc-us     (dataset=rwc, /rwc-us, site-aware filter)
└── rwc-intl   (dataset=rwc, /rwc-intl, site-aware filter)
```

- **Site-aware filter**: 10 document types carry a `site` field. The `siteField` field type drives workspace-specific filtering and visibility. Frontend GROQ uses `($site == "" || site == $site)` — empty string short-circuits for capstone (single-site).
- **Singletons** (Capstone only): `siteSettings`, `listingPage`, `portalPage`, `sponsorAgreement`. RWC desks exclude `portalPage` and `sponsorAgreement` templates.
- **Presentation resolver**: `studio/src/presentation/resolve.ts` is workspace-aware — picks preview origin and site context per workspace. Capstone preview points at `ywcc-capstone-preview` (workers.dev); RWC workspaces point at their respective preview Workers in dev.
- **Plugins (shared)**: `structureTool`, `presentationTool`, `visionTool`, `sanity-plugin-media`, `@sanity/form-toolkit`. Capstone adds `SponsorAcceptancesTool` (custom React tool for agreement audit).
- **Migrations**: 3 `.mjs` migrations under `studio/migrations/` — `add-item-types`, `rename-18-6-fields`, `rename-18-7-richtext-variants`. Run via `sanity exec` per the runbook in each file.

### rate-limiter-worker — Durable Object

**Pattern**: cross-script Durable Object exposed via RPC. `SlidingWindowRateLimiter` class persists request timestamps in DO SQLite (`requests` table). The class exports a single RPC method:

```ts
class SlidingWindowRateLimiter extends DurableObject {
  async checkLimit(windowMs: number, maxRequests: number): Promise<RateLimitResult>;
  async alarm(): Promise<void>;  // periodic cleanup of expired timestamps
}
```

The capstone Worker binds it via `script_name: "rate-limiter-worker"` (cross-script DO). Middleware fails closed if the binding is unhealthy — deploy `rate-limiter-worker` first when bootstrapping a fresh CF account.

### event-reminders-worker — cron

**Pattern**: scheduled trigger Worker. `scheduled()` runs daily at 09:00 UTC. Reads upcoming events from Sanity, dedupes against the `sent_reminders` D1 table (migration 0005), sends email via Resend, and posts to a Discord webhook. Provides a thin `fetch()` for health checks.

D1 binding: `DB → ywcc-capstone-portal` (id `76887418-c356-46d8-983b-fa6e395d8b16`). Shares the database with `ywcc-capstone` — schema migrations under `astro-app/migrations/` apply to both.

### platform-api — FastAPI Worker (scaffold)

`compatibility_flags: ["python_workers"]`. `wrangler.jsonc` declares bindings (KV `API_KV`, D1 `DB`, `AI`) but **the IDs are placeholders** — not deployed. Two routers (`health`, `content`) wrap GROQ builders for pages / sponsors / events / projects / search. Pydantic models for request/response. Three pytest specs.

### discord-bot — Python scaffold

FastAPI + discord.py. Not on Workers (no `wrangler.toml`); designed as a standalone service. Production Discord functionality runs on **separate Workers** (`capstone-bot` + `capstone-ask-worker` with the AI Search RAG index `bf002610-921a-4047-9298-cc2d2668451a`) that are not part of this repo's deploy pipeline.

## Data architecture

### Sanity (content)

- 13 documents, 23 objects, 38 blocks. Site-aware fields on 10 document types.
- All queries via `defineQuery(groq\`…\`)` — required for TypeGen. 34 query definitions across `astro-app/src/lib/**`.
- Block resolvers (`getBlockExtraProps`) inject post-fetch data: `resolveBlockSponsors` (logoCloud `autoPopulate`, sponsorCards `displayMode`), `resolveBlockEvents` (filters upcoming/past/all, sorts chronologically). All resolvers `stegaClean()` filter values before comparison.
- `loadQuery<T>()` handles perspective / stega / sync tags / result source maps. Throws only if visual editing is on and `SANITY_API_READ_TOKEN` is missing.
- Module-level caches (`_sponsorsCache`, `_siteSettingsCache`) bypass when `visualEditingEnabled === true`.

### D1 (portal database)

Database name: `ywcc-capstone-portal`. ID: `76887418-c356-46d8-983b-fa6e395d8b16`. Bound on `ywcc-capstone` and `ywcc-event-reminders` only.

13 tables across two eras (4 Better Auth + 5 portal feature tables + 6 legacy `0000_init` tables — see `data-models.md` for the agreement-gate columns added directly to `user`).

Migrations under `astro-app/migrations/` (10 total, 0000-0009):

| Migration                                       | Effect |
|-------------------------------------------------|--------|
| 0000_init.sql                                   | Legacy portal tables (`portal_activity`, `event_rsvps`, `evaluations`, `agreement_signatures`, `notification_preferences`, `notifications`) — predates Better Auth |
| 0001_student_auth.sql                           | Better Auth core tables (`user`, `session`, `account`, `verification`) |
| 0002_add_user_role.sql                          | `user.role` column (default `student`, NOT NULL) |
| 0003_backfill_sponsor_roles.sql                 | Backfill existing users to sponsor role |
| 0004_create_subscribers.sql                     | Newsletter subscribers table |
| 0005_create_sent_reminders.sql                  | Reminder dedupe (used by `ywcc-event-reminders`) |
| 0006_create_project_github_repos.sql            | Sponsor → GitHub repo linkages |
| 0007_add_agreement_acceptance.sql               | `user.agreement_accepted_at` column |
| 0008_backfill_agreement_acceptance.sql          | Backfill existing acceptances |
| 0009_add_agreement_version_and_audit.sql        | `user.agreement_version` + `agreement_accepted_ip` + `agreement_accepted_user_agent` |

### KV

- `SESSION_CACHE` (id `f78af5695075451c9d3d7887368e90dc`) on `ywcc-capstone` only. Better Auth session cache. RWC Workers do not bind KV.

### Cross-script Durable Object

- `RATE_LIMITER` on `ywcc-capstone` only, sourced from `rate-limiter-worker` (`class_name: "SlidingWindowRateLimiter"`). RWC Workers and preview Workers do not bind DOs.

## Auth architecture

**Stack**: Better Auth 1.5 + Drizzle (D1) + KV session cache + Resend for magic-link mail + Cloudflare Turnstile for forms.

**Flow**:

1. User hits `/portal/*` → middleware checks session via Better Auth → enforces sponsor agreement gate (Story 15.11 — version-pinned, audit-captured) → routes to portal or redirects to `/portal/login`.
2. `/portal/login` offers Google OAuth, GitHub OAuth, or Magic Link (Resend → email with one-time token).
3. Catch-all routes `/api/auth/[...all].ts` and `/portal/api/auth/[...all].ts` proxy Better Auth's request handler.
4. Sessions stored in D1 `session` table; cached in KV; rate-limit applied by middleware via cross-script DO RPC (100 req / 60s window).

**OAuth client IDs**:

- GitHub `Ov23liFtOiWIyCqJXJMi` (production capstone) — paired secret in dashboard.
- Google: client ID + secret in dashboard.

**Critical**: at production cutover, `GITHUB_CLIENT_SECRET` must be re-put with the prod GitHub OAuth App's secret. The staging-phase secret paired with `Ov23li8R7jigMPatjOml` is no longer valid.

**Other secrets** (dashboard / `wrangler secret put <NAME> --name <worker>`): `BETTER_AUTH_SECRET`, `RESEND_API_KEY`, `SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`, `TURNSTILE_SECRET_KEY`. Never in `wrangler.jsonc` `vars`.

## Deployment architecture

| Environment              | Worker                    | Domain                                          | Bindings                                       | Notes                                  |
|--------------------------|---------------------------|-------------------------------------------------|------------------------------------------------|----------------------------------------|
| `capstone`               | ywcc-capstone             | www.ywcccapstone1.com (apex 301→www via Single Redirect) | D1 PORTAL_DB, KV SESSION_CACHE, DO RATE_LIMITER, ASSETS | Production. All secrets dashboard-managed |
| `rwc_us`                 | rwc-us                    | rwc-us.js426.workers.dev                        | ASSETS only                                    | Content-only; portal/auth/api → 503 |
| `rwc_intl`               | rwc-intl                  | rwc-intl.js426.workers.dev                      | ASSETS only                                    | Content-only; portal/auth/api → 503 |
| `capstone_preview`       | ywcc-capstone-preview     | ywcc-capstone-preview.js426.workers.dev         | ASSETS only                                    | Drafts + stega; Studio Presentation iframe target |
| `rwc_us_preview`         | rwc-us-preview            | rwc-us-preview.js426.workers.dev                | ASSETS only                                    | Drafts + stega                         |
| `rwc_intl_preview`       | rwc-intl-preview          | rwc-intl-preview.js426.workers.dev              | ASSETS only                                    | Drafts + stega                         |

Plus standalone Workers in the same account: `rate-limiter-worker`, `ywcc-event-reminders`, and (out-of-tree) `capstone-bot`, `capstone-ask-worker`, `little-dawn-0015-nlweb`.

**Deploy commands** (from `astro-app/`):

```
CLOUDFLARE_ENV=capstone        npm run deploy:capstone
CLOUDFLARE_ENV=rwc_us          npm run deploy:rwc-us
CLOUDFLARE_ENV=rwc_intl        npm run deploy:rwc-intl
CLOUDFLARE_ENV=capstone_preview npm run deploy:capstone-preview
CLOUDFLARE_ENV=rwc_us_preview  npm run deploy:rwc-us-preview
CLOUDFLARE_ENV=rwc_intl_preview npm run deploy:rwc-intl-preview
```

Each script runs `astro build && wrangler deploy`. The `--env <name>` flag is no longer applicable under the CF Vite plugin (env is owned by `CLOUDFLARE_ENV` at build time). After any `wrangler.jsonc` change: regenerate types via `npx wrangler types -C astro-app`.

Sanity webhook (publish-only on `_type in ["page","siteSettings","sponsor","project","team","event"]`) triggers a CF Deploy Hook per environment (~45-75s rebuild). Drafts excluded.

## Testing strategy

| Scope                 | Framework / runner    | Files                            | Where                                                  |
|-----------------------|-----------------------|----------------------------------|--------------------------------------------------------|
| Component / unit      | Vitest 3.2 + AstroContainer | 84 in astro-app, 13 in studio    | `astro-app/src/**/__tests__/`, `studio/src/**/__tests__/` |
| Schema validation     | Vitest                | 11 (studio)                      | `studio/src/schemaTypes/__tests__/`                    |
| End-to-end            | Playwright 1.58       | 20 specs × 5 browsers            | `tests/` (root)                                        |
| Storybook             | Storybook 10.2        | 187 stories                      | `astro-app/src/components/**/*.stories.{ts,tsx}`        |
| Performance           | Lighthouse CI 0.15    | sitemap-driven (capped 50 URLs)  | `.lighthouserc.cjs`                                    |
| Accessibility         | Pa11y CI              | sitemap-driven (capped 50 URLs)  | `.pa11yci.cjs`                                         |

- **AstroContainer** is the official renderer for Astro components in Vitest (despite the `experimental_` prefix). 20+ test files depend on it. Pattern: `const container = await AstroContainer.create(); const html = await container.renderToString(Component, { props, slots })`.
- **Cloudflare bindings** are mocked at the module level (`vi.mock('cloudflare:workers', …)`). `astro:env/client` mocks live at `src/lib/__tests__/__mocks__/astro-env-client.ts`.
- **Vitest globals** are enabled (`describe` / `test` / `expect` / `vi`).

CI gates (`.github/workflows/ci.yml`): Vitest unit + LHCI + Pa11y on PRs to `preview`. Branch protection: `enforce-preview-branch` (only `preview` → `main`); `enforce-preview-source` (no `main` → `preview` PRs).

## Performance posture

- **Budget**: LHCI `categories:performance >= 0.89`, `largest-contentful-paint <= 2000ms` (error-gated; CI step is `continue-on-error: true` during scope-flip triage).
- **LCP discipline**: above-fold images use `fetchpriority="high"` + `loading="eager"`; below-fold use `loading="lazy"`. LQIP blur from Sanity metadata. Always project `asset->{ metadata { lqip, dimensions } }` in GROQ.
- **CLS guard**: always set `width`/`height`. Responsive srcset map widths `[640, 1024, 1440, 1920]` via `urlFor()`.
- **Caching**: published-mode uses CDN reads (`useCdn: true`). Preview mode bypasses CDN and disables module-level caches. Server Islands set `Cache-Control: no-cache, no-store, must-revalidate` in preview.
- **React budget**: islands only — `client:load` for portal (`SponsorProjects`, `PortalCalendar`); `client:only="react"` for `VisualEditingMPA`. **No `client:visible`.** Public pages ship zero React runtime.

## Security posture

- **Secrets**: never in `wrangler.jsonc`. Use `wrangler secret put <NAME> --name <worker>` or the dashboard.
- **CSP**: `public/_headers` + `<meta>` in `Layout.astro`. Header set: `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Strict-Transport-Security: max-age=31536000; includeSubDomains`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`. Frame-ancestors locked to Sanity Studios.
- **Tokens**: `SANITY_API_WRITE_TOKEN` server-side only (`astro:env/server`, never bundled). `SANITY_API_READ_TOKEN` only on preview Workers (visual editing).
- **Bot protection**: Cloudflare Turnstile on forms (`PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`). Verified server-side in `submitForm` Astro Action.
- **Rate limiting**: cross-script DO sliding window (100 req / 60s) on portal routes via middleware.
- **Known risk**: `src/pages/portal/api/db-health.ts` exposes SQLite table names to authenticated users — TODO awaits an admin check.

## Branch + release flow

```
feature/* → preview → main
                       │
                       ├─ semantic-release (release.yml)
                       │  → version bump + tag + chore(release) commit
                       │
                       ├─ deploy-storybook.yml → GH Pages
                       │
                       └─ sync-preview.yml → auto-merge main → preview + Discord notify
```

`enforce-preview-branch.yml` blocks any branch except `preview` from PRing into `main`. `enforce-preview-source.yml` blocks `main → preview` PRs (auto-sync only via `sync-preview.yml`). Conventional commits are enforced at release time, not pre-commit.

## Risks (open)

1. **`platform-api` placeholders** — wrangler bindings declared but never deployed. If anyone touches it, set IDs first.
2. **Single shared D1** — `astro-app` and `event-reminders-worker` share `ywcc-capstone-portal`. Migrations must stay coordinated; both Workers reload schema on deploy.
3. **`disable_nodejs_process_v2`** — workaround flag for Astro #15434 / #14511. Re-evaluate when `compatibility_date >= 2026-02-19` lands `fetch_iterable_type_support`.
4. **Cross-script DO dependency** — capstone middleware fails closed if `rate-limiter-worker` is unhealthy. Always deploy the rate limiter first when bootstrapping.
5. **`db-health.ts` exposure** — pending admin gate.
6. **No pre-commit hooks** — CI is the only enforcement. `eslint ^9.38.0` is listed in astro-app deps but **no flat-config file** exists; lint is advisory only. Both workspaces are missing `lint` / `format` npm scripts.
7. **`discord-bot` divergence** — Python scaffold here, TS Workers in production. Verify scope before modifying either side.
