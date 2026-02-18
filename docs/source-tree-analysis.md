# Source Tree Analysis

**Generated:** 2026-02-13 | **Mode:** Exhaustive Rescan | **Workflow:** document-project v1.2.0

## Annotated Directory Tree

```
astro-shadcn-sanity/                    # Monorepo root (npm workspaces)
├── astro-app/                          # Part 1: Astro Frontend (SSG)
│   ├── astro.config.mjs                # Astro config: static output, Sanity + React + Tailwind
│   ├── components.json                 # shadcn CLI config with @fulldev registry
│   ├── vitest.config.ts                # Vitest: getViteConfig(), sanity:client mock alias
│   ├── wrangler.jsonc                  # Cloudflare Pages: ywcc-capstone, nodejs_compat
│   ├── tsconfig.json                   # Strict mode, @/* path alias
│   ├── .env.example                    # Template: Sanity IDs, GA4, Studio URL
│   ├── src/
│   │   ├── components/                 # ★ 507 component files total
│   │   │   ├── Header.astro            # Site header with navigation
│   │   │   ├── Footer.astro            # Site footer with links/social
│   │   │   ├── BlockRenderer.astro     # ★ Dynamic block dispatch by _type
│   │   │   ├── BlockWrapper.astro      # Block layout: background, spacing, maxWidth
│   │   │   ├── SanityPageContent.astro # Page content wrapper
│   │   │   ├── VisualEditingMPA.tsx    # React: Presentation Tool integration
│   │   │   ├── block-registry.ts       # ★ Auto-discover blocks via import.meta.glob
│   │   │   ├── block.astro             # Block helper
│   │   │   ├── __tests__/              # 13 component test files
│   │   │   │   ├── __fixtures__/       # Typed test data from sanity.types.ts
│   │   │   │   │   ├── contact-form.ts
│   │   │   │   │   ├── cta-banner.ts
│   │   │   │   │   ├── faq-section.ts
│   │   │   │   │   ├── feature-grid.ts
│   │   │   │   │   ├── hero-banner.ts
│   │   │   │   │   ├── logo-cloud.ts
│   │   │   │   │   ├── rich-text.ts
│   │   │   │   │   ├── sponsor-cards.ts
│   │   │   │   │   ├── sponsor-steps.ts
│   │   │   │   │   ├── stats-row.ts
│   │   │   │   │   └── text-with-image.ts
│   │   │   │   ├── BlockRenderer.test.ts
│   │   │   │   ├── BlockWrapper.test.ts
│   │   │   │   ├── ContactForm.test.ts
│   │   │   │   ├── CtaBanner.test.ts
│   │   │   │   ├── FaqSection.test.ts
│   │   │   │   ├── FeatureGrid.test.ts
│   │   │   │   ├── HeroBanner.test.ts
│   │   │   │   ├── LogoCloud.test.ts
│   │   │   │   ├── RichText.test.ts
│   │   │   │   ├── SponsorCards.test.ts
│   │   │   │   ├── SponsorSteps.test.ts
│   │   │   │   ├── StatsRow.test.ts
│   │   │   │   └── TextWithImage.test.ts
│   │   │   ├── blocks/
│   │   │   │   ├── custom/             # ★ 11 custom Sanity-backed blocks
│   │   │   │   │   ├── ContactForm.astro + .stories.ts
│   │   │   │   │   ├── CtaBanner.astro + .stories.ts
│   │   │   │   │   ├── FaqSection.astro + .stories.ts
│   │   │   │   │   ├── FeatureGrid.astro + .stories.ts
│   │   │   │   │   ├── HeroBanner.astro + .stories.ts
│   │   │   │   │   ├── LogoCloud.astro + .stories.ts
│   │   │   │   │   ├── RichText.astro + .stories.ts
│   │   │   │   │   ├── SponsorCards.astro + .stories.ts
│   │   │   │   │   ├── SponsorSteps.astro + .stories.ts
│   │   │   │   │   ├── StatsRow.astro + .stories.ts
│   │   │   │   │   └── TextWithImage.astro + .stories.ts
│   │   │   │   └── *.astro             # ~100 fulldev/ui variant blocks
│   │   │   │       ├── hero-{1..14}.astro + .stories.ts
│   │   │   │       ├── features-{1..6}.astro + .stories.ts
│   │   │   │       ├── cta-{1..8}.astro + .stories.ts
│   │   │   │       ├── services-{1..7}.astro + .stories.ts
│   │   │   │       ├── content-{1..6}.astro + .stories.ts
│   │   │   │       ├── reviews-{1..5}.astro + .stories.ts
│   │   │   │       ├── products-{1..5}.astro + .stories.ts
│   │   │   │       ├── faqs-{1..4}.astro + .stories.ts
│   │   │   │       ├── articles-{1..4}.astro + .stories.ts
│   │   │   │       ├── videos-{1..4}.astro + .stories.ts
│   │   │   │       ├── stats-{1..3}.astro + .stories.ts
│   │   │   │       ├── steps-{1..3}.astro + .stories.ts
│   │   │   │       ├── pricings-{1..3}.astro + .stories.ts
│   │   │   │       ├── logos-{1..3}.astro + .stories.ts
│   │   │   │       ├── contact-{1..3}.astro + .stories.ts
│   │   │   │       ├── footer-{1..3}.astro + .stories.ts
│   │   │   │       ├── header-{1..3}.astro + .stories.ts
│   │   │   │       └── (banner, blocks, images, links, video, table, product)
│   │   │   └── ui/                     # ~39 shadcn/ui primitive components
│   │   │       ├── accordion, alert, avatar, badge, banner, button
│   │   │       ├── checkbox, collapsible, empty, field, footer, header
│   │   │       ├── icon, image, input, item, label, list, logo
│   │   │       └── (and more standard UI patterns)
│   │   ├── layouts/
│   │   │   ├── Layout.astro            # ★ Main layout: head, meta, CSP, GA4, VE
│   │   │   └── templates/              # 5 page templates
│   │   │       ├── DefaultTemplate.astro
│   │   │       ├── FullWidthTemplate.astro
│   │   │       ├── LandingTemplate.astro
│   │   │       ├── SidebarTemplate.astro
│   │   │       └── TwoColumnTemplate.astro
│   │   ├── lib/                        # ★ Core utilities
│   │   │   ├── sanity.ts               # GROQ queries, loadQuery, getSiteSettings
│   │   │   ├── image.ts                # urlFor() — Sanity image URL builder
│   │   │   ├── types.ts                # Type adapters from sanity.types.ts
│   │   │   ├── utils.ts                # cn() utility (clsx + tailwind-merge)
│   │   │   └── __tests__/
│   │   │       ├── __mocks__/
│   │   │       │   └── sanity-client.ts # Mock for "sanity:client" virtual module
│   │   │       ├── sanity.test.ts
│   │   │       ├── image.test.ts
│   │   │       └── utils.test.ts
│   │   ├── pages/                      # ★ 2 route files
│   │   │   ├── index.astro             # Home page (slug: 'home')
│   │   │   └── [...slug].astro         # Catch-all dynamic pages
│   │   ├── scripts/
│   │   │   └── main.ts                 # Client JS: scroll animations, forms, carousel
│   │   ├── styles/
│   │   │   └── global.css              # Tailwind + Swiss/NJIT brand tokens
│   │   ├── sanity.types.ts             # ★ Auto-generated TypeScript types (1033 lines)
│   │   └── env.d.ts                    # Astro environment type declarations
│   └── .storybook/                     # Storybook 10 configuration
│
├── studio/                             # Part 2: Sanity Studio v5
│   ├── sanity.config.ts                # ★ Main config: plugins, singletons, desk structure
│   ├── sanity.cli.ts                   # CLI + TypeGen config (generates to astro-app)
│   ├── schema.json                     # Extracted schema for TypeGen
│   ├── tsconfig.json                   # TypeScript strict mode
│   ├── .env.example                    # Template: project ID, dataset, preview origin
│   └── src/
│       ├── presentation/
│       │   └── resolve.ts              # Preview URL resolver for Presentation Tool
│       └── schemaTypes/
│           ├── index.ts                # ★ Schema exports (21 types)
│           ├── helpers/
│           │   └── defineBlock.ts      # Block factory: auto-adds layout fields
│           ├── objects/                # 8 reusable object types
│           │   ├── seo.ts             # SEO metadata (title, description, ogImage)
│           │   ├── button.ts          # Button (text, url, variant)
│           │   ├── link.ts            # Navigation link (label, href, external)
│           │   ├── portable-text.ts   # Rich text with links, images, callouts
│           │   ├── block-base.ts      # Base fields: backgroundVariant, spacing, maxWidth
│           │   ├── faq-item.ts        # FAQ question + answer
│           │   ├── feature-item.ts    # Feature with icon/image + title
│           │   ├── stat-item.ts       # Statistic value + label
│           │   └── step-item.ts       # Process step with bullet list
│           ├── documents/              # 3 document types
│           │   ├── page.ts            # ★ Page with blocks[], template, SEO
│           │   ├── site-settings.ts   # ★ Singleton: nav, footer, branding, social
│           │   └── sponsor.ts         # Sponsor: logo, tier, featured
│           └── blocks/                 # 11 block types
│               ├── hero-banner.ts
│               ├── feature-grid.ts
│               ├── cta-banner.ts
│               ├── stats-row.ts
│               ├── text-with-image.ts
│               ├── logo-cloud.ts
│               ├── sponsor-steps.ts
│               ├── rich-text.ts
│               ├── faq-section.ts
│               ├── contact-form.ts
│               └── sponsor-cards.ts
│
├── tests/                              # ★ Test suite (root level)
│   ├── README.md                       # Test framework documentation
│   ├── e2e/                            # Playwright E2E specs (34 test cases)
│   │   ├── smoke.spec.ts              # Baseline: load, a11y, meta, nav, perf
│   │   ├── pages-1-2.spec.ts          # All pages: 200 status, blocks, errors, a11y
│   │   ├── homepage-2-2.spec.ts       # Homepage Sanity content validation
│   │   └── site-settings-2-3.spec.ts  # Header/footer Sanity data wiring
│   ├── integration/                    # Vitest integration tests (241 cases)
│   │   ├── blocks-2-1/                # Block schema validation
│   │   ├── migration-1-2/             # Architecture, block components, types
│   │   ├── schema-1-3/                # Documents, helpers, registration
│   │   ├── template-2-0/              # Template system (5 files)
│   │   ├── homepage-2-2/              # Data fetching validation
│   │   ├── site-settings-2-3/         # Settings data wiring
│   │   ├── sponsor-3-1/               # Sponsor schema
│   │   ├── deploy-5-2/                # Cloudflare deploy checks
│   │   ├── preview-publish-5-4/       # Preview/publish architecture
│   │   ├── link-7-7/                  # Link extraction
│   │   └── storybook-1-4/             # Storybook config
│   └── support/                        # Test infrastructure
│       ├── fixtures/index.ts           # Playwright fixtures (network monitor, logging)
│       ├── helpers/a11y.ts             # expectAccessible() — axe-core WCAG 2.1 AA
│       └── constants.ts               # Block names, types, timeouts
│
├── .github/workflows/                  # 7 CI/CD workflows
│   ├── ci.yml                          # PR checks: unit tests + Lighthouse
│   ├── release.yml                     # semantic-release on main
│   ├── deploy-storybook.yml            # Storybook → GitHub Pages
│   ├── sanity-deploy.yml               # Webhook → build + CF deploy
│   ├── sync-preview.yml                # Auto-sync main → preview + Discord
│   ├── enforce-preview-branch.yml      # Only preview → main
│   └── enforce-preview-source.yml      # Block main → preview
│
├── docs/                               # ★ Project documentation
│   ├── index.md                        # Master documentation index
│   ├── project-overview.md             # Executive summary
│   ├── architecture.md                 # System design and patterns
│   ├── source-tree-analysis.md         # This file
│   ├── component-inventory.md          # Component catalog
│   ├── data-models.md                  # Sanity schemas and GROQ
│   ├── development-guide.md            # Setup and commands
│   ├── integration-architecture.md     # Part communication
│   ├── project-context.md              # Tech stack reference
│   ├── template-layout-system.md       # Template system design
│   ├── storybook-constitution.md       # Storybook best practices
│   ├── server-islands-cost-analysis.md # Server islands analysis
│   ├── team/                           # Team guides (13 files)
│   └── code-review/                    # Code review reports (4 files)
│
├── _bmad-output/                       # BMAD workflow outputs
│   ├── planning-artifacts/             # PRD, architecture, epics
│   ├── implementation-artifacts/       # 40+ implementation stories
│   ├── test-artifacts/                 # Test framework docs + reviews
│   ├── brainstorming/                  # Brainstorming sessions
│   └── capstone/                       # Capstone deliverables
│
├── rules/                              # AI development rules (Cursor/Claude)
├── Dockerfile                          # Multi-stage: astro, studio, storybook
├── docker-compose.yml                  # 3 services + optional storybook profile
├── playwright.config.ts                # 5 browser projects, webServer build+preview
├── wrangler.toml                       # Cloudflare Pages deployment config
├── package.json                        # ★ Root: workspaces, dev/test scripts
├── CLAUDE.md                           # AI assistant instructions
├── CHANGELOG.md                        # Auto-generated changelog (semantic-release)
└── README.md                           # Primary project documentation
```

