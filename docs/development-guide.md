# Development Guide

This guide covers how to set up, develop, test, and deploy the YWCC Capstone monorepo (Astro frontend + Sanity Studio).

## Prerequisites

Install the following before starting:

- **Node.js** -- version 22 (used in CI) or 24 (used in Docker)
- **npm** -- ships with Node.js; used for workspace management
- **Docker** (optional) -- for containerized development with `docker compose`

## Quick Start

### Native (recommended)

```bash
git clone https://github.com/gsinghjay/astro-shadcn-sanity.git
cd astro-shadcn-sanity
npm install
cp astro-app/.env.example astro-app/.env
cp studio/.env.example studio/.env
# Edit both .env files with your Sanity project credentials
npm run dev
```

This starts both the Astro dev server on `http://localhost:4321` and Sanity Studio on `http://localhost:3333`.

### Docker

```bash
cp astro-app/.env.example astro-app/.env
cp studio/.env.example studio/.env
# Edit both .env files with your Sanity project credentials
docker compose up
```

Docker runs three services:

| Service | Port | Profile |
|:--------|:-----|:--------|
| astro-app | 4321 | default |
| studio | 3333 | default |
| storybook | 6006 | `storybook` (opt-in) |

To include Storybook in Docker:

```bash
docker compose --profile storybook up
```

## Environment Setup

### astro-app/.env

| Variable | Required | Description |
|:---------|:---------|:------------|
| `PUBLIC_SANITY_STUDIO_PROJECT_ID` | Yes | Sanity project ID |
| `PUBLIC_SANITY_STUDIO_DATASET` | Yes | Dataset name (usually `production`) |
| `SANITY_API_READ_TOKEN` | Yes | API token for draft/preview content |
| `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` | No | Set `true` to enable Visual Editing |
| `PUBLIC_SANITY_STUDIO_URL` | No | Studio URL for "Edit in Studio" links (defaults to `http://localhost:3333`) |
| `PUBLIC_SITE_URL` | No | Production URL for canonical URLs and sitemap |
| `PUBLIC_GTM_ID` | No | Google Tag Manager container ID |
| `CF_ACCESS_TEAM_DOMAIN` | No | Cloudflare Access team domain for portal auth |
| `CF_ACCESS_AUD` | No | Cloudflare Access Application Audience tag |

### studio/.env

| Variable | Required | Description |
|:---------|:---------|:------------|
| `SANITY_STUDIO_PROJECT_ID` | Yes | Sanity project ID |
| `SANITY_STUDIO_DATASET` | Yes | Dataset name (usually `production`) |
| `SANITY_STUDIO_STUDIO_HOST` | No | Custom Studio hostname |
| `SANITY_STUDIO_PREVIEW_ORIGIN` | No | Astro preview URL (defaults to `http://localhost:4321`) |

### tests/.env

| Variable | Required | Description |
|:---------|:---------|:------------|
| `TEST_ENV` | No | Target environment: `local`, `staging`, or `production` |
| `BASE_URL` | No | Override the default `http://localhost:4321` base URL |

## Development Commands

All commands run from the repository root unless noted otherwise.

### Core Development

| Command | Description |
|:--------|:------------|
| `npm run dev` | Start Astro (4321) + Studio (3333) concurrently |
| `npm run dev:storybook` | Start Astro + Studio + Storybook (6006) |
| `npm run dev -w astro-app` | Start Astro dev server only |
| `npm run dev -w studio` | Start Sanity Studio only |
| `npm run storybook` | Start Storybook only (port 6006) |

### Building

| Command | Description |
|:--------|:------------|
| `npm run build -w astro-app` | Build the Astro site to `astro-app/dist/` |
| `npm run build -w studio` | Build Sanity Studio for deployment |
| `npm run deploy -w astro-app` | Build Astro and deploy to Cloudflare Pages |
| `npm run deploy -w studio` | Deploy Sanity Studio |

### Testing

| Command | Description |
|:--------|:------------|
| `npm run test` | Run unit tests then E2E tests |
| `npm run test:unit` | Run Vitest unit and component tests |
| `npm run test:unit:watch` | Run Vitest in watch mode |
| `npm run test:unit:coverage` | Run Vitest with V8 coverage report |
| `npm run test:e2e` | Run Playwright across all 5 browser projects |
| `npm run test:chromium` | Run Playwright with Chromium only (fast feedback) |
| `npm run test:headed` | Run Playwright with a visible browser (Chromium) |
| `npm run test:ui` | Open Playwright's interactive UI mode |

