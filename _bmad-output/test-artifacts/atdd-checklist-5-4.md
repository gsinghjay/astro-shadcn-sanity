# ATDD Checklist - Story 5.4: Preview & Publish Architecture

**Date:** 2026-02-09
**Author:** Jay
**Primary Test Level:** Integration (file-read validation)

---

## Story Summary

Complete the content publishing loop by configuring webhook auto-rebuild, fixing SSR cache invalidation, and correcting the deprecated perspective name — enabling editors to preview drafts, publish content, and have the production site automatically rebuild.

**As a** content editor
**I want** a complete end-to-end workflow where I can preview draft changes live in the Presentation tool, publish content, and have the production site automatically rebuild with my changes
**So that** I can manage content confidently without developer assistance and know exactly when changes go live

---

## Acceptance Criteria

1. **AC1** — Sanity GROQ-powered webhook triggers Cloudflare Pages rebuild on publish (infrastructure)
2. **AC2** — Cloudflare Pages deploy hook URL exists for production rebuilds (infrastructure)
3. **AC3** — Webhook filter scoped to content types: `_type in ["page", "siteSettings", "sponsor", "project", "team", "event"]` (infrastructure)
4. **AC4** — Webhook includes a secret for origin verification (infrastructure)
5. **AC5** — `_siteSettingsCache` bypasses cache in SSR mode (code change)
6. **AC6** — CSP includes `wss://*.sanity.io` in `connect-src` for Visual Editing WebSocket (verification)
7. **AC7** — `loadQuery` uses `"drafts"` perspective instead of deprecated `"previewDrafts"` (code change)
8. **AC8** — End-to-end loop works: edit → preview → publish → webhook → rebuild (manual verification)
9. **AC9** — `npm run build` succeeds for both static and SSR configurations (build verification)

---

## Failing Tests Created (RED Phase)

### Integration Tests (16 tests)

**File:** `tests/integration/preview-publish-5-4/preview-publish.spec.ts` (118 lines)

- **Test:** `[P0] 5.4-INT-001 — loadQuery uses "drafts" perspective, not deprecated "previewDrafts"`
  - **Status:** RED — `sanity.ts` line 29 still contains `"previewDrafts"`
  - **Verifies:** AC7 — perspective deprecation fix

- **Test:** `[P0] 5.4-INT-002 — perspective is conditional on visualEditingEnabled`
  - **Status:** RED — regex expects `"drafts"` but code has `"previewDrafts"`
  - **Verifies:** AC7 — conditional perspective

- **Test:** `[P0] 5.4-INT-003 — perspective includes "published" for production`
  - **Status:** GREEN (verification) — already uses `"published"`
  - **Verifies:** AC7 — production perspective

- **Test:** `[P0] 5.4-INT-004 — getSiteSettings bypasses cache when visualEditingEnabled is true`
  - **Status:** RED — cache check has no `!visualEditingEnabled` guard
  - **Verifies:** AC5 — SSR cache invalidation

- **Test:** `[P0] 5.4-INT-005 — getSiteSettings does NOT unconditionally return cache`
  - **Status:** RED — current code has unconditional `if (_siteSettingsCache) return _siteSettingsCache`
  - **Verifies:** AC5 — SSR cache bug detection

- **Test:** `[P0] 5.4-INT-006 — module-level _siteSettingsCache variable exists`
  - **Status:** GREEN (verification) — variable already exists
  - **Verifies:** AC5 — cache infrastructure present

- **Test:** `[P0] 5.4-INT-007 — CSP connect-src includes wss://*.sanity.io for WebSocket`
  - **Status:** GREEN (verification) — already in CSP
  - **Verifies:** AC6 — WebSocket CSP

- **Test:** `[P0] 5.4-INT-008 — CSP connect-src includes https://*.sanity.io`
  - **Status:** GREEN (verification) — already in CSP
  - **Verifies:** AC6 — HTTPS CSP

- **Test:** `[P0] 5.4-INT-009 — Layout renders VisualEditing component`
  - **Status:** GREEN (verification) — component present
  - **Verifies:** AC6 — Visual Editing component

- **Test:** `[P0] 5.4-INT-010 — Layout imports VisualEditing from @sanity/astro`
  - **Status:** GREEN (verification) — import present
  - **Verifies:** AC6 — correct import

- **Test:** `[P0] 5.4-INT-011 — _headers file exists`
  - **Status:** GREEN (verification) — file exists
  - **Verifies:** AC6 — headers file

- **Test:** `[P0] 5.4-INT-012 — _headers sets frame-ancestors for Sanity Studio embedding`
  - **Status:** GREEN (verification) — frame-ancestors present
  - **Verifies:** AC6 — iframe embedding

