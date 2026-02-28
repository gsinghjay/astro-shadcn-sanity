---
project_name: 'astro-shadcn-sanity'
user_name: 'Jay'
date: '2026-02-20'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 120
optimized_for_llm: true
optimized_for_llm: true
---

# Project Context for AI Agents

_Critical rules and patterns for implementing code in this project. Optimized for LLM context efficiency._

---

## Technology Stack & Versions

### Monorepo Structure

npm workspaces: `astro-app/` (frontend) + `studio/` (Sanity CMS). **No shared code between workspaces.** React exists in `studio/` and in `astro-app/` only for Sanity Visual Editing (Presentation tool).

### Core Technologies

| Technology | Version | Critical Notes |
|---|---|---|
| Astro | ^5.17.1 | `output: 'static'` with `@astrojs/cloudflare` adapter. v5 merged `hybrid` into `static` — pages can opt out with `export const prerender = false` |
| Tailwind CSS | v4.1.18 | Via `@tailwindcss/vite` plugin. **No `tailwind.config.mjs`** — CSS-first config in `global.css` `@theme` block |
| Sanity | ^5.10.0 | React 19 in `studio/`. Uses `structureTool` + `presentationTool` + `visionTool` |
| TypeScript | ^5.9.3 | Astro strict mode. `@/*` path alias maps to `./src/*` |
| Vite | ^7.3.1 | Astro's build tool. Tailwind v4 runs as Vite plugin |
| Storybook | 10.2.7 | Native Astro support via `storybook-astro`. Deployed to GitHub Pages |
| Chromatic | ^15.1.1 | Visual regression testing + Figma design sync |
| Playwright | ^1.58.2 | 5 browser projects. `@axe-core/playwright` for a11y testing |
| Vitest | ^3.2.1 | Unit + Component (Container API) + Integration tests |
| Node.js | 24+ | Target runtime for CI/CD and local dev |

### Key Dependencies (astro-app)

| Package | Version | Purpose |
|---|---|---|
| `@sanity/astro` | ^3.2.11 | Provides `sanity:client` virtual module. Add `"types": ["@sanity/astro/module"]` to tsconfig |
| `@sanity/image-url` | ^1.2.0 | Image URL builder — always use `urlFor()` helper, never construct CDN URLs |
| `@sanity/form-toolkit` | ^2.2.3 | Studio form enhancements (studio workspace) |
| `@sanity/visual-editing` | ^5.2.1 | Visual Editing support for Presentation tool |
| `astro-portabletext` | ^0.10.0 | Portable Text rendering in `.astro` components |
| `@portabletext/to-html` | ^5.0.1 | HTML rendering for Portable Text |
| `groq` | ^5.8.1 | GROQ tagged template for syntax highlighting + `defineQuery` |
| fulldev/ui | via `shadcn ^3.8.4` | Vanilla `.astro` UI primitives. Install: `npx shadcn@latest add @fulldev/{name}` |
| `@astrojs/cloudflare` | ^12.6.12 | Cloudflare Pages adapter with `platformProxy` for local dev |
| `class-variance-authority` | ^0.7.1 | Component variant definitions (used by fulldev/ui) |
| `tailwind-merge` | ^3.4.0 | `cn()` utility in `src/lib/utils.ts` |
| `@tailwindcss/typography` | ^0.5.19 | `prose` class for rich text. Loaded as `@plugin` in global.css |
| `@astrojs/react` | ^4.4.2 | **Visual Editing only** — enables Sanity Presentation tool. Never use for page components |
| `react` / `react-dom` | ^19.2.4 | Required by `@sanity/astro` Presentation tool. Never use for page UI |
| `wrangler` | ^4.63.0 | Cloudflare Pages local dev + deploy |

### Version Constraints Agents MUST Know

- **Tailwind v4 !== v3**: Uses `@theme` block in CSS, `@plugin` directive, `@utility` for custom utilities. No JS config file. No `@apply` in `@theme`.
- **fulldev/ui !== React shadcn/ui**: Components are `.astro` files, not `.tsx`. Install with `@fulldev` registry prefix.
- **`components.json`**: `"tsx": false`, `"rsc": false`. Shadcn CLI generates Astro, not React.
- **No `@astrojs/tailwind`**: That's the v3 integration. This project uses `@tailwindcss/vite` directly.
- **React in astro-app is for Visual Editing only**: `@astrojs/react` + `react`/`react-dom` exist to support the Sanity Presentation tool. **Never use React for page components** — all page UI must be `.astro` files.
- **`@astrojs/cloudflare` is the production adapter**: Not `@astrojs/node`. `platformProxy: { enabled: true }` for local Workers emulation.
- **Sanity Studio v5**: `studio/` uses `sanity: ^5.9.0`. This is the Sanity v5 major version.
- **`groq` ^5.8.1**: Includes `defineQuery` for typed GROQ queries (required per CLAUDE.md).
- **Astro Actions are now in use**: Contact form uses `defineAction` from `astro:actions` with Zod validation. Actions live in `src/actions/index.ts`. This replaces the previously planned `pages/api/submit.ts` approach.
- **Cloudflare Turnstile is now integrated**: Bot protection on contact form. `cf-turnstile-response` validated server-side via Turnstile siteverify API. CSP updated with `challenges.cloudflare.com` in `script-src` and `frame-src`.

