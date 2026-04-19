# Development Guide

**Project:** ywcc-capstone-template v1.18.0
**Generated:** 2026-04-15

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 22 (CI minimum), 24 recommended for release workflow | Install via `nvm`/`fnm`. `docker-compose` uses 20/24-slim base images. |
| npm | ≥ 10 (ships with Node 22) | The repo uses npm workspaces (no pnpm / yarn). |
| Python | 3.12 | Only needed for `platform-api` and `discord-bot`. |
| uv | latest | Python package manager used by `platform-api` (`uv run pywrangler dev`). |
| wrangler | ^4.63 | Cloudflare CLI — installed as a root dependency. |
| Sanity CLI | ^3 (bundled in `studio/node_modules/.bin/sanity`) | Accessed via `npx sanity …` from `studio/`. |
| Docker | latest | Optional — root `Dockerfile` + `docker-compose.yml` provide reproducible dev containers. |

## First-time setup

```bash
# From the repo root
git clone https://github.com/gsinghjay/astro-shadcn-sanity.git
cd astro-shadcn-sanity

# Install all workspace deps (astro-app, studio, platform-api)
npm install

# Populate local env files (see "Environment" below)
cp astro-app/.env.example astro-app/.env
cp studio/.env.example studio/.env          # if present

# Deploy the Sanity schema to Content Lake (required for MCP tools + queries)
cd studio && npx sanity schema deploy && cd ..

# Generate TypeScript types from schema
npm run typegen

# Apply local D1 migrations (astro-app dev uses a local SQLite file via wrangler)
npx wrangler d1 migrations apply PORTAL_DB --local  # run from astro-app/
```

## Running locally

### Both Astro + Studio together

```bash
npm run dev                  # concurrently runs astro-app (:4321) + studio (:3333)
npm run dev:storybook        # also launches Storybook (:6006)
```

### Individually

```bash
npm run dev -w astro-app     # Astro only (:4321)
npm run dev -w studio        # Studio only (:3333)
npm run storybook -w astro-app
```

### Docker

```bash
docker compose up astro-app studio                       # default capstone variant
docker compose --profile rwc up astro-rwc-us astro-rwc-intl   # RWC multi-site
docker compose --profile storybook up storybook          # Storybook
```

Ports: astro-app `4321`, studio `3333`, storybook `6006`, rwc-us `4322`, rwc-intl `4323`.

## Environment variables

`astro-app/astro.config.mjs` defines a typed `astro:env` schema. Every client-side read is type-checked; server-only secrets never leak to the browser.

### Client public (bundled into HTML)
- `PUBLIC_GTM_ID` — optional GTM container ID.
- `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` — bool, toggles `@sanity/visual-editing` overlay.
- `PUBLIC_SANITY_LIVE_CONTENT_ENABLED` — bool, opt-in to Live Content API subscriptions.
- `PUBLIC_SITE_URL` — default `http://localhost:4321`.
- `PUBLIC_SANITY_STUDIO_URL` — default `http://localhost:3333`.
- `PUBLIC_SANITY_DATASET` — default `production`.
- `PUBLIC_SITE_ID` — default `capstone`. Set to `rwc-us` / `rwc-intl` for RWC variants.
- `PUBLIC_SITE_THEME` — enum `red` (default) / `blue` / `green`.

### Server public (runtime)
- `PUBLIC_SANITY_STUDIO_PROJECT_ID` — **required**. Currently `49nk9b0w`.
- `PUBLIC_SANITY_STUDIO_DATASET` — defaults to `production`.

