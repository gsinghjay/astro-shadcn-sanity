# Test Quality Review: Full Suite

**Quality Score**: 78/100 (C - Acceptable)
**Review Date**: 2026-02-07
**Review Scope**: Suite (5 test files, 78 tests)
**Reviewer**: TEA Agent (Murat)

---

Note: This review audits existing tests; it does not generate tests.

## Executive Summary

**Overall Assessment**: Acceptable

**Recommendation**: Approve with Comments

### Key Strengths

- Excellent test organization with clear story-to-test mapping (1.2, 1.3, 1.4)
- Proper use of test IDs and priority markers (P0/P1) across 4 of 5 test files
- Good fixture architecture using `mergeTests` with `playwright-utils` (networkErrorMonitor, log)
- Strong isolation — no shared mutable state, `fullyParallel: true` for E2E
- Comprehensive schema validation with 34 integration tests covering 10 ACs

### Key Weaknesses

- Two test files exceed 300-line threshold (441 and 373 lines)
- `smoke.spec.ts` lacks test IDs and priority markers
- `waitForLoadState('networkidle')` used in E2E tests (flakiness risk)
- No error/edge case testing (404 pages, broken resources, validation enforcement)
- Duplicated constants across test files (BLOCK_NAMES, BLOCK_TYPES, timeouts)

### Summary

The test suite demonstrates solid foundational quality with well-structured acceptance criteria mapping and appropriate test level selection (E2E for user journeys, integration for schema/module validation). The main drag on the score is maintainability — two oversized test files and missing test IDs on the smoke tests. The suite is production-ready for its current scope but would benefit from splitting large files and adding error state coverage before the next story increment.

---

## Quality Criteria Assessment

| Criterion                            | Status   | Violations | Notes |
| ------------------------------------ | -------- | ---------- | ----- |
| Test IDs                             | ⚠️ WARN  | 5          | smoke.spec.ts missing all IDs |
| Priority Markers (P0/P1/P2/P3)      | ⚠️ WARN  | 5          | smoke.spec.ts missing all priorities |
| Hard Waits (sleep, waitForTimeout)   | ✅ PASS  | 0          | No hard waits found |
| networkidle Usage                    | ⚠️ WARN  | 2          | smoke.spec.ts:62, pages-1-2.spec.ts:85 |
| Determinism (no conditionals)        | ✅ PASS  | 0          | Clean — no random/time dependencies |
| Isolation (cleanup, no shared state) | ✅ PASS  | 0          | No mutable shared state |
| Fixture Patterns                     | ✅ PASS  | 0          | mergeTests pattern used correctly |
| Data Factories                       | ✅ PASS  | 0          | N/A — SSG project, no API data |
| Network-First Pattern                | ✅ PASS  | 0          | N/A — no network interception needed |
| Explicit Assertions                  | ✅ PASS  | 0          | All assertions visible in test bodies |
| Test Length (<=300 lines)            | ❌ FAIL  | 2          | 441 lines, 373 lines |
| Test Duration (<=1.5 min)            | ⚠️ WARN  | 2          | Build verification tests ~60-120s each |
| Flakiness Patterns                   | ⚠️ WARN  | 2          | networkidle usage |

**Total Violations**: 2 Critical (file size), 17 High/Medium, 11 Low

---

## Quality Score Breakdown

```
Starting Score:          100

Dimension Scores (Weighted):
  Determinism (25%):     80/100  -> 20.00
  Isolation (25%):       85/100  -> 21.25
  Maintainability (20%): 63/100  -> 12.60
  Coverage (15%):        75/100  -> 11.25
  Performance (15%):     84/100  -> 12.60
                         --------
Final Score:             78/100
Grade:                   C (Acceptable)
```

---

## Critical Issues (Must Fix)

### 1. schema-infrastructure.spec.ts exceeds 300-line threshold (441 lines)

**Severity**: P1 (High)
**Location**: `tests/integration/schema-infrastructure.spec.ts:1-441`
**Criterion**: Test Length
**Knowledge Base**: [test-quality.md](../../../_bmad/tea/testarch/knowledge/test-quality.md)

