---
project_name: 'astro-shadcn-sanity'
user_name: 'Jay'
date: '2026-02-11'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 95
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
| Astro | ^5.17.1 | Uses `@astrojs/node` adapter for Visual Editing preview. v5 merged `hybrid` into `static` — pages can opt out with `export const prerender = false` |
| Tailwind CSS | v4.1.18 | Via `@tailwindcss/vite` plugin. **No `tailwind.config.mjs`** — CSS-first config in `global.css` `@theme` block |
| Sanity | ^5.8.1 | React 19 in `studio/`. Uses `structureTool` + `visionTool` |
| TypeScript | ^5.9.3 | Astro strict mode. `@/*` path alias maps to `./src/*` |
| Vite | ^7.3.1 | Astro's build tool. Tailwind v4 runs as Vite plugin |
| Storybook | 10.2.7 | Native Astro support via `storybook-astro`. Deployed to GitHub Pages |
| Playwright | ^1.58.2 | 5 browser projects. `@axe-core/playwright` for a11y testing |
| Node.js | 24+ | Target runtime for CI/CD and local dev |

### Key Dependencies (astro-app)

| Package | Version | Purpose |
|---|---|---|
| `@sanity/astro` | ^3.2.11 | Provides `sanity:client` virtual module. Add `"types": ["@sanity/astro/module"]` to tsconfig |
| `@sanity/image-url` | ^1.2.0 | Image URL builder — always use `urlFor()` helper, never construct CDN URLs |
| `astro-portabletext` | ^0.10.0 | Portable Text rendering in `.astro` components |
| `@portabletext/to-html` | ^5.0.1 | HTML rendering for Portable Text |
| `groq` | ^3.48.1 | GROQ tagged template for syntax highlighting + `defineQuery` |
| fulldev/ui | via `shadcn ^3.8.4` | Vanilla `.astro` UI primitives. Install: `npx shadcn@latest add @fulldev/{name}` |
| `astro-icon` | ^1.1.5 | Iconify wrapper. Icon sets: `@iconify-json/lucide`, `@iconify-json/simple-icons` |
| `class-variance-authority` | ^0.7.1 | Component variant definitions (used by fulldev/ui) |
| `tailwind-merge` | ^3.4.0 | `cn()` utility in `src/lib/utils.ts` |
| `@tailwindcss/typography` | ^0.5.19 | `prose` class for rich text. Loaded as `@plugin` in global.css |
| `@astrojs/react` | ^4.4.2 | **Visual Editing only** — enables Sanity Presentation tool. Never use for page components |
| `react` / `react-dom` | ^19.2.4 | Required by `@sanity/astro` Presentation tool. Never use for page UI |

### Version Constraints Agents MUST Know

- **Tailwind v4 !== v3**: Uses `@theme` block in CSS, `@plugin` directive, `@utility` for custom utilities. No JS config file. No `@apply` in `@theme`.
- **fulldev/ui !== React shadcn/ui**: Components are `.astro` files, not `.tsx`. Install with `@fulldev` registry prefix.
- **`components.json`**: `"tsx": false`, `"rsc": false`. Shadcn CLI generates Astro, not React.
- **No `@astrojs/tailwind`**: That's the v3 integration. This project uses `@tailwindcss/vite` directly.
- **React in astro-app is for Visual Editing only**: `@astrojs/react` + `react`/`react-dom` exist to support the Sanity Presentation tool. **Never use React for page components** — all page UI must be `.astro` files.

---

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

- **Astro strict mode**: `extends: "astro/tsconfigs/strict"`. All props must be typed.
- **Path alias**: `@/*` resolves to `./src/*`. Use `import { cn } from '@/lib/utils'`.
- **Interface Props pattern**: Every `.astro` component uses `interface Props { ... }` in frontmatter.
- **No enums**: Use union types or `as const` arrays. Enums don't work well with Astro's build.
- **ES modules only**: `"type": "module"` in all package.json files. Use `import`/`export`, never `require`.
- **Sanity schemas**: Always use `defineType`, `defineField`, `defineArrayMember` from `'sanity'` for type safety.
- **GROQ queries**: Use `groq` tagged template literal for syntax highlighting.
- **Sanity client import**: Import from `sanity:client` virtual module, not from a file path.

