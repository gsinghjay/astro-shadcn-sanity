---
project_name: 'astro-shadcn-sanity'
user_name: 'Jay'
date: '2026-02-07'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 78
optimized_for_llm: true
---

# Project Context for AI Agents

_Critical rules and patterns for implementing code in this project. Optimized for LLM context efficiency._

---

## Technology Stack & Versions

### Monorepo Structure

npm workspaces: `astro-app/` (frontend) + `studio/` (Sanity CMS). **No shared code between workspaces.** React exists only in `studio/`.

### Core Technologies

| Technology | Version | Critical Notes |
|---|---|---|
| Astro | ^5.17.1 | `output: 'static'` (SSG). v5 merged `hybrid` into `static` — pages can opt out with `export const prerender = false` |
| Tailwind CSS | v4.1.18 | Via `@tailwindcss/vite` plugin. **No `tailwind.config.mjs`** — CSS-first config in `global.css` `@theme` block |
| Sanity Studio | ^4.11.0 | React 19 in `studio/` only. Uses `structureTool` + `visionTool` |
| TypeScript | ^5.9.3 | Astro strict mode. `@/*` path alias maps to `./src/*` |
| Vite | ^7.3.1 | Astro's build tool. Tailwind v4 runs as Vite plugin |
| Node.js | 24+ | Target runtime for CI/CD and local dev |

### Key Dependencies (astro-app)

| Package | Version | Purpose |
|---|---|---|
| `@sanity/astro` | ^3.2.11 | Provides `sanity:client` virtual module. Add `"types": ["@sanity/astro/module"]` to tsconfig |
| `@sanity/image-url` | ^1.2.0 | Image URL builder — always use `urlFor()` helper, never construct CDN URLs |
| `astro-portabletext` | ^0.10.0 | Portable Text rendering in `.astro` components |
| `groq` | ^3.48.1 | GROQ tagged template for syntax highlighting + `defineQuery` |
| fulldev/ui | via `shadcn ^3.8.4` | Vanilla `.astro` UI primitives. Install: `npx shadcn@latest add @fulldev/{name}` |
| `astro-icon` | ^1.1.5 | Iconify wrapper. Icon sets: `@iconify-json/lucide`, `@iconify-json/simple-icons` |
| `class-variance-authority` | ^0.7.1 | Component variant definitions (used by fulldev/ui) |
| `tailwind-merge` | ^3.4.0 | `cn()` utility in `src/lib/utils.ts` |
| `@tailwindcss/typography` | ^0.5.19 | `prose` class for rich text. Loaded as `@plugin` in global.css |

### Version Constraints Agents MUST Know

- **Tailwind v4 !== v3**: Uses `@theme` block in CSS, `@plugin` directive, `@utility` for custom utilities. No JS config file. No `@apply` in `@theme`.
- **fulldev/ui !== React shadcn/ui**: Components are `.astro` files, not `.tsx`. Install with `@fulldev` registry prefix.
- **`components.json`**: `"tsx": false`, `"rsc": false`. Shadcn CLI generates Astro, not React.
- **No `@astrojs/tailwind`**: That's the v3 integration. This project uses `@tailwindcss/vite` directly.

---

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

- **Astro strict mode**: `extends: "astro/tsconfigs/strict"`. All props must be typed.
- **Path alias**: `@/*` resolves to `./src/*`. Use `import { cn } from '@/lib/utils'`.
- **Interface Props pattern**: Every `.astro` component uses `interface Props { ... }` in frontmatter.
- **No enums**: Use union types or `as const` arrays. Enums don't work well with Astro's build.
- **ES modules only**: `"type": "module"` in all package.json files. Use `import`/`export`, never `require`.
- **Sanity schemas**: Always use `defineType`, `defineField`, `defineArrayMember` from `'sanity'` for type safety.
- **GROQ queries**: Wrap in `defineQuery()` from `'groq'` for TypeGen. Use `groq` tagged template for syntax highlighting.

### Framework-Specific Rules (Astro + Sanity)

#### Astro Component Rules

