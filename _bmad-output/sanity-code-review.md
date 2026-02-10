# Sanity Code Review Report

**Date:** 2026-02-10
**Branch:** preview
**Reviewer:** Claude Code (automated)

---

## Project Overview

- **Structure**: Monorepo with `studio/` (Sanity Studio) and `astro-app/` (Astro frontend)
- **Framework**: Astro 5 with `@sanity/astro` integration, Cloudflare Pages adapter
- **Sanity**: v5.8.1, with Presentation Tool + Visual Editing
- **Pattern**: Page Builder with 11 registered block types

---

## Schema Review

### Definition Syntax

| Check | Status | Notes |
|-------|--------|-------|
| `defineType` usage | **Pass** | All schemas use `defineType` (via `defineBlock` helper) |
| `defineField` usage | **Pass** | Consistently used for all fields |
| `defineArrayMember` | **Pass** | Used in `portable-text.ts` for array items |
| `@sanity/icons` | **Fail** | Only `page.ts` has an icon (`DocumentIcon`). **All 11 block types and `siteSettings`, `sponsor` documents are missing icons** |

### Data Modeling

| Check | Status | Notes |
|-------|--------|-------|
| "Data > Presentation" naming | **Pass** | Good names: `heroBanner`, `featureGrid`, `sponsorSteps` - no "bigRed" or "threeColumn" patterns |
| References vs nested objects | **Pass** | `sponsor` is a document with references from `logoCloud` and `sponsorCards` blocks |
| Singleton enforcement | **Pass** | `siteSettings` uses desk structure pattern with fixed `documentId` |
| Insert menu groups | **Pass** | `page.ts:114-136` - well-organized insert menu with categorized block groups |

### Issues Found

1. **Missing icons on all block schemas and 2 of 3 documents** (`studio/src/schemaTypes/blocks/*.ts`, `documents/sponsor.ts`, `documents/site-settings.ts`)
   - Every block and document should have an icon from `@sanity/icons` for Studio UX. Currently only `page` has one.

2. **`block-base.ts` fields are presentational** (`studio/src/schemaTypes/objects/block-base.ts:3-11`)
   - `backgroundVariant`, `spacing`, `maxWidth` are layout/presentation fields on *every* block. This is a borderline "Data > Presentation" concern. These are reasonable for a page builder but worth noting.

3. **Missing `defineArrayMember` in some inline arrays** (`studio/src/schemaTypes/documents/site-settings.ts:81-138`)
   - `navigationItems`, `socialLinks`, `footerLinks`, `resourceLinks`, `programLinks` all define inline objects without wrapping in `defineArrayMember()`. While they work, wrapping array items in `defineArrayMember` is the recommended practice for consistency and type safety.

4. **Sponsor `tier` field missing `'bronze'` value in frontend types** (`astro-app/src/lib/types.ts:90`)
   - Schema defines `['platinum', 'gold', 'silver', 'bronze']` but the `Sponsor` type only has `'platinum' | 'gold' | 'silver'`. This is a type mismatch.

5. **Orphaned block types in types.ts** (`astro-app/src/lib/types.ts:103-116, 148-173, 181-198`)
   - `TimelineBlock`, `TeamGridBlock`, and `ContactFormBlock` type definitions reference fields (`label`, `headline`, `formEndpoint`, `fields`) that don't exist in the actual schema definitions. The types diverge from the schemas.

6. **`FaqSectionBlock` type doesn't match schema** (`astro-app/src/lib/types.ts:66-72`)
   - Type has `label` and `headline` fields, but schema has `heading` and `items`. Missing `BlockBase` extension.

---

## Query Review

### TypeGen Compatibility

| Check | Status | Notes |
|-------|--------|-------|
| `defineQuery()` wrapper | **Fail** | All 3 queries use raw `groq` tag without `defineQuery()` |
| SCREAMING_SNAKE_CASE naming | **Fail** | Queries use `camelCase`: `siteSettingsQuery`, `pageBySlugQuery` |
| `sanity-typegen.json` config | **Fail** | No TypeGen configuration file exists |
| Generated types | **Fail** | All 311 lines of types in `types.ts` are manually maintained |