---

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

- **Astro strict mode**: `extends: "astro/tsconfigs/strict"`. All props must be typed.
- **Path alias**: `@/*` resolves to `./src/*`. Use `import { cn } from '@/lib/utils'`.
- **Interface Props pattern**: Every `.astro` component uses `interface Props { ... }` in frontmatter.
- **No enums**: Use union types or `as const` arrays. Enums don't work well with Astro's build.
- **ES modules only**: `"type": "module"` in all package.json files. Use `import`/`export`, never `require`.
- **Sanity schemas**: Always use `defineType`, `defineField`, `defineArrayMember` from `'sanity'` for type safety.
- **GROQ queries**: Use `defineQuery` (from `groq` package) for all GROQ queries.
- **Sanity client import**: Import from `sanity:client` virtual module, not from a file path.

#### Astro Actions Pattern

- **Actions in `src/actions/index.ts`**: Use `defineAction` from `astro:actions` for server-side form handling. Actions are SSR-only and run on the Cloudflare Worker.
- **Zod validation**: All action inputs validated with `z.object({...})` from `astro/zod` (re-exported, not a separate import).
- **Cloudflare runtime env access**: Use `context.locals.runtime.env` inside action handlers to access Workers bindings (secrets, D1, etc.) — NOT `process.env` or `import.meta.env` for server-side secrets.
- **ActionError for failures**: Throw `ActionError` with code (`'FORBIDDEN'`, `'INTERNAL_SERVER_ERROR'`, etc.) — never return raw error objects.

#### Type Organization

- **TypeGen-derived types**: `src/lib/types.ts` re-exports generated types from `sanity.types.ts`. Run `npm run typegen` after schema/query changes.
- **`Page`**: `NonNullable<PAGE_BY_SLUG_QUERY_RESULT>` — derived from GROQ query result.
- **`SiteSettings`**: `NonNullable<SITE_SETTINGS_QUERY_RESULT>` — derived from GROQ query result.
- **Block types**: `Extract<PageBlock, { _type: 'heroBanner' }>` pattern. Each block type is automatically extracted from the `PageBlock` union.
- **`PageBlock`**: Union of all block types, derived from `Page['blocks']`.
- **No manual type interfaces for blocks**: All block types flow from TypeGen. Never hand-write block interfaces.
- **7 document types**: `page`, `siteSettings`, `sponsor`, `project`, `testimonial`, `event`, `submission`.

#### Data Fetching Patterns

- **`loadQuery<T>()`**: Generic wrapper in `src/lib/sanity.ts` that handles Visual Editing stega encoding, draft perspective, and token injection.
- **Typed query functions**: `getPage(slug): Promise<Page | null>`, `getSiteSettings(): Promise<SiteSettings>`.
- **Module-level memoization**: `getSiteSettings()` caches at module scope to avoid redundant API calls across Layout, Header, and Footer during a single build.
- **Visual Editing support**: `loadQuery` checks `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` env var to toggle `previewDrafts` perspective and stega encoding.

### Framework-Specific Rules (Astro + Sanity)

#### Astro Component Rules

- **`.astro` files only in `astro-app/` for page UI**: No `.tsx`, `.jsx`, `.vue`, `.svelte`. Zero framework runtime in production output.
- **Frontmatter is server-side**: Code in `---` fences runs at build time. No browser APIs.
- **Inline `<script>` tags**: Astro auto-bundles and deduplicates. Use for client-side interactivity.
- **Props flow down only**: Block components are leaf nodes — receive props, render HTML. No upward communication.
- **`class:list` for conditional classes**: Use `class:list={['base', condition && 'conditional']}`.

#### Sanity Schema Rules

- **`defineBlock` helper for all blocks**: Wraps `defineType` and merges shared base fields (backgroundVariant, spacing, maxWidth). Sets `type: 'object'`. Never use raw `defineType` for blocks.
- **Always `defineField` + `defineArrayMember`**: Required for type safety and autocomplete.
- **Image fields must have `hotspot: true`** and a required `alt` text field (accessibility).
- **Icons on every type**: Import from `@sanity/icons`. Improves Studio UX.
- **Schema naming**: Type names are `camelCase` (`heroBanner`). File names are `kebab-case` (`hero-banner.ts`).
- **Objects not documents for blocks**: Blocks are `type: 'object'`, consumed via `blocks[]` array on page documents.
- **Never delete fields with production data**: Use the deprecation pattern (deprecated + readOnly + hidden).
- **Validation**: Use `rule.required()`, `rule.max()`, `rule.custom()`. Cross-field validation via `context.document`.
- **Reusable named object types**: Common field patterns (links, buttons) extracted as shared object types in `objects/` directory (Story 7-10).