**Issue Description**:
File is 141 lines over the 300-line maintainability threshold. Contains 10 acceptance criteria groups (AC1-AC10) and 34 tests in a single file, making it difficult to navigate and maintain.

**Recommended Fix**:
Split into 3 focused files:

```
tests/integration/schema-1-3/
  helpers-objects.spec.ts     # AC1-5: defineBlock, blockBase, seo, button, portableText
  documents.spec.ts           # AC6-7: page, siteSettings
  registration-build.spec.ts  # AC8-10: schemaTypes, studio build
```

**Why This Matters**:
Large files increase cognitive load, slow down code reviews, and make it harder to identify which tests are failing at a glance. Splitting by AC group preserves the logical structure while improving navigability.

---

### 2. migration-1-2.spec.ts exceeds 300-line threshold (373 lines)

**Severity**: P1 (High)
**Location**: `tests/integration/migration-1-2.spec.ts:1-373`
**Criterion**: Test Length
**Knowledge Base**: [test-quality.md](../../../_bmad/tea/testarch/knowledge/test-quality.md)

**Issue Description**:
File is 73 lines over the 300-line threshold. Contains 6 AC groups with 13 tests, a recursive directory scanner, and large constant arrays.

**Recommended Fix**:
Split into 2-3 focused files and extract shared constants:

```
tests/integration/migration-1-2/
  block-components.spec.ts    # AC1: component files, BlockRenderer
  types-data.spec.ts          # AC7-8: types, data files
  architecture.spec.ts        # Anti-patterns, layout, icons
tests/support/constants.ts    # Shared BLOCK_NAMES, BLOCK_TYPES, etc.
```

**Why This Matters**:
The recursive `scanDir` function and 3 large constant arrays bloat the file. Extracting constants to a shared module also eliminates duplication with `storybook-1-4.spec.ts`.

---

## Recommendations (Should Fix)

### 1. Add test IDs and priorities to smoke.spec.ts

**Severity**: P2 (Medium)
**Location**: `tests/e2e/smoke.spec.ts:4-76`
**Criterion**: Test IDs, Priority Markers
**Knowledge Base**: [test-priorities-matrix.md](../../../_bmad/tea/testarch/knowledge/test-priorities-matrix.md)

**Current Code**:

```typescript
// ⚠️ Missing test IDs and priorities
test('should load the homepage', async ({ page }) => {
```

**Recommended Improvement**:

```typescript
// ✅ With test IDs and priorities
test('[P0] 0.0-E2E-001 — should load the homepage', async ({ page }) => {
```

**Benefits**:
Enables selective test execution (`--grep @p0`), traceability mapping, and consistent reporting across the suite.

---

### 2. Replace waitForLoadState('networkidle')

**Severity**: P2 (Medium)
**Location**: `tests/e2e/smoke.spec.ts:62`, `tests/e2e/pages-1-2.spec.ts:85`
**Criterion**: Flakiness Patterns
**Knowledge Base**: [timing-debugging.md](../../../_bmad/tea/testarch/knowledge/timing-debugging.md)

**Current Code**:

```typescript
// ⚠️ Unreliable in SPAs — WebSocket/analytics prevent idle
await page.waitForLoadState('networkidle')
```

**Recommended Improvement**:

```typescript
// ✅ Wait for content instead
await page.waitForLoadState('domcontentloaded')
```

**Benefits**:
Eliminates ~2s overhead per test and prevents flakiness from WebSocket connections or analytics scripts that keep the network active.

---

### 3. Add error state E2E tests

**Severity**: P2 (Medium)
**Location**: `tests/e2e/` (new tests needed)
**Criterion**: Coverage
**Knowledge Base**: [test-levels-framework.md](../../../_bmad/tea/testarch/knowledge/test-levels-framework.md)

**Issue Description**:
No tests verify 404 page handling, broken resource behavior, or navigation to non-existent pages.

**Recommended Improvement**:

```typescript
test('[P1] 0.0-E2E-006 — 404 page renders for invalid routes', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist')
  expect(response!.status()).toBe(404)
  await expect(page.getByText(/not found/i)).toBeVisible()
})
```

---

### 4. Eliminate excessive `as any` type casts