### Schema and Types

| Command | Description |
|:--------|:------------|
| `npm run typegen` | Extract schema and generate TypeScript types |
| `npx sanity schema deploy` | Deploy schema to Content Lake (run from `studio/`) |

## Project Structure Overview

```
astro-shadcn-sanity/
  astro-app/           # Astro frontend (Cloudflare Pages)
    src/
      components/      # UI components (Astro + React)
      layouts/         # Page layouts
      pages/           # File-based routing
      lib/             # Utilities, queries, data loading
    .storybook/        # Storybook configuration
  studio/              # Sanity Studio
    src/
      schemaTypes/     # Content schema definitions
  tests/               # Playwright E2E tests
    e2e/               # Test specs
    support/           # Fixtures and helpers
  docs/                # Project documentation
  .github/workflows/   # CI/CD pipeline definitions
```

For a complete file tree with descriptions, see [source-tree-analysis.md](source-tree-analysis.md).

## Development Workflow

### Branch Strategy

The project uses a three-tier branching model:

```
feature/* --> preview --> main
```

1. Create a feature branch from `preview`.
2. Open a PR targeting `preview`. CI runs unit tests and Lighthouse on PRs to `preview`.
3. After merge to `preview`, open a PR from `preview` to `main`.
4. On merge to `main`, semantic-release creates a versioned release and the `sync-preview` workflow merges `main` back into `preview`.

Branch protection rules enforced by CI:

- Only `preview` can merge into `main` (enforced by `enforce-preview-branch.yml`).
- `main` cannot open PRs to `preview` (enforced by `enforce-preview-source.yml`).

### Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/) for all commit messages. Semantic-release reads these to determine version bumps and generate changelogs.

| Prefix | Version Bump | Example |
|:-------|:-------------|:--------|
| `fix:` | Patch | `fix: resolve null pointer in sponsor query` |
| `feat:` | Minor | `feat: add event list block component` |
| `feat!:` or `BREAKING CHANGE:` | Major | `feat!: redesign page builder schema` |
| `chore:` | No release | `chore: update dev dependencies` |
| `docs:` | No release | `docs: add testing guide` |
| `refactor:` | No release | `refactor: extract hero banner logic` |

### Pull Requests

- Target `preview` for feature branches.
- CI must pass before merging.
- Reference related issues in the PR description.

## Schema and Content Workflow

Sanity schema definitions live in `studio/src/schemaTypes/`. Follow this workflow when changing schemas:

1. **Edit schema files** in `studio/src/schemaTypes/`. Add new types to the barrel export in `studio/src/schemaTypes/index.ts`.

2. **Generate types** from the root:

   ```bash
   npm run typegen
   ```

   This extracts the schema to `studio/schema.json` and generates TypeScript types in `studio/sanity.types.ts`. Type errors surface drift between schema, fixtures, and components.

3. **Deploy schema** to the Content Lake (from the `studio/` directory):

   ```bash
   cd studio
   npx sanity schema deploy
   ```

   Deploy is required before MCP content tools work with new types.

4. **Update fixtures and components** to match any changed or new fields.

## Testing Guide

The project uses a four-layer testing architecture.

### Unit Tests (Vitest)

**Location:** `astro-app/src/lib/__tests__/`

Test pure functions like `cn()`, `loadQuery`, and GROQ query strings.

```bash
npm run test:unit              # Single run
npm run test:unit:watch        # Watch mode
npm run test:unit:coverage     # With coverage report
```

The Vitest config uses `getViteConfig()` from `astro/config` to resolve Astro virtual modules. The `sanity:client` module is mocked via an alias in `astro-app/vitest.config.ts`.

### Component Tests (Vitest + Container API)

**Location:** `astro-app/src/components/__tests__/`

Test Astro components using the Container API with mocked Sanity data:

```typescript
const container = await AstroContainer.create();
const html = await container.renderToString(Component, { props: { block } });
expect(html).toContain('expected content');
```

Fixtures are typed from `sanity.types.ts` and live in `__fixtures__/` directories alongside tests.

### SSR Smoke Tests (Vitest + Miniflare)

**Location:** `astro-app/src/cloudflare/__tests__/`

Verify the Cloudflare Worker does not crash during server-side rendering.

### E2E Tests (Playwright)

**Location:** `tests/e2e/`

Run real browser tests across 5 projects: Chromium, Firefox, WebKit, Mobile Chrome (Pixel 7), and Mobile Safari (iPhone 14).

