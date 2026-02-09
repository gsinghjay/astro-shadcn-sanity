# ATDD Checklist - Epic 2, Story 2.2: Homepage GROQ Queries & Data Fetching

**Date:** 2026-02-09
**Author:** Jay
**Primary Test Level:** E2E + Integration

---

## Story Summary

As a developer,
I want typed GROQ queries that fetch homepage content from Sanity,
So that the homepage renders CMS-driven content instead of placeholder data.

---

## Acceptance Criteria

1. `astro-app/src/lib/sanity.ts` exports a typed GROQ query function for the homepage
2. The homepage query projects base fields (backgroundVariant, spacing, maxWidth) plus type-specific fields for all 6 homepage block types
3. `astro-app/src/pages/index.astro` fetches content from Sanity instead of importing placeholder data
4. `astro-app/src/lib/types.ts` is updated to reflect Sanity query result types for homepage blocks
5. Homepage block components are updated to accept Sanity field names
6. Seed content is created in Sanity Studio for the homepage (minimum 3+ blocks)
7. Homepage renders correctly from Sanity content
8. All GROQ queries are defined in `lib/sanity.ts` — no inline queries in pages or components
9. Other pages continue to work using existing placeholder data (no regressions)

---

## Failing Tests Created (RED Phase)

### Integration Tests (6 tests)

**File:** `tests/integration/homepage-2-2/data-fetching.spec.ts`

- **Test:** `[P0] 2.2-INT-001 — sanity.ts exports a getPage or getPageBySlug function`
  - **Status:** RED - `getPage`/`getPageBySlug` function not yet exported from sanity.ts
  - **Verifies:** AC1 — typed GROQ query function export

- **Test:** `[P0] 2.2-INT-002 — GROQ query includes type-conditional projections for all 6 homepage block types`
  - **Status:** RED - GROQ query does not yet contain block-specific projections
  - **Verifies:** AC2 — query projects type-specific fields

- **Test:** `[P0] 2.2-INT-003 — GROQ query projects base block fields (backgroundVariant, spacing, maxWidth)`
  - **Status:** RED - GROQ query does not yet include base block field projections
  - **Verifies:** AC2 — query projects base fields

- **Test:** `[P0] 2.2-INT-004 — HeroBannerBlock type uses Sanity field names`
  - **Status:** RED - HeroBannerBlock still uses old field names (headline, subheadline, layout, ctaText/ctaUrl)
  - **Verifies:** AC4 — types reflect Sanity schema

- **Test:** `[P0] 2.2-INT-005 — FeatureGrid, CtaBanner, TextWithImage, LogoCloud types use Sanity field names`
  - **Status:** RED - Block types still use old field names (features, body, imageUrl, logos)
  - **Verifies:** AC4 — types reflect Sanity schema

- **Test:** `[P1] 2.2-INT-006 — index.astro imports from lib/sanity and has no inline GROQ queries`
  - **Status:** RED - index.astro still imports from lib/data (placeholder data)
  - **Verifies:** AC8 — no inline GROQ in pages

### E2E Tests (5 tests)

**File:** `tests/e2e/homepage-2-2.spec.ts`

- **Test:** `[P0] 2.2-E2E-001 — homepage renders content from Sanity (not placeholder)`
  - **Status:** RED - homepage still renders placeholder data
  - **Verifies:** AC3, AC7 — Sanity content renders

- **Test:** `[P0] 2.2-E2E-002 — HeroBanner block renders with Sanity field structure`
  - **Status:** RED - HeroBanner uses old field names, not Sanity fields
  - **Verifies:** AC5 — components accept Sanity field names

- **Test:** `[P0] 2.2-E2E-003 — multiple block types render on homepage`
  - **Status:** RED - blocks render from placeholder data, not Sanity
  - **Verifies:** AC5, AC7 — multiple blocks render correctly

- **Test:** `[P0] 2.2-E2E-004 — homepage has no console errors after Sanity migration`
  - **Status:** RED - migration not implemented, field mismatches expected
  - **Verifies:** AC7 — correct rendering from Sanity

- **Test:** `[P0] 2.2-E2E-005 — other pages still render correctly after homepage migration`
  - **Status:** RED - regression test for non-homepage pages
  - **Verifies:** AC9 — no regressions on other pages

---

## Data Factories Created

None required. This story involves data fetching from Sanity CMS (SSG build-time), not runtime API calls. Test data comes from Sanity seed content.

---

## Fixtures Created

No new fixtures required. Tests use existing infrastructure:

- **Integration:** vanilla `@playwright/test` + `node:fs`/`node:path`
- **E2E:** project fixtures from `tests/support/fixtures` (networkErrorMonitor + log)

---

## Mock Requirements

None. This is an SSG site — Sanity GROQ queries execute at build time. No runtime API calls to mock.

---

## Required data-testid Attributes