#### Block Architecture (The Core Pattern)

Every block has **2 files** + registration:

1. Schema: `studio/src/schemaTypes/blocks/{block-name}.ts` using `defineBlock`
2. Component: `astro-app/src/components/blocks/custom/{BlockName}.astro` composing from `ui/` primitives
3. Register in `studio/src/schemaTypes/index.ts` (schema array)
4. **Auto-discovered** by `block-registry.ts` via `import.meta.glob` (no manual BlockRenderer changes needed)
5. Add GROQ projection in `src/lib/sanity.ts`
6. Add type to page schema's `blocks[]` array

#### BlockRenderer Unified Dispatch Pattern

All blocks use a single, unified dispatch via `block-registry.ts`. **No switch statement, no manual imports.**

```ts
// block-registry.ts — auto-discovers all blocks
const customModules = import.meta.glob('./blocks/custom/*.astro', { eager: true });
// PascalCase filename → camelCase _type (e.g. HeroBanner.astro → heroBanner)
const uiModules = import.meta.glob('./blocks/*.astro', { eager: true });
// kebab-case filename used directly as _type
```

```astro
// BlockRenderer.astro — unified dispatch, all blocks get spread props
{blocks.map((block) => {
  const Component = allBlocks[block._type];
  if (!Component) return null;
  return <BlockWrapper {...baseFields}><Component {...block} /></BlockWrapper>;
})}
```

#### BlockWrapper (Base Field Handling)

`BlockWrapper.astro` wraps every block and handles the three base fields. **Block components do NOT handle base fields themselves.**

- Uses `stegaClean()` from `@sanity/client/stega` to clean Visual Editing stega data from field values
- Maps `backgroundVariant`, `spacing`, `maxWidth` to CSS classes via lookup records
- Lives at `src/components/BlockWrapper.astro` (not in `blocks/` directory)

#### GROQ Query Rules

- **All queries in `src/lib/sanity.ts`**: Never inline queries in page/component files.
- **Use `defineQuery`**: Required for all GROQ queries (per CLAUDE.md).
- **Use `sanity.fetch()` in page frontmatter only**: Block components receive data as props, never fetch.
- **Project specific fields**: Don't use `{ ... }` (select all). Always project the fields you need.
- **Expand references with `->`**: `author->{ name, bio }`. Use `_ref` (not `->`) in filters for performance.
- **Order before slice**: `| order(publishedAt desc)[0...10]`, not `[0...10] | order(...)`.
- **Use `$params` not string interpolation**: Security + caching.
- **Page builder expansion**: Use `_type == "heroBanner" => { ... }` conditional projections in `blocks[]`.

#### Data Flow

```
Sanity Content Lake → sanity.fetch() via loadQuery<T>() at build time → Page frontmatter → BlockRenderer → BlockWrapper (base fields) → Block components (spread props) → Static HTML
```

- Zero runtime API calls to Sanity (except Visual Editing via Server Islands)
- All data resolved at build time
- No client-side state management
- Preview uses Server Islands (`server:defer`), not full SSR mode

#### Contact Form Submission (Astro Actions + Turnstile)

- **Astro Actions** handle form submission: `actions.submitForm(new FormData(form))` from client-side `<script>`.
- **Import pattern**: `import { actions, isInputError } from 'astro:actions'` in client `<script>` tags.
- **Turnstile widget**: Embedded via `<div class="cf-turnstile" data-sitekey={turnstileSiteKey}>` with `<script src="...turnstile/v0/api.js" is:inline async defer>`.
- **Server-side secrets**: Action handlers access Workers bindings via `context.locals.runtime.env` (e.g., `env.TURNSTILE_SECRET_KEY`, `env.SANITY_API_WRITE_TOKEN`, `env.DISCORD_WEBHOOK_URL`).
- **Discord webhooks are fire-and-forget**: Wrap in try/catch, failures don't block form submission success.
- **Client-side validation + server-side Zod**: Client JS does quick required/email checks, but Zod in `defineAction` is the source of truth.
- **`isInputError(error)`**: Use to distinguish field-level validation errors from server errors in client script.

#### Currently Registered Schemas

