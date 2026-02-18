# Component Inventory

**Generated:** 2026-02-13 | **Mode:** Exhaustive Rescan | **Workflow:** document-project v1.2.0

## Summary

| Category | Count | Location |
|----------|-------|----------|
| Custom Sanity blocks | 11 | `astro-app/src/components/blocks/custom/` |
| UI variant blocks | ~100 | `astro-app/src/components/blocks/` |
| UI primitives | ~39 | `astro-app/src/components/ui/` |
| Layout components | 7 | `astro-app/src/components/` + `layouts/` |
| Page templates | 5 | `astro-app/src/layouts/templates/` |
| **Total** | **~507** | |

## Custom Sanity Block Components (11)

These are the primary content blocks backed by Sanity schemas. Each has a `.astro` component, `.stories.ts` Storybook story, unit test, and typed fixture.

| Component | File | Schema _type | Test | Fixture |
|-----------|------|-------------|------|---------|
| ContactForm | `blocks/custom/ContactForm.astro` | contactForm | ContactForm.test.ts | contact-form.ts |
| CtaBanner | `blocks/custom/CtaBanner.astro` | ctaBanner | CtaBanner.test.ts | cta-banner.ts |
| FaqSection | `blocks/custom/FaqSection.astro` | faqSection | FaqSection.test.ts | faq-section.ts |
| FeatureGrid | `blocks/custom/FeatureGrid.astro` | featureGrid | FeatureGrid.test.ts | feature-grid.ts |
| HeroBanner | `blocks/custom/HeroBanner.astro` | heroBanner | HeroBanner.test.ts | hero-banner.ts |
| LogoCloud | `blocks/custom/LogoCloud.astro` | logoCloud | LogoCloud.test.ts | logo-cloud.ts |
| RichText | `blocks/custom/RichText.astro` | richText | RichText.test.ts | rich-text.ts |
| SponsorCards | `blocks/custom/SponsorCards.astro` | sponsorCards | SponsorCards.test.ts | sponsor-cards.ts |
| SponsorSteps | `blocks/custom/SponsorSteps.astro` | sponsorSteps | SponsorSteps.test.ts | sponsor-steps.ts |
| StatsRow | `blocks/custom/StatsRow.astro` | statsRow | StatsRow.test.ts | stats-row.ts |
| TextWithImage | `blocks/custom/TextWithImage.astro` | textWithImage | TextWithImage.test.ts | text-with-image.ts |

### Block Features

| Block | CTA Buttons | Images | References | Portable Text |
|-------|------------|--------|------------|--------------|
| HeroBanner | Yes | Background images[] | — | — |
| FeatureGrid | — | Per-item | — | — |
| CtaBanner | Yes | — | — | — |
| StatsRow | — | — | — | — |
| TextWithImage | — | Side image | — | Yes (content) |
| LogoCloud | — | — | Sponsor[] (optional) | — |
| SponsorSteps | Yes | — | — | — |
| RichText | — | Inline images | — | Yes (content) |
| FaqSection | — | — | — | Yes (answers) |
| ContactForm | — | — | — | — |
| SponsorCards | — | — | Sponsor[] (optional) | — |

## UI Variant Blocks (~100)

fulldev/ui template blocks providing styling variations. Each has a Storybook story.

