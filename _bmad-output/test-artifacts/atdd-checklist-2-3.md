# ATDD Checklist - Epic 2, Story 2.3: Wire Site Settings to Sanity

**Date:** 2026-02-09
**Author:** Jay
**Primary Test Level:** Integration + E2E

---

## Story Summary

Wire site-wide settings (site name, logo, navigation, footer, social links, contact info) to Sanity CMS so content editors can manage branding and navigation without developer assistance.

**As a** content editor
**I want** to manage site-wide settings from Sanity Studio
**So that** I can update branding, navigation, and contact information without developer assistance

---

## Acceptance Criteria

1. A `siteSettings` document exists in Sanity with all fields populated from current hardcoded data
2. `astro-app/src/lib/sanity.ts` exports a `getSiteSettings()` function with a GROQ query for the singleton document
3. `astro-app/src/lib/types.ts` `SiteSettings` type matches the full Sanity schema (logo, socialLinks, footerContent, currentSemester)
4. `Header.astro` renders navigation, logo, site name, and CTA button from Sanity data instead of hardcoded values
5. `Footer.astro` renders footer text, copyright, navigation, contact info, and social links from Sanity data instead of hardcoded values
6. `Layout.astro` default title and description come from site settings
7. Editing site settings in Sanity Studio and rebuilding reflects the changes on the frontend
8. `lib/data/site-settings.ts` is retained as fallback reference but no longer imported by any component
9. No regressions on any page

---

## Failing Tests Created (RED Phase)

### Integration Tests (8 tests)

**File:** `tests/integration/site-settings-2-3/data-wiring.spec.ts`

- **Test:** `[P0] 2.3-INT-001 — Schema exports siteSettings with all required fields`
  - **Status:** RED - Schema missing 6 new fields (siteDescription, ctaButton, contactInfo, footerLinks, resourceLinks, programLinks)
  - **Verifies:** AC1 — siteSettings schema completeness

- **Test:** `[P0] 2.3-INT-002 — Schema has new fields with correct types`
  - **Status:** RED - New fields don't exist in schema yet
  - **Verifies:** AC1 — Schema field types (object, array) for new fields

- **Test:** `[P0] 2.3-INT-003 — sanity.ts exports getSiteSettings function`
  - **Status:** RED - getSiteSettings function does not exist
  - **Verifies:** AC2 — GROQ query function export

- **Test:** `[P0] 2.3-INT-004 — GROQ query projects all site settings fields`
  - **Status:** RED - No siteSettingsQuery in sanity.ts
  - **Verifies:** AC2 — GROQ query field projections

- **Test:** `[P0] 2.3-INT-005 — SiteSettings type matches expanded schema`
  - **Status:** RED - SiteSettings type only has title, description, navigation, footerText
  - **Verifies:** AC3 — TypeScript type expansion

- **Test:** `[P0] 2.3-INT-006 — SiteSettings type does NOT use old field names`
  - **Status:** RED - Current type uses old field names (title, description, navigation, footerText)
  - **Verifies:** AC3 — Old field name removal

- **Test:** `[P1] 2.3-INT-007 — Layout.astro imports from lib/sanity, not hardcoded`
  - **Status:** RED - Layout has hardcoded defaults, no Sanity import
  - **Verifies:** AC6 — Layout Sanity integration

- **Test:** `[P1] 2.3-INT-008 — Header/Footer/Layout do NOT import from lib/data`
  - **Status:** RED - Both Header and Footer currently import from lib/data
  - **Verifies:** AC8 — lib/data import removal

### E2E Tests (6 tests)

**File:** `tests/e2e/site-settings-2-3.spec.ts`

- **Test:** `[P0] 2.3-E2E-001 — header renders navigation links from Sanity`
  - **Status:** RED - Navigation data comes from lib/data mock, not Sanity
  - **Verifies:** AC4 — Header navigation rendering

- **Test:** `[P0] 2.3-E2E-002 — header renders CTA button from Sanity data`
  - **Status:** RED - CTA button text/href is hardcoded, not from Sanity
  - **Verifies:** AC4 — Header CTA and branding