- **Test:** `[P1] 5.4-INT-013 — loadQuery uses token only when visualEditingEnabled`
  - **Status:** GREEN (verification) — conditional token present
  - **Verifies:** Security — token not leaked to production

- **Test:** `[P1] 5.4-INT-014 — loadQuery enables stega only when visualEditingEnabled`
  - **Status:** GREEN (verification) — conditional stega present
  - **Verifies:** Security — stega only in preview

- **Test:** `[P1] 5.4-INT-015 — visualEditingEnabled reads from PUBLIC_SANITY_VISUAL_EDITING_ENABLED`
  - **Status:** GREEN (verification) — env var present
  - **Verifies:** Configuration — env var wiring

- **Test:** `[P1] 5.4-INT-016 — loadQuery throws if token missing during visual editing`
  - **Status:** GREEN (verification) — error thrown
  - **Verifies:** Safety — fail loudly on misconfiguration

### E2E Tests (0 tests)

No E2E tests generated — AC8 (end-to-end loop verification) requires live infrastructure (Sanity Studio + deployed preview site + webhook). This is a manual verification task.

### API Tests (0 tests)

No API tests — this story has no API endpoints.

---

## Data Factories Created

None required — integration tests read source files directly, no test data generation needed.

---

## Fixtures Created

None additional — tests use base `@playwright/test` imports (same pattern as `deploy-5-2`). Existing merged fixtures (`networkErrorMonitor`, `log`) are for E2E tests only.

---

## Mock Requirements

None — integration tests perform static file analysis, no external services involved.

---

## Required data-testid Attributes

None — no UI elements are being tested at the E2E level.

---

## Implementation Checklist

### Test: 5.4-INT-001 + 5.4-INT-002 — Perspective deprecation fix

**File:** `astro-app/src/lib/sanity.ts`

**Tasks to make these tests pass:**

- [ ] Change `"previewDrafts"` to `"drafts"` on the perspective assignment line (~line 29)
- [ ] Verify the full line reads: `const perspective = visualEditingEnabled ? "drafts" : "published";`
- [ ] Run test: `npx playwright test --config=playwright.integration.config.ts tests/integration/preview-publish-5-4/ --grep "INT-001|INT-002"`
- [ ] Verify no deprecation warnings in build output
- [ ] Tests pass (green phase)

---

### Test: 5.4-INT-004 + 5.4-INT-005 — SSR cache invalidation

**File:** `astro-app/src/lib/sanity.ts`

**Tasks to make these tests pass:**

- [ ] Change `if (_siteSettingsCache) return _siteSettingsCache;` to `if (!visualEditingEnabled && _siteSettingsCache) return _siteSettingsCache;` (~line 69)
- [ ] This ensures SSR preview always fetches fresh data while static builds retain memoization
- [ ] Run test: `npx playwright test --config=playwright.integration.config.ts tests/integration/preview-publish-5-4/ --grep "INT-004|INT-005"`
- [ ] Tests pass (green phase)

---

### Infrastructure Tasks (not code-testable)

- [ ] **AC1-AC4:** Configure Cloudflare Pages deploy hook and Sanity webhook (see story Tasks 1-2)
- [ ] **AC8:** Manual end-to-end verification: edit → preview → publish → webhook → rebuild → production updated
- [ ] **AC9:** Run `npm run build --workspace=astro-app` for both static and SSR configs

---

## Running Tests

```bash
# Run all failing tests for this story
npx playwright test --config=playwright.integration.config.ts tests/integration/preview-publish-5-4/

# Run specific RED tests only (AC5 + AC7 — the ones that need code changes)
npx playwright test --config=playwright.integration.config.ts tests/integration/preview-publish-5-4/ --grep "INT-001|INT-002|INT-004|INT-005"

# Run all verification tests (should already pass)
npx playwright test --config=playwright.integration.config.ts tests/integration/preview-publish-5-4/ --grep "INT-003|INT-006|INT-007|INT-008|INT-009|INT-010|INT-011|INT-012|INT-013|INT-014|INT-015|INT-016"

# Run in verbose mode
npx playwright test --config=playwright.integration.config.ts tests/integration/preview-publish-5-4/ --reporter=list
```

---

## Red-Green-Refactor Workflow

### RED Phase (Current)

**TEA Agent Responsibilities:**

- All 16 tests written
- 4 tests failing (RED) — AC5 cache bypass + AC7 perspective rename
- 12 tests passing (GREEN) — verification of existing CSP, Visual Editing, and security guards
- Implementation checklist created mapping failing tests to code tasks

**Verification:**

