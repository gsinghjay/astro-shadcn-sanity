# Source Tree Analysis

Annotated directory tree for the `astro-shadcn-sanity` monorepo. Every critical directory and entry point is documented with its purpose and contents.

## 1. Project Root

```
astro-shadcn-sanity/                    # npm workspaces monorepo (v1.7.0)
├── astro-app/                          # Astro 5 SSG frontend (workspace)
├── studio/                             # Sanity Studio v5 CMS (workspace)
├── discord-bot/                        # Java Spring Boot Discord bot (separate)
├── tests/                              # Playwright E2E + integration tests
├── scripts/                            # Build and utility scripts
│   └── figma-capture/                  # Storybook screenshot automation
├── docs/                               # Project documentation
│   ├── cloudflare-guide.md             # Consolidated Cloudflare deployment guide
│   ├── vps-migration-plan.md           # VPS migration planning
│   ├── capstone-status-report.md       # Capstone project status
│   ├── project-scan-report.json        # Automated project scan output
│   ├── screenshots/                    # Documentation screenshots (12 images)
│   └── team/                           # Team-facing guides and stakeholder docs
├── wiki/                               # GitHub wiki content (23 pages)
├── rules/                              # Sanity MCP rule files (21 .mdc files)
├── _bmad/                              # BMAD framework templates and config
├── _bmad-output/                       # BMAD-generated planning/test artifacts
├── .github/workflows/                  # 7 CI/CD workflow definitions
├── package.json                        # Root workspace config + test scripts
├── package-lock.json                   # Lockfile (npm workspaces)
├── playwright.config.ts                # Playwright test configuration
├── docker-compose.yml                  # Multi-service Docker Compose
├── Dockerfile                          # Container build definition
├── .releaserc.json                     # semantic-release configuration
├── .lighthouserc.cjs                   # Lighthouse CI thresholds
├── .nvmrc                              # Node.js version pin
├── .dockerignore                       # Docker build exclusions
├── .gitignore                          # Git ignore rules
├── CLAUDE.md                           # AI assistant project instructions
├── CHANGELOG.md                        # Auto-generated changelog
└── README.md                           # Project README
```

## 2. Astro Frontend (`astro-app/`)

The primary frontend application. Builds as a static site with SSR routes for the authenticated portal.

