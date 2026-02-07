---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-02-07'
inputDocuments:
  - '/home/jay/github/astro-shadcn-sanity/_bmad-output/planning-artifacts/prd.md'
  - '/home/jay/github/astro-shadcn-sanity/initial-brainstorm.md'
  - '/home/jay/github/astro-shadcn-sanity/_bmad-output/brainstorming/brainstorming-session-2026-02-07.md'
workflowType: 'architecture'
project_name: 'astro-shadcn-sanity'
user_name: 'Jay'
date: '2026-02-07'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
40 FRs across 8 categories. The architectural center of gravity is the page composition system (FR1-FR5) — a modular block library where content editors arrange pre-built UI blocks in Sanity Studio. This drives the core architectural pattern: Sanity schema → Astro component → BlockRenderer dispatch. Secondary concerns include document management (sponsors, projects, teams, events) with cross-referencing. Form submission (FR17-FR21) is explicitly deferred to last — hosting migrates from GitHub Pages to Cloudflare Pages at that point.

**Non-Functional Requirements:**
28 NFRs with the most architecturally significant being:
- **Performance:** Lighthouse 95+ mobile/desktop, FCP <1s, LCP <2s, TBT <100ms, CLS <0.05. JS under 5KB, CSS under 15KB after purge. Build under 60s.
- **Security:** Write tokens never client-exposed; form proxy via Cloudflare Worker (deferred). CSP/security headers on GitHub Pages via meta tags.
- **Accessibility:** WCAG 2.1 AA, Lighthouse A11y 90+, keyboard navigation, screen reader compatibility, enforced alt text in Sanity schema.
- **Maintainability:** New block = exactly 3 files (schema + component + BlockRenderer registration). TypeScript schemas. Consistent data-attribute JS patterns.
- **Integration:** Zero runtime API calls. Build-time Sanity usage under 10% of free tier. GA4/Monsido non-blocking.

**Scale & Complexity:**

- Primary domain: Static web (SSG) with headless CMS
- Complexity level: Low-Medium
- Estimated architectural components: ~30 (17 block components [12 P0 + 2 P1 + 3 P2] + 7 document schemas + layout components + utilities)

### Technical Constraints & Dependencies

- **$0/month operating cost** — all services must stay within free tiers (Sanity 100K API/month, GitHub Pages unlimited bandwidth)
- **Zero framework runtime** — no React, Vue, or Alpine.js in production bundle. Vanilla JS only.
- **Static output** — Astro 5.x SSG mode with `output: 'static'` (v5 merged the old `hybrid` mode into `static` — any page can opt out of prerendering with `export const prerender = false`). No serverless adapter until forms phase.
- **Monorepo structure** — `astro-app/` (frontend) + `studio/` (Sanity Studio) already initialized as separate workspaces
- **GitHub Pages (initial)** — static hosting via GitHub Actions. Migrates to Cloudflare Pages when forms are implemented (last priority).
- **Forms are last** — Contact Form block, Cloudflare Worker, and `@astrojs/cloudflare` adapter all deferred until final implementation phase. This keeps the architecture pure SSG until then.
- **Sanity free tier** — unlimited admin users but 100K API requests/month, 10K documents, 5GB assets
- **Reference site parity** — all page types on ywcccapstone1.com must be reproducible with the block library

### Cross-Cutting Concerns Identified

- **Block Base Schema Inheritance:** Every block inherits background/spacing/max-width. Must be enforced at schema level and consumed consistently in every Astro component.
- **SEO Propagation:** Per-page meta fields flow from Sanity through page queries into `<head>`. Requires consistent query patterns and layout integration.
- **Accessibility:** ARIA attributes, keyboard handlers, focus management, and alt text enforcement touch every interactive block and navigation component.
- **Image Pipeline:** Sanity CDN → `@sanity/image-url` → responsive `srcset` with WebP/AVIF. Used by Hero, Sponsor Cards, Team Grid, Logo Cloud, Image Gallery, and any block with images.
- **Build-Time Data Contract:** GROQ queries are the API contract between Sanity and Astro. Query patterns, projections, and reference resolution must be consistent and typed.
- **Hosting Migration Path:** GitHub Pages → Cloudflare Pages is a planned migration. Architecture should avoid GitHub Pages-specific lock-in (e.g., no `_redirects` file assumptions). The switch adds `@astrojs/cloudflare` adapter + Cloudflare Worker for form proxy.
- **TypeScript Throughout:** Sanity schemas typed with `defineType`/`defineField`, Astro components with typed props, GROQ query results typed.

## Starter Template Evaluation

### Primary Technology Domain

Static web (SSG) with headless CMS — Astro + Sanity.io monorepo.

### Starter Used: `sanity-template-astro-clean`

