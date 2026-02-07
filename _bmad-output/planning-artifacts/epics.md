---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - '/home/jay/github/astro-shadcn-sanity/_bmad-output/planning-artifacts/prd.md'
  - '/home/jay/github/astro-shadcn-sanity/_bmad-output/planning-artifacts/architecture.md'
---

# astro-shadcn-sanity - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for astro-shadcn-sanity, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Page Composition & Content Management**
- FR1: Content editors can create new pages by selecting and arranging blocks from the block library
- FR2: Content editors can reorder, add, and remove blocks on any page without developer assistance
- FR3: Content editors can configure each block's background variant, spacing, and max-width from constrained presets
- FR4: Content editors can preview page content before publishing
- FR5: Content editors can publish changes that trigger automated site rebuild and deployment

**Sponsor Management**
- FR6: Content editors can create and manage sponsor profiles (name, logo, description, website, industry, tier)
- FR7: Content editors can mark sponsors as featured for homepage prominence
- FR8: Site visitors can browse all sponsors in a card-based layout
- FR9: Site visitors can view individual sponsor detail pages with description, logo, website, and associated projects

**Project & Team Management**
- FR10: Content editors can create project records (title, description, sponsor ref, technology tags, team ref, semester, status)
- FR11: Content editors can create team records (member names, roles, photos, LinkedIn, project ref, advisor ref)
- FR12: Site visitors can browse projects with sponsor, team, and technology details
- FR13: Site visitors can navigate between related content (sponsor -> projects -> teams) via cross-references

**Program Information**
- FR14: Content editors can manage program events (title, date, location, description, type)
- FR15: Site visitors can view a timeline of milestones with current/completed/upcoming status indicators
- FR16: Content editors can update program dates and milestones each semester

**Sponsor Inquiry & Contact**
- FR17: Site visitors can submit a sponsor inquiry form (name, organization, email, message)
- FR18: Form input is validated before submission
- FR19: Form submissions are stored as documents in Sanity via secure server-side proxy
- FR20: Content editors can view and manage all form submissions in Sanity Studio
- FR21: Site visitors receive visual confirmation after successful form submission

**Block Library (P0)**
- FR22: Hero Banner blocks render with heading, subheading, optional background image, CTA buttons, and configurable alignment
- FR23: Feature Grid blocks render with icon/image + title + description cards in configurable column layouts
- FR24: Sponsor Cards blocks render from sponsor documents with tier badges
- FR25: Rich Text blocks render from Portable Text with inline images and callout boxes
- FR26: CTA Banner blocks render with heading, description, and action buttons
- FR27: FAQ Accordion blocks render with expandable question/answer pairs and keyboard accessibility
- FR28: Contact Form blocks render with configurable fields and server-side submission
- FR29: Timeline blocks render with date-ordered milestones and current-phase highlighting
- FR30: Logo Cloud blocks render from sponsor document logos

**Site Navigation & Layout**
- FR31: Persistent header navigation menu across all pages
- FR32: Slide-out navigation drawer for mobile devices
- FR33: Breadcrumb navigation on interior pages
- FR34: Site footer with key links and information

**SEO & Discoverability**
- FR35: Content editors can set per-page SEO metadata (title, description, Open Graph image)
- FR36: Sitemap generated for search engine crawlers
- FR37: Semantic HTML with proper heading hierarchy and landmark regions

**Analytics & Monitoring**
- FR38: Page views and visitor behavior tracked via GA4
- FR39: Accessibility compliance monitored via Monsido

**Site Configuration**
- FR40: Content editors can manage global site settings (site name, logo, navigation, footer, social links, current semester) from a single settings document

### NonFunctional Requirements

**Performance**
- NFR1: Lighthouse Performance score 95+ on mobile and desktop
- NFR2: First Contentful Paint under 1.0s on 4G connections
- NFR3: Largest Contentful Paint under 2.0s on 4G connections
- NFR4: Total Blocking Time under 100ms — no framework runtime
- NFR5: Cumulative Layout Shift under 0.05
- NFR6: Page JavaScript payload under 5KB minified (excluding third-party analytics)
- NFR7: CSS payload under 15KB after Tailwind purge
- NFR8: Static build under 60 seconds; full CI/CD pipeline under 3 minutes

**Security**
- NFR9: Sanity write token never exposed to client — form submissions route through Cloudflare Worker
- NFR10: Contact form includes honeypot field and rate limiting
- NFR11: HTTPS with security headers (CSP, X-Frame-Options, X-Content-Type-Options)
- NFR12: No user credentials or PII stored client-side

**Accessibility**
- NFR13: WCAG 2.1 AA compliance on all pages
- NFR14: Lighthouse Accessibility score 90+ on all page types
- NFR15: All interactive elements keyboard navigable with visible focus indicators
- NFR16: All images require descriptive alt text (enforced via Sanity schema)
- NFR17: Color contrast meets AA minimums (4.5:1 normal text, 3:1 large text) across all background variants
- NFR18: Screen reader compatibility verified for all block types and navigation
- NFR19: Skip-to-content link on every page

**Integration**
- NFR20: Sanity content fetched exclusively at build time — zero runtime API calls
- NFR21: Build-time Sanity API usage under 10% of free tier (100K requests/month)
- NFR22: Cloudflare Worker handles up to 100 form submissions/day within free tier
- NFR23: GA4 loads asynchronously, does not block page rendering
- NFR24: Monsido operates without impacting performance metrics

