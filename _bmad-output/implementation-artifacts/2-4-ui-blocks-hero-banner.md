# Story 2.4: Layout Variant Infrastructure

Status: done

## Story

As a developer,
I want a variant system that lets editors choose layout styles for existing page builder blocks,
So that content editors get visual variety without schema sprawl — one block type with multiple rendering options instead of 98 separate schema types.

## Context / Decision Record

The original stories 2.4–2.8 planned to convert all ~98 FullDev UI block variants into individual Sanity schema types. After analysis (see `docs/block-layout-catalog.md`), we determined:

- Most FullDev UI blocks are **layout variants** of the same content type (e.g., hero-1 through hero-14 all render a hero with heading + buttons + image)
- Creating 98 schema types would overwhelm editors, bloat GROQ projections, and make the insert menu unusable
- **Path 1 (variant fields)** adds a `variant` string field to existing blocks, letting the Astro component switch rendering layout based on the selected variant
- The FullDev UI blocks serve as **design reference** — the Section primitives (`SectionSplit`, `SectionSpread`, `SectionGrid`, `SectionMasonry`) handle the actual layout switching
- Only genuinely new content types (video embed) get new schema types

## Acceptance Criteria

1. `defineBlock` helper accepts an optional `variants` config that adds a `variant` string field with radio layout and conditional field hiding
2. A `variantLayoutMap` helper or constant maps variant names to Section layout primitives for each block type
3. `BlockWrapper.astro` or a new `VariantLayout.astro` component accepts a `variant` prop and renders the appropriate Section layout (SectionContent, SectionSplit, SectionSpread, etc.)
4. Existing blocks continue to render correctly with their current layout as the `default` variant
5. The `variant` field appears in the "Layout Options" fieldset (collapsed by default) alongside `backgroundVariant`, `spacing`, `maxWidth`
6. Conditional field hiding works — fields irrelevant to a variant are hidden in Studio (e.g., hide `imagePosition` when variant doesn't use a side image)
7. The `variant` field is added to the base `blocks[]` GROQ projection in `PAGE_BY_SLUG_QUERY` alongside `backgroundVariant`, `spacing`, `maxWidth` (the projection explicitly lists fields — new fields are NOT auto-included)
8. `npm run typegen` generates correct types including the variant field
9. All existing tests pass — zero regression

## Tasks / Subtasks

- [x] Task 1: Extend `defineBlock` helper (AC: #1, #5)
  - [x] 1.1 Add optional `variants` parameter to `DefineBlockConfig` interface: `variants?: { name: string; title: string }[]`
  - [x] 1.2 When `variants` is provided, auto-add a `variant` string field to `blockBaseFields` with radio layout in the `layout` fieldset
  - [x] 1.3 Set `initialValue` to the first variant (which should always be `'default'`)
  - [x] 1.4 Ensure variant field will be picked up by GROQ — see Task 5 for required projection update

- [x] Task 2: Create variant layout helper (AC: #2, #3)
  - [x] 2.1 Create `astro-app/src/lib/variant-layouts.ts` with a type-safe mapping of `{ blockType: { variant: layoutConfig } }`
  - [x] 2.2 Layout config should specify: Section layout component to use (`split`, `spread`, `grid`, `content`), column ratio (for split: `'1:1'`, `'1:2'`, `'2:3'`, `'1:3'`), alignment, and any variant-specific CSS classes
  - [x] 2.3 Export a `getVariantLayout(blockType: string, variant: string)` function — **CRITICAL:** must call `stegaClean()` on the variant value before any map/switch lookup, otherwise Visual Editing stega-encoded strings will break variant resolution (matches existing pattern: `BlockWrapper.astro` cleans `backgroundVariant`, `spacing`, `maxWidth`; `HeroBanner.astro` cleans `alignment`)

- [x] Task 3: Create VariantLayout component (AC: #3, #4)
  - [x] 3.1 Create `astro-app/src/components/VariantLayout.astro` that wraps block content in the appropriate Section layout based on variant
  - [x] 3.2 Accept named slots for content zones: `content` (text/heading), `media` (images/video), `actions` (buttons), `supplementary` (testimonial/rating/list)
  - [x] 3.3 Default variant renders existing single-section layout (backward compatible)
  - [x] 3.4 Split variants use `SectionSplit` with configurable column ratio
  - [x] 3.5 Spread variants use `SectionSpread`
  - [x] 3.6 Grid variants use `SectionGrid` with configurable column count

- [x] Task 4: Add conditional field hiding support (AC: #6)
  - [x] 4.1 In `defineBlock`, accept an optional `hiddenByVariant` map: `{ fieldName: variantName[] }` — hides the field when variant is in the list
  - [x] 4.2 Apply Sanity's `hidden: ({ parent }) => hiddenVariants.includes(parent?.variant)` function to each field based on the map (use `{ parent }` not `{ document }` — the variant field lives on the block object, not the document root; this matches existing patterns in `sponsor-cards.ts`, `logo-cloud.ts`, `testimonials.ts`)
  - [x] 4.3 Document the pattern for story authors to use in subsequent stories

- [x] Task 5: Update GROQ base projection (AC: #7)
  - [x] 5.1 Add `variant` to the base `blocks[]{ _type, _key, backgroundVariant, spacing, maxWidth }` projection in `PAGE_BY_SLUG_QUERY` (and any other page queries that fetch blocks) — the projection explicitly lists fields, so `variant` will be `undefined` on the frontend if not added
  - [x] 5.2 No per-block GROQ changes needed since variant is a string field on the base

- [x] Task 6: Verify (AC: #4, #8, #9)
  - [x] 6.1 Run Sanity Studio — verify no schema errors (studio build passed in test suite)
  - [x] 6.2 Verify existing blocks render identically (default variant = current behavior) — all 19 component tests pass unchanged
  - [x] 6.3 Run `npm run typegen` — verify variant field appears in generated types ✓
  - [x] 6.4 Run `npm run build` — verify build succeeds ✓
  - [x] 6.5 Run `npm run test:unit` — all existing tests pass (699 pass, 0 fail)

## Dev Notes

### Architecture Overview

```
Editor in Studio                    Astro Rendering
┌─────────────────┐                ┌──────────────────────┐
│ Hero Banner      │                │ HeroBanner.astro     │
│ ─────────────── │                │ ──────────────────── │
│ Heading: [____] │                │ switch(variant) {    │
│ Buttons: [____] │   ──GROQ──►   │   'centered':        │
│ Image:   [____] │                │     → SectionContent │
│ ─────────────── │                │   'split':           │
│ Layout Options ▸│                │     → SectionSplit   │
│   Variant: ○ Centered           │   'overlay':         │
│            ● Split               │     → SectionMedia   │
│            ○ Overlay             │ }                    │
└─────────────────┘                └──────────────────────┘
```

### Key Design Decisions

1. **Variant is a layout concern, not a content concern** — The same heading, image, and buttons render in different layouts. The schema fields stay the same; only the HTML structure changes.

2. **FullDev UI blocks are design reference, not runtime code** — We study hero-1 through hero-14 to understand what layouts to support, then implement those layouts using Section primitives in the custom block component. We do NOT import or render the FullDev UI blocks directly.

3. **Superset fields with conditional hiding** — Each block's schema has ALL fields any variant might use. Fields irrelevant to the current variant are hidden in Studio (not removed). This keeps the schema stable and prevents data loss when switching variants.

4. **Default variant = current behavior** — Every block's first variant must produce identical output to the current implementation. Zero visual regression.

5. **`stegaClean` is mandatory for variant values** — The variant field controls rendering logic (switch/map lookups). Visual Editing injects stega encoding into string values, which breaks comparisons. Always call `stegaClean(variant)` before using the value in any conditional logic. This matches the existing pattern used for `alignment`, `backgroundVariant`, `spacing`, and `maxWidth`.

### Section Primitive Reference

| Primitive | Import | Layout | Use For |
|-----------|--------|--------|---------|
| `SectionContent` | `ui/section` | Single-column centered/left | Default/centered variants |
| `SectionSplit` | `ui/section` | Two-column side-by-side | Split variants (configurable ratio) |
| `SectionSpread` | `ui/section` | Two-column space-between | Spread variants |
| `SectionGrid` | `ui/section` | Multi-column responsive grid | Grid variants |
| `SectionMasonry` | `ui/section` | Pinterest-style flow | Masonry variants |
| `SectionMedia` | `ui/section` | Background/overlay media | Overlay variants |

### Reference

- [Layout Catalog: docs/block-layout-catalog.md — Full inventory of FullDev UI layouts]
- [Source: studio/src/schemaTypes/helpers/defineBlock.ts — Current helper]
- [Source: studio/src/schemaTypes/objects/block-base.ts — Current base fields]
- [Source: astro-app/src/components/BlockWrapper.astro — Current wrapper]
- [Source: astro-app/src/components/ui/section/ — Section layout primitives]

### Dependencies

- **Requires:** Story 1.3 (schema infrastructure — `defineBlock` helper exists)
- **Blocks:** Stories 2.5, 2.6, 2.7, 2.8 (they depend on the variant infrastructure)

### Branch Strategy

Work on branch `feat/2.4-variant-infrastructure`.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — clean implementation, no debugging needed.

### Completion Notes List

- Extended `defineBlock` with `variants` and `hiddenByVariant` config options. Variant field auto-added to layout fieldset with radio layout when variants provided. hiddenByVariant applies `hidden` callback using `{ parent }` context.
- Created `variant-layouts.ts` with `getVariantLayout()` (stegaClean integration) and `registerVariantLayouts()` for block-type-specific layout registration.
- Created `VariantLayout.astro` component with named slots (content, media, actions, supplementary) that dispatches to SectionContent, SectionSplit, SectionSpread, SectionGrid, SectionMasonry, or media layout based on variant config.
- Added `variant` to `PAGE_BY_SLUG_QUERY` base block projection.
- TypeGen regenerated — `variant` field appears in all block types (currently `null` since no blocks use variants yet).
- 702 tests pass, 0 regressions. Build succeeds. Studio builds without schema errors.

#### Code Review Fixes Applied

- **M1**: `hiddenByVariant` now composes with existing `hidden` functions instead of replacing them.
- **M2**: `getVariantLayout` now calls `stegaClean()` on `blockType` in addition to `variant`.
- **M3**: Added `'masonry'` to `SectionLayoutType` and masonry branch to `VariantLayout.astro`.
- **M4**: Added `clearVariantLayouts()` export for test cleanup; all test files use `afterEach` cleanup.
- **L1**: Corrected test counts in story documentation.
- **L2**: Improved SectionGrid test assertion from fragile `toContain('grid')` to regex match on grid CSS classes.
- **L3**: Added `bg-black/40` contrast overlay to media layout for accessibility.

### File List

- `studio/src/schemaTypes/helpers/defineBlock.ts` — extended with variants + hiddenByVariant (+ hidden function composition)
- `astro-app/src/lib/variant-layouts.ts` — NEW: variant layout mapping helper (+ stegaClean blockType, clearVariantLayouts, masonry type)
- `astro-app/src/components/VariantLayout.astro` — NEW: layout dispatch component (+ masonry branch, contrast overlay)
- `astro-app/src/lib/sanity.ts` — added `variant` to base GROQ projection
- `astro-app/src/sanity.types.ts` — regenerated via typegen
- `tests/integration/variant-2-4/variant-infrastructure.test.ts` — NEW: 10 integration tests
- `astro-app/src/lib/__tests__/variant-layouts.test.ts` — NEW: 9 unit tests
- `astro-app/src/components/__tests__/VariantLayout.test.ts` — NEW: 10 component tests
