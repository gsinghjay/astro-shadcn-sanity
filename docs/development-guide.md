# Development Guide

**Project:** ywcc-capstone-template v2.0.0
**Generated:** 2026-04-29 (full rescan, deep)

How to develop, test, and deploy this monorepo. Pairs with `CLAUDE.md` (rules) and `_bmad-output/project-context.md` (deeper agent-targeted context).

## Prerequisites

| Tool                     | Version                       | Source                                          |
|--------------------------|-------------------------------|-------------------------------------------------|
| Node.js                  | **22.x** (CI pin) / 24.x (Docker dev images) | `.nvmrc` if present, otherwise install latest 22 LTS. |
| npm                      | 10.x                          | bundled with Node                               |
| Python                   | 3.12+                         | for `platform-api` + `discord-bot/discord-bot/` |
| `uv`                     | latest                        | for Python package management (platform-api / discord-bot) |
| Wrangler                 | `^4.76.0` root, `^4.63.0` astro-app | `npm i -g wrangler` or use the bundled deps  |
| Cloudflare account       | YWCC Capstone Sponsors (`70bc6caa244ede05b7f964c0c2d533bb`) | Required for deploys |
| Sanity account           | Project `49nk9b0w` access     | Required for schema deploys + content writes    |

The repo uses npm workspaces. Run `npm install` from root once — installs both `astro-app` and `studio` (and `platform-api` if you have Python tooling set up).

## First-time setup

```bash
# 1. Install (from repo root)
npm install

# 2. Populate astro-app env (copy + edit values for local dev)
cp astro-app/.env.example astro-app/.env

# 3. Authenticate Sanity (one-time, opens browser)
cd studio && npx sanity login && cd ..

# 4. Deploy schema to Content Lake (required before MCP content tools work)
cd studio && npx sanity schema deploy && cd ..

# 5. Generate TypeScript types from the schema
npm run typegen

# 6. Authenticate Wrangler (one-time)
cd astro-app && npx wrangler login && cd ..

# 7. Apply local D1 migrations
cd astro-app && npx wrangler d1 migrations apply PORTAL_DB --local && cd ..

# 8. Generate worker-configuration.d.ts (after every wrangler.jsonc change)
npx wrangler types -C astro-app
```

## Local development

| Command                                | Result                                                                 |
|----------------------------------------|------------------------------------------------------------------------|
| `npm run dev`                          | astro-app on `:4321` + Studio on `:3333` concurrently                  |
| `npm run dev:storybook`                | + Storybook on `:6006`                                                 |
| `npm run dev -w astro-app`             | astro-app only                                                         |
| `npm run dev -w studio`                | Studio only                                                            |
| `npm run preview -w astro-app`         | `astro preview` against built `dist/` (post-Pages, Workers-style)      |

> The legacy `wrangler pages dev` is no longer applicable under `@astrojs/cloudflare` v13 (Workers-only). Use `astro preview` for local SSR preview.

### Docker dev (alternative)

```bash
# Astro + Studio
docker compose up

# Add RWC variants
docker compose --profile rwc up

# Add Storybook
docker compose --profile storybook up
```

5 services on host ports `:4321` (capstone), `:3333` (studio), `:4322` (rwc-us), `:4323` (rwc-intl), `:6006` (storybook).

> Host + container have separate `node_modules` (named volume vs local). Don't run host dev servers on these ports while containers are up. `npm install` on host doesn't update container deps — restart / rebuild. Use `docker compose build --no-cache` when deps change significantly.

## Build

| Command                                | Notes                                                                  |
|----------------------------------------|------------------------------------------------------------------------|
| `npm run build -w astro-app`           | `astro build` → `dist/` + `dist/server/wrangler.json` (auto-generated) |
| `CLOUDFLARE_ENV=<name> npm run build -w astro-app` | Build for a specific env (env vars baked from `wrangler.jsonc`) |
| `npm run build -w studio`              | Studio build (rarely run locally — uses `sanity deploy` for production) |

The Astro build mirrors values from `wrangler.jsonc`'s `[env.<CLOUDFLARE_ENV>].vars` into `process.env` before `defineConfig` runs, so `astro:env` (and any direct `process.env` reads) see the per-environment values.

## Test

