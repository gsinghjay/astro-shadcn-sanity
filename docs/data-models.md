# Data Models

**Generated:** 2026-02-13 | **Mode:** Exhaustive Rescan | **Workflow:** document-project v1.2.0

## Overview

| Category | Count | Location |
|----------|-------|----------|
| Document types | 3 | `studio/src/schemaTypes/documents/` |
| Block types | 11 | `studio/src/schemaTypes/blocks/` |
| Object types | 8 | `studio/src/schemaTypes/objects/` |
| **Total schema types** | **22** | `studio/src/schemaTypes/index.ts` |

All schemas use `defineType` / `defineField` from the Sanity SDK. Block schemas use a custom `defineBlock()` helper that auto-injects base layout fields.

## Document Types

### page (`studio/src/schemaTypes/documents/page.ts`)

Content pages with composable block arrays.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | Page name |
| slug | slug | Yes | Auto-generated from title, max 96 chars |
| template | string | Yes | default, fullWidth, landing, sidebar, twoColumn |
| seo | seo (object) | No | SEO metadata |
| blocks | array | No | Array of 11 block types |

**Validation:** Custom validator warns if wide blocks (heroBanner, statsRow, logoCloud, sponsorCards) are used in constrained templates (sidebar, twoColumn).

**Insert Menu Groups:** Heroes, Content, Media & Stats, Social Proof, Calls to Action

**Preview:** Grid layout with block preview images from `/static/block-previews/{type}.png`

### siteSettings (`studio/src/schemaTypes/documents/site-settings.ts`)

Singleton document for global site configuration. Fixed ID: `siteSettings`.

| Group | Field | Type | Notes |
|-------|-------|------|-------|
| Branding | siteName | string (required) | Site name |
| Branding | siteDescription | text | Description |
| Branding | logo | image (required) | Main logo, alt text required |
| Branding | logoLight | image | Light variant for footer, alt text required |
| Navigation | ctaButton | button (object) | Header CTA |
| Navigation | navigationItems | link[] | Top nav items (children supported but not rendered) |
| Footer | footerContent | object | text + copyrightText |
| Footer | footerLinks | link[] | Bottom bar links |
| Footer | resourceLinks | link[] | Resources section |
| Footer | programLinks | link[] | Programs section |
| Social & Contact | socialLinks | array | github, linkedin, twitter, instagram, youtube |
| Social & Contact | contactInfo | object | address, email, phone |
| Social & Contact | currentSemester | string | e.g., "Fall 2026" |

**Singleton Management:** Restricted document actions (publish, discardChanges, restore only). Excluded from new document menu.

### sponsor (`studio/src/schemaTypes/documents/sponsor.ts`)

Sponsor profiles for the logo cloud and sponsor cards.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | Yes | Sponsor name |
| slug | slug | Yes | Auto-generated from name |
| logo | image | Yes | Alt text required |
| description | text | No | Sponsor description |
| website | url | No | Sponsor website |
| industry | string | No | Industry sector |
| tier | string | No | platinum, gold, silver, bronze |
| featured | boolean | No | Default: false |

**Referenced by:** logoCloud (auto-populate or manual), sponsorCards (all/featured/manual display modes)

## Block Types (11)

All blocks inherit base layout fields via `defineBlock()`:

| Base Field | Type | Options | Default |
|------------|------|---------|---------|
| backgroundVariant | string (radio) | white, light, dark, primary | white |
| spacing | string (radio) | none, small, default, large | default |
| maxWidth | string (radio) | narrow, default, full | default |

### heroBanner

| Field | Type | Notes |
|-------|------|-------|
| heading | string (required) | Hero heading |
| subheading | string | Subtitle |
| backgroundImages | image[] | Alt text required per image |
| ctaButtons | button[] | Call-to-action buttons |
| alignment | string (radio) | left, center, right (default: center) |

### featureGrid

| Field | Type | Notes |
|-------|------|-------|
| heading | string | Section heading |
| items | featureItem[] | Feature items with icon/image |
| columns | number | 2, 3, or 4 (default: 3) |

### ctaBanner

| Field | Type | Notes |
|-------|------|-------|
| heading | string (required) | CTA heading |
| description | text | Description text |
| ctaButtons | button[] | Action buttons |

### statsRow

| Field | Type | Notes |
|-------|------|-------|
| heading | string | Section heading |
| stats | statItem[] | Stat value + label pairs |

### textWithImage