**Maintainability**
- NFR25: Adding a new block requires exactly 2 files (Sanity schema + Astro component composing fulldev/ui primitives) plus BlockRenderer registration
- NFR26: All Sanity schemas use TypeScript for type safety
- NFR27: Block components follow consistent patterns: shared base schema inheritance, Tailwind utilities, data-attribute driven JS
- NFR28: Zero external JS framework dependencies (no React, Vue, Alpine runtime)

### Additional Requirements

**From Architecture — Starter Template & Project Setup:**
- Project initialized from `sanity-template-astro-clean` starter — requires reconfiguration: remove React/Vercel adapter, add Tailwind v4 via `@tailwindcss/vite`, initialize shadcn CLI with fulldev/ui `@fulldev` registry, set `output: 'static'`
- Monorepo structure: `astro-app/` (frontend) + `studio/` (Sanity Studio) as npm workspaces
- Node.js 24+ required for CI/CD and local dev
- Environment config via `.env` files (already wired by starter)

**From Architecture — Schema & Data Patterns:**
- `defineBlock` helper function wraps `defineType` and merges shared base fields (background, spacing, maxWidth) into every block schema
- 7 document types + 17 block types in target schema
- Sanity schema validation via `defineField` with `validation: (Rule) => ...`
- All GROQ queries centralized in `src/lib/sanity.ts` — never inline
- TypeScript throughout: Sanity schemas with `defineType`/`defineField`, Astro components with typed props, GROQ results typed