- **Objects (8)**: `seo`, `button`, `link`, `portableText`, `faqItem`, `featureItem`, `statItem`, `stepItem`
- **Documents (7)**: `page`, `siteSettings`, `sponsor`, `project`, `testimonial`, `event`, `submission`
- **Blocks (13)**: `heroBanner`, `featureGrid`, `ctaBanner`, `statsRow`, `textWithImage`, `logoCloud`, `sponsorSteps`, `richText`, `faqSection`, `contactForm`, `sponsorCards`, `testimonials`, `eventList`

#### Studio Configuration

- `sanity.config.ts` uses `defineConfig([...])` with **two workspaces** (Story 15-2):
  - **Capstone** (`/capstone`, dataset: `production`): existing desk structure, siteSettings singleton, site field hidden
  - **RWC** (`/rwc`, dataset: `rwc`): site-grouped desk structure (RWC US / RWC International), site field visible, per-site siteSettings singletons (`siteSettings-rwc-us`, `siteSettings-rwc-intl`)
- Both workspaces use `structureTool` + `presentationTool` + `visionTool` + `formSchema`
- Per-workspace schema types via `createSchemaTypesForWorkspace(dataset)` — controls site field visibility
- Singleton pattern for `siteSettings` (fixed document ID, restricted actions — no delete/duplicate)
- Presentation tool with dynamic locations using `defineLocations` and MPA navigation support (Story 7-11)
- RWC workspace uses initial value templates to pre-fill `site` field per site group

### Testing Rules

#### Two-Runner Architecture

| Runner | Config | Scope |
|---|---|---|
| **Vitest** | `astro-app/vitest.config.ts` | Unit + Component (Container API) + Integration |
| **Playwright** | `playwright.config.ts` (root) | E2E only (real browser) |

#### 4-Layer Test Architecture

| Layer | Runner | Location | Purpose |
|---|---|---|---|
| Unit | Vitest | `astro-app/src/lib/__tests__/` | Pure functions (`cn`, `loadQuery`, query strings) |
| Component | Vitest + Container API | `astro-app/src/components/__tests__/` | Astro component rendering with mocked Sanity data |
| SSR Smoke | Vitest + Miniflare | `astro-app/src/cloudflare/__tests__/` | Cloudflare Worker doesn't crash |
| E2E | Playwright | `tests/e2e/` | Real browser: a11y, interactions, cross-browser |

#### Vitest Configuration

- Uses `getViteConfig()` from `astro/config` (resolves Astro virtual modules).
- Include: `src/**/__tests__/**/*.test.ts` + `../tests/integration/**/*.test.ts`.
- `sanity:client` mocked via alias → `__mocks__/sanity-client.ts`.
- Coverage: v8 provider, covers `src/lib/**/*.ts` + `src/scripts/**/*.ts`.
- Reporters: default + JUnit (`../test-results/unit-results.xml`).

#### Component Testing Conventions

- Use Astro Container API (`experimental_AstroContainer`).
- Fixtures typed from `sanity.types.ts`, live in `__fixtures__/` directories.
- **Never test client-side JS** (carousel, forms) in jsdom — use Playwright E2E instead.

#### Playwright Configuration

- 5 browser projects: chromium, firefox, webkit, mobile-chrome (Pixel 7), mobile-safari (iPhone 14).
- Web server: builds astro-app then runs preview. 120s startup timeout.
- CI: `retries: 2`, `workers: 1`, `forbidOnly: true`.
- Traces on first retry, screenshots on failure, video retained on failure.
- `@axe-core/playwright` for WCAG compliance. `@seontechnologies/playwright-utils` for SEO validation.
- E2E tests import from `tests/support/fixtures/` (not `@playwright/test` directly).

#### Test Commands

| Command | What It Does |
|---|---|
| `npm run test:unit` | Vitest: unit + component + integration |
| `npm run test:e2e` | Playwright: all browser projects |
| `npm test` | Both: `test:unit && test:e2e` |
| `npm run test:chromium` | Playwright: Chromium only (fastest feedback) |
| `npm run test:headed` | Playwright: headed chromium for debugging |
| `npm run test:ui` | Playwright: UI mode |

#### Test Coverage

- **19 component tests**: All 13 custom blocks + BlockRenderer + BlockWrapper + Header + Breadcrumb + ProjectCard + SanityImage + ContactForm
- **5 E2E spec files**: `smoke`, `pages-1-2`, `homepage-2-2`, `site-settings-2-3`, `gtm-datalayer`
- **GTM data layer E2E test**: `gtm-datalayer.spec.ts` validates `window.dataLayer` events
- **Chromatic visual regression**: Added alongside Storybook — captures visual snapshots for UI change detection

#### When to Write Tests

