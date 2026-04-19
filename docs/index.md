# YWCC Capstone — Project Documentation

> Master index for the `astro-shadcn-sanity` monorepo. Point AI assistants and new contributors here first.

**Project:** ywcc-capstone-template
**Version:** 1.18.0
**Branch:** `preview`
**Repository type:** monorepo (npm workspaces + standalone Cloudflare workers)
**Generated:** 2026-04-15 (full_rescan, exhaustive)
**Previous scan:** 2026-03-11 (v1.11.0)

## Project overview

- **Type:** monorepo, 6 parts, TypeScript + Python.
- **Primary framework:** Astro 5.18 SSG with per-route SSR via the Cloudflare adapter.
- **CMS:** Sanity Studio 5.20 (3 workspaces: capstone, rwc-us, rwc-intl) sharing schemas via site-aware filtering.
- **Auth:** Better Auth (Google OAuth, GitHub OAuth, Resend Magic Link), D1-backed, KV-cached.
- **Edge services:** `rate-limiter-worker` (Durable Object), `event-reminders-worker` (cron), `platform-api` (Python Worker — scaffold), `discord-bot` (Python — scaffold).

## Quick reference (by part)

| Part | Path | Type | Tech | Status |
|---|---|---|---|---|
| astro-app | `astro-app/` | Web (SSG + SSR) | Astro 5.18 + React 19 + Tailwind 4 + Better Auth + Drizzle D1 | Production (Pages: `ywcc-capstone`, `rwc-us`, `rwc-intl`) |
| studio | `studio/` | CMS | Sanity Studio 5.20 (3 workspaces) | Production (deploy hooks wired to all 3 Pages projects) |
| rate-limiter-worker | `rate-limiter-worker/` | Edge | TS CF Worker + Durable Object (SQLite sliding window) | Production |
| event-reminders-worker | `event-reminders-worker/` | Cron | TS CF Worker (daily 09:00 UTC) | Production (Worker `ywcc-event-reminders`) |
| platform-api | `platform-api/` | API | FastAPI + Python Cloudflare Worker | Scaffolding (not deployed) |
| discord-bot (repo) | `discord-bot/discord-bot/` | Bot | Python FastAPI + discord.py | Scaffolding |
| discord-bot (prod) | *Workers: `capstone-bot`, `capstone-ask-worker`* | Bot + RAG | TS Workers, AI Search binding | Production |

## Key metrics (current scan)

| Surface | Count |
|---|---|
| Routes (SSG + SSR + API) | 34 |
| Custom Sanity blocks | 38 |
| UI primitive families | 40 |
| Sanity document types | 11 |
| Sanity object types | 23 |
| Sanity block types | 38 |
| GROQ `defineQuery` exports | 30 |
| D1 tables | 7 |
| D1 migrations | 7 |
| Sanity migrations | 3 |
| Storybook stories | 187 |
| Vitest test files | 75 |
| Playwright E2E specs | 19 (×5 browsers) |
| GitHub Actions workflows | 6 |
| Docker Compose services | 5 |

## Generated documentation

- [Project overview](./project-overview.md) — executive summary, parts, metrics, recent highlights.
- [Architecture](./architecture.md) — topology, patterns, tech stack per part, data + auth architecture, deployment, testing, security posture, risks.
- [Source tree analysis](./source-tree-analysis.md) — annotated directory tree for every part plus root infra.
- [Component inventory](./component-inventory.md) — all 38 custom blocks, 40 UI primitives, Portable Text components, rendering pipeline.
- [Data models](./data-models.md) — Sanity schema (documents / objects / blocks), D1 tables, migrations, query list, cross-store linkage.
- [API contracts](./api-contracts.md) — public APIs, portal APIs, DO RPC, cron contract, error conventions.
- [Integration architecture](./integration-architecture.md) — how parts communicate, integration diagram, data flows, risks.
- [Development guide](./development-guide.md) — prerequisites, setup, commands, env vars, testing, schema workflow, migrations, common tasks.

## Strategy & reference docs

Topical deep-dives authored separately — cross-link from brownfield PRDs and feature work.

- [Authentication consolidation strategy](./auth-consolidation-strategy.md) — Better Auth rollout + student-portal descope plan.
- [Better Auth vs identity servers](./better-auth-vs-identity-servers.md) — trade-off write-up.
- [Cloudflare guide](./cloudflare-guide.md) — comprehensive Pages/Workers/D1/KV/DO reference (1,334 lines).
- [Cloudflare infrastructure guide](./cloudflare-infrastructure-guide.md) — services + bindings used by YWCC.
- [Cloudflare serverless primer](./cloudflare-serverless-primer.md) — concepts for VPS-background developers.
- [Cost optimization strategy](./cost-optimization-strategy.md) — free-tier operating plan.
- [GTM & analytics strategy](./gtm-analytics-strategy.md) — GTM wiring + GA4 events.
- [Image optimization strategy](./image-optimization-strategy.md) — Sanity CDN + LQIP + `fetchpriority` rules.
- [Rate limiting with Durable Objects](./rate-limiting-with-durable-objects.md) — DO sliding-window implementation.
- [VPS migration plan](./vps-migration-plan.md) — Dockerized VPS escape hatch (1,261 lines).
- [Authentication strategy](./authentication-strategy.md) — retired stub; superseded by auth-consolidation-strategy.