None required for the current test set. Tests use:

- Semantic HTML elements (`h1`, `h2`, `p`, `section`)
- ARIA roles (`getByRole('link')`)
- Text content matching

**Future consideration:** If block-specific E2E tests expand, add:

### HeroBanner
- `hero-heading` — the main h1 heading
- `hero-cta` — CTA button container

### FeatureGrid
- `feature-grid` — the grid container
- `feature-item` — individual feature card

### StatsRow
- `stats-row` — the stats container
- `stat-item` — individual stat

---

## Implementation Checklist

### Test: 2.2-INT-001 (getPage function export)

**File:** `tests/integration/homepage-2-2/data-fetching.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `getPage(slug: string)` or `getPageBySlug(slug: string)` function in `astro-app/src/lib/sanity.ts`
- [ ] Function should execute GROQ query and return typed page data
- [ ] Export the function from sanity.ts
- [ ] Run test: `npm run test:integration -- --grep "2.2-INT-001"`
- [ ] Test passes (green phase)

---

### Test: 2.2-INT-002 + 003 (GROQ projections)

**File:** `tests/integration/homepage-2-2/data-fetching.spec.ts`

**Tasks to make these tests pass:**

- [ ] Expand `pageBySlugQuery` (or create new query) with type-conditional projections
- [ ] Add `_type == "heroBanner" => { heading, subheading, backgroundImage, ctaButtons, alignment }` projection
- [ ] Add `_type == "featureGrid" => { heading, items, columns }` projection
- [ ] Add `_type == "ctaBanner" => { heading, description, ctaButtons }` projection
- [ ] Add `_type == "statsRow" => { heading, stats }` projection
- [ ] Add `_type == "textWithImage" => { heading, content, image, imagePosition }` projection
- [ ] Add `_type == "logoCloud" => { heading, autoPopulate, sponsors }` projection
- [ ] Include base block fields: `backgroundVariant`, `spacing`, `maxWidth`
- [ ] Run test: `npm run test:integration -- --grep "2.2-INT-00[23]"`
- [ ] Tests pass (green phase)

---

### Test: 2.2-INT-004 + 005 (type alignment)

**File:** `tests/integration/homepage-2-2/data-fetching.spec.ts`

**Tasks to make these tests pass:**

- [ ] Update `HeroBannerBlock`: `headline` → `heading`, `subheadline` → `subheading`, `layout` → `alignment`, `ctaText/ctaUrl` → `ctaButtons[]`, `backgroundImages` → `backgroundImage`
- [ ] Update `FeatureGridBlock`: `headline` → `heading`, `features` → `items`
- [ ] Update `CtaBannerBlock`: `headline` → `heading`, `body` → `description`, `ctaText/ctaUrl` → `ctaButtons[]`
- [ ] Update `TextWithImageBlock`: `headline` → `heading`, `body` → `content`, `imageUrl` → `image`
- [ ] Update `LogoCloudBlock`: add `heading`, `logos` → `sponsors`
- [ ] Add base block fields (`backgroundVariant`, `spacing`, `maxWidth`) to all block types
- [ ] Run test: `npm run test:integration -- --grep "2.2-INT-00[45]"`
- [ ] Tests pass (green phase)

---

### Test: 2.2-INT-006 (no inline GROQ)

**File:** `tests/integration/homepage-2-2/data-fetching.spec.ts`

**Tasks to make this test pass:**

- [ ] Update `index.astro` frontmatter: replace `import { homePage } from '../lib/data'` with import from `../lib/sanity`
- [ ] Call `getPage('/')` or similar in frontmatter to fetch homepage data
- [ ] Remove reference to `homePage` placeholder
- [ ] Run test: `npm run test:integration -- --grep "2.2-INT-006"`
- [ ] Test passes (green phase)

---

### Test: 2.2-E2E-001 (Sanity content renders)

**File:** `tests/e2e/homepage-2-2.spec.ts`

**Tasks to make this test pass:**

- [ ] Complete all integration tasks above (types, queries, wiring)
- [ ] Update HeroBanner.astro to use `heading` instead of `headline`
- [ ] Create Sanity seed content with non-placeholder text
- [ ] Build and verify homepage renders Sanity content
- [ ] Run test: `npx playwright test --grep "2.2-E2E-001"`
- [ ] Test passes (green phase)

---

### Test: 2.2-E2E-002 (HeroBanner field structure)

**File:** `tests/e2e/homepage-2-2.spec.ts`

**Tasks to make this test pass:**

- [ ] Update HeroBanner.astro: `block.headline` → `block.heading`, `block.subheadline` → `block.subheading`
- [ ] Update HeroBanner.astro: render `ctaButtons[]` array instead of individual `ctaText`/`ctaUrl`
- [ ] Update HeroBanner.astro: `block.layout` → `block.alignment`
- [ ] Seed HeroBanner block in Sanity with heading, subheading, and ctaButtons
- [ ] Run test: `npx playwright test --grep "2.2-E2E-002"`
- [ ] Test passes (green phase)

---

### Test: 2.2-E2E-003 (multiple blocks render)

**File:** `tests/e2e/homepage-2-2.spec.ts`

**Tasks to make this test pass:**

- [ ] Update all 6 block components to accept Sanity field names
- [ ] Seed 3+ blocks in Sanity for the homepage
- [ ] Verify blocks render with h2 headings and grid layouts
- [ ] Run test: `npx playwright test --grep "2.2-E2E-003"`
- [ ] Test passes (green phase)

---

### Test: 2.2-E2E-004 (no console errors)

**File:** `tests/e2e/homepage-2-2.spec.ts`

**Tasks to make this test pass:**

- [ ] Ensure all component prop mappings are correct (no undefined field access)
- [ ] Verify no TypeScript type mismatches at build time
- [ ] Run test: `npx playwright test --grep "2.2-E2E-004"`
- [ ] Test passes (green phase)

---

### Test: 2.2-E2E-005 (regression — other pages)

**File:** `tests/e2e/homepage-2-2.spec.ts`

**Tasks to make this test pass:**

- [ ] Ensure about, projects, sponsors, contact pages still import from `lib/data/`
- [ ] Do NOT modify other page files or their data sources
- [ ] Run test: `npx playwright test --grep "2.2-E2E-005"`
- [ ] Test passes (green phase)

---

## Running Tests

```bash
# Run all integration tests for this story
npm run test:integration -- --grep "2.2-INT"