#### Type Organization

- **TypeGen-derived types**: `src/lib/types.ts` re-exports generated types from `sanity.types.ts`. Run `npm run typegen` after schema/query changes.
- **`Page`**: `NonNullable<PAGE_BY_SLUG_QUERY_RESULT>` — derived from GROQ query result.
- **`SiteSettings`**: `NonNullable<SITE_SETTINGS_QUERY_RESULT>` — derived from GROQ query result.
- **Block types**: `Extract<PageBlock, { _type: 'heroBanner' }>` pattern. Each block type is automatically extracted from the `PageBlock` union.
- **`PageBlock`**: Union of all block types, derived from `Page['blocks']`.

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

#### Block Architecture (The Core Pattern)

Every block has exactly **2 files** + registration lines:

1. Schema: `studio/src/schemaTypes/blocks/{block-name}.ts` using `defineBlock`
2. Component: `astro-app/src/components/blocks/custom/{BlockName}.astro` composing from `ui/` primitives
3. Register in `studio/src/schemaTypes/index.ts` (schema array)
4. **Auto-discovered** by `block-registry.ts` via `import.meta.glob` (no manual BlockRenderer changes needed)
5. Add GROQ projection in `src/lib/sanity.ts`
6. Add type to page schema's `blocks[]` array

#### BlockRenderer Auto-Discovery Pattern

BlockRenderer uses `block-registry.ts` which auto-discovers block components via `import.meta.glob`. **No switch statement or manual imports needed.**

1. **Custom blocks** (block prop pattern): Auto-discovered from `blocks/custom/*.astro`
   - PascalCase filename → camelCase `_type` (e.g., `HeroBanner.astro` → `heroBanner`)
   - Receive typed `block` prop matching their interface
2. **fulldev/ui blocks** (spread props pattern): Auto-discovered from `blocks/*.astro`
   - Receive spread props: `<UiComponent {...block} />`

```ts
// block-registry.ts — auto-discovers blocks via import.meta.glob
const customModules = import.meta.glob('./blocks/custom/*.astro', { eager: true });
// Converts PascalCase filename to camelCase _type automatically
```

#### GROQ Query Rules

- **All queries in `src/lib/sanity.ts`**: Never inline queries in page/component files.
- **Use `sanity.fetch()` in page frontmatter only**: Block components receive data as props, never fetch.
- **Project specific fields**: Don't use `{ ... }` (select all). Always project the fields you need.
- **Expand references with `->`**: `author->{ name, bio }`. Use `_ref` (not `->`) in filters for performance.
- **Order before slice**: `| order(publishedAt desc)[0...10]`, not `[0...10] | order(...)`.
- **Use `$params` not string interpolation**: Security + caching.
- **Page builder expansion**: Use `_type == "heroBanner" => { ... }` conditional projections in `blocks[]`.

#### Data Flow

```
Sanity Content Lake → sanity.fetch() via loadQuery<T>() at build time → Page frontmatter → BlockRenderer → Block components (props) → Static HTML
```

- Zero runtime API calls to Sanity (except Visual Editing preview mode)
- All data resolved at build time
- No client-side state management

#### Currently Registered Schemas

- **Objects (3)**: `seo`, `button`, `portableText`
- **Documents (3)**: `page`, `siteSettings`, `sponsor`
- **Blocks (11)**: `heroBanner`, `featureGrid`, `ctaBanner`, `statsRow`, `textWithImage`, `logoCloud`, `sponsorSteps`, `richText`, `faqSection`, `contactForm`, `sponsorCards`

### Testing Rules

#### Two-Runner Architecture

| Runner | Config | Scope |
|---|---|---|
| **Vitest** | `astro-app/vitest.config.ts` | Unit + Component (Container API) + Schema/Integration |
| **Playwright** | `playwright.config.ts` | E2E only (real browser) |