| Scope                       | Command                                       | Files                                  |
|-----------------------------|-----------------------------------------------|----------------------------------------|
| All unit tests              | `npm run test:unit`                           | 84 files in astro-app + 13 in studio   |
| Vitest watch                | `npm run test:unit:watch`                     |                                        |
| Vitest coverage             | `npm run test:unit:coverage`                  | v8 coverage                            |
| Direct Vitest run (astro-app) | `npx vitest run` (from `astro-app/`)        |                                        |
| Playwright (5 browsers)     | `npm run test:e2e`                            | builds first; 20 specs × 5 projects     |
| Playwright (Chromium only)  | `npm run test:chromium`                       | fast feedback                          |
| Playwright UI               | `npm run test:ui`                             | interactive                            |
| Playwright headed           | `npm run test:headed`                         | visible browser, Chromium only          |

### Lighthouse / Pa11y (CI tools, runnable locally)

```bash
cd astro-app
npm run build
npm run preview &              # serve dist on :4321
npx lhci autorun               # uses .lighthouserc.cjs (sitemap-driven, capped at 50 URLs)
npx pa11y-ci --config .pa11yci.cjs   # accessibility audit
```

Cap the URL set if you need a faster run: `LHCI_MAX_URLS=10 npx lhci autorun`.

### Vitest + AstroContainer

The official way to render Astro components in Vitest, despite the `experimental_` prefix. Pattern:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';

const container = await AstroContainer.create();
const html = await container.renderToString(MyComponent, { props, slots });
expect(html).toContain('expected text');
```

Mock setup uses `vi.hoisted()` to define handles before imports:

```ts
const { mockFn } = vi.hoisted(() => ({ mockFn: vi.fn() }));
vi.mock('@/lib/sanity', () => ({ loadQuery: mockFn }));
```

Bindings (`cloudflare:workers`) are mocked at the module level. `astro:env/client` mocks live at `astro-app/src/lib/__tests__/__mocks__/astro-env-client.ts`. **Never mock Astro rendering internals** — use AstroContainer.

## Schema + types pipeline

After ANY change to schema files in `studio/src/schemaTypes/`:

```bash
# 1. Update local schema files first.

# 2. Deploy to Content Lake (per-workspace, parallel)
npm run schema:deploy -w studio
# or per-workspace:
npm run schema:deploy:capstone -w studio
npm run schema:deploy:rwc -w studio

# 3. Generate TypeScript types
npm run typegen   # (root) — runs schema extract + typegen

# 4. If you added a new block / document type, update lib/types.ts
```

**Skipping any step breaks downstream tools.** TypeGen extracts the deployed schema; if step 2 is skipped, TypeGen sees stale schema and the MCP content tools fail when they encounter the new type.

## Sanity migrations

```bash
# Inspect migration script
cat studio/migrations/<migration>.mjs

# Run against a workspace (dry run first)
cd studio
npx sanity exec migrations/<migration>.mjs --workspace capstone --dry-run
npx sanity exec migrations/<migration>.mjs --workspace capstone
```

Three migrations exist (`add-item-types`, `rename-18-6-fields`, `rename-18-7-richtext-variants`). Run per-workspace; the rename migrations need to be run for both `capstone` and the RWC workspaces.

## D1 migrations

```bash
cd astro-app

# Local
npx wrangler d1 migrations apply PORTAL_DB --local

# Remote (production capstone)
npx wrangler d1 migrations apply PORTAL_DB --remote

# Inspect a migration
cat migrations/0009_add_agreement_version_and_audit.sql

# Inspect remote schema
npx wrangler d1 execute PORTAL_DB --remote --command='SELECT name FROM sqlite_master WHERE type="table"'
```

D1 migrations are a single source of truth — `event-reminders-worker` does NOT maintain its own migration set. After applying remotely, deploy both `ywcc-capstone` and `ywcc-event-reminders` together.

## Deploy

### astro-app (3 production + 3 preview Workers)

From `astro-app/`:

```bash
npm run deploy:capstone           # → ywcc-capstone (www.ywcccapstone1.com)
npm run deploy:rwc-us             # → rwc-us (workers.dev)
npm run deploy:rwc-intl           # → rwc-intl (workers.dev)
npm run deploy:capstone-preview   # → ywcc-capstone-preview (Studio Presentation iframe)
npm run deploy:rwc-us-preview     # → rwc-us-preview
npm run deploy:rwc-intl-preview   # → rwc-intl-preview
```

Each script runs `CLOUDFLARE_ENV=<name> astro build && wrangler deploy`. **The `wrangler deploy --env <name>` flag is no longer applicable** under `@astrojs/cloudflare` v13 — env is owned by the CF Vite plugin and selected by `CLOUDFLARE_ENV` at build time.

After any `wrangler.jsonc` edit:

```bash
npx wrangler types -C astro-app   # regenerate worker-configuration.d.ts
```

### Standalone Workers

```bash
# Rate limiter (deploy first when bootstrapping a fresh CF account)
npm run deploy:rate-limiter      # (root) wraps `cd rate-limiter-worker && npm run deploy`

