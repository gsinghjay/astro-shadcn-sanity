# Source Tree Analysis

**Project:** ywcc-capstone-template v1.18.0
**Repository type:** monorepo (npm workspaces + standalone Cloudflare workers)
**Branch:** preview
**Generated:** 2026-04-15

## Monorepo Layout

```
astro-shadcn-sanity/
├── astro-app/                       # Astro 5 frontend (workspace: app, v0.0.1)
├── studio/                          # Sanity Studio v5 CMS (workspace: ywcc-capstone-studio)
├── platform-api/                    # FastAPI + Python Cloudflare Worker (workspace, scaffolding)
├── rate-limiter-worker/             # TS Cloudflare Worker + Durable Object (standalone)
├── event-reminders-worker/          # TS Cloudflare Worker, cron-driven emails (standalone)
├── discord-bot/discord-bot/         # Python Discord bot (standalone, nested, scaffolding)
├── tests/                           # Root Playwright E2E suite
├── scripts/                         # Utility scripts (Figma capture)
├── rules/                           # Sanity agent rules (*.mdc)
├── wiki/                            # Human-authored wiki (33 MD files)
├── docs/                            # This documentation folder
├── _bmad/                           # BMad framework files (skills installer)
├── _bmad-output/                    # BMad planning + implementation artifacts
├── _templates/fastapi-cf-worker/    # Template for Python CF workers
├── _wp-scrape/                      # WordPress site scraping utilities
├── .github/workflows/               # 6 CI/CD workflows
├── Dockerfile                       # Root dev-container (multi-stage)
├── docker-compose.yml               # 5 services (app, studio, storybook, rwc-us, rwc-intl)
├── playwright.config.ts             # E2E config (5 browser projects)
├── .releaserc.json                  # semantic-release config
├── .pa11yci.cjs                     # Pa11y accessibility CI config
├── CHANGELOG.md                     # Semantic-release output
├── CLAUDE.md                        # AI agent instructions for this repo
├── AGENTS.md                        # Sanity + MCP agent setup
├── DESIGN.md                        # NJIT design-system spec
├── README.md                        # Project overview (557 lines)
└── package.json                     # Root workspaces + top-level scripts
```

## Part 1: `astro-app/` — Astro Frontend

Deployed to Cloudflare Pages; static output with per-route SSR for /portal, /auth, /student, /api.