- **`.astro` files only in `astro-app/`**: No `.tsx`, `.jsx`, `.vue`, `.svelte`. Zero framework runtime.
- **Frontmatter is server-side**: Code in `---` fences runs at build time. No browser APIs.
- **Inline `<script>` tags**: Astro auto-bundles and deduplicates. Use for client-side interactivity.
- **Props flow down only**: Block components are leaf nodes — receive props, render HTML. No upward communication.
- **`class:list` for conditional classes**: Use `class:list={['base', condition && 'conditional']}`.

#### Sanity Schema Rules

- **`defineBlock` helper for all blocks**: Wraps `defineType` and merges shared base fields (backgroundVariant, spacing, maxWidth). Never use raw `defineType` for blocks.
- **Always `defineField` + `defineArrayMember`**: Required for type safety and autocomplete.
- **Image fields must have `hotspot: true`** and a required `alt` text field (NFR16 accessibility).
- **Icons on every type**: Import from `@sanity/icons`. Improves Studio UX.
- **Schema naming**: Type names are `camelCase` (`heroBanner`). File names are `kebab-case` (`hero-banner.ts`).
- **Objects not documents for blocks**: Blocks are `type: 'object'`, consumed via `blocks[]` array on page documents.
- **Never delete fields with production data**: Use the deprecation pattern (deprecated + readOnly + hidden).
- **Validation**: Use `rule.required()`, `rule.max()`, `rule.custom()`. Cross-field validation via `context.document`.

#### Block Architecture (The Core Pattern)

Every block has exactly **2 files** + 2 registration lines:

1. Schema: `studio/src/schemaTypes/blocks/{block-name}.ts` using `defineBlock`
2. Component: `astro-app/src/components/blocks/{BlockName}.astro` composing from `ui/` primitives
3. Register in `studio/src/schemaTypes/index.ts` (schema array)
4. Register in `astro-app/src/components/BlockRenderer.astro` (switch statement)
5. Add GROQ projection in `src/lib/sanity.ts`
6. Add type to page schema's `blocks[]` array

#### BlockRenderer Dispatch

```astro
{blocks.map((block) => {
  switch (block._type) {
    case 'heroBanner': return <HeroBanner block={block} />;
    case 'featureGrid': return <FeatureGrid block={block} />;
    // ...
    default: return null;
  }
})}
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
Sanity Content Lake → sanity.fetch() at build time → Page frontmatter → BlockRenderer → Block components (props) → Static HTML
```

- Zero runtime API calls to Sanity
- All data resolved at build time
- No client-side state management

### Tailwind v4 CSS-First Configuration

- **Theme tokens in `global.css`**: All colors, fonts, spacing defined in `@theme { }` block as CSS custom properties.
- **shadcn CSS variables**: `--background`, `--primary`, `--muted`, etc. defined in `:root` and `.dark`.
- **Brand colors**: `--color-njit-red: #D22630`, `--color-njit-navy: #003366`, `--color-njit-gold: #E89B32`, `--color-swiss-red: #E30613`.
- **Custom utilities**: Use `@utility name { ... }` directive (e.g., `@utility label-caps`).
- **Typography plugin**: Loaded as `@plugin "@tailwindcss/typography"` in CSS, not in a config file.
- **No arbitrary values**: Never `bg-[#ff0000]`. Always use design tokens (`bg-primary`, `bg-njit-red`).
- **Responsive mobile-first**: Use `md:` and `lg:` prefixes. Default styles are mobile.
- **`cn()` utility**: `twMerge(clsx(...inputs))` in `src/lib/utils.ts`. All components use it for class merging.

### fulldev/ui Component Rules