#### Vitest (Unit + Component + Integration)

- **Config**: `astro-app/vitest.config.ts` using `getViteConfig()` from `astro/config`.
- **Include patterns**: `src/**/__tests__/**/*.test.ts` + `../tests/integration/**/*.test.ts`.
- **`sanity:client` mock**: Aliased via `__mocks__/sanity-client.ts` in vitest config.
- **Component tests**: Use Astro Container API (`experimental_AstroContainer`) — renders components in Node.js, no browser.
- **Fixtures**: Typed from `sanity.types.ts` in `__fixtures__/` directories.
- **Integration tests**: Pure Node.js assertions (file existence, schema shape, module imports) — previously Playwright, now Vitest.

#### Playwright (E2E Only)

- **Config**: `playwright.config.ts` at project root.
- **Test directory**: `tests/e2e/`. Output: `./test-results` + `playwright-report/`.
- **Web server**: Builds astro-app then runs preview (`build && preview`) before tests. 120s startup timeout.
- **Browser projects (5)**: Desktop: `chromium`, `firefox`, `webkit`. Mobile: `mobile-chrome` (Pixel 7), `mobile-safari` (iPhone 14).

#### Accessibility & SEO Testing

- `@axe-core/playwright` — automated WCAG compliance checks. Target: WCAG 2.1 AA, Lighthouse A11y 90+.
- `@seontechnologies/playwright-utils` — SEO validation utilities.

#### Test Commands

| Command | What It Does |
|---|---|
| `npm run test:unit` | Vitest: unit + component + integration |
| `npm run test:e2e` | Playwright: all browser projects |
| `npm test` | Both: `test:unit && test:e2e` |
| `npm run test:chromium` | Playwright: Chromium only (fastest) |
| `npm run test:headed` | Playwright: headed chromium for debugging |
| `npm run test:ui` | Playwright: UI mode |

#### When to Write Tests

- New block component → Container API test with full + minimal fixture data
- New GROQ query → Verify query string contains expected type/field references
- Schema change → Run `npm run typegen` (type errors surface fixture/component drift)
- Interactive behavior → Playwright E2E spec

#### CI Configuration

- Playwright: `retries: 2`, `workers: 1`, `forbidOnly: true` when `CI` env var is set.
- Traces on first retry, screenshots on failure, video retained on failure.

#### Build-Time Validation

- `astro check && astro build` is the primary quality gate in `astro-app/`.
- TypeScript strict mode catches type errors at build time.

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

- **22 component families installed**: accordion, avatar, badge, button, field, footer, header, icon, image, input, item, label, list, logo, marquee, native-select, section, separator, sheet, spinner, textarea, tile.
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
    BlockRenderer.astro  # Renders blocks using block-registry
    Header.astro, Footer.astro, MobileNav.astro, Breadcrumb.astro
    __tests__/       # Container API component tests + __fixtures__/
  layouts/
    Layout.astro
    templates/       # Page template shells (Default, FullWidth, Landing, Sidebar, TwoColumn)
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
  objects/           # block-base.ts, seo.ts, button.ts, portable-text.ts
  documents/         # page.ts, site-settings.ts, sponsor.ts
  blocks/            # One file per block schema
  index.ts           # Schema registry (exports schemaTypes[])

tests/
  e2e/               # Playwright E2E tests (real browser)
  integration/       # Vitest integration tests (schema, file structure, config)
  support/           # Shared test constants