### Server secret (Cloudflare Pages / Workers dashboard)
- `SANITY_API_READ_TOKEN` — optional Sanity read token (used for draft previews).
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` — Better Auth signing secret + canonical URL.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — Magic Link + newsletter.
- `TURNSTILE_SECRET_KEY` — optional bot protection on contact forms.
- `DISCORD_WEBHOOK_URL` — optional admin notifications.

For Workers, set secrets via `npx wrangler secret put KEY` from each worker directory. For Pages, use the Cloudflare dashboard. **Never commit a real `.env` or hard-code tokens in code.**

### Worker-specific env

| Worker | Required secrets |
|---|---|
| event-reminders-worker | `SANITY_API_TOKEN`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `DISCORD_WEBHOOK_URL` |
| rate-limiter-worker | none |
| platform-api | `sanity_api_read_token` (inferred), optional `sanity_api_write_token` |
| discord-bot | `DISCORD_PUBLIC_KEY`, `DISCORD_APPLICATION_ID`, `DISCORD_TOKEN`, `SANITY_PROJECT_ID`, `SANITY_DATASET` |

## Build

```bash
npm run build -w astro-app        # astro check && astro build → astro-app/dist/
npm run build -w studio           # studio/dist/
npm run build-storybook -w astro-app   # astro-app/storybook-static/
```

`astro check` enforces TypeScript types, including Sanity TypeGen output. A failing `check` fails the build.

## Testing

### Unit & component (Vitest)

```bash
npm run test:unit                 # runs astro-app unit tests
npm run test:unit:watch
npm run test:unit:coverage        # v8 coverage → test-results/unit-coverage/
npx vitest run                    # direct invocation from astro-app/
```

Test layout:
- `astro-app/src/**/__tests__/**/*.test.ts` — co-located with source.
- `tests/integration/**/*.test.ts` — integration tests (mounted via vitest config alias).
- `rate-limiter-worker/test/rate-limiter.test.ts`
- `event-reminders-worker/src/__tests__/index.test.ts`
- `platform-api/tests/test_*.py` — pytest (`uv run pytest`).

### E2E (Playwright)

```bash
npm run test:e2e                  # all projects (chromium, firefox, webkit, mobile-chrome, mobile-safari)
npm run test:chromium             # chromium only — fast feedback
npm run test:headed               # headed chromium
npm run test:ui                   # Playwright UI mode
```

Config: `playwright.config.ts`. Base URL `http://localhost:4321` (overridable via `BASE_URL`). The runner auto-builds astro-app and serves `dist/` unless a dev server is already running.

19 specs cover: navigation, cookie-consent, articles (+category), sponsors, projects, gallery, dynamic-pages, error-pages, homepage, pages, site-settings, portal (auth, progress, events), events-calendar, smoke (a11y), seo-structured-data, gtm-datalayer.

### Accessibility (Pa11y)

```bash
# Local (requires astro-app build + preview running on :4321)
npm run build -w astro-app && npm run preview -w astro-app &
npx pa11y-ci --config .pa11yci.cjs
```

### Performance (Lighthouse CI)

```bash
npx lhci autorun
```

Reports archived to `.lhci/`. Thresholds enforced in CI via `ci.yml` (continue-on-error for noise, LCP/perf asserted).

### Visual regression (Chromatic)

```bash
npm run storybook -w astro-app
npx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN
```

## Schema & TypeGen workflow

Any schema change requires **two** steps:

```bash
# 1. Edit files under studio/src/schemaTypes/**
# 2. From the repo root: regenerate TypeScript types
npm run typegen

# 3. If schema types changed, deploy to Content Lake (required for MCP tools):
cd studio && npx sanity schema deploy && cd ..
```

The deploy extracts from `studio/schema.json` (17,861 lines committed). Output lands at `astro-app/src/sanity.types.ts` (~22k lines). Visual Editing and MCP content tools both depend on the deployed schema.

## Migrations

### D1 (astro-app)

SQL files live at `astro-app/migrations/0000_*.sql` … `0006_*.sql`. Apply:

```bash
cd astro-app
npx wrangler d1 migrations apply PORTAL_DB --local         # local dev
npx wrangler d1 migrations apply PORTAL_DB --remote        # production (requires CF creds)
```

### Sanity content

Content migrations live at `studio/migrations/*.mjs`. Run with `--dry-run` first:

```bash
cd studio
npx sanity migration run rename-18-6-fields --dry-run
npx sanity migration run rename-18-6-fields --no-dry-run --confirm
```

## Branching & commit conventions