- 4 tests fail due to missing code changes (not test bugs)
- Failure messages clearly indicate what's wrong:
  - INT-001: `Expected string not to contain "previewDrafts"` → code still has deprecated perspective
  - INT-002: `Expected string to match pattern` → perspective doesn't match `"drafts"`
  - INT-004: `Expected string to match pattern` → cache check lacks `!visualEditingEnabled` guard
  - INT-005: `Expected string not to match pattern` → unconditional cache return still present

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. Open `astro-app/src/lib/sanity.ts`
2. **Fix 1 (AC7):** Change `"previewDrafts"` → `"drafts"` on line 29
3. Run INT-001 + INT-002 → verify PASS
4. **Fix 2 (AC5):** Add `!visualEditingEnabled &&` guard to cache check on line 69
5. Run INT-004 + INT-005 → verify PASS
6. Run full suite → all 16 tests pass
7. Configure webhook + deploy hook (infrastructure tasks)
8. Manual E2E verification (AC8)

**Key Principles:**

- Two surgical code changes — total diff is ~10 characters
- Both changes are in the same file (`sanity.ts`)
- No new dependencies, no new files, no schema changes

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

No refactoring needed — the changes are minimal (2 line edits in 1 file). Code quality is already good.

---

## Next Steps

1. **Run failing tests** to confirm RED phase: `npx playwright test --config=playwright.integration.config.ts tests/integration/preview-publish-5-4/ --grep "INT-001|INT-002|INT-004|INT-005"`
2. **Implement the 2 code fixes** in `astro-app/src/lib/sanity.ts`
3. **Run full suite** to verify all 16 tests pass
4. **Configure infrastructure** (Cloudflare deploy hook + Sanity webhook)
5. **Manual E2E verification** (edit → preview → publish → rebuild)
6. **When complete**, update story status to 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **test-quality.md** — Deterministic assertions, no hard waits, unique data, parallel-safe
- **test-healing-patterns.md** — Failure pattern catalog for future debugging
- **selector-resilience.md** — Selector hierarchy (not applicable — no E2E tests)
- **timing-debugging.md** — Network-first patterns (not applicable — file-read tests)
- **test-levels-framework.md** — Integration level selection for file/config validation
- **fixtures-composition.md** — mergeTests pattern (existing fixtures preserved)
- **playwright-cli.md** — CLI automation (not needed — no browser verification required)

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npx playwright test --config=playwright.integration.config.ts tests/integration/preview-publish-5-4/`

**Expected Results:**

```
  ✓ [P0] 5.4-INT-003 — perspective includes "published" for production
  ✗ [P0] 5.4-INT-001 — loadQuery uses "drafts" perspective, not deprecated "previewDrafts"
  ✗ [P0] 5.4-INT-002 — perspective is conditional on visualEditingEnabled
  ✗ [P0] 5.4-INT-004 — getSiteSettings bypasses cache when visualEditingEnabled is true
  ✗ [P0] 5.4-INT-005 — getSiteSettings does NOT unconditionally return cache
  ✓ [P0] 5.4-INT-006 — module-level _siteSettingsCache variable exists
  ✓ [P0] 5.4-INT-007 — CSP connect-src includes wss://*.sanity.io for WebSocket
  ✓ [P0] 5.4-INT-008 — CSP connect-src includes https://*.sanity.io
  ✓ [P0] 5.4-INT-009 — Layout renders VisualEditing component
  ✓ [P0] 5.4-INT-010 — Layout imports VisualEditing from @sanity/astro
  ✓ [P0] 5.4-INT-011 — _headers file exists
  ✓ [P0] 5.4-INT-012 — _headers sets frame-ancestors for Sanity Studio embedding
  ✓ [P1] 5.4-INT-013 — loadQuery uses token only when visualEditingEnabled
  ✓ [P1] 5.4-INT-014 — loadQuery enables stega only when visualEditingEnabled
  ✓ [P1] 5.4-INT-015 — visualEditingEnabled reads from PUBLIC_SANITY_VISUAL_EDITING_ENABLED
  ✓ [P1] 5.4-INT-016 — loadQuery throws if token missing during visual editing
```

**Summary:**

- Total tests: 16
- Passing: 12 (verification — already implemented)
- Failing: 4 (RED — code changes needed for AC5 + AC7)
- Status: RED phase verified

---

## Notes

- This story is primarily infrastructure configuration (webhook + deploy hook) with 2 surgical code fixes
- The 4 RED tests target exactly the 2 lines that need changing in `sanity.ts`
- AC1-AC4 (webhook/deploy hook) are configured in Sanity/Cloudflare dashboards — not testable in code
- AC8 (end-to-end loop) requires live infrastructure — manual verification only
- AC9 (build succeeds) is covered by existing CI pipeline and Playwright webServer config
- The 12 GREEN verification tests serve as regression guards for existing Visual Editing setup

---

**Generated by BMad TEA Agent** - 2026-02-09