```
astro-app/
├── astro.config.mjs                    # ENTRY POINT: Astro config (static output, Cloudflare adapter,
│                                       #   Sanity integration, Tailwind 4 via Vite, React integration)
├── package.json                        # Workspace dependencies and scripts
├── tsconfig.json                       # TypeScript configuration
├── vitest.config.ts                    # Vitest config (uses getViteConfig from astro/config)
├── wrangler.jsonc                      # Cloudflare Workers/Pages config (CF Access vars)
├── components.json                     # shadcn-astro component registry config
├── .env.example                        # Environment variable template (11 vars)
├── .eslintrc                           # ESLint configuration
├── .storybook/                         # Storybook configuration
│   ├── main.ts                         # Storybook build config
│   ├── patched-entry-preview.ts        # Custom preview entry (Astro compat patches)
│   └── preview.ts                      # Storybook preview decorators
├── public/                             # Static assets (served at site root)
│   ├── _headers                        # Cloudflare Pages custom headers
│   ├── astro.svg                       # Astro logo
│   ├── favicon.svg                     # Site favicon
│   ├── sanity.svg                      # Sanity logo
│   └── logos/                          # NJIT brand logos (4 SVG variants)
│       ├── njit-logo.svg
│       ├── njit-logo-light.svg
│       ├── njit-logo-plain.svg
│       └── njit-logo-plain-light.svg
└── src/                                # Application source
    ├── env.d.ts                        # Astro environment type declarations
    ├── sanity.types.ts                 # GENERATED: TypeScript types from Sanity schema (1387 lines)
    ├── middleware.ts                    # ENTRY POINT: Auth middleware (CF Access JWT validation,
    │                                   #   gates /portal/* routes, dev bypass)
    ├── pages/                          # File-based routing (9 routes)
    │   ├── index.astro                 # ENTRY POINT: Homepage (SSG, page-builder content)
    │   ├── [...slug].astro             # Catch-all dynamic pages (SSG, Sanity page-builder)
    │   ├── events/
    │   │   └── [slug].astro            # Event detail pages (SSG)
    │   ├── projects/
    │   │   ├── index.astro             # Projects listing (SSG)
    │   │   └── [slug].astro            # Project detail pages (SSG)
    │   ├── sponsors/
    │   │   ├── index.astro             # Sponsors listing (SSG)
    │   │   └── [slug].astro            # Sponsor detail pages (SSG)
    │   └── portal/
    │       ├── index.astro             # Portal dashboard (SSR, auth-gated)
    │       └── api/
    │           └── me.ts               # Portal API: current user endpoint (SSR)
    ├── layouts/                        # Page layouts (3 layouts + 5 templates)
    │   ├── Layout.astro                # Default site layout (head, header, footer, GTM)
    │   ├── PortalLayout.astro          # Portal layout (sidebar, auth UI, React islands)
    │   ├── SidebarLayout.astro         # Sidebar layout variant
    │   └── templates/                  # Page-builder template variants
    │       ├── DefaultTemplate.astro   # Standard single-column
    │       ├── FullWidthTemplate.astro # Edge-to-edge content
    │       ├── LandingTemplate.astro   # Landing page (hero-optimized)
    │       ├── SidebarTemplate.astro   # Content + sidebar
    │       └── TwoColumnTemplate.astro # Two-column grid
    ├── components/                     # All components
    │   ├── block-registry.ts           # ENTRY POINT: Auto-discovers blocks via import.meta.glob
    │   │                               #   Custom blocks: PascalCase -> camelCase _type
    │   │                               #   UI blocks: kebab-case filename = _type
    │   ├── BlockRenderer.astro         # Renders page-builder blocks by _type lookup
    │   ├── BlockWrapper.astro          # Wraps blocks with Section/SectionContent + visual editing
    │   ├── SanityPageContent.astro     # Iterates page blocks array through BlockRenderer
    │   ├── Header.astro                # Site header (nav, mobile menu, theme toggle)
    │   ├── Footer.astro                # Site footer (links, social, copyright)
    │   ├── Breadcrumb.astro            # Breadcrumb navigation
    │   ├── BreadcrumbItem.astro        # Individual breadcrumb link
    │   ├── EventCard.astro             # Event summary card
    │   ├── ProjectCard.astro           # Project summary card (+ .stories.ts)
    │   ├── SponsorCard.astro           # Sponsor summary card
    │   ├── TestimonialCard.astro       # Testimonial display card
    │   ├── VisualEditingMPA.tsx        # React: Sanity visual editing overlay (MPA mode)
    │   ├── block.astro                 # Generic block wrapper
    │   ├── blocks/                     # Block components (see below)
    │   │   ├── *.astro                 # 101 generic UI blocks (shadcn patterns)
    │   │   ├── *.stories.ts            # 101 Storybook stories (1:1 with blocks)
    │   │   └── custom/                 # 13 Sanity-connected custom blocks
    │   │       ├── ContactForm.astro   # Contact form block
    │   │       ├── CtaBanner.astro     # Call-to-action banner
    │   │       ├── EventList.astro     # Event listing block
    │   │       ├── FaqSection.astro    # FAQ accordion block
    │   │       ├── FeatureGrid.astro   # Feature cards grid
    │   │       ├── HeroBanner.astro    # Hero section with image/CTA
    │   │       ├── LogoCloud.astro     # Logo carousel/grid
    │   │       ├── RichText.astro      # Portable Text renderer
    │   │       ├── SponsorCards.astro  # Sponsor cards grid
    │   │       ├── SponsorSteps.astro  # Sponsorship process steps
    │   │       ├── StatsRow.astro      # Statistics display row
    │   │       ├── Testimonials.astro  # Testimonials carousel
    │   │       ├── TextWithImage.astro # Text + image split layout
    │   │       └── *.stories.ts        # 13 Storybook stories (1:1 with custom blocks)
    │   ├── portal/                     # React island components (auth-gated portal)
    │   │   ├── PortalCard.tsx          # Dashboard content card
    │   │   ├── PortalIcon.tsx          # Icon component for portal UI
    │   │   ├── PortalSkeleton.tsx      # Loading skeleton placeholder
    │   │   ├── types.ts               # Portal-specific TypeScript types
    │   │   └── CLAUDE.md               # Portal component development guide
    │   ├── ui/                         # 39 primitive UI component families (shadcn-astro)
    │   │   ├── accordion/              # Expandable content panels
    │   │   ├── alert/                  # Alert/notification banners
    │   │   ├── auto-form/              # Auto-generated form fields
    │   │   ├── avatar/                 # User avatar display
    │   │   ├── badge/                  # Status/category badges
    │   │   ├── banner/                 # Top-of-page banners
    │   │   ├── button/                 # Button variants
    │   │   ├── checkbox/               # Checkbox input
    │   │   ├── collapsible/            # Collapsible content sections
    │   │   ├── empty/                  # Empty state placeholder
    │   │   ├── field/                  # Form field wrapper
    │   │   ├── footer/                 # Footer primitives
    │   │   ├── header/                 # Header primitives
    │   │   ├── icon/                   # Icon system
    │   │   ├── image/                  # Image display + optimization
    │   │   ├── input/                  # Text input
    │   │   ├── item/                   # List item primitives
    │   │   ├── label/                  # Form labels
    │   │   ├── list/                   # List containers
    │   │   ├── logo/                   # Logo display
    │   │   ├── marquee/                # Scrolling marquee
    │   │   ├── native-carousel/        # CSS-only carousel
    │   │   ├── native-select/          # Native select dropdown
    │   │   ├── navigation-menu/        # Nav menu with dropdowns
    │   │   ├── price/                  # Price display formatting
    │   │   ├── radio-group/            # Radio button group
    │   │   ├── rating/                 # Star/score rating
    │   │   ├── section/                # Section + SectionContent wrappers
    │   │   ├── separator/              # Visual separator/divider
    │   │   ├── sheet/                  # Slide-out drawer panel
    │   │   ├── sidebar/                # Sidebar navigation
    │   │   ├── skeleton/               # Loading skeleton
    │   │   ├── spinner/                # Loading spinner
    │   │   ├── table/                  # Data table
    │   │   ├── tabs/                   # Tab navigation
    │   │   ├── textarea/               # Multiline text input
    │   │   ├── theme-toggle/           # Dark/light mode toggle
    │   │   ├── tile/                   # Content tile
    │   │   └── video/                  # Video player embed
    │   └── __tests__/                  # Component tests (Vitest + Container API)
    │       ├── BlockRenderer.test.ts   # Block renderer mapping tests
    │       ├── BlockWrapper.test.ts    # Block wrapper rendering tests
    │       ├── Breadcrumb.test.ts      # Breadcrumb navigation tests
    │       ├── ContactForm.test.ts     # Contact form block tests
    │       ├── CtaBanner.test.ts       # CTA banner block tests
    │       ├── EventList.test.ts       # Event list block tests
    │       ├── FaqSection.test.ts      # FAQ section block tests
    │       ├── FeatureGrid.test.ts     # Feature grid block tests
    │       ├── Header.test.ts          # Site header tests
    │       ├── HeroBanner.test.ts      # Hero banner block tests
    │       ├── LogoCloud.test.ts       # Logo cloud block tests
    │       ├── ProjectCard.test.ts     # Project card tests
    │       ├── RichText.test.ts        # Rich text block tests
    │       ├── SponsorCards.test.ts    # Sponsor cards block tests
    │       ├── SponsorSteps.test.ts    # Sponsor steps block tests
    │       ├── StatsRow.test.ts        # Stats row block tests
    │       ├── Testimonials.test.ts    # Testimonials block tests
    │       ├── TextWithImage.test.ts   # Text with image block tests
    │       └── __fixtures__/           # Typed Sanity data fixtures (15 files)
    │           ├── contact-form.ts
    │           ├── cta-banner.ts
    │           ├── events.ts
    │           ├── faq-section.ts
    │           ├── feature-grid.ts
    │           ├── hero-banner.ts
    │           ├── logo-cloud.ts
    │           ├── projects.ts
    │           ├── rich-text.ts
    │           ├── sponsor-cards.ts
    │           ├── sponsor-detail.ts
    │           ├── sponsor-steps.ts
    │           ├── stats-row.ts
    │           ├── testimonials.ts
    │           └── text-with-image.ts
    ├── lib/                            # Shared utilities and data layer
    │   ├── sanity.ts                   # ENTRY POINT: Data layer — GROQ queries (defineQuery),
    │   │                               #   loadQuery helper, all page/block data fetching (17 KB)
    │   ├── auth.ts                     # CF Access JWT validation (jose library)
    │   ├── image.ts                    # Sanity image URL builder helper
    │   ├── types.ts                    # Shared TypeScript type definitions
    │   ├── utils.ts                    # General utilities (cn class merger)
    │   └── __tests__/                  # Unit tests for lib modules
    │       ├── sanity.test.ts          # GROQ query string + data-fetching tests
    │       ├── image.test.ts           # Image URL builder tests
    │       ├── utils.test.ts           # Utility function tests
    │       └── __mocks__/
    │           └── sanity-client.ts    # Mock sanity:client for Vitest
    ├── scripts/                        # Client-side JavaScript
    │   └── main.ts                     # Client JS: mobile menu, carousel, accordion, theme,
    │                                   #   form handling, analytics (3.6 KB)
    ├── styles/
    │   └── global.css                  # Global CSS: Tailwind 4 CSS-first config, custom
    │                                   #   properties, dark mode, component tokens (5.6 KB)
    ├── cloudflare/                     # Cloudflare Worker integration
    │   └── __tests__/                  # SSR smoke tests (Vitest + Miniflare)
    │       ├── ssr-worker-smoke.test.ts  # Worker runtime smoke tests
    │       ├── build-output.test.ts      # Build output validation
    │       └── wrangler-config.test.ts   # Wrangler config validation
    └── types/
        └── global.d.ts                 # Global type augmentations
```

