# Component Inventory — YWCC Capstone Sponsors

**Generated:** 2026-02-09 | **Scan Level:** Exhaustive

## Summary

| Category | Count | Source |
|---|---|---|
| Custom Domain Blocks | 13 | `astro-app/src/components/blocks/custom/` |
| Pre-built UI Blocks | 102 | `astro-app/src/components/blocks/` (fulldev/ui) |
| UI Primitives | 251 files / 37 categories | `astro-app/src/components/ui/` |
| Layout Components | 4 | `astro-app/src/components/` |
| Page Templates | 5 | `astro-app/src/layouts/templates/` |
| **Total** | **375+** | |

## 1. Custom Domain Blocks

These are purpose-built for the YWCC Capstone Sponsors use case, each with a corresponding Sanity schema.

| Block | File | Sanity Schema | Description |
|---|---|---|---|
| HeroBanner | `custom/HeroBanner.astro` | `heroBanner` | Full-width hero with background image carousel, heading, subheading, CTAs |
| StatsRow | `custom/StatsRow.astro` | `statsRow` | Statistics display in 2-4 column grid |
| FeatureGrid | `custom/FeatureGrid.astro` | `featureGrid` | Feature cards in configurable 2/3/4 column grid |
| FaqSection | `custom/FaqSection.astro` | `faqSection` | Two-column FAQ with numbered accordion items |
| CtaBanner | `custom/CtaBanner.astro` | `ctaBanner` | Call-to-action with heading, description, buttons |
| TextWithImage | `custom/TextWithImage.astro` | `textWithImage` | Split layout: rich text + image (left/right) |
| LogoCloud | `custom/LogoCloud.astro` | `logoCloud` | Sponsor logo grid with auto-populate option |
| SponsorCards | `custom/SponsorCards.astro` | `sponsorCards` | Sponsor tier cards (all/featured/manual display) |
| SponsorSteps | `custom/SponsorSteps.astro` | `sponsorSteps` | Step-by-step sponsor onboarding process |
| TeamGrid | `custom/TeamGrid.astro` | N/A (static) | Team member grid grouped by team |
| ContactForm | `custom/ContactForm.astro` | `contactForm` | Dynamic form with data-state success handling |
| Timeline | `custom/Timeline.astro` | N/A (static) | Vertical timeline with alternating layout |
| RichText | `custom/RichText.astro` | `richText` | Portable text content renderer |

## 2. Pre-built UI Blocks (fulldev/ui)

102 pre-built blocks installed via shadcn CLI from the @fulldev registry. These are generic marketing/content blocks.

| Category | Variants | Description |
|---|---|---|
| Articles | 1-4 | Blog article card layouts |
| Banners | 1-2 | Notification/announcement banners |
| Blocks | 1-4 | Generic content containers |
| Contact | 1-3 | Contact form variations |
| Content | 1-6 | Text content sections |
| CTAs | 1-8 | Call-to-action sections |
| FAQs | 1-4 | FAQ section layouts |
| Features | 1-6 | Feature showcase variations |
| Footers | 1-3 | Footer layouts |
| Headers | 1-3 | Header/navigation layouts |
| Heroes | 1-14 | Hero section variations |
| Images | 1-2 | Image display blocks |
| Links | 1-2 | Link list sections |
| Logos | 1-3 | Logo cloud layouts |
| Pricings | 1-3 | Pricing table layouts |
| Products | 1-5 | Product showcase sections |
| Reviews | 1-5 | Testimonial/review sections |
| Services | 1-7 | Service listing sections |
| Skeletons | 1 | Loading skeleton block |
| Stats | 1-3 | Statistics display sections |
| Steps | 1-3 | Step process sections |
| Tables | 1 | Data table block |
| Videos | 1-4 | Video embed sections |

## 3. UI Primitives (37 categories)

Low-level component primitives from fulldev/ui. Used by custom blocks and pre-built blocks.

| Category | Files | Description |
|---|---|---|
| accordion | ~5 | Expandable content panels |
| alert | ~3 | Alert/notification components |
| auto-form | ~5 | Auto-generated form components |
| avatar | ~3 | User avatar display |
| badge | ~3 | Status/category badges |
| banner | ~3 | Banner notifications |
| button | ~5 | CTA buttons with variants (default, secondary, outline, ghost) |
| checkbox | ~3 | Checkbox inputs |
| collapsible | ~3 | Collapsible content sections |
| empty | ~2 | Empty state placeholders |
| field | ~3 | Form field wrappers |
| footer | ~5 | Footer layout primitives |
| header | ~5 | Header layout primitives |
| icon | ~3 | SVG icon display |
| image | ~3 | Image with optimization |
| input | ~3 | Text input fields |
| item | ~3 | List item component |
| label | ~2 | Form label component |
| list | ~3 | List layout component |
| logo | ~3 | Logo display component |
| marquee | ~3 | Scrolling marquee |
| native-carousel | ~5 | Native HTML carousel |
| native-select | ~3 | Native select dropdown |
| navigation-menu | ~5 | Navigation menu component |
| price | ~3 | Pricing display |
| radio-group | ~3 | Radio button groups |
| rating | ~3 | Star rating display |
| section | ~5 | Section layout wrapper (SectionContent, SectionProse, etc.) |
| separator | ~2 | Visual separator line |
| sheet | ~5 | Slide-out panel (mobile nav) |
| sidebar | ~5 | Sidebar layout |
| skeleton | ~2 | Loading skeleton |
| spinner | ~2 | Loading spinner |
| table | ~5 | Data table components |
| tabs | ~5 | Tabbed interface |
| textarea | ~3 | Multi-line text input |
| theme-toggle | ~3 | Light/dark mode toggle |
| tile | ~5 | Tile/card layout |
| video | ~3 | Video embed component |

## 4. Layout Components

| Component | File | Description |
|---|---|---|
| Header | `Header.astro` | Site header with navigation, CTA, mobile sheet menu |
| Footer | `Footer.astro` | 4-column footer with social links, contact info |
| BlockRenderer | `BlockRenderer.astro` | Central block routing switch (13 custom + 102 generic) |
| block | `block.astro` | Dynamic block renderer using import.meta.glob() |

## 5. Page Templates

| Template | File | Layout | Use Case |
|---|---|---|---|
| Default | `DefaultTemplate.astro` | `max-w-7xl` centered | Standard pages |
| FullWidth | `FullWidthTemplate.astro` | `w-full` no constraints | Image-heavy pages |
| Landing | `LandingTemplate.astro` | Full-width, no nav | Conversion pages |
| Sidebar | `SidebarTemplate.astro` | 2/3 + 1/3 grid | Blog-style pages |
| TwoColumn | `TwoColumnTemplate.astro` | Equal 2-column grid | Comparison pages |

## 6. Design System Notes

- **No React in astro-app** for UI rendering — all fulldev/ui components are pure `.astro` files
- React is included only for Sanity's visual editing integration (island architecture)
- All components use Tailwind CSS v4 utility classes
- CSS-first configuration in `global.css` (no `tailwind.config.mjs`)
- Swiss International Typographic Style aesthetic (Helvetica Neue, sharp corners, red accents)
