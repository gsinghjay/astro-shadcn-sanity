# Sanity Code Review: astro-shadcn-sanity

**Date:** 2026-02-09
**Scope:** Full Sanity setup (schemas, queries, frontend integration, studio config, project structure)

## Overview

Monorepo with `studio/` (Sanity Studio v5) and `astro-app/` (Astro frontend). Page builder pattern with 11 block types, singleton site settings, visual editing support. Overall architecture is solid -- the issues below are mostly medium-severity best-practice gaps.

---

## Schema Review

### What's done well

- `defineType` and `defineField` used consistently
- `defineBlock` helper for shared base fields is a clean pattern
- Proper groups in `page.ts` (layout, content, seo)
- Good validation: SEO char limits, required fields, URL scheme validation
- `hotspot: true` on images
- Insert menu with categorized groups and grid preview

### Issues found

**1. Missing `defineArrayMember` for array items** (Medium)

Array `of` items should use `defineArrayMember()` for type safety and autocompletion.

`studio/src/schemaTypes/documents/page.ts:92-104`:

```typescript
// Current
of: [
  {type: 'heroBanner'},
  {type: 'featureGrid'},
  ...
]

// Should be
of: [
  defineArrayMember({type: 'heroBanner'}),
  defineArrayMember({type: 'featureGrid'}),
  ...
]
```

Same issue in `hero-banner.ts:24-25` (`backgroundImages` array), `hero-banner.ts:43` (`ctaButtons` array), and likely other block schemas.

**2. Missing icons on most block types** (Low)

The `heroBanner` block doesn't pass an `icon` to `defineBlock`. Block previews in arrays look better with icons. The `button` and `seo` objects also lack icons.

**3. Button URL rejects relative paths** (High)

`studio/src/schemaTypes/objects/button.ts:18-19`:

```typescript
Rule.required().uri({scheme: ['http', 'https', 'mailto', 'tel']})
```

This rejects internal links like `/about` or `/sponsors`. Editors can't link to internal pages. Consider allowing `allowRelative: true` or switching to a toggle pattern (internal reference vs external URL).

**4. Alignment field should use `layout: 'radio'`** (Low)

`studio/src/schemaTypes/blocks/hero-banner.ts:49-52` -- Three options (`left`, `center`, `right`) would render better as radio buttons instead of a dropdown. Same applies to `blockBaseFields` in `block-base.ts`.

---

## Query Review

### What's done well

- Field projections (not `*`) -- good for performance
- Type-conditional block expansions
- Query parameters used (`$slug`)
- Module-level memoization of site settings

### Issues found

**5. Queries not wrapped in `defineQuery`** (High)

None of the queries use `defineQuery()`. This means TypeGen can't generate types for query results.

`astro-app/src/lib/sanity.ts:45`:

```typescript
// Current
export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{...}`;