### Block Component Counts

| Category | .astro files | .stories.ts files |
|----------|-------------|-------------------|
| Generic UI blocks (`blocks/`) | 101 | 101 |
| Custom Sanity blocks (`blocks/custom/`) | 13 | 13 |
| **Total** | **114** | **114** |

### UI Component Families

39 directories under `ui/`, containing 174 total component files (`.astro` + `.tsx`). Each family groups related variants (e.g., `button/` contains `Button.astro`, `ButtonGroup.astro`).

### Route Summary

| Route | Type | Purpose |
|-------|------|---------|
| `/` | SSG | Homepage (page-builder) |
| `/[...slug]` | SSG | Dynamic CMS pages (catch-all) |
| `/events/[slug]` | SSG | Event detail pages |
| `/projects` | SSG | Projects listing |
| `/projects/[slug]` | SSG | Project detail pages |
| `/sponsors` | SSG | Sponsors listing |
| `/sponsors/[slug]` | SSG | Sponsor detail pages |
| `/portal` | SSR | Auth-gated member dashboard |
| `/portal/api/me` | SSR | Current user API endpoint |

7 SSG routes + 2 SSR routes = 9 total routes.

## 3. Sanity Studio (`studio/`)

Content management Studio providing structured content editing, visual editing integration, and schema-driven type generation.

