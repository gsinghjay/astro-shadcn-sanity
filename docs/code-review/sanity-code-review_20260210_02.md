# Sanity Code Review

**Date:** 2026-02-10
**Branch:** `feat/7-3-typegen-and-type-replacement`
**Reviewer:** Claude Code (Opus 4.6)

## Overview

**Project:** Monorepo with `studio/` (Sanity Studio v5.9) + `astro-app/` (Astro 5 frontend)

Overall, this is a well-structured project. The schemas use proper `defineType`/`defineField` syntax, TypeGen is configured correctly, queries use `defineQuery`, and the page builder pattern is solid. Below are findings organized by severity.

---

## Critical Issues

### 1. Missing `defineArrayMember` in block schemas

**Files:** All files in `studio/src/schemaTypes/blocks/` that contain arrays

Several block schemas use bare objects `{ type: '...' }` inside `of:` arrays instead of wrapping them in `defineArrayMember`. This breaks type inference and is a best practice violation.

**Examples:**

- `faq-section.ts:21` — `of: [{ type: 'object', ... }]`
- `sponsor-cards.ts:31` — `of: [{ type: 'reference', ... }]`
- `logo-cloud.ts` (similar pattern)
- `timeline.ts:27` — `of: [{ type: 'reference', ... }]`
- `team-grid.ts:27,39` — `of: [{ type: 'reference' }, { type: 'object' }]`

**Fix:** Wrap all array `of` items in `defineArrayMember()`:

```typescript
of: [
  defineArrayMember({ type: 'reference', to: [{ type: 'sponsor' }] })
]
```

### 2. Missing `defineArrayMember` in `page.ts` blocks array

**File:** `studio/src/schemaTypes/documents/page.ts:92-104`

The page builder array items are bare `{ type: '...' }` objects:

```typescript
of: [
  {type: 'heroBanner'},  // Should be defineArrayMember({type: 'heroBanner'})
  ...
]
```

---

## High Priority

### 3. `block-base.ts` fields lack `fieldset` grouping

**File:** `studio/src/schemaTypes/objects/block-base.ts`

The base fields (`backgroundVariant`, `spacing`, `maxWidth`) are prepended to every block but have no fieldset grouping, so they clutter the editing experience alongside content fields. Consider wrapping them in a `collapsible` fieldset named "Layout Options" (requires updating `defineBlock` helper to register the fieldset).

### 4. Manual types drift from schema

**File:** `astro-app/src/lib/types.ts:42-83`

The `TimelineBlock` and `TeamGridBlock` interfaces are handwritten with field names (`headline`, `events`) that differ from the actual schema definitions (`heading`, `events`). For example:

- Schema has `heading`, manual type uses `headline`
- Schema has `members` array with `name`, `role`, `photo`, `linkedIn` — manual type has `image`, `imageUrl`, `major`

This guarantees runtime errors if these blocks are ever registered. The TODO is acknowledged, but the drift is significant.

### 5. `stegaClean` not used on logic-critical block fields

**File:** `astro-app/src/components/BlockRenderer.astro:238`

The `block._type` in the switch statement is used directly for logic branching. While `_type` is typically not stega-encoded, the `block` field values like `backgroundVariant`, `spacing`, `maxWidth`, `alignment`, `displayMode`, `imagePosition`, and `template` (which IS cleaned at line 39) should all be cleaned before use in logic.

The `[...slug].astro` correctly cleans `template` with `stegaClean`, but block components likely don't. Verify that every component using these string values for CSS class mapping or conditionals applies `stegaClean`.

### 6. `@sanity/client/stega` import missing from block components

Looking at the `ContactForm.astro` component (line 2), it imports from `@/lib/types` but never imports or uses `stegaClean` even though the block has `backgroundVariant`, `spacing`, and `maxWidth` fields that likely drive rendering logic.

---

## Medium Priority

### 7. Image helper uses `@sanity/types` instead of generated types

**File:** `astro-app/src/lib/image.ts:2`

```typescript
import type { Image } from "@sanity/types";
```

This should use the generated `ObjectImage` type from `@/sanity.types` for consistency with TypeGen. The `@sanity/types` `Image` type may not exactly match your schema's image structure.

### 8. Query naming convention

