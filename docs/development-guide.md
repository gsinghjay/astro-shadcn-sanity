# Development Guide

*Generated: 2026-03-11 | Scan Level: deep*

## Prerequisites

- **Node.js:** 22+ (CI uses 22, release uses 24)
- **npm:** 10+ (npm workspaces)
- **Python:** 3.11+ (discord-bot only)
- **Docker:** Optional (for containerized development)

## Quick Start

```bash
# Clone and install
git clone https://github.com/gsinghjay/astro-shadcn-sanity.git
cd astro-shadcn-sanity
npm install

# Set up environment variables
cp astro-app/.env.example astro-app/.env
cp studio/.env.example studio/.env
# Edit .env files with your Sanity project ID and tokens

# Run all services
npm run dev                          # Astro (4321) + Studio (3333)
npm run dev:storybook                # + Storybook (6006)
```

## Environment Variables

### astro-app/.env

| Variable | Required | Description |
|----------|----------|-------------|
| PUBLIC_SANITY_STUDIO_PROJECT_ID | Yes | Sanity project ID |
| PUBLIC_SANITY_STUDIO_DATASET | Yes | Dataset: "production" |
| PUBLIC_SANITY_DATASET | No | Multi-site dataset override |
| PUBLIC_SITE_ID | No | Site: capstone, rwc-us, rwc-intl |
| PUBLIC_SITE_THEME | No | Theme: red, blue, green |
| PUBLIC_SANITY_VISUAL_EDITING_ENABLED | No | Enable draft previews |
| PUBLIC_SANITY_LIVE_CONTENT_ENABLED | No | Enable live updates |
| SANITY_API_READ_TOKEN | No | For visual editing (server-side) |
| PUBLIC_GTM_ID | No | Google Tag Manager ID |
| PUBLIC_SANITY_STUDIO_URL | No | Studio URL |
| PUBLIC_SITE_URL | No | Canonical site URL |
| PUBLIC_TURNSTILE_SITE_KEY | No | Bot protection |

**Server-side secrets** (set in wrangler secret or .dev.vars):
- TURNSTILE_SECRET_KEY
- DISCORD_WEBHOOK_URL
- SANITY_API_WRITE_TOKEN
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
- GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET
- BETTER_AUTH_SECRET / BETTER_AUTH_URL
- RESEND_API_KEY / RESEND_FROM_EMAIL

### studio/.env

| Variable | Required | Description |
|----------|----------|-------------|
| SANITY_STUDIO_PROJECT_ID | Yes | Sanity project ID |
| SANITY_STUDIO_DATASET | Yes | Dataset: "production" |
| SANITY_STUDIO_STUDIO_HOST | No | Custom studio hostname |
| SANITY_STUDIO_PREVIEW_ORIGIN | No | Preview URL (default: localhost:4321) |

## Development Commands

### Root Level
```bash
npm run dev                    # Astro + Studio concurrent
npm run dev:storybook          # Astro + Studio + Storybook
npm run test                   # Unit tests + E2E tests (full suite)
npm run test:unit              # Vitest unit + component + integration
npm run test:e2e               # Playwright E2E (builds first, all browsers)
npm run test:chromium           # Playwright Chromium only (fast feedback)
npm run test:headed             # Playwright with browser UI visible
npm run test:ui                 # Playwright interactive UI mode
npm run storybook               # Storybook dev server
npm run typegen                 # Extract schema + generate TypeScript types
npm run deploy:rate-limiter     # Deploy rate limiter worker
```

### Astro App (astro-app/)
```bash
npm run dev -w astro-app       # Astro dev server (port 4321)
npm run build -w astro-app     # astro check && astro build
npm run preview -w astro-app   # Wrangler Pages local preview
npm run test:unit -w astro-app # Vitest run
npm run test:unit:watch -w astro-app  # Vitest watch mode
npm run test:unit:coverage -w astro-app  # Vitest with v8 coverage
npm run storybook -w astro-app # Storybook dev (port 6006)
npm run build-storybook -w astro-app  # Build static Storybook
```

### Studio (studio/)
```bash
npm run dev -w studio          # Sanity Studio dev server
npm run build -w studio        # Build Studio for deployment
npm run deploy -w studio       # Deploy Studio to Sanity hosting
npm run typegen -w studio      # Extract schema + generate types
npx sanity schema deploy       # Deploy schema to Content Lake (run from studio/)
```

### Rate Limiter Worker (rate-limiter-worker/)
```bash
cd rate-limiter-worker
npm run dev                    # Wrangler dev server
npm run deploy                 # Deploy to Cloudflare
npm test                       # Vitest with Cloudflare pool
```

## Docker Development

```bash
# Standard development (Astro + Studio)
docker compose up astro-app studio

# With Storybook
docker compose --profile storybook up

# With RWC variants
docker compose --profile rwc up

# All services
docker compose --profile storybook --profile rwc up
```

| Service | Port | Profile |
|---------|------|---------|
| astro-app | 4321 | default |
| studio | 3333 | default |
| astro-rwc-us | 4322 | rwc |
| astro-rwc-intl | 4323 | rwc |
| storybook | 6006 | storybook |

## Common Development Tasks

### Adding a New Page Builder Block