**Source:** [sanity-io/sanity-template-astro-clean](https://github.com/sanity-io/sanity-template-astro-clean)

The project has already been initialized from this starter. It provides the monorepo workspace structure and Sanity integration wiring. Evaluation focuses on what the starter provides vs. what must be modified.

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- TypeScript throughout (Astro + Sanity)
- ES modules (`"type": "module"`)
- Node.js runtime for builds

**Sanity Integration:**
- `@sanity/astro` integration for client setup
- `@sanity/image-url` for image pipeline
- `groq` package for query building
- `astro-portabletext` for Portable Text rendering
- Sanity Studio v4.11 with `structureTool` + `visionTool`

**Project Structure:**
- npm workspaces monorepo: `astro-app/` (frontend) + `studio/` (CMS)
- Concurrent dev script: both workspaces run in parallel
- Separate dependency trees per workspace

**Development Experience:**
- `astro check` + `tsc --noEmit` in build script
- Prettier + ESLint configured
- Vite-powered dev server with HMR

### Required Modifications to Starter

**Remove (misaligned with architecture):**
- `@astrojs/vercel` adapter — replacing with `output: 'static'` for GitHub Pages
- `@astrojs/react` + `react` + `react-dom` from `astro-app` — zero framework runtime requirement. React stays in `studio/` only.
- `output: 'hybrid'` — no longer exists in Astro 5.x (its behavior is now the default under `output: 'static'`)
- Sample schemas (`post`, `blockContent`) — replaced by project document types and block schemas

**Add (required by architecture):**
- Tailwind CSS v4 + `@tailwindcss/vite` plugin (NOT the legacy `@astrojs/tailwind` which is Tailwind v3)
- fulldev/ui component library ([ui.full.dev](https://ui.full.dev)) — vanilla `.astro` components installed via shadcn CLI with `@fulldev` registry. Provides accessible, Tailwind v4-styled UI primitives (Button, Accordion, Input, etc.) without any framework runtime. Block components compose from these primitives.
- `components.json` with `@fulldev` registry configuration for CLI-based component installation
- NJIT brand color tokens defined via CSS custom properties in `global.css` (Tailwind v4 CSS-first configuration — no `tailwind.config.mjs`)
- Block component directory structure (`src/components/blocks/`)
- `BlockRenderer.astro` dispatch component
- All 7 document schemas + 17 block schemas + shared base schema
- GitHub Actions workflow for deploy to GitHub Pages
- Sanity webhook configuration for rebuild triggers
- `storybook-astro` + Storybook 10 for native Astro component development and documentation (devDependencies: `storybook-astro`, `storybook`, `@storybook/addon-docs`, `@storybook/builder-vite`)

**Note:** Project initialization is already complete. First implementation work is reconfiguring the starter to match the target architecture.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Shared base schema pattern: `defineBlock` helper function
- BlockRenderer dispatch: Explicit imports + conditional rendering
- CSS architecture: fulldev/ui components + shadcn CSS variables + Tailwind v4 utilities
- Vanilla JS strategy: Inline `<script>` colocated in block components

**Important Decisions (Shape Architecture):**
- Node.js 24+ for CI/CD
- Environment config via `.env` files (existing starter pattern)

**Deferred Decisions (Post-Building-Blocks):**
- GitHub Actions deploy workflow (deferred until blocks built)
- Sanity webhook for content-triggered rebuilds (deferred until blocks built)
- Cloudflare Pages migration (deferred until forms phase)

### Data Architecture

| Decision | Choice | Rationale |
|---|---|---|
| Schema inheritance | `defineBlock` helper function | Wraps `defineType` and merges shared base fields (background, spacing, maxWidth) into every block. Keeps schemas DRY. Provides a single pattern for AI agents to follow. |
| Content model | 7 document types + 17 block types (12 P0 + 2 P1 + 3 P2) | page, sponsor, project, team, event, submission, siteSettings. 12 P0 blocks: heroBanner, featureGrid, sponsorCards, richText, ctaBanner, faqSection, contactForm, timeline, logoCloud, statsRow, teamGrid, textWithImage. Blocks defined as Sanity object types referenced in page `blocks[]` array. |
| Data validation | Sanity schema validation rules | `defineField` with `validation: (Rule) => ...` for required fields, string lengths, slug uniqueness. |
| Query language | GROQ | Build-time queries via `@sanity/astro` client. No GraphQL. |

### Authentication & Security

No user authentication required. Security concerns limited to:
- Sanity write token isolation (server-side only, deferred to forms phase)
- CSP/security headers via `<meta>` tags on GitHub Pages
- Honeypot + rate limiting on contact form (deferred to forms phase)

### API & Communication Patterns

| Decision | Choice | Rationale |
|---|---|---|
| Data fetching | Build-time GROQ queries | All content fetched at build time via `sanity.fetch()`. Zero runtime API calls. |
| Query organization | Colocated in `src/lib/sanity.ts` | Central query file with exported typed query functions. Single source of truth for all GROQ. |
| Error handling | Build-time failures | If Sanity is unreachable, build fails. No runtime error handling needed for content. |

### Frontend Architecture

| Decision | Choice | Rationale |
|---|---|---|
| BlockRenderer | Explicit imports + conditional rendering | All block components imported at top of `BlockRenderer.astro`. Template uses `{block._type === 'hero' && <Hero {...block} />}` pattern. Type-safe, no magic, idiomatic Astro. |
| UI primitives | fulldev/ui via shadcn CLI | Vanilla `.astro` components (Button, Accordion, Input, Badge, Card, etc.) installed via `npx shadcn@latest add @fulldev/{name}`. Zero framework runtime. Components land in `src/components/ui/` and are owned/customizable. |
| CSS system | shadcn CSS variables + Tailwind v4 utilities | Tailwind v4 CSS-first configuration in `global.css` — all theme tokens (colors, spacing, fonts) defined via `@theme` block and CSS custom properties. shadcn's CSS custom properties (`--background`, `--primary`, etc.) and NJIT brand colors defined in CSS. No `tailwind.config.mjs`. |
| Vanilla JS | Inline `<script>` in `.astro` components | Astro automatically bundles, deduplicates, and optimizes inline scripts. Each interactive block (FAQ, tabs, mobile nav, carousel, form) contains its own `<script>` tag. Data-attribute driven event delegation. |
| Component format | `.astro` files only | No `.tsx` or `.jsx` in frontend. React exists only in `studio/` workspace. fulldev/ui components are pure `.astro`. |
| State management | None | Static site — no client-side state. All data resolved at build time. |
| Routing | File-based + `[...slug].astro` | Astro file-based routing. Dynamic catch-all for CMS-built pages. Explicit routes for sponsor/project detail pages. |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|---|---|---|
| Hosting (initial) | GitHub Pages | Free static hosting. Pure `output: 'static'` with no adapter. |
| Hosting (future) | Cloudflare Pages | Migrate when forms are implemented. Adds `@astrojs/cloudflare` adapter. |
| CI/CD | GitHub Actions (deferred) | Standard Astro build → GitHub Pages deploy. Configured after blocks are built. |
| Node.js version | 24+ | Latest LTS for CI/CD and local dev. |
| Rebuild trigger | Sanity webhook (deferred) | `repository_dispatch` via Sanity webhook on content publish. Configured after blocks are built. |
| Environment config | `.env` files | Existing starter pattern. `PUBLIC_SANITY_STUDIO_PROJECT_ID` and `PUBLIC_SANITY_STUDIO_DATASET` already wired. |

### Decision Impact Analysis

**Implementation Sequence:**
1. Reconfigure starter (remove React/Vercel, add Tailwind v4 via `@tailwindcss/vite`, set `output: 'static'`)
2. Initialize shadcn CLI + fulldev/ui registry (`components.json`), install base UI primitives, set up Tailwind v4 CSS-first theme with shadcn CSS variables + NJIT brand tokens in `global.css`
3. Create `defineBlock` helper + shared base schema
4. Build document schemas (page, sponsor, project, team, event, siteSettings)
5. Build block schemas (P0 first, then P1, then P2)
6. Build matching Astro block components with BlockRenderer
7. Build layout (nav, footer, mobile nav, breadcrumb)
8. Build page templates (`[...slug].astro`, sponsor/project detail pages)
9. Configure GitHub Actions deploy
10. Configure Sanity webhook
11. Add forms + migrate to Cloudflare Pages

**Cross-Component Dependencies:**
- `defineBlock` helper must exist before any block schema
- fulldev/ui primitives + shadcn CSS variables and Tailwind v4 theme in `global.css` must exist before any block component
- BlockRenderer must be updated each time a new block is added
- Page schema must reference all block types in its `blocks[]` array
- GROQ queries must project all fields consumed by block components

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

12 areas where AI agents could make incompatible choices, organized by impact.

### Naming Patterns

**Sanity Schema Naming:**
- Block type names: `camelCase` — e.g., `heroBanner`, `featureGrid`, `ctaBanner`, `faqSection`
- Document type names: `camelCase` — e.g., `sponsor`, `project`, `team`, `siteSettings`
- Field names: `camelCase` — e.g., `backgroundVariant`, `maxWidth`, `ctaButtons`
- Schema file names: `kebab-case.ts` — e.g., `hero-banner.ts`, `feature-grid.ts`, `site-settings.ts`

**Astro Component Naming:**
- Component files: `PascalCase.astro` — e.g., `HeroBanner.astro`, `FeatureGrid.astro`, `BlockRenderer.astro`
- Block components directory: `src/components/blocks/`
- Layout components directory: `src/components/` (top-level for shared layout pieces)
- Utility files: `camelCase.ts` — e.g., `sanity.ts`, `image.ts`

**CSS/Tailwind v4 Naming:**
- CSS custom properties: `--{category}-{name}` following shadcn convention — e.g., `--background`, `--primary`, `--muted-foreground`
- Theme tokens defined in `global.css` via `@theme` block (Tailwind v4 CSS-first configuration)
- No arbitrary Tailwind values (e.g., `bg-[#ff0000]`) — always use design tokens
- Responsive prefixes: mobile-first, use `md:` and `lg:` breakpoints

### Structure Patterns

**Sanity Studio (`studio/`):**
```
studio/src/schemaTypes/
  blocks/           # Block object schemas (one file per block)
    hero-banner.ts
    feature-grid.ts
    ...
  documents/        # Document schemas
    page.ts
    sponsor.ts
    ...
  objects/          # Shared object types (SEO, base block fields, etc.)
    block-base.ts
    seo.ts
    ...
  helpers/          # Schema utilities
    defineBlock.ts
  index.ts          # Schema registry — exports schemaTypes array
```

**Astro App (`astro-app/`):**
```
astro-app/src/
  components/
    ui/             # fulldev/ui primitives (installed via shadcn CLI, owned code)
      button.astro
      accordion.astro
      badge.astro
      card.astro
      input.astro
      ...             # Added as needed: npx shadcn@latest add @fulldev/{name}
    blocks/         # One .astro file per block (matches schema 1:1, composes from ui/)
      HeroBanner.astro
      FeatureGrid.astro
      ...
    BlockRenderer.astro
    Header.astro
    Footer.astro
    MobileNav.astro
    Breadcrumb.astro
  layouts/
    Layout.astro    # Base HTML layout
  lib/
    sanity.ts       # Sanity client + ALL GROQ queries
    image.ts        # Image URL builder helpers
  pages/
    index.astro
    [...slug].astro
    sponsors/
      index.astro
      [slug].astro
    projects/
      index.astro
  styles/
    global.css      # Tailwind imports + shadcn CSS variables
```

**Key rule:** Every block has exactly 2 files — one schema in `studio/src/schemaTypes/blocks/`, one component in `astro-app/src/components/blocks/`. Plus a registration line in `BlockRenderer.astro` and `schemaTypes/index.ts`. Block components compose from fulldev/ui primitives in `src/components/ui/` — they do NOT reimplement buttons, accordions, inputs, etc.

### Format Patterns

**Sanity Schema Format (every block):**
```typescript
// studio/src/schemaTypes/blocks/hero-banner.ts
import { defineBlock } from '../helpers/defineBlock'

export const heroBanner = defineBlock({
  name: 'heroBanner',
  title: 'Hero Banner',
  fields: [
    // Block-specific fields only — base fields added by defineBlock
  ],
})
```

**Astro Component Format (every block):**
```astro
---
// astro-app/src/components/blocks/HeroBanner.astro
import type { HeroBannerBlock } from '../../lib/sanity'
import { Button } from '../ui/button'  // fulldev/ui primitives

interface Props {
  block: HeroBannerBlock
}

const { block } = Astro.props
// Destructure base fields for wrapper
const { backgroundVariant = 'white', spacing = 'default', maxWidth = 'default' } = block
---

<section
  class:list={[
    'block-wrapper',
    `bg-${backgroundVariant}`,
    `spacing-${spacing}`,
    `max-w-${maxWidth}`,
  ]}
>
  <!-- Block content composing fulldev/ui primitives + Tailwind utilities -->
  {block.buttons?.map((btn) => (
    <Button variant={btn.variant}>{btn.text}</Button>
  ))}
</section>

<script>
  // Only if block requires interactivity
  // Data-attribute driven, event delegation pattern
</script>
```

**BlockRenderer Pattern:**
```astro
---
import HeroBanner from './blocks/HeroBanner.astro'
import FeatureGrid from './blocks/FeatureGrid.astro'
// ... all block imports

interface Props {
  blocks: any[]
}

const { blocks } = Astro.props
---

{blocks.map((block) => (
  block._type === 'heroBanner' ? <HeroBanner block={block} /> :
  block._type === 'featureGrid' ? <FeatureGrid block={block} /> :
  null
))}
```

**GROQ Query Pattern:**
```typescript
// All queries in src/lib/sanity.ts
// Every page query follows this shape:
const pageQuery = groq`
  *[_type == "page" && slug.current == $slug][0]{
    title,
    slug,
    seo,
    blocks[]{
      _type,
      _key,
      // Base fields (always included)
      backgroundVariant,
      spacing,
      maxWidth,
      // Type-specific projections
      _type == "heroBanner" => {
        heading,
        subheading,
        buttons,
        backgroundImage
      },
      _type == "featureGrid" => {
        heading,
        items
      }
    }
  }
`
```

### Process Patterns

**Adding a New Block (checklist for any agent):**
1. Create schema file: `studio/src/schemaTypes/blocks/{block-name}.ts` using `defineBlock`
2. Register in `studio/src/schemaTypes/index.ts`
3. Install any needed fulldev/ui primitives: `npx shadcn@latest add @fulldev/{name}` (if not already in `src/components/ui/`)
4. Create component: `astro-app/src/components/blocks/{BlockName}.astro` (composing from `ui/` primitives)
5. Add import + conditional in `BlockRenderer.astro`
6. Add GROQ projection in the page query in `src/lib/sanity.ts`
7. Add type to page schema's `blocks[]` array `of` list

**Vanilla JS Pattern (interactive blocks):**
```html
<script>
  document.querySelectorAll('[data-{block}-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      // Toggle data attributes, not CSS classes
      const target = document.getElementById(trigger.dataset.{block}Target)
      if (target) {
        const isOpen = target.dataset.state === 'open'
        target.dataset.state = isOpen ? 'closed' : 'open'
        trigger.setAttribute('aria-expanded', String(!isOpen))
      }
    })
  })
</script>
```
- Always use `data-*` attributes for state, not CSS class toggling
- Always include `aria-expanded`, `aria-controls`, `aria-hidden` as appropriate
- Always use `querySelectorAll` scoped to `[data-{block}-*]` attributes
- Never use `document.getElementById` without a data-attribute guard

**Image Handling Pattern:**
```typescript
// Always use the image helper — never construct URLs manually
import { urlFor } from '../lib/image'
// Always provide width, height, and alt
<img
  src={urlFor(image).width(800).height(400).format('webp').url()}
  alt={image.alt || ''}
  width={800}
  height={400}
  loading="lazy"
/>
```

### Enforcement Guidelines

**All AI Agents MUST:**
- Use `defineBlock` for every block schema — never raw `defineType` for blocks
- Include all three base fields (backgroundVariant, spacing, maxWidth) in every block component's wrapper
- Use fulldev/ui primitives from `src/components/ui/` for standard UI elements (buttons, badges, cards, inputs, accordions, etc.) — never hand-roll these
- Install new fulldev/ui components via `npx shadcn@latest add @fulldev/{name}` — never copy/paste from external sources
- Add ARIA attributes to all interactive elements
- Use the image helper for all Sanity images — never construct CDN URLs manually
- Place all GROQ queries in `src/lib/sanity.ts` — never inline queries in page/component files
- Follow the exact file naming conventions (kebab-case schemas, PascalCase components)

**Anti-Patterns (never do this):**
- Arbitrary Tailwind values (`bg-[#cc0000]`) — use design tokens
- Inline styles — use Tailwind utilities
- React/JSX in `astro-app/` — use `.astro` only
- Hand-rolling UI primitives (buttons, inputs, cards, etc.) — use fulldev/ui from `src/components/ui/`
- Nested blocks (block containing another block array)
- Runtime API calls to Sanity — all data at build time
- CSS class toggling for JS state — use `data-*` attributes

## Project Structure & Boundaries

### Complete Project Directory Structure

```
astro-shadcn-sanity/
├── package.json                    # Root monorepo config (npm workspaces)
├── .gitignore
├── README.md
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Pages deploy (deferred)
│
├── astro-app/                      # Frontend workspace
│   ├── package.json
│   ├── astro.config.mjs            # output: 'static', @tailwindcss/vite plugin, @sanity/astro
│   ├── components.json             # shadcn CLI config with @fulldev registry
│   ├── tsconfig.json
│   ├── .env                        # PUBLIC_SANITY_STUDIO_PROJECT_ID, PUBLIC_SANITY_STUDIO_DATASET
│   ├── .env.example
│   ├── .storybook/
│   │   ├── main.ts                 # storybook-astro framework config
│   │   └── preview.ts              # Global CSS import for Storybook
│   ├── public/
│   │   └── fonts/                  # NJIT brand font (if not system stack)
│   └── src/
│       ├── components/
│       │   ├── blocks/             # Block components (1:1 with Sanity schemas)
│       │   │   ├── HeroBanner.astro          # FR22
│       │   │   ├── FeatureGrid.astro         # FR23
│       │   │   ├── SponsorCards.astro         # FR24
│       │   │   ├── RichText.astro             # FR25
│       │   │   ├── CtaBanner.astro            # FR26
│       │   │   ├── FaqSection.astro           # FR27
│       │   │   ├── ContactForm.astro          # FR28 (deferred)
│       │   │   ├── Timeline.astro             # FR29
│       │   │   ├── LogoCloud.astro            # FR30
│       │   │   ├── StatsRow.astro             # P0 (promoted from P1)
│       │   │   ├── TeamGrid.astro             # P0 (promoted from P1)
│       │   │   ├── TextWithImage.astro        # P0 (promoted from P1)
│       │   │   ├── TabbedContent.astro        # P1
│       │   │   ├── Testimonials.astro         # P1
│       │   │   ├── DataTable.astro            # P1
│       │   │   ├── ImageGallery.astro         # P2
│       │   │   ├── VideoEmbed.astro           # P2
│       │   │   └── AlertNotice.astro          # P2
│       │   ├── BlockRenderer.astro   # Dispatch: _type → component
│       │   ├── Header.astro          # FR31
│       │   ├── Footer.astro          # FR34
│       │   ├── MobileNav.astro       # FR32
│       │   └── Breadcrumb.astro      # FR33
│       ├── layouts/
│       │   └── Layout.astro          # Base HTML, <head>, nav, footer, SEO meta
│       ├── lib/
│       │   ├── sanity.ts             # Sanity client + ALL GROQ queries + types
│       │   └── image.ts              # urlFor() helper wrapping @sanity/image-url
│       ├── pages/
│       │   ├── index.astro           # Homepage (page builder)
│       │   ├── [...slug].astro       # Dynamic catch-all for CMS pages
│       │   ├── sponsors/
│       │   │   ├── index.astro       # Sponsor listing (FR8)
│       │   │   └── [slug].astro      # Sponsor detail (FR9)
│       │   └── projects/
│       │       └── index.astro       # Project showcase (FR12)
│       └── styles/
│           └── global.css            # @import "tailwindcss" + @theme block + shadcn CSS variables + NJIT brand tokens (Tailwind v4 CSS-first config)
│
└── studio/                          # Sanity Studio workspace
    ├── package.json
    ├── sanity.config.ts              # Studio config (structureTool, visionTool)
    ├── sanity.cli.ts
    ├── tsconfig.json
    ├── .env                          # SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET
    └── src/
        └── schemaTypes/
            ├── index.ts              # Schema registry (exports schemaTypes[])
            ├── helpers/
            │   └── defineBlock.ts    # Block schema helper (merges base fields)
            ├── objects/
            │   ├── block-base.ts     # Shared base fields (background, spacing, maxWidth)
            │   ├── seo.ts            # SEO object (metaTitle, metaDescription, ogImage)
            │   ├── button.ts         # Reusable button object (text, url, variant)
            │   └── portable-text.ts  # Rich text configuration
            ├── documents/
            │   ├── page.ts           # FR1-FR5: Composable pages with blocks[]
            │   ├── sponsor.ts        # FR6-FR9: Sponsor profiles
            │   ├── project.ts        # FR10-FR13: Capstone projects
            │   ├── team.ts           # FR11: Student teams
            │   ├── event.ts          # FR14-FR16: Program events
            │   ├── submission.ts     # FR17-FR20: Form submissions (deferred)
            │   └── site-settings.ts  # FR40: Global config singleton
            └── blocks/
                ├── hero-banner.ts     # FR22
                ├── feature-grid.ts    # FR23
                ├── sponsor-cards.ts   # FR24
                ├── rich-text.ts       # FR25
                ├── cta-banner.ts      # FR26
                ├── faq-section.ts     # FR27
                ├── contact-form.ts    # FR28 (deferred)
                ├── timeline.ts        # FR29
                ├── logo-cloud.ts      # FR30
                ├── stats-row.ts       # P0 (promoted from P1)
                ├── team-grid.ts       # P0 (promoted from P1)
                ├── text-with-image.ts # P0 (promoted from P1)
                ├── tabbed-content.ts   # P1
                ├── testimonials.ts     # P1
                ├── data-table.ts       # P1
                ├── image-gallery.ts    # P2
                ├── video-embed.ts      # P2
                └── alert-notice.ts     # P2
```

### Architectural Boundaries

**CMS ↔ Frontend Boundary:**
- Sanity Studio (`studio/`) and Astro app (`astro-app/`) are completely isolated workspaces
- The only shared contract is the GROQ query shape defined in `astro-app/src/lib/sanity.ts`
- Schema changes in `studio/` must be reflected in GROQ projections and component props in `astro-app/`
- No code is shared between workspaces — no symlinks, no shared packages

**Build-Time Data Boundary:**
- All Sanity data crosses into Astro at build time only via `sanity.fetch()` calls in `src/lib/sanity.ts`
- Page files (`pages/*.astro`) call query functions from `lib/sanity.ts` in their frontmatter
- Block components receive data as props — they never fetch data themselves
- No runtime API calls cross this boundary

**Component Boundaries:**
- `Layout.astro` owns `<head>`, global nav, and footer. Pages slot into it.
- `BlockRenderer.astro` is the single entry point for all block rendering. Pages pass `blocks[]` to it.
- Block components (`src/components/blocks/`) are leaf nodes — they receive props and render HTML. No upward communication. They compose from fulldev/ui primitives (`src/components/ui/`).
- UI primitives (`src/components/ui/`) are generic, reusable, data-agnostic. They know nothing about Sanity or block schemas. Block components adapt Sanity data into primitive props.
- Layout components (Header, Footer, MobileNav, Breadcrumb) receive site settings as props from Layout.

### Requirements to Structure Mapping

**Page Composition (FR1-FR5):**
- Schema: `studio/src/schemaTypes/documents/page.ts`
- Renderer: `astro-app/src/components/BlockRenderer.astro`
- Pages: `astro-app/src/pages/[...slug].astro`

**Sponsor Management (FR6-FR9):**
- Schema: `studio/src/schemaTypes/documents/sponsor.ts`
- Pages: `astro-app/src/pages/sponsors/index.astro`, `[slug].astro`
- Block: `SponsorCards.astro` + `sponsor-cards.ts`

**Project & Team Management (FR10-FR13):**
- Schemas: `studio/src/schemaTypes/documents/project.ts`, `team.ts`
- Page: `astro-app/src/pages/projects/index.astro`
- Cross-refs resolved in GROQ queries in `lib/sanity.ts`

**Program Information (FR14-FR16):**
- Schema: `studio/src/schemaTypes/documents/event.ts`
- Block: `Timeline.astro` + `timeline.ts`

**Forms (FR17-FR21) — Deferred:**
- Schema: `studio/src/schemaTypes/documents/submission.ts`
- Block: `ContactForm.astro` + `contact-form.ts`
- Requires: Cloudflare Worker (not yet created), hosting migration

**SEO (FR35-FR37):**
- Object: `studio/src/schemaTypes/objects/seo.ts`
- Rendered in: `astro-app/src/layouts/Layout.astro` `<head>`
- Sitemap: `@astrojs/sitemap` in `astro.config.mjs`

**Navigation & Layout (FR31-FR34, FR40):**
- Schema: `studio/src/schemaTypes/documents/site-settings.ts`
- Components: `Header.astro`, `Footer.astro`, `MobileNav.astro`, `Breadcrumb.astro`
- Consumed in: `Layout.astro` (fetches siteSettings, passes as props)

### Data Flow

```
Sanity Studio (content editing)
      ↓ publish
Sanity Content Lake (hosted)
      ↓ webhook (deferred) → GitHub Actions rebuild
Astro Build (npm run build)
      ↓ sanity.fetch() via GROQ
      ↓ BlockRenderer dispatches to block components
      ↓ Static HTML generated
GitHub Pages (served to visitors)
```

### Integration Points

**External Integrations:**
- Sanity Content Lake — GROQ queries at build time (`lib/sanity.ts`)
- Sanity Image CDN — responsive images via `@sanity/image-url` (`lib/image.ts`)
- fulldev/ui — component registry at `https://ui.full.dev/r/{name}.json`, installed via shadcn CLI at dev time (not a runtime dependency)
- Storybook — native Astro component development via `storybook-astro` (devDependency, `.storybook/` config)
- GitHub Actions — CI/CD pipeline (`.github/workflows/deploy.yml`, deferred)
- GA4 — async script in `Layout.astro` (FR38)
- Monsido — async script in `Layout.astro` (FR39)
- Cloudflare Worker — form proxy (deferred to forms phase)

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:**
All technology choices are compatible. Astro 5.x SSG + Sanity + Tailwind v4 + fulldev/ui + vanilla JS is a well-trodden combination. No version conflicts — Astro 5.x works with `@sanity/astro`, Tailwind CSS v4 (via `@tailwindcss/vite`), fulldev/ui (pure `.astro` components via shadcn CLI), and TypeScript 5.x. The `output: 'static'` mode (which now includes the old hybrid rendering capability) eliminates any adapter complexity. fulldev/ui adds zero runtime cost — components are vanilla Astro, no framework dependencies.

**Pattern Consistency:**
Naming conventions are coherent — camelCase for Sanity (schema types, field names), PascalCase for Astro components, kebab-case for schema files. All patterns align with their respective ecosystem conventions. The `defineBlock` helper enforces the shared base schema pattern consistently.

**Structure Alignment:**
The monorepo structure cleanly separates concerns. The 1:1 mapping between schema files and component files makes the architecture predictable. BlockRenderer is the single integration seam between data and presentation.

### Requirements Coverage Validation

**Functional Requirements Coverage:**

| FR Range | Coverage | Status |
|---|---|---|
| FR1-FR5 (Page Composition) | page.ts + BlockRenderer + [...slug].astro | Covered |
| FR6-FR9 (Sponsor Management) | sponsor.ts + SponsorCards + sponsor pages | Covered |
| FR10-FR13 (Project/Team) | project.ts + team.ts + project pages + GROQ cross-refs | Covered |
| FR14-FR16 (Program Info) | event.ts + Timeline block | Covered |
| FR17-FR21 (Forms) | submission.ts + ContactForm + CF Worker | Deferred (by design) |
| FR22-FR30 (P0 Blocks) | 12 P0 block schemas + 12 Astro components (9 original + statsRow, teamGrid, textWithImage promoted) | Covered |
| FR31-FR34 (Navigation/Layout) | Header, Footer, MobileNav, Breadcrumb + Layout.astro | Covered |
| FR35-FR37 (SEO) | seo.ts object + Layout.astro `<head>` + @astrojs/sitemap | Covered |
| FR38-FR39 (Analytics) | GA4 + Monsido async scripts in Layout.astro | Covered |
| FR40 (Site Config) | site-settings.ts singleton | Covered |

40/40 FRs covered (5 deferred by design to forms phase).

**Non-Functional Requirements Coverage:**

| NFR Area | Architectural Support | Status |
|---|---|---|
| Performance (NFR1-8) | SSG (zero JS runtime), Tailwind purge, <5KB JS budget, Sanity CDN images | Covered |
| Security (NFR9-12) | Token isolation via CF Worker (deferred), no client-side PII, CSP meta tags | Covered |
| Accessibility (NFR13-19) | ARIA patterns in all interactive blocks, enforced alt text in schemas, skip-link in Layout | Covered |
| Integration (NFR20-24) | Build-time only fetching, GA4/Monsido async loading | Covered |
| Maintainability (NFR25-28) | 2-file block pattern (schema + component composing fulldev/ui primitives), TypeScript schemas, consistent conventions | Covered |

### Implementation Readiness Validation

**Decision Completeness:**
All critical decisions are documented with specific choices and rationale. Technology versions are specified. No ambiguous "TBD" decisions remain for the MVP scope.

**Structure Completeness:**
Every file in the target structure is named and mapped to a specific requirement. No placeholder directories.

**Pattern Completeness:**
Code examples provided for schema format, component format, BlockRenderer pattern, GROQ query pattern, vanilla JS pattern, and image handling. Anti-patterns explicitly listed.

### Gap Analysis Results

No critical gaps found.

**Important gaps (non-blocking):**
1. NJIT brand colors not yet defined — exact hex values needed for Tailwind theme config. Can be determined during implementation.
2. Portable Text serializers — the `astro-portabletext` configuration for callout boxes and inline images isn't specified in detail. Can be defined when building the RichText block.
3. Sponsor Cards filtering — client-side filtering (by tier/industry) is deferred to Phase 2 per PRD. Architecture supports it (vanilla JS + data attributes).

**Nice-to-have gaps:**
1. Testing strategy — no test framework specified. Could add Playwright for E2E Lighthouse audits later.
2. Content seeding — no strategy for initial seed data in Sanity. Can be done manually via Studio.

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Formulaic block pattern (schema + component composing fulldev/ui primitives + registration) makes implementation highly parallelizable
- fulldev/ui provides accessible, pre-built Astro primitives — eliminates manual porting of shadcn patterns while maintaining zero framework runtime
- Zero-runtime constraint eliminates entire categories of architectural complexity
- Clear boundaries between CMS and frontend workspaces (ui/ primitives → blocks/ composition → BlockRenderer dispatch)
- Every requirement explicitly mapped to files and directories

**Areas for Future Enhancement:**
- Testing framework (Playwright/Vitest) when CI/CD is configured
- Content seeding strategy for onboarding
- Detailed Portable Text serializer spec (during RichText block implementation)
- Client-side filtering patterns (Phase 2)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
Reconfigure the starter — remove React/Vercel adapter, add Tailwind v4 via `@tailwindcss/vite`, set `output: 'static'`, initialize shadcn CLI with fulldev/ui `@fulldev` registry (`components.json`), install base UI primitives, create directory structure, set up shadcn CSS variables and NJIT brand tokens in `global.css` (CSS-first configuration, no `tailwind.config.mjs`).
