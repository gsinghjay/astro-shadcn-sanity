# ATDD Checklist - Epic 1, Story 1-3: Schema Infrastructure

**Date:** 2026-02-07
**Author:** Jay
**Primary Test Level:** Integration (schema module validation)

---

## Story Summary

As a developer, I want the core schema helpers, shared objects, and foundational document schemas in place, so that all future block and document schemas follow a consistent, type-safe pattern.

**As a** developer
**I want** core schema helpers, shared objects, and foundational document schemas
**So that** all future block and document schemas follow a consistent, type-safe pattern

---

## Acceptance Criteria

1. `defineBlock` helper exports a function that wraps `defineType` and merges shared base fields
2. `block-base.ts` defines shared base fields with constrained presets
3. `seo.ts` defines an SEO object with metaTitle, metaDescription, ogImage
4. `button.ts` defines a reusable button object with text, url, variant
5. `portable-text.ts` defines the rich text configuration
6. `page.ts` defines a page document with title, slug, seo, blocks[] (12 types)
7. `site-settings.ts` defines a singleton document with all required fields
8. All schemas registered in `index.ts`
9. All schemas use `defineType`/`defineField` with TypeScript and validation
10. Sanity Studio starts without schema errors

---

## Failing Tests Created (RED Phase)

### Integration Tests (34 tests)

**File:** `tests/integration/schema-infrastructure.spec.ts` (350 lines)

#### AC1: defineBlock Helper (3 tests)

- **Test:** `[P0] 1.3-INT-001 — defineBlock exports a function`
  - **Status:** RED — `test.skip()` — file `helpers/defineBlock.ts` does not exist
  - **Verifies:** Module exports a callable `defineBlock` function

- **Test:** `[P0] 1.3-INT-002 — defineBlock merges base fields into block schema`
  - **Status:** RED — `test.skip()` — file `helpers/defineBlock.ts` does not exist
  - **Verifies:** Result has `type: 'object'` and includes backgroundVariant, spacing, maxWidth fields

- **Test:** `[P0] 1.3-INT-003 — defineBlock places base fields before block-specific fields`
  - **Status:** RED — `test.skip()` — file `helpers/defineBlock.ts` does not exist
  - **Verifies:** Block-specific fields appear after base fields in the fields array

#### AC2: Block Base Fields (3 tests)

- **Test:** `[P0] 1.3-INT-004 — blockBaseFields contains backgroundVariant with constrained presets`
  - **Status:** RED — `test.skip()` — file `objects/block-base.ts` does not exist
  - **Verifies:** Field exists with options `['white', 'light', 'dark', 'primary']`

- **Test:** `[P0] 1.3-INT-005 — blockBaseFields contains spacing with constrained presets`
  - **Status:** RED — `test.skip()` — file `objects/block-base.ts` does not exist
  - **Verifies:** Field exists with options `['none', 'small', 'default', 'large']`

- **Test:** `[P0] 1.3-INT-006 — blockBaseFields contains maxWidth with constrained presets`
  - **Status:** RED — `test.skip()` — file `objects/block-base.ts` does not exist
  - **Verifies:** Field exists with options `['narrow', 'default', 'full']`

#### AC3: SEO Object Schema (4 tests)

- **Test:** `[P1] 1.3-INT-007 — seo schema has metaTitle, metaDescription, ogImage fields`
  - **Status:** RED — `test.skip()` — file `objects/seo.ts` does not exist
  - **Verifies:** Schema name is `seo`, type is `object`, all 3 fields present

- **Test:** `[P1] 1.3-INT-008 — seo metaTitle has max length validation`
  - **Status:** RED — `test.skip()` — validates string type with validation rule

- **Test:** `[P1] 1.3-INT-009 — seo metaDescription is text type with max length validation`
  - **Status:** RED — `test.skip()` — validates text type with validation rule

- **Test:** `[P1] 1.3-INT-010 — seo ogImage has alt text field`
  - **Status:** RED — `test.skip()` — validates image type with nested alt string field

#### AC4: Button Object Schema (4 tests)

- **Test:** `[P1] 1.3-INT-011 — button schema has text, url, variant fields`
  - **Status:** RED — `test.skip()` — file `objects/button.ts` does not exist

- **Test:** `[P1] 1.3-INT-012 — button text is required string`
  - **Status:** RED — `test.skip()` — validates required validation on text field

