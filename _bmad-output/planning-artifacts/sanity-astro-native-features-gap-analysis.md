# Native Features Gap Analysis - Sanity & Astro

> **Date:** 2026-02-09
> **Project:** astro-shadcn-sanity
> **Sanity Project ID:** 49nk9b0w | **Dataset:** production
> **Astro Version:** 5.11.0 | **Adapter:** @astrojs/node v9.5.2
> **Sanity SDK Version:** ^5.8.1 | **API Version:** 2024-12-08

---

## Table of Contents

### Part 1: Sanity Features
- [Current Sanity Feature Usage Inventory](#current-feature-usage-inventory)
- [Tier 1 - High Impact / Low Effort](#tier-1---high-impact--low-effort)
- [Tier 2 - High Impact / Medium Effort](#tier-2---high-impact--medium-effort)
- [Tier 3 - Medium Impact / Specialized](#tier-3---medium-impact--specialized)
- [Tier 4 - Nice to Have / Situational](#tier-4---nice-to-have--situational)
- [Top 5 Sanity Recommendations Summary](#top-5-recommendations-summary)

### Part 2: Astro Features
- [Current Astro Feature Usage Inventory](#current-astro-feature-usage-inventory)
- [Astro Tier 1 - High Impact / Low Effort](#astro-tier-1---high-impact--low-effort)
- [Astro Tier 2 - High Impact / Medium Effort](#astro-tier-2---high-impact--medium-effort)
- [Astro Tier 3 - Medium Impact / Specialized](#astro-tier-3---medium-impact--specialized)
- [Astro Tier 4 - Nice to Have / Situational](#astro-tier-4---nice-to-have--situational)
- [Top 5 Astro Recommendations Summary](#top-5-astro-recommendations-summary)
- [Combined Priority Matrix](#combined-priority-matrix)

---

## Current Feature Usage Inventory

The following Sanity features are actively in use across the project today.

### Studio Plugins & Tools

| Feature | Package | Usage |
|---------|---------|-------|
| Structure Tool | `sanity/structure` | Custom desk structure, singleton pattern for siteSettings, document type filtering, dividers |
| Presentation Tool | `sanity/presentation` | Visual editing with live preview, location resolver for slug-based pages, preview URL at localhost:4321 |
| Vision Tool | `@sanity/vision` v5.8.1 | GROQ query playground for development |

### Astro Integration

| Feature | Package | Usage |
|---------|---------|-------|
| Sanity Astro | `@sanity/astro` v3.2.11 | Core CMS integration with stega encoding for visual editing |
| Image URL Builder | `@sanity/image-url` v1.2.0 | Image CDN URL generation via `urlFor()` helper |
| Sanity Types | `@sanity/types` v3.48.1 | TypeScript type definitions |
| GROQ | `groq` v3.48.1 | Tagged template literals for GROQ queries |
| Portable Text | `astro-portabletext` v0.10.0 | Rich text rendering in Astro components |

### Schema Features

- **Document types:** page, siteSettings (singleton), sponsor
- **Object types:** seo, button, portableText, block-base
- **13 block types:** heroBanner, featureGrid, ctaBanner, statsRow, textWithImage, logoCloud, sponsorSteps, richText, faqSection, contactForm, sponsorCards, timeline (scaffolded), teamGrid (scaffolded)
- **Field types in use:** string, text, number, boolean, url, array, object, image (with hotspot), slug, reference
- **Validation:** required(), max(), uri(), custom()
- **Preview configurations** on all block types
- **Field groups** on page type (layout, content, seo)
- **Insert menu** with grouped block filters

### GROQ Query Features

- Array slicing (`[0]`)
- Filter conditions (`defined()`, `_type ==`)
- Reference resolution (`->`)
- Projections with nested fields
- Aliases (`"slug": slug.current`)
- Type-conditional projections (`_type == "X" =>`)
- `select()` function for conditional data fetching
- parameterized queries

### Visual Editing & Data Fetching

- Stega encoding (toggled via env var)
- Draft perspective (`previewDrafts`) vs published perspective
- Result source maps with `withKeyArraySelector`
- Read token for authenticated preview access
- Module-level memoization for siteSettings
- `getStaticPaths()` for static route generation
- `filterResponse: false` for raw API response access

### Image Handling

- Hotspot enabled on all image fields
- Required alt text on all images
- Optional caption on portable text images
- Light/dark logo variants on siteSettings

---

## Tier 1 - High Impact / Low Effort

### 1. AI Assist Plugin

- **Package:** `@sanity/assist`
- **Status:** Not installed
- **What it does:**
  - Auto-generates alt text for images using AI vision
  - Provides per-field content generation instructions
  - Full document translation with configurable language field
  - Smart reference suggestions powered by embeddings index
  - Configurable style guides for tone and voice consistency
- **Why it matters for this project:**
  - Every image field in the project has a required `alt` field that editors must manually fill. AI Assist auto-populates alt text, dramatically improving accessibility compliance with zero editorial effort.
  - Content generation instructions could help editors create consistent block content (e.g., FAQ answers, feature descriptions).
  - Translation support opens the door to multi-language content without major schema changes.
- **Implementation complexity:** Low - plugin install + config in `sanity.config.ts`
- **Schema changes required:** None (works with existing image fields)
- **Configuration example:**

```typescript
// sanity.config.ts
import { assist } from '@sanity/assist'

export default defineConfig({
  plugins: [
    assist({
      translate: {
        document: {
          languageField: 'language', // if/when i18n is added
        }
      }
    })
  ]
})
```

```typescript
// Schema: enable auto alt text on any image field
defineField({
  type: 'image',
  name: 'heroImage',
  options: {
    hotspot: true,
    aiAssist: {
      imageDescriptionField: 'alt',
    },
  },
  fields: [
    defineField({ type: 'string', name: 'alt', title: 'Alt text' }),
  ],
})
```

---

### 2. TypeGen (Type Generation)

- **Tool:** `sanity typegen` CLI command
- **Status:** Not configured
- **What it does:**
  - Generates TypeScript types directly from GROQ queries and schema definitions
  - End-to-end type safety from Sanity schema to frontend components
  - Catches field name mismatches, missing projections, and type errors at build time
  - Integrates with the build pipeline for CI validation
- **Why it matters for this project:**
  - The `pageBySlugQuery` contains massive type-conditional projections across 13 block types. A single typo in a field name results in silent `undefined` values at runtime. TypeGen catches these at build time.
  - The BlockRenderer component switches on `_type` across 13+ cases - generated types ensure every case handles the correct shape.
  - As more blocks are added, type safety prevents regression in existing block rendering.
- **Implementation complexity:** Low-Medium - CLI setup + extraction config
- **Schema changes required:** None

---

### 3. Scheduled Publishing

- **Package:** `@sanity/scheduled-publishing`
- **Status:** Not installed
- **What it does:**
  - Adds a "Schedule" action to the document toolbar
  - Documents publish automatically at a specified date/time
  - Calendar view of all upcoming scheduled publishes
  - Can restrict scheduling to specific document types via custom document actions
  - Server-side execution (publishes even if Studio is closed)
- **Why it matters for this project:**
  - The site has semester-based content (current semester field in siteSettings, sponsor tiers, event timelines). Scheduling allows pre-staging content for semester transitions.
  - Sponsor additions or tier changes can be prepared in advance and published at partnership announcement dates.
  - Page content updates can be timed to align with marketing campaigns or events.
- **Implementation complexity:** Low - plugin install + optional document action filtering
- **Schema changes required:** None
- **Configuration example:**

```typescript
// sanity.config.ts
import { scheduledPublishing } from '@sanity/scheduled-publishing'

export default defineConfig({
  plugins: [
    scheduledPublishing(),
  ],
})
```

---

### 4. GROQ-Powered Webhooks

- **Feature:** Native Sanity webhook system with GROQ filtering
- **Status:** Not configured
- **What it does:**
  - Fires HTTP requests when content changes in the dataset
  - GROQ filter determines which changes trigger the webhook
  - GROQ projection controls the payload shape
  - Supports secret-based authentication for security
  - Configurable via Sanity management dashboard or API
- **Why it matters for this project:**
  - **Astro rebuild trigger:** When any page or siteSettings document is published, a webhook can trigger a site rebuild/deploy (e.g., via Vercel deploy hook, Netlify build hook, or GitHub Actions)
  - **Slack/Discord notifications:** Alert the team when new sponsors are added, pages are published, or site settings change
  - **External sync:** Push sponsor data to external CRM or reporting tools when sponsor documents change
  - **Cache invalidation:** Purge CDN cache for specific pages when their content updates
- **Implementation complexity:** Low - configuration in Sanity dashboard, no code changes
- **Schema changes required:** None
- **Example webhook GROQ filter:**

```groq
// Only fire when page or siteSettings documents are published
_type in ["page", "siteSettings"] && !(_id in path("drafts.**"))
```

```groq
// Webhook projection - send only what the receiver needs
{
  _type,
  _id,
  "slug": slug.current,
  title,
  _updatedAt
}
```

---

## Tier 2 - High Impact / Medium Effort

### 5. Content Releases

- **Feature:** Native Sanity Content Releases system
- **Status:** Not in use
- **What it does:**
  - Bundle multiple document changes into a single coordinated release
  - Preview all bundled changes together before publishing
  - Schedule entire releases for a specific date/time
  - Atomic publishing - all documents in a release publish simultaneously
  - Release-aware GROQ functions: `sanity::versionOf()`, `sanity::partOfRelease()`, `releases::all()`
  - Perspective-based querying with release IDs
- **Why it matters for this project:**
  - **Semester launches:** Bundle new sponsor additions, page content updates, navigation changes, and site settings updates into a single "Fall 2026 Semester" release
  - **Sponsor campaigns:** Coordinate sponsor tier changes, logo updates, and feature page additions as one atomic update
  - **Content QA:** Preview all changes together to catch broken references, missing content, or visual inconsistencies before anything goes live
  - **Rollback safety:** If a release has issues, the previous state is preserved
- **Implementation complexity:** Medium - requires API version upgrade to `2025-02-19`, query updates for perspective support
- **Schema changes required:** None
- **Key consideration:** Current API version is `2024-12-08`. Upgrading to `2025-02-19` changes the default perspective to `published` (from `raw`) which may require query adjustments.

---

### 6. Embeddings Index + Semantic Search

- **Feature:** Native Sanity Embeddings Index API
- **Status:** Not configured
- **What it does:**
  - Creates vector embeddings of document content for semantic search
  - AI-powered content discovery by meaning, not just keywords
  - Powers AI Assist's smart reference suggestions
  - Searchable via API with similarity scoring
  - Configurable per document type and field
- **Why it matters for this project:**
  - **Site search:** Build a semantic search feature that finds relevant pages based on meaning, not just keyword matching
  - **Related content:** Automatically suggest related pages or sponsor connections based on content similarity
  - **AI Assist integration:** Powers smarter auto-suggestions for reference fields (e.g., linking related sponsors to pages)
  - **Content audit:** Find duplicate or near-duplicate content across pages
- **Implementation complexity:** Medium - index creation via API, frontend search UI needed
- **Schema changes required:** None for indexing; optional `aiAssist.embeddingsIndex` on reference fields

---

### 7. Comments & Tasks (Built-in Studio Feature)

- **Feature:** Native Sanity Studio collaboration tools
- **Status:** Available but not actively promoted/used
- **What it does:**
  - Inline comments on specific document fields
  - Task creation and assignment to team members
  - Discussion threads on content items
  - Mention/notification support for team members
  - Comment resolution workflow
- **Why it matters for this project:**
  - **Editorial review:** Editors can flag content issues, suggest changes, and discuss improvements directly in the Studio
  - **Sponsor onboarding:** Track sponsor content completion (logo uploaded? description written? tier confirmed?) via tasks
  - **Content QA:** Reviewers can leave feedback on specific fields without editing the document
- **Implementation complexity:** Zero - built into Studio v3, already available
- **Schema changes required:** None
- **Note:** This feature is already available in your Studio. It may just need team awareness and workflow adoption.

---

### 8. Real-Time Listeners

- **Feature:** `client.listen()` API
- **Status:** Not implemented
- **What it does:**
  - Subscribe to content changes in real-time via Server-Sent Events
  - Filter subscriptions with GROQ to listen for specific document types or changes
  - Receive mutation events (create, update, delete) as they happen
  - Works with both published and draft perspectives
- **Why it matters for this project:**
  - **Live preview enhancement:** Currently visual editing uses stega + presentation tool. Listeners could provide instant preview updates without page reload.
  - **Dashboard:** Build a real-time content dashboard showing recent activity, pending drafts, and publishing events
  - **ISR-like behavior:** In a deployed environment, listeners could trigger on-demand page regeneration for specific routes when their content changes
- **Implementation complexity:** Medium - requires server-side or edge function to maintain listener connection
- **Schema changes required:** None
- **Example:**

```typescript
import { createClient } from '@sanity/client'

const client = createClient({ projectId: '49nk9b0w', dataset: 'production', useCdn: false })

// Listen for published page changes
const subscription = client
  .listen('*[_type == "page" && !(_id in path("drafts.**"))]')
  .subscribe((update) => {
    console.log('Page changed:', update.documentId)
    // Trigger page rebuild, cache invalidation, etc.
  })
```

---

## Tier 3 - Medium Impact / Specialized

### 9. Custom Document Actions

- **Feature:** Document Actions API
- **Status:** Not configured (using defaults only)
- **What it does:**
  - Add custom buttons to the document action toolbar (alongside Publish/Unpublish)
  - Remove or reorder default actions per document type
  - Execute custom logic on button click (API calls, redirects, state changes)
- **Why it matters for this project:**
  - **"Preview on Live Site"** action: Open the live URL for a page document directly from Studio
  - **"Notify Team"** action: Send a Slack/email notification when a sponsor is added or page is ready for review
  - **"Export as PDF"** action: Generate a printable version of page content
  - **"Validate All Blocks"** action: Run comprehensive validation across all blocks on a page beyond field-level validation
- **Implementation complexity:** Medium - custom React components for action UI
- **Schema changes required:** None
- **Configuration example:**

```typescript
// sanity.config.ts
export default defineConfig({
  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'page') {
        return [...prev, PreviewOnSiteAction]
      }
      return prev
    },
  },
})
```

---

### 10. Custom Document Badges

- **Feature:** Document Badges API
- **Status:** Not configured
- **What it does:**
  - Add visual status indicators to documents in the desk list view
  - Show colored labels like "Draft", "Needs Review", "Published", "Outdated"
  - Custom logic determines badge state per document
- **Why it matters for this project:**
  - **Sponsor status:** Show tier badges (Platinum/Gold/Silver/Bronze) directly in the desk list
  - **Page completeness:** Badge showing whether SEO fields are filled, blocks are configured, etc.
  - **Content freshness:** Flag pages that haven't been updated in X days
- **Implementation complexity:** Low-Medium - custom React components for badge rendering
- **Schema changes required:** None

---

### 11. Document Inspector (Custom Panels)

- **Feature:** Document Inspector API
- **Status:** Not configured
- **What it does:**
  - Add custom side panels to the document editor
  - Panels slide in alongside the document form
  - Can display computed data, external API responses, analytics, etc.
- **Why it matters for this project:**
  - **SEO Inspector:** Live preview of Google SERP appearance using metaTitle (max 60 chars) and metaDescription (max 160 chars) with real-time character count
  - **Block Inventory:** Side panel showing all blocks on a page with their configuration status
  - **Reference Map:** Show which other documents link to/from the current document
  - **Accessibility Audit:** Check image alt text completeness, heading hierarchy, link text quality
- **Implementation complexity:** Medium - custom React panel component
- **Schema changes required:** None

---

### 12. Internationalization (i18n)

- **Feature:** Two official approaches
  - **Document-level:** `@sanity/document-internationalization` - separate document per language
  - **Field-level:** `sanity-plugin-internationalized-array` - localized field values within one document
- **Status:** Not implemented
- **What it does:**
  - Document-level: Creates linked copies of documents for each language with language switcher in Studio
  - Field-level: Adds language tabs to individual fields (e.g., title in English, Spanish, French)
  - AI Assist integration: Auto-translate content between languages
- **Why it matters for this project:**
  - If the site serves a multilingual audience (common for educational/organizational sites)
  - AI Assist can auto-translate, reducing manual translation burden
  - Both approaches work with existing Portable Text fields
- **Implementation complexity:** Medium-High - schema modifications + query updates + frontend locale routing
- **Schema changes required:** Yes - language field additions, document structure changes

---

### 13. Orderable Document List

- **Package:** `@sanity/orderable-document-list`
- **Status:** Not installed
- **What it does:**
  - Adds drag-and-drop reordering to document lists in the desk
  - Maintains an `orderRank` field for sort persistence
  - Works with Structure Builder for custom list views
- **Why it matters for this project:**
  - **Sponsor ordering:** Sponsors have a `tier` field but no explicit display order within tiers. This plugin lets editors manually sort sponsors.
  - **Navigation ordering:** Currently navigation items are an array in siteSettings (already ordered), but if navigation moves to separate documents, ordering becomes essential.
  - **Block ordering:** Could be applied if blocks become standalone documents rather than embedded arrays.
- **Implementation complexity:** Low - plugin install + orderRank field addition
- **Schema changes required:** Yes - adds `orderRank` hidden field to orderable document types

---

## Tier 4 - Nice to Have / Situational

### 14. Color Input

- **Package:** `@sanity/color-input`
- **Status:** Not installed
- **What it does:**
  - Native color picker field type
  - Supports hex, RGB, HSL, and alpha channel
  - Visual color swatch in document previews
- **Why it matters for this project:**
  - Currently `backgroundVariant` on block-base uses string enums (white/light/dark/primary). A color input could give editors full creative control over block backgrounds.
  - Could be used for sponsor brand colors, custom CTA button colors, or theme customization.
- **Implementation complexity:** Low - plugin install + field type addition
- **Schema changes required:** Yes - new color fields where needed
- **Trade-off:** Enum approach provides design system consistency; color picker provides flexibility. Consider whether editorial freedom or design consistency is more important.

---

### 15. Code Input

- **Package:** `@sanity/code-input`
- **Status:** Not installed
- **What it does:**
  - Syntax-highlighted code editor field
  - Language selection dropdown (JavaScript, Python, HTML, CSS, etc.)
  - Line numbers, copy button, and code formatting
- **Why it matters for this project:**
  - Useful if the site ever needs code snippets in content (tutorials, technical documentation, developer guides)
  - Could be added as a Portable Text block type for inline code blocks
- **Implementation complexity:** Low
- **Schema changes required:** Yes - new field type in schemas where needed

---

### 16. Table Input

- **Package:** `@sanity/table`
- **Status:** Not installed
- **What it does:**
  - Native table/grid field type
  - Row/column management in the editor
  - Cell content editing
- **Why it matters for this project:**
  - Pricing tables, sponsor comparison charts, event schedules, course listings
  - Could be added as a new block type (e.g., `dataTable`) in the block system
- **Implementation complexity:** Low
- **Schema changes required:** Yes - new block type or field type

---

### 17. Advanced GROQ Functions (Not Currently Used)

The following GROQ functions are available but not used in any project queries:

| Function | Purpose | Potential Use Case |
|----------|---------|-------------------|
| `pt::text()` | Extract plain text from Portable Text | Site search indexing, content summaries, word count |
| `text::query()` | Full-text search with relevance | Content search API endpoint |
| `math::sum()` | Aggregate sum | Total sponsor count, statistics |
| `math::avg()` | Aggregate average | Average content length, ratings |
| `boost()` | Relevance boosting in search | Prioritize featured content in search results |
| `dateTime()` functions | Date math and comparisons | Filter by publish date, upcoming events |
| `geo::distance()` | Geospatial queries | Location-based content (if applicable) |
| `score()` | Scoring and ranking | Relevance-ranked search results |
| `sanity::versionOf()` | Document version lookup | Content release workflows |
| `sanity::partOfRelease()` | Release membership check | Content release filtering |

**Most impactful for this project:** `pt::text()` for building a site search feature using existing Portable Text content across all page blocks.

---

### 18. GraphQL API Deployment

- **Feature:** `sanity graphql deploy`
- **Status:** Not deployed
- **What it does:**
  - Generates and deploys a GraphQL endpoint from your schema
  - Auto-generates types, queries, and filters from document/object types
  - Available alongside the existing GROQ API
- **Why it matters for this project:**
  - Alternative query language for developers who prefer GraphQL
  - Useful for third-party integrations that expect GraphQL endpoints
  - Auto-generated schema documentation
- **Implementation complexity:** Low (deployment), Medium (migrating queries)
- **Schema changes required:** None
- **Trade-off:** GROQ is more powerful and flexible for Sanity-specific patterns. GraphQL adds another API surface to maintain.

---

### 19. Cross-Dataset References

- **Feature:** Native cross-dataset reference support
- **Status:** Not in use
- **What it does:**
  - Reference documents across different datasets within the same project
  - Useful for shared content across environments or content domains
- **Why it matters for this project:**
  - Could separate staging/testing content from production
  - Share sponsor data across multiple sites or datasets
  - Isolate sensitive content in a private dataset while referencing it from public content
- **Implementation complexity:** Medium-High
- **Schema changes required:** Yes - cross-dataset reference field configuration

---

### 20. Document History API

- **Feature:** Native document revision history
- **Status:** Available but not surfaced
- **What it does:**
  - Query the full revision history of any document
  - See who changed what and when
  - Restore previous document versions
  - Compare revisions side-by-side (in Studio)
  - New `lastRevision` parameter for retrieving deleted document states
- **Why it matters for this project:**
  - **Audit trail:** Track all changes to sponsor data, site settings, and page content
  - **Rollback:** Restore a previous version of a page if an editor makes a mistake
  - **Compliance:** Maintain a record of content changes for organizational governance
- **Implementation complexity:** Zero (available in Studio), Low (API queries)
- **Schema changes required:** None
- **Note:** Document history is already built into Studio v3. Editors can access it via the document inspector. This is about actively leveraging it in workflows and potentially surfacing history data in custom tools.

---

## Top 5 Recommendations Summary

| Priority | Feature | Impact | Effort | Rationale |
|----------|---------|--------|--------|-----------|
| 1 | **AI Assist** | High | Low | Instant ROI - auto alt text on every image, content generation assistance, zero schema changes needed. Works with your existing image fields immediately. |
| 2 | **TypeGen** | High | Low | Your `pageBySlugQuery` has type-conditional projections across 13 block types. TypeGen catches field mismatches at build time instead of silent runtime failures. |
| 3 | **Scheduled Publishing** | High | Low | Natural fit for semester-based content lifecycle. Sponsors, events, and page updates can be pre-staged and auto-published on target dates. |
| 4 | **GROQ Webhooks** | High | Low | Closes the deploy loop - trigger Astro site rebuilds when content is published. No code changes needed, configured in Sanity dashboard. |
| 5 | **Content Releases** | High | Medium | Coordinate semester launches as atomic content bundles. All sponsor, page, and settings changes publish simultaneously. Requires API version upgrade. |

---

## Next Steps

1. **Quick wins (this sprint):** Install AI Assist plugin, configure GROQ webhooks in Sanity dashboard
2. **Short-term (next sprint):** Set up TypeGen in build pipeline, install Scheduled Publishing plugin
3. **Medium-term (next milestone):** Upgrade API version to `2025-02-19`, implement Content Releases workflow
4. **Backlog:** Evaluate i18n needs, build custom document actions/badges, consider embeddings index for site search

---
---

# Part 2: Astro Native Features Gap Analysis

---

## Current Astro Feature Usage Inventory

The following Astro features and integrations are actively in use.

### Core Configuration

| Setting | Value |
|---------|-------|
| Astro Version | 5.11.0 |
| Output Mode | Hybrid (SSR default via adapter) |
| Adapter | `@astrojs/node` v9.5.2 (standalone mode) |
| Build Tool | Vite v7.3.1 |
| TypeScript | Strict mode, v5.9.3 |

### Integrations In Use

| Integration | Package | Version | Purpose |
|-------------|---------|---------|---------|
| Node Adapter | `@astrojs/node` | v9.5.2 | SSR deployment on Node.js |
| React | `@astrojs/react` | v4.4.2 | React component support (installed, minimally used) |
| Astro Check | `@astrojs/check` | v0.9.6 | TypeScript type checking |
| Sanity | `@sanity/astro` | v3.2.11 | CMS integration + visual editing |
| Astro Icon | `astro-icon` | v1.1.5 | Icon management (Lucide, SimpleIcons) |
| Tailwind CSS | `@tailwindcss/vite` | v4.1.18 | Styling via Vite plugin |
| Tailwind Typography | `@tailwindcss/typography` | v0.5.19 | Prose styling |
| Portable Text | `astro-portabletext` | v0.10.0 | Rich text rendering |

### Routing & Pages

- 5 static routes (index, about, projects, sponsors, contact)
- 1 catch-all dynamic route (`[...slug].astro`) with `getStaticPaths()`
- Template system (5 variants: Default, FullWidth, Landing, Sidebar, TwoColumn)
- 404 redirect handling via `Astro.redirect()`

### Component Architecture

- 305+ `.astro` components total
- 13 custom Sanity block components
- 119+ fulldotdev/ui block library components
- Comprehensive shadcn/ui component set
- Storybook v10.2.7 for component documentation

### Data Fetching

- Sanity GROQ queries at build time via `getStaticPaths()`
- Module-level memoization for site settings
- Perspective-aware fetching (draft vs published)
- Static data fallbacks in `src/lib/data/`

### Testing & Quality

- Playwright v1.58.2 for E2E testing
- axe-core for accessibility testing
- ESLint v9.38.0 + Prettier v3.6.2

---

## Astro Tier 1 - High Impact / Low Effort

### 1. View Transitions (Client-Side Navigation)

- **Import:** `astro:transitions`
- **Status:** Not in use
- **What it does:**
  - Smooth animated page transitions without full page reloads
  - Transforms multi-page app into SPA-like experience
  - Morphing animations between matching elements across pages
  - Automatic fallback for browsers without View Transition API support
  - Persists component state across navigations (e.g., video players, scroll position)
  - `transition:animate` directive for per-element animation control
  - `transition:persist` directive to keep elements alive across navigations
  - `transition:name` for matching elements between pages
- **Why it matters for this project:**
  - Navigation between pages (home, about, sponsors, projects, contact) feels jarring with full reloads
  - The header/footer are identical across pages - they could morph seamlessly instead of flashing
  - Hero images and sponsor logos could animate between list and detail views
  - Significantly improves perceived performance and polish
- **Implementation complexity:** Very Low - single component addition to layout
- **Example:**

```astro
---
// src/layouts/Layout.astro
import { ClientRouter } from "astro:transitions";
---
<html>
  <head>
    <ClientRouter />
  </head>
  <body>
    <Header transition:persist />
    <main transition:animate="slide">
      <slot />
    </main>
    <Footer transition:persist />
  </body>
</html>
```

---

### 2. Sitemap Generation

- **Package:** `@astrojs/sitemap`
- **Status:** Not installed
- **What it does:**
  - Auto-generates `sitemap-index.xml` and `sitemap-0.xml` at build time
  - Crawls all static and dynamic routes automatically
  - Supports custom filters, change frequency, priority, and last modified dates
  - Essential for search engine discovery and indexing
- **Why it matters for this project:**
  - No sitemap currently exists - search engines rely on crawling alone to discover pages
  - Dynamic CMS pages from `[...slug].astro` are particularly important to include
  - Required for Google Search Console submission
  - Trivial to add with massive SEO benefit
- **Implementation complexity:** Very Low - install + one line in config
- **Example:**

```typescript
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://your-domain.com', // Required for sitemap
  integrations: [sitemap()],
})
```

---

### 3. Prefetch

- **Feature:** Built-in Astro prefetch (no install needed)
- **Status:** Not configured
- **What it does:**
  - Prefetches linked pages in the background before the user clicks
  - Multiple strategies: `hover`, `viewport`, `load`, `tap`
  - Dramatically reduces navigation latency
  - Works with View Transitions for near-instant page loads
  - Can be enabled globally or per-link with `data-astro-prefetch`
- **Why it matters for this project:**
  - Navigation links in the header point to 5+ pages - prefetching on hover makes them load instantly
  - CTA buttons in hero banners and blocks link to internal pages - prefetching makes the click feel immediate
  - Pairs perfectly with View Transitions for a native-app feel
- **Implementation complexity:** Very Low - config option
- **Example:**

```typescript
// astro.config.mjs
export default defineConfig({
  prefetch: {
    prefetchAll: true,         // Prefetch all links
    defaultStrategy: 'hover',  // Or 'viewport', 'load', 'tap'
  },
})
```

```astro
<!-- Per-link control -->
<a href="/sponsors" data-astro-prefetch="viewport">View Sponsors</a>
<a href="/admin" data-astro-prefetch="false">Admin (no prefetch)</a>
```

---

### 4. Environment Variable Schema Validation (`astro:env`)

- **Feature:** Built-in `astro:env` module (Astro 5+)
- **Status:** Not configured
- **What it does:**
  - Type-safe environment variable access with schema validation
  - Separates server-only vs client-safe variables at the type level
  - Build-time validation catches missing or invalid env vars before deployment
  - Replaces manual `import.meta.env.VARIABLE` access
  - Supports string, number, boolean, and enum types with defaults
- **Why it matters for this project:**
  - The project uses 6+ environment variables (Sanity project ID, dataset, tokens, visual editing flag)
  - Currently no validation - a missing `SANITY_API_READ_TOKEN` causes silent failures
  - Distinguishes `PUBLIC_*` (client-safe) from server-only variables at the type level
  - Prevents accidental exposure of `SANITY_API_READ_TOKEN` to the client bundle
- **Implementation complexity:** Low - schema definition + import changes
- **Example:**

```typescript
// astro.config.mjs
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
  env: {
    schema: {
      PUBLIC_SANITY_STUDIO_PROJECT_ID: envField.string({
        context: 'client', access: 'public', optional: false,
      }),
      PUBLIC_SANITY_STUDIO_DATASET: envField.string({
        context: 'client', access: 'public', default: 'production',
      }),
      PUBLIC_SANITY_VISUAL_EDITING_ENABLED: envField.boolean({
        context: 'client', access: 'public', default: false,
      }),
      SANITY_API_READ_TOKEN: envField.string({
        context: 'server', access: 'secret', optional: true,
      }),
    },
  },
})
```

```astro
---
// Type-safe imports replace import.meta.env
import { PUBLIC_SANITY_STUDIO_PROJECT_ID } from 'astro:env/client';
import { SANITY_API_READ_TOKEN } from 'astro:env/server';
---
```

---

## Astro Tier 2 - High Impact / Medium Effort

### 5. Server Endpoints (API Routes)

- **Feature:** Built-in Astro server endpoints
- **Status:** Not implemented (no `src/pages/api/` routes)
- **What it does:**
  - Create REST API endpoints as `.ts` files in `src/pages/api/`
  - Export `GET`, `POST`, `PUT`, `DELETE` handler functions
  - Access request body, headers, params, and cookies
  - Return JSON, text, or redirect responses
  - Works with the existing Node adapter for SSR
- **Why it matters for this project:**
  - **Contact form submission:** The `contactForm` block type has a `successMessage` field but no backend handler. An API route could process form submissions, send emails, or store in Sanity.
  - **Webhook receiver:** Accept incoming webhooks from Sanity for on-demand page rebuilds
  - **Proxy endpoints:** Securely proxy Sanity API calls that need the read token without exposing it to the client
  - **Search API:** Build a server-side search endpoint using GROQ `text::query()` or Sanity embeddings
- **Implementation complexity:** Medium - route creation + business logic
- **Example:**

```typescript
// src/pages/api/contact.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const { name, email, message } = data;

  // Validate, send email, store in Sanity, etc.

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

---

### 6. Middleware

- **Feature:** Built-in Astro middleware
- **Status:** Not implemented (no `src/middleware.ts`)
- **What it does:**
  - Intercepts every request before it reaches a page or endpoint
  - Access and modify request/response objects
  - Set shared data via `Astro.locals` accessible in all pages/layouts
  - Chain multiple middleware with `sequence()`
  - Runs on both SSR and prerendered routes
- **Why it matters for this project:**
  - **Sanity preview mode:** Toggle draft/preview mode via cookie or query parameter without modifying every page
  - **Security headers:** Add CSP, X-Frame-Options, HSTS headers to all responses
  - **Request logging:** Log page views, API calls, or performance metrics
  - **Authentication:** Protect admin or preview routes with token validation
  - **Shared data:** Load siteSettings once in middleware and pass via `locals` instead of module-level memoization
- **Implementation complexity:** Medium - middleware logic + refactoring data flow
- **Example:**

```typescript
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';
import { getSiteSettings } from './lib/sanity';

export const onRequest = defineMiddleware(async (context, next) => {
  // Load site settings once per request
  context.locals.siteSettings = await getSiteSettings();

  // Add security headers
  const response = await next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  return response;
});
```

---

### 7. Server Islands (Astro 5+)

- **Feature:** `server:defer` directive
- **Status:** Not in use
- **What it does:**
  - Defer specific components to render on the server at request time
  - The rest of the page renders statically (cached/prerendered)
  - Placeholder/fallback shown while the island loads
  - Combines static page speed with dynamic component freshness
  - No client-side JavaScript required (unlike `client:*` directives)
- **Why it matters for this project:**
  - **Dynamic sponsor content:** Pre-render page layout statically but load sponsor data fresh from Sanity at request time
  - **Contact form:** Static page with server-rendered form handling
  - **Navigation:** Static page structure with dynamically fresh navigation from siteSettings
  - **Visual editing:** Only the editable regions need server rendering; static shell stays cached
- **Implementation complexity:** Medium - component refactoring for deferred rendering
- **Example:**

```astro
---
// Static page shell (cached/prerendered)
---
<Layout>
  <HeroBanner />  <!-- Static, fast -->

  <!-- Sponsor data always fresh from Sanity -->
  <SponsorCards server:defer>
    <LoadingSkeleton slot="fallback" />
  </SponsorCards>

  <Footer />  <!-- Static -->
</Layout>
```

---

### 8. Astro Actions (Type-Safe Server Functions)

- **Feature:** `astro:actions` module (Astro 5+)
- **Status:** Not configured
- **What it does:**
  - Define type-safe server functions callable from client-side code
  - Input validation with Zod schemas
  - Automatic error handling and type inference
  - Works with both form submissions and JavaScript calls
  - Progressive enhancement - forms work without JS
- **Why it matters for this project:**
  - **Contact form:** Replace the currently non-functional contactForm block with a type-safe action that validates input and processes submissions
  - **Sponsor inquiry form:** If sponsors need to apply, actions handle the full submission lifecycle
  - **Newsletter signup:** Type-safe subscription handling
  - Eliminates the need to manually create API routes for form handling
- **Implementation complexity:** Medium - action definitions + form integration
- **Example:**

```typescript
// src/actions/index.ts
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export const server = {
  submitContact: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      message: z.string().min(10),
    }),
    handler: async ({ name, email, message }) => {
      // Send email, store in Sanity, etc.
      return { success: true };
    },
  }),
};
```

```astro
---
import { actions } from 'astro:actions';
---
<form method="POST" action={actions.submitContact}>
  <input name="name" required />
  <input name="email" type="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">Send</button>
</form>
```

---

## Astro Tier 3 - Medium Impact / Specialized

### 9. Content Collections (Content Layer API)

- **Feature:** Built-in `astro:content` with Content Layer API (Astro 5+)
- **Status:** Not configured (no `src/content/config.ts`)
- **What it does:**
  - Define typed content schemas with Zod validation
  - Load content from any source: local files, CMS APIs, databases
  - Custom loaders for external data sources (including Sanity)
  - Type-safe `getCollection()` and `getEntry()` queries
  - Build-time validation of all content against schemas
  - Automatic TypeScript type generation
- **Why it matters for this project:**
  - Could replace the manual `src/lib/data/*.ts` static fallback files with a proper content layer
  - A Sanity content loader could unify CMS data fetching with Astro's content system
  - Type-safe content access throughout the project
  - Build-time validation catches schema mismatches before deployment
- **Implementation complexity:** Medium-High - loader creation + data flow refactoring
- **Trade-off:** The current GROQ query approach is well-established. Content Collections add a layer of abstraction that may or may not simplify things depending on the project's evolution.

---

### 10. i18n Routing

- **Feature:** Built-in Astro i18n routing
- **Status:** Not configured
- **What it does:**
  - Automatic locale-based URL routing (`/en/about`, `/es/about`)
  - Default language with optional URL prefix
  - Language detection and redirection
  - `getRelativeLocaleUrl()` and `getAbsoluteLocaleUrl()` helpers
  - Integrates with content for per-locale pages
- **Why it matters for this project:**
  - If the site serves a multilingual audience
  - Pairs with Sanity's document internationalization for full i18n stack
  - Automatic `hreflang` link generation for SEO
- **Implementation complexity:** High - routing + content + UI changes
- **Example:**

```typescript
// astro.config.mjs
export default defineConfig({
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr'],
    routing: {
      prefixDefaultLocale: false, // /about (en), /es/about, /fr/about
    },
  },
})
```

---

### 11. Custom 404 & 500 Error Pages

- **Feature:** Built-in error page customization
- **Status:** Partial - 404 redirect exists, no custom error pages
- **What it does:**
  - `src/pages/404.astro` - Custom not-found page with site branding
  - `src/pages/500.astro` - Custom server error page
  - Inherits site layout, navigation, and styling
  - Can include helpful links, search, or contact information
- **Why it matters for this project:**
  - Currently uses `Astro.redirect('/404')` which redirects to a non-existent page
  - A branded 404 page maintains the site experience when users hit dead links
  - A 500 page provides graceful error handling if Sanity API is unavailable
- **Implementation complexity:** Very Low
- **Example:**

```astro
---
// src/pages/404.astro
import Layout from '../layouts/Layout.astro';
---
<Layout title="Page Not Found">
  <section class="flex flex-col items-center justify-center min-h-[60vh]">
    <h1 class="text-4xl font-bold">404</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/" class="btn">Go Home</a>
  </section>
</Layout>
```

---

### 12. Image Optimization (`astro:assets`)

- **Feature:** Built-in Astro image optimization
- **Status:** Not used (relies on Sanity image CDN only)
- **What it does:**
  - `<Image />` component with automatic format conversion (WebP/AVIF)
  - Responsive `srcset` generation
  - Lazy loading with blur-up placeholders
  - Width/height enforcement to prevent CLS (Cumulative Layout Shift)
  - Works with both local and remote images
  - `getImage()` function for programmatic use
- **Why it matters for this project:**
  - Local assets (favicon, logos in `/public/`) are served unoptimized
  - Sanity images go through Sanity's CDN, but `astro:assets` could add an optimization layer for format conversion
  - CLS prevention via enforced dimensions improves Core Web Vitals
  - Could optimize images from fulldotdev/ui block components that don't use Sanity
- **Implementation complexity:** Low per-component, Medium for full adoption
- **Trade-off:** Sanity's image CDN already handles transformations. This is most valuable for non-Sanity images.

---

### 13. Redirects Configuration

- **Feature:** Built-in Astro redirects
- **Status:** Not configured
- **What it does:**
  - Declarative redirect rules in `astro.config.mjs`
  - Support for static and dynamic redirects with status codes
  - Pattern matching with parameters
- **Why it matters for this project:**
  - Handle URL changes when pages are renamed in Sanity
  - Redirect old slugs to new ones without losing SEO value
  - Redirect common typos or alternative URLs
- **Implementation complexity:** Very Low
- **Example:**

```typescript
// astro.config.mjs
export default defineConfig({
  redirects: {
    '/old-page': '/new-page',
    '/blog/[...slug]': '/articles/[...slug]',
    '/sponsor': { destination: '/sponsors', status: 301 },
  },
})
```

---

### 14. RSS Feed Generation

- **Package:** `@astrojs/rss`
- **Status:** Not installed
- **What it does:**
  - Generate RSS/Atom feeds from content
  - Auto-generates `feed.xml` endpoint
  - Supports custom item mapping, categories, and metadata
- **Why it matters for this project:**
  - If the site publishes news, blog posts, or event updates, RSS allows subscribers to follow
  - Pairs with Sanity content queries for dynamic feed generation
- **Implementation complexity:** Low
- **Example:**

```typescript
// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { sanityClient } from '../lib/sanity';

export async function GET(context) {
  const pages = await sanityClient.fetch('*[_type == "page"]{title, "slug": slug.current, _updatedAt}');
  return rss({
    title: 'My Site',
    site: context.site,
    items: pages.map((page) => ({
      title: page.title,
      link: `/${page.slug}`,
      pubDate: new Date(page._updatedAt),
    })),
  });
}
```

---

## Astro Tier 4 - Nice to Have / Situational

### 15. Client Directives (Component Islands)

- **Feature:** Built-in `client:*` directives
- **Status:** Not used (all components are server-rendered)
- **What it does:**
  - `client:load` - Hydrate immediately on page load
  - `client:visible` - Hydrate when component scrolls into viewport
  - `client:idle` - Hydrate when browser is idle
  - `client:media` - Hydrate at a media query breakpoint
  - `client:only` - Skip SSR, render only on client
- **Why it matters for this project:**
  - The image carousel in `main.ts` uses vanilla JS with `DOMContentLoaded`. A React/Svelte carousel with `client:visible` would be more maintainable.
  - Contact form validation could use a hydrated React component with `client:visible`
  - Interactive sponsor filtering or search could use `client:idle`
  - `@astrojs/react` is already installed but unused - client directives activate it
- **Implementation complexity:** Per-component basis
- **Trade-off:** Current vanilla JS approach has zero framework overhead. Client directives add framework JS but improve DX.

---

### 16. MDX Integration

- **Package:** `@astrojs/mdx`
- **Status:** Not installed
- **What it does:**
  - Use `.mdx` files with JSX/component imports in Markdown
  - Supports Astro components, React components, and interactive islands inside Markdown
  - Works with Content Collections for typed MDX content
- **Why it matters for this project:**
  - If the project adds blog posts or documentation pages that mix prose with interactive components
  - Could complement Sanity Portable Text for locally-authored content
- **Implementation complexity:** Low (install), Medium (content creation)
- **Trade-off:** Sanity Portable Text already handles rich content. MDX would be for non-CMS content.

---

### 17. Partytown (Third-Party Script Optimization)

- **Package:** `@astrojs/partytown`
- **Status:** Not installed
- **What it does:**
  - Moves third-party scripts (analytics, ads, chat widgets) to a web worker
  - Prevents third-party JS from blocking the main thread
  - Improves page performance and Core Web Vitals
- **Why it matters for this project:**
  - If/when analytics (Google Analytics, Plausible, etc.) or tracking scripts are added
  - Chat widgets or support tools would benefit from worker offloading
- **Implementation complexity:** Low
- **Note:** Only relevant when third-party scripts are added to the site.

---

### 18. Sessions (Astro 5+)

- **Feature:** Built-in `Astro.session` API
- **Status:** Not configured
- **What it does:**
  - Server-side session management with configurable storage backends
  - Key-value session data with type safety
  - Cookie-based session identification
  - Supports multiple drivers (memory, Redis, filesystem, etc.)
- **Why it matters for this project:**
  - User preferences (dark mode, language)
  - Admin/preview authentication state
  - Form submission tracking (prevent duplicate submissions)
- **Implementation complexity:** Medium
- **Note:** Most valuable if the site adds user-facing interactivity or admin features.

---

### 19. Service Worker / PWA

- **Package:** `@vite-pwa/astro`
- **Status:** Not installed
- **What it does:**
  - Progressive Web App capabilities
  - Offline caching of pages and assets
  - Install prompt for home screen
  - Background sync
- **Why it matters for this project:**
  - Offline access to key pages (about, contact info)
  - Installable on mobile devices
  - Push notifications for content updates
- **Implementation complexity:** Medium
- **Trade-off:** Adds complexity; most valuable for mobile-first audiences.

---

### 20. Web Vitals / Analytics

- **Packages:** `@astrojs/web-vitals`, `@vercel/analytics`, `astro-google-analytics`
- **Status:** Not installed
- **What it does:**
  - Collect Core Web Vitals (LCP, FID, CLS) from real users
  - Dashboard for performance monitoring
  - Page view and event analytics
- **Why it matters for this project:**
  - No analytics currently in place - no visibility into traffic or performance
  - Web Vitals data validates that View Transitions, prefetch, and image optimization are working
- **Implementation complexity:** Low

---

## Top 5 Astro Recommendations Summary

| Priority | Feature | Impact | Effort | Rationale |
|----------|---------|--------|--------|-----------|
| 1 | **View Transitions** | High | Very Low | Single component add to Layout.astro. Instant SPA-like navigation with morphing header/footer. |
| 2 | **Sitemap** | High | Very Low | Zero-effort SEO win. One line in config generates sitemap for all CMS pages. |
| 3 | **Prefetch** | High | Very Low | Combined with View Transitions, creates near-instant navigation. One config option. |
| 4 | **Env Schema Validation** | High | Low | Catches missing Sanity tokens at build time instead of runtime. Type-safe env access. |
| 5 | **Actions (Contact Form)** | High | Medium | The contactForm block has no backend. Actions provide type-safe form handling with zero API boilerplate. |

---

## Combined Priority Matrix

The ultimate quick-wins across both Sanity and Astro:

| Rank | Feature | Stack | Effort | Category |
|------|---------|-------|--------|----------|
| 1 | View Transitions + Prefetch | Astro | Very Low | UX / Performance |
| 2 | Sitemap | Astro | Very Low | SEO |
| 3 | AI Assist | Sanity | Low | Content Editing DX |
| 4 | Env Schema Validation | Astro | Low | Developer Safety |
| 5 | GROQ Webhooks | Sanity | Low | Deployment Automation |
| 6 | TypeGen | Sanity | Low | Type Safety |
| 7 | Scheduled Publishing | Sanity | Low | Content Workflow |
| 8 | Actions (Contact Form) | Astro | Medium | Feature Completion |
| 9 | Server Endpoints | Astro | Medium | Backend Capabilities |
| 10 | Content Releases | Sanity | Medium | Content Coordination |

### Recommended Implementation Order

1. **This sprint (quick wins):** View Transitions + Prefetch, Sitemap, Env Validation, GROQ Webhooks
2. **Next sprint:** AI Assist plugin, TypeGen, Custom 404/500 pages, Scheduled Publishing
3. **Following sprint:** Actions for contact form, Middleware for security headers + shared data, Server Islands
4. **Backlog:** Content Releases, i18n (Astro + Sanity), Content Collections with Sanity loader, Embeddings Index