**Severity**: P2 (Medium)
**Location**: `tests/integration/schema-infrastructure.spec.ts` (throughout)
**Criterion**: Maintainability

**Current Code**:

```typescript
// ⚠️ Loses type safety, hard to maintain
const fieldNames = (result as any).fields.map((f: any) => f.name)
```

**Recommended Improvement**:

```typescript
// ✅ Define interface for schema objects
interface SanitySchemaType {
  name: string
  type: string
  fields?: Array<{ name: string; type: string; validation?: unknown; options?: Record<string, unknown> }>
}

const fieldNames = (result as SanitySchemaType).fields!.map(f => f.name)
```

---

### 5. Extract shared constants

**Severity**: P3 (Low)
**Location**: `tests/integration/migration-1-2.spec.ts:24-67`, `tests/integration/storybook-1-4.spec.ts:16-29`
**Criterion**: Maintainability (DRY)

**Issue Description**:
`BLOCK_NAMES`, `BLOCK_TYPES`, `BLOCK_TYPE_INTERFACES`, and `BUILD_TIMEOUT_MS` are duplicated across files.

**Recommended Improvement**:

```typescript
// tests/support/constants.ts
export const BLOCK_NAMES = ['HeroBanner', 'FeatureGrid', ...] as const
export const BLOCK_TYPES = ['heroBanner', 'featureGrid', ...] as const
export const BUILD_TIMEOUT_MS = 120_000
```

---

### 6. Add build artifact cleanup

**Severity**: P3 (Low)
**Location**: `tests/integration/schema-infrastructure.spec.ts:424`, `tests/integration/storybook-1-4.spec.ts:224`
**Criterion**: Isolation

**Issue Description**:
Build verification tests create artifacts (studio/dist, astro-app/storybook-static) that persist across runs.

**Recommended Improvement**:

```typescript
test.afterAll(async () => {
  // Clean up build artifacts
  fs.rmSync(path.join(STUDIO_ROOT, 'dist'), { recursive: true, force: true })
})
```

---

## Best Practices Found

### 1. Excellent mergeTests Fixture Composition

**Location**: `tests/support/fixtures/index.ts:1-19`
**Pattern**: Fixture Composition
**Knowledge Base**: [fixtures-composition.md](../../../_bmad/tea/testarch/knowledge/fixtures-composition.md)

**Why This Is Good**:
Single `fixtures/index.ts` with `mergeTests(networkErrorMonitorFixture, logFixture)` — exactly the recommended pattern. Clear comments explain what's included and why other fixtures are excluded. Future-proof with guidance on when to add more.

```typescript
// ✅ Excellent — single merged fixture file with clear rationale
export const test = mergeTests(networkErrorMonitorFixture, logFixture)
```

### 2. Clean Accessibility Helper

**Location**: `tests/support/helpers/a11y.ts:1-26`
**Pattern**: Reusable Helper
**Knowledge Base**: [test-quality.md](../../../_bmad/tea/testarch/knowledge/test-quality.md)

**Why This Is Good**:
Pure function that wraps `@axe-core/playwright` with WCAG 2.1 AA configuration. Assertions stay visible (`expect(violations)...toHaveLength(0)`) rather than being hidden. Configurable via `disableRules` option.

### 3. Test ID Convention Consistently Applied

**Location**: `tests/e2e/pages-1-2.spec.ts`, `tests/integration/schema-infrastructure.spec.ts`, `tests/integration/migration-1-2.spec.ts`, `tests/integration/storybook-1-4.spec.ts`
**Pattern**: Test Identification
**Knowledge Base**: [test-priorities-matrix.md](../../../_bmad/tea/testarch/knowledge/test-priorities-matrix.md)

**Why This Is Good**:
Format `[P0] 1.3-INT-001 — description` enables grep-based filtering, priority-based execution ordering, and requirements traceability. Applied consistently across 73 of 78 tests.

### 4. Appropriate Test Level Selection

**Location**: All test files
**Pattern**: Test Levels Framework
**Knowledge Base**: [test-levels-framework.md](../../../_bmad/tea/testarch/knowledge/test-levels-framework.md)

**Why This Is Good**:
Schema validation at integration level (no browser needed), page rendering at E2E level (browser required). Two separate Playwright configs enforce the boundary. This avoids the common anti-pattern of E2E testing business logic.