**File:** `astro-app/src/lib/sanity.ts`

The query names `SITE_SETTINGS_QUERY`, `PAGE_BY_SLUG_QUERY`, and `ALL_PAGE_SLUGS_QUERY` correctly use `SCREAMING_SNAKE_CASE` — good. However, the generated type names depend on these being consistent. Just confirming this is correct.

### 9. `sponsor.ts` uses `boolean` for `featured`

**File:** `studio/src/schemaTypes/documents/sponsor.ts:63-66`

Per Sanity best practices, boolean fields for binary states that might expand should use `options.list` with radio layout. The `featured` field could evolve into `spotlight`, `premium`, `standard` etc. Consider if this will grow.

### 10. Missing `preview` on some array member objects

**File:** `studio/src/schemaTypes/documents/site-settings.ts`

The `navigationItems`, `footerLinks`, `resourceLinks`, `programLinks`, and `socialLinks` array objects lack `preview` definitions. This makes the Studio array items show as "Untitled" in collapsed state. Each should have:

```typescript
preview: { select: { title: 'label' } }
```

### 11. Singleton `siteSettings` not in the `SINGLETONS` filter of `newDocumentOptions`

**File:** `studio/sanity.config.ts:14,57-58`

The singleton filter uses `singletonTypes.has(templateItem.templateId)`, but the template ID format may not always match the type name. This works now but is fragile. Consider using `templateItem.templateId` explicitly or adding `schemaType` to the check.

---

## Low Priority / Observations

### 12. `block-base.ts` not exported as a type

The `blockBaseFields` array is only imported by `defineBlock.ts`. It's not registered as a schema type, which is correct — but the fields show as "anonymous" in the deployed schema. This is fine since they're merged into each block.

### 13. `sanity.cli.ts` has a typo

**File:** `studio/sanity.cli.ts:18`

```
// ...to leanr more about...
```

Should be "learn".

### 14. Portable text annotations missing `defineArrayMember`

**File:** `studio/src/schemaTypes/objects/portable-text.ts:24-51`

The annotations array uses bare objects:

```typescript
annotations: [
  { name: 'link', type: 'object', ... },      // should be defineArrayMember
  { name: 'internalLink', type: 'object', ... } // should be defineArrayMember
]
```

### 15. Large `BlockRenderer.astro` with 100+ unused static block imports

**File:** `astro-app/src/components/BlockRenderer.astro`

The file imports ~100 "fulldotdev/ui" block components that aren't Sanity-managed. These are stored in the same component map with `any` typing (`Record<string, any>`). This bloats the bundle and bypasses type safety. Consider lazy-loading or splitting into a separate renderer.

### 16. Environment variable fallback values

**Files:** `studio/sanity.config.ts:10`, `studio/sanity.cli.ts:10`

The fallback values are different: `'your-projectID'` vs `'<your project ID>'`. These should be consistent (ideally both throwing an error if unset in production).

---

## What's Done Well

- **TypeGen workflow** is properly configured in `sanity.cli.ts` with cross-workspace paths
- **`defineQuery` + `groq` tag** used consistently for all GROQ queries
- **Image queries** include `lqip` and `dimensions` metadata — excellent for performance
- **Proper `select()` usage** in GROQ for conditional sponsor/logo fetching
- **`stegaClean`** correctly applied to `template` in `[...slug].astro`
- **Singleton pattern** correctly uses structure + `newDocumentOptions` filtering
- **Presentation tool** with `resolve.ts` document locations is set up correctly
- **Page builder `insertMenu`** groups are well-organized with filter + grid views
- **Block-template compatibility validation** is a thoughtful custom validation
- **All images have `hotspot: true`** and alt text validation
- **Module-level memoization** for `getSiteSettings()` prevents redundant API calls during SSG
- **Visual editing** properly toggles `perspective`, `stega`, and `resultSourceMap` based on environment

---

## Recommended Priority

1. Add `defineArrayMember` everywhere (Critical — affects TypeGen accuracy)
2. Audit all block components for `stegaClean` on logic-critical string fields
3. Add `preview` to `siteSettings` array objects for better Studio UX
4. Clean up or lazy-load the 100+ static block imports in `BlockRenderer.astro`
