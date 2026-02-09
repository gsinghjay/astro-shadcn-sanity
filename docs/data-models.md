# Data Models — YWCC Capstone Sponsors

**Generated:** 2026-02-09 | **Scan Level:** Exhaustive

## Overview

This project uses Sanity.io as its headless CMS. Data is modeled as document types, object types, and block types. Content is queried via GROQ and consumed at build time by Astro SSG.

## Document Types (3)

### page

The core content document. Pages are composed from a flat array of block objects.

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | Page display title |
| `slug` | slug | Yes | URL slug (auto-generated from title) |
| `template` | string | No | Layout template (default, fullWidth, landing, sidebar, twoColumn) |
| `seo` | seo (object) | No | SEO metadata |
| `blocks` | array | No | Flat array of 13 block types |

**Field Groups:** layout, content, seo

**Block types accepted:** heroBanner, featureGrid, sponsorCards, richText, ctaBanner, faqSection, contactForm, timeline, logoCloud, statsRow, teamGrid, textWithImage, sponsorSteps

**Insert Menu Groups:**
- Heroes & Banners: heroBanner, ctaBanner
- Content & Text: richText, textWithImage, featureGrid, faqSection
- Media & Data: logoCloud, statsRow
- Social Proof: sponsorCards, sponsorSteps
- Calls to Action: contactForm

### siteSettings (singleton)

Global site configuration. Only one instance allowed (fixed document ID: `siteSettings`).

| Field | Type | Required | Description |
|---|---|---|---|
| `siteName` | string | Yes | Site display name |
| `siteDescription` | string | No | Site tagline/description |
| `logo` | image | No | Primary logo (with alt text) |
| `logoLight` | image | No | Light-on-dark logo variant for footer |
| `ctaButton` | object | No | Header CTA button (text + URL) |
| `navigationItems` | array | No | Nav items (label, href, sub-items) |
| `footerContent` | text | No | Footer description text |
| `copyrightText` | string | No | Copyright line |
| `socialLinks` | array | No | Social platform links (github, linkedin, twitter, instagram, youtube) |
| `address` | text | No | Physical address |
| `email` | string | No | Contact email |
| `phone` | string | No | Contact phone |
| `footerLinks` | array | No | Footer link column items |
| `resourceLinks` | array | No | Resource link column items (with external flag) |
| `programLinks` | array | No | Program link column items |
| `currentSemester` | string | No | Active semester label |

**Field Groups:** Navigation & Branding, Footer & Contact, Links & Settings

### sponsor

Sponsor organization profiles referenced by sponsorCards and logoCloud blocks.

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Sponsor organization name |
| `slug` | slug | Yes | URL slug (auto-generated from name) |
| `logo` | image | Yes | Sponsor logo (with required alt text) |
| `description` | text | No | About the sponsor |
| `website` | url | No | Sponsor website URL |
| `industry` | string | No | Industry category |
| `tier` | string | No | Sponsorship tier (platinum, gold, silver, bronze) |
| `featured` | boolean | No | Highlight sponsor (default: false) |

## Object Types (4)

### seo

SEO metadata embedded in page documents.

| Field | Type | Validation | Description |
|---|---|---|---|
| `metaTitle` | string | Max 60 chars | Page meta title |
| `metaDescription` | text | Max 160 chars | Page meta description |
| `ogImage` | image | 1200x630 recommended | Open Graph image (with required alt text) |

### button

Reusable CTA button object used in multiple block types.

| Field | Type | Required | Description |
|---|---|---|---|
| `text` | string | Yes | Button display text |
| `url` | url | Yes | Valid HTTP(S), mailto, or tel URL |
| `variant` | string | No | Style variant (default, secondary, outline, ghost) |

### portableText

Rich text editor configuration supporting structured content.

**Text Styles:** normal, h2, h3, h4, blockquote
**Decorators:** bold, italic, code, underline
**Links:** External URLs, internal page references
**Lists:** Bullet, numbered
**Custom blocks:**
- Image (with required alt text, optional caption)
- Callout box (with tone: info, warning, success)

### blockBase

Shared base fields inherited by all block types via `defineBlock()` helper.