- **Test:** `[P1] 1.3-INT-013 — button url is required url type`
  - **Status:** RED — `test.skip()` — validates url type with validation

- **Test:** `[P1] 1.3-INT-014 — button variant has constrained options`
  - **Status:** RED — `test.skip()` — validates options `['default', 'secondary', 'outline', 'ghost']`

#### AC5: Portable Text Schema (5 tests)

- **Test:** `[P1] 1.3-INT-015 — portableText is array type with block, image, callout members`
  - **Status:** RED — `test.skip()` — file `objects/portable-text.ts` does not exist

- **Test:** `[P1] 1.3-INT-016 — portableText block has expected styles`
  - **Status:** RED — `test.skip()` — validates normal, h2, h3, h4, blockquote

- **Test:** `[P1] 1.3-INT-017 — portableText block has strong, em, code, underline decorators`
  - **Status:** RED — `test.skip()` — validates decorator values

- **Test:** `[P1] 1.3-INT-018 — portableText block has link and internalLink annotations`
  - **Status:** RED — `test.skip()` — validates annotation names

- **Test:** `[P1] 1.3-INT-019 — portableText image member has required alt text (NFR16)`
  - **Status:** RED — `test.skip()` — validates accessibility requirement

#### AC6: Page Document Schema (4 tests)

- **Test:** `[P0] 1.3-INT-020 — page schema has title, slug, seo, blocks fields`
  - **Status:** RED — `test.skip()` — file `documents/page.ts` does not exist

- **Test:** `[P0] 1.3-INT-021 — page blocks array accepts all 12 P0 block types`
  - **Status:** RED — `test.skip()` — validates all 12 block type names in `of` array

- **Test:** `[P0] 1.3-INT-022 — page title is required string`
  - **Status:** RED — `test.skip()` — validates required validation

- **Test:** `[P0] 1.3-INT-023 — page slug is required and sourced from title`
  - **Status:** RED — `test.skip()` — validates slug type, source: 'title', required

#### AC7: Site Settings Document Schema (6 tests)

- **Test:** `[P0] 1.3-INT-024 — siteSettings schema has all required fields`
  - **Status:** RED — `test.skip()` — file `documents/site-settings.ts` does not exist

- **Test:** `[P0] 1.3-INT-025 — siteSettings siteName is required`
  - **Status:** RED — `test.skip()` — validates required string

- **Test:** `[P0] 1.3-INT-026 — siteSettings logo has alt text field`
  - **Status:** RED — `test.skip()` — validates image with nested alt field

- **Test:** `[P1] 1.3-INT-027 — siteSettings navigationItems supports one level of nesting`
  - **Status:** RED — `test.skip()` — validates array with label, href, children fields

- **Test:** `[P1] 1.3-INT-028 — siteSettings socialLinks has platform options`
  - **Status:** RED — `test.skip()` — validates platform options list

- **Test:** `[P1] 1.3-INT-029 — siteSettings currentSemester is a string field`
  - **Status:** RED — `test.skip()` — validates string type

#### AC8: Schema Registration (2 tests)

- **Test:** `[P0] 1.3-INT-030 — schemaTypes array contains all registered schemas`
  - **Status:** RED — `test.skip()` — currently exports empty array

- **Test:** `[P0] 1.3-INT-031 — blockBaseFields is NOT registered as a standalone schema`
  - **Status:** RED — `test.skip()` — verifies blockBase is not in schemaTypes

#### AC9: Schema Quality (2 tests)

- **Test:** `[P1] 1.3-INT-032 — all schemas have a name property`
  - **Status:** RED — `test.skip()` — validates all schema objects have name string

- **Test:** `[P1] 1.3-INT-033 — all schemas have typed fields`
  - **Status:** RED — `test.skip()` — validates all fields have name and type properties

#### AC10: Studio Build Verification (1 test)

- **Test:** `[P0] 1.3-INT-034 — studio builds without schema errors`
  - **Status:** RED — `test.skip()` — runs `sanity build` and verifies exit code 0

---

## Data Factories Created

**None required.** Story 1-3 is schema infrastructure — tests import TypeScript modules directly and validate structure. No test data generation needed.

---

## Fixtures Created

**None required.** Existing fixtures (`networkErrorMonitor`, `log`) are not used by integration tests. Tests import from `@playwright/test` directly.

---