1. **Define schema** in `studio/src/schemaTypes/blocks/my-block.ts`
   - Use `defineBlock()` helper for consistent structure
   - Add variants if needed via `defineBlock({ variants: [...] })`
2. **Register schema** in `studio/src/schemaTypes/index.ts`
3. **Add to page schema** in `studio/src/schemaTypes/documents/page.ts` blocks array
4. **Deploy schema**: `cd studio && npx sanity schema deploy`
5. **Generate types**: `npm run typegen`
6. **Create component** in `astro-app/src/components/blocks/custom/MyBlock.astro`
   - Auto-discovered by `block-registry.ts` via `import.meta.glob()`
7. **Add type adapter** in `astro-app/src/lib/types.ts` if needed
8. **Add GROQ resolver** in `astro-app/src/lib/sanity.ts` if block fetches references
9. **Write tests**: Component test + fixture in `__tests__/`
10. **Create story**: `MyBlock.stories.ts` for Storybook

### Adding a New Document Type

1. Define schema in `studio/src/schemaTypes/documents/`
2. Register in `studio/src/schemaTypes/index.ts`
3. Add desk structure entry
4. Deploy schema + generate types
5. Add GROQ queries in `astro-app/src/lib/sanity.ts`
6. Create page route in `astro-app/src/pages/`
7. Create card/detail components

### Modifying Sanity Schema

1. Edit schema file in `studio/src/schemaTypes/`
2. Deploy: `cd studio && npx sanity schema deploy`
3. Regenerate types: `npm run typegen`
4. Update GROQ queries if field names changed
5. Update components to use new fields
6. Update test fixtures

### Working with Portal (SSR)

- Portal pages use `prerender = false` for SSR
- Middleware populates `Astro.locals.user` automatically
- Fetch data in `.astro` frontmatter, pass to React islands as props
- Never import Sanity client in React `.tsx` files
- Use API endpoints (`/portal/api/*`) for client-side data fetching
- Dev mode auto-mocks auth (dev@example.com as sponsor)

## Testing Strategy

### Unit & Component Tests (Vitest)
```bash
npm run test:unit              # Run all
npm run test:unit:watch        # Watch mode
npm run test:unit:coverage     # With coverage report
npx vitest run path/to/test    # Single file
```

- Component tests use Astro Container API
- Fixtures in `src/components/__tests__/__fixtures__/`
- Mocks in `src/lib/__tests__/__mocks__/`
- Coverage output: `test-results/unit-coverage/`

### E2E Tests (Playwright)
```bash
npm run test:chromium          # Fast: Chromium only
npm run test:e2e               # Full: all 5 browsers (builds first)
npm run test:headed            # With visible browser
npm run test:ui                # Interactive Playwright UI
```

- Tests in `tests/e2e/` and `tests/integration/`
- 5 browser projects: chromium, firefox, webkit, mobile-chrome, mobile-safari
- Pre-test: builds Astro app + starts preview server
- Fixtures provide network monitoring + a11y helpers
- CI: serial execution with retries, artifacts on failure

### Visual Testing (Storybook)
```bash
npm run storybook              # Dev server (port 6006)
npm run build-storybook -w astro-app  # Static build
```

- 120+ stories covering UI primitives, blocks, portal components
- Deployed to GitHub Pages on push to main
- Chromatic available for visual regression

## Code Conventions

### File Naming
- Components: PascalCase (`.astro`, `.tsx`)
- Utilities: kebab-case (`.ts`)
- Tests: `ComponentName.test.ts`
- Stories: `ComponentName.stories.ts`
- Fixtures: `kebab-case.ts`
- Schema: kebab-case (e.g., `hero-banner.ts`)

### Imports
- Use `defineQuery()` for all GROQ queries
- Use `urlFor()` from `lib/image.ts` for Sanity images (never raw `asset.url`)
- Use `cn()` from `lib/utils.ts` for Tailwind class merging

### Architecture Rules
- Public pages: SSG only (no `prerender = false`)
- Portal pages: SSR required (`prerender = false`)
- React components: No Sanity client imports
- Images: Always use LQIP blur placeholders + CDN resizing
- Layout: Single `<Section>` per content area (avoid stacking Sections)

## CI/CD Pipeline

### Pull Request to preview
- **ci.yml:** Unit tests + Lighthouse CI
- Branch must target `preview` (enforced by workflow)

### Merge to main
- **release.yml:** Semantic-release (changelog, tag, GitHub release)
- **sync-preview.yml:** Auto-merge main → preview + Discord notification
- **deploy-storybook.yml:** Build + deploy Storybook to GitHub Pages

### Branch Strategy
```
feature → preview → main
```
- `preview` gates `main` (enforced by workflows)
- Auto-sync back after release
- Conventional commits required for semantic-release

## Deployment

### Astro App (Cloudflare Pages)
```bash
npm run deploy -w astro-app    # Build + deploy to Cloudflare Pages
```

### Studio (Sanity Hosting)
```bash
npm run deploy -w studio       # Deploy to Sanity hosting
```

### Rate Limiter (Cloudflare Worker)
```bash
npm run deploy:rate-limiter    # Deploy via wrangler
```

### Schema
```bash
cd studio && npx sanity schema deploy  # Required before MCP tools work with new types
```

---
*Generated: 2026-03-11 | Scan Level: deep | Mode: full_rescan*