- New block component → Container API test with full + minimal fixture data
- New GROQ query → Verify query string contains expected type/field references
- Schema change → Run `npm run typegen` (type errors surface fixture/component drift)
- Interactive behavior → Playwright E2E spec
- **Astro Actions** (Turnstile, Sanity write, Discord webhook) → Run server-side only — test via E2E form submission, not unit tests. Mock external APIs in E2E if needed.

### Code Quality & Style Rules

#### Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Sanity type names | `camelCase` | `heroBanner`, `siteSettings` |
| Sanity field names | `camelCase` | `backgroundVariant`, `ctaButtons` |
| Schema files | `kebab-case.ts` | `hero-banner.ts`, `site-settings.ts` |
| Astro components (custom) | `PascalCase.astro` | `HeroBanner.astro`, `BlockRenderer.astro` |
| fulldev/ui blocks | `kebab-case.astro` | `hero-1.astro`, `features-3.astro` |
| Utility files | `camelCase.ts` | `sanity.ts`, `image.ts`, `utils.ts` |
| CSS custom properties | `--{category}-{name}` | `--color-njit-red`, `--background` |

#### Formatting (Different Per Workspace!)

- **astro-app**: `singleQuote: true`, `trailingComma: "all"`, `arrowParens: "avoid"`, `tabWidth: 2`, `printWidth: 120`.
- **studio**: `semi: false`, `printWidth: 100`, `bracketSpacing: false`, `singleQuote: true`.
- **Intentionally different** — don't unify them.

#### Tailwind v4 CSS-First Configuration

- **Theme tokens in `global.css`**: All colors, fonts, spacing defined in `@theme { }` block as CSS custom properties.
- **shadcn CSS variables**: `--background`, `--primary`, `--muted`, etc. defined in `:root` and `.dark`.
- **Brand colors**: `--color-njit-red: #D22630`, `--color-njit-navy: #003366`, `--color-njit-gold: #E89B32`, `--color-swiss-red: #E30613`.
- **Custom utilities**: Use `@utility name { ... }` directive (e.g., `@utility label-caps`).
- **Typography plugin**: Loaded as `@plugin "@tailwindcss/typography"` in CSS, not in a config file.
- **No arbitrary values**: Never `bg-[#ff0000]`. Always use design tokens (`bg-primary`, `bg-njit-red`).
- **Responsive mobile-first**: Use `md:` and `lg:` prefixes. Default styles are mobile.
- **`cn()` utility**: `twMerge(clsx(...inputs))` in `src/lib/utils.ts`. All components use it for class merging.

#### fulldev/ui Component Rules

