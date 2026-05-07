# Component Inventory

**Project:** ywcc-capstone-template v1.18.0
**Scope:** `astro-app/src/components/**`
**Generated:** 2026-04-15
**Total component files (incl. stories & tests):** ~681

## Hierarchy overview

```
src/components/
├── BlockRenderer.astro         # _type dispatcher (one case per block)
├── BlockWrapper.astro          # spacing / background / maxWidth / alignment shell
├── blocks/custom/              # 38 Sanity-backed custom blocks
├── ui/                         # 40 primitive families (shadcn + custom)
├── portable-text/              # 6 Portable Text components (+ index.ts resolver)
├── portal/                     # React islands for sponsor portal
├── react/                      # Other React islands (calendar, filter bars)
└── concepts/                   # Design-review scratchpads (some promoted to prod)
```

## 1. Custom Sanity blocks (38)

Every block corresponds 1:1 to a schema block type in `studio/src/schemaTypes/blocks/**`. All are rendered via `<BlockRenderer block={block} />` and wrapped in `<BlockWrapper>`.

### Layout & structure
| Component | Schema `_type` | Notes |
|---|---|---|
| `ColumnsBlock.astro` | `columnsBlock` | **NEW (Story 21.10)** 12-column responsive wrapper; variants: equal, wide-left, wide-right, sidebar. Supports nested blocks inside each column. |
| `Divider.astro` | `divider` | Horizontal rule with variants. |
| `AnnouncementBar.astro` | `announcementBar` | Banner with dismiss. |