# Run all E2E tests for this story
npx playwright test --grep "2.2-E2E"

# Run specific integration test
npm run test:integration -- --grep "2.2-INT-001"

# Run specific E2E test
npx playwright test --grep "2.2-E2E-001"

# Run E2E tests in headed mode (see browser)
npx playwright test --grep "2.2-E2E" --headed

# Debug specific test
npx playwright test --grep "2.2-E2E-001" --debug

# Run all existing tests to check no regressions
npm run test:integration
npm run test
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- All 11 tests written and marked with `test.skip()` (failing)
- No new fixtures needed (uses existing infrastructure)
- No mock requirements (SSG site — build-time data fetching)
- Implementation checklist created
- Knowledge base consulted

**Verification:**

- All tests are skipped (red phase)
- Test assertions document expected behavior
- Tests will fail when `test.skip()` is removed (feature not implemented)

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Start with types** (Task 1 in story): Update `types.ts` field names
2. **Write GROQ queries** (Task 2): Add projections to `sanity.ts`
3. **Update components** (Task 3): Rename props in each block component
4. **Wire homepage** (Task 4): Replace placeholder import with Sanity fetch
5. **Seed content** (Task 5): Create homepage content in Sanity Studio
6. **Remove `test.skip()`** from integration tests first, verify green
7. **Remove `test.skip()`** from E2E tests, verify green
8. **Run full test suite** to confirm no regressions

**Key Principles:**

- Work inside-out: types → queries → components → page wiring
- Remove `test.skip()` one test at a time
- Run tests after each change (immediate feedback)
- Keep other pages untouched (regression safety)

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

1. Clean up any dead code in `lib/data/home-page.ts`
2. Consider extracting GROQ projection helpers if patterns repeat
3. Verify all tests still pass after refactoring
4. Run `npm run build` to confirm production build succeeds

---

## Next Steps

1. **Review this checklist** with team
2. **Run integration tests** to confirm RED phase: `npm run test:integration -- --grep "2.2-INT"`
3. **Begin implementation** using implementation checklist as guide
4. **Work types → queries → components → wiring** (inside-out)
5. **Remove test.skip()** as each feature area is implemented
6. **When all tests pass**, run full suite and commit

---

## Knowledge Base References Applied

- **test-quality.md** — Deterministic test patterns, explicit assertions, no hard waits
- **test-levels-framework.md** — Integration for module validation, E2E for rendered output
- **selector-resilience.md** — ARIA roles and text content over CSS selectors
- **network-first.md** — Not needed (SSG, no runtime API calls)
- **overview.md** — Playwright Utils integration patterns
- **fixtures-composition.md** — Existing mergeTests fixture patterns reused

---

## Notes

- **SSG Architecture**: This is a static site. Sanity queries execute at build time, not runtime. No network interception needed in E2E tests.
- **sponsorSteps Block**: Has no Sanity schema. The story notes this needs a team decision (hybrid rendering, create schema, or remove). Tests do not cover sponsorSteps.
- **Portable Text**: TextWithImage changes `body` (string) to `content` (portable text). May need `@portabletext/astro` package.
- **Image Handling**: Sanity images use `asset->{_id, url}` pattern. May need `@sanity/image-url` for URL building.

---

**Generated by BMad TEA Agent** - 2026-02-09