```
studio/
├── sanity.config.ts                    # ENTRY POINT: Studio config (structureTool with singleton
│                                       #   pattern for siteSettings, presentationTool with visual
│                                       #   editing resolve, visionTool for GROQ exploration)
├── sanity.cli.ts                       # ENTRY POINT: CLI config (project ID, dataset, typegen
│                                       #   output path -> ../astro-app/src/sanity.types.ts)
├── package.json                        # Studio workspace dependencies
├── tsconfig.json                       # TypeScript config
├── schema.json                         # Extracted schema (used by typegen, 113 KB)
├── README.md                           # Studio-specific README
├── .env.example                        # Studio env template
├── .eslintrc                           # ESLint config
├── migrations/                         # Schema migration scripts
│   └── add-item-types.mjs             # Migration: add _type to array items
├── static/                             # Studio static assets (empty)
├── src/
│   ├── schemaTypes/                    # Schema type definitions (28 exports)
│   │   ├── index.ts                   # Schema registry (exports all types as array)
│   │   ├── documents/                 # 6 document types
│   │   │   ├── page.ts               # Page (page-builder with blocks array)
│   │   │   ├── site-settings.ts      # Site settings (singleton: nav, footer, SEO defaults)
│   │   │   ├── sponsor.ts            # Sponsor (company profile, tier, logo)
│   │   │   ├── project.ts            # Project (portfolio item, tech stack, links)
│   │   │   ├── testimonial.ts        # Testimonial (quote, author, role)
│   │   │   └── event.ts              # Event (date, location, description)
│   │   ├── blocks/                    # 13 block type definitions (page-builder blocks)
│   │   │   ├── hero-banner.ts        # Hero section configuration
│   │   │   ├── feature-grid.ts       # Feature cards grid
│   │   │   ├── cta-banner.ts         # Call-to-action banner
│   │   │   ├── stats-row.ts          # Statistics display
│   │   │   ├── text-with-image.ts    # Text + image layout
│   │   │   ├── logo-cloud.ts         # Logo gallery
│   │   │   ├── sponsor-steps.ts      # Sponsorship process
│   │   │   ├── rich-text.ts          # Portable Text content
│   │   │   ├── faq-section.ts        # FAQ accordion
│   │   │   ├── contact-form.ts       # Contact form
│   │   │   ├── sponsor-cards.ts      # Sponsor cards grid
│   │   │   ├── testimonials.ts       # Testimonial carousel
│   │   │   └── event-list.ts         # Event listing
│   │   ├── objects/                   # 8 reusable object types
│   │   │   ├── seo.ts               # SEO metadata (title, description, image)
│   │   │   ├── button.ts            # Button (label, link, variant)
│   │   │   ├── link.ts              # Link (internal/external, new tab)
│   │   │   ├── portable-text.ts     # Portable Text block content
│   │   │   ├── faq-item.ts          # FAQ question + answer pair
│   │   │   ├── feature-item.ts      # Feature card data
│   │   │   ├── stat-item.ts         # Statistic value + label
│   │   │   ├── step-item.ts         # Process step data
│   │   │   └── block-base.ts        # Base block fields (shared by all blocks)
│   │   └── helpers/
│   │       └── defineBlock.ts        # Helper: wraps defineType with block-base fields
│   └── presentation/
│       └── resolve.ts                # Visual editing document resolver (URL mapping)
```