## Mock Requirements

**None.** No external services are involved in schema infrastructure.

---

## Required data-testid Attributes

**None.** Story 1-3 creates Studio schemas, not frontend UI components.

---

## Implementation Checklist

### Task Group 1: Schema Helpers (AC1, AC2)

**Tests:** 1.3-INT-001 through 1.3-INT-006

**Tasks to make these tests pass:**

- [ ] Create `studio/src/schemaTypes/helpers/defineBlock.ts`
- [ ] Import `defineType`, `defineField` from `'sanity'`
- [ ] Import `blockBaseFields` from `'../objects/block-base'`
- [ ] Implement `defineBlock(config)` that returns `defineType(...)` with `type: 'object'` and merged `[...blockBaseFields, ...config.fields]`
- [ ] Create `studio/src/schemaTypes/objects/block-base.ts`
- [ ] Export `blockBaseFields` array with 3 `defineField` results: `backgroundVariant`, `spacing`, `maxWidth`
- [ ] Each field: `type: 'string'` with `options.list` containing the constrained presets
- [ ] Remove `test.skip()` from tests 1.3-INT-001 through 1.3-INT-006
- [ ] Run: `npx playwright test tests/integration/schema-infrastructure.spec.ts -g "AC1|AC2"`
- [ ] All 6 tests pass (green phase)

---

### Task Group 2: Shared Object Schemas (AC3, AC4, AC5)

**Tests:** 1.3-INT-007 through 1.3-INT-019

**Tasks to make these tests pass:**

- [ ] Create `studio/src/schemaTypes/objects/seo.ts`
- [ ] Export `seo` as `defineType({ name: 'seo', type: 'object', fields: [...] })`
- [ ] Fields: `metaTitle` (string, max 60), `metaDescription` (text, max 160), `ogImage` (image with alt text)
- [ ] Create `studio/src/schemaTypes/objects/button.ts`
- [ ] Export `button` as `defineType({ name: 'button', type: 'object', fields: [...] })`
- [ ] Fields: `text` (string, required), `url` (url, required), `variant` (string, options list)
- [ ] Create `studio/src/schemaTypes/objects/portable-text.ts`
- [ ] Export `portableText` as `defineType({ name: 'portableText', type: 'array', of: [...] })`
- [ ] Array members: `block` (with styles, decorators, annotations), `image` (with alt text), `callout` (object with tone + text)
- [ ] Remove `test.skip()` from tests 1.3-INT-007 through 1.3-INT-019
- [ ] Run: `npx playwright test tests/integration/schema-infrastructure.spec.ts -g "AC3|AC4|AC5"`
- [ ] All 13 tests pass (green phase)

---

### Task Group 3: Document Schemas (AC6, AC7)

**Tests:** 1.3-INT-020 through 1.3-INT-029

**Tasks to make these tests pass:**

- [ ] Create `studio/src/schemaTypes/documents/page.ts`
- [ ] Export `page` as `defineType({ name: 'page', type: 'document', fields: [...] })`
- [ ] Fields: `title` (string, required), `slug` (slug, required, source: 'title'), `seo` (type: 'seo'), `blocks` (array of 12 block types)
- [ ] Create `studio/src/schemaTypes/documents/site-settings.ts`
- [ ] Export `siteSettings` as `defineType({ name: 'siteSettings', type: 'document', fields: [...] })`
- [ ] Fields: `siteName` (string, required), `logo` (image with alt), `navigationItems` (array with label/href/children), `footerContent` (object), `socialLinks` (array with platform/url), `currentSemester` (string)
- [ ] Remove `test.skip()` from tests 1.3-INT-020 through 1.3-INT-029
- [ ] Run: `npx playwright test tests/integration/schema-infrastructure.spec.ts -g "AC6|AC7"`
- [ ] All 10 tests pass (green phase)

---

### Task Group 4: Registration & Quality (AC8, AC9, AC10)

**Tests:** 1.3-INT-030 through 1.3-INT-034

**Tasks to make these tests pass:**

