# Story 2.4: fulldev/ui Schemas — Hero & Banner Variants

Status: ready-for-dev

## Story

As a developer,
I want Sanity schemas for all hero, banner, header, and footer fulldev/ui block variants,
So that content editors can add these layout components to pages via Sanity Studio.

## Acceptance Criteria

1. Each of the 22 blocks has a schema file in `studio/src/schemaTypes/blocks/` using `defineBlock` with fields matching the component's props
2. All 22 schemas are registered in `studio/src/schemaTypes/index.ts`
3. All 22 block types are added to the page schema's `blocks[]` array
4. GROQ projections are added for all 22 blocks in `astro-app/src/lib/sanity.ts`
5. TypeScript types are added to `astro-app/src/lib/types.ts` and included in the `PageBlock` union
6. Sanity Studio starts without schema errors
7. Content editors can add, configure, and preview all 22 block types in Studio
8. `BlockRenderer.astro` requires NO changes — existing `fulldotdevBlocks` map already dispatches these blocks

## Assigned Blocks (22)

| Category | Blocks | Count |
|----------|--------|:-----:|
| hero | hero-1 through hero-14 | 14 |
| banner | banner-1, banner-2 | 2 |
| header | header-1, header-2, header-3 | 3 |
| footer | footer-1, footer-2, footer-3 | 3 |

## Tasks / Subtasks

- [ ] Task 1: Inspect component props for all 22 blocks (AC: #1)
  - [ ] 1.1 Read each `.astro` file in `astro-app/src/components/blocks/` for the 22 assigned blocks
  - [ ] 1.2 Document the props interface for each component (field name, type, required/optional)
  - [ ] 1.3 Identify shared prop patterns across variants within each category (e.g., all hero variants may share heading, subheading, image fields)

- [ ] Task 2: Create Sanity schemas (AC: #1)
  - [ ] 2.1 Create schema files for hero-1 through hero-14 in `studio/src/schemaTypes/blocks/` using `defineBlock`
  - [ ] 2.2 Create schema files for banner-1, banner-2
  - [ ] 2.3 Create schema files for header-1, header-2, header-3
  - [ ] 2.4 Create schema files for footer-1, footer-2, footer-3
  - [ ] 2.5 Ensure each schema's fields match the component's props exactly (name, type, validation)

- [ ] Task 3: Register schemas and update page schema (AC: #2, #3)
  - [ ] 3.1 Add all 22 schema imports to `studio/src/schemaTypes/index.ts`
  - [ ] 3.2 Add all 22 block types to the page schema's `blocks[]` array in `studio/src/schemaTypes/documents/page.ts`

- [ ] Task 4: Add GROQ projections (AC: #4)
  - [ ] 4.1 Add GROQ projections for all 22 blocks in `astro-app/src/lib/sanity.ts`
  - [ ] 4.2 Ensure projections include all fields needed by each component

- [ ] Task 5: Add TypeScript types (AC: #5)
  - [ ] 5.1 Add type interfaces for all 22 blocks in `astro-app/src/lib/types.ts`
  - [ ] 5.2 Add all 22 types to the `PageBlock` union type

- [ ] Task 6: Verify (AC: #6, #7, #8)
  - [ ] 6.1 Run Sanity Studio — verify no schema errors
  - [ ] 6.2 Add one block of each category to a test page in Studio — verify it renders
  - [ ] 6.3 Run `npm run build` — verify build succeeds
  - [ ] 6.4 Run `npm run test:integration` — existing tests still green

## Dev Notes

### Process Per Block

For each of the 22 blocks, follow these 7 steps:

1. Read the `.astro` component file to extract its props
2. Create a schema file using `defineBlock` with matching fields
3. Register in `studio/src/schemaTypes/index.ts`
4. Add to page schema `blocks[]` array
5. Add GROQ projection in `astro-app/src/lib/sanity.ts`
6. Add TypeScript type in `astro-app/src/lib/types.ts`
7. Include in `PageBlock` union

### Spread Props Pattern

These fulldev/ui components use a spread-props pattern in `BlockRenderer.astro`:

```astro
<FdComponent {...(block as any)} />
```

This means the Sanity schema fields are passed directly as component props. The field names in your schema MUST match the component's prop names exactly.

### Shared Files (Coordination with Stories 2.5–2.8)

Four files are touched by all 5 parallel stories. Each developer adds only their blocks (append-only). Merge conflicts are trivial to resolve:

- `studio/src/schemaTypes/index.ts` — add imports and registrations
- `studio/src/schemaTypes/documents/page.ts` — add types to `blocks[]` array
- `astro-app/src/lib/sanity.ts` — add GROQ projections
- `astro-app/src/lib/types.ts` — add type interfaces and update `PageBlock` union

### Branch Strategy

Work on branch `feat/2.4-ui-blocks-hero-banner`. Merge sequentially with other parallel stories to resolve additive conflicts.

### Dependencies

- **Requires:** Story 1.3 (schema infrastructure — `defineBlock` helper)
- **Parallel with:** Stories 2.5, 2.6, 2.7, 2.8
- **No dependency on:** Stories 2.1, 2.2, 2.3 (custom block schemas are independent)

### References

- [Source: astro-app/src/components/blocks/hero-*.astro — Component prop interfaces]
- [Source: astro-app/src/components/blocks/banner-*.astro — Component prop interfaces]
- [Source: astro-app/src/components/blocks/header-*.astro — Component prop interfaces]
- [Source: astro-app/src/components/blocks/footer-*.astro — Component prop interfaces]
- [Source: astro-app/src/components/BlockRenderer.astro — fulldotdevBlocks dispatch map]
- [Source: studio/src/schemaTypes/helpers/defineBlock.ts — defineBlock helper]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
