# ATDD Checklist - Epic 2, Story 2.1: Homepage Block Schemas

**Date:** 2026-02-08
**Author:** Jay
**Primary Test Level:** Integration (schema module validation)

---

## Story Summary

Story 2.1 creates 6 homepage block schemas using the defineBlock helper pattern, registers them in the schema index, and verifies Studio compatibility.

**As a** developer
**I want** Sanity schemas created for the 6 homepage blocks using the defineBlock pattern
**So that** content editors can manage homepage block content in Sanity Studio

---

## Acceptance Criteria

1. 6 block schemas created in `studio/src/schemaTypes/blocks/` using `defineBlock`: heroBanner, featureGrid, ctaBanner, statsRow, textWithImage, logoCloud
2. All 6 block schemas registered in `studio/src/schemaTypes/index.ts`
3. All 6 block types already in the page schema's `blocks[]` array (Story 1.3)
4. Sanity Studio starts without schema errors
5. Content editors can add, configure, and preview all 6 block types in Studio

---

## Tests Created (GREEN Phase — retroactive)

### Integration Tests (45 tests)

**File:** `tests/integration/blocks-2-1/block-schemas.spec.ts` (400 lines)

#### AC1: heroBanner (6 tests)

- **[P0] 2.1-INT-001** — heroBanner has correct name and type object
- **[P1] 2.1-INT-002** — heroBanner has all 5 block-specific fields
- **[P0] 2.1-INT-003** — heroBanner heading is required string
- **[P0] 2.1-INT-004** — heroBanner backgroundImage has hotspot and required alt text (NFR16)
- **[P1] 2.1-INT-005** — heroBanner ctaButtons is array of button type
- **[P1] 2.1-INT-006** — heroBanner alignment has options [left, center, right] and initialValue center

#### AC1: featureGrid (6 tests)

- **[P0] 2.1-INT-007** — featureGrid has correct name and type object
- **[P1] 2.1-INT-008** — featureGrid has all 3 block-specific fields
- **[P1] 2.1-INT-009** — featureGrid items is array of objects with icon, image, title, description
- **[P0] 2.1-INT-010** — featureGrid items image has hotspot and required alt text (NFR16)
- **[P1] 2.1-INT-011** — featureGrid items title is required
- **[P1] 2.1-INT-012** — featureGrid columns is number with options [2, 3, 4] and initialValue 3

#### AC1: ctaBanner (5 tests)

- **[P0] 2.1-INT-013** — ctaBanner has correct name and type object
- **[P1] 2.1-INT-014** — ctaBanner has all 3 block-specific fields
- **[P0] 2.1-INT-015** — ctaBanner heading is required string
- **[P1] 2.1-INT-016** — ctaBanner description is text type
- **[P1] 2.1-INT-017** — ctaBanner ctaButtons is array of button type

#### AC1: statsRow (3 tests)

- **[P0] 2.1-INT-018** — statsRow has correct name and type object
- **[P1] 2.1-INT-019** — statsRow has all 2 block-specific fields
- **[P1] 2.1-INT-020** — statsRow stats is array of objects with value (required), label (required), description

#### AC1: textWithImage (5 tests)

- **[P0] 2.1-INT-021** — textWithImage has correct name and type object
- **[P1] 2.1-INT-022** — textWithImage has all 4 block-specific fields
- **[P1] 2.1-INT-023** — textWithImage content is portableText type
- **[P0] 2.1-INT-024** — textWithImage image has hotspot and required alt text (NFR16)
- **[P1] 2.1-INT-025** — textWithImage imagePosition has options [left, right] and initialValue right

#### AC1: logoCloud (5 tests)

- **[P0] 2.1-INT-026** — logoCloud has correct name and type object
- **[P1] 2.1-INT-027** — logoCloud has all 3 block-specific fields
- **[P1] 2.1-INT-028** — logoCloud autoPopulate is boolean with initialValue true
- **[P1] 2.1-INT-029** — logoCloud sponsors is array of references to sponsor
- **[P2] 2.1-INT-030** — logoCloud sponsors has hidden function for conditional visibility

#### AC2: Schema Registration (1 test)

- **[P0] 2.1-INT-031** — all 6 homepage block schemas are registered in schemaTypes

#### AC1: Base Field Inheritance (6 tests)

- **[P0] 2.1-INT-032-{block}** — each block has base fields (backgroundVariant, spacing, maxWidth)

#### AC1: Preview Configuration (8 tests)