### Schema Type Breakdown

| Category | Count | Purpose |
|----------|-------|---------|
| Documents | 6 | Top-level content types (page, sponsor, project, event, testimonial, siteSettings) |
| Blocks | 13 | Page-builder block definitions |
| Objects | 9 | Reusable embedded types (seo, button, link, portableText, items) |
| Helpers | 1 | Block definition utility (defineBlock) |
| **Total** | **29** | Registered in `schemaTypes/index.ts` (28 exports; block-base used internally) |

## 4. Testing Infrastructure (`tests/`)

Four-layer testing architecture spanning unit tests through full browser E2E.

```
tests/
├── README.md                           # Testing guide and architecture overview
├── .env.example                        # Test environment variables
├── e2e/                                # Playwright E2E specs (real browser)
│   ├── smoke.spec.ts                  # Smoke tests: pages load, no console errors
│   ├── homepage-2-2.spec.ts           # Homepage content + interaction tests
│   ├── pages-1-2.spec.ts             # Page rendering tests
│   ├── site-settings-2-3.spec.ts     # Site settings wiring tests
│   └── gtm-datalayer.spec.ts         # Google Tag Manager data layer validation
├── integration/                        # Integration test suites (Vitest)
│   ├── storybook-1-4.test.ts         # Storybook build + story validation
│   ├── blocks-2-1/
│   │   └── block-schemas.test.ts     # Block schema shape + field validation
│   ├── deploy-5-2/
│   │   └── cloudflare-deploy.test.ts # Cloudflare deployment validation
│   ├── homepage-2-2/
│   │   └── data-fetching.test.ts     # Homepage GROQ query validation
│   ├── link-7-7/
│   │   └── link-schema.test.ts       # Link object schema tests
│   ├── migration-1-2/                 # Architecture migration tests
│   │   ├── architecture.test.ts
│   │   ├── block-components.test.ts
│   │   └── types-data.test.ts
│   ├── preview-publish-5-4/
│   │   └── preview-publish.test.ts   # Preview and publish flow tests
│   ├── schema-1-3/                    # Schema validation tests
│   │   ├── documents.test.ts
│   │   ├── helpers-objects.test.ts
│   │   └── registration-build.test.ts
│   ├── site-settings-2-3/
│   │   └── data-wiring.test.ts       # Site settings data integration
│   ├── sponsor-3-1/
│   │   └── sponsor-schema.test.ts    # Sponsor schema validation
│   └── template-2-0/                  # Page template tests
│       ├── end-to-end.test.ts
│       ├── page-template.test.ts
│       ├── slug-route.test.ts
│       ├── template-components.test.ts
│       └── template-validation.test.ts
└── support/                            # Shared test utilities
    ├── constants.ts                   # Test constants and config
    ├── fixtures/
    │   └── index.ts                   # Playwright test fixtures (extended from @playwright/test)
    └── helpers/
        └── a11y.ts                    # Accessibility testing helpers (axe-core integration)
```