## Team docs

- [Capstone status report](./team/capstone-status-report.md)
- [Professional development](./team/professional-development.md)
- [GTM doc draft](./team/will-turn-this-into-gtm-doc.md)

## Project instructions for AI agents

- [`CLAUDE.md`](../CLAUDE.md) — repo-wide rules, commands, layout patterns, boundaries.
- [`AGENTS.md`](../AGENTS.md) — Sanity + MCP agent setup for Claude Code / Cursor.
- [`DESIGN.md`](../DESIGN.md) — NJIT design-system spec (Swiss grid, flat depth, sharp corners).
- [`_bmad-output/project-context.md`](../_bmad-output/project-context.md) — implementation rules, patterns, anti-patterns (488 lines).
- [`rules/*.mdc`](../rules/) — 16 Sanity agent rule files (sanity-schema, sanity-groq, sanity-astro, sanity-page-builder, sanity-portable-text, sanity-typegen, sanity-visual-editing, sanity-studio-structure, sanity-project-structure, sanity-image, sanity-seo, sanity-migration, sanity-localization, sanity-get-started, sanity-app-sdk, sanity-remix).

## Wiki (long-form guides)

Browse `../wiki/` for 33 human-authored topic guides:

- Home, Getting-Started, Glossary, Project-Structure-Reference
- Architecture-Overview, Multi-Site-Architecture, Understanding-Astro, Understanding-Sanity
- Page-Builder-System, Block-Conversion-Guide, Components-and-Styling
- Portal-and-Authentication, Better-Auth-Integration
- Cloudflare-Deployment, Cloudflare-Bindings-and-D1, KV-Storage, Rate-Limiting
- Environment-and-Configuration, First-Time-Setup-and-Migration
- Live-Content-API, Visual-Editing-and-Preview
- Data-Flow-and-Queries, Astro-Actions-and-Forms, React-Islands-Guide, Server-Islands-Explained, Singleton-Pattern, GROQ-Webhooks-Explained
- Calendar-and-Events-System
- Testing-Guide, Git-Workflow-and-Contributing

## BMad planning artifacts

Under `../_bmad-output/`:

- `project-context.md` — mandatory reading for non-trivial implementation work.
- `planning-artifacts/` — PRD (701 lines), architecture proposal (1,478 lines), gap analysis (1,304 lines), sprint-change proposals, epic stubs.
- `implementation-artifacts/` — 189 per-story specs keyed `{epic}-{story}-*.md`.
- `test-artifacts/` — test framework doc (914 lines), ATDD checklists, test reviews.
- `brainstorming/` (6 sessions), `retrospective/` (17 files), `capstone/` (final reports, scope matrix, meetings), `ux-concepts/`.
- `technical-research-design-theme-system.md`, `cloudflare-library-20260219.md`, `custom-components-layout-matrix.md`.

## Root files

| File | Purpose |
|---|---|
| [`../README.md`](../README.md) | Public README (557 lines) |
| [`../AGENTS.md`](../AGENTS.md) | Sanity + MCP agent configuration |
| [`../CLAUDE.md`](../CLAUDE.md) | Claude Code / Claude Agent project rules |
| [`../DESIGN.md`](../DESIGN.md) | Design system specification |
| [`../CHANGELOG.md`](../CHANGELOG.md) | Semantic-release output (v1.18.0 current) |

## Getting started

```bash
# 1. Install (npm workspaces)
npm install

# 2. Populate env (see development-guide.md § Environment)
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

For detailed instructions including tests, deployment, and worker-specific commands, read [development-guide.md](./development-guide.md).

## When planning new work

- **Brownfield PRD:** provide this file (`docs/index.md`) as the retrieval anchor. The architecture, data-models, integration-architecture, and component-inventory documents together describe the complete system surface.
- **UI-only feature:** reference [component-inventory.md](./component-inventory.md) and the 12-column grid pattern in `src/components/ui/section/`.
- **Schema or content model change:** read [data-models.md](./data-models.md), `rules/sanity-schema.mdc`, and the migration examples in `studio/migrations/`.
- **Portal / auth feature:** read [auth-consolidation-strategy.md](./auth-consolidation-strategy.md) + the auth section in [architecture.md](./architecture.md).
- **Performance / SEO feature:** read [image-optimization-strategy.md](./image-optimization-strategy.md), [gtm-analytics-strategy.md](./gtm-analytics-strategy.md), and the CI thresholds in `.pa11yci.cjs` + Lighthouse CI config.
- **Deploy / infra change:** read [cloudflare-guide.md](./cloudflare-guide.md) and [integration-architecture.md](./integration-architecture.md).