```

### Development Workflow Rules

#### Dev Commands

| Command | What It Does |
|---|---|
| `npm run dev` (root) | Runs both workspaces concurrently |
| `npm run dev:storybook` (root) | Both workspaces + Storybook |
| `npm run storybook` (root) | Storybook only (port 6006) |
| `cd astro-app && npm run build` | Build with `astro check && astro build` |
| `npm test` (root) | Unit + E2E tests |

#### Hosting

- **Target**: Cloudflare Pages. `@astrojs/cloudflare` adapter configured. Output conditionally `static` or `server` (Visual Editing).

#### CI/CD

- `.github/workflows/deploy-storybook.yml` — deploys Storybook to GitHub Pages.
- Main app deploy workflow not yet configured (deferred).

#### Environment Variables

- `PUBLIC_SANITY_STUDIO_PROJECT_ID` / `PUBLIC_SANITY_STUDIO_DATASET` — primary Sanity config in `.env`.
- `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` — toggles Visual Editing mode (stega encoding + draft perspective).
- `SANITY_API_READ_TOKEN` — required when Visual Editing is enabled.
- Fallbacks in `astro.config.mjs`: `PUBLIC_SANITY_PROJECT_ID` → `"placeholder"`, `PUBLIC_SANITY_DATASET` → `"production"`.

#### Schema Change Propagation

Schema change in `studio/` must be reflected in:
1. GROQ projections in `astro-app/src/lib/sanity.ts`
2. TypeScript interfaces in `astro-app/src/lib/types.ts`
3. Component props in the corresponding block component

#### Adding a New Block (Checklist)

1. Create schema: `studio/src/schemaTypes/blocks/{block-name}.ts` using `defineBlock`
2. Register in `studio/src/schemaTypes/index.ts`
3. Add type to page schema's `blocks[]` array `of` list in `studio/src/schemaTypes/documents/page.ts`
4. Install any needed fulldev/ui primitives: `npx shadcn@latest add @fulldev/{name}`
5. Create component: `astro-app/src/components/blocks/custom/{BlockName}.astro` (PascalCase filename auto-registers via `block-registry.ts`)
6. Add GROQ projection in `src/lib/sanity.ts` page query
7. Run `npm run typegen` to regenerate types (block type auto-extracted via `Extract<PageBlock, ...>`)
8. Add Container API test in `src/components/__tests__/{BlockName}.test.ts` with typed fixtures

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

#### Edge Cases

- **Astro v5 `output: 'static'`** now includes old hybrid behavior. Don't add `export const prerender = false` unless explicitly needed for forms.
- **Sanity free tier limits**: 100K API requests/month, 10K documents, 5GB assets. All queries are build-time only to stay well under limits.
- **`sanity:client` virtual module**: Import from `sanity:client`, not from a file path. Requires `@sanity/astro` integration in `astro.config.mjs`.
- **Portable Text in Astro**: Use `astro-portabletext` (not `@portabletext/react`). It renders in `.astro` components without React.
- **shadcn CLI + Astro**: The `shadcn` package works with fulldev/ui's Astro registry. Always specify `@fulldev/` prefix when adding components.
- **`@astrojs/node` adapter in config**: This is for Visual Editing preview mode, not production deploy. Production is pure static.

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
| 1.4 Storybook Setup | DONE | storybook-astro framework, native Astro component development |
| 1.5 Storybook Production Build | DONE | Production build fixes and configuration |
| 1.6 Storybook GitHub Pages Deploy | DONE | CI/CD workflow for Storybook deployment |
| 2.0 Template Layout System | DONE | Layout.astro, Header, Footer, navigation |
| 2.1 Block Schemas (Homepage) | DONE | heroBanner, featureGrid, ctaBanner, statsRow, textWithImage, logoCloud, sponsorSteps |
| 2.1b Block Schemas (Remaining) | DONE | richText, faqSection, contactForm, sponsorCards |
| 2.2 Homepage Wiring | DONE | GROQ queries, Visual Editing, Presentation tool for homepage |
| 2.3a Site Settings Wiring | DONE | Memoized queries, full schema validation for siteSettings |
| 2.2b Remaining Pages Data | DONE | CMS-driven catch-all route, template dispatch, all pages from Sanity |
| Testing Refactor | DONE | Vitest Container API tests, integration test migration, consolidated test scripts |
| 3.1 Sponsor Document Schema | NEXT | Sponsor document schema + studio management |

**Current state**: All pages are CMS-driven via `[...slug].astro` catch-all route with 5 template layouts. Test architecture consolidated to Vitest (unit/component/integration) + Playwright (E2E only). Next up is Story 3.1 (sponsor studio management).

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

Last Updated: 2026-02-11