**From Architecture — Frontend Patterns:**
- BlockRenderer uses explicit imports + conditional rendering (`block._type === 'x' ? <X /> : ...`)
- CSS architecture: fulldev/ui components ([ui.full.dev](https://ui.full.dev)) + shadcn CSS variables + Tailwind v4 utilities, NJIT brand colors mapped to tokens in `global.css` (CSS-first configuration, no `tailwind.config.mjs`)
- No arbitrary Tailwind values — always use design tokens
- Vanilla JS: inline `<script>` in `.astro` components, data-attribute driven event delegation
- `.astro` files only in frontend — no `.tsx`/`.jsx` (React only in `studio/`). fulldev/ui components are pure `.astro`
- File-based routing + `[...slug].astro` catch-all for CMS pages

**From Architecture — Image Pipeline:**
- Sanity CDN with `@sanity/image-url` for responsive `srcset` and WebP/AVIF format negotiation
- `urlFor()` helper in `lib/image.ts` — never construct CDN URLs manually
- All images require width, height, alt, and `loading="lazy"`

**From Architecture — Infrastructure & Deployment:**
- GitHub Pages for initial hosting (pure `output: 'static'`)
- GitHub Actions CI/CD (deferred until blocks built)
- Sanity webhook → `repository_dispatch` for content-triggered rebuilds (deferred)
- Migration path to Cloudflare Pages when forms are implemented (adds `@astrojs/cloudflare` adapter + Worker)

**From Architecture — Block Development Process:**
- Adding a new block requires exactly 7 steps: (1) schema file, (2) register in index.ts, (3) install needed fulldev/ui primitives via `npx shadcn@latest add @fulldev/{name}`, (4) Astro component (composing from `ui/` primitives), (5) add to BlockRenderer, (6) add GROQ projection, (7) add type to page schema's `blocks[]` array
- Interactive blocks use data-attribute state, ARIA attributes, and `querySelectorAll` scoped to `[data-{block}-*]`

**From Architecture — Anti-Patterns (enforcement):**
- No arbitrary Tailwind values (e.g., `bg-[#ff0000]`)
- No inline styles — use Tailwind utilities
- No React/JSX in `astro-app/` — fulldev/ui components are pure `.astro`
- No nested blocks (block containing another block array)
- No runtime API calls to Sanity
- No CSS class toggling for JS state — use `data-*` attributes

### FR Coverage Map

- FR1: Epic 2 - Page composition (create pages from blocks)
- FR2: Epic 2 - Page composition (reorder/add/remove blocks)
- FR3: Epic 2 - Page composition (configure block presets)
- FR4: Epic 2 - Page composition (preview before publish)
- FR5: Epic 2 - Page composition (publish triggers rebuild)
- FR6: Epic 3 - Sponsor profiles (create/manage)
- FR7: Epic 3 - Sponsor profiles (featured flag)
- FR8: Epic 3 - Sponsor browsing (card layout)
- FR9: Epic 3 - Sponsor detail pages
- FR10: Epic 4 - Project records (create/manage)
- FR11: Epic 4 - Team records (create/manage)
- FR12: Epic 4 - Project browsing (visitor view)
- FR13: Epic 4 - Cross-reference navigation (sponsor/project/team)
- FR14: Epic 4 - Program events (create/manage)
- FR15: Epic 4 - Timeline with status indicators
- FR16: Epic 4 - Semester date updates
- FR17: Epic 6 - Sponsor inquiry form submission
- FR18: Epic 6 - Form input validation
- FR19: Epic 6 - Form submissions stored in Sanity via proxy
- FR20: Epic 6 - Form submissions management in Studio
- FR21: Epic 6 - Visual confirmation after submission
- FR22: Epic 2 - Hero Banner block
- FR23: Epic 2 - Feature Grid block
- FR24: Epic 3 - Sponsor Cards block
- FR25: Epic 2 - Rich Text block
- FR26: Epic 2 - CTA Banner block
- FR27: Epic 2 - FAQ Accordion block
- FR28: Epic 6 - Contact Form block
- FR29: Epic 4 - Timeline block
- FR30: Epic 2 - Logo Cloud block
- FR31: Epic 1 - Header navigation
- FR32: Epic 1 - Mobile navigation drawer
- FR33: Epic 1 - Breadcrumb navigation
- FR34: Epic 1 - Site footer
- FR35: Epic 5 - Per-page SEO metadata
- FR36: Epic 5 - Sitemap generation
- FR37: Epic 5 - Semantic HTML (heading hierarchy, landmarks)
- FR38: Epic 5 - GA4 analytics
- FR39: Epic 5 - Monsido accessibility monitoring
- FR40: Epic 1 - Global site settings

## Epic List

### Epic 1: Site Foundation & Navigation
Content editors can manage site-wide settings, and visitors see a branded, navigable site shell with responsive header, footer, mobile drawer, and breadcrumbs. All frontend components and pages migrated from reference implementation; Storybook configured for component development.
**FRs covered:** FR31, FR32, FR33, FR34, FR40
**Notes:** Includes starter reconfiguration (done), reference project migration (12 blocks, 30+ UI components, 5 pages, layout), schema infrastructure (`defineBlock` helper, shared objects, foundational document schemas), and Storybook setup via `storybook-astro`. This is the chassis everything else mounts on.
**Change Log (2026-02-07):** Stories restructured per Sprint Change Proposal. Story 1.2 replaced with reference project migration. Original 1.3/1.4 (layout, mobile nav) absorbed into migration. New 1.3 (schema infrastructure, renumbered). New 1.4 (Storybook setup).

### Epic 2: Sanity Integration
Sanity block schemas, document schemas, and GROQ queries wired to the migrated frontend components. Content editors can compose pages from blocks in Sanity Studio. All placeholder data replaced with CMS-driven content.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR22, FR23, FR25, FR26, FR27, FR30
**Notes:** Frontend block components already exist from Epic 1 migration. This epic focuses exclusively on the Sanity schema layer, GROQ queries, and page composition system. Covers all 12 P0 block schemas.
**Change Log (2026-02-07):** Epic refocused per Sprint Change Proposal. Original 4 stories (page composition, hero+CTA, richtext+grid, FAQ+logo) replaced with 3 stories (block schemas, GROQ queries, page composition). Frontend build work eliminated — already migrated in Epic 1.

### Epic 3: Sponsor Showcase & Discovery
Content editors can create and manage sponsor profiles with tiers and featured flags. Visitors can browse sponsors in card layouts and view individual sponsor detail pages with logos, descriptions, and websites.
**FRs covered:** FR6, FR7, FR8, FR9, FR24
**Notes:** Sponsor Cards block renders from sponsor documents with tier badges. Detail pages at `/sponsors/[slug]`. Listing page at `/sponsors/`. Associated projects section on detail pages will show content once Epic 4 is complete, but pages function standalone.

### Epic 4: Projects, Teams & Program Timeline
Content editors can manage projects, teams, and program events. Students find team assignments, project details, and key dates. Visitors navigate between related sponsor/project/team content via cross-references.
**FRs covered:** FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR29
**Notes:** Timeline block for milestones with current/completed/upcoming status indicators. Project listing at `/projects/`. Cross-references between sponsors, projects, and teams fully resolved via GROQ queries. Builds on sponsor data from Epic 3.

### Epic 5: SEO, Analytics & Production Launch
The site is discoverable via search engines with proper metadata and sitemap. Visitor behavior is tracked with GA4. Accessibility is monitored via Monsido. Site deployed to production on GitHub Pages with CI/CD pipeline.
**FRs covered:** FR35, FR36, FR37, FR38, FR39
**Notes:** Per-page SEO fields in Sanity (metaTitle, metaDescription, ogImage), `@astrojs/sitemap`, Open Graph tags, semantic HTML validation. GA4 async script, Monsido integration. GitHub Actions deploy workflow. Security headers via meta tags (CSP, X-Frame-Options, X-Content-Type-Options).

### Epic 6: Sponsor Inquiry System (Deferred)
Prospective sponsors can submit inquiry forms with validation and receive visual confirmation. Submissions are securely stored in Sanity via server-side proxy. Admins manage submissions in Sanity Studio.
**FRs covered:** FR17, FR18, FR19, FR20, FR21, FR28
**Notes:** Requires hosting migration from GitHub Pages to Cloudflare Pages, `@astrojs/cloudflare` adapter, and Cloudflare Worker form proxy. Contact Form block with honeypot field and rate limiting. Deferred by design until all other epics are complete.

## Epic 1: Site Foundation & Navigation

Content editors can manage site-wide settings, and visitors see a branded, navigable site shell with responsive header, footer, mobile drawer, and breadcrumbs.

### Story 1.1: Reconfigure Starter & Set Up Design System

As a developer,
I want the starter template reconfigured with Tailwind v4, fulldev/ui component library, and the target directory structure,
So that all future blocks and components build on a consistent, performant foundation.

**Acceptance Criteria:**

**Given** the project is initialized from `sanity-template-astro-clean`
**When** the starter is reconfigured
**Then** `@astrojs/react`, `react`, and `react-dom` are removed from `astro-app/` dependencies
**And** `@astrojs/vercel` adapter is removed and `output` is set to `'static'` in `astro.config.mjs`
**And** Tailwind CSS v4 is installed via `@tailwindcss/vite` plugin in `astro.config.mjs` (NOT the legacy `@astrojs/tailwind`)
**And** `global.css` contains `@import "tailwindcss"` (NOT `@tailwind` directives) and shadcn CSS custom properties (`--background`, `--foreground`, `--primary`, `--muted`, etc.) via Tailwind v4 CSS-first configuration
**And** NJIT brand color tokens are defined via CSS custom properties in `global.css` (no `tailwind.config.mjs` — Tailwind v4 CSS-first configuration)
**And** shadcn CLI is initialized (`npx shadcn@latest init`) and `components.json` includes the fulldev/ui registry: `{ "registries": { "@fulldev": "https://ui.full.dev/r/{name}.json" } }`
**And** base fulldev/ui primitives are installed (e.g., `npx shadcn@latest add @fulldev/button`) into `src/components/ui/`
**And** the `astro-app/src/` directory structure matches Architecture spec: `components/ui/`, `components/blocks/`, `lib/`, `layouts/`, `pages/`, `styles/`
**And** the `studio/src/schemaTypes/` directory structure matches Architecture spec: `blocks/`, `documents/`, `objects/`, `helpers/`
**And** sample schemas (`post`, `blockContent`) from the starter are removed
**And** `npm run dev` starts both workspaces without errors
**And** `npm run build` produces a static build with zero errors

### Story 1.2: Migrate Reference Project

> **Change Log (2026-02-07):** NEW story replacing original 1.2 (Schema Infrastructure, now renumbered to 1.3). Original stories 1.3 (Layout/Header/Footer) and 1.4 (Mobile Nav/Breadcrumbs) absorbed into this migration.

As a developer,
I want the reference project's frontend components, pages, and design system migrated into astro-app,
So that all proven UI work is preserved and the project can focus on Sanity integration.

**Acceptance Criteria:**

**Given** the foundation from Story 1.1 is in place and `reference-project/` contains the source code
**When** the reference project is migrated
**Then** all block components from `reference-project/src/components/blocks/` are copied to `astro-app/src/components/blocks/` and renamed to match architecture camelCase names: `hero`→`HeroBanner`, `cta`→`CtaBanner`, `faq`→`FaqSection`, `logoBar`→`LogoCloud`, `stats`→`StatsRow`, `teamRoster`→`TeamGrid`
**And** all UI components from `reference-project/src/components/ui/` are merged into `astro-app/src/components/ui/` (preserving existing button component)
**And** `BlockRenderer.astro` is copied and updated with architecture camelCase `_type` names in all switch cases
**And** `Header.astro` and `Footer.astro` are copied to `astro-app/src/components/` (FR31, FR34)
**And** `Layout.astro` is merged with the existing one, preserving the reference project's header/footer integration and the existing global.css import
**And** all pages from `reference-project/src/pages/` are copied to `astro-app/src/pages/` (Home, About, Projects, Sponsors, Contact)
**And** `reference-project/src/lib/types.ts` is copied to `astro-app/src/lib/types.ts` with all `_type` string literals updated to architecture camelCase names
**And** `reference-project/src/lib/data/` (placeholder data) is copied to `astro-app/src/lib/data/` temporarily
**And** `reference-project/src/scripts/main.ts` is copied to `astro-app/src/scripts/main.ts`
**And** `reference-project/src/styles/global.css` is merged with the existing one, preserving NJIT brand tokens from both sources
**And** `lucide-react` and `@radix-ui/*` are NOT included in dependencies; any icon usage is replaced with `lucide-static` or inline SVGs
**And** `components.json` has `tsx: false` (Astro-only project)
**And** `@sanity/astro`, `@sanity/image-url`, and `astro-portabletext` remain as dependencies (from Story 1.1)
**And** missing dependencies from reference project's `package.json` are added to `astro-app/package.json`
**And** `npm run dev` starts without errors
**And** `npm run build` succeeds
**And** all 5 pages render correctly with placeholder data
**And** `reference-project/` directory is deleted after successful migration

### Story 1.3: Schema Infrastructure

> **Change Log (2026-02-07):** Renumbered from original 1.2. Block schema names updated to use architecture camelCase names.

As a developer,
I want the core schema helpers, shared objects, and foundational document schemas in place,
So that all future block and document schemas follow a consistent, type-safe pattern.

**Acceptance Criteria:**

**Given** the migrated frontend from Story 1.2 is in place
**When** the schema infrastructure is created
**Then** `studio/src/schemaTypes/helpers/defineBlock.ts` exports a `defineBlock` function that wraps `defineType` and merges shared base fields (backgroundVariant, spacing, maxWidth) into every block schema
**And** `studio/src/schemaTypes/objects/block-base.ts` defines the shared base fields with constrained presets (backgroundVariant: white/light/dark/primary; spacing: none/small/default/large; maxWidth: narrow/default/full)
**And** `studio/src/schemaTypes/objects/seo.ts` defines an SEO object with metaTitle (string), metaDescription (text), and ogImage (image) fields
**And** `studio/src/schemaTypes/objects/button.ts` defines a reusable button object with text (string), url (url), and variant (string) fields
**And** `studio/src/schemaTypes/objects/portable-text.ts` defines the rich text configuration
**And** `studio/src/schemaTypes/documents/page.ts` defines a page document with title, slug, seo (reference to seo object), and blocks[] array accepting all 12 P0 block types (heroBanner, featureGrid, sponsorCards, richText, ctaBanner, faqSection, contactForm, timeline, logoCloud, statsRow, teamGrid, textWithImage)
**And** `studio/src/schemaTypes/documents/site-settings.ts` defines a singleton document with siteName, logo, navigation items, footer content, social links, and currentSemester fields (FR40)
**And** all schemas are registered in `studio/src/schemaTypes/index.ts`
**And** all schemas use `defineType`/`defineField` with TypeScript and include appropriate validation rules
**And** Sanity Studio starts without schema errors

### Story 1.4: Storybook Setup

> **Change Log (2026-02-07):** NEW story. Replaces original 1.4 (Mobile Navigation & Breadcrumbs, now absorbed into Story 1.2 migration).

As a developer,
I want Storybook configured for native Astro component development and documentation,
So that UI components and blocks can be developed, tested, and showcased in isolation.

**Acceptance Criteria:**

**Given** the migrated frontend from Story 1.2 is in place
**When** Storybook is configured
**Then** `storybook-astro`, `storybook`, `@storybook/addon-docs`, and `@storybook/builder-vite` are installed as devDependencies in `astro-app/`
**And** `astro-app/.storybook/main.ts` configures the `storybook-astro` framework with stories glob pattern matching `src/**/*.stories.{ts,astro}`
**And** `astro-app/.storybook/preview.ts` imports `../src/styles/global.css` for consistent theming
**And** initial stories are created for key UI components: Button, Badge, Avatar, Accordion
**And** initial stories are created for key block components: HeroBanner, CtaBanner, FeatureGrid
**And** `astro-app/package.json` includes `"storybook": "storybook dev -p 6006"` and `"build-storybook": "storybook build"` scripts
**And** root `package.json` dev script is updated to optionally run Storybook concurrently
**And** `npm run storybook` launches Storybook on port 6006 without errors
**And** components render correctly in Storybook with working controls panel

## Epic 2: Sanity Integration

> **Change Log (2026-02-07):** Epic refocused per Sprint Change Proposal. Renamed from "Page Building with Core Content Blocks". Frontend block components already exist from Epic 1 migration. This epic focuses on Sanity schemas, GROQ queries, and page composition.

Sanity block schemas, document schemas, and GROQ queries wired to the migrated frontend components. Content editors can compose pages from blocks in Sanity Studio. All placeholder data replaced with CMS-driven content.

### Story 2.1: Core Block Schemas

> **Change Log (2026-02-07):** NEW story replacing original 2.1-2.4. Combines all block schema work into a single story since frontend components already exist.

As a developer,
I want Sanity schemas created for all 12 P0 blocks using the defineBlock pattern,
So that content editors can manage block content in Sanity Studio.

**Acceptance Criteria:**

**Given** the schema infrastructure from Story 1.3 is in place
**When** all P0 block schemas are created
**Then** the following 12 block schemas are created in `studio/src/schemaTypes/blocks/` using `defineBlock`:
  - `hero-banner.ts` — heroBanner: heading (string, required), subheading (string), backgroundImage (image with alt), ctaButtons (array of button objects), alignment (left/center/right) (FR22)
  - `feature-grid.ts` — featureGrid: heading (string), items (array of {icon/image, title, description}), columns (2/3/4) (FR23)
  - `sponsor-cards.ts` — sponsorCards: heading (string), displayMode (all/featured/manual), sponsors (array of sponsor refs) (FR24)
  - `rich-text.ts` — richText: content (portable-text with inline images, callout boxes) (FR25)
  - `cta-banner.ts` — ctaBanner: heading (string, required), description (text), ctaButtons (array of button objects) (FR26)
  - `faq-section.ts` — faqSection: heading (string), items (array of {question, answer}) (FR27)
  - `contact-form.ts` — contactForm: heading (string), description (text), successMessage (string) (FR28, deferred integration)
  - `timeline.ts` — timeline: heading (string), events (array of event refs or auto-pull flag) (FR29)
  - `logo-cloud.ts` — logoCloud: heading (string), sponsors (array of sponsor refs or auto-pull flag) (FR30)
  - `stats-row.ts` — statsRow: heading (string), stats (array of {value, label, description})
  - `team-grid.ts` — teamGrid: heading (string), members (array of team refs or inline member objects)
  - `text-with-image.ts` — textWithImage: heading (string), content (portable-text), image (image with alt), imagePosition (left/right)
**And** all 12 block schemas are registered in `studio/src/schemaTypes/index.ts`
**And** all 12 block types are added to the page schema's `blocks[]` array
**And** Sanity Studio starts without schema errors
**And** content editors can add, configure, and preview all block types in Studio

### Story 2.2: GROQ Queries & Page Data Fetching

> **Change Log (2026-02-07):** NEW story. Bridges the gap between migrated frontend (placeholder data) and Sanity CMS.

As a developer,
I want typed GROQ queries that fetch all page and block content from Sanity,
So that the migrated frontend renders CMS-driven content instead of placeholder data.

**Acceptance Criteria:**

**Given** the block schemas from Story 2.1 and migrated frontend from Story 1.2 are in place
**When** GROQ queries and data fetching are implemented
**Then** `astro-app/src/lib/sanity.ts` exports typed GROQ query functions for all page types (homepage, about, sponsors, projects, contact, generic pages)
**And** each page query projects base fields (backgroundVariant, spacing, maxWidth) plus type-specific fields for all 12 block types
**And** all 5 migrated pages are updated to fetch content from Sanity instead of importing placeholder data
**And** `astro-app/src/lib/data/` directory (placeholder data) is removed
**And** `astro-app/src/lib/types.ts` is updated to reflect Sanity query result types
**And** seed content is created in Sanity Studio for development (at minimum: homepage with 3+ blocks, one sponsor, one project)
**And** all pages render correctly from Sanity content
**And** all GROQ queries are defined in `lib/sanity.ts` — no inline queries in pages or components

### Story 2.3: Page Composition System

As a content editor,
I want to create pages by selecting, arranging, and reordering blocks from the block library in Sanity Studio,
So that I can build new pages without developer assistance.

**Acceptance Criteria:**

**Given** the block schemas from Story 2.1 and GROQ queries from Story 2.2 are in place
**When** the page composition system is fully wired
**Then** content editors can add blocks to a page from a list of all 12 P0 block types in Sanity Studio (FR1)
**And** content editors can reorder blocks via drag-and-drop in Sanity Studio (FR2)
**And** content editors can remove blocks from a page in Sanity Studio (FR2)
**And** each block in the `blocks[]` array inherits base fields (backgroundVariant, spacing, maxWidth) from `defineBlock` and editors can configure them from constrained presets (FR3)
**And** content editors can use Sanity Studio's built-in preview to review page content before publishing (FR4)
**And** content editors can publish page changes in Sanity Studio, making them available for the next site build (FR5)
**And** `BlockRenderer.astro` dispatches each block by `_type` to the correct Astro component using explicit imports and conditional rendering (already in place from migration, verified working with Sanity data)
**And** `astro-app/src/pages/[...slug].astro` dynamic catch-all route fetches pages by slug from Sanity and renders through Layout + BlockRenderer
**And** unrecognized block types render a visible placeholder in development and nothing in production

## Epic 3: Sponsor Showcase & Discovery

Content editors can create and manage sponsor profiles with tiers and featured flags. Visitors can browse sponsors in card layouts and view individual sponsor detail pages with logos, descriptions, and websites.

### Story 3.1: Sponsor Document Schema & Studio Management

As a content editor,
I want to create and manage sponsor profiles with all relevant details in Sanity Studio,
So that sponsor information is centrally managed and available for display across the site.

**Acceptance Criteria:**

**Given** the schema infrastructure from Epic 1 is in place
**When** the sponsor document schema is created
**Then** `studio/src/schemaTypes/documents/sponsor.ts` defines a document schema with fields: name (string, required), slug (slug, required, sourced from name), logo (image with alt text, required), description (text), website (url), industry (string), tier (string: platinum/gold/silver/bronze), featured (boolean, default false) (FR6, FR7)
**And** the schema includes validation rules: name is required, slug is required and unique, logo requires alt text (NFR16)
**And** the schema is registered in `studio/src/schemaTypes/index.ts`
**And** content editors can create, edit, and delete sponsor documents in Sanity Studio
**And** content editors can toggle the featured flag on any sponsor to mark it for homepage prominence (FR7)
**And** Sanity Studio starts without schema errors

### Story 3.2: Sponsor Cards Block & Listing Page

As a site visitor,
I want to browse all sponsors in a visually organized card layout with tier badges,
So that I can see which organizations support the program and understand their sponsorship level.

**Acceptance Criteria:**

**Given** the sponsor document schema from Story 3.1 is in place
**When** the Sponsor Cards block and listing page are created
**Then** `studio/src/schemaTypes/blocks/sponsor-cards.ts` defines a block schema using `defineBlock` with fields: heading (string), displayMode (string: all/featured/manual), sponsors (array of sponsor references, used when displayMode is manual) (FR24)
**And** `astro-app/src/components/blocks/SponsorCards.astro` renders sponsor documents as cards with logo, name, tier badge, and brief description (FR8)
**And** tier badges are visually distinct using Tailwind utility classes mapped to design tokens
**And** sponsor logos use `urlFor()` with responsive dimensions, alt text, and `loading="lazy"`
**And** each card links to the sponsor's detail page (`/sponsors/{slug}`)
**And** the block is registered in `schemaTypes/index.ts`, `BlockRenderer.astro`, and the page schema's `blocks[]` array
**And** the GROQ projection resolves sponsor references with name, slug, logo, tier, and description
**And** `astro-app/src/pages/sponsors/index.astro` renders a dedicated sponsor listing page that fetches all sponsors and displays them in the same card layout (FR8)
**And** the listing page uses Layout.astro and includes appropriate heading hierarchy

### Story 3.3: Sponsor Detail Pages

As a site visitor,
I want to view an individual sponsor's full profile with their logo, description, website, and associated projects,
So that I can learn more about a specific sponsor and their involvement in the program.

**Acceptance Criteria:**

**Given** the sponsor schema and listing page from Stories 3.1 and 3.2 are in place
**When** the sponsor detail pages are created
**Then** `astro-app/src/pages/sponsors/[slug].astro` renders a detail page for each sponsor using `getStaticPaths()` to generate a page per sponsor document (FR9)
**And** the detail page displays the sponsor's logo (via `urlFor()`, full size), name, description, website link (opens in new tab with `rel="noopener noreferrer"`), industry, and tier badge
**And** the page includes a section for "Associated Projects" that renders project references if they exist (populated when Epic 4 is built), or is hidden if no projects reference this sponsor
**And** the GROQ query in `lib/sanity.ts` fetches the sponsor by slug and includes a sub-query for projects that reference this sponsor (`*[_type == "project" && sponsor._ref == ^._id]`)
**And** the detail page uses Layout.astro with breadcrumb showing Home > Sponsors > {Sponsor Name}
**And** the page builds without errors for all sponsor documents in Sanity

## Epic 4: Projects, Teams & Program Timeline

Content editors can manage projects, teams, and program events. Students find team assignments, project details, and key dates. Visitors navigate between related sponsor/project/team content via cross-references.

### Story 4.1: Project & Team Document Schemas

As a content editor,
I want to create and manage project records and team rosters in Sanity Studio,
So that capstone project information and team details are centrally managed and linkable to sponsors.

**Acceptance Criteria:**

**Given** the sponsor document schema from Epic 3 is in place
**When** the project and team document schemas are created
**Then** `studio/src/schemaTypes/documents/project.ts` defines a document schema with fields: title (string, required), slug (slug, required, sourced from title), description (text), sponsor (reference to sponsor document), technologyTags (array of strings), team (reference to team document), semester (string, e.g. "Fall 2026"), status (string: active/completed/proposed) (FR10)
**And** `studio/src/schemaTypes/documents/team.ts` defines a document schema with fields: name (string, required), members (array of objects with name, role, photo image with alt text, linkedIn url), project (reference to project document), advisor (object with name, title, email) (FR11)
**And** both schemas include validation rules: titles/names required, slug required and unique, photos require alt text (NFR16)
**And** both schemas are registered in `studio/src/schemaTypes/index.ts`
**And** content editors can create, edit, and delete project and team documents in Sanity Studio
**And** content editors can link projects to sponsors and teams via reference fields
**And** Sanity Studio starts without schema errors

### Story 4.2: Event Document Schema & Timeline Block

As a content editor,
I want to manage program events and display them as a visual timeline,
So that students and visitors can see key dates with clear status indicators for what's upcoming, current, and completed.

**Acceptance Criteria:**

**Given** the schema infrastructure from Epic 1 is in place
**When** the event schema and Timeline block are created
**Then** `studio/src/schemaTypes/documents/event.ts` defines a document schema with fields: title (string, required), date (date, required), endDate (date, optional), location (string), description (text), eventType (string: milestone/deadline/event) (FR14)
**And** content editors can create, edit, and delete event documents in Sanity Studio (FR16)
**And** `studio/src/schemaTypes/blocks/timeline.ts` defines a block schema using `defineBlock` with fields: heading (string), events (array of references to event documents or a flag to auto-pull all events) (FR29)
**And** `astro-app/src/components/blocks/Timeline.astro` renders events ordered by date with visual status indicators: completed (past dates), current (today's date or active range), upcoming (future dates) (FR15)
**And** the status indicators use distinct visual treatments via Tailwind utility classes and design tokens
**And** each timeline entry displays title, date, location (if present), and description
**And** the GROQ projection resolves event references and sorts by date ascending
**And** the block is registered in `schemaTypes/index.ts`, `BlockRenderer.astro`, and the page schema's `blocks[]` array
**And** the block builds without errors and renders correctly when added to a page in Sanity Studio

### Story 4.3: Project Listing & Cross-Reference Navigation

As a site visitor,
I want to browse all capstone projects with their sponsor, team, and technology details, and navigate between related content,
So that I can find my team assignment, explore project details, and discover connections between sponsors, projects, and teams.

**Acceptance Criteria:**

**Given** the project, team, and sponsor schemas from Stories 4.1 and Epic 3 are in place
**When** the project listing page and cross-reference navigation are built
**Then** `astro-app/src/pages/projects/index.astro` renders a listing page displaying all projects with title, description excerpt, sponsor name and logo, technology tags, team name, semester, and status (FR12)
**And** each project card links to its sponsor's detail page via the sponsor slug
**And** each project card displays team member names
**And** the GROQ query in `lib/sanity.ts` fetches all projects with resolved references: `sponsor->{name, slug, logo}`, `team->{name, members}` (FR13)
**And** the sponsor detail page (`/sponsors/[slug].astro`) now renders the "Associated Projects" section with actual project data linked to that sponsor (FR13)
**And** visitors can navigate from sponsor → projects (via sponsor detail page) and from project → sponsor (via project listing links) (FR13)
**And** the listing page uses Layout.astro with breadcrumb showing Home > Projects
**And** the page is responsive: cards stack on mobile, grid layout on desktop
**And** the page builds without errors with all project documents in Sanity

## Epic 5: SEO, Analytics & Production Launch

The site is discoverable via search engines with proper metadata and sitemap. Visitor behavior is tracked with GA4. Accessibility is monitored via Monsido. Site deployed to production on GitHub Pages with CI/CD pipeline.

### Story 5.1: SEO Metadata & Sitemap

As a content editor,
I want to set per-page SEO metadata that renders in search results and social shares, with an auto-generated sitemap,
So that the site is discoverable by search engines and pages display correctly when shared on social media.

**Acceptance Criteria:**

**Given** the page schema includes an SEO object field and Layout.astro renders the `<head>`
**When** the SEO system is fully wired
**Then** `Layout.astro` renders `<title>` from the page's `seo.metaTitle` field, falling back to page title + site name (FR35)
**And** `Layout.astro` renders `<meta name="description">` from the page's `seo.metaDescription` field (FR35)
**And** `Layout.astro` renders Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) from the page's SEO fields (FR35)
**And** `og:image` uses `urlFor()` to generate an appropriately sized image URL from the `seo.ogImage` field
**And** `Layout.astro` renders a `<link rel="canonical">` tag with the page's canonical URL
**And** `@astrojs/sitemap` is installed and configured in `astro.config.mjs` to generate `sitemap-index.xml` on build (FR36)
**And** the site URL is configured in `astro.config.mjs` for correct sitemap and canonical URL generation
**And** all pages use semantic HTML5: proper heading hierarchy (single `<h1>` per page, logical `<h2>`-`<h6>` nesting), landmark regions (`<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`) (FR37)
**And** the sponsor detail and project listing pages include appropriate meta tags derived from their content
**And** the build produces a valid `sitemap-index.xml` that includes all static and dynamic pages

### Story 5.2: Analytics, Monitoring & Production Deploy

As a program administrator,
I want visitor analytics, accessibility monitoring, and a production deployment pipeline,
So that the site is live on a public URL with performance tracking and accessibility compliance from day one.

**Acceptance Criteria:**

**Given** the complete site with all blocks and pages from Epics 1-4 is in place
**When** analytics, monitoring, and deployment are configured
**Then** `Layout.astro` includes the GA4 tracking snippet loaded asynchronously with `async` attribute so it does not block page rendering (FR38, NFR23)
**And** the GA4 measurement ID is configurable via environment variable or siteSettings
**And** `Layout.astro` includes the Monsido script loaded asynchronously so it does not impact performance metrics (FR39, NFR24)
**And** `Layout.astro` includes security headers via `<meta>` tags: Content-Security-Policy, X-Content-Type-Options (NFR11)
**And** `.github/workflows/deploy.yml` defines a GitHub Actions workflow that: checks out code, installs dependencies, runs `npm run build` in `astro-app/`, and deploys the `dist/` output to GitHub Pages
**And** the workflow triggers on push to the main branch
**And** the full CI/CD pipeline completes in under 3 minutes (NFR8)
**And** the static build completes in under 60 seconds (NFR8)
**And** the deployed site is accessible at the GitHub Pages URL with HTTPS
**And** Lighthouse scores are 90+ across Performance, Accessibility, Best Practices, and SEO on the deployed site (NFR1, NFR14)

## Epic 6: Sponsor Inquiry System (Deferred)

Prospective sponsors can submit inquiry forms with validation and receive visual confirmation. Submissions are securely stored in Sanity via server-side proxy. Admins manage submissions in Sanity Studio.

### Story 6.1: Submission Schema & Cloudflare Infrastructure

As a developer,
I want the hosting migrated to Cloudflare Pages with a Worker-based form proxy and submission schema in Sanity,
So that form submissions can be securely written to Sanity without exposing the write token to the client.

**Acceptance Criteria:**

**Given** the site is deployed on GitHub Pages from Epic 5
**When** the Cloudflare infrastructure and submission schema are set up
**Then** `studio/src/schemaTypes/documents/submission.ts` defines a document schema with fields: name (string, required), organization (string), email (string, required), message (text, required), submittedAt (datetime), status (string: new/reviewed/contacted, default new) (FR20)
**And** the schema is registered in `studio/src/schemaTypes/index.ts`
**And** content editors can view and manage all form submissions in Sanity Studio, filtering by status (FR20)
**And** `astro.config.mjs` is updated to use `@astrojs/cloudflare` adapter with `output: 'hybrid'` (static pages remain static, form endpoint uses SSR)
**And** a Cloudflare Worker (or Astro API route via the adapter) is created that: accepts POST requests with form data, validates required fields, creates a submission document in Sanity using the write token, and returns a success/error response (FR19)
**And** the Sanity write token is stored as a Cloudflare environment variable — never exposed to the client (NFR9)
**And** the Worker includes rate limiting (max 100 submissions/day) (NFR10, NFR22)
**And** the site deploys successfully on Cloudflare Pages with the same functionality as GitHub Pages
**And** the CI/CD pipeline is updated for Cloudflare Pages deployment

### Story 6.2: Contact Form Block

As a prospective sponsor,
I want to fill out and submit an inquiry form on the site with validation and confirmation feedback,
So that I can express interest in sponsoring a capstone team and know my submission was received.

**Acceptance Criteria:**

**Given** the submission schema and Cloudflare infrastructure from Story 6.1 are in place
**When** the Contact Form block is created
**Then** `studio/src/schemaTypes/blocks/contact-form.ts` defines a block schema using `defineBlock` with fields: heading (string), description (text), successMessage (string) (FR28)
**And** `astro-app/src/components/blocks/ContactForm.astro` renders a form with fields: name (text input, required), organization (text input), email (email input, required), message (textarea, required) (FR17)
**And** the form includes a honeypot field (hidden input) that rejects submissions when filled (NFR10)
**And** client-side validation prevents submission of empty required fields and validates email format, displaying inline error messages (FR18)
**And** on valid submission, the form sends a POST request to the Cloudflare Worker/API endpoint (FR19)
**And** on successful submission, a toast/banner confirmation message displays using the `successMessage` from the block schema (FR21)
**And** on submission error, a user-friendly error message is displayed without exposing technical details
**And** the form uses vanilla JS (under 50 lines) with inline `<script>`, data-attribute patterns, and proper ARIA attributes for error states (`aria-invalid`, `aria-describedby`)
**And** the form is fully keyboard navigable with visible focus indicators (NFR15)
**And** the block is registered in `schemaTypes/index.ts`, `BlockRenderer.astro`, and the page schema's `blocks[]` array
**And** the form submits successfully and creates a submission document visible in Sanity Studio