- **22 component families installed**: accordion, avatar, badge, button, field, footer, header, icon, image, input, item, label, list, logo, marquee, native-select, section, separator, sheet, spinner, textarea, tile.
- **Compound component pattern**: `Section` + `SectionContent` + `SectionGrid`. `Tile` + `TileContent` + `TileTitle`. Always compose, never flatten.
- **Barrel exports**: Each family has `index.ts`. Import: `import { Button } from '@/components/ui/button'`.
- **Block components compose from ui/**: Blocks adapt Sanity data into ui/ primitive props. Never hand-roll buttons, inputs, cards, accordions.
- **Install new primitives**: `npx shadcn@latest add @fulldev/{name}`. Never copy/paste from external sources.
- **UI primitives are data-agnostic**: They know nothing about Sanity or block schemas.

### Vanilla JS Patterns (Client-Side Interactivity)

- **Data-attribute driven state**: Use `data-state="open|closed"`, `data-active`, etc. **Never** use `classList.add/remove` for state.
- **CSS targets data attributes**: `[data-state="active"] { opacity: 1; }`. State changes via `element.dataset.state = 'open'`.
- **Always include ARIA**: `aria-expanded`, `aria-controls`, `aria-hidden` on interactive elements.
- **Scoped selectors**: `querySelectorAll('[data-{block}-trigger]')`. Always use data-attribute guards.
- **Colocated scripts**: Each interactive block contains its own `<script>` tag. Global scripts in `src/scripts/main.ts`.
- **Existing client-side modules** (in `main.ts`): `initScrollAnimations()` (IntersectionObserver), `initContactForm()` (form handler, currently mocked), `initCarousel()` (hero auto-play with dots).

### Image Handling

- **Always use `urlFor()` from `src/lib/image.ts`**: Never construct Sanity CDN URLs manually.
- **Always provide width, height, alt**: `urlFor(image).width(800).height(400).url()`.
- **`loading="lazy"` on all images**: Except hero/above-fold (use `loading="eager"` or omit).
- **Sanity image schema**: Always `hotspot: true` + required `alt` field.
- **Query LQIP when needed**: `asset->{ metadata { lqip, dimensions } }` for blur placeholders.

### Testing Rules

- **No test framework currently configured**: Testing is deferred (nice-to-have gap in architecture).
- **Build-time validation**: `astro check && astro build` is the primary quality gate.
- **Manual testing**: Via dev server (`npm run dev` at root runs both workspaces concurrently).
- **Future**: Playwright for E2E Lighthouse audits when CI/CD is configured.

### Code Quality & Style Rules

#### Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Sanity type names | `camelCase` | `heroBanner`, `siteSettings` |
| Sanity field names | `camelCase` | `backgroundVariant`, `ctaButtons` |
| Schema files | `kebab-case.ts` | `hero-banner.ts`, `site-settings.ts` |
| Astro components | `PascalCase.astro` | `HeroBanner.astro`, `BlockRenderer.astro` |
| Utility files | `camelCase.ts` | `sanity.ts`, `image.ts`, `utils.ts` |
| CSS custom properties | `--{category}-{name}` | `--color-njit-red`, `--background` |

#### Formatting

- **astro-app**: `singleQuote: true`, `trailingComma: "all"`, `arrowParens: "avoid"`, `tabWidth: 2`, `printWidth: 120`.
- **studio**: `semi: false`, `printWidth: 100`, `bracketSpacing: false`, `singleQuote: true`.
- **Different configs per workspace**: These are intentionally different. Don't unify them.

#### File Organization

```
astro-app/src/
  components/
    ui/              # fulldev/ui primitives (owned, modifiable)
    blocks/          # Block components (1:1 with Sanity schemas)
    BlockRenderer.astro
    Header.astro, Footer.astro, MobileNav.astro, Breadcrumb.astro
  layouts/Layout.astro
  lib/
    sanity.ts        # Client + ALL GROQ queries + types
    image.ts         # urlFor() helper
    utils.ts         # cn() utility
    types.ts         # TypeScript interfaces for blocks/pages
    data/            # Placeholder data (TEMPORARY — removed when GROQ queries are wired)
  pages/             # File-based routing + [...slug].astro catch-all
  scripts/main.ts    # Global client-side JS
  styles/global.css  # Tailwind imports + @theme + shadcn vars

studio/src/schemaTypes/
  helpers/defineBlock.ts
  objects/           # block-base.ts, seo.ts, button.ts, portable-text.ts
  documents/         # page.ts, sponsor.ts, project.ts, team.ts, event.ts, site-settings.ts
  blocks/            # One file per block schema
  index.ts           # Schema registry (exports schemaTypes[])
```

### Development Workflow Rules

- **Dev command**: `npm run dev` at project root runs both workspaces via `concurrently`.
- **Build**: `cd astro-app && npm run build` (runs `astro check && astro build`).
- **Hosting (current)**: GitHub Pages. Pure static output, no adapter.
- **Hosting (future)**: Cloudflare Pages when forms are implemented. Adds `@astrojs/cloudflare` adapter.
- **Environment variables**: `PUBLIC_SANITY_STUDIO_PROJECT_ID` and `PUBLIC_SANITY_STUDIO_DATASET` in `.env`.
- **Schema changes propagation**: Schema change in `studio/` must be reflected in GROQ projections and component props in `astro-app/`.

### Critical Don't-Miss Rules

#### Anti-Patterns (NEVER do these)

| Anti-Pattern | Why | Do This Instead |
|---|---|---|
| React/JSX in `astro-app/` | Zero framework runtime requirement | Use `.astro` components only |
| `bg-[#cc0000]` arbitrary Tailwind | No design token = visual inconsistency | Use `bg-primary`, `bg-njit-red`, etc. |
| Inline styles (`style="..."`) | Breaks Tailwind utility pattern | Use Tailwind classes |
| `classList.add/remove` for state | Inconsistent with project JS pattern | Use `data-*` attributes |
| Hand-rolling UI primitives | Duplicates fulldev/ui, inconsistent A11y | Use components from `src/components/ui/` |
| Manual Sanity CDN URLs | Bypasses image pipeline | Use `urlFor()` from `lib/image.ts` |
| GROQ queries in components | Breaks data flow architecture | All queries in `src/lib/sanity.ts` |
| Runtime API calls to Sanity | SSG — all data at build time | Use `sanity.fetch()` in page frontmatter |
| Nested blocks (block in block) | Architecture is flat `blocks[]` array | Compose within a single block |
| Index keys in block loops | Breaks Visual Editing + reconciliation | Always use `block._key` |
| Raw `defineType` for blocks | Misses base fields | Use `defineBlock` helper |
| Deleting Sanity fields | Data loss in production | Use deprecation pattern |
| `@astrojs/tailwind` | That's Tailwind v3 | Use `@tailwindcss/vite` (v4) |

#### Edge Cases

- **Astro v5 `output: 'static'`** now includes old hybrid behavior. Any page can disable prerender. But this project is pure SSG — don't add `export const prerender = false` unless explicitly needed for forms.
- **Sanity free tier limits**: 100K API requests/month, 10K documents, 5GB assets. All queries are build-time only to stay well under limits.
- **`@sanity/astro` virtual module**: Import from `sanity:client`, not from a file path. Requires `@sanity/astro` integration in `astro.config.mjs`.
- **Portable Text in Astro**: Use `astro-portabletext` (not `@portabletext/react`). It renders in `.astro` components without React.
- **shadcn CLI + Astro**: The `shadcn` package works with fulldev/ui's Astro registry. Always specify `@fulldev/` prefix when adding components.

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
| 1.1 Reconfigure Starter | DONE | Removed React/Vercel, added Tailwind v4, fulldev/ui, directory structure |
| 1.2 Migrate Reference | DONE | 12 block components, 22 ui families, 5 pages with placeholder data |
| 1.3 Schema Infrastructure | READY-FOR-DEV | defineBlock helper, base objects, document schemas (page, siteSettings) |
| 2.x Block Schemas + GROQ | BACKLOG | Create all block schemas, replace placeholder data with GROQ queries |

**Current state**: Frontend is built with placeholder data in `src/lib/data/`. Sanity schemas are empty (`schemaTypes = []`). Next step is Story 1.3 to build schema infrastructure.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code in this project
- Follow ALL rules exactly as documented — especially the anti-patterns table
- When in doubt, prefer the more restrictive option
- Cross-reference with `_bmad-output/planning-artifacts/architecture.md` for full architectural context
- Check `_bmad-output/implementation-artifacts/sprint-status.yaml` for current story status

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack or patterns change
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-02-07