- Default branch: `main`. Pre-release: `preview`.
- PRs target `preview`; `release.yml` merges `main` back into `preview` automatically after each release.
- Conventional Commits required (enforced by `@semantic-release/commit-analyzer` on `main`). Types: `feat`, `fix`, `perf`, `docs`, `chore`, `ci`, `test`, `refactor`.
- Breaking changes use `feat!:` or a `BREAKING CHANGE:` footer.
- No Husky / pre-commit hooks; CI is the enforcement gate.

## Formatting & linting

- `astro-app/.prettierrc` — singleQuote, trailingComma `all`, arrowParens `avoid`, tabWidth 2, printWidth 120.
- `astro-app/.eslintrc` — minimal; rely on `astro check` for type enforcement.
- No root-level config; each workspace owns its rules.

## Common tasks

| Task | Command |
|---|---|
| Add a new shadcn component | From `astro-app/`: `npx shadcn@latest add <name>` |
| Add a new Sanity block | See `rules/sanity-page-builder.mdc`; edit `studio/src/schemaTypes/blocks/<block>.ts`, add matching `astro-app/src/components/blocks/custom/<Block>.astro`, wire dispatch in `BlockRenderer.astro` and projection in `lib/sanity.ts` |
| Add a new page route | Create `astro-app/src/pages/<path>.astro`; for SSR add `export const prerender = false` |
| Deploy astro-app | Cloudflare Pages deploys on push to `main` (Pages Git integration) |
| Deploy a worker | From worker directory: `npm run deploy` or `npx wrangler deploy` |
| Deploy Sanity Studio | From `studio/`: `npx sanity deploy` |
| Tail a Worker's logs | `npx wrangler tail <worker-name>` |
| Seed demo content | See `astro-app/scripts/seed-demo-audit.md` |
| Capture Figma frames for Storybook | `node scripts/figma-capture/figma-capture.mjs` |

## Debugging

- **Astro SSR 500s on Pages:** check `wrangler tail`; most are missing secrets or D1 migrations not applied.
- **Sanity queries returning null:** confirm schema is deployed to the *correct* workspace (`npx sanity schema deploy` from `studio/`); TypeGen alone is not enough.
- **Visual editing blank overlay:** `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` must be `true`, and the Studio origin must be whitelisted in `sanity.config.ts` `presentationTool` config.
- **Rate limiter 429s in dev:** the middleware fails open if the DO binding is missing locally; if you are seeing unexpected 429s, clear the DO with `npx wrangler d1 execute … DROP TABLE requests`.
- **Portal redirects to /portal/denied:** check `SPONSOR_WHITELIST_QUERY` results — the email must match a sponsor doc's `contacts[].email`. In dev, `middleware.ts` injects a mock sponsor when `import.meta.env.DEV` is true.
- **Storybook fails with lucide crash:** the `.storybook/main.ts` ships a custom `lucide-static` stub plugin; if it misfires, ensure `tsconfig.json` `moduleResolution` is `bundler`.

## Observability

- **Cloudflare Workers/Pages logs:** `npx wrangler tail <name>` or CF dashboard → Observability.
- **rate-limiter-worker** has `observability.enabled = true` in `wrangler.toml`.
- **event-reminders-worker** logs per cron invocation; failures surface in CF dashboard.
- **Sentry / RUM:** not currently wired.
- **GTM / GA4:** `PUBLIC_GTM_ID` injects GTM; see `docs/gtm-analytics-strategy.md`.

## Useful references

- `docs/cloudflare-guide.md` — comprehensive CF setup (Pages, Workers, D1, KV, DO).
- `docs/rate-limiting-with-durable-objects.md` — rate-limiter deep dive.
- `docs/image-optimization-strategy.md` — LQIP + `fetchpriority` rules.
- `docs/auth-consolidation-strategy.md` — Better Auth rollout plan.
- `docs/team/github-issues-and-projects-guide.md` — issue + project-board workflow.
- `_bmad-output/project-context.md` — implementation rules the AI agents enforce.
- `wiki/**` — long-form topic guides.
