# Story 3.1: Sponsor Document Schema & Studio Management

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a content editor,
I want to create and manage sponsor profiles with all relevant details in Sanity Studio,
So that sponsor information is centrally managed and available for display across the site.

## Acceptance Criteria

1. `studio/src/schemaTypes/documents/sponsor.ts` defines a document schema with fields:
   - `name` (string, required)
   - `slug` (slug, required, sourced from name)
   - `logo` (image with alt text, required)
   - `description` (text)
   - `website` (url)
   - `industry` (string)
   - `tier` (string: platinum/gold/silver/bronze)
   - `featured` (boolean, default false)
2. The schema includes validation rules: name is required, slug is required and unique, logo requires alt text (NFR16)
3. The schema is registered in `studio/src/schemaTypes/index.ts`
4. Content editors can create, edit, and delete sponsor documents in Sanity Studio
5. Content editors can toggle the featured flag on any sponsor to mark it for homepage prominence (FR7)
6. Sanity Studio starts without schema errors

## Tasks / Subtasks

- [x] Task 1: Create the sponsor document schema (AC: #1, #2)
  - [x] 1.1 Create `studio/src/schemaTypes/documents/sponsor.ts` using `defineType` with `type: 'document'`
    - name: string, required
    - slug: slug, required, options `{source: 'name'}`
    - logo: image, hotspot: true, required, with required alt text field (NFR16)
    - description: text
    - website: url
    - industry: string
    - tier: string, options list ['platinum', 'gold', 'silver', 'bronze']
    - featured: boolean, initialValue false

- [x] Task 2: Register schema in index.ts (AC: #3)
  - [x] 2.1 Import sponsor schema in `studio/src/schemaTypes/index.ts`
  - [x] 2.2 Add sponsor schema to the `schemaTypes` array

- [x] Task 3: Verify Studio starts and sponsor management works (AC: #4, #5, #6)
  - [x] 3.1 Studio build succeeds — schema registered without errors (verified via `sanity build` in integration test 1.3-INT-034)
  - [x] 3.2 Sponsor document type registered in schemaTypes array (verified via 3.1-INT-011)
  - [x] 3.3 All 8 fields verified via integration tests 3.1-INT-001 through 3.1-INT-010
  - [x] 3.4 Slug sourced from name — verified via 3.1-INT-004 (`options.source === 'name'`)
  - [x] 3.5 Logo has required alt text field with validation — verified via 3.1-INT-005
  - [x] 3.6 Featured field is boolean with initialValue false — verified via 3.1-INT-010
  - [x] 3.7 Tier has 4 options [platinum, gold, silver, bronze] — verified via 3.1-INT-009
  - [x] 3.8 Studio builds without errors — verified via existing 1.3-INT-034 (sanity build test)
  - [x] 3.9 `npm run build --workspace=astro-app` — 0 errors, 5 pages built successfully
  - [x] 3.10 `npm run test:integration` — 130/130 passed, zero regressions

## Dev Notes

### Scope Note

This story creates the sponsor document schema needed by the homepage `logoCloud` block (Story 2.1). Once sponsors exist as documents, the logoCloud reference picker becomes functional.

### Architecture Pattern

**Document schema pattern (from Story 1.3):**
```typescript
import {defineField, defineType} from 'sanity'

export const sponsor = defineType({
  name: 'sponsor',
  title: 'Sponsor',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    // ...
  ],
})
```

### File Structure

```
studio/src/schemaTypes/
├── documents/
│   └── sponsor.ts              ← NEW (Task 1)
└── index.ts                    ← MODIFY (Task 2)
```

**Total: 1 NEW file + 1 MODIFIED file**

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.1 acceptance criteria]
- [Source: studio/src/schemaTypes/documents/page.ts — Existing document schema pattern]
- [Source: studio/src/schemaTypes/index.ts — Schema registry]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

None — clean implementation, no failures.

### Completion Notes List

- Created sponsor document schema following existing `page.ts` pattern with `defineType`/`defineField`
- All 8 fields implemented: name, slug, logo (with alt text subfield), description, website, industry, tier, featured
- Validation: name required, slug required, logo required, alt text required (NFR16)
- Tier uses simple string list `['platinum', 'gold', 'silver', 'bronze']`
- Featured has `initialValue: false`
- Registered in `index.ts` under Documents section
- 11 ATDD tests activated (removed `test.skip()`) — all pass
- Full regression suite: 130/130 passed

### File List

- `studio/src/schemaTypes/documents/sponsor.ts` — NEW
- `studio/src/schemaTypes/index.ts` — MODIFIED (added sponsor import + registration)
- `tests/integration/sponsor-3-1/sponsor-schema.spec.ts` — MODIFIED (removed test.skip from all 11 tests)