## Entry Points

| Entry Point | Path | Purpose |
|-------------|------|---------|
| Home page | `astro-app/src/pages/index.astro` | Fetches page with slug 'home' |
| Dynamic pages | `astro-app/src/pages/[...slug].astro` | Catch-all route with `getStaticPaths()` |
| Main layout | `astro-app/src/layouts/Layout.astro` | Global head, meta, CSP, GA4 |
| Client script | `astro-app/src/scripts/main.ts` | Scroll animations, forms, carousel |
| Block registry | `astro-app/src/components/block-registry.ts` | Auto-discovers all blocks |
| GROQ queries | `astro-app/src/lib/sanity.ts` | Data fetching layer |
| Studio config | `studio/sanity.config.ts` | Sanity plugins, desk structure |
| Schema index | `studio/src/schemaTypes/index.ts` | All 21 schema type exports |

## Critical Folders

| Folder | Files | Role |
|--------|-------|------|
| `astro-app/src/components/blocks/custom/` | 24 | Custom Sanity-backed block components + stories |
| `astro-app/src/components/blocks/` | ~200 | UI variant blocks + stories |
| `astro-app/src/components/ui/` | ~39 | shadcn/ui primitives |
| `astro-app/src/lib/` | 8 | Core utilities + GROQ queries |
| `studio/src/schemaTypes/` | 21 | All Sanity schema definitions |
| `tests/e2e/` | 4 | Playwright E2E specs |
| `tests/integration/` | 19 | Vitest integration tests |
| `.github/workflows/` | 7 | CI/CD pipeline definitions |