- [ ] Update `studio/src/schemaTypes/index.ts` to import all schemas
- [ ] Import: `seo`, `button`, `portableText` from objects/
- [ ] Import: `page`, `siteSettings` from documents/
- [ ] Export in `schemaTypes` array (at least 5 entries)
- [ ] Do NOT import `blockBaseFields` or `defineBlock` — they are helpers, not registered types
- [ ] Remove `test.skip()` from tests 1.3-INT-030 through 1.3-INT-034
- [ ] Run: `npx playwright test tests/integration/schema-infrastructure.spec.ts -g "AC8|AC9|AC10"`
- [ ] All 5 tests pass (green phase)
- [ ] Run `npm run build` from studio/ to verify Studio build

---

## Running Tests

```bash
# Run all Story 1-3 integration tests
npx playwright test tests/integration/schema-infrastructure.spec.ts

# Run specific AC group
npx playwright test tests/integration/schema-infrastructure.spec.ts -g "AC1"

# Run P0 tests only
npx playwright test tests/integration/schema-infrastructure.spec.ts -g "\\[P0\\]"

# Run in list reporter mode (concise output)
npx playwright test tests/integration/schema-infrastructure.spec.ts --reporter=list

# Debug a specific test
npx playwright test tests/integration/schema-infrastructure.spec.ts -g "1.3-INT-001" --debug
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- All 34 tests written and skipped (`test.skip()`)
- Tests assert expected schema structure (not placeholder assertions)
- Implementation checklist created with 4 task groups
- No fixtures or data factories needed (schema infrastructure)

**Verification:**

- All tests are marked `test.skip()` — they document expected behavior
- When `.skip` is removed, tests will fail due to missing modules (MODULE_NOT_FOUND)
- Failure is due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick a task group** from implementation checklist (start with Group 1: helpers)
2. **Implement the schema files** following the story dev notes
3. **Remove `test.skip()`** from the corresponding tests
4. **Run the tests** to verify they pass
5. **Check off tasks** in implementation checklist
6. **Move to next task group** and repeat

**Key Principles:**

- One task group at a time
- Implement schema files per dev notes patterns (`defineType`, `defineField`)
- Run tests after each file is created
- Tests import modules directly — they validate structure, not Studio UI

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

1. Verify all 34 tests pass
2. Run `sanity build` from studio/ to confirm Studio loads
3. Review schema code for consistency (naming, validation patterns)
4. Ensure no duplicate field definitions
5. Verify all schemas use `defineType`/`defineField` consistently

---

## Next Steps

1. **Review this checklist** and the test file
2. **Start implementation** with Task Group 1 (defineBlock helper + block-base fields)
3. **Work through task groups** sequentially (helpers → objects → documents → registration)
4. **Remove `test.skip()` as you implement** each group
5. **Run tests after each group** to verify green phase
6. **When all 34 tests pass**, run `sanity build` to verify Studio
7. **When complete**, update story status to 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

- **test-quality.md** — Test design principles (Given-When-Then, determinism, isolation)
- **test-levels-framework.md** — Test level selection (integration chosen over E2E for schema validation)
- **data-factories.md** — Evaluated and determined not needed (no test data generation)
- **selector-resilience.md** — Not applicable (no browser selectors)
- **overview.md** — Playwright Utils evaluated; existing fixtures not needed for integration tests

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npx playwright test tests/integration/schema-infrastructure.spec.ts --reporter=list`

**Expected Results:**

```
  34 skipped
```

**Summary:**

- Total tests: 34
- Passing: 0 (expected)
- Failing: 0 (all skipped — red phase)
- Skipped: 34 (intentional — TDD red phase marker)
- Status: RED phase verified

---

## Priority Distribution

| Priority | Count | Coverage |
|---|---|---|
| P0 | 18 | defineBlock, block-base, page, siteSettings core fields, registration, build |
| P1 | 16 | seo, button, portableText, siteSettings secondary fields, schema quality |
| P2 | 0 | — |
| P3 | 0 | — |

---

## Notes

- Story 1-3 is `ready-for-dev` — this is true ATDD (failing tests before implementation)
- Tests use dynamic `import()` inside test bodies — when `test.skip()` is removed, imports execute at runtime
- If imports fail with MODULE_NOT_FOUND, the schema file hasn't been created yet
- The `sanity` package is hoisted to root `node_modules/`, so imports from `'sanity'` resolve correctly in tests
- Block type references in page.blocks[] will show "Unknown type" warnings in Studio until Story 2.1 adds block schemas — this is expected
- `blockBaseFields` is NOT a registered schema type — it's a helper export consumed by `defineBlock`

---

**Generated by BMad TEA Agent** - 2026-02-07