| Field | Type | Notes |
|-------|------|-------|
| heading | string | Section heading |
| content | portableText | Rich text content |
| image | image | Side image, hotspot enabled, alt required |
| imagePosition | string | left or right (default: right) |

### logoCloud

| Field | Type | Notes |
|-------|------|-------|
| heading | string | Section heading |
| autoPopulate | boolean | Auto-pull all sponsors (default: true) |
| sponsors | sponsor[] (refs) | Manual selection, hidden when autoPopulate=true |

### sponsorSteps

| Field | Type | Notes |
|-------|------|-------|
| heading | string | Section heading |
| subheading | string | Subtitle |
| items | stepItem[] | Process steps |
| ctaButtons | button[] | Action buttons |

### richText

| Field | Type | Notes |
|-------|------|-------|
| content | portableText | Full Portable Text content |

### faqSection

| Field | Type | Notes |
|-------|------|-------|
| heading | string | Section heading |
| items | faqItem[] | Question + answer pairs |

### contactForm

| Field | Type | Notes |
|-------|------|-------|
| heading | string (required) | Form heading |
| description | text | Form description |
| successMessage | string | Shown after submission |

### sponsorCards

| Field | Type | Notes |
|-------|------|-------|
| heading | string | Section heading |
| displayMode | string | all, featured, or manual (default: all) |
| sponsors | sponsor[] (refs) | Manual selection, hidden unless displayMode=manual |

## Object Types (8)

### seo

| Field | Type | Notes |
|-------|------|-------|
| metaTitle | string | Max 60 chars |
| metaDescription | text | Max 160 chars |
| ogImage | image | 1200x630 recommended, alt required |

### button

| Field | Type | Notes |
|-------|------|-------|
| text | string (required) | Button label |
| url | string (required) | Validated: /path, http(s)://, mailto:, tel: |
| variant | string | default, secondary, outline, ghost |

Exports `buttonFields` array for composition in other schemas.

### link

| Field | Type | Notes |
|-------|------|-------|
| label | string (required) | Link text |
| href | string (required) | Validated: /path, #anchor, http(s)://, mailto:, tel: |
| external | boolean | Default: false |

Exports `linkFields` array for composition in other schemas.

### portableText

Rich text array type supporting:

- **Styles:** Normal, H2, H3, H4, Blockquote
- **Decorators:** Bold, Italic, Code, Underline
- **Lists:** Bullet, Numbered
- **Annotations:** External link (url), Internal link (page reference)
- **Custom blocks:** Image (hotspot, required alt, optional caption), Callout (info/warning/success tone)

### faqItem

| Field | Type | Notes |
|-------|------|-------|
| question | string (required) | FAQ question |
| answer | portableText (required) | Rich text answer |

### featureItem

| Field | Type | Notes |
|-------|------|-------|
| icon | string | Icon name |
| image | image | Hotspot enabled, alt required |
| title | string (required) | Feature title |
| description | text | Feature description |

### statItem

| Field | Type | Notes |
|-------|------|-------|
| value | string (required) | e.g., "50+", "$2M", "98%" |
| label | string (required) | Stat label |
| description | string | Additional context |

### stepItem

| Field | Type | Notes |
|-------|------|-------|
| title | string (required) | Step title |
| description | text | Step description |
| list | string[] | Bullet points |

## GROQ Queries

All queries are defined using `defineQuery()` in `astro-app/src/lib/sanity.ts` for TypeGen integration.

### SITE_SETTINGS_QUERY

Fetches the singleton siteSettings document with all navigation, footer, branding, social, and contact data.

### ALL_PAGE_SLUGS_QUERY

Returns all page slugs as an array for static path generation in `getStaticPaths()`.

### PAGE_BY_SLUG_QUERY

Fetches a single page by slug with type-conditional block projections for all 11 block types. Each block type has its own GROQ projection to select only the relevant fields.

### Data Fetching Functions

| Function | Purpose |
|----------|---------|
| `loadQuery<T>(query, params)` | Wrapper handling stega encoding + draft perspective |
| `getSiteSettings()` | Fetches siteSettings with module-level caching |
| `getPage(slug)` | Fetches single page with all blocks |

## TypeGen Integration

- **Schema extraction:** `npm run typegen` in studio/ extracts `schema.json`
- **Type generation:** Generates `astro-app/src/sanity.types.ts` (1033 lines)
- **Type adapters:** `astro-app/src/lib/types.ts` re-exports generated types
- **Watch mode:** TypeGen watches `../astro-app/src/**/*.{ts,tsx,js,jsx}` for query changes
