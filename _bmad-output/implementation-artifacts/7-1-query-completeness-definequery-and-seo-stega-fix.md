# Story 7.1: Query Completeness, defineQuery & SEO Stega Fix

Status: review

<!-- Source: Sanity Code Review (2026-02-10) — _bmad-output/sanity-code-review.md -->
<!-- Review Findings: Critical #2, Critical #3, Important #4, Minor #8, Minor #9 -->

## Story

As a developer,
I want all GROQ queries wrapped in `defineQuery` with complete projections for every block type and clean SEO metadata,
So that TypeGen can generate result types, no block content is silently dropped, and SEO metadata is free of stega strings.

## Acceptance Criteria

1. **AC1 — defineQuery wrapper:** All GROQ query strings in `astro-app/src/lib/sanity.ts` are wrapped in `defineQuery()` imported from `"groq"`. (Critical #2)
2. **AC2 — SCREAMING_SNAKE_CASE naming:** Query variable names use `SCREAMING_SNAKE_CASE` convention: `SITE_SETTINGS_QUERY`, `PAGE_BY_SLUG_QUERY`, `ALL_PAGE_SLUGS_QUERY`. (Minor #9)
3. **AC3 — Complete block projections:** `PAGE_BY_SLUG_QUERY` includes type-conditional projections for ALL block types registered in the page schema — add missing `richText`, `faqSection`, `contactForm`, `sponsorCards`. (Important #4)
4. **AC4 — logoCloud select fix:** The `logoCloud` projection uses explicit `autoPopulate == true =>` instead of truthy `select(autoPopulate => ...)` to handle `undefined` pre-migration values correctly.
5. **AC5 — Image LQIP metadata:** All image projections include `asset->{ _id, url, metadata { lqip, dimensions } }` for blur placeholder support. (Minor #8)
6. **AC6 — SEO stega fix:** `seo.metaDescription` value is cleaned with `stegaClean()` before rendering in `<meta>` tags in Layout.astro, or the SEO fields are fetched with `stega: false`. (Critical #3)
7. **AC7 — No orphan block types:** No block type in the page schema's `blocks[]` array is missing a corresponding GROQ projection.
8. **AC8 — Build succeeds:** All queries compile without errors and `npm run build --workspace=astro-app` succeeds.

## Tasks / Subtasks

- [x] Task 1: Upgrade `groq` package to support `defineQuery` (AC: #1)
  - [x] 1.1: Check current `groq` version — it's `3.48.1` which does NOT export `defineQuery`. Upgrade to latest stable (`5.8.1`) or verify minimum version with `defineQuery` support
  - [x] 1.2: Run `npm install groq@latest --workspace=astro-app` to upgrade
  - [x] 1.3: Verify `defineQuery` is exported: `import { defineQuery } from "groq"` resolves without error
  - [x] 1.4: Verify no breaking changes in the `groq` package upgrade (it's a template literal tag — should be backward-compatible)

- [x] Task 2: Wrap all queries in `defineQuery` and rename to SCREAMING_SNAKE_CASE (AC: #1, #2)
  - [x] 2.1: Add `import { defineQuery } from "groq"` to `astro-app/src/lib/sanity.ts`
  - [x] 2.2: Rename `siteSettingsQuery` → `SITE_SETTINGS_QUERY` and wrap in `defineQuery()`
  - [x] 2.3: Rename `allPageSlugsQuery` → `ALL_PAGE_SLUGS_QUERY` and wrap in `defineQuery()`
  - [x] 2.4: Rename `pageBySlugQuery` → `PAGE_BY_SLUG_QUERY` and wrap in `defineQuery()`
  - [x] 2.5: Update all import references to these queries across the codebase (at minimum `[...slug].astro` imports `allPageSlugsQuery`)
  - [x] 2.6: Keep the `groq` tagged template inside `defineQuery` for syntax highlighting: `defineQuery(groq\`...\`)`

- [x] Task 3: Add missing block projections to PAGE_BY_SLUG_QUERY (AC: #3, #7)
  - [x] 3.1: Add `richText` projection: `_type == "richText" => { content[]{...} }`
  - [x] 3.2: Add `faqSection` projection: `_type == "faqSection" => { heading, items[]{ _key, question, answer } }`
  - [x] 3.3: Add `contactForm` projection: `_type == "contactForm" => { heading, description, successMessage }`
  - [x] 3.4: Add `sponsorCards` projection — this one is complex because of `displayMode`:
    ```groq
    _type == "sponsorCards" => {
      heading,
      displayMode,
      "sponsors": select(
        displayMode == "all" => *[_type == "sponsor"]{ _id, name, "slug": slug.current, logo{ asset->{ _id, url, metadata { lqip, dimensions } }, alt }, tier, description, website },
        displayMode == "featured" => *[_type == "sponsor" && featured == true]{ _id, name, "slug": slug.current, logo{ asset->{ _id, url, metadata { lqip, dimensions } }, alt }, tier, description, website },
        sponsors[]->{ _id, name, "slug": slug.current, logo{ asset->{ _id, url, metadata { lqip, dimensions } }, alt }, tier, description, website }
      )
    }
    ```
  - [x] 3.5: Cross-reference page schema `blocks[]` array (page.ts:92-104) against all `_type ==` conditionals in query — verify every registered type has a projection. Current registered types: `heroBanner`, `featureGrid`, `sponsorCards`, `richText`, `ctaBanner`, `faqSection`, `contactForm`, `logoCloud`, `statsRow`, `sponsorSteps`, `textWithImage`

- [x] Task 4: Fix logoCloud select pattern (AC: #4)
  - [x] 4.1: Change `select(autoPopulate => ...)` to `select(autoPopulate == true => ..., ...)`
  - [x] 4.2: The schema has `initialValue: true` but pre-migration documents may have `undefined` for `autoPopulate`. Using `== true` ensures only explicit `true` triggers auto-population; `undefined` falls through to the manual sponsors branch

- [x] Task 5: Add LQIP metadata to all image projections (AC: #5)
  - [x] 5.1: Update `SITE_SETTINGS_QUERY` image projections for `logo` and `logoLight`: change `asset->{ _id, url }` to `asset->{ _id, url, metadata { lqip, dimensions } }`
  - [x] 5.2: Update `PAGE_BY_SLUG_QUERY` image projections in `heroBanner.backgroundImages`, `featureGrid.items[].image`, `textWithImage.image`, `logoCloud.sponsors[].logo`
  - [x] 5.3: Update any image projections in the new `sponsorCards` projection added in Task 3

- [x] Task 6: Fix SEO stega strings in Layout.astro (AC: #6)
  - [x] 6.1: In `astro-app/src/layouts/Layout.astro`, import `stegaClean` from `@sanity/client/stega`
  - [x] 6.2: Apply `stegaClean()` to the `description` prop before rendering in `<meta name="description">` tag
  - [x] 6.3: The `description` flows from `seo.metaDescription` via `pageBySlugQuery` line 100 → `[...slug].astro` line 43 → Layout's `description` prop → `<meta>` tag at Layout line 42
  - [x] 6.4: The `title` prop is also potentially stega-encoded — apply `stegaClean()` to `fullTitle` before rendering in `<title>` tag
  - [x] 6.5: Verify: in `[...slug].astro`, `page.title` is passed as `title` prop to Layout — this string comes from Sanity with stega when Visual Editing is on

- [x] Task 7: Build verification (AC: #8)
  - [x] 7.1: Run `npm run build --workspace=astro-app` with Visual Editing disabled — static build succeeds
  - [x] 7.2: Run `npm run build --workspace=astro-app` with `PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true` — SSR build succeeds
  - [x] 7.3: Verify no TypeScript errors related to the renamed query exports

## Dev Notes

### The Big Picture

This story is the foundation for Story 7.3 (TypeGen). Without `defineQuery()` wrappers, TypeGen cannot generate result types. Without complete block projections, blocks will silently render with missing data. Without stega cleaning on SEO fields, search engines may index invisible characters.

```
Current:
  groq`query string`  → No type generation possible
  4 block types missing projections → Silent data loss
  SEO description has stega → Invisible chars in Google

Target:
  defineQuery(groq`query string`)  → TypeGen can generate result types
  All 11 block types have projections → Complete data for all blocks
  stegaClean(description) in <head> → Clean SEO metadata
```

### Critical: `groq` Package Upgrade Required

The current `groq@3.48.1` does NOT export `defineQuery`. The type definition file only exports the default `groq` template tag:

```typescript
// node_modules/groq/lib/groq.d.ts (current v3.48.1)
declare function groq(strings: TemplateStringsArray, ...keys: any[]): string
export default groq
export {}  // No defineQuery!
```

**Action required:** Upgrade to `groq@latest` (currently `5.8.1`) which exports `defineQuery`. The `groq` package is a lightweight template literal tag with no runtime dependencies — the upgrade should be safe.

```bash
npm install groq@latest --workspace=astro-app
```

After upgrade, verify the import works:
```typescript
import { defineQuery } from "groq";
import groq from "groq";
```

### File-by-File Implementation Guide

#### File 1: `astro-app/src/lib/sanity.ts` (Primary — all query changes)

**Change 1 — Add import (line 3):**
```diff
- import groq from "groq";
+ import groq from "groq";
+ import { defineQuery } from "groq";
```

**Change 2 — Rename and wrap `siteSettingsQuery` (line 45):**
```diff
- export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{
+ export const SITE_SETTINGS_QUERY = defineQuery(groq`*[_type == "siteSettings"][0]{
    siteName,
    siteDescription,
-   logo{ asset->{ _id, url }, alt },
-   logoLight{ asset->{ _id, url }, alt },
+   logo{ asset->{ _id, url, metadata { lqip, dimensions } }, alt },
+   logoLight{ asset->{ _id, url, metadata { lqip, dimensions } }, alt },
    ...rest unchanged...
- }`;
+ }`);
```

**Change 3 — Rename and wrap `allPageSlugsQuery` (line 89):**
```diff
- export const allPageSlugsQuery = groq`*[_type == "page" && defined(slug.current)]{ "slug": slug.current }`;
+ export const ALL_PAGE_SLUGS_QUERY = defineQuery(groq`*[_type == "page" && defined(slug.current)]{ "slug": slug.current }`);
```

**Change 4 — Rename, wrap, and complete `pageBySlugQuery` (line 95):**
```diff
- export const pageBySlugQuery = groq`*[_type == "page" && slug.current == $slug][0]{
+ export const PAGE_BY_SLUG_QUERY = defineQuery(groq`*[_type == "page" && slug.current == $slug][0]{
```

Add these missing block projections (after the existing `sponsorSteps` block at line 152):
```groq
    _type == "richText" => {
      content[]{...}
    },
    _type == "faqSection" => {
      heading,
      items[]{ _key, question, answer }
    },
    _type == "contactForm" => {
      heading,
      description,
      successMessage
    },
    _type == "sponsorCards" => {
      heading,
      displayMode,
      "sponsors": select(
        displayMode == "all" => *[_type == "sponsor"]{
          _id, name, "slug": slug.current,
          logo{ asset->{ _id, url, metadata { lqip, dimensions } }, alt },
          tier, description, website
        },
        displayMode == "featured" => *[_type == "sponsor" && featured == true]{
          _id, name, "slug": slug.current,
          logo{ asset->{ _id, url, metadata { lqip, dimensions } }, alt },
          tier, description, website
        },
        sponsors[]->{
          _id, name, "slug": slug.current,
          logo{ asset->{ _id, url, metadata { lqip, dimensions } }, alt },
          tier, description, website
        }
      )
    },
```

Fix the `logoCloud` select pattern:
```diff
    _type == "logoCloud" => {
      heading,
      autoPopulate,
      "sponsors": select(
-       autoPopulate => *[_type == "sponsor"]{
+       autoPopulate == true => *[_type == "sponsor"]{
          _id, name, "slug": slug.current,
-         logo{ asset->{ _id, url }, alt }, website
+         logo{ asset->{ _id, url, metadata { lqip, dimensions } }, alt }, website
        },
        sponsors[]->{ _id, name, "slug": slug.current,
-         logo{ asset->{ _id, url }, alt }, website
+         logo{ asset->{ _id, url, metadata { lqip, dimensions } }, alt }, website
        }
      )
    },
```

Update LQIP in existing block projections:
```diff
    _type == "heroBanner" => {
      heading,
      subheading,
-     backgroundImages[]{ _key, asset->{ _id, url }, alt },
+     backgroundImages[]{ _key, asset->{ _id, url, metadata { lqip, dimensions } }, alt },
```
```diff
    _type == "featureGrid" => {
      heading,
-     items[]{ _key, icon, title, description, image{ asset->{ _id, url }, alt } },
+     items[]{ _key, icon, title, description, image{ asset->{ _id, url, metadata { lqip, dimensions } }, alt } },
```
```diff
    _type == "textWithImage" => {
      heading,
      content[]{...},
-     image{ asset->{ _id, url }, alt },
+     image{ asset->{ _id, url, metadata { lqip, dimensions } }, alt },
```

Close with `defineQuery`:
```diff
- }`;
+ }`);
```

**Change 5 — Update `getSiteSettings` function to use new name:**
```diff
  const result = await loadQuery<SiteSettings | null>({
-   query: siteSettingsQuery,
+   query: SITE_SETTINGS_QUERY,
  });
```

**Change 6 — Update `getPage` function to use new name:**
```diff
  return loadQuery<Page | null>({
-   query: pageBySlugQuery,
+   query: PAGE_BY_SLUG_QUERY,
    params: { slug },
  });
```

**Change 7 — Update export statement (line 6):**
```diff
- export { sanityClient, groq };
+ export { sanityClient, groq, ALL_PAGE_SLUGS_QUERY };
```

#### File 2: `astro-app/src/pages/[...slug].astro` (Import rename)

```diff
- import { sanityClient, allPageSlugsQuery, getPage } from '@/lib/sanity';
+ import { sanityClient, ALL_PAGE_SLUGS_QUERY, getPage } from '@/lib/sanity';
```

```diff
- const pages = await sanityClient.fetch<Array<{ slug: string }>>(allPageSlugsQuery);
+ const pages = await sanityClient.fetch<Array<{ slug: string }>>(ALL_PAGE_SLUGS_QUERY);
```

#### File 3: `astro-app/src/layouts/Layout.astro` (SEO stega fix)

```diff
  import "../styles/global.css";
  import Header from "../components/Header.astro";
  import Footer from "../components/Footer.astro";
  import { VisualEditing } from "@sanity/astro/visual-editing";
  import { getSiteSettings } from "../lib/sanity";
+ import { stegaClean } from "@sanity/client/stega";
```

```diff
  const {
    title = defaultTitle,
    description = defaultDescription,
    hideNav = false,
  } = Astro.props;

+ const cleanTitle = stegaClean(title);
+ const cleanDescription = stegaClean(description);
+
  const visualEditingEnabled =
    import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED === "true";
```

```diff
  const fullTitle =
-   title === defaultTitle
-     ? title
-     : `${title} | ${defaultTitle}`;
+   cleanTitle === stegaClean(defaultTitle)
+     ? cleanTitle
+     : `${cleanTitle} | ${stegaClean(defaultTitle)}`;
```

In the `<head>`:
```diff
-   <meta name="description" content={description} />
+   <meta name="description" content={cleanDescription} />
```

```diff
-   <title>{fullTitle}</title>
+   <title>{stegaClean(fullTitle)}</title>
```

Note: `stegaClean` is a no-op when stega is not active (returns the string unchanged), so this is safe for both static and SSR builds.

### Page Schema Block Types vs. Query Projections Checklist

| Block Type (page.ts) | Has GROQ Projection? | Status |
|---|---|---|
| `heroBanner` | Yes (line 107) | Existing |
| `featureGrid` | Yes (line 114) | Existing |
| `sponsorCards` | **No** | **ADD** (Task 3.4) |
| `richText` | **No** | **ADD** (Task 3.1) |
| `ctaBanner` | Yes (line 119) | Existing |
| `faqSection` | **No** | **ADD** (Task 3.2) |
| `contactForm` | **No** | **ADD** (Task 3.3) |
| `logoCloud` | Yes (line 134) | Existing — **FIX select** (Task 4) |
| `statsRow` | Yes (line 124) | Existing |
| `sponsorSteps` | Yes (line 147) | Existing |
| `textWithImage` | Yes (line 128) | Existing |

Note: `timeline` and `teamGrid` are NOT registered in page.ts (commented out — depend on event/team document types from Epic 4). No projection needed until they're registered.

### Schema Field Reference for Missing Projections

**richText** (`studio/src/schemaTypes/blocks/rich-text.ts`):
- `content` — type: `portableText`

**faqSection** (`studio/src/schemaTypes/blocks/faq-section.ts`):
- `heading` — type: `string`
- `items[]` — array of objects with `question` (string, required) and `answer` (text, required)

**contactForm** (`studio/src/schemaTypes/blocks/contact-form.ts`):
- `heading` — type: `string`
- `description` — type: `text`
- `successMessage` — type: `string`

**sponsorCards** (`studio/src/schemaTypes/blocks/sponsor-cards.ts`):
- `heading` — type: `string`
- `displayMode` — type: `string` (options: `all`, `featured`, `manual`)
- `sponsors[]` — array of references to `sponsor` documents (hidden when displayMode !== `manual`)

### Type/Schema Mismatches to Note (NOT fixed here — deferred to Story 7.3)

These type mismatches exist in `astro-app/src/lib/types.ts` but are NOT part of this story's scope. They will be resolved when TypeGen replaces the hand-written types in Story 7.3:

- `FaqSectionBlock` has `label` + `headline` but schema has `heading` + `items` — mismatch
- `Sponsor.tier` is `'platinum' | 'gold' | 'silver'` but schema includes `'bronze'` — missing value
- `ContactFormBlock` has `formEndpoint` + `fields[]` but schema has `heading` + `description` + `successMessage` — fully diverged
- `TimelineBlock` has `label` + `headline` but schema has `heading` + `autoPopulate` + `events[]` — diverged
- `TeamGridBlock` has `label` + `headline` + `subtitle` but schema has `heading` + `useDocumentRefs` + `teams[]` — diverged

**Impact:** The block components using these types will receive data shaped by the GROQ projection (correct) but the TypeScript types won't match. This means TypeScript won't catch field name errors until TypeGen is set up. For now, the projections added in Task 3 should match the ACTUAL SCHEMA field names, not the incorrect type definitions.

### stegaClean Import Path

The project already uses `stegaClean` from `@sanity/client/stega` in 7 files. Use the same import:
```typescript
import { stegaClean } from '@sanity/client/stega';
```

### Image Fragment Pattern (from Sanity GROQ rules)

The Sanity MCP rules recommend using query fragments for reusable patterns:

```typescript
// Optional: Create a reusable image fragment
const imageFragment = /* groq */ `
  asset->{
    _id,
    url,
    metadata { lqip, dimensions }
  },
  alt
`;
```

This is optional for this story but would reduce duplication. If implemented, use string interpolation in the query:
```groq
backgroundImages[]{ _key, ${imageFragment} }
```

### Dependencies

- **Requires:** Story 5.4 complete (perspective fix, cache fix — DONE, merged in PR #4)
- **Blocks:** Story 7.3 (TypeGen — queries MUST use `defineQuery` before TypeGen can generate result types)
- **Does NOT require:** Any schema changes — this story only modifies queries and Layout
- **Does NOT require:** Story 7.2 (schema best practices — independent)

### What NOT to Change

- **Do NOT modify any schema files** — schema changes are Story 7.2's scope
- **Do NOT set up TypeGen** — that's Story 7.3
- **Do NOT modify block components** — their `stegaClean` usage is already correct
- **Do NOT fix type mismatches in types.ts** — TypeGen will replace all of these in Story 7.3
- **Do NOT modify `astro.config.mjs`** — apiVersion update is Story 7.2's scope
- **Do NOT add `defineArrayMember`** to site-settings.ts — that's Story 7.2's scope

### Previous Story Intelligence

**Story 5.4 (Preview & Publish Architecture — in-progress/review):**
- Fixed `"previewDrafts"` → `"drafts"` perspective at sanity.ts line 29
- Fixed SSR cache staleness with `!visualEditingEnabled &&` guard at line 69
- Both changes are already merged to `preview` branch via PR #4
- File `sanity.ts` was last modified in this story — 2 line edits only

**PR #3 commits (preview branch):**
- Applied `stegaClean` fixes to all block components (HeroBanner, CtaBanner, TextWithImage, StatsRow, SponsorCards, `[...slug].astro`)
- Import path: `@sanity/client/stega` — use the same

### Git Intelligence

Recent commits show the preview branch is the active development target:
- `ee4d36b` — Merge PR #4 (preview-publish architecture)
- `0cf0ab4` — SSR cache + perspective fix
- `f4ac5d8` — Merge PR #3 (preview branch setup)

The `sanity.ts` file is the primary target for this story. Last meaningful changes were the 2-line fix in Story 5.4.

### Testing Approach

1. **Build test:** `npm run build --workspace=astro-app` must succeed for both static and SSR modes
2. **Query verification:** After changes, add test content in Sanity Studio using each of the 4 previously-missing block types and verify they render on a page
3. **SEO verification:** With Visual Editing enabled, inspect the `<head>` in the rendered HTML — `<title>` and `<meta name="description">` should contain clean text with no invisible stega characters
4. **LQIP verification:** Image queries should return `metadata.lqip` values — check in browser dev tools that blur placeholders appear during image loading

### References

- [Source: _bmad-output/sanity-code-review.md] — All 10 review findings with file paths and line numbers
- [Source: astro-app/src/lib/sanity.ts] — Current queries (3 queries, 165 lines)
- [Source: astro-app/src/layouts/Layout.astro] — SEO metadata rendering (70 lines)
- [Source: astro-app/src/pages/[...slug].astro] — Page rendering with `allPageSlugsQuery` import
- [Source: studio/src/schemaTypes/documents/page.ts:92-104] — Block types registered in page schema
- [Source: studio/src/schemaTypes/blocks/] — All block schema definitions (field names for projections)
- [Source: Sanity MCP rules: sanity-groq] — `defineQuery` import, query fragments, SCREAMING_SNAKE_CASE
- [Source: Sanity MCP rules: sanity-typegen] — TypeGen workflow (extract → generate cycle)
- [Source: Sanity MCP rules: sanity-visual-editing] — stegaClean for SEO metadata, `stega: false` alternative
- [Source: Sanity MCP rules: sanity-image] — LQIP query pattern: `asset->{ _id, url, metadata { lqip, dimensions } }`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — all tasks completed without errors.

### Completion Notes List

- Upgraded `groq` from `3.48.1` → `5.8.1` to gain `defineQuery` export
- Wrapped all 3 GROQ queries in `defineQuery()` with `groq` template tag retained inside for syntax highlighting
- Renamed queries to SCREAMING_SNAKE_CASE: `SITE_SETTINGS_QUERY`, `ALL_PAGE_SLUGS_QUERY`, `PAGE_BY_SLUG_QUERY`
- Updated all import references in `[...slug].astro`
- Added 4 missing block projections: `richText`, `faqSection`, `contactForm`, `sponsorCards`
- All 11 registered block types in page schema now have GROQ projections — no orphan types
- Fixed `logoCloud` select: `autoPopulate =>` changed to `autoPopulate == true =>` for correct `undefined` handling
- Added `metadata { lqip, dimensions }` to all image projections across both queries (8 image fields total)
- Added `stegaClean()` to `title` and `description` in `Layout.astro` `<head>` — `<title>` and `<meta name="description">` now render clean strings
- Both static and SSR builds pass with 0 errors, 0 warnings

### File List

- `astro-app/package.json` — `groq` dependency upgraded `^3.48.1` → `^5.8.1`
- `astro-app/src/lib/sanity.ts` — All query changes: defineQuery wrapper, SCREAMING_SNAKE_CASE rename, missing block projections, logoCloud fix, LQIP metadata
- `astro-app/src/pages/[...slug].astro` — Import rename `allPageSlugsQuery` → `ALL_PAGE_SLUGS_QUERY`
- `astro-app/src/layouts/Layout.astro` — SEO stega fix: `stegaClean()` on title and description in `<head>`