# Event reminders
cd event-reminders-worker && npm run deploy

# Platform API (only after setting real KV/D1 IDs)
cd platform-api && wrangler deploy
```

### Sanity Studio

```bash
cd studio && npx sanity deploy
```

Multi-workspace (single command deploys all three workspaces under https://ywcccapstone.sanity.studio).

### Storybook

GitHub Pages — handled automatically by `deploy-storybook.yml` on `main`. Manual run: workflow_dispatch in the Actions tab.

### Sanity webhook → content rebuild

Configure once in Sanity dashboard → API → Webhooks. Filter: `_type in ["page","siteSettings","sponsor","project","team","event"] && !(_id in path("drafts.**"))`. Three deploy hooks (one per production Worker — IDs in `_bmad-output/project-context.md`).

## Environment variables

`astro-app/astro.config.mjs` declares the env schema via `astro:env`. Read them at runtime via `astro:env/client` (public) or `astro:env/server` (server / secrets). **NEVER** `import.meta.env.VAR` for declared vars — only `astro.config.mjs` is exempt (runs before astro:env initializes).

### Public client/server vars

| Var                                       | Default                       | Notes                                                                |
|-------------------------------------------|-------------------------------|----------------------------------------------------------------------|
| `PUBLIC_SITE_URL`                         | `http://localhost:4321`       | Per-environment in wrangler.jsonc                                    |
| `PUBLIC_SITE_ID`                          | `capstone`                    | `capstone` / `rwc-us` / `rwc-intl`                                   |
| `PUBLIC_SITE_THEME`                       | `red`                         | `red` / `blue` / `green` (CSS theme attr)                            |
| `PUBLIC_SANITY_DATASET`                   | `production`                  | `production` (capstone) / `rwc` (RWC sites)                          |
| `PUBLIC_SANITY_STUDIO_PROJECT_ID`         | (required)                    | `49nk9b0w`                                                           |
| `PUBLIC_SANITY_STUDIO_DATASET`            | `production`                  | Studio dataset                                                       |
| `PUBLIC_SANITY_STUDIO_URL`                | `http://localhost:3333`       | https://ywcccapstone.sanity.studio in prod                            |
| `PUBLIC_SANITY_VISUAL_EDITING_ENABLED`    | `false`                       | `true` on preview Workers — flips drafts/stega/CDN                    |
| `PUBLIC_SANITY_LIVE_CONTENT_ENABLED`      | `false`                       | Enable Sanity Live Content API subscriptions                          |
| `PUBLIC_GTM_ID`                           | `""`                          | `GTM-NS9N926Q` in production; empty in preview                        |
| `PUBLIC_TURNSTILE_SITE_KEY`               | (required)                    | Same key across envs                                                 |
| `BETTER_AUTH_URL`                         | (required for portal)         | `https://www.ywcccapstone1.com` in prod; not set on RWC content sites |

### Server-only secrets

Stored as Worker secrets (`wrangler secret put <NAME> --name <worker>`) — **never in `wrangler.jsonc`**:

- `BETTER_AUTH_SECRET`
- `GITHUB_CLIENT_ID` (in `vars`) + `GITHUB_CLIENT_SECRET` (secret)
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (in `vars`)
- `SANITY_API_READ_TOKEN` (preview Workers only)
- `SANITY_API_WRITE_TOKEN`
- `TURNSTILE_SECRET_KEY`
- `DISCORD_WEBHOOK_URL`
- `STUDIO_ORIGIN` (in `vars`)

For local dev, populate `astro-app/.env` (gitignored). For event-reminders local runs, populate `event-reminders-worker/.dev.vars`.

> At cutover, `GITHUB_CLIENT_SECRET` MUST be re-put with the prod GitHub OAuth App's client secret (paired with `GITHUB_CLIENT_ID Ov23liFtOiWIyCqJXJMi`). The staging-phase secret paired with `Ov23li8R7jigMPatjOml` is invalid.

## Bindings access