### Hero & marketing
| Component | Schema `_type` | Notes |
|---|---|---|
| `HeroBanner.astro` | `heroBanner` | Variants: default, centered (semi-transparent glass card — PR #647), split, minimal. Supports CTA buttons, background images w/ LQIP. |
| `CtaBanner.astro` | `ctaBanner` | Call-to-action section with background image. |
| `TextWithImage.astro` | `textWithImage` | Two-column content + image, reversible. |
| `LogoCloud.astro` | `logoCloud` | Sponsor/partner logo grid with consistent crop. |
| `SponsorshipTiers.astro` | `sponsorshipTiers` | Tier display with tier object references. |

### Content display
| Component | Schema `_type` | Notes |
|---|---|---|
| `FeatureGrid.astro` | `featureGrid` | Feature cards with icons (iconify-lucide), columns, description (PR #f0de7bf). |
| `StatsRow.astro` | `statsRow` | Stat counters with animations. |
| `Testimonials.astro` | `testimonials` | Variants: grid, split, carousel. `testimonialSource` field controls fetch. |
| `TeamGrid.astro` | `teamGrid` | Team member cards with social links. |
| `ImageGallery.astro` | `imageGallery` | **NEW (Story 22.4)** Masonry/grid/single variants + PhotoSwipe lightbox + featured/year/category filters. |
| `ArticleList.astro` | `articleList` | Variants: default, brutalist, magazine. `contentType` controls source (articles or static). Supports newsletter CTA (Story 19.7). |
| `EventList.astro` | `eventList` | `eventStatus` filter (upcoming/past/all); calendar or card layout. |

### Forms & interaction
| Component | Schema `_type` | Notes |
|---|---|---|
| `ContactForm.astro` | `contactForm` | Full-height variant; Turnstile-ready; submits to the form endpoint configured in the block (form submissions are captured as `submission` documents in Sanity). |
| `Newsletter.astro` | `newsletter` | Email signup → Resend via `/api/subscribe`. |
| `Accordion.astro` | `accordion` | shadcn accordion wrapped with block metadata. |
| `TabsBlock.astro` | `tabsBlock` | shadcn tabs w/ Sanity-driven children. |
| `FaqSection.astro` | `faqSection` | Accordion-based Q&A. |

### Commerce & pricing
| Component | Schema `_type` | Notes |
|---|---|---|
| `PricingTable.astro` | `pricingTable` | Pricing tiers with CTA buttons. |
| `ProductShowcase.astro` | `productShowcase` | Product cards with images. |
| `ServiceCards.astro` | `serviceCards` | Alternating service layout (PR #49b5f00 alternation fix). |

### Data & editorial
| Component | Schema `_type` | Notes |
|---|---|---|
| `ComparisonTable.astro` | `comparisonTable` | `options` (columns) × `criteria` (rows); supports iconography. |
| `Timeline.astro` | `timeline` | Vertical timeline with timelineEntry objects. |
| `Pullquote.astro` | `pullquote` | Quote with avatar (PR #49b5f00 avatar fix). |
| `BeforeAfter.astro` | `beforeAfter` | Slider compare. |

### Media & embeds
| Component | Schema `_type` | Notes |
|---|---|---|
| `VideoEmbed.astro` | `videoEmbed` | YouTube-first (field renamed to `youtubeUrl` in Story 18.6). |
| `EmbedBlock.astro` | `embedBlock` | Generic iframe embed. |
| `MapBlock.astro` | `mapBlock` | Map coordinates / iframe. |
| `CountdownTimer.astro` | `countdownTimer` | Countdown to event date. |

### Social & cross-link
| Component | Schema `_type` | Notes |
|---|---|---|
| `SponsorCards.astro` | `sponsorCards` | Sponsor mini-cards. |
| `SponsorSteps.astro` | `sponsorSteps` | Partnering steps grid. |
| `ProjectCards.astro` | `projectCards` | Project preview cards. |
| `RichText.astro` | `richText` | Portable Text passthrough. |

### Essentials
| Component | Schema `_type` | Notes |
|---|---|---|
| `LinkCards.astro` | `linkCards` | Card grid of links. |
| `MetricsDashboard.astro` | `metricsDashboard` | KPI tiles. |
| `CardGrid.astro` | `cardGrid` | Generic card grid with item children. |

## 2. UI primitive families (`components/ui/` — 40)

Mostly shadcn new-york with custom additions.

### shadcn-origin (stock)
accordion, alert, avatar, badge, button, checkbox, collapsible, empty, field, input, item, label, list, navigation-menu, radio-group, select (→ native-select), sheet, sidebar, skeleton, spinner, table, tabs, textarea.

### Custom / extended
- **`section/**`** (12-column grid system — Story 17.8) — sub-components: `Section.astro`, `SectionActions.astro`, `SectionContent.astro`, `SectionGrid.astro`, `SectionMasonry.astro`, `SectionMedia.astro`, `SectionProse.astro`, `SectionProvider.astro`, `SectionSplit.astro`, `SectionSpread.astro`. Provides consistent spacing tokens (xs/sm/md/lg/xl) and container-query breakpoints.
- **`json-ld/`** — JSON-LD injector for Article / Person / Organization schema. Consumed by `/articles/[slug]`, `/authors/[slug]`, catch-all pages.
- **`video/`** — YouTube + Vimeo embed helpers using lazy-loaded iframes.
- **`marquee/`** — horizontal scrolling ticker.
- **`native-carousel/`** — CSS scroll-snap carousel (no JS dependency).
- **`logo/`** — logo component that auto-selects light/dark and plain/default variant.
- **`rating/`** — star rating display.
- **`price/`** — price formatter with locale/currency support.
- **`tile/`** — media tile with hover state.
- **`icon/`** — iconify-lucide + simple-icons wrapper.
- **`image/`** — Sanity image with LQIP blur-up + `fetchpriority` + responsive srcset.
- **`banner/`** — in-content banner.
- **`footer/`** — site footer with nav columns.
- **`header/`** — site header with nested nav dropdowns + hamburger (PR #f16cae2 breakpoint fix + accessibility improvements).
- **`theme-toggle/`** — unused in production (dark mode currently disabled per PR #6bfb656).
- **`auto-form/`** — shadcn auto-form with Zod schema binding.
- **`separator/`** — shadcn separator.

## 3. Portable Text components (`components/portable-text/` — 6)

Dispatched by the resolver map in `components/portable-text/index.ts`. Consumed by every `<RichText>` block and the catch-all Portable Text renderer.

| Component | Used for |
|---|---|
| `PortableTextCallout.astro` | Callout / note / warning blocks |
| `PortableTextImage.astro` | Inline images with caption + LQIP |
| `PortableTextInternalLink.astro` | Cross-doc references (`reference` type) |
| `PortableTextLink.astro` | External links with `target="_blank"` rules |
| `PortableTextTable.astro` | Tabular data rendered from blocks |
| `PortableTextVideoEmbed.astro` | Inline video embed |

## 4. Portal components (React)

- `PortalCard.tsx` — dashboard metric card.
- `SponsorProjects.tsx` — project list for `/portal/[sponsorSlug]`.
- Additional helpers (form controls, list filters) used by `/portal/events` and `/portal/progress`.

## 5. React islands (`components/react/`)

- `calendar-brutalist.tsx` — Schedule X calendar for `/portal/events` and `/events` (Brutalist theme).
- Related filter bars and date pickers.

## 6. Concept / story components (`components/concepts/`)

Design-review concepts; some promoted to production:

- `ProjectPageHeader` (promoted to `/projects`).
- `ProjectCardCompact` variants (used in `/projects` — Story 4.6).
- `ProjectFilterBar` — sort + filter controls on `/projects` (Story 4.6).
- `ProjectGridDense`, `ProjectEmptyState` — shared grid + fallback.

## 7. Top-level components

- `BlockRenderer.astro` — switches on `_type`, returns the matching block component. Single source of dispatch.
- `BlockWrapper.astro` — applies `background`, `spacing` (pt/pb), `maxWidth`, `alignment`, `id` anchor, `hiddenByVariant` flag. Enforces dark-bg contrast rules (PR #38b8610).

## Rendering pipeline (the contract)

1. A `page` document's `body[]` array holds block objects, each with a `_type`.
2. SSG page renders `{page.body.map(b => <BlockRenderer block={b} />)}`.
3. `BlockRenderer` dispatches by `_type` to one of the 38 `blocks/custom/*.astro` components.
4. Each block returns `<BlockWrapper {...block._meta}>…</BlockWrapper>`.
5. `BlockWrapper` applies the universal spacing/background/alignment + `gap-16` between direct children.

**Critical rule** (from `CLAUDE.md`): detail pages (sponsor / project / event) use a **single** `<Section>` with one `<SectionContent>`. Stacking multiple `<Section>` elements doubles vertical padding — this has been a recurring bug, fixed in PRs #270 (sponsors) and #275 (events).

## Storybook (187 stories)

Stories live next to components: `src/components/**/*.stories.{ts,tsx,mdx}`.
Config: `.storybook/main.ts` with Storybook 10.2.7, builder-vite, addon-docs, storybook-astro 0.1.0, and a custom `lucide-static` SVG stub plugin (bypasses `import.meta.env` crash in SSR contexts).
Deployed to GitHub Pages via `.github/workflows/deploy-storybook.yml`.
Visual regression via Chromatic.

## Testing

- Component / render tests: `astro-app/src/components/**/__tests__/*.test.ts` (Vitest).
- Block coverage: `BlockRenderer.test.ts`, `BlockWrapper.test.ts`.
- E2E visual checks: `tests/e2e/*.spec.ts` (Playwright) — see [development-guide.md](./development-guide.md).

## Agent discovery (Story 5.21 — RFC 8288 + markdown content negotiation)

- **Link headers**: every HTML response advertises `</llms.txt>; rel="describedby"`, `</llms-full.txt>; rel="alternate"`, `</sitemap-index.xml>; rel="sitemap"`, plus `<{path}.md>; rel="alternate"; type="text/markdown"` per page. The base 3 are emitted by `astro-app/public/_headers`; the per-page 4th member is appended at build time by `astro-app/scripts/append-agent-headers.mjs` (one rule per `dist/client/<path>.md` twin). `_headers` overrides strip Link/Vary off corpus self-references (`/llms.txt`, `/llms-full.txt`, `/sitemap-index.xml`, `/robots.txt`).
- **Markdown content negotiation**: when `Accept: text/markdown` is q-ranked over `text/html`, a postbuild-generated wrapper around `dist/server/entry.mjs` (`astro-app/scripts/wrap-entry-for-agents.mjs`) intercepts the request and returns the `.md` twin via the `ASSETS` binding with `content-type: text/markdown; charset=utf-8`, `Vary: Accept`, `x-markdown-tokens` (length÷4 heuristic), and the full Link header. HTML wins ties; excluded paths (`/portal/**`, `/auth/**`, `/student/**`, `/demo/**`, `/api/**`) and direct `.md` requests fall through to the adapter without 406.
- **Why a wrapper**: `@astrojs/cloudflare` v13 short-circuits prerendered HTML inside its worker entry (`if (app.manifest.assets.has(path)) return env.ASSETS.fetch(...)`) **before** Astro's middleware runs. The wrapper layer sits in front of that adapter handler so negotiation can fire on prerendered routes. `wrangler.jsonc` therefore needs `assets.run_worker_first: true`.
- **Pure functions** in `astro-app/src/lib/agent-discovery.ts` (q-value parsing, twin path resolution, exclusion check, token estimate) — exhaustively unit-tested. The wrapper inlines an equivalent JS port (Cloudflare entry can't reach src/), kept in lock-step via shared AC.
- **Multi-site**: top-level `assets` config in `wrangler.jsonc` applies to all six Workers; `_headers` is bundled by every build; the per-page rules script enumerates whatever `.md` twins each site emits (capstone ~36, rwc-us ~16, rwc-intl ~5, preview Workers 0 because `astro-llms-md` is gated off when visual editing is on).

## Notable component changes since 2026-03

- **Added:** ColumnsBlock (21.10), ImageGallery w/ PhotoSwipe (22.4), `section/*` grid sub-components (17.8), category archive layouts (19.10), author detail layouts (20.2, 20.3), ProjectFilterBar + variants (4.6).
- **Refactored:** articleList to reuse ArticleCard + brutalist/magazine variants (1.16.0), testimonials split + carousel fixes (PR #49b5f00), contact form image bleed (PR #f0de7bf), feature grid columns/description (PR #f0de7bf), pullquote avatar (PR #49b5f00), service cards alternation (PR #49b5f00), outline button hover on dark CTAs (PR #5613cbc), hero centered glass-card transparency (PR #c442934).
- **Schema renames** reflected in blocks (Story 18.6): videoUrl → youtubeUrl, source → contentType, filterBy → eventStatus, comparisonTable columns/rows → options/criteria, newsletter *Text → *Label.
- **Accessibility + nav:** header nav dropdowns (PR #bca74af, PR #f16cae2), mobile nav parent clickable, hamburger breakpoint lowered.
- **Sponsor logos:** square + horizontal variants applied consistently across LogoCloud, SponsorCards, SponsorSteps, sponsor detail pages.
