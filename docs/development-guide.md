# Development Guide — YWCC Capstone Sponsors

**Generated:** 2026-02-09 | **Scan Level:** Exhaustive

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | v24 LTS | Specified in `.nvmrc` |
| npm | v10+ | Comes with Node 24 |
| Sanity.io account | Free tier | [sanity.io](https://www.sanity.io/) |
| GitHub account | - | For deployment |

## Quick Start

```bash
# 1. Clone and install
git clone <repository-url>
cd astro-shadcn-sanity
npm install            # Installs both workspaces

# 2. Configure environment variables
cp astro-app/.env.example astro-app/.env
cp studio/.env.example studio/.env
# Edit both .env files with your Sanity project credentials

# 3. Start development servers
npm run dev            # Starts both Astro (4321) and Studio (3333)
```

## Environment Variables

### astro-app/.env

```
PUBLIC_SANITY_STUDIO_PROJECT_ID="<your-project-id>"
PUBLIC_SANITY_STUDIO_DATASET="production"
PUBLIC_SANITY_VISUAL_EDITING_ENABLED="true"
SANITY_API_READ_TOKEN="<your-read-token>"
```

### studio/.env

```
SANITY_STUDIO_PROJECT_ID="<your-project-id>"
SANITY_STUDIO_DATASET="production"
SANITY_STUDIO_STUDIO_HOST=""          # Optional: for sanity deploy
SANITY_STUDIO_PREVIEW_ORIGIN="http://localhost:4321"
```

## Development Servers

| Server | URL | Workspace Command |
|---|---|---|
| Astro app | http://localhost:4321 | `npm run dev --workspace=astro-app` |
| Sanity Studio | http://localhost:3333 | `npm run dev --workspace=studio` |
| Storybook | http://localhost:6006 | `npm run storybook --workspace=astro-app` |
| Both (concurrent) | 4321 + 3333 | `npm run dev` |
| All three | 4321 + 3333 + 6006 | `npm run dev:storybook` |

## Build Commands

```bash
# Build Astro app for production
npm run build --workspace=astro-app    # Runs astro check + astro build

# Preview production build
npm run preview --workspace=astro-app

# Build Sanity Studio
npm run build --workspace=studio

# Build Storybook
npm run build-storybook --workspace=astro-app
```

## Testing

### Test Commands

```bash
# Run all E2E tests (all browsers)
npm test

# Run E2E tests (Chromium only)
npm run test:chromium

# Run E2E tests with browser UI
npm run test:headed

# Run integration tests (no browser, schema validation)
npm run test:integration

# Interactive test UI
npm run test:ui
```

### Test Architecture

| Type | Config | Directory | Browser |
|---|---|---|---|
| E2E | `playwright.config.ts` | `tests/e2e/` | Chromium, Firefox, WebKit, Mobile |
| Integration | `playwright.integration.config.ts` | `tests/integration/` | None (Node.js only) |

### Browser Matrix

| Project | Engine | Viewport |
|---|---|---|
| chromium | Chromium | Desktop |
| firefox | Firefox | Desktop |
| webkit | WebKit | Desktop |
| mobile-chrome | Chromium | Pixel 7 (Android) |
| mobile-safari | WebKit | iPhone 14 (iOS) |

### Test Fixtures

- **networkErrorMonitor** — Auto-detects HTTP 4xx/5xx errors during page loads
- **log** — Structured logging attached to HTML reports
- **expectAccessible(page)** — WCAG 2.1 AA accessibility audit via axe-core

## Adding Components

### Install a fulldev/ui primitive

```bash
npx shadcn@latest add @fulldev/button @fulldev/badge
```

### Add a new CMS block (full checklist)

1. **Create Sanity schema** — `studio/src/schemaTypes/blocks/your-block.ts`
   ```typescript
   import { defineBlock } from '../helpers/defineBlock'
   export const yourBlock = defineBlock({
     name: 'yourBlock',
     title: 'Your Block',
     fields: [ /* block-specific fields */ ],
   })
   ```

2. **Register schema** — Add to `studio/src/schemaTypes/index.ts` and page `blocks[]` array

3. **Add GROQ projection** — In `astro-app/src/lib/sanity.ts`, add type-conditional projection

4. **Add TypeScript type** — In `astro-app/src/lib/types.ts`, add interface extending `BlockBase`

5. **Create Astro component** — `astro-app/src/components/blocks/custom/YourBlock.astro`

6. **Register in BlockRenderer** — Add import and case to `BlockRenderer.astro`

7. **Verify** — Build and check Lighthouse scores hold at 90+

## Code Conventions

| Area | Convention |
|---|---|
| Sanity schemas | TypeScript with `defineBlock()` helper (blocks) or `defineType`/`defineField` (documents) |
| UI primitives | fulldev/ui in `src/components/ui/` — install via `npx shadcn@latest add @fulldev/{name}` |
| Block components | `.astro` files in `src/components/blocks/custom/` composing from `ui/` primitives |
| Styling | Tailwind v4 utility classes, CSS-first config in `global.css`, no `tailwind.config.mjs` |
| Interactivity | Vanilla JS with data-attribute driven event delegation, each handler < 50 lines |
| Block architecture | Flat array only — no nested blocks |
| No React/JSX | In `astro-app/` for rendering — fulldev/ui components are pure `.astro` |
| Path aliases | `@/*` maps to `./src/*` in astro-app |
| Lint | Prettier-style (single quotes, trailing commas, 120 print width) |

## Deployment

### Deploy Sanity Studio

```bash
cd studio/
npx sanity deploy
```

### Deploy Storybook to GitHub Pages

Automated via `.github/workflows/deploy-storybook.yml` on push to main when `astro-app/src/**` changes.

### Deploy Astro app to Cloudflare Pages

1. Connect GitHub repo to Cloudflare Pages
2. Build config: Root `astro-app`, command `npm run build`, output `dist`
3. Add environment variables (PUBLIC_SANITY_STUDIO_PROJECT_ID, PUBLIC_SANITY_STUDIO_DATASET)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Follow the block checklist for new blocks
4. Verify Lighthouse scores hold at 90+ across all categories
5. Commit changes (`git commit -m 'Add your feature'`)
6. Push and open a Pull Request