| Category | Variants | Examples |
|----------|----------|---------|
| Hero | 14 | hero-1 through hero-14 |
| Features | 6 | features-1 through features-6 |
| CTA | 8 | cta-1 through cta-8 |
| Services | 7 | services-1 through services-7 |
| Content | 6 | content-1 through content-6 |
| Reviews | 5 | reviews-1 through reviews-5 |
| Products | 5 | products-1 through products-5 |
| FAQs | 4 | faqs-1 through faqs-4 |
| Articles | 4 | articles-1 through articles-4 |
| Videos | 4 | videos-1 through videos-4 |
| Stats | 3 | stats-1 through stats-3 |
| Steps | 3 | steps-1 through steps-3 |
| Pricings | 3 | pricings-1 through pricings-3 |
| Logos | 3 | logos-1 through logos-3 |
| Contact | 3 | contact-1 through contact-3 |
| Footer | 3 | footer-1 through footer-3 |
| Header | 3 | header-1 through header-3 |
| Banner | 2 | banner-1, banner-2 |
| Images | 2 | images-1, images-2 |
| Links | 2 | links-1, links-2 |
| Video | 3 | video-1 through video-3 |
| Blocks | 4 | blocks-1 through blocks-4 |
| Product | 1 | product-1 |
| Table | 1 | table-1 |
| Article | 4 | article-1 through article-4 |

## UI Primitive Components (~39)

shadcn/ui-style components from fulldev/ui, installed via the shadcn CLI.

| Component | Path |
|-----------|------|
| Accordion | `ui/accordion/` |
| Alert | `ui/alert/` |
| Avatar | `ui/avatar/` |
| Badge | `ui/badge/` |
| Banner | `ui/banner/` |
| Button | `ui/button/` |
| Checkbox | `ui/checkbox/` |
| Collapsible | `ui/collapsible/` |
| Empty | `ui/empty/` |
| Field | `ui/field/` |
| Footer | `ui/footer/` |
| Header | `ui/header/` |
| Icon | `ui/icon/` |
| Image | `ui/image/` |
| Input | `ui/input/` |
| Item | `ui/item/` |
| Label | `ui/label/` |
| List | `ui/list/` |
| Logo | `ui/logo/` |
| *(and ~20 more)* | |

## Layout Components (7)

| Component | File | Purpose |
|-----------|------|---------|
| Layout | `layouts/Layout.astro` | Main HTML layout: head, meta, CSP, GA4, visual editing |
| Header | `components/Header.astro` | Site header with navigation from siteSettings |
| Footer | `components/Footer.astro` | Site footer with links, social, copyright |
| BlockRenderer | `components/BlockRenderer.astro` | Dynamic block dispatch by _type |
| BlockWrapper | `components/BlockWrapper.astro` | Block layout: background, spacing, maxWidth |
| SanityPageContent | `components/SanityPageContent.astro` | Page content wrapper |
| VisualEditingMPA | `components/VisualEditingMPA.tsx` | React: Presentation Tool visual editing |

## Page Templates (5)

| Template | File | Layout |
|----------|------|--------|
| Default | `templates/DefaultTemplate.astro` | Standard constrained width |
| Full Width | `templates/FullWidthTemplate.astro` | Full-width blocks |
| Landing | `templates/LandingTemplate.astro` | Full-width, minimal nav |
| Sidebar | `templates/SidebarTemplate.astro` | Two-column with sidebar |
| Two Column | `templates/TwoColumnTemplate.astro` | Two equal columns |

## Block Registration System

The block registry (`block-registry.ts`) auto-discovers components at build time:

```
Custom blocks:  import.meta.glob('./blocks/custom/*.astro')
                PascalCase → camelCase _type mapping
                e.g., HeroBanner.astro → heroBanner

UI blocks:      import.meta.glob('./blocks/*.astro')
                kebab-case filenames used directly as _type
                e.g., hero-1.astro → hero-1
```

`BlockRenderer.astro` resolves the component from the registry by `_type` and spreads all block props.

## Test Coverage

| Layer | Files | Cases | Coverage |
|-------|-------|-------|----------|
| Component tests | 13 | — | All 11 custom blocks + BlockRenderer + BlockWrapper |
| Unit tests | 3 | — | sanity.ts, image.ts, utils.ts |
| SSR smoke tests | 3 | — | Cloudflare Worker build validation |
| Integration tests | 19 | 241 | Schema, types, data wiring, templates |
| E2E tests | 4 | 34 | Pages, a11y, content rendering (5 browsers) |