### Performance

| Check | Status | Notes |
|-------|--------|-------|
| Projections (not `*`) | **Pass** | All queries use explicit field projections |
| Query params (not interpolation) | **Pass** | `pageBySlugQuery` uses `$slug` parameter |
| Order before slice | **N/A** | No pagination queries |
| Avoiding joins in filters | **Pass** | Filters use `_type` and `slug.current` (optimizable) |

### Specific Query Issues

1. **`pageBySlugQuery` missing block expansions** (`astro-app/src/lib/sanity.ts:95-154`)
   - Missing projections for: `richText`, `faqSection`, `contactForm`, `sponsorCards`. These block types are registered in the page schema but have no conditional projection in the query, so they'll return only `_type`, `_key`, and `blockBaseFields`.

2. **`logoCloud` select pattern may be unreliable** (`astro-app/src/lib/sanity.ts:137-145`)
   - Uses `select(autoPopulate => ...)` which checks if `autoPopulate` is truthy. Since `initialValue` is `true`, this works, but if the field is ever `undefined` (pre-migration), the fallback branch runs. Consider using explicit `autoPopulate == true =>`.

3. **Image queries missing LQIP** (`astro-app/src/lib/sanity.ts:48-49, 110-111`)
   - Image projections use `asset->{ _id, url }` but don't include `metadata { lqip, dimensions }`. Blur placeholders won't work.

---

## Frontend Review

### Visual Editing

| Check | Status | Notes |
|-------|--------|-------|
| `stegaClean` for logic values | **Pass** | Used correctly in `HeroBanner` (alignment), `TextWithImage` (imagePosition), `CtaBanner` (backgroundVariant), `StatsRow` (backgroundVariant), `SponsorCards` (tier), `[...slug].astro` (template) |
| `_key` for array item keys | **Needs verification** | Block components use `_key` from GROQ projections |
| Stega in `<head>` tags | **Warning** | SEO description at `sanity.ts:100` (`"description": seo.metaDescription`) flows to `<meta>` tag in Layout. If Visual Editing is on, this value may contain stega strings. Should use `stegaClean()` or fetch with `stega: false` for metadata. |
| `VisualEditing` component | **Pass** | Correctly rendered in Layout.astro when editing is enabled |

### Type Safety

| Check | Status | Notes |
|-------|--------|-------|
| Generated types from `sanity.types.ts` | **Fail** | No TypeGen setup. All types are manual |
| No `any` for Sanity content | **Pass** | Types are explicit, though manually maintained |
| Type/schema drift | **Fail** | Multiple mismatches between types and schemas (see above) |

---

## Summary of Findings

### Critical (Fix Now)

1. **No TypeGen setup** - All types are manually maintained with drift from schemas. Set up `sanity-typegen.json` and run the extract/generate workflow.
2. **Queries not wrapped in `defineQuery()`** - Required for TypeGen and recommended for type safety.
3. **SEO metadata may contain stega strings** - `seo.metaDescription` flows to `<meta>` tags without cleaning.

### Important (Fix Soon)

4. **Missing block projections in `pageBySlugQuery`** - `richText`, `faqSection`, `contactForm`, `sponsorCards` blocks will have incomplete data at runtime.
5. **Type/schema mismatches** - `FaqSectionBlock`, `Sponsor.tier`, `ContactFormBlock`, `TeamGridBlock` types don't match their schema definitions.
6. **Missing icons on 12 of 14 schema types** - Hurts Studio UX and content editor discoverability.

### Minor (Nice to Have)

7. **Missing `defineArrayMember`** in `site-settings.ts` inline array objects.
8. **Image queries missing LQIP/dimensions** - No blur placeholder support.
9. **Query naming convention** - Should be `SCREAMING_SNAKE_CASE` for TypeGen compatibility (e.g., `SITE_SETTINGS_QUERY`).
10. **`apiVersion` in astro.config.mjs is `"2024-12-08"`** - Consider updating to a more recent date for new projects.