### Test Location by Layer

| Layer | Runner | Location | File Count |
|-------|--------|----------|------------|
| Unit | Vitest | `astro-app/src/lib/__tests__/` | 3 test files + 1 mock |
| Component | Vitest + Container API | `astro-app/src/components/__tests__/` | 18 test files + 15 fixtures |
| SSR Smoke | Vitest + Miniflare | `astro-app/src/cloudflare/__tests__/` | 3 test files |
| Integration | Vitest | `tests/integration/` | 18 test files across 10 suites |
| E2E | Playwright | `tests/e2e/` | 5 spec files |

## 5. CI/CD and Configuration

```
.github/workflows/                      # GitHub Actions CI/CD pipelines
├── ci.yml                              # Main CI: lint, typecheck, unit tests, build
├── release.yml                         # semantic-release: version bump, changelog, npm publish
├── sanity-deploy.yml                   # Deploy Sanity Studio to sanity.io hosting
├── deploy-storybook.yml                # Build and deploy Storybook to Chromatic
├── sync-preview.yml                    # Sync preview branch with main (Sanity preview)
├── enforce-preview-branch.yml          # Branch protection: enforce preview branch rules
└── enforce-preview-source.yml          # Source protection: validate preview source origin
```

### Root Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Workspace root: defines `astro-app` + `studio` workspaces, test scripts |
| `playwright.config.ts` | Playwright: multi-browser config (Chromium, Firefox, WebKit) |
| `.releaserc.json` | semantic-release: commit analysis, changelog, npm, GitHub release |
| `.lighthouserc.cjs` | Lighthouse CI: performance/accessibility score thresholds |
| `docker-compose.yml` | Docker services (Astro app, Studio, Discord bot) |
| `Dockerfile` | Container image for Astro app |
| `.nvmrc` | Node.js version specification |

## 6. Entry Points Summary