```
astro-app/
├── astro.config.mjs                 # Astro 5.18.1, Cloudflare adapter, astro:env schema, Fonts API
├── package.json                     # name "app", v0.0.1
├── wrangler.jsonc                   # Local dev bindings: D1 PORTAL_DB, KV SESSION_CACHE, DO RATE_LIMITER
├── components.json                  # shadcn new-york, baseColor neutral
├── tsconfig.json                    # strict, @/* → src/*
├── vitest.config.ts                 # mocks sanity:client + astro:env
├── migrations/                      # 7 D1 SQL migrations
│   ├── 0000_init.sql
│   ├── 0001_student_auth.sql
│   ├── 0002_add_user_role.sql
│   ├── 0003_backfill_sponsor_roles.sql
│   ├── 0004_create_subscribers.sql
│   ├── 0005_create_sent_reminders.sql
│   └── 0006_create_project_github_repos.sql
├── public/
│   ├── _headers                     # Cloudflare CSP / cache directives
│   ├── favicon.svg
│   └── logos/njit-logo-*.svg        # 4 variants (light/dark × plain/default)
├── scripts/                         # Utility scripts (seed audit, etc.)
├── src/
│   ├── env.d.ts                     # astro:env + astro types
│   ├── middleware.ts                # Auth + rate-limit + sponsor escalation (~200 lines)
│   ├── sanity.types.ts              # TypeGen output (22,303 lines)
│   ├── pages/                       # Routes (see below)
│   ├── layouts/                     # 4 .astro layouts
│   │   ├── Layout.astro
│   │   ├── PortalLayout.astro
│   │   ├── SidebarLayout.astro
│   │   └── templates/FullWidthTemplate.astro
│   ├── components/                  # ~681 component files (incl. stories)
│   │   ├── blocks/custom/           # 38 custom Sanity blocks
│   │   ├── ui/                      # 40 primitive families (shadcn + custom)
│   │   ├── portable-text/           # 6 Portable Text components
│   │   ├── portal/                  # React portal components
│   │   ├── react/                   # React islands (Schedule X calendar)
│   │   ├── concepts/                # Project page redesign concepts
│   │   ├── BlockRenderer.astro      # _type dispatch
│   │   └── BlockWrapper.astro       # Spacing/background/maxWidth wrapper
│   ├── lib/
│   │   ├── sanity.ts                # 30 defineQuery exports + block projections
│   │   ├── image.ts                 # urlFor / safeUrlFor / lqipStyle
│   │   ├── utils.ts                 # clsx + cn
│   │   ├── auth-config.ts           # Better Auth server config
│   │   ├── auth-client.ts           # Better Auth browser client
│   │   ├── db.ts                    # Drizzle D1 adapter
│   │   ├── drizzle-schema.ts        # user / session / account / verification / projectGithubRepos
│   │   ├── sanity-live.ts           # Optional live content
│   │   ├── github.ts                # GitHub API (repos, links)
│   │   ├── ical.ts                  # iCalendar export
│   │   ├── video.ts                 # YouTube/Vimeo embed helpers
│   │   ├── calendar-utils.ts        # @schedule-x helpers
│   │   ├── portable-text-utils.ts   # Serialization helpers
│   │   ├── article-jsonld.ts        # Article/NewsArticle schema
│   │   └── author-jsonld.ts         # Person schema
│   ├── stores/
│   │   └── calendarStore.ts         # nanostore
│   ├── styles/global.css            # Tailwind 4 entry
│   └── .storybook/                  # Storybook 10.2.7 config (custom lucide-static stub)
├── storybook-static/                # Built Storybook output (deployed to GitHub Pages)
└── dist/                            # Astro build output (deployed to CF Pages)
```

### astro-app/src/pages/ (34 routes)

```
pages/
├── index.astro                      # / — home (SSG)
├── [...slug].astro                  # catch-all for Sanity pages (SSG)
├── robots.txt.ts                    # API
├── rss.xml.ts                       # API (@astrojs/rss)
├── articles/
│   ├── index.astro                  # /articles (SSG)
│   ├── [slug].astro                 # /articles/[slug] + Article JSON-LD
│   └── category/[slug].astro        # /articles/category/[slug] (Story 19.10)
├── authors/
│   ├── index.astro                  # /authors (Story 20.2)
│   └── [slug].astro                 # /authors/[slug] + Person JSON-LD (20.3)
├── projects/
│   ├── index.astro                  # /projects (w/ sort controls, Story 4.6)
│   └── [slug].astro
├── sponsors/
│   ├── index.astro
│   └── [slug].astro
├── events/
│   ├── index.astro
│   └── [slug].astro
├── gallery/
│   └── index.astro                  # /gallery + PhotoSwipe (Story 22.4)
├── api/
│   ├── auth/[...all].ts             # Better Auth handler
│   ├── subscribe.ts                 # Newsletter signup → Resend
│   └── events/[slug].ics.ts         # iCal export
├── portal/
│   ├── index.astro                  # Sponsor dashboard (SSR, auth-gated)
│   ├── login.astro                  # OAuth entry (SSR, public)
│   ├── denied.astro                 # RBAC rejection (SSR, public)
│   ├── events.astro                 # Calendar view (SSR)
│   ├── progress.astro               # Metrics (SSR)
│   ├── [sponsorSlug].astro          # Sponsor workspace (SSR)
│   └── api/
│       ├── me.ts                    # Current user + sponsor
│       ├── projects.ts              # Sponsor's projects
│       ├── events.ts                # Sponsor's events
│       ├── db-health.ts             # D1 heartbeat
│       └── github/
│           ├── repos.ts             # GitHub API fetch
│           └── links.ts             # Project → repo linker
├── auth/
│   └── login.astro                  # Student OAuth entry
└── student/
    └── index.astro                  # Student placeholder (SSR, role: student)
```