---

## Test File Analysis

### File Metadata

| File | Path | Lines | Tests | IDs | Priorities | Framework |
|------|------|-------|-------|-----|------------|-----------|
| smoke.spec.ts | `tests/e2e/smoke.spec.ts` | 77 | 5 | None | None | Playwright |
| pages-1-2.spec.ts | `tests/e2e/pages-1-2.spec.ts` | 105 | 15 | 1.2-E2E-001-004 | P0, P1 | Playwright |
| schema-infrastructure.spec.ts | `tests/integration/schema-infrastructure.spec.ts` | 441 | 34 | 1.3-INT-001-034 | P0, P1 | Playwright |
| migration-1-2.spec.ts | `tests/integration/migration-1-2.spec.ts` | 373 | 13 | 1.2-INT-001-013 | P0, P1 | Playwright |
| storybook-1-4.spec.ts | `tests/integration/storybook-1-4.spec.ts` | 249 | 11 | 1.4-INT-001-011 | P0, P1 | Playwright |

### Test Structure

- **Describe Blocks**: 35 total
- **Test Cases**: 78 total
- **Average Test Length**: ~15 lines per test
- **Fixtures Used**: 2 (networkErrorMonitor, log via mergeTests)
- **Data Factories Used**: 0 (N/A — SSG project)

### Priority Distribution

- P0 (Critical): 27 tests
- P1 (High): 46 tests
- P2 (Medium): 0 tests
- P3 (Low): 0 tests
- Unknown (no priority): 5 tests (smoke.spec.ts)

---

## Context and Integration

### Related Artifacts

- **Story 1-2**: [1-2-migrate-reference-project.md](_bmad-output/implementation-artifacts/1-2-migrate-reference-project.md)
- **Story 1-3**: [1-3-schema-infrastructure.md](_bmad-output/implementation-artifacts/1-3-schema-infrastructure.md)
- **Story 1-4**: [1-4-storybook-setup.md](_bmad-output/implementation-artifacts/1-4-storybook-setup.md)
- **ATDD Checklist**: [atdd-checklist-1-3.md](_bmad-output/test-artifacts/atdd-checklist-1-3.md)
- **Test Framework**: [test-framework-doc.md](_bmad-output/test-artifacts/test-framework-doc.md)

---

## Knowledge Base References

This review consulted the following knowledge base fragments:

**Core:**
- **[test-quality.md](../../_bmad/tea/testarch/knowledge/test-quality.md)** — Definition of Done (no hard waits, <300 lines, <1.5 min, self-cleaning)
- **[data-factories.md](../../_bmad/tea/testarch/knowledge/data-factories.md)** — Factory patterns
- **[test-levels-framework.md](../../_bmad/tea/testarch/knowledge/test-levels-framework.md)** — E2E vs Integration level selection
- **[selective-testing.md](../../_bmad/tea/testarch/knowledge/selective-testing.md)** — Tag/grep filtering, priority execution
- **[test-healing-patterns.md](../../_bmad/tea/testarch/knowledge/test-healing-patterns.md)** — Failure pattern catalog
- **[selector-resilience.md](../../_bmad/tea/testarch/knowledge/selector-resilience.md)** — Selector hierarchy
- **[timing-debugging.md](../../_bmad/tea/testarch/knowledge/timing-debugging.md)** — networkidle anti-pattern

**Playwright Utils:**
- **[overview.md](../../_bmad/tea/testarch/knowledge/overview.md)** — mergeTests, fixture composition
- **[fixtures-composition.md](../../_bmad/tea/testarch/knowledge/fixtures-composition.md)** — Single merged fixture file pattern
- **[network-error-monitor.md](../../_bmad/tea/testarch/knowledge/network-error-monitor.md)** — Auto HTTP error detection

**CLI:**
- **[playwright-cli.md](../../_bmad/tea/testarch/knowledge/playwright-cli.md)** — Selector verification, evidence collection

See [tea-index.csv](../../_bmad/tea/testarch/tea-index.csv) for complete knowledge base.

---

## Next Steps

### Immediate Actions (Before Next Story)