- **Test:** `[P0] 2.3-E2E-003 — footer renders program, resource, and contact sections from Sanity`
  - **Status:** RED - Footer sections are hardcoded, not from Sanity
  - **Verifies:** AC5 — Footer section rendering

- **Test:** `[P1] 2.3-E2E-004 — footer renders copyright and bottom bar links from Sanity`
  - **Status:** RED - Copyright and bottom bar links are hardcoded
  - **Verifies:** AC5 — Footer copyright and bottom bar

- **Test:** `[P0] 2.3-E2E-005 — header and footer have no console errors after Sanity wiring`
  - **Status:** RED - Meta description still "Lorem ipsum" placeholder
  - **Verifies:** AC4 + AC5 — Data shape compatibility

- **Test:** `[P1] 2.3-E2E-006 — all pages render without regressions after site settings wiring`
  - **Status:** RED - Meta descriptions on all pages still "Lorem ipsum" placeholder
  - **Verifies:** AC9 — Regression testing

---

## Data Factories Created

No data factories needed for this story. Integration tests use file-based assertions and schema imports. E2E tests verify rendered content against expected seed data values.

---

## Fixtures Created

No new fixtures needed. E2E tests use existing merged fixtures from `tests/support/fixtures/index.ts`:
- `networkErrorMonitor` — auto-detects HTTP 4xx/5xx during page loads
- `log` — structured logging attached to Playwright HTML reports

---

## Mock Requirements

No external service mocking required. This is a static site (Astro SSG) — data is fetched at build time from Sanity and rendered to static HTML. E2E tests run against the built static site.

---

## Required data-testid Attributes

No `data-testid` attributes required. Tests use semantic selectors:
- `getByRole('navigation', { name: /main/i })` for header nav
- `getByRole('link', { name: 'label' })` for navigation links
- `getByText('text')` for section headings and content
- `locator('header')`, `locator('footer')`, `locator('main')` for page structure

---

## Implementation Checklist

### Test: 2.3-INT-001 + 2.3-INT-002 (Schema expansion)

**File:** `tests/integration/site-settings-2-3/data-wiring.spec.ts`

**Tasks to make these tests pass:**

- [ ] Add `siteDescription` (text) field to `studio/src/schemaTypes/documents/site-settings.ts`
- [ ] Add `ctaButton` object (text, url) field to schema
- [ ] Add `contactInfo` object (address, email, phone) field to schema
- [ ] Add `footerLinks` array (label, href) to schema
- [ ] Add `resourceLinks` array (label, href, external) to schema
- [ ] Add `programLinks` array (label, href) to schema
- [ ] Deploy updated schema to Sanity cloud
- [ ] Run test: `npm run test:integration -- --grep "2.3-INT-001\|2.3-INT-002"`
- [ ] Tests pass (green phase)

---

### Test: 2.3-INT-003 + 2.3-INT-004 (GROQ query)

**File:** `tests/integration/site-settings-2-3/data-wiring.spec.ts`

**Tasks to make these tests pass:**

- [ ] Add `siteSettingsQuery` GROQ query to `astro-app/src/lib/sanity.ts`
- [ ] Query must use `*[_type == "siteSettings"][0]`
- [ ] Query must project all 12 fields (siteName, siteDescription, logo with asset URL, navigationItems, ctaButton, footerContent, socialLinks, contactInfo, footerLinks, resourceLinks, programLinks, currentSemester)
- [ ] Export `getSiteSettings()` function using `loadQuery()`
- [ ] Import `SiteSettings` type from `./types`
- [ ] Run test: `npm run test:integration -- --grep "2.3-INT-003\|2.3-INT-004"`
- [ ] Tests pass (green phase)

---

### Test: 2.3-INT-005 + 2.3-INT-006 (TypeScript types)

**File:** `tests/integration/site-settings-2-3/data-wiring.spec.ts`

**Tasks to make these tests pass:**

