# Architecture — YWCC Capstone Sponsors

**Generated:** 2026-02-09 | **Scan Level:** Exhaustive

## 1. System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Content Editor  │────▶│  Sanity Studio   │────▶│   Sanity API    │
│  (Browser)       │     │  (studio/)       │     │   (Cloud)       │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Site Visitor    │◀────│  Static HTML     │◀────│  Astro SSG      │
│  (Browser)       │     │  (CDN/CF Pages)  │     │  (astro-app/)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 2. Technology Stack

### astro-app

| Category | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Astro | 5.x | Static site generation |
| Adapter | @astrojs/node | 9.x | Node.js standalone adapter |
| CMS Integration | @sanity/astro | 3.x | Sanity client + visual editing (stega) |
| Styling | Tailwind CSS | v4 | CSS-first utility classes |
| Typography | @tailwindcss/typography | 0.5.x | Prose styling for rich text |
| Icons | astro-icon + @iconify-json/lucide | 1.x | SVG icon system |
| UI Library | fulldev/ui via shadcn CLI | 3.x | Astro component primitives |
| React | react + react-dom | 19.x | Minimal interactive islands |
| Image | @sanity/image-url | 1.x | Sanity CDN image URL builder |
| Portable Text | @portabletext/to-html + astro-portabletext | 5.x / 0.10.x | Rich text rendering |
| Class Utils | clsx + tailwind-merge + class-variance-authority | 2.x / 3.x / 0.7.x | Conditional class composition |
| Component Docs | Storybook | 10.x | Component development and showcase |

### studio

| Category | Technology | Version | Purpose |
|---|---|---|---|
| CMS | sanity | v5 | Content management platform |
| Query Tool | @sanity/vision | 5.x | GROQ query playground |
| UI Framework | React + styled-components | 19.x / 6.x | Studio UI |
| TypeScript | typescript | 5.x | Type safety |

### Root (Testing & DevOps)

| Category | Technology | Version | Purpose |
|---|---|---|---|
| Test Runner | @playwright/test | 1.58+ | E2E and integration testing |
| Accessibility | @axe-core/playwright | 4.x | WCAG 2.1 AA auditing |
| Process Mgr | concurrently | 9.x | Parallel dev servers |

## 3. Architecture Pattern: Block-Based Page Composition

### Design Philosophy
The system uses a **toolkit-not-website** approach. A block library maps editor-friendly names to fulldev/ui component internals (vanilla Astro components via the shadcn CLI), making the design system invisible to non-technical users.

### Block Lifecycle

```
1. Schema Definition (studio/src/schemaTypes/blocks/*.ts)
   └─ defineBlock() helper merges base fields (backgroundVariant, spacing, maxWidth)

2. Schema Registration (studio/src/schemaTypes/index.ts)
   └─ Exported in schemaTypes array, added to page.blocks[] array

3. GROQ Projection (astro-app/src/lib/sanity.ts)
   └─ Type-conditional projection: _type == "heroBanner" => { heading, ... }

4. Type Definition (astro-app/src/lib/types.ts)
   └─ TypeScript interface: HeroBannerBlock extends BlockBase

5. Component Rendering (astro-app/src/components/blocks/custom/*.astro)
   └─ Astro component receives typed block props

6. Block Routing (astro-app/src/components/BlockRenderer.astro)
   └─ Switch statement routes _type to component
```

### Block Base Fields (inherited by all blocks)

| Field | Type | Options | Default |
|---|---|---|---|
| `backgroundVariant` | string | white, light, dark, primary | white |
| `spacing` | string | none, small, default, large | default |
| `maxWidth` | string | narrow, default, full | default |

## 4. Data Architecture

### Document Types

| Document | Type | Purpose |
|---|---|---|
| `page` | document | CMS-managed pages with block array |
| `siteSettings` | document (singleton) | Global site configuration |
| `sponsor` | document | Sponsor organization profiles |

### Object Types