**Always**: `import { env } from 'cloudflare:workers'`. **Never** `Astro.locals.runtime.env` (removed in adapter v13).

```ts
import { env } from 'cloudflare:workers';

// D1
const result = await env.PORTAL_DB.prepare('SELECT * FROM user WHERE email = ?').bind(email).first();

// KV
const cached = await env.SESSION_CACHE.get(key);

// Cross-script DO RPC
const id = env.RATE_LIMITER.idFromName(rateLimitKey);
const stub = env.RATE_LIMITER.get(id);
const result = await stub.checkLimit(60_000, 100);
```

For `ExecutionContext` (`waitUntil`, `passThroughOnException`): `Astro.locals.cfContext`. For request `cf` properties (geo, TLS): `Astro.request.cf`.

## Common tasks

### Add a new public page

1. Create `astro-app/src/pages/<route>/<slug>.astro` (or `[slug].astro` for dynamic).
2. Decide rendering mode: `export const prerender = true` if static (default in Astro 5 era is no longer the default — Astro 6 SSRs by default).
3. Wire data via `loadQuery<T>(...)` against an existing or new `defineQuery()`.
4. Confirm the route appears in `dist/sitemap-index.xml` after build (otherwise LHCI/Pa11y won't audit it and `llms.txt` won't list it).

### Add a new internal-only route prefix

1. Create the route under `astro-app/src/pages/<prefix>/`.
2. Update sitemap filter in `astro-app/astro.config.mjs` (`@astrojs/sitemap` `filter` option).
3. Update `astro-app/src/pages/robots.txt.ts` with a `Disallow` rule.
4. Update `astro-llms-md` exclude list in `astro.config.mjs`.

### Add a new custom block

1. Create the schema: `studio/src/schemaTypes/blocks/<kebab-name>.ts` using `defineBlock({ ... })`.
2. Add to the central export: `studio/src/schemaTypes/index.ts`.
3. Run the schema pipeline (deploy + typegen).
4. Create the component: `astro-app/src/components/blocks/custom/<PascalName>.astro`. The block-registry auto-discovers it via `import.meta.glob({ eager: true })`.
5. If the block needs server-side data resolution, add a resolver to `getBlockExtraProps()` and `stegaClean()` any enum filter values.
6. Add a Storybook story: `<PascalName>.stories.ts(x)` colocated.
7. Add a demo-audit fixture: `astro-app/src/fixtures/demo-audit/<block>.json`.
8. Add JSON-LD if the block emits a structured-data type.

### Add a new D1 column