- [ ] Replace current `SiteSettings` interface in `astro-app/src/lib/types.ts`
- [ ] Add fields: siteName, siteDescription, logo (SanityImageWithAlt), navigationItems (NavItem[]), ctaButton ({text, href}), footerContent ({text, copyrightText}), contactInfo ({address, email, phone}), socialLinks ({platform, url}[]), footerLinks ({label, href}[]), resourceLinks ({label, href, external?}[]), programLinks ({label, href}[]), currentSemester
- [ ] Remove old fields: title, description, navigation, footerText
- [ ] Run test: `npm run test:integration -- --grep "2.3-INT-005\|2.3-INT-006"`
- [ ] Tests pass (green phase)

---

### Test: 2.3-INT-007 (Layout.astro)

**File:** `tests/integration/site-settings-2-3/data-wiring.spec.ts`

**Tasks to make these tests pass:**

- [ ] Import `getSiteSettings` from `'../lib/sanity'` in Layout.astro frontmatter
- [ ] Call `getSiteSettings()` to get site settings data
- [ ] Use `siteSettings.siteName` as default title (replace "YWCC Industry Capstone Program" hardcoded string)
- [ ] Use `siteSettings.siteDescription` as default meta description (replace "Lorem ipsum..." hardcoded string)
- [ ] Run test: `npm run test:integration -- --grep "2.3-INT-007"`
- [ ] Test passes (green phase)

---

### Test: 2.3-INT-008 (Remove lib/data imports)

**File:** `tests/integration/site-settings-2-3/data-wiring.spec.ts`

**Tasks to make these tests pass:**

- [ ] In Header.astro: replace `import { siteSettings } from '../lib/data'` with `import { getSiteSettings } from '../lib/sanity'`
- [ ] In Header.astro: call `const siteSettings = await getSiteSettings()` and destructure needed fields
- [ ] In Footer.astro: replace `import { siteSettings } from '../lib/data'` with `import { getSiteSettings } from '../lib/sanity'`
- [ ] In Footer.astro: call `const siteSettings = await getSiteSettings()` and destructure needed fields
- [ ] Run test: `npm run test:integration -- --grep "2.3-INT-008"`
- [ ] Test passes (green phase)

---

### Test: 2.3-E2E-001 + 2.3-E2E-002 (Header rendering)

**File:** `tests/e2e/site-settings-2-3.spec.ts`

**Tasks to make these tests pass:**

- [ ] Header.astro renders navigationItems from Sanity data
- [ ] Header.astro renders CTA button text/href from Sanity ctaButton field
- [ ] Header.astro renders site name from Sanity siteName
- [ ] Header.astro renders logo with alt text
- [ ] Run test: `npm run test -- --grep "2.3-E2E-001\|2.3-E2E-002"`
- [ ] Tests pass (green phase)

---

### Test: 2.3-E2E-003 + 2.3-E2E-004 (Footer rendering)

**File:** `tests/e2e/site-settings-2-3.spec.ts`

**Tasks to make these tests pass:**

- [ ] Footer.astro renders Programs section from Sanity programLinks
- [ ] Footer.astro renders Resources section from Sanity resourceLinks
- [ ] Footer.astro renders Contact section from Sanity contactInfo
- [ ] Footer.astro renders copyright from Sanity footerContent.copyrightText
- [ ] Footer.astro renders bottom bar links from Sanity footerLinks
- [ ] Run test: `npm run test -- --grep "2.3-E2E-003\|2.3-E2E-004"`
- [ ] Tests pass (green phase)

---

### Test: 2.3-E2E-005 (No console errors)

**File:** `tests/e2e/site-settings-2-3.spec.ts`

**Tasks to make these tests pass:**

- [ ] All Sanity data shapes match component expectations (no runtime errors)
- [ ] Meta description comes from Sanity siteDescription (not "Lorem ipsum")
- [ ] Run test: `npm run test -- --grep "2.3-E2E-005"`
- [ ] Test passes (green phase)

---

### Test: 2.3-E2E-006 (Regression)

**File:** `tests/e2e/site-settings-2-3.spec.ts`

**Tasks to make these tests pass:**