| Object | Purpose |
|---|---|
| `seo` | SEO metadata (title, description, OG image) |
| `button` | Reusable CTA button (text, url, variant) |
| `portableText` | Rich text with images, links, callouts |
| `blockBase` | Shared block fields (background, spacing, maxWidth) |

### Block Types (11 total)

| Block | Key Fields | Category |
|---|---|---|
| `heroBanner` | heading, subheading, backgroundImages, ctaButtons, alignment | Hero |
| `featureGrid` | heading, items (icon/image/title/desc), columns | Content |
| `ctaBanner` | heading, description, ctaButtons | CTA |
| `statsRow` | heading, stats (value/label/description) | Social Proof |
| `textWithImage` | heading, content (portableText), image, imagePosition | Content |
| `logoCloud` | heading, autoPopulate, sponsors | Social Proof |
| `sponsorSteps` | heading, subheading, items (title/desc/list), ctaButtons | Content |
| `richText` | content (portableText) | Content |
| `faqSection` | heading, items (question/answer) | Content |
| `contactForm` | heading, description, successMessage | CTA |
| `sponsorCards` | heading, displayMode (all/featured/manual), sponsors | Content |

### Content Model Relationships

```
PAGE ──contains──▶ BLOCK[] (flat array, no nesting)
PAGE ──has──▶ SEO (embedded object)
SITE_SETTINGS ──configures──▶ PAGE (global nav, footer, branding)
SPONSOR ──referenced-by──▶ sponsorCards, logoCloud blocks
```

## 5. Page Templates

| Template | Layout | Use Case |
|---|---|---|
| `default` | Centered max-w-7xl container | Standard pages |
| `fullWidth` | Full-width, no constraints | Image-heavy showcases |
| `landing` | Full-width, no nav/footer | Conversion-focused pages |
| `sidebar` | 2/3 + 1/3 grid | Blog-style, filtered listings |
| `twoColumn` | Equal 2-column grid | Comparison, dual-content |

## 6. Routing

| Route | Source | Data |
|---|---|---|
| `/` | `pages/index.astro` | Sanity CMS (getPage('home')) |
| `/about` | `pages/about.astro` | Static data (lib/data/) |
| `/contact` | `pages/contact.astro` | Static data |
| `/projects` | `pages/projects.astro` | Static data |
| `/sponsors` | `pages/sponsors.astro` | Static data |
| `/[...slug]` | `pages/[...slug].astro` | Sanity CMS (dynamic) |

## 7. Client-Side Interactivity

All interactivity is vanilla TypeScript (< 5KB), event-delegated via data attributes:

| Feature | Trigger | Mechanism |
|---|---|---|
| Scroll animations | `[data-animate]` | IntersectionObserver, one-shot |
| Contact form | `[data-contact-form]` | Form submit handler, data-state |
| Hero carousel | `[data-carousel]` | 5s auto-rotate, dot navigation |

## 8. Visual Editing Integration

- **Stega encoding** via `@sanity/astro` (invisible content IDs embedded in text)
- **Draft perspective** for preview mode
- **Presentation tool** in Studio maps documents to frontend URLs
- **Resolve config** maps page slugs to routes (home → `/`, others → `/{slug}`)

## 9. Design System

### Theme Colors

| Token | Hex | Usage |
|---|---|---|
| Swiss Red | #E30613 | Primary, CTAs, accents |
| Swiss Black | #0A0A0A | Foreground text |
| Swiss White | #FFFFFF | Backgrounds |
| NJIT Red | #D22630 | Brand accent |
| NJIT Navy | #003366 | Brand accent |
| NJIT Gold | #E89B32 | Brand accent |

### Typography
- **Font:** Helvetica Neue, Helvetica, Arial, sans-serif
- **Headings:** 700 weight, -0.03em tracking, 1.05 line-height
- **Body:** 16px, 1.5 line-height, -0.01em tracking
- **Label caps utility:** 0.6875rem, uppercase, 0.12em tracking

### Border Radius
- All radii set to 0 (sharp corners, Swiss design aesthetic)
