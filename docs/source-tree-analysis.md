# Source Tree Analysis — YWCC Capstone Sponsors

**Generated:** 2026-02-09 | **Scan Level:** Exhaustive

## Annotated Directory Tree

```
astro-shadcn-sanity/                    # Root monorepo (npm workspaces)
├── package.json                        # Workspace config, test scripts, devDependencies
├── package-lock.json                   # Lockfile
├── playwright.config.ts                # E2E test config (5 browsers, webServer)
├── playwright.integration.config.ts    # Integration test config (no browser)
├── .nvmrc                              # Node 24 LTS requirement
├── .gitignore                          # Root gitignore
├── README.md                           # ★ Primary project documentation
├── initial-brainstorm.md               # Initial project brainstorming notes
│
├── astro-app/                          # ★ PART: Astro Frontend (SSG)
│   ├── package.json                    # App dependencies (astro, tailwind, react)
│   ├── astro.config.mjs                # ★ Astro config: sanity, tailwind, icon, react, node adapter
│   ├── tsconfig.json                   # TypeScript config (strict, @/* path alias)
│   ├── components.json                 # shadcn CLI config (@fulldev registry)
│   ├── .eslintrc                       # Prettier-style lint config
│   ├── .gitignore                      # Ignores dist/, .astro/, storybook-static/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.astro            # ★ Site header with nav, CTA, mobile sheet
│   │   │   ├── Footer.astro            # ★ Site footer (4-column, social links, contact)
│   │   │   ├── BlockRenderer.astro     # ★ Central block routing (13 custom + 102 generic)
│   │   │   ├── block.astro             # Dynamic block renderer (import.meta.glob)
│   │   │   │
│   │   │   ├── ui/                     # UI primitives (fulldev/ui via shadcn CLI)
│   │   │   │   ├── accordion/          # Expandable content panels
│   │   │   │   ├── alert/              # Alert notifications
│   │   │   │   ├── auto-form/          # Auto-generated forms
│   │   │   │   ├── avatar/             # User avatar display
│   │   │   │   ├── badge/              # Status/category badges
│   │   │   │   ├── banner/             # Banner notifications
│   │   │   │   ├── button/             # CTA buttons with variants
│   │   │   │   ├── checkbox/           # Checkbox inputs
│   │   │   │   ├── collapsible/        # Collapsible content
│   │   │   │   ├── empty/              # Empty state placeholders
│   │   │   │   ├── field/              # Form field wrappers
│   │   │   │   ├── footer/             # Footer layout primitives
│   │   │   │   ├── header/             # Header layout primitives
│   │   │   │   ├── icon/               # Icon display component
│   │   │   │   ├── image/              # Image display with optimization
│   │   │   │   ├── input/              # Text input fields
│   │   │   │   ├── item/               # List item component
│   │   │   │   ├── label/              # Form label component
│   │   │   │   ├── list/               # List layout component
│   │   │   │   ├── logo/               # Logo display component
│   │   │   │   ├── marquee/            # Scrolling marquee
│   │   │   │   ├── native-carousel/    # Native HTML carousel
│   │   │   │   ├── native-select/      # Native select dropdown
│   │   │   │   ├── navigation-menu/    # Navigation menu component
│   │   │   │   ├── price/              # Pricing display
│   │   │   │   ├── radio-group/        # Radio button groups
│   │   │   │   ├── rating/             # Star rating display
│   │   │   │   ├── section/            # Section layout wrapper
│   │   │   │   ├── separator/          # Visual separator line
│   │   │   │   ├── sheet/              # Slide-out panel (mobile nav)
│   │   │   │   ├── sidebar/            # Sidebar layout
│   │   │   │   ├── skeleton/           # Loading skeleton
│   │   │   │   ├── spinner/            # Loading spinner
│   │   │   │   ├── table/              # Data table
│   │   │   │   ├── tabs/               # Tabbed interface
│   │   │   │   ├── textarea/           # Multi-line text input
│   │   │   │   ├── theme-toggle/       # Light/dark mode toggle
│   │   │   │   ├── tile/               # Tile/card layout
│   │   │   │   └── video/              # Video embed component
│   │   │   │                           # Total: 251 files across 37 categories
│   │   │   │
│   │   │   └── blocks/                 # Block components
│   │   │       ├── custom/             # ★ 13 domain-specific blocks
│   │   │       │   ├── HeroBanner.astro        # Hero with carousel background
│   │   │       │   ├── StatsRow.astro          # Statistics display grid
│   │   │       │   ├── FeatureGrid.astro       # Feature cards grid
│   │   │       │   ├── FaqSection.astro        # FAQ accordion
│   │   │       │   ├── CtaBanner.astro         # Call-to-action section
│   │   │       │   ├── TextWithImage.astro     # Text + image split
│   │   │       │   ├── LogoCloud.astro         # Sponsor logos grid
│   │   │       │   ├── SponsorCards.astro       # Sponsor tier cards
│   │   │       │   ├── SponsorSteps.astro      # Sponsor onboarding steps
│   │   │       │   ├── TeamGrid.astro          # Team member grid
│   │   │       │   ├── ContactForm.astro       # Contact form with fields
│   │   │       │   ├── Timeline.astro          # Event timeline
│   │   │       │   └── RichText.astro          # Portable text renderer
│   │   │       │
│   │   │       └── *.astro             # 102 pre-built fulldotdev/ui blocks
│   │   │                               # (Articles, Banners, CTAs, FAQs, Features,
│   │   │                               #  Heroes, Logos, Pricings, Products, Reviews,
│   │   │                               #  Services, Stats, Steps, Videos, etc.)
│   │   │
│   │   ├── layouts/
│   │   │   ├── Layout.astro            # ★ Master HTML layout (head, meta, scripts)
│   │   │   └── templates/
│   │   │       ├── DefaultTemplate.astro    # Centered max-w-7xl
│   │   │       ├── FullWidthTemplate.astro  # Full-width, no constraints
│   │   │       ├── LandingTemplate.astro    # No nav/footer, conversion
│   │   │       ├── SidebarTemplate.astro    # 2/3 + 1/3 grid
│   │   │       └── TwoColumnTemplate.astro  # Equal 2-column grid
│   │   │
│   │   ├── lib/
│   │   │   ├── sanity.ts               # ★ Sanity client, GROQ queries, data fetching
│   │   │   ├── types.ts                # ★ TypeScript interfaces for all data structures
│   │   │   ├── image.ts                # Sanity image URL builder (urlFor)
│   │   │   ├── utils.ts                # cn() class utility (clsx + tailwind-merge)
│   │   │   └── data/                   # Static/placeholder page data
│   │   │       ├── index.ts            # Barrel export
│   │   │       ├── home-page.ts        # Homepage block structure
│   │   │       ├── about-page.ts       # About page blocks
│   │   │       ├── contact-page.ts     # Contact page blocks
│   │   │       ├── projects-page.ts    # Projects page blocks
│   │   │       ├── sponsors-page.ts    # Sponsors page blocks
│   │   │       └── site-settings.ts    # Legacy site settings (deprecated)
│   │   │
│   │   ├── pages/
│   │   │   ├── index.astro             # ★ Homepage (Sanity CMS data)
│   │   │   ├── about.astro             # About page (static data)
│   │   │   ├── contact.astro           # Contact page (static data)
│   │   │   ├── projects.astro          # Projects page (static data)
│   │   │   ├── sponsors.astro          # Sponsors page (static data)
│   │   │   └── [...slug].astro         # ★ Dynamic catch-all (Sanity, 5 templates)
│   │   │
│   │   ├── styles/
│   │   │   └── global.css              # ★ Tailwind v4, theme, Swiss design tokens
│   │   │
│   │   └── scripts/
│   │       └── main.ts                 # Client-side JS (animations, form, carousel)
│   │
│   ├── public/                         # Static assets (favicon, etc.)
│   ├── dist/                           # Build output (gitignored)
│   └── storybook-static/              # Storybook build output (gitignored)
│
├── studio/                             # ★ PART: Sanity CMS Studio
│   ├── package.json                    # Studio dependencies (sanity v5, react 19)
│   ├── sanity.config.ts                # ★ Studio config (structure, presentation, vision)
│   ├── sanity.cli.ts                   # CLI config (deploy, appId)
│   ├── tsconfig.json                   # TypeScript config (ES2017, strict)
│   ├── .eslintrc                       # Extends @sanity/eslint-config-studio
│   ├── .gitignore                      # Ignores dist/, .sanity/, node_modules/
│   │
│   └── src/
│       ├── schemaTypes/
│       │   ├── index.ts                # ★ Schema registry (all types exported)
│       │   │
│       │   ├── documents/
│       │   │   ├── page.ts             # ★ Page document (title, slug, template, seo, blocks[])
│       │   │   ├── site-settings.ts    # ★ Site settings singleton (nav, footer, branding)
│       │   │   └── sponsor.ts          # Sponsor profile (name, logo, tier, featured)
│       │   │
│       │   ├── objects/
│       │   │   ├── block-base.ts       # Shared block base fields
│       │   │   ├── button.ts           # Reusable button object
│       │   │   ├── portable-text.ts    # Rich text editor config
│       │   │   └── seo.ts              # SEO metadata object
│       │   │
│       │   ├── blocks/
│       │   │   ├── hero-banner.ts      # Hero section schema
│       │   │   ├── feature-grid.ts     # Feature cards schema
│       │   │   ├── cta-banner.ts       # CTA section schema
│       │   │   ├── stats-row.ts        # Statistics display schema
│       │   │   ├── text-with-image.ts  # Text + image schema
│       │   │   ├── logo-cloud.ts       # Logo showcase schema
│       │   │   ├── sponsor-steps.ts    # Sponsor process schema
│       │   │   ├── rich-text.ts        # Rich text content schema
│       │   │   ├── faq-section.ts      # FAQ accordion schema
│       │   │   ├── contact-form.ts     # Contact form schema
│       │   │   └── sponsor-cards.ts    # Sponsor cards schema
│       │   │
│       │   └── helpers/
│       │       └── defineBlock.ts      # ★ Block factory (merges base fields)
│       │
│       └── presentation/
│           └── resolve.ts              # Presentation tool URL resolver
│
├── tests/                              # Test suite
│   ├── README.md                       # Test framework documentation
│   ├── CLAUDE.md                       # Testing rules for AI development
│   ├── .env.example                    # Test env template
│   │
│   ├── e2e/                            # E2E browser tests
│   │   ├── smoke.spec.ts              # Homepage smoke + a11y + perf
│   │   ├── pages-1-2.spec.ts          # All pages render + content
│   │   ├── homepage-2-2.spec.ts       # Sanity data fetching (TDD)
│   │   └── site-settings-2-3.spec.ts  # Site settings wiring (TDD)
│   │
│   ├── integration/                    # Integration tests (no browser)
│   │   ├── blocks-2-1/
│   │   │   └── block-schemas.spec.ts  # Block schema validation (32+ tests)
│   │   ├── homepage-2-2/
│   │   │   └── data-fetching.spec.ts  # GROQ query validation
│   │   ├── site-settings-2-3/
│   │   │   └── data-wiring.spec.ts    # Site settings validation
│   │   └── schema-1-3/
│   │       └── documents.spec.ts      # Document schema validation
│   │
│   └── support/
│       ├── fixtures/index.ts           # Playwright fixtures (network, log)
│       ├── helpers/a11y.ts            # Accessibility helper (axe-core)
│       └── constants.ts               # Block names, types, timeouts
│
├── docs/                               # Project documentation (this folder)
├── _bmad/                              # BMAD workflow system
├── _bmad-output/                       # BMAD planning/implementation artifacts
└── .github/
    └── workflows/
        └── deploy-storybook.yml        # Storybook → GitHub Pages deployment
```

## Critical Folders

| Folder | Purpose | Key Files |
|---|---|---|
| `astro-app/src/lib/` | Data layer | `sanity.ts` (queries), `types.ts` (interfaces) |
| `astro-app/src/components/blocks/custom/` | Domain blocks | 13 custom Astro components |
| `astro-app/src/components/ui/` | UI primitives | 251 shadcn/fulldev components |
| `astro-app/src/pages/` | Routes | 6 page routes including dynamic catch-all |
| `studio/src/schemaTypes/` | CMS schemas | 11 blocks, 3 documents, 4 objects |
| `tests/` | Test suite | 50+ tests (E2E + integration) |

## Entry Points

| Entry Point | Path | Description |
|---|---|---|
| Astro app | `astro-app/src/pages/index.astro` | Homepage route |
| Dynamic pages | `astro-app/src/pages/[...slug].astro` | CMS-driven pages |
| Studio | `studio/sanity.config.ts` | Sanity Studio config |
| Tests (E2E) | `playwright.config.ts` | Browser test runner |
| Tests (Integration) | `playwright.integration.config.ts` | Schema test runner |
| Client JS | `astro-app/src/scripts/main.ts` | All client-side interactivity |