- **23 component families installed**: accordion, auto-form, avatar, badge, button, field, footer, header, icon, image, input, item, label, list, logo, marquee, native-select, section, separator, sheet, spinner, textarea, tile.
- **`auto-form`**: fulldev/ui primitive used by ContactForm for dynamic form rendering from Sanity schema field definitions.
- **Compound component pattern**: `Section` + `SectionContent` + `SectionGrid`. `Tile` + `TileContent` + `TileTitle`. Always compose, never flatten.
- **Barrel exports**: Each family has `index.ts`. Import: `import { Button } from '@/components/ui/button'`.
- **Block components compose from ui/**: Blocks adapt Sanity data into ui/ primitive props. Never hand-roll buttons, inputs, cards, accordions.
- **Install new primitives**: `npx shadcn@latest add @fulldev/{name}`. Never copy/paste from external sources.
- **UI primitives are data-agnostic**: They know nothing about Sanity or block schemas.

#### Vanilla JS Patterns (Client-Side Interactivity)

- **Data-attribute driven state**: Use `data-state="open|closed"`, `data-active`, etc. **Never** use `classList.add/remove` for state.
- **CSS targets data attributes**: `[data-state="active"] { opacity: 1; }`. State changes via `element.dataset.state = 'open'`.
- **Always include ARIA**: `aria-expanded`, `aria-controls`, `aria-hidden` on interactive elements.
- **Scoped selectors**: `querySelectorAll('[data-{block}-trigger]')`. Always use data-attribute guards.
- **Colocated scripts**: Each interactive block contains its own `<script>` tag. Global scripts in `src/scripts/main.ts`.
- **Existing client-side modules** (in `main.ts`): `initScrollAnimations()` (IntersectionObserver), `initContactForm()` (form handler, currently mocked), `initCarousel()` (hero auto-play with dots).

#### Image Handling

- **Always use `urlFor()` from `src/lib/image.ts`**: Never construct Sanity CDN URLs manually.
- **Always provide width, height, alt**: `urlFor(image).width(800).height(400).url()`.
- **`loading="lazy"` on all images**: Except hero/above-fold (use `loading="eager"` or omit).
- **Sanity image schema**: Always `hotspot: true` + required `alt` field.
- **Query LQIP when needed**: `asset->{ metadata { lqip, dimensions } }` for blur placeholders.

#### File Organization

```
astro-app/src/
  components/
    ui/              # fulldev/ui primitives (owned, modifiable)
    blocks/
      custom/        # Custom block components (1:1 with Sanity schemas)
      *.astro        # fulldev/ui block variants (hero-1, features-3, etc.)
    block-registry.ts  # Auto-discovers blocks via import.meta.glob
    BlockRenderer.astro  # Renders blocks using block-registry (unified dispatch)
    BlockWrapper.astro   # Wraps every block with base field CSS (stegaClean)
    Header.astro, Footer.astro, MobileNav.astro, Breadcrumb.astro
    __tests__/       # Container API component tests + __fixtures__/
  layouts/
    Layout.astro
    templates/       # Page template shells (Default, FullWidth, Landing, Sidebar, TwoColumn)
  actions/
    index.ts         # Astro Actions (server-side form handlers with Zod + Turnstile)
  lib/
    sanity.ts        # Client + ALL GROQ queries + loadQuery wrapper
    image.ts         # urlFor() helper
    utils.ts         # cn() utility
    types.ts         # TypeGen-derived type aliases (Extract<PageBlock, ...>)
    __tests__/       # Unit tests for sanity.ts, utils.ts
  pages/
    index.astro      # Homepage
    [...slug].astro  # CMS-driven catch-all route with template dispatch
  scripts/main.ts    # Global client-side JS
  styles/global.css  # Tailwind imports + @theme + shadcn vars

studio/src/schemaTypes/
  helpers/defineBlock.ts
  objects/           # block-base.ts, seo.ts, button.ts, portable-text.ts + reusable named types
  documents/         # page.ts, site-settings.ts, sponsor.ts
  blocks/            # One file per block schema
  index.ts           # Schema registry (exports schemaTypes[])

tests/
  e2e/               # Playwright E2E tests (real browser)
  integration/       # Vitest integration tests (schema, file structure, config)
  support/           # Shared test fixtures and constants
```

### Development Workflow Rules

#### Dev Commands

| Command | What It Does |
|---|---|
| `npm run dev` (root) | Runs both workspaces concurrently |
| `npm run dev -w astro-app` | Astro dev server only (port 4321) |
| `npm run dev -w studio` | Sanity Studio dev server only |
| `npm run dev:storybook` (root) | Both workspaces + Storybook |
| `npm run storybook` (root) | Storybook only (port 6006) |
| `npm run build -w astro-app` | Build with `astro check && astro build` |
| `npm run typegen` | Extract schema + generate TypeScript types |

#### Hosting

- **Target**: Cloudflare Pages. `@astrojs/cloudflare` adapter configured with `platformProxy: { enabled: true }`.
- **Preview**: `wrangler pages dev dist/` for local Cloudflare Workers emulation.
- **Deploy**: `astro build && wrangler pages deploy dist/`.

#### CI/CD

- `.github/workflows/deploy-storybook.yml` — deploys Storybook to GitHub Pages.
- Main app deploy workflow not yet configured (deferred).

#### Environment Variables

- `PUBLIC_SANITY_STUDIO_PROJECT_ID` / `PUBLIC_SANITY_STUDIO_DATASET` — primary Sanity config in `.env`.
- `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` — toggles Visual Editing mode (stega encoding + draft perspective).
- `SANITY_API_READ_TOKEN` — required when Visual Editing is enabled.
- `PUBLIC_SITE_URL` / `PUBLIC_SANITY_STUDIO_URL` — site and studio URLs.
- `PUBLIC_TURNSTILE_SITE_KEY` — Cloudflare Turnstile site key for contact form bot protection (client-side).
- `TURNSTILE_SECRET_KEY` — Turnstile server-side secret (Workers binding, never in client).
- `SANITY_API_WRITE_TOKEN` — Server-side Sanity write token (Workers binding, used by Astro Actions).
- `DISCORD_WEBHOOK_URL` — Discord notification webhook (Workers binding, used by Astro Actions).
- `PUBLIC_GTM_ID` — Google Tag Manager container ID.
- Fallbacks in `astro.config.mjs`: checks both `loadEnv()` and `process.env` for Cloudflare Pages git integration builds (no `.env` file).

#### Schema Change Propagation

1. Update schema in `studio/src/schemaTypes/`
2. Deploy schema: `npx sanity schema deploy` (from `studio/`)
3. Update GROQ projections in `astro-app/src/lib/sanity.ts`
4. Run `npm run typegen` to regenerate types
5. Fix any type errors in components/fixtures
6. If adding form-related schemas, also update `src/actions/index.ts` if the action handler references the new document type

#### Adding a New Block (Checklist)

1. Create schema: `studio/src/schemaTypes/blocks/{block-name}.ts` using `defineBlock`
2. Register in `studio/src/schemaTypes/index.ts`
3. Add type to page schema's `blocks[]` array in `studio/src/schemaTypes/documents/page.ts`
4. Deploy schema: `npx sanity schema deploy` (from `studio/`)
5. Install any needed fulldev/ui primitives: `npx shadcn@latest add @fulldev/{name}`
6. Create component: `astro-app/src/components/blocks/custom/{BlockName}.astro` (PascalCase filename auto-registers via `block-registry.ts`)
7. Add GROQ projection in `src/lib/sanity.ts` page query
8. Run `npm run typegen` (block type auto-extracted via `Extract<PageBlock, ...>`)
9. Add Container API test in `src/components/__tests__/{BlockName}.test.ts` with typed fixtures

#### Boundaries (from CLAUDE.md)

- **Always**: Use `defineQuery` for GROQ queries. Run `npm run typegen` after schema/query changes. Deploy schema after schema changes. Update local schema files first.
- **Ask First**: Before modifying `sanity.config.ts`. Before deleting any schema definition file.
- **Never**: Hardcode API tokens (`use process.env`). Use loose types (`any`) for Sanity content.

### Critical Don't-Miss Rules

#### Anti-Patterns (NEVER do these)

| Anti-Pattern | Why | Do This Instead |
|---|---|---|
| React/JSX in `astro-app/` page UI | Zero framework runtime requirement | Use `.astro` components only |
| `bg-[#cc0000]` arbitrary Tailwind | No design token = visual inconsistency | Use `bg-primary`, `bg-njit-red`, etc. |
| Inline styles (`style="..."`) | Breaks Tailwind utility pattern | Use Tailwind classes |
| `classList.add/remove` for state | Inconsistent with project JS pattern | Use `data-*` attributes |
| Hand-rolling UI primitives | Duplicates fulldev/ui, inconsistent A11y | Use components from `src/components/ui/` |
| Manual Sanity CDN URLs | Bypasses image pipeline | Use `urlFor()` from `lib/image.ts` |
| GROQ queries in components | Breaks data flow architecture | All queries in `src/lib/sanity.ts` |
| Runtime API calls to Sanity | SSG — all data at build time | Use `sanity.fetch()` via `loadQuery` in page frontmatter |
| Nested blocks (block in block) | Architecture is flat `blocks[]` array | Compose within a single block |
| Index keys in block loops | Breaks Visual Editing + reconciliation | Always use `block._key` |
| Raw `defineType` for blocks | Misses base fields | Use `defineBlock` helper |
| Deleting Sanity fields | Data loss in production | Use deprecation pattern |
| `@astrojs/tailwind` | That's Tailwind v3 | Use `@tailwindcss/vite` (v4) |
| `@portabletext/react` | Requires React runtime | Use `astro-portabletext` |
| `any` types for Sanity content | Loses type safety | Use TypeGen-derived types |
| Manual BlockRenderer edits | Old pattern, now auto-discovered | Just add PascalCase file to `blocks/custom/` |
| Handling base fields in blocks | BlockWrapper handles them | Don't add backgroundVariant/spacing/maxWidth CSS in block components |
| `process.env` in Actions | Workers bindings not in process.env | Use `context.locals.runtime.env` |
| `pages/api/*.ts` for forms | Old pattern, replaced by Astro Actions | Use `defineAction` in `src/actions/index.ts` |
| Raw `<img>` without LQIP | LCP regression on hero images | Use LQIP blur placeholders from `asset->{ metadata { lqip } }` for above-fold images |

#### Edge Cases

- **Astro v5 `output: 'static'`** now includes old hybrid behavior. Don't add `export const prerender = false` unless explicitly needed for forms.
- **Sanity free tier limits**: 100K API requests/month, 10K documents, 5GB assets. All queries are build-time only to stay well under limits.
- **`sanity:client` virtual module**: Import from `sanity:client`, not from a file path. Requires `@sanity/astro` integration in `astro.config.mjs`.
- **Portable Text in Astro**: Use `astro-portabletext` (not `@portabletext/react`). It renders in `.astro` components without React.
- **shadcn CLI + Astro**: The `shadcn` package works with fulldev/ui's Astro registry. Always specify `@fulldev/` prefix when adding components.
- **Cloudflare adapter**: `@astrojs/cloudflare` with `platformProxy: { enabled: true }` for local dev. Static output by default.
- **Env var fallbacks**: `astro.config.mjs` checks both `loadEnv()` and `process.env` for Cloudflare Pages builds without `.env` files.
- **Visual Editing preview**: Uses Server Islands (`server:defer`), not full SSR mode (Story 7-4).
- **`stegaClean` in BlockWrapper**: Base field values may contain Visual Editing stega data — `BlockWrapper.astro` cleans them via `stegaClean()` from `@sanity/client/stega`.
- **Astro Actions + Cloudflare Workers**: Actions run as Workers functions. Access secrets via `context.locals.runtime.env`, NOT `process.env` or `import.meta.env` for server secrets.
- **Turnstile widget loading**: Must use `is:inline` on the Turnstile script tag (`<script src="...turnstile/v0/api.js" is:inline async defer>`) — Astro's script bundling would break it.
- **Image LCP optimization**: Above-the-fold hero images must use `fetchpriority="high"` + `loading="eager"` + LQIP blur placeholder + `<link rel="preload">` in `<head>`. All other images use `loading="lazy"`.
- **CSP includes Turnstile**: `challenges.cloudflare.com` must be in both `script-src` and `frame-src` CSP directives for Turnstile to work.

#### Accessibility Requirements (WCAG 2.1 AA)

- All images: required `alt` text (enforced in Sanity schema validation).
- Interactive elements: `aria-expanded`, `aria-controls`, `aria-hidden`.
- Keyboard navigation: All interactive blocks must be keyboard accessible.
- Skip link in `Layout.astro`.
- Semantic HTML: `<nav>`, `<main>`, `<section>`, `<header>`, `<footer>`.
- Target: Lighthouse A11y 90+.

#### Performance Targets

- Lighthouse 95+ mobile/desktop.
- FCP < 1s, LCP < 2s, TBT < 100ms, CLS < 0.05.
- JS budget: < 5KB. CSS budget: < 15KB after purge.
- Build time: < 60 seconds.

---

## Current Implementation Status

| Story | Status | What It Covers |
|---|---|---|
| 1.1 Reconfigure Starter | DONE | Removed Vercel adapter, added Tailwind v4, fulldev/ui, directory structure |
| 1.2 Migrate Reference | DONE | 12 block components, 22 ui families, 5 pages with placeholder data |
| 1.3 Schema Infrastructure | DONE | defineBlock helper, base objects, document schemas (page, siteSettings) |
| 1.4-1.6 Storybook | DONE | Setup, production build, GitHub Pages deploy |
| 2.0 Template Layout System | DONE | Layout.astro, Header, Footer, navigation, 5 template shells |
| 2.1/2.1b Block Schemas | DONE | All 13 block schemas created (incl. testimonials, eventList) |
| 2.2 Homepage Wiring | DONE | GROQ queries, Visual Editing, Presentation tool |
| 2.2b Remaining Pages | DONE | CMS-driven catch-all route, template dispatch |
| 2.3a Site Settings | DONE | Memoized queries, full schema validation |
| 2.9 Unified Dispatch | DONE | All blocks use spread props, no switch statement |
| Testing Refactor | DONE | 4-layer test architecture: Vitest + Playwright |
| 7-4 Server Islands | DONE | Preview uses Server Islands instead of full SSR |
| 7-6 BlockWrapper | DONE | stegaClean BlockWrapper, Studio UX polish |
| 7-7 Reusable Patterns | DONE | Extracted reusable link and button field patterns |
| 7-8 Portable Text | DONE | PortableText component for RichText and FAQ rendering |
| 7-9 Block Base Fields | DONE | BlockWrapper CSS values, CtaBanner background delegation |
| 7-10 Named Object Types | DONE | Extracted reusable inline object types |
| 7-11 Presentation Tool | DONE | Dynamic locations and MPA navigation |
| TEA Test Review P1 | DONE | 3 P1 findings addressed |
| 3.1 Sponsor Schema | DONE | Sponsor document schema + studio management |
| 5.14 Image Optimization | DONE | LCP <2s with urlFor(), LQIP placeholders, preload |
| 6.1 Contact Form Pipeline | DONE | Astro Actions + Turnstile + Sanity write + Discord webhook |
| 9.1 Portal Auth | DONE | CF Access + JWT middleware + portal landing page |
| GTM Integration | DONE | Data attributes, dataLayer, GTM E2E tests |
| Chromatic | DONE | Visual regression testing + Figma design sync |
| Docker discord-bot | DONE | Docker support for JDA bot |

**Current state**: All pages are CMS-driven via `[...slug].astro` catch-all route with 5 template layouts. Unified block dispatch via `block-registry.ts`. BlockWrapper handles base fields with stegaClean. Test architecture: 4-layer (Unit/Component/SSR Smoke/E2E). Server Islands for Visual Editing preview. Contact form uses Astro Actions with Turnstile bot protection. Portal has CF Access + JWT auth. 13 custom blocks, 7 document types, 8 object types registered.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code in this project
- Follow ALL rules exactly as documented — especially the anti-patterns table
- When in doubt, prefer the more restrictive option
- Cross-reference with `_bmad-output/planning-artifacts/architecture.md` for full architectural context

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack or patterns change
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-02-20