### astro-app/src/components/blocks/custom/ (38 blocks)

Accordion, AnnouncementBar, ArticleList, BeforeAfter, CardGrid, **ColumnsBlock** (NEW 21.10 — 12-col grid wrapper), ComparisonTable, ContactForm, CountdownTimer, CtaBanner, Divider, EmbedBlock, EventList, FaqSection, FeatureGrid, HeroBanner, **ImageGallery** (NEW 22.4 — PhotoSwipe), LinkCards, LogoCloud, MapBlock, MetricsDashboard, Newsletter, PricingTable, ProductShowcase, ProjectCards, Pullquote, RichText, ServiceCards, SponsorCards, SponsorSteps, SponsorshipTiers, StatsRow, TabsBlock, TeamGrid, Testimonials, TextWithImage, Timeline, VideoEmbed.

Dispatched by `BlockRenderer.astro` via `_type`; wrapped by `BlockWrapper.astro` (spacing/background/maxWidth/alignment).

---

## Part 2: `studio/` — Sanity Studio v5

```
studio/
├── sanity.config.ts                 # 3 workspaces (capstone, rwc-us, rwc-intl)
├── sanity.cli.ts                    # TypeGen → ../astro-app/src/sanity.types.ts
├── package.json                     # name ywcc-capstone-studio
├── schema.json                      # Extracted/deployed schema (17,861 lines)
├── tsconfig.json                    # ES2017, strict
├── migrations/                      # 3 content migrations
│   ├── add-item-types.mjs           # Story 7.10
│   ├── rename-18-6-fields.mjs       # Story 18.6 (--dry-run supported)
│   └── rename-18-7-richtext-variants.mjs
├── static/.gitkeep
└── src/
    ├── presentation/                # Visual editing resolvers
    │   └── resolve.ts
    ├── structure/                   # Desk structure
    │   ├── capstone-desk-structure.ts
    │   └── rwc-desk-structure.ts
    └── schemaTypes/
        ├── index.ts
        ├── workspace-utils.ts       # createSchemaTypesForWorkspace (site-aware)
        ├── fields/
        │   └── site-field.ts        # siteField + siteScopedIsUnique
        ├── documents/               # 11 document types
        │   ├── article.ts
        │   ├── article-category.ts
        │   ├── author.ts
        │   ├── event.ts
        │   ├── listing-page.ts      # Singleton per route (Story 21.0)
        │   ├── page.ts
        │   ├── project.ts
        │   ├── site-settings.ts     # Singleton per site
        │   ├── sponsor.ts           # + logoSquare/logoHorizontal
        │   ├── submission.ts
        │   └── testimonial.ts
        ├── blocks/                  # 38 page-builder blocks
        └── objects/                 # 23 reusable objects
            ├── portable-text.ts
            ├── seo.ts
            ├── button.ts, link.ts
            ├── feature-item.ts, service-item.ts, product-item.ts
            ├── stat-item.ts, step-item.ts, faq-item.ts
            ├── pricing-tier.ts, sponsorship-tier-item.ts, metric-item.ts
            ├── link-card-item.ts, card-grid-item.ts
            ├── team-member.ts, gallery-image.ts, timeline-entry.ts
            ├── accordion-item.ts, tab-item.ts
            ├── comparison-row.ts, comparison-column.ts
            └── block-base.ts
```

---

## Part 3: `platform-api/` — FastAPI + Python Cloudflare Worker

Status: **scaffolding** (wrangler bindings contain `<your-...>` placeholders; Astro app does not call it yet).

