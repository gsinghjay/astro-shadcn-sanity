# Development Guide

**Generated:** 2026-02-13 | **Mode:** Exhaustive Rescan | **Workflow:** document-project v1.2.0

## Prerequisites

- **Node.js:** 22+ (24 recommended)
- **npm:** 10+ (included with Node)
- **Docker:** Optional, for containerized development

## Getting Started

### Option 1: Native Setup

```bash
# Clone the repository
git clone https://github.com/gsinghjay/astro-shadcn-sanity.git
cd astro-shadcn-sanity

# Install all workspace dependencies
npm ci

# Copy environment files
cp astro-app/.env.example astro-app/.env
cp studio/.env.example studio/.env
# Edit .env files with your Sanity project ID, dataset, and API tokens

# Start both dev servers concurrently
npm run dev
```

### Option 2: Docker Setup

```bash
# Copy environment files first
cp astro-app/.env.example astro-app/.env
cp studio/.env.example studio/.env

# Start Astro + Studio
docker compose up

# With Storybook (optional profile)
docker compose --profile storybook up
```

### Dev Server Ports

| Service | Port | Command |
|---------|------|---------|
| Astro (frontend) | 4321 | `npm run dev -w astro-app` |
| Sanity Studio | 3333 | `npm run dev -w studio` |
| Storybook | 6006 | `npm run storybook -w astro-app` |

## Environment Variables