1. Create migration: `astro-app/migrations/<NNNN>_<description>.sql`. Use `ALTER TABLE` (don't drop+recreate).
2. If the column belongs to a Drizzle-declared table, update `astro-app/src/lib/drizzle-schema.ts`.
3. Apply locally: `npx wrangler d1 migrations apply PORTAL_DB --local`.
4. Apply remotely AFTER the deploy that consumes the column: `npx wrangler d1 migrations apply PORTAL_DB --remote`.
5. Deploy both `ywcc-capstone` and `ywcc-event-reminders` if the column affects shared tables.

### Add a binding (D1 / KV / DO)

1. Edit `astro-app/wrangler.jsonc` — add to the relevant `[env.<name>]` block.
2. Regenerate types: `npx wrangler types -C astro-app`.
3. Update `astro-app/src/env.d.ts` Cloudflare.Env augmentation if needed.
4. Add a test mock in `astro-app/src/lib/__tests__/__mocks__/cloudflare-workers.ts` (or wherever bindings are stubbed for unit tests).
5. Reference via `import { env } from 'cloudflare:workers'`.

## Code style

| Workspace      | Tool      | Config                                                    | Run                            |
|----------------|-----------|-----------------------------------------------------------|--------------------------------|
| astro-app      | Prettier  | `singleQuote: true`, `trailingComma: 'all'`, `arrowParens: 'avoid'`, `tabWidth: 2`, `printWidth: 120` (in mislabeled `.eslintrc`) | No npm script — run `npx prettier --write .` manually |
| astro-app      | ESLint    | `eslint ^9.38.0` listed but **no flat-config file**       | Lint is **advisory only**; CI does not gate lint |
| studio         | Prettier  | `semi: false`, `printWidth: 100`, `bracketSpacing: false`, `singleQuote: true` (in `package.json`) | `npx prettier --write .` from `studio/` |
| studio         | ESLint    | `@sanity/eslint-config-studio`                            | Manual                         |

**No Husky / pre-commit hooks**. CI is the only enforcement: Vitest + LHCI + Pa11y on PRs to `preview`. Conventional commits are enforced at release time by `semantic-release` on `main`.

## Branch strategy

```
feature/* → preview → main → semantic-release tag
```

- `enforce-preview-branch.yml` blocks any PR into `main` from a branch other than `preview`.
- `enforce-preview-source.yml` blocks `main → preview` PRs (auto-sync only via `sync-preview.yml`).
- `sync-preview.yml` auto-merges `main → preview` after every release + Discord notify.
- Conventional commit format required: `type(scope): description`. Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`. Scopes used in this repo: `blocks`, `studio`, `docker`, `ci`, `seo`, `a11y`, `ai-search`, `calendar`, `perf`, `infra`, `portal`, `forms`, `chat-bubble`.

Current working-tree branch is typically `preview` — that's where PRs to `main` originate.

## Common pitfalls

1. **Forgetting to run `wrangler types`** after editing `wrangler.jsonc` — the binding types in `worker-configuration.d.ts` go stale and TypeScript fails to type-check correctly.
2. **Skipping schema deploy** between schema edit and TypeGen — TypeGen extracts the *deployed* schema; new types won't appear.
3. **Stacking `<Section>` on detail pages** — adds ~112px gap between content. Use one Section with `gap-16` between children.
4. **Using `import.meta.env.VAR` for declared envs** — wrong; use `astro:env/client` or `astro:env/server`. Only `astro.config.mjs` is exempt.
5. **Touching `Astro.locals.runtime.env`** — removed. Use `import { env } from 'cloudflare:workers'`.
6. **Passing `--env <name>` to `wrangler deploy`** — no longer applicable under the CF Vite plugin. Use `CLOUDFLARE_ENV` at build time.
7. **Skipping the agreement gate fixture update** when changing `sponsorAgreement` — version pin breaks for already-accepted users.
8. **Adding a `tailwind.config.mjs`** — Tailwind v4 is CSS-first. Theme tokens go in `global.css @theme`.
9. **Hardcoding `Inter` in `font-family`** — reference `var(--font-inter)`. Italic is included via the provider config; no separate `@import url(... italic ...)`.
10. **Bumping `compatibility_date` past `2025-12-01`** without re-validating the workaround flag set (`disable_nodejs_process_v2` etc.).

## Where to find things

| Need                                  | Path                                                            |
|---------------------------------------|-----------------------------------------------------------------|
| Repo-wide rules                       | `CLAUDE.md`                                                     |
| Deeper agent context                  | `_bmad-output/project-context.md`                               |
| Sanity agent rules                    | `rules/*.mdc` (16 files)                                        |
| Long-form how-to guides (human)       | `wiki/` (31 files)                                              |
| Strategy docs                         | `docs/auth-consolidation-strategy.md`, `docs/cloudflare-guide.md`, `docs/cost-optimization-strategy.md`, `docs/image-optimization-strategy.md`, `docs/rate-limiting-with-durable-objects.md`, `docs/vps-migration-plan.md`, etc. |
| BMad planning + stories               | `_bmad-output/planning-artifacts/`, `_bmad-output/implementation-artifacts/` |
| Block schemas                         | `studio/src/schemaTypes/blocks/` (38 files)                     |
| Block components                      | `astro-app/src/components/blocks/custom/` (38 files)            |
| Demo-audit fixtures                   | `astro-app/src/fixtures/demo-audit/` (39 files)                 |
| Storybook stories                     | colocated `*.stories.ts(x)` (187 files)                         |
| GROQ queries                          | `astro-app/src/lib/sanity.ts` (32 `defineQuery` exports)         |
| D1 migrations                         | `astro-app/migrations/` (10 files, 0000-0009)                    |
| Sanity migrations                     | `studio/migrations/` (3 `.mjs` files)                            |
| GitHub Actions                        | `.github/workflows/` (6 workflows)                               |

## When in doubt

1. Read `CLAUDE.md` first — it's the source of truth for project rules.
2. Read `_bmad-output/project-context.md` for deeper patterns + anti-patterns.
3. Check `docs/index.md` for the doc index and cross-links to strategy docs / wiki / BMad.
4. Run `git log -- <path>` to see recent intent (commit messages are conventional + scoped).
5. The Sanity MCP server (when available) exposes `list_sanity_rules` / `get_sanity_rules` for on-demand rule loading.
