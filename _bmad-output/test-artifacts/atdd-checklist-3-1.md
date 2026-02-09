# ATDD Checklist - Story 3.1: Sponsor Document Schema & Studio Management

**Date:** 2026-02-08
**Author:** Jay
**Primary Test Level:** Integration (schema validation)

---

## Story Summary

Create and register a sponsor document schema in Sanity Studio so that sponsor information is centrally managed and available for display across the site (e.g. logoCloud block).

**As a** content editor
**I want** to create and manage sponsor profiles with all relevant details in Sanity Studio
**So that** sponsor information is centrally managed and available for display across the site

---

## Acceptance Criteria

1. `sponsor.ts` defines a document schema with 8 fields: name, slug, logo, description, website, industry, tier, featured
2. Validation rules: name required, slug required and unique, logo requires alt text (NFR16)
3. Schema is registered in `studio/src/schemaTypes/index.ts`
4. Content editors can create, edit, and delete sponsor documents in Sanity Studio
5. Content editors can toggle the featured flag for homepage prominence (FR7)
6. Sanity Studio starts without schema errors

---

## Failing Tests Created (RED Phase)

### Integration Tests (11 tests)

**File:** `tests/integration/sponsor-3-1/sponsor-schema.spec.ts` (107 lines)

- **Test:** `[P0] 3.1-INT-001 — sponsor schema has correct name and type document`
  - **Status:** RED - sponsor.ts does not exist yet (import fails)
  - **Verifies:** AC1 — schema name and document type

- **Test:** `[P0] 3.1-INT-002 — sponsor schema has all 8 required fields`
  - **Status:** RED - sponsor.ts does not exist yet
  - **Verifies:** AC1 — all 8 fields present

- **Test:** `[P0] 3.1-INT-003 — name field is required string`
  - **Status:** RED - sponsor.ts does not exist yet
  - **Verifies:** AC1, AC2 — name field type and validation

- **Test:** `[P0] 3.1-INT-004 — slug field is required, type slug, sourced from name`
  - **Status:** RED - sponsor.ts does not exist yet
  - **Verifies:** AC1, AC2 — slug field type, source option, and validation

- **Test:** `[P0] 3.1-INT-005 — logo field is image with hotspot and required alt text`
  - **Status:** RED - sponsor.ts does not exist yet
  - **Verifies:** AC1, AC2, NFR16 — image type, hotspot, alt text field with validation

- **Test:** `[P1] 3.1-INT-006 — description field is text type`
  - **Status:** RED - sponsor.ts does not exist yet
  - **Verifies:** AC1 — description field type

- **Test:** `[P1] 3.1-INT-007 — website field is url type`
  - **Status:** RED - sponsor.ts does not exist yet
  - **Verifies:** AC1 — website field type

- **Test:** `[P1] 3.1-INT-008 — industry field is string type`
  - **Status:** RED - sponsor.ts does not exist yet
  - **Verifies:** AC1 — industry field type

- **Test:** `[P0] 3.1-INT-009 — tier field is string with 4 options`
  - **Status:** RED - sponsor.ts does not exist yet
  - **Verifies:** AC1 — tier field type and options list

- **Test:** `[P0] 3.1-INT-010 — featured field is boolean with initialValue false`
  - **Status:** RED - sponsor.ts does not exist yet
  - **Verifies:** AC1, AC5 — featured field type and default value

- **Test:** `[P0] 3.1-INT-011 — sponsor schema is registered in schemaTypes array`
  - **Status:** RED - sponsor not exported from index.ts
  - **Verifies:** AC3 — schema registration

### E2E Tests (0 tests)

Not applicable — schema validation does not require browser automation.

### API Tests (0 tests)

Not applicable — no API endpoints in this story.

---

## Data Factories Created

None required — schema definitions are deterministic static exports. No test data generation needed.

---

## Fixtures Created

None required — tests use standard `@playwright/test` imports with static schema imports. No setup/teardown needed.

---

## Mock Requirements

None — no external services involved in schema definition testing.

---

## Required data-testid Attributes

None — no UI components in this story's test scope.

---

## Implementation Checklist

### Test: 3.1-INT-001 through 3.1-INT-010 (Schema Structure)

**File:** `tests/integration/sponsor-3-1/sponsor-schema.spec.ts`

**Tasks to make these tests pass:**