```
platform-api/
├── README.md                        # 874 lines; template scaffold description
├── DEPLOYMENT-GUIDE.md              # 385 lines
├── wrangler.jsonc                   # Bindings: API_KV, DB (D1), AI; vars: SANITY_PROJECT_ID, datasets
├── pyproject.toml                   # Python 3.12; fastapi, httpx, pydantic; dev: workers-py, pytest
├── Dockerfile                       # Node 20-slim + Python 3.12 + uv + wrangler, :8787
├── docker-compose.yml               # Single "worker" service
├── package.json                     # devDependency wrangler only
├── src/
│   ├── main.py                      # Default WorkerEntrypoint (fetch, scheduled), ASGI bridge
│   ├── app.py                       # FastAPI app
│   ├── dependencies.py
│   ├── routers/                     # /api/v1/platform, /api/v1/content
│   ├── services/                    # Sanity + CF-binding helpers
│   ├── models/                      # Pydantic models
│   ├── queries/                     # GROQ strings
│   └── utils/
└── tests/                           # pytest + pytest-asyncio
    ├── test_health.py
    └── test_content.py
```

---

## Part 4: `rate-limiter-worker/` — TS Cloudflare Worker + Durable Object

Status: **production**. Bound into astro-app via DO RPC.

```
rate-limiter-worker/
├── wrangler.toml                    # DO binding: RATE_LIMITER → SlidingWindowRateLimiter
├── package.json                     # name rate-limiter-worker
├── vitest.config.ts
├── tsconfig.json
└── src/
    ├── index.ts                     # Default fetch handler + SlidingWindowRateLimiter DO class
    └── __tests__/
        └── rate-limiter.test.ts
```

---

## Part 5: `event-reminders-worker/` — TS Cloudflare Worker (Cron)

Status: **production**, standalone. Runs daily 09:00 UTC.

```
event-reminders-worker/
├── wrangler.toml                    # D1 DB (ywcc-capstone-portal), vars (SANITY), cron 0 9 * * *
├── package.json                     # dep: resend
├── vitest.config.ts
├── tsconfig.json
└── src/
    ├── index.ts                     # scheduled(event, env, ctx) — query Sanity events, send Discord + Resend emails
    └── __tests__/
        └── index.test.ts            # vitest (~15KB)
```

---

## Part 6: `discord-bot/discord-bot/` — Python Discord Bot

Status: **scaffolding**. Traditional-server deployment. Not wired to astro-app.

```
discord-bot/discord-bot/
├── pyproject.toml                   # name my-fastapi-app; fastapi, discord.py 2.4+, httpx, cryptography
└── src/
    ├── main.py                      # FastAPI /interactions (Ed25519-verified)
    ├── Bot.py                       # discord.py $hello handler
    ├── register_commands.py         # Registers /ping, /project-status, /upcoming-events, /sponsor-info
    ├── sanity.py                    # Sanity GROQ client
    ├── verify.mjs                   # Ed25519 signature helper
    └── models/
```

---

## Root Infrastructure

### `.github/workflows/` (6)
- `ci.yml` — PR → preview: unit-tests + site-health (Lighthouse CI + Pa11y CI on /demo/)
- `release.yml` — push → main: semantic-release
- `deploy-storybook.yml` — path-filtered push to main: build + publish to GitHub Pages
- `sync-preview.yml` — after release: merges main → preview + Discord notify
- `enforce-preview-branch.yml`, `enforce-preview-source.yml` — branch policy

### `tests/` (Playwright E2E, 19 specs × 5 browsers)
Domains: navigation, cookie-consent, articles (+category), sponsors, projects, gallery, dynamic-pages, error-pages, homepage, pages, site-settings, portal (auth, progress, events), events-calendar, smoke (a11y), seo-structured-data, gtm-datalayer.

### `scripts/`
- `figma-capture/` — Figma → Storybook snapshot tooling (figma-capture.mjs, generate-capture-map.mjs, generate-story-list.mjs)