### astro-app/.env

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_SANITY_STUDIO_PROJECT_ID` | Yes | Sanity project ID |
| `PUBLIC_SANITY_STUDIO_DATASET` | Yes | Dataset name (default: production) |
| `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` | No | Enable Visual Editing (true/false) |
| `SANITY_API_READ_TOKEN` | For VE | API read token for draft content |
| `PUBLIC_GA_MEASUREMENT_ID` | No | GA4 tracking ID |
| `PUBLIC_SANITY_STUDIO_URL` | No | Studio URL (default: http://localhost:3333) |
| `PUBLIC_SITE_URL` | No | Production site URL |

### studio/.env

| Variable | Required | Description |
|----------|----------|-------------|
| `SANITY_STUDIO_PROJECT_ID` | Yes | Sanity project ID |
| `SANITY_STUDIO_DATASET` | Yes | Dataset name (default: production) |
| `SANITY_STUDIO_PREVIEW_ORIGIN` | No | Preview app URL (default: http://localhost:4321) |
| `SANITY_STUDIO_STUDIO_HOST` | No | Custom Studio host |

## Commands Reference

### Root (Monorepo)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Astro + Studio concurrently |
| `npm run dev:storybook` | Start Astro + Studio + Storybook |
| `npm run test` | Run all tests (unit + E2E) |
| `npm run test:unit` | Vitest unit + component tests |
| `npm run test:e2e` | Playwright E2E (builds first) |
| `npm run test:chromium` | Playwright Chromium only (fast feedback) |
| `npm run test:headed` | Playwright with visible browser |
| `npm run test:ui` | Playwright interactive UI mode |
| `npm run storybook` | Start Storybook dev server |
| `npm run typegen` | Extract schema + generate TypeScript types |

### astro-app

| Command | Description |
|---------|-------------|
| `npm run dev -w astro-app` | Astro dev server |
| `npm run build -w astro-app` | `astro check && astro build` |
| `npm run preview -w astro-app` | Preview with Wrangler (Cloudflare) |
| `npm run test:unit -w astro-app` | Vitest run |
| `npm run test:unit:watch -w astro-app` | Vitest watch mode |
| `npm run test:unit:coverage -w astro-app` | Vitest with coverage |

### studio

| Command | Description |
|---------|-------------|
| `npm run dev -w studio` | Sanity Studio dev server |
| `npm run build -w studio` | Build Studio for production |
| `npm run deploy -w studio` | Deploy Studio to Sanity Cloud |
| `npx sanity schema deploy` | Deploy schema to Content Lake (run from studio/) |
| `npm run typegen -w studio` | Extract schema + generate types |

## Git Workflow

### Branch Strategy

```
feature branch → preview → main
```

- **Feature branches** — Created from `preview`, merged back via PR
- **`preview`** — Integration/staging branch, runs CI on PRs
- **`main`** — Production branch, triggers release + deploy

### Branch Rules

- PRs to `main` must come from `preview` only (enforced by CI)
- PRs from `main` to `preview` are blocked (sync is automated)
- After release on `main`, auto-sync merges back into `preview`

### Commit Convention

Uses [Conventional Commits](https://www.conventionalcommits.org/) for semantic-release:

```
feat: add new feature        → minor version bump
fix: fix a bug               → patch version bump
feat!: breaking change       → major version bump
docs: update documentation   → no release
refactor: code refactor      → no release
```

## Testing

### Test Architecture

| Layer | Runner | Location | Purpose |
|-------|--------|----------|---------|
| Unit | Vitest | `astro-app/src/lib/__tests__/` | Pure functions |
| Component | Vitest + Container API | `astro-app/src/components/__tests__/` | Astro component rendering |
| SSR Smoke | Vitest | `astro-app/src/cloudflare/__tests__/` | Cloudflare Worker validation |
| Integration | Vitest | `tests/integration/` | Schema, data wiring, type checks |
| E2E | Playwright | `tests/e2e/` | Real browser tests (5 projects) |

### Writing Tests

**Component tests** use Astro Container API:

```typescript
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
const container = await AstroContainer.create();
const html = await container.renderToString(Component, { props: { block } });
expect(html).toContain('expected content');
```

**Test fixtures** are typed from `sanity.types.ts`:

```typescript
// Located in __fixtures__/ directories
import type { HeroBannerBlock } from '../../../lib/types';
export const heroBannerFixture: HeroBannerBlock = { ... };
```

**Sanity client mock** via Vitest alias in `vitest.config.ts`:

```
"sanity:client" → "./src/lib/__tests__/__mocks__/sanity-client.ts"
```

### E2E Test Browser Matrix

| Project | Device |
|---------|--------|
| chromium | Desktop Chrome |
| firefox | Desktop Firefox |
| webkit | Desktop Safari |
| mobile-chrome | Pixel 7 |
| mobile-safari | iPhone 14 |

### Accessibility Testing

E2E tests include WCAG 2.1 AA audits via axe-core:

```typescript
import { expectAccessible } from '../support/helpers/a11y';
await expectAccessible(page);
```

## Adding a New Block

1. **Create schema** in `studio/src/schemaTypes/blocks/my-block.ts` using `defineBlock()`
2. **Register schema** in `studio/src/schemaTypes/index.ts`
3. **Add to page schema** in `studio/src/schemaTypes/documents/page.ts` blocks array
4. **Deploy schema:** `npx sanity schema deploy` from `studio/`
5. **Run typegen:** `npm run typegen` from root
6. **Create component** in `astro-app/src/components/blocks/custom/MyBlock.astro`
7. **Add GROQ projection** to `PAGE_BY_SLUG_QUERY` in `astro-app/src/lib/sanity.ts`
8. **Export type** in `astro-app/src/lib/types.ts`
9. **Write tests:**
   - Fixture in `__fixtures__/my-block.ts`
   - Component test in `__tests__/MyBlock.test.ts`
   - Storybook story in `blocks/custom/MyBlock.stories.ts`

## Deployment

### Production (Cloudflare Pages)

Triggered by:
- Sanity content publish webhook → `sanity-deploy.yml`
- Release on main → manual deploy or webhook

```bash
# Manual deploy
npm run build -w astro-app
npx wrangler pages deploy astro-app/dist --project-name=ywcc-capstone
```

### Sanity Studio

```bash
npm run deploy -w studio
```

### Storybook (GitHub Pages)

Auto-deployed on push to `main` when `astro-app/src/` changes.

## Performance Targets

- Lighthouse 90+ across all categories
- < 5KB total client-side JavaScript
- Zero runtime API calls in production (static HTML)
- Page load < 5 seconds (E2E performance budget)
