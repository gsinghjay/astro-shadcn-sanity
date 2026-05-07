# YWCC Capstone — Project Documentation

> Master index for the `astro-shadcn-sanity` monorepo. Point AI assistants and new contributors here first.

**Project:** ywcc-capstone-template
**Version:** 2.0.0
**Branch:** `preview` (production deploys from `main`)
**Repository type:** monorepo (npm workspaces + standalone Cloudflare Workers)
**Generated:** 2026-04-29 (full rescan, deep)
**Previous scan:** 2026-04-15 (v1.18.0; archived to `.archive/`)

## Project overview

- **Type:** monorepo, 6 parts, TypeScript + Python.
- **Primary framework:** Astro 6.1.10 (full SSR `output: 'server'`) on Cloudflare Workers via `@astrojs/cloudflare` v13.
- **CMS:** Sanity Studio 5.23 (3 workspaces — `capstone`, `rwc-us`, `rwc-intl` — sharing schemas via site-aware filtering on a single project `49nk9b0w`).
- **Auth:** Better Auth 1.5 (Google OAuth + GitHub OAuth + Resend Magic Link), D1-backed, KV-cached.
- **Edge services:** `rate-limiter-worker` (Durable Object), `event-reminders-worker` (cron, daily 09:00 UTC).
- **Deploys:** 6 Workers in **one** CF account (production: `ywcc-capstone`, `rwc-us`, `rwc-intl`; preview: `ywcc-capstone-preview`, `rwc-us-preview`, `rwc-intl-preview`).

## Why this rescan

The previous documentation (2026-04-15, v1.18.0) was authoritative for the **Astro 5 / Cloudflare Pages** topology. The codebase has since landed:

- **Astro 5 → Astro 6.1.10** (default `output: 'server'`; static via `prerender = true`).
- **Cloudflare Pages → Workers** (PR #681). `@astrojs/cloudflare` 12 → 13 — Workers-only.
- **Bindings access**: `Astro.locals.runtime.env` removed; **always** `import { env } from 'cloudflare:workers'`.
- **Build-time env hydration** via `CLOUDFLARE_ENV=<name> astro build` (legacy `wrangler deploy --env` flag no longer applicable).
- **Sanity Studio 5.20 → 5.23**. **Sponsor agreement gate redesigned** (Story 15.11) with version pinning + audit capture.
- **Astro Fonts API graduated** out of experimental.
- **3 preview Workers added** for Studio Presentation iframe (Story 15.10).
- **Sitemap-driven LHCI / Pa11y** (PR #680) replacing the legacy `/demo/**` URL set.

See `_bmad-output/project-context.md` and `docs/project-overview.md` § "What changed" for the full diff.

## Quick reference (by part)

| Part                       | Path                          | Type       | Tech                                                                  | Status                                                                   |
|----------------------------|-------------------------------|------------|-----------------------------------------------------------------------|--------------------------------------------------------------------------|
| **astro-app**              | `astro-app/`                  | Web SSR    | Astro 6.1.10 + React 19 (islands) + Tailwind v4 + Better Auth + Drizzle (D1) | Production — Workers `ywcc-capstone`, `rwc-us`, `rwc-intl` (+ 3 preview) |
| **studio**                 | `studio/`                     | CMS        | Sanity Studio 5.23 (3 workspaces, project `49nk9b0w`)                 | Production — `sanity deploy`                                            |
| **rate-limiter-worker**    | `rate-limiter-worker/`        | Edge       | TS + Durable Object SQLite (`SlidingWindowRateLimiter`)                | Production — Worker `rate-limiter-worker`                                |
| **event-reminders-worker** | `event-reminders-worker/`     | Cron       | TS + D1 + Resend + Discord webhook                                    | Production — Worker `ywcc-event-reminders` (daily 09:00 UTC)             |
| **platform-api**           | `platform-api/`               | API        | FastAPI Python on CF Workers (`python_workers` flag)                   | Scaffold — placeholder KV/D1 IDs; not deployed                           |
| **discord-bot**            | `discord-bot/discord-bot/`    | Bot        | Python (FastAPI + discord.py)                                         | Scaffold — production bots are CF Workers `capstone-bot` + `capstone-ask-worker` |

## Key metrics (current scan)

| Surface                         | Count                  | Notes |
|---------------------------------|------------------------|-------|
| Astro page files                | 41                     | 16 prerender=true / 20 prerender=false / rest inherit SSR |
| API endpoints                   | 13                     | 7 in `/api/` + 6 in `/portal/api/*` |
| Astro Actions                   | 1                      | `submitForm` |
| Sanity document types           | 13                     | Includes `sponsorAgreement` (Story 15.11) |
| Sanity object types             | 23                     |       |
| Sanity block types              | 38                     | Composed via `defineBlock()` |
| Sanity workspaces               | 3                      | capstone, rwc-us, rwc-intl |
| GROQ `defineQuery` exports      | 32                     | All in `astro-app/src/lib/sanity.ts` |
| Custom block components         | 38                     | `astro-app/src/components/blocks/custom/` |
| shadcn UI primitive families    | 40 (+ 1 inline)        | `astro-app/src/components/ui/` |
| Storybook stories               | 187                    | Colocated with components |
| Vitest test files (astro-app)   | 84                     | + 13 in studio |
| Playwright E2E specs            | 20                     | × 5 browsers (Chromium / Firefox / WebKit / Mobile Chrome / Mobile Safari) |
| Demo-audit fixtures             | 39                     | One per block; seeded via Sanity MCP |
| D1 tables                       | 13                     | 4 Better Auth + 3 feature + 6 legacy `0000_init` |
| D1 migrations                   | 10                     | `astro-app/migrations/0000-0009` |
| Sanity migrations               | 3                      | `studio/migrations/*.mjs` |
| Cloudflare Workers (this repo)  | 6                      | 3 prod + 3 preview |
| GitHub Actions workflows        | 6                      | ci, release, deploy-storybook, sync-preview, enforce-preview-{branch,source} |
| Docker Compose services         | 5                      | astro-app, studio, astro-rwc-us, astro-rwc-intl, storybook |
| Wiki guides                     | 31                     | Long-form human-authored under `wiki/` |
| Sanity agent rules              | 16                     | `rules/*.mdc` |
| BMad artifacts                  | 314                    | `_bmad-output/**/*.md` |

## Generated documentation

- [Project overview](./project-overview.md) — executive summary, parts, metrics, version-bump rationale.
- [Architecture](./architecture.md) — topology, patterns, per-part architecture, data + auth, deployment, testing, security posture, risks.
- [Source tree analysis](./source-tree-analysis.md) — annotated directory tree per part.
- [Component inventory](./component-inventory.md) — 38 custom blocks, 40 UI primitives, Portable Text, portal islands.
- [Data models](./data-models.md) — Sanity documents/objects/blocks, GROQ inventory, D1 tables, migrations, cross-store linkage.
- [API contracts](./api-contracts.md) — public + portal HTTP routes, Astro Actions, DO RPC, cron, Sanity webhook.
- [Integration architecture](./integration-architecture.md) — how parts communicate, external services, multi-site mechanics.
- [Development guide](./development-guide.md) — prerequisites, setup, commands, env vars, testing, schema/D1 pipelines, deploy.

## Strategy & reference docs

All strategy docs were refreshed 2026-04-29 for the Workers cutover. Pages-era references have been removed; deployment specifics now match the live topology.

- [Auth consolidation strategy](./auth-consolidation-strategy.md) — Better Auth rollout + CF Access retirement (now complete).
- [Better Auth vs identity servers](./better-auth-vs-identity-servers.md) — comparison write-up.
- [Cloudflare guide](./cloudflare-guide.md) — operational guide for the Workers stack (plan trade-offs, monitoring, troubleshooting, escape hatch). Cross-links to the topical docs below for details.
- [Cloudflare infrastructure guide](./cloudflare-infrastructure-guide.md) — full resource inventory: 6 Workers + D1 + KV + DO + Turnstile, env vars, bindings, handoff checklist.
- [Cloudflare serverless primer](./cloudflare-serverless-primer.md) — concept primer for VPS-background developers.
- [Cost optimization strategy](./cost-optimization-strategy.md) — $0/month free-tier plan, current usage vs Workers limits.
- [GTM & analytics strategy](./gtm-analytics-strategy.md)
- [Image optimization strategy](./image-optimization-strategy.md) — Sanity CDN + LQIP + `fetchpriority` rules.
- [Rate limiting with Durable Objects](./rate-limiting-with-durable-objects.md) — cross-script DO design + post-CF-Access architecture.
- [VPS migration plan](./vps-migration-plan.md) — escape-hatch Dockerized VPS path.
- [Authentication strategy](./authentication-strategy.md) — retired stub; superseded by auth-consolidation-strategy.

## Team docs

- [Capstone status report](./team/capstone-status-report.md)
- [Professional development](./team/professional-development.md)
- [GTM doc draft](./team/will-turn-this-into-gtm-doc.md)

## Project instructions for AI agents

- [`CLAUDE.md`](../CLAUDE.md) — repo-wide rules, commands, layout patterns, boundaries.
- [`AGENTS.md`](../AGENTS.md) — Sanity + MCP agent setup for Claude Code / Cursor.
- [`DESIGN.md`](../DESIGN.md) — NJIT design-system spec (Swiss grid, flat depth, sharp corners).
- [`_bmad-output/project-context.md`](../_bmad-output/project-context.md) — implementation rules, patterns, anti-patterns (488 lines, agent-targeted).
- [`rules/*.mdc`](../rules/) — 16 Sanity agent rule files (sanity-schema, sanity-groq, sanity-astro, sanity-page-builder, sanity-portable-text, sanity-typegen, sanity-visual-editing, sanity-studio-structure, sanity-project-structure, sanity-image, sanity-seo, sanity-migration, sanity-localization, sanity-get-started, sanity-app-sdk, sanity-remix).

## Wiki (long-form guides)

Browse `../wiki/` for 31 human-authored topic guides:

- **Foundations**: Home, Getting-Started, Glossary, Project-Structure-Reference
- **Architecture**: Architecture-Overview, Multi-Site-Architecture, Understanding-Astro, Understanding-Sanity
- **Page builder**: Page-Builder-System, Block-Conversion-Guide, Components-and-Styling
- **Portal + auth**: Portal-and-Authentication, Better-Auth-Integration
- **Cloudflare**: Cloudflare-Deployment, Cloudflare-Bindings-and-D1, KV-Storage, Rate-Limiting
- **Env + setup**: Environment-and-Configuration, First-Time-Setup-and-Migration
- **Sanity runtime**: Live-Content-API, Visual-Editing-and-Preview
- **Patterns**: Data-Flow-and-Queries, Astro-Actions-and-Forms, React-Islands-Guide, Server-Islands-Explained, Singleton-Pattern, GROQ-Webhooks-Explained
- **Features**: Calendar-and-Events-System
- **Quality**: Testing-Guide, Git-Workflow-and-Contributing

## BMad planning artifacts

Under `../_bmad-output/`:

- `project-context.md` — mandatory reading for non-trivial implementation work (488 lines, last refreshed 2026-04-29).
- `planning-artifacts/` — PRD, architecture proposal, gap analysis, sprint-change proposals, epic stubs.
- `implementation-artifacts/stories/` — 194 per-story specs keyed `{epic}-{story}-*.md`.
- `test-artifacts/` — test framework doc, ATDD checklists, test reviews.
- `audits/` — code/security audit notes (9 files).
- `brainstorming/` (6), `retrospective/` (17), `capstone/` (12), `ux-concepts/` (1).
- Top-level: `technical-research-design-theme-system.md`, `cloudflare-library-20260219.md`, `custom-components-layout-matrix.md`, `project-context-full.md`.

## Root files

| File | Purpose |
|---|---|
| [`../README.md`](../README.md) | Public README (557 lines) |
| [`../AGENTS.md`](../AGENTS.md) | Sanity + MCP agent configuration |
| [`../CLAUDE.md`](../CLAUDE.md) | Claude Code / Claude Agent project rules |
| [`../DESIGN.md`](../DESIGN.md) | Design system specification |
| [`../CHANGELOG.md`](../CHANGELOG.md) | Semantic-release output (v2.0.0 current) |

## Getting started

```bash
# 1. Install (npm workspaces — root)
npm install

# 2. Populate astro-app env
cp astro-app/.env.example astro-app/.env

# 3. Deploy schema + generate types (required before first build)
cd studio && npx sanity schema deploy && cd ..
npm run typegen

# 4. Apply local D1 migrations
cd astro-app && npx wrangler d1 migrations apply PORTAL_DB --local && cd ..

# 5. Run everything
npm run dev              # astro-app:4321 + studio:3333
npm run dev:storybook    # + storybook:6006
```

For full setup, testing, deployment, and Worker-specific commands: see [development-guide.md](./development-guide.md).

## When planning new work

- **Brownfield PRD:** provide this file (`docs/index.md`) as the retrieval anchor. The architecture, data-models, integration-architecture, and component-inventory documents together describe the complete system surface.
- **UI-only feature:** reference [component-inventory.md](./component-inventory.md) and the section composables in `src/components/ui/section/`.
- **Schema or content model change:** read [data-models.md](./data-models.md), `rules/sanity-schema.mdc`, and the migration examples in `studio/migrations/`.
- **Portal / auth feature:** read [auth-consolidation-strategy.md](./auth-consolidation-strategy.md) + the auth section in [architecture.md](./architecture.md).
- **Performance / SEO feature:** read [image-optimization-strategy.md](./image-optimization-strategy.md), [gtm-analytics-strategy.md](./gtm-analytics-strategy.md), and the CI thresholds in `astro-app/.lighthouserc.cjs` + `astro-app/.pa11yci.cjs`.
- **Deploy / infra change:** read the deployment section in [architecture.md](./architecture.md) — note that the Pages-era sections of `cloudflare-guide.md` are stale post-cutover.