| Field | Type | Options | Default |
|---|---|---|---|
| `backgroundVariant` | string | white, light, dark, primary | white |
| `spacing` | string | none, small, default, large | default |
| `maxWidth` | string | narrow, default, full | default |

## Block Types (11)

All blocks inherit `blockBase` fields via the `defineBlock()` helper.

### heroBanner
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `heading` | string | Yes | - | Main heading text |
| `subheading` | string | No | - | Supporting text |
| `backgroundImages` | array[image] | No | - | Carousel images (with alt text) |
| `ctaButtons` | array[button] | No | - | CTA buttons |
| `alignment` | string | No | center | Text alignment (left, center, right) |

### featureGrid
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `heading` | string | No | - | Section heading |
| `items` | array[object] | No | - | Feature items |
| `columns` | number | No | 3 | Column count (2, 3, or 4) |

**Item fields:** icon (string), image (image with alt), title (string, required), description (text)

### ctaBanner
| Field | Type | Required | Description |
|---|---|---|---|
| `heading` | string | Yes | CTA heading |
| `description` | text | No | Supporting text |
| `ctaButtons` | array[button] | No | Action buttons |

### statsRow
| Field | Type | Required | Description |
|---|---|---|---|
| `heading` | string | No | Section heading |
| `stats` | array[object] | No | Statistics items |

**Stat fields:** value (string, required), label (string, required), description (string)

### textWithImage
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `heading` | string | No | - | Section heading |
| `content` | portableText | No | - | Rich text content |
| `image` | image | No | - | Featured image (with hotspot, required alt) |
| `imagePosition` | string | No | right | Image side (left, right) |

### logoCloud
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `heading` | string | No | - | Section heading |
| `autoPopulate` | boolean | No | true | Auto-pull all sponsor logos |
| `sponsors` | array[reference→sponsor] | No | - | Manual sponsor selection (hidden when autoPopulate=true) |

### sponsorSteps
| Field | Type | Required | Description |
|---|---|---|---|
| `heading` | string | No | Section heading |
| `subheading` | string | No | Supporting text |
| `items` | array[object] | No | Step items |
| `ctaButtons` | array[button] | No | Action buttons |

**Item fields:** title (string, required), description (text), list (array[string])

### richText
| Field | Type | Required | Description |
|---|---|---|---|
| `content` | portableText | No | Full rich text content |

### faqSection
| Field | Type | Required | Description |
|---|---|---|---|
| `heading` | string | No | Section heading |
| `items` | array[object] | No | FAQ items |

**Item fields:** question (string, required), answer (text, required)

### contactForm
| Field | Type | Required | Description |
|---|---|---|---|
| `heading` | string | No | Form heading |
| `description` | text | No | Form description |
| `successMessage` | string | No | Success message text |

### sponsorCards
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `heading` | string | No | - | Section heading |
| `displayMode` | string | No | all | Display mode (all, featured, manual) |
| `sponsors` | array[reference→sponsor] | No | - | Manual selection (hidden unless displayMode=manual) |

## GROQ Queries

### Site Settings Query
```groq
*[_type == "siteSettings"][0] {
  siteName, siteDescription, logo, logoLight, ctaButton,
  navigationItems[], footerContent, copyrightText,
  socialLinks[], address, email, phone,
  footerLinks[], resourceLinks[], programLinks[], currentSemester
}
```

### Page by Slug Query
```groq
*[_type == "page" && slug.current == $slug][0] {
  title, slug, template, seo,
  blocks[] {
    _type, _key, backgroundVariant, spacing, maxWidth,
    _type == "heroBanner" => { heading, subheading, backgroundImages, ctaButtons, alignment },
    _type == "featureGrid" => { heading, items, columns },
    // ... type-conditional projections for all 11+ block types
  }
}
```

### All Page Slugs Query
```groq
*[_type == "page"]{ "slug": slug.current }
```

## Content Model Relationships

```
PAGE ──contains──▶ BLOCK[] (flat array, no nesting)
PAGE ──has──▶ SEO (embedded object)
SITE_SETTINGS ──configures──▶ All pages (global nav, footer, branding)
SPONSOR ──referenced-by──▶ sponsorCards block (manual mode)
SPONSOR ──referenced-by──▶ logoCloud block (manual mode)
```