### `rules/` (16 `.mdc` agent rules)
sanity-schema, sanity-groq, sanity-astro, sanity-get-started, sanity-visual-editing, sanity-studio-structure, sanity-image, sanity-page-builder, sanity-portable-text, sanity-project-structure, sanity-migration, sanity-localization, sanity-typegen, sanity-remix (ref), sanity-app-sdk, sanity-seo.

### `wiki/` (33 MD, ~17.8k lines)
Core & setup, architecture, feature guides (page builder, components, calendar, portal, auth, live content, visual editing), deployment (Cloudflare, bindings, KV, rate limit, env, first-time setup), dev practices (data flow, actions/forms, React islands, server islands, singleton, webhooks, testing, git workflow).

### `_bmad-output/` (planning + implementation artifacts)
- `project-context.md` (488 lines — implementation rules, patterns, anti-patterns)
- `planning-artifacts/` (9 files incl. architecture.md 1478L, prd.md 701L, gap-analysis 1304L, sprint-change proposals, epic stubs)
- `implementation-artifacts/` (189 files, keyed by epic-story)
- `test-artifacts/` (test-framework-doc 914L, ATDD checklists, test reviews)
- `brainstorming/` (6 sessions), `retrospective/` (17 files), `capstone/` (final reports, scope docs, meetings), `ux-concepts/`
- `technical-research-design-theme-system.md` (693L), `cloudflare-library-20260219.md`, `custom-components-layout-matrix.md` (380L)

### Root configuration files
- `Dockerfile` — Node 24-slim, multi-stage (dev-astro, dev-studio, dev-storybook)
- `docker-compose.yml` — 5 services (app:4321, studio:3333, storybook:6006 [profile], astro-rwc-us:4322 [profile rwc], astro-rwc-intl:4323 [profile rwc])
- `playwright.config.ts` — 5 browser projects, HTML + JUnit reporters
- `.releaserc.json` — semantic-release, conventional commits, main branch
- `.pa11yci.cjs` — WCAG2AA on /demo/ pages
- `package.json` — workspaces: studio, astro-app, platform-api; root scripts (dev, dev:storybook, test, test:unit, test:e2e, test:chromium, test:headed, test:ui, test:unit:watch, test:unit:coverage, storybook, typegen, deploy:rate-limiter)

## Entry-point index

| Surface | Entry | Deployment |
|---|---|---|
| Web (public) | `astro-app/src/pages/**` | Cloudflare Pages + Worker (adapter) |
| Sanity Studio | `studio/sanity.config.ts` | Sanity hosted (3 workspaces) |
| Platform API | `platform-api/src/main.py` (WorkerEntrypoint) | Cloudflare Python Worker (scaffold) |
| Rate limiter | `rate-limiter-worker/src/index.ts` | Cloudflare Worker + DO |
| Event reminders | `event-reminders-worker/src/index.ts` | Cloudflare Worker (cron) |
| Discord bot | `discord-bot/discord-bot/src/main.py` | Traditional server (not deployed) |
| Storybook | `astro-app/.storybook/main.ts` | GitHub Pages |

## Cross-part integration map

See [integration-architecture.md](./integration-architecture.md) for the full integration diagram.

Short version:

1. **astro-app → rate-limiter-worker** via Durable Object RPC binding (middleware per-IP sliding window, fail-open).
2. **astro-app ↔ Sanity Content Lake** via `@sanity/astro` (30 GROQ queries, visual editing stega, optional Live Content).
3. **astro-app ↔ D1 (PORTAL_DB)** via Drizzle ORM for Better Auth + subscribers + sent_reminders + project_github_repos.
4. **astro-app → KV (SESSION_CACHE)** for session cache (optional, D1 fallback).
5. **event-reminders-worker → D1 + Sanity + Resend + Discord webhook** (standalone cron).
6. **astro-app → Resend** via `/api/subscribe` and Better Auth Magic Link.
7. **astro-app → GitHub API** via `/portal/api/github/*` (sponsor repo linker).
8. **platform-api, discord-bot** — scaffolded, not wired.
