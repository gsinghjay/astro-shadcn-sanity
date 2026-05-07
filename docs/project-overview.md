# Project Overview

**Project:** ywcc-capstone-template
**Version:** 2.0.0
**Repository:** https://github.com/gsinghjay/astro-shadcn-sanity
**Branch:** `preview` (production deploys from `main`)
**Generated:** 2026-04-29 (full rescan, deep)

## What this is

A multi-tenant Astro + Sanity monorepo running NJIT's Ying Wu College of Computing (YWCC) capstone-sponsor program plus two RWC content microsites. Three production Cloudflare Workers, three preview Workers, one Sanity Content Lake, one D1 portal database, and a small fleet of standalone helper Workers.

The platform's deliverables:

- **www.ywcccapstone1.com** — capstone sponsor program site (portal + auth + event reminders, full SSR via Astro 6 + `@astrojs/cloudflare` v13).
- **rwc-us.js426.workers.dev / rwc-intl.js426.workers.dev** — content-only RWC sites on the same codebase.
- **3 Studio Presentation preview Workers** (`*-preview.js426.workers.dev`) for editorial visual editing.
- **Sanity Studio** at https://ywcccapstone.sanity.studio with three workspaces (`/capstone`, `/rwc-us`, `/rwc-intl`).

Operating budget is **$0/month** on Cloudflare and Sanity free tiers.

## Repository type

Monorepo. Mix of npm workspaces (managed centrally) and standalone Workers (own `package.json` + wrangler config + deploy lifecycle):

| Part                       | Path                          | Type       | Tech                                                                  | Status                                                                   |
|----------------------------|-------------------------------|------------|-----------------------------------------------------------------------|--------------------------------------------------------------------------|
| **astro-app**              | `astro-app/`                  | Web SSR    | Astro 6.1.10 + React 19 (islands) + Tailwind v4 + Better Auth + Drizzle (D1) | Production — 6 Workers (capstone + rwc-us + rwc-intl × {prod, preview}) |
| **studio**                 | `studio/`                     | CMS        | Sanity Studio 5.23 (3 workspaces, single project `49nk9b0w`)          | Production — `sanity deploy` from `studio/`                              |
| **rate-limiter-worker**    | `rate-limiter-worker/`        | Edge       | TS + Durable Object SQLite                                            | Production — Worker `rate-limiter-worker`                                |
| **event-reminders-worker** | `event-reminders-worker/`     | Cron       | TS + D1 + Resend + Discord                                            | Production — Worker `ywcc-event-reminders` (daily 09:00 UTC)             |
| **platform-api**           | `platform-api/`               | API        | FastAPI Python on Cloudflare Workers (`python_workers` flag)          | Scaffold — KV/D1 IDs are placeholders; not deployed                      |
| **discord-bot**            | `discord-bot/discord-bot/`    | Bot        | Python (FastAPI + discord.py)                                         | Scaffold — production bots are CF Workers `capstone-bot` + `capstone-ask-worker` |

Languages: **TypeScript** (astro-app, studio, rate-limiter, event-reminders) + **Python 3.12+** (platform-api, discord-bot). Astro components use `.astro`; React islands use `.tsx`.

## Key metrics (current scan)

| Surface                         | Count                  | Notes                                              |
|---------------------------------|------------------------|----------------------------------------------------|
| Astro page files                | 41                     | 16 prerender=true, 20 prerender=false, rest inherit |
| API endpoints                   | 13                     | 7 in `/api/`, 6 in `/portal/api/*`                 |
| Astro Actions                   | 1                      | `submitForm` (Turnstile + Sanity write + Discord)  |
| Sanity document types           | 13                     | Includes `sponsorAgreement` (Story 15.11)          |
| Sanity object types             | 23                     |                                                    |
| Sanity block types              | 38                     | Composed via `defineBlock()` helper                |
| Sanity field types              | 1                      | `siteField` (multi-site filter)                    |
| Sanity migrations               | 3                      | All `.mjs` under `studio/migrations/`              |
| Sanity workspaces               | 3                      | `capstone`, `rwc-us`, `rwc-intl` (project `49nk9b0w`) |
| GROQ `defineQuery` invocations  | 34                     | Across `astro-app/src/lib/**`                       |
| Custom block components         | 38                     | `astro-app/src/components/blocks/custom/`           |
| shadcn UI primitive families    | 41                     | `astro-app/src/components/ui/<family>/`             |
| Storybook stories               | 187                    |                                                    |
| Vitest test files (astro-app)   | 84                     | Component + lib + page-level                       |
| Studio test files               | 13                     | Schema-level + presentation resolver               |
| Playwright E2E specs            | 20                     | × 5 browsers (Chromium / Firefox / WebKit / Mobile Chrome / Mobile Safari) |
| D1 tables                       | 8                      | user, session, account, verification, projectGithubRepos, subscribers, sent_reminders, agreement_acceptance |
| D1 migrations                   | 10                     | `astro-app/migrations/0000-0009`                    |
| Cloudflare Workers (this repo)  | 6                      | 3 prod (capstone, rwc-us, rwc-intl) + 3 preview     |
| GitHub Actions workflows        | 6                      | ci, release, deploy-storybook, sync-preview, enforce-preview-{branch,source} |
| Docker Compose services         | 5                      | astro-app, studio, astro-rwc-us, astro-rwc-intl, storybook |
| Wiki pages                      | 31                     | Long-form human-authored guides under `wiki/`       |