- **[P2] 2.1-INT-033-{block}** — each block has preview config selecting heading
- **[P2] 2.1-INT-034** — featureGrid items have preview selecting title
- **[P2] 2.1-INT-035** — statsRow stats have preview selecting label and value

---

## Data Factories Created

None required — schema integration tests validate static module exports with no dynamic data.

---

## Fixtures Created

None required — pure module-import tests with no setup/teardown needs.

---

## Mock Requirements

None — tests import schema modules directly, no external services involved.

---

## Required data-testid Attributes

None — no browser/UI testing for this story.

---

## Implementation Checklist

### Status: Complete (retroactive ATDD)

This story was already implemented before tests were written. All 45 tests pass immediately, serving as regression guards for future schema changes.

**Implementation verified:**

- [x] `studio/src/schemaTypes/blocks/hero-banner.ts` — heroBanner with 5 fields
- [x] `studio/src/schemaTypes/blocks/feature-grid.ts` — featureGrid with 3 fields
- [x] `studio/src/schemaTypes/blocks/cta-banner.ts` — ctaBanner with 3 fields
- [x] `studio/src/schemaTypes/blocks/stats-row.ts` — statsRow with 2 fields
- [x] `studio/src/schemaTypes/blocks/text-with-image.ts` — textWithImage with 4 fields
- [x] `studio/src/schemaTypes/blocks/logo-cloud.ts` — logoCloud with 3 fields
- [x] `studio/src/schemaTypes/index.ts` — all 6 registered
- [x] All tests pass: `npm run test:integration`

---

## Running Tests

```bash
# Run Story 2.1 tests only
npx playwright test --config=playwright.integration.config.ts tests/integration/blocks-2-1/

# Run all integration tests (includes 2.1)
npm run test:integration

# Run with verbose output
npx playwright test --config=playwright.integration.config.ts tests/integration/blocks-2-1/ --reporter=list
```

---

## Red-Green-Refactor Workflow

### RED Phase: N/A (retroactive)

Tests were written after implementation. No RED phase.

### GREEN Phase: Complete

- 45/45 tests pass
- 175/175 full integration suite passes (zero regressions)

### REFACTOR Phase: N/A

No refactoring needed — schemas follow established defineBlock patterns.

---

## Test Execution Evidence

### Test Run (GREEN Phase Verification)

**Command:** `npx playwright test --config=playwright.integration.config.ts tests/integration/blocks-2-1/`

**Results:**

```
Running 45 tests using 1 worker
  45 passed (10.3s)
```

**Full Suite Regression Check:**

```
Running 175 tests using 1 worker
  175 passed (22.9s)
```

**Summary:**

- Story 2.1 tests: 45 passing
- Full suite: 175 passing (zero regressions)
- Status: GREEN

---

## Coverage Summary

| Acceptance Criterion | Tests | Coverage |
|---|---|---|
| AC1: 6 block schemas with correct fields | 36 tests | Full — all fields, types, validation, options, initial values |
| AC2: Registered in schemaTypes | 1 test | Full |
| AC3: In page blocks[] array | — | Covered by Story 1.3 tests (no duplication) |
| AC4: Studio builds without errors | — | Covered by Story 1.3 build test (no duplication) |
| AC5: Editors can configure blocks | — | Manual/E2E scope (out of integration scope) |
| Cross-cutting: Base field inheritance | 6 tests | Full — all 6 blocks checked |
| Cross-cutting: Preview configuration | 8 tests (6 blocks + 2 inline objects) | Full |

**Priority Breakdown:**

- P0: 18 tests (structural foundation, required fields, NFR16 images, registration)
- P1: 19 tests (field completeness, options, initial values, types)
- P2: 8 tests (preview config, conditional visibility)

---

## Knowledge Base References Applied

- **test-quality.md** — deterministic, isolated, explicit assertion patterns
- **test-levels-framework.md** — integration level confirmed (schema module validation)
- **data-factories.md** — reviewed, not applicable (no dynamic test data)

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Notes

- This is retroactive ATDD — schemas were implemented before tests. Tests serve as regression guards.
- AC3 and AC4 are intentionally NOT duplicated (covered by Story 1.3 tests).
- The logoCloud hidden function test (2.1-INT-030) directly invokes the function with mock parent objects to verify conditional visibility logic.
- Test ID format: `2.1-INT-{SEQ}` with parametrized suffixes for cross-cutting tests (e.g., `2.1-INT-032-heroBanner`).

---

**Generated by BMad TEA Agent** - 2026-02-08