// Should be
import { defineQuery } from "groq";
export const SITE_SETTINGS_QUERY = defineQuery(groq`*[_type == "siteSettings"][0]{...}`);
```

**6. Query naming doesn't follow SCREAMING_SNAKE_CASE** (Low)

Convention is `SITE_SETTINGS_QUERY`, `PAGE_BY_SLUG_QUERY`, `ALL_PAGE_SLUGS_QUERY`. Current names use camelCase.

**7. `pageBySlugQuery` missing 4 block type projections** (High)

The page schema has 11 block types but the query only has type-conditional projections for 7. Missing:

- `richText` -- content won't be fetched
- `faqSection` -- items won't be fetched
- `contactForm` -- fields won't be fetched
- `sponsorCards` -- sponsors won't be fetched

These blocks will only return `_type`, `_key`, and the base fields. Their content fields will be empty.

**8. SEO fields under-projected** (Medium)

`astro-app/src/lib/sanity.ts:100`:

```groq
"description": seo.metaDescription,
```

Missing `seo.metaTitle` and `seo.ogImage`. The `metaTitle` should be used in `<title>` tags, and `ogImage` is needed for social sharing.

**9. Image queries don't include LQIP metadata** (Low)

All image projections use `asset->{ _id, url }` but don't include `metadata { lqip, dimensions }`. This means blur placeholders won't work.

---

## Frontend Integration Review

### What's done well

- Stega encoding with perspective switching
- Token validation when visual editing is active
- `resultSourceMap` enabled for click-to-edit
- Image URL builder set up correctly
- Presentation tool with proper document location resolve

### Issues found

**10. Missing `stegaClean` for logic-critical values** (Critical)

`astro-app/src/pages/[...slug].astro:35`:

```typescript
const TemplateComponent = templates[page.template as keyof typeof templates] ?? DefaultTemplate;
```

And line 38:

```typescript
hideNav={page.template === 'landing'}
```

When visual editing is enabled, `page.template` contains invisible stega characters. The template lookup will fail (always fallback to `DefaultTemplate`) and the `=== 'landing'` check will never match. You need:

```typescript
import { stegaClean } from "@sanity/client/stega";
const cleanTemplate = stegaClean(page.template);
const TemplateComponent = templates[cleanTemplate as keyof typeof templates] ?? DefaultTemplate;
```

Same concern applies to block `alignment`, `backgroundVariant`, `spacing`, `maxWidth`, and `imagePosition` fields in block components if they're used in conditionals.

**11. `[...slug].astro` bypasses `loadQuery`** (Medium)

`astro-app/src/pages/[...slug].astro:29`:

```typescript
const page = await sanityClient.fetch(pageBySlugQuery, { slug });
```

This directly uses `sanityClient.fetch` instead of the `loadQuery` helper, which means stega encoding, perspective switching, and token injection are skipped for dynamic pages. Only the homepage uses `loadQuery` via `getPage()`.

**12. Manual TypeScript types instead of TypeGen** (High)

`astro-app/src/lib/types.ts` has 310 lines of hand-written interfaces. These can drift from the actual schema. With TypeGen, these would be auto-generated and always in sync. Several types already include fields not in the schema (e.g., `Sponsor.projectThemes`, `Sponsor.yearJoined`, `TeamMember.imageUrl`).

**13. `FaqSectionBlock` missing `BlockBase` extends** (Low)

`astro-app/src/lib/types.ts:66`:

```typescript
export interface FaqSectionBlock {
```

Doesn't extend `BlockBase`, but the schema block uses `defineBlock` which includes base fields. Same for `SponsorCardsBlock`, `TimelineBlock`, `RichTextBlock`, `ContactFormBlock`.

---

## Studio Configuration Review

### What's done well

- Singleton enforced via structure + `newDocumentOptions` filter
- Presentation tool with document resolve
- Vision tool included
- Clean desk structure

### Issues found

**14. Missing singleton action restrictions** (Medium)

`studio/sanity.config.ts` -- Singletons should also prevent delete/duplicate actions:

```typescript
document: {
  actions: (input, context) =>
    singletonTypes.has(context.schemaType)
      ? input.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action))
      : input,
  newDocumentOptions: (prev) => prev.filter(/* ... */),
}
```

Currently an editor could delete the siteSettings document from the actions menu.

**15. `studioUrl` is hardcoded to localhost** (Low)

`astro-app/astro.config.mjs:32`:

```typescript
stega: {
  studioUrl: "http://localhost:3333",
}
```

This should be an environment variable for production deployment (e.g., `https://your-studio.sanity.studio`).

---

## Project Structure Review

### What's done well

- Clean monorepo with `studio/` and `astro-app/` workspaces
- Schema organized into `documents/`, `objects/`, `blocks/`, `helpers/`
- kebab-case file naming
- Named exports

### Issues found

**16. No TypeGen configuration** (Medium)

No `sanity-typegen.json` found anywhere. No `typegen` script in either `package.json`. Combined with the manual types issue (#12), this means the project lacks automated type safety between schema and frontend.

**17. Dead schema files** (Low)

`team-grid.ts` and `timeline.ts` exist in `studio/src/schemaTypes/blocks/` but are commented out of the index. The `BlockRenderer.astro` still imports and references `Timeline` and `TeamGrid` components. Either clean up or re-enable.

**18. Legacy data files** (Low)

`astro-app/src/lib/data/` contains hardcoded page data (home, about, contact, sponsors, projects). These appear to be deprecated now that Sanity is the source of truth. Should be removed to avoid confusion.

---

## Summary

| Severity | Count | Key Items |
|----------|-------|-----------|
| Critical | 1 | #10: Missing `stegaClean` breaks template selection during visual editing |
| High | 3 | #3: Button rejects internal URLs, #5: No `defineQuery`, #7: Missing block projections |
| Medium | 4 | #8: SEO under-projected, #11: Bypasses `loadQuery`, #14: Singleton deletable, #16: No TypeGen |
| Low | 7 | Icons, LQIP, naming conventions, dead code, legacy files, radio layouts, missing BlockBase extends |

## Recommended Priority

1. Fix `stegaClean` usage (#10) -- visual editing is broken without this
2. Add missing block projections to `pageBySlugQuery` (#7) -- 4 block types return empty
3. Fix button URL validation (#3) -- editors can't create internal links
4. Make `[...slug].astro` use `loadQuery` (#11) -- visual editing broken on non-home pages
5. Set up TypeGen and `defineQuery` (#5, #12, #16) -- type safety foundation