| Entry Point | File | Purpose |
|-------------|------|---------|
| Astro Config | `astro-app/astro.config.mjs` | Configures static output, Cloudflare adapter, Sanity integration, Tailwind 4, React |
| Homepage | `astro-app/src/pages/index.astro` | SSG homepage rendering page-builder blocks from Sanity |
| Catch-All Route | `astro-app/src/pages/[...slug].astro` | Dynamic CMS pages with template selection |
| Auth Middleware | `astro-app/src/middleware.ts` | Gates `/portal/*` routes via CF Access JWT validation |
| Data Layer | `astro-app/src/lib/sanity.ts` | All GROQ queries (defineQuery), loadQuery helper, data fetching functions |
| Block Registry | `astro-app/src/components/block-registry.ts` | Auto-discovers 114 blocks via `import.meta.glob`, maps _type to component |
| Studio Config | `studio/sanity.config.ts` | Sanity Studio: structure tool (singleton pattern), presentation tool, vision tool |
| CLI + TypeGen | `studio/sanity.cli.ts` | CLI config, TypeGen output path (`../astro-app/src/sanity.types.ts`) |
| Visual Editing | `studio/src/presentation/resolve.ts` | Maps Sanity documents to frontend preview URLs |
| Schema Index | `studio/src/schemaTypes/index.ts` | Exports all 28 schema type definitions |
| Client JS | `astro-app/src/scripts/main.ts` | Client-side: mobile menu, carousel, accordion, theme, forms, analytics |
| Global CSS | `astro-app/src/styles/global.css` | Tailwind 4 CSS-first config, custom properties, dark mode tokens |

## 7. Critical File Locations

### Quick Reference

```
# Configuration
astro-app/astro.config.mjs              # Astro + integrations
astro-app/vitest.config.ts              # Test runner config
astro-app/wrangler.jsonc                # Cloudflare Workers config
studio/sanity.config.ts                 # Sanity Studio config
studio/sanity.cli.ts                    # CLI + typegen config
playwright.config.ts                    # E2E test config

# Generated Files (do not edit manually)
astro-app/src/sanity.types.ts           # TypeScript types from schema (run: npm run typegen)
studio/schema.json                      # Extracted schema (run: npx sanity schema extract)
CHANGELOG.md                            # Auto-generated by semantic-release

# Data Layer
astro-app/src/lib/sanity.ts             # GROQ queries + data fetching
astro-app/src/lib/auth.ts               # CF Access JWT validation
astro-app/src/lib/image.ts              # Sanity image URL builder

# Schema Definitions
studio/src/schemaTypes/index.ts         # Schema registry
studio/src/schemaTypes/documents/       # 6 document types
studio/src/schemaTypes/blocks/          # 13 block types
studio/src/schemaTypes/objects/         # 9 object types

# Component System
astro-app/src/components/block-registry.ts     # Block auto-discovery
astro-app/src/components/BlockRenderer.astro    # Block type -> component mapping
astro-app/src/components/blocks/custom/         # 13 Sanity-connected blocks
astro-app/src/components/blocks/                # 101 generic UI blocks
astro-app/src/components/ui/                    # 39 primitive families (174 files)
astro-app/src/components/portal/                # 3 React portal components

# Test Fixtures + Mocks
astro-app/src/components/__tests__/__fixtures__/  # 15 typed Sanity data fixtures
astro-app/src/lib/__tests__/__mocks__/            # Sanity client mock
tests/support/fixtures/                            # Playwright test fixtures
tests/support/helpers/                             # a11y test helpers

# Styles
astro-app/src/styles/global.css         # Tailwind 4 config + tokens
```

### Supporting Directories

| Directory | Purpose |
|-----------|---------|
| `rules/` | 21 Sanity MCP rule files (`.mdc`) for AI-assisted development |
| `wiki/` | 23 GitHub wiki pages (architecture, guides, glossary) |
| `_bmad/` | BMAD framework templates and agent config |
| `_bmad-output/` | Generated planning artifacts, test artifacts, project context |
| `scripts/figma-capture/` | Storybook screenshot automation (Figma-free alternative) |
| `discord-bot/` | Java Spring Boot Discord bot (separate service, Docker-deployed) |
| `docs/screenshots/` | 12 documentation screenshots |
| `docs/team/` | Team guides (GitHub issues, stakeholder docs, professional development) |