```bash
npm run test:e2e               # All browsers
npm run test:chromium           # Chromium only (fast feedback)
npm run test:headed             # Visible browser
npm run test:ui                 # Interactive UI mode
```

Playwright builds the Astro site and serves it via Wrangler before running tests. E2E tests import fixtures from `tests/support/fixtures/` (not `@playwright/test` directly).

### When to Write Tests

| Change | Test type |
|:-------|:----------|
| New block component | Container API test with full + minimal fixture data |
| New GROQ query | Verify query string contains expected type/field references |
| Schema change | Run `npm run typegen` (type errors surface fixture/component drift) |
| Interactive behavior (carousel, forms) | Playwright E2E spec (never use jsdom for client-side JS) |

## Storybook

Storybook renders Astro components in isolation using the `storybook-astro` framework adapter.

### Running Storybook

```bash
npm run storybook              # Standalone on port 6006
npm run dev:storybook          # Alongside Astro + Studio
```

### Writing Stories

Place story files next to the components they document:

```
astro-app/src/components/blocks/HeroBanner/
  HeroBanner.astro
  HeroBanner.stories.ts
```

Stories are discovered by the glob pattern `astro-app/src/**/*.stories.@(js|jsx|ts|tsx)`.

The Storybook config includes Vite plugins that stub Astro virtual modules (`sanity:client`, `astro:assets`, `virtual:astro-icon`) so components render outside the Astro build pipeline.

### Building Storybook

```bash
npm run build-storybook -w astro-app
```

Storybook is deployed to GitHub Pages automatically when changes to `astro-app/src/`, `astro-app/.storybook/`, or `astro-app/package.json` are pushed to `main`.

## Deployment

### Manual Deployment

Deploy the Astro site to Cloudflare Pages:

```bash
npm run deploy -w astro-app
```

This runs `astro build && wrangler pages deploy dist/`.

Deploy Sanity Studio:

```bash
npm run deploy -w studio
```

### CI/CD Workflows

Seven GitHub Actions workflows automate the pipeline:

| Workflow | Trigger | Purpose |
|:---------|:--------|:--------|
| **CI** | PR to `preview` | Run unit tests and Lighthouse |
| **Release** | Push to `main` | Semantic-release: version bump, changelog, GitHub release |
| **Deploy Storybook** | Push to `main` (src/storybook changes) | Build and deploy Storybook to GitHub Pages |
| **Sanity Content Deploy** | `repository_dispatch` (content published) | Rebuild and deploy Astro site to Cloudflare Pages |
| **Sync Preview** | After Release completes | Merge `main` back into `preview` |
| **Enforce Preview Branch** | PR to `main` | Block PRs to `main` from any branch other than `preview` |
| **Enforce Preview Source** | PR to `preview` | Block PRs from `main` to `preview` (sync-preview handles this) |

### Cloudflare Pages

The Astro site builds as a static site with the `@astrojs/cloudflare` adapter. The build output is in `astro-app/dist/` and deploys to Cloudflare Pages via Wrangler. See [cloudflare-guide.md](cloudflare-guide.md) for detailed Cloudflare configuration.

## Troubleshooting

### `sanity:client` module not found

This virtual module is only available inside the Astro build pipeline. In tests, it is mocked via the alias in `astro-app/vitest.config.ts`. In Storybook, it is stubbed by a Vite plugin in `astro-app/.storybook/main.ts`.

### Type errors after schema changes

Run `npm run typegen` to regenerate TypeScript types from the current schema. Update any fixtures or component props that reference changed fields.

### Playwright tests fail to start

Playwright builds the site before running tests. Verify that:

- Environment variables are set in `astro-app/.env`.
- `npm run build -w astro-app` succeeds on its own.
- Port 4321 is not already in use.

### Docker volumes out of sync

If dependencies change and Docker containers have stale `node_modules`:

```bash
docker compose down -v
docker compose up --build
```

The `-v` flag removes named volumes (`node_modules`, `astro_node_modules`, `studio_node_modules`), forcing a fresh `npm ci` on next build.

### Storybook build errors

Storybook uses custom Vite plugins to stub Astro internals. If a new Astro virtual module is imported by a component, add a stub for it in the `astroVirtualModuleStubs()` plugin in `astro-app/.storybook/main.ts`.

### Schema deploy fails

Run `npx sanity schema deploy` from the `studio/` directory (not the repo root). Verify that `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` are set in `studio/.env`.