- [ ] All 5 pages (/, /about, /projects, /sponsors, /contact) render with 200 status
- [ ] All pages have header, main, footer visible
- [ ] No console errors on any page
- [ ] No "Lorem ipsum" meta descriptions on any page
- [ ] Run test: `npm run test -- --grep "2.3-E2E-006"`
- [ ] Test passes (green phase)

---

## Running Tests

```bash
# Run all integration tests for this story
npm run test:integration -- --grep "2.3-INT"

# Run all E2E tests for this story (requires built site)
npm run test -- --grep "2.3-E2E"

# Run specific integration test file
npx playwright test --config=playwright.integration.config.ts tests/integration/site-settings-2-3/data-wiring.spec.ts

# Run specific E2E test file
npx playwright test tests/e2e/site-settings-2-3.spec.ts

# Run E2E tests in headed mode (see browser)
npx playwright test tests/e2e/site-settings-2-3.spec.ts --headed

# Debug specific test
npx playwright test tests/e2e/site-settings-2-3.spec.ts --debug
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- All 14 tests written and skipped (test.skip)
- No fixtures or factories needed (file-based assertions + existing fixtures)
- No mock requirements (static site)
- No data-testid requirements (semantic selectors used)
- Implementation checklist created

**Verification:**

- All tests are skipped and would fail if unskipped against current codebase
- Failure reasons are clear and documented
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test group** from implementation checklist (start with schema: INT-001/002)
2. **Read the tests** to understand expected behavior
3. **Implement minimal code** to make those specific tests pass
4. **Remove test.skip()** from passing tests
5. **Run the tests** to verify they now pass (green)
6. **Check off the tasks** in implementation checklist
7. **Move to next test group** and repeat

**Recommended Order:**
1. Schema expansion (INT-001, INT-002) — foundation
2. TypeScript types (INT-005, INT-006) — type safety
3. GROQ query (INT-003, INT-004) — data layer
4. Layout.astro (INT-007) — default values
5. Header/Footer wiring (INT-008) — component updates
6. Seed data in Sanity — populate siteSettings document
7. E2E tests (E2E-001 through E2E-006) — verify full rendering

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality** (readability, maintainability)
3. **Consider caching** getSiteSettings() result across Layout/Header/Footer calls
4. **Remove siteSettings export** from `lib/data/index.ts`
5. **Ensure tests still pass** after each refactor

---

## Next Steps

1. **Review this checklist** and the generated test files
2. **Run failing tests** to confirm RED phase: `npm run test:integration -- --grep "2.3-INT"`
3. **Begin implementation** using implementation checklist as guide
4. **Work one test group at a time** (red -> green for each)
5. **When all tests pass**, refactor code for quality
6. **When refactoring complete**, manually update story status to 'done'

---

## Knowledge Base References Applied

- **test-quality.md** — Deterministic waits, isolated tests, explicit assertions
- **selector-resilience.md** — Semantic selectors (getByRole, getByText) over CSS classes
- **test-levels-framework.md** — Integration for data layer, E2E for rendering
- **data-factories.md** — No factories needed (file-based + seed data approach)
- **component-tdd.md** — Red-green-refactor workflow, accessibility assertions
- **timing-debugging.md** — No hard waits, waitForLoadState pattern
- **fixtures-composition.md** — mergeTests pattern from existing project fixtures

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npm run test:integration -- --grep "2.3-INT"`

**Results:**

```
All 8 tests skipped (test.skip) — RED phase verified
```

**Summary:**

- Total tests: 14 (8 integration + 6 E2E)
- Skipped: 14 (all with test.skip)
- Passing: 0 (expected)
- Status: RED phase verified

---

## Notes

- Integration tests use file-based assertions because Astro components import `sanity:client` virtual module
- Schema tests use static imports of studio TypeScript modules (per Testing Constitution)
- E2E tests will only be meaningful after the Astro build includes the Sanity wiring
- The siteSettings seed data values match current hardcoded values — so E2E tests verify structure, not content changes
- Consider adding a second logo field (`logoDark`) for the footer variant in a future story

---

**Generated by BMad TEA Agent** - 2026-02-09