## Tech stack summary

| Layer                  | Technology                                             | Version             |
|------------------------|--------------------------------------------------------|---------------------|
| Astro framework        | astro                                                  | ^6.1.10             |
| Cloudflare adapter     | @astrojs/cloudflare                                    | ^13.2.2 (Workers-only) |
| React (islands)        | react / react-dom                                      | ^19.2.4             |
| Styling                | Tailwind CSS (CSS-first via @tailwindcss/vite)         | ^4.1.18             |
| Variants               | class-variance-authority                               | ^0.7.1              |
| State (minimal)        | nanostores + @nanostores/react                         | ^1.x                |
| Sanity client          | @sanity/astro / @sanity/visual-editing / @sanity/image-url / groq | ^3.2.11 / ^5.2.1 / ^1.2.0 / ^5.8.1 |
| Sanity Studio          | sanity / @sanity/vision                                | ^5.23.0             |
| Auth                   | better-auth (Google + GitHub OAuth + Magic Link)       | ^1.5.0              |
| ORM (D1)               | drizzle-orm                                            | ^0.45.1             |
| Email                  | resend                                                 | ^6.9.3              |
| Bot protection         | Cloudflare Turnstile                                   | —                   |
| Search/RAG (prod)      | @cloudflare/ai-search-snippet                          | 0.0.30              |
| Calendar (portal UI)   | @schedule-x/calendar + react                           | ^4.x                |
| LLMs.txt               | astro-llms-md (gated OFF when stega is enabled)        | ^2.0.0              |
| Tests (unit/component) | vitest + @vitest/coverage-v8 (+ AstroContainer)        | ^3.2.1              |
| Tests (E2E)            | playwright + @axe-core/playwright                      | ^1.58.2             |
| Stories                | storybook + storybook-astro                            | ^10.2.7             |
| Performance            | @lhci/cli (`>= 0.89` perf, LCP `<= 2000ms`)            | ^0.15.1             |
| Accessibility          | pa11y-ci (WCAG2AA)                                     | ^3.x                |
| Wrangler               | wrangler (root) / wrangler (astro-app)                 | ^4.76.0 / ^4.63.0   |
| Python (platform-api / discord-bot) | uv + fastapi + pydantic                   | py 3.12+            |

## What changed since the 2026-04-15 scan (v1.18.0 → v2.0.0)

This is a **major-bump release** for the platform layer. The previous scan was authoritative for v1.18.0 on Astro 5 / CF Pages. The current state diverges on these axes:

1. **Astro 5 → Astro 6.1.10.** Default output mode flipped to `'server'` (full SSR). Static pages now opt in via `export const prerender = true`. Required by Astro Actions (PR `d7e2417`).
2. **Cloudflare Pages → Cloudflare Workers** (PR #681 `feat/h1-astro-6-workers-2026-04`). `@astrojs/cloudflare` 12 → 13. Single Astro adapter entrypoint `@astrojs/cloudflare/entrypoints/server`. Static assets via `assets.directory + binding=ASSETS`. Pages adapter dropped — `wrangler pages dev/deploy` no longer applicable.
3. **Bindings access removed**: `Astro.locals.runtime.env` no longer exists; **always** `import { env } from 'cloudflare:workers'`. Codebase has zero residual references.
4. **Per-environment build-time env** via `CLOUDFLARE_ENV=<name> astro build && wrangler deploy`. The legacy `wrangler deploy --env <name>` flag is no longer applicable under the CF Vite plugin. Six envs: capstone / rwc_us / rwc_intl / capstone_preview / rwc_us_preview / rwc_intl_preview.
5. **Astro Fonts API graduated** out of experimental (PR `f687f66`). Self-hosted Inter via `fontsource` provider; `experimental.fonts` config removed.
6. **`disable_nodejs_process_v2` workaround flag** added for Astro #15434 / #14511 (SSR responses stringifying to `[object Object]`). Remove when `compatibility_date >= 2026-02-19` lands `fetch_iterable_type_support`.
7. **Sanity Studio 5.20 → 5.23.** Auto-bumped via `chore(studio): auto-bump @sanity/vision + sanity to 5.23.0`.
8. **New domain cutover**: production canonical host is now `www.ywcccapstone1.com`. Apex `ywcccapstone1.com` → `www` 301 via zone-level Single Redirect (apex never reaches the Worker).
9. **3 capstone-preview Workers** added for Studio Presentation iframe hosting (Story 15.10): `ywcc-capstone-preview` / `rwc-us-preview` / `rwc-intl-preview` on `*.workers.dev` with `PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true`.
10. **Sponsor agreement gate redesign** (Story 15.11): version pinning + audit capture in middleware. New D1 columns/tables via migrations 0007 / 0008 / 0009. Custom Studio tool `SponsorAcceptancesTool.tsx` (Capstone workspace only).
11. **Sitemap-driven LHCI / Pa11y URL set** (PR #680). LHCI/Pa11y now audit `dist/sitemap-index.xml` (was `/demo/**`). New helper `astro-app/scripts/sitemap-urls.cjs`. Caps via `LHCI_MAX_URLS=50` / `PA11Y_MAX_URLS=50`.
12. **`astro-llms-md`** generation added — gated OFF when visual editing is enabled to prevent stega marker leakage into `.txt`/`.md` output.
13. **Vite SSR workaround**: project-local `optimize-cjs-for-workerd` plugin pre-bundles `picomatch` (and `@astrojs/react > picomatch`) for the `workerd` SSR environment introduced by adapter v13.

See `_bmad-output/project-context.md` for the comprehensive change log + anti-patterns + edge cases (488 lines, agent-targeted).

## Architecture type

- **Style**: edge-first SSR with full server output, hybrid static (per-route opt-in via `prerender`), block-driven page builder.
- **Topology**: 1 origin Worker per environment (Astro SSR + Sanity client + Better Auth + middleware) with optional cross-script Durable Object (rate limiter), plus shared D1 / KV / standalone cron Worker.
- **Content model**: site-aware schemas in Sanity Studio shared across 3 workspaces. Multi-site filter `($site == "" || site == $site)` short-circuits when site is empty.
- **Dataflow**: Sanity Live Content API for editorial preview; published-only with module-level cache when stega is OFF; D1 + KV on the portal side for sessions and rate limiting.

## Risks / known issues

- `platform-api` has placeholder KV/D1 IDs and is not wired to astro-app — treat as a scaffold.
- `discord-bot` (Python) diverges from the production bots (`capstone-bot` + `capstone-ask-worker` Workers) — verify scope before touching either.
- Single D1 (`ywcc-capstone-portal`) is shared by `astro-app` and `event-reminders-worker`. Migrations under `astro-app/migrations/` apply for both — coordinate any change.
- `disable_nodejs_process_v2` is a workaround flag, not a permanent setting. Track Astro #15434 / #14511.
- No Husky / pre-commit hooks; CI is the only enforcement gate (`semantic-release` on `main` for tagging; `enforce-preview-*` workflows for branch protection).
- `src/pages/portal/api/db-health.ts` exposes SQLite table names to any authenticated user — TODO awaits an admin check.

## Next steps

- For deeper architecture: [architecture.md](./architecture.md)
- For data model and queries: [data-models.md](./data-models.md)
- For HTTP surface: [api-contracts.md](./api-contracts.md)
- For component catalog: [component-inventory.md](./component-inventory.md)
- For inter-part wiring: [integration-architecture.md](./integration-architecture.md)
- For environment + commands: [development-guide.md](./development-guide.md)
- For agent rules: [`../CLAUDE.md`](../CLAUDE.md), [`../_bmad-output/project-context.md`](../_bmad-output/project-context.md)