- [ ] Create `studio/src/schemaTypes/documents/sponsor.ts`
- [ ] Export `sponsor` using `defineType` with `name: 'sponsor'`, `type: 'document'`
- [ ] Add `name` field: `defineField({ name: 'name', type: 'string', validation: (Rule) => Rule.required() })`
- [ ] Add `slug` field: `defineField({ name: 'slug', type: 'slug', options: { source: 'name' }, validation: (Rule) => Rule.required() })`
- [ ] Add `logo` field: `defineField({ name: 'logo', type: 'image', options: { hotspot: true }, validation: (Rule) => Rule.required() })` with alt text subfield with validation
- [ ] Add `description` field: `defineField({ name: 'description', type: 'text' })`
- [ ] Add `website` field: `defineField({ name: 'website', type: 'url' })`
- [ ] Add `industry` field: `defineField({ name: 'industry', type: 'string' })`
- [ ] Add `tier` field: `defineField({ name: 'tier', type: 'string', options: { list: ['platinum', 'gold', 'silver', 'bronze'] } })`
- [ ] Add `featured` field: `defineField({ name: 'featured', type: 'boolean', initialValue: false })`
- [ ] Remove `test.skip()` from all tests
- [ ] Run test: `npm run test:integration -- tests/integration/sponsor-3-1/`
- [ ] All 10 schema structure tests pass (green phase)

---

### Test: 3.1-INT-011 (Schema Registration)

**File:** `tests/integration/sponsor-3-1/sponsor-schema.spec.ts`

**Tasks to make this test pass:**

- [ ] Import `sponsor` in `studio/src/schemaTypes/index.ts`
- [ ] Add `sponsor` to the `schemaTypes` array
- [ ] Remove `test.skip()` from registration test
- [ ] Run test: `npm run test:integration -- tests/integration/sponsor-3-1/`
- [ ] Registration test passes (green phase)

---

## Running Tests

```bash
# Run all failing tests for this story
npm run test:integration -- tests/integration/sponsor-3-1/

# Run specific test file
npx playwright test tests/integration/sponsor-3-1/sponsor-schema.spec.ts --config=playwright.integration.config.ts

# Run with verbose output
npx playwright test tests/integration/sponsor-3-1/sponsor-schema.spec.ts --config=playwright.integration.config.ts --reporter=list

# Debug specific test
npx playwright test tests/integration/sponsor-3-1/sponsor-schema.spec.ts --config=playwright.integration.config.ts --debug
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- All 11 tests written and marked with `test.skip()`
- Tests assert expected schema behavior
- Implementation checklist created
- No fixtures/factories needed (schema is static)

**Verification:**

- All tests are skipped (will show as skipped in reporter)
- Import will fail until sponsor.ts exists
- Failure is due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. Create `studio/src/schemaTypes/documents/sponsor.ts` with all fields
2. Register schema in `studio/src/schemaTypes/index.ts`
3. Remove `test.skip()` from all 11 tests
4. Run `npm run test:integration -- tests/integration/sponsor-3-1/`
5. Verify all 11 tests pass
6. Verify Studio builds: `cd studio && npx sanity build`
7. Verify root build: `npm run build`
8. Verify existing tests still pass: `npm run test:integration`

**Key Principles:**

- Schema follows existing `page.ts` document pattern
- Use `defineType` and `defineField` from 'sanity'
- All validation functions must be present (not just the fields)
- `initialValue` on featured must be `false` (not undefined)

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

1. Verify all 11 tests pass
2. Verify no regressions in existing 34 integration tests
3. Code quality check on sponsor.ts
4. Ready for code review

---

## Next Steps

1. **Review this checklist** and failing tests
2. **Run tests** to confirm RED phase: `npm run test:integration -- tests/integration/sponsor-3-1/`
3. **Implement** sponsor schema following implementation checklist
4. **Remove `test.skip()`** from all tests
5. **Run tests** to verify GREEN phase
6. **Verify builds** (Studio + Astro)
7. **Run full integration suite** to check for regressions

---

## Knowledge Base References Applied

- **test-quality.md** — Deterministic tests, explicit assertions, isolation
- **test-levels-framework.md** — Integration level selected (schema validation, no UI/API needed)
- **component-tdd.md** — Red-Green-Refactor cycle applied

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Notes

- This story follows the exact same pattern as Story 1-3 document schema tests (`documents.spec.ts`)
- The `sponsor` schema is needed by the homepage `logoCloud` block (Story 2.1) for reference picker functionality
- AC4 (CRUD in Studio) and AC6 (Studio starts) are manual verification tasks, not automatable via schema import tests
- The tier options list uses simple strings `['platinum', 'gold', 'silver', 'bronze']` — if the implementation uses `{title, value}` objects, test 3.1-INT-009 will need adjustment

---

**Generated by BMad TEA Agent** - 2026-02-08