1. **Split oversized test files** — schema-infrastructure (441 lines) and migration-1-2 (373 lines)
   - Priority: P1
   - Estimated Effort: ~30 min

2. **Add test IDs and priorities to smoke.spec.ts** — 5 tests missing IDs
   - Priority: P2
   - Estimated Effort: ~10 min

3. **Replace networkidle with domcontentloaded** — 2 occurrences in E2E tests
   - Priority: P2
   - Estimated Effort: ~5 min

### Follow-up Actions (Future Stories)

1. **Create shared constants module** — `tests/support/constants.ts`
   - Priority: P3
   - Target: Next integration test addition

2. **Add error state E2E tests** — 404 pages, broken resources
   - Priority: P2
   - Target: Story 2.x (when adding more pages/features)

3. **Define schema type interfaces** — Replace `as any` casts
   - Priority: P3
   - Target: Backlog

### Re-Review Needed?

⚠️ No re-review needed for current scope — approve with comments. Re-review recommended after file splitting to verify test counts and naming remain consistent.

---

## Decision

**Recommendation**: Approve with Comments

**Rationale**:

Test quality is acceptable with 78/100 score. The suite demonstrates strong fundamentals — correct test level selection, good fixture architecture, consistent test ID conventions, and comprehensive AC mapping. The two critical findings (file size violations) are structural issues that don't affect test reliability or correctness, only maintainability. The `networkidle` usage is a known flakiness risk but manageable for an SSG site.

> Test quality is acceptable with 78/100 score. High-priority recommendations (file splitting, test IDs for smoke tests) should be addressed in the near term but don't block current development. Critical issues are structural, not correctness-related. Tests are production-ready for Stories 1.1-1.4 scope.

---

## Appendix

### Violation Summary by Location

| File | Severity | Criterion | Issue | Fix |
| ---- | -------- | --------- | ----- | --- |
| schema-infrastructure.spec.ts:1 | P1 | Test Length | 441 lines (>300) | Split into 3 files |
| migration-1-2.spec.ts:1 | P1 | Test Length | 373 lines (>300) | Split into 2-3 files |
| smoke.spec.ts:4-76 | P2 | Test IDs | No test IDs | Add [P0] X.X-E2E-NNN format |
| smoke.spec.ts:4-76 | P2 | Priority | No priorities | Add [P0]/[P1] markers |
| smoke.spec.ts:62 | P2 | Flakiness | networkidle | Use domcontentloaded |
| pages-1-2.spec.ts:85 | P2 | Flakiness | networkidle | Use domcontentloaded |
| schema-infrastructure.spec.ts:49+ | P2 | Maintainability | Excessive `as any` | Define typed interfaces |
| migration-1-2.spec.ts:24-67 | P2 | Maintainability | Duplicate constants | Extract to shared module |
| storybook-1-4.spec.ts:16-29 | P2 | Maintainability | Duplicate constants | Extract to shared module |
| migration-1-2.spec.ts:283 | P2 | Maintainability | Complex scanDir | Extract to helper |
| schema-infrastructure.spec.ts:428 | P3 | Isolation | Build artifacts not cleaned | Add afterAll cleanup |
| storybook-1-4.spec.ts:224 | P3 | Isolation | Build artifacts not cleaned | Add afterAll cleanup |
| smoke.spec.ts:68 | P3 | Maintainability | Magic number 5_000 | Extract to constant |
| migration-1-2.spec.ts:138 | P3 | Maintainability | typeMapping duplication | Generate from constants |

---

## Review Metadata

**Generated By**: BMad TEA Agent (Murat - Test Architect)
**Workflow**: testarch-test-review v5.0
**Review ID**: test-review-suite-20260207
**Timestamp**: 2026-02-07
**Version**: 1.0
**Execution Mode**: Parallel (5 quality subprocesses)

---

## Feedback on This Review

If you have questions or feedback on this review:

1. Review patterns in knowledge base: `_bmad/tea/testarch/knowledge/`
2. Consult tea-index.csv for detailed guidance
3. Request clarification on specific violations
4. Pair with QA engineer to apply patterns

This review is guidance, not rigid rules. Context matters - if a pattern is justified, document it with a comment.
