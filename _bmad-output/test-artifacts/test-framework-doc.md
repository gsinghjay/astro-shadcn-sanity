# Test Framework Architecture Document

**Project:** astro-shadcn-sanity
**Framework:** Playwright
**Date:** 2026-02-07
**Author:** Murat (TEA — Master Test Architect)
**Status:** Initialized — Smoke Suite Operational

---

## 1. Executive Summary

This document describes the end-to-end test framework for the astro-shadcn-sanity monorepo. The framework uses **Playwright** to validate a statically-generated Astro 5.x site backed by Sanity CMS. Tests run against the built production output, covering functional correctness, WCAG 2.1 AA accessibility, performance budgets, and cross-browser/responsive behavior across 5 browser projects.

### Key Numbers

| Metric | Value |
|---|---|
| Framework | Playwright 1.58+ |
| Browser projects | 5 (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari) |
| Current tests | 7 (smoke suite) |
| Test run time | ~13s (Chromium only), ~40s estimated (all projects) |
| Accessibility standard | WCAG 2.1 AA via axe-core |
| Build + preview | ~1.4s build, ~4ms preview startup |

---

## 2. Architectural Rationale

### Why Playwright

| Factor | Assessment |
|---|---|
| Multi-browser NFRs | Architecture requires Lighthouse 95+ on mobile AND desktop — Chromium, WebKit, Firefox validation needed |
| Performance auditing | NFRs: FCP <1s, LCP <2s, TBT <100ms, CLS <0.05 — Playwright has native perf measurement APIs |
| Accessibility | WCAG 2.1 AA across all blocks — `@axe-core/playwright` is first-class |
| Static site fit | Tests validate built HTML output — Playwright's browser-first model is ideal |
| CI parallelism | Native test sharding for GitHub Actions |
| Vanilla JS interactions | Data-attribute driven event delegation — Playwright's locator API with `data-*` selectors is a natural fit |
| Monorepo | Configurable `testDir`, `webServer` with workspace commands |

### Why NOT Cypress

- No component testing need (pure `.astro` files, no React in frontend)
- Narrower browser support (no WebKit)
- Slower CI execution for cross-browser matrix
- Component testing is Cypress's main advantage, which is irrelevant here

### Static SSG Testing Profile

This is a **zero-runtime-API** static site. All Sanity content is fetched at build time via GROQ queries. This fundamentally shapes the test strategy:

- **No API mocking needed** — there are no runtime API calls to intercept
- **No authentication** — public static pages (auth deferred to forms phase)
- **No data factories** — content is static, seeded in Sanity Studio at build time
- **No database cleanup** — no server-side state to manage between tests
- **Build is the contract** — if the build succeeds and pages render correctly, the data pipeline is working

The testing surface is therefore:
1. **Rendered HTML correctness** — blocks render expected content and structure
2. **Accessibility compliance** — WCAG 2.1 AA across all pages and blocks
3. **Performance budgets** — Lighthouse metrics within NFR thresholds
4. **Cross-browser rendering** — consistent experience across 5 browser targets
5. **Interactive behavior** — vanilla JS (accordions, mobile nav, carousels) works correctly
6. **SEO** — meta tags, structured data, sitemap present

---

## 3. Directory Structure

```
astro-shadcn-sanity/                    # Monorepo root
├── playwright.config.ts                # Framework configuration
├── .nvmrc                              # Node 24
├── package.json                        # Test scripts (test, test:e2e, test:ui, etc.)
│
├── tests/                              # Test root ({test_dir})
│   ├── .env                            # Test environment variables
│   ├── .env.example                    # Template for team members
│   │
│   ├── e2e/                            # End-to-end test specs
│   │   └── smoke.spec.ts              # Homepage smoke + a11y + perf baseline
│   │
│   └── support/                        # Test infrastructure
│       ├── fixtures/
│       │   └── index.ts               # Merged fixtures (single import for all tests)
│       └── helpers/
│           └── a11y.ts                # Axe-core WCAG 2.1 AA helper
│
├── test-results/                       # Generated: screenshots, videos, traces, JUnit XML
├── playwright-report/                  # Generated: HTML report
│
├── astro-app/                          # Frontend workspace (system under test)
│   ├── dist/                           # Built static output (tests run against this)
│   └── ...
│
└── studio/                             # Sanity Studio workspace (not tested by E2E)
```

### Planned Expansion

As blocks are implemented, the test directory will grow:

```
tests/
├── e2e/
│   ├── smoke.spec.ts                  # Current: homepage baseline
│   ├── blocks/                         # Future: per-block test suites
│   │   ├── hero-banner.spec.ts
│   │   ├── feature-grid.spec.ts
│   │   ├── sponsor-cards.spec.ts
│   │   ├── faq-section.spec.ts        # Interactive: accordion expand/collapse
│   │   ├── contact-form.spec.ts       # Deferred to forms phase
│   │   └── ...
│   ├── pages/                          # Future: page-level integration
│   │   ├── sponsors.spec.ts
│   │   ├── projects.spec.ts
│   │   └── navigation.spec.ts         # Mobile nav, breadcrumbs
│   └── performance/                    # Future: Lighthouse CI
│       └── lighthouse.spec.ts
│
└── support/
    ├── fixtures/
    │   └── index.ts
    ├── helpers/
    │   ├── a11y.ts
    │   └── lighthouse.ts              # Future: Lighthouse helper
    └── page-objects/                   # Future: per-block page objects
        ├── hero-banner.po.ts
        └── faq-section.po.ts
```

---

## 4. Configuration Reference

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321'

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'],
  ],

  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: {
    command: 'sh -c "npm run build --workspace=astro-app && npm run preview --workspace=astro-app"',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
  },

  projects: [
    { name: 'chromium',      use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',       use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',        use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],
})
```

### Configuration Decisions Explained

| Setting | Value | Rationale |
|---|---|---|
| `fullyParallel` | `true` | Tests are independent — no shared state between them |
| `forbidOnly` | `true` in CI | Prevents `.only()` from accidentally blocking the pipeline |
| `retries` | 2 in CI, 0 locally | CI handles transient failures; local runs fail fast for debugging |
| `workers` | 1 in CI, auto locally | Serial CI for stability; parallel local for speed |
| `actionTimeout` | 15s | Standard for click/fill/type actions |
| `navigationTimeout` | 30s | Generous for build+serve cold start |
| `expect.timeout` | 10s | Default assertion timeout |
| `timeout` | 60s | Global test timeout |
| `trace` | `on-first-retry` | Full debugging data on first retry (network, DOM, console) |
| `screenshot` | `only-on-failure` | Saves disk space; captures failure evidence |
| `video` | `retain-on-failure` | Full video replay for debugging failures |
| `webServer` | build + preview | Builds Astro to `dist/`, serves via `astro preview` |
| `reuseExistingServer` | `true` locally | Skips build if preview is already running |

### Timeout Standards

| Timeout | Value | Applies To |
|---|---|---|
| Action | 15,000ms | `page.click()`, `page.fill()`, `page.type()` |
| Navigation | 30,000ms | `page.goto()`, `page.reload()` |
| Expect | 10,000ms | All `expect()` assertions |
| Test | 60,000ms | Entire test execution |
| WebServer | 120,000ms | Build + preview startup |

### Browser Matrix

| Project | Device | Viewport | Use Case |
|---|---|---|---|
| `chromium` | Desktop Chrome | 1280x720 | Primary desktop browser |
| `firefox` | Desktop Firefox | 1280x720 | Cross-browser coverage |
| `webkit` | Desktop Safari | 1280x720 | macOS/iOS WebKit engine |
| `mobile-chrome` | Pixel 7 | 393x851 | Android responsive testing |
| `mobile-safari` | iPhone 14 | 390x844 | iOS responsive testing |

### Reporters

| Reporter | Output | Purpose |
|---|---|---|
| HTML | `playwright-report/` | Interactive visual report with screenshots, videos, traces |
| JUnit | `test-results/results.xml` | CI integration (GitHub Actions, Jenkins, etc.) |
| List | Console stdout | Real-time test progress during execution |

### Artifacts Retention

| Artifact | When Captured | Storage |
|---|---|---|
| Screenshots | On failure only | `test-results/{test-name}/` |
| Videos | Retained on failure | `test-results/{test-name}/` |
| Traces | On first retry | `test-results/{test-name}/` |
| HTML Report | Always | `playwright-report/` |
| JUnit XML | Always | `test-results/results.xml` |

---

## 5. Fixture Architecture

### Design Philosophy

The fixture system follows the **Functional Core, Fixture Shell** pattern from `@seontechnologies/playwright-utils`:

1. **Pure functions** as the core logic (testable without Playwright)
2. **Fixtures** as wrappers that inject Playwright context automatically
3. **`mergeTests`** to compose multiple fixtures into a single `test` object

### Current Fixtures

```typescript
// tests/support/fixtures/index.ts
import { mergeTests } from '@playwright/test'
import { test as networkErrorMonitorFixture } from '@seontechnologies/playwright-utils/network-error-monitor/fixtures'
import { test as logFixture } from '@seontechnologies/playwright-utils/log/fixtures'

export const test = mergeTests(networkErrorMonitorFixture, logFixture)
export { expect } from '@playwright/test'
```

**All tests import from this single file:**

```typescript
import { test, expect } from '../support/fixtures'
```

#### Network Error Monitor

Automatically detects HTTP 4xx/5xx responses during page loads. For a static site, this catches:
- Broken asset references (missing CSS, JS, images)
- 404 errors from incorrect links
- CDN failures (Sanity image CDN, fonts)

**Opt out for tests that intentionally trigger errors:**

```typescript
test('handles 404 page', {
  annotation: [{ type: 'skipNetworkMonitoring' }]
}, async ({ page }) => {
  await page.goto('/nonexistent-page')
  // Network monitor won't fail the test for the expected 404
})
```

#### Log Utility

Structured logging attached to Playwright's HTML report:

```typescript
test('example with logging', async ({ page, log }) => {
  await log.step('Navigate to homepage')
  await page.goto('/')

  await log.step('Verify hero banner')
  await expect(page.locator('[data-testid="hero-banner"]')).toBeVisible()
})
```

### Fixtures NOT Included (and Why)

| Fixture | Status | Reason |
|---|---|---|
| `apiRequest` | Not needed | Zero runtime API calls — all data at build time |
| `authSession` | Not needed | No authentication — public static site |
| `interceptNetworkCall` | Not needed | No runtime API calls to intercept |
| `networkRecorder` | Not needed | No HAR recording needed for static pages |
| `recurse` | Not needed | No async polling (no background jobs) |

### Adding Fixtures for Forms Phase

When the project migrates to Cloudflare Pages with the contact form (Cloudflare Worker), add auth and API fixtures:

```typescript
// tests/support/fixtures/index.ts — future state
import { mergeTests } from '@playwright/test'
import { test as networkErrorMonitorFixture } from '@seontechnologies/playwright-utils/network-error-monitor/fixtures'
import { test as logFixture } from '@seontechnologies/playwright-utils/log/fixtures'
import { test as apiRequestFixture } from '@seontechnologies/playwright-utils/api-request/fixtures'

export const test = mergeTests(
  networkErrorMonitorFixture,
  logFixture,
  apiRequestFixture,  // Add when forms phase begins
)

export { expect } from '@playwright/test'
```

---

## 6. Helpers Reference

### expectAccessible(page, options?)

Runs a full axe-core WCAG 2.1 AA accessibility audit against the current page state.

```typescript
import { expectAccessible } from '../support/helpers/a11y'

// Basic usage — audit entire page
await expectAccessible(page)

// Disable specific rules (use sparingly, with justification)
await expectAccessible(page, {
  disableRules: ['color-contrast']  // Only if contrast is a known, tracked issue
})
```

**Tags audited:** `wcag2a`, `wcag2aa`, `wcag21aa`

**Failure output includes:**
- Rule ID (e.g., `color-contrast`, `button-name`, `image-alt`)
- Impact level (`minor`, `moderate`, `serious`, `critical`)
- Human-readable description
- Number of affected nodes
- CSS selectors for the first 3 violating elements

**Implementation:**

```typescript
import AxeBuilder from '@axe-core/playwright'
import { type Page, expect } from '@playwright/test'

export async function expectAccessible(page: Page, options?: { disableRules?: string[] }) {
  const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])

  if (options?.disableRules?.length) {
    builder.disableRules(options.disableRules)
  }

  const results = await builder.analyze()

  const violations = results.violations.map((v) => ({
    rule: v.id,
    impact: v.impact,
    description: v.description,
    nodes: v.nodes.length,
    targets: v.nodes.slice(0, 3).map((n) => n.target.join(' > ')),
  }))

  expect(violations, `Accessibility violations found:\n${JSON.stringify(violations, null, 2)}`).toHaveLength(0)
}
```

---

## 7. Test Patterns

### Import Convention

Every test file uses the same import:

```typescript
import { test, expect } from '../support/fixtures'
```

This ensures all fixtures (network monitor, log) are active in every test. Never import directly from `@playwright/test` in test specs.

### Selector Strategy

Prioritize selectors in this order:

1. **Semantic locators** (best — accessible by design):
   ```typescript
   page.getByRole('heading', { name: 'Welcome to YWCC' })
   page.getByRole('button', { name: 'Learn More' })
   page.getByText('Contact Us')
   page.getByRole('navigation')
   ```

2. **Semantic HTML selectors** (good — stable structural elements):
   ```typescript
   page.locator('header')
   page.locator('footer')
   page.locator('main')
   page.locator('nav a')
   ```

3. **`data-testid` attributes** (when semantic isn't sufficient):
   ```typescript
   page.locator('[data-testid="hero-banner"]')
   page.locator('[data-testid="sponsor-card-njit"]')
   ```

4. **`data-*` state attributes** (for interactive elements — aligns with project JS pattern):
   ```typescript
   page.locator('[data-state="open"]')
   page.locator('[data-faq-trigger]')
   ```

**Never use:**
- CSS class selectors (`.text-primary`, `.bg-background`) — fragile, change with styling
- XPath — hard to read, maintain
- Nested CSS selectors with depth >3 — brittle

### Test Structure

Follow the Given-When-Then pattern implicitly:

```typescript
test('sponsor cards should render with correct tier badges', async ({ page }) => {
  // Given: homepage is loaded (static content from Sanity build)
  await page.goto('/')

  // When: user scrolls to sponsor section
  const sponsorSection = page.locator('[data-testid="sponsor-cards"]')
  await sponsorSection.scrollIntoViewIfNeeded()

  // Then: sponsor cards are visible with tier badges
  await expect(sponsorSection.getByRole('heading')).toBeVisible()
  const cards = sponsorSection.locator('[data-testid="sponsor-card"]')
  await expect(cards).toHaveCount(await cards.count())  // At least renders
})
```

### Accessibility Test Pattern

Every page and block should have an a11y test:

```typescript
test.describe('About Page', () => {
  test('should have no accessibility violations', async ({ page }) => {
    await page.goto('/about')
    await expectAccessible(page)
  })
})
```

For block-specific audits, scope the axe analysis:

```typescript
test('FAQ section should be accessible', async ({ page }) => {
  await page.goto('/page-with-faq')

  const faqSection = page.locator('[data-testid="faq-section"]')
  await faqSection.scrollIntoViewIfNeeded()

  // Scope axe to just the FAQ section
  const results = await new AxeBuilder({ page })
    .include('[data-testid="faq-section"]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()

  expect(results.violations).toHaveLength(0)
})
```

### Responsive Test Pattern

Use Playwright projects for viewport testing. Tests run automatically across all 5 browser projects. For viewport-conditional assertions:

```typescript
test('mobile nav should be visible on small screens', async ({ page, isMobile }) => {
  await page.goto('/')

  if (isMobile) {
    // Mobile: hamburger menu should be visible
    await expect(page.locator('[data-testid="mobile-nav-trigger"]')).toBeVisible()
    await expect(page.locator('header nav')).not.toBeVisible()
  } else {
    // Desktop: full nav should be visible
    await expect(page.locator('header nav')).toBeVisible()
    await expect(page.locator('[data-testid="mobile-nav-trigger"]')).not.toBeVisible()
  }
})
```

### Interactive Block Test Pattern

For blocks with vanilla JS interactions (FAQ accordion, mobile nav, tabs):

```typescript
test('FAQ accordion should expand and collapse', async ({ page }) => {
  await page.goto('/page-with-faq')

  const trigger = page.locator('[data-faq-trigger]').first()
  const target = page.locator('[data-faq-target]').first()

  // Initially collapsed
  await expect(target).toHaveAttribute('data-state', 'closed')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  // Click to expand
  await trigger.click()
  await expect(target).toHaveAttribute('data-state', 'open')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')

  // Click to collapse
  await trigger.click()
  await expect(target).toHaveAttribute('data-state', 'closed')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})
```

### Performance Test Pattern

```typescript
test('homepage should meet performance budget', async ({ page }) => {
  const start = Date.now()
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  const loadTime = Date.now() - start

  // SSG pages should load fast
  expect(loadTime).toBeLessThan(5_000)
})

test('should load without console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  expect(errors, `Console errors:\n${errors.join('\n')}`).toHaveLength(0)
})
```

### Anti-Patterns

| Anti-Pattern | Why It's Bad | Do This Instead |
|---|---|---|
| `page.waitForTimeout(3000)` | Non-deterministic, slow | `page.waitForLoadState()` or `expect().toBeVisible()` |
| `if (await el.isVisible())` | Conditional flow changes test behavior | Set up known state; assert deterministically |
| `try { ... } catch { }` | Swallows failures silently | Let assertions fail naturally |
| Import from `@playwright/test` | Bypasses network monitor + log fixtures | Import from `../support/fixtures` |
| CSS class selectors | Brittle — change with styling | Use `data-testid` or semantic locators |
| Tests >300 lines | Hard to understand and debug | Split into focused tests or extract to fixtures |
| Hardcoded URLs | Breaks across environments | Use `page.goto('/')` with `baseURL` from config |

---

## 8. npm Scripts

| Script | Command | Use Case |
|---|---|---|
| `npm test` | `npx playwright test` | All 5 browser projects — full cross-browser run |
| `npm run test:e2e` | `npx playwright test` | Alias for `npm test` |
| `npm run test:chromium` | `npx playwright test --project=chromium` | Fast feedback — single browser |
| `npm run test:headed` | `npx playwright test --headed --project=chromium` | Visual debugging — see the browser |
| `npm run test:ui` | `npx playwright test --ui` | Playwright UI — interactive test explorer |

### Additional CLI Commands

```bash
# Run a specific test file
npx playwright test tests/e2e/smoke.spec.ts

# Run a specific project
npx playwright test --project=mobile-safari

# Run with grep filter
npx playwright test --grep "accessibility"

# Debug a specific test
npx playwright test --debug tests/e2e/smoke.spec.ts

# Show HTML report
npx playwright show-report

# View trace file
npx playwright show-trace test-results/{test-name}/trace.zip
```

---

## 9. CI/CD Integration

### GitHub Actions Configuration

```yaml
name: E2E Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm test
        env:
          CI: true

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: |
            test-results/
            playwright-report/
          retention-days: 30
```

### CI Behavior Differences

| Setting | Local | CI |
|---|---|---|
| `retries` | 0 (fail fast) | 2 (handle transient failures) |
| `workers` | Auto (CPU count) | 1 (serial for stability) |
| `forbidOnly` | `false` | `true` (prevents `.only()` blocking) |
| `webServer.reuseExistingServer` | `true` (skip build if running) | `false` (always fresh build) |
| Artifacts | Generated locally | Uploaded to GitHub on failure |

### Future: Sharded Execution

When the test suite grows beyond ~50 tests, add sharding:

```yaml
jobs:
  e2e:
    strategy:
      fail-fast: false
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]
    steps:
      - name: Run tests (shard ${{ matrix.shard }})
        run: npx playwright test --shard=${{ matrix.shard }}
```

### Future: Burn-in for PRs

The `@seontechnologies/playwright-utils` burn-in runner can optimize PR CI by running only tests affected by changed files:

```typescript
// tests/scripts/burn-in-changed.ts
import { runBurnIn } from '@seontechnologies/playwright-utils/burn-in'

await runBurnIn({
  configPath: 'tests/config/.burn-in.config.ts',
  baseBranch: 'main',
})
```

---

## 10. Environment Configuration

### tests/.env

```
TEST_ENV=local
BASE_URL=http://localhost:4321
```

### tests/.env.example

```
# Test Environment Configuration
# Copy this file to .env and adjust values

# Environment to test against (local | staging | production)
TEST_ENV=local

# Base URL — overrides webServer default
# BASE_URL=http://localhost:4321
```

### Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `TEST_ENV` | `local` | Environment identifier |
| `BASE_URL` | `http://localhost:4321` | Target URL (overrides webServer) |
| `CI` | (set by GitHub Actions) | Enables CI-specific behavior |

---

## 11. Dependencies

### Production Test Dependencies (devDependencies in root package.json)

| Package | Version | Purpose |
|---|---|---|
| `@playwright/test` | ^1.58.2 | Test runner, browser automation, assertions |
| `@axe-core/playwright` | ^4.11.1 | WCAG accessibility auditing |
| `@seontechnologies/playwright-utils` | ^3.13.1 | Production-tested fixtures (network monitor, logging) |

### Browser Binaries

Installed via `npx playwright install --with-deps`:
- Chromium
- Firefox
- WebKit

### Peer Dependencies (satisfied by @playwright/test)

- `@playwright/test` >= 1.54.1 (required by playwright-utils)

### Future Dependencies (add when needed)

| Package | When | Purpose |
|---|---|---|
| `@faker-js/faker` | Forms phase | Dynamic test data generation |
| `lighthouse` | Performance phase | Programmatic Lighthouse audits |

---

## 12. Known Issues and Findings

### Active Finding: Color Contrast Violation

**Discovered:** 2026-02-07 (initial smoke run)
**Severity:** Serious (WCAG 2.1 AA)
**Rule:** `color-contrast`
**Affected Elements:** 30 nodes with `.text-background/40.label-caps` class
**Description:** Elements using 40% opacity text on their background fail the 4.5:1 minimum contrast ratio
**Location:** Sponsor cards area — category label elements
**Fix:** Increase text opacity or darken background in CSS. The `text-background/40` utility produces insufficient contrast.

### WebServer Configuration Note

The `webServer.command` uses `sh -c` wrapper to ensure the chained build+preview command executes correctly in Playwright's process spawning:

```typescript
command: 'sh -c "npm run build --workspace=astro-app && npm run preview --workspace=astro-app"'
```

Without the `sh -c` wrapper, the chained `&&` commands can hang in some environments. The `stdout: 'pipe'` setting ensures Playwright can detect when the server is ready.

If port 4321 is occupied (e.g., by a running dev server), kill it first:

```bash
lsof -ti :4321 | xargs kill -9
```

Or set `reuseExistingServer: true` (default locally) to test against the already-running server.

---

## 13. Expansion Roadmap

### Phase 1: Block Coverage (Current Sprint)

As each block component is implemented, add corresponding E2E tests:

| Block | Test Focus | Priority |
|---|---|---|
| HeroBanner | Renders heading, subheading, CTA buttons, background image | P0 |
| FeatureGrid | Grid layout, correct item count, responsive columns | P0 |
| SponsorCards | Card rendering, tier badges, links, **contrast fix** | P0 |
| RichText | Portable text rendering, headings, links, lists | P0 |
| CtaBanner | CTA text, button links, background variant | P0 |
| FaqSection | **Interactive:** accordion expand/collapse, ARIA attributes | P0 |
| Timeline | Event ordering, date display | P0 |
| LogoCloud | Image rendering, alt text | P0 |
| StatsRow | Number display, labels | P0 |
| TeamGrid | Grid layout, member cards, responsive | P0 |
| TextWithImage | Image + text layout, responsive reflow | P0 |

### Phase 2: Page Integration

| Page | Test Focus | Priority |
|---|---|---|
| Homepage | Full block rendering, block ordering | P0 |
| About | Content rendering, a11y | P0 |
| Sponsors listing | Sponsor cards, filtering (future) | P1 |
| Sponsor detail | Full profile rendering | P1 |
| Projects listing | Project cards, team cross-refs | P1 |
| Contact | Form validation, submission (deferred) | P2 |

### Phase 3: Performance & CI

| Capability | Implementation | Priority |
|---|---|---|
| Lighthouse CI | `lighthouse` package + custom helper | P1 |
| GitHub Actions pipeline | `.github/workflows/e2e.yml` | P1 |
| Burn-in for PRs | `@seontechnologies/playwright-utils/burn-in` | P2 |
| Test sharding | Matrix strategy in GitHub Actions | P2 |
| Visual regression | Playwright screenshot comparison | P3 |

### Phase 4: Forms & Auth (Deferred)

When the project migrates to Cloudflare Pages with the contact form:

| Capability | Implementation |
|---|---|
| API request fixtures | Add `apiRequestFixture` to merged fixtures |
| Form submission tests | Test Cloudflare Worker API endpoint |
| Form validation tests | Client-side validation, error states |
| Rate limiting tests | Verify honeypot + rate limit behavior |

---

## 14. Knowledge Base References

This framework was built using patterns from the TEA (Test Architect) knowledge base:

| Fragment | Applied To |
|---|---|
| `playwright-config.md` | Timeout standards, artifact configuration, parallelization |
| `fixtures-composition.md` | `mergeTests` pattern, single import convention |
| `network-error-monitor.md` | Auto HTTP error detection fixture |
| `test-quality.md` | No hard waits, explicit assertions, <300 line tests, <1.5 min execution |
| `data-factories.md` | Evaluated and intentionally skipped (SSG — no dynamic data) |
| `auth-session.md` | Evaluated and intentionally skipped (no authentication) |
| `api-request.md` | Evaluated and intentionally skipped (no runtime APIs) |
| `burn-in.md` | Noted for future CI optimization |
| `overview.md` | Playwright-utils installation and design patterns |

---

## 15. Troubleshooting

### Tests hang on startup

**Cause:** Port 4321 is occupied by another process (dev server, previous preview).
**Fix:** Kill the process and retry:
```bash
lsof -ti :4321 | xargs kill -9
npm run test:chromium
```

### "Cannot find module" errors

**Cause:** Dependencies not installed or browser binaries missing.
**Fix:**
```bash
npm install
npx playwright install --with-deps
```

### Accessibility test fails

**Cause:** Real WCAG violation in the rendered HTML.
**Fix:** Check the violation details in the test output. Fix the CSS/HTML, not the test. Only disable a rule if there's a documented, accepted exception.

### WebServer timeout

**Cause:** Astro build is slow or failing.
**Fix:** Run the build manually to check for errors:
```bash
npm run build --workspace=astro-app
```

### Tests pass locally, fail in CI

**Cause:** Usually timing differences or missing browser dependencies.
**Fix:** Ensure CI installs browsers with `npx playwright install --with-deps` and that the build completes before tests start (the `webServer` config handles this automatically).

---

**Document maintained by:** TEA (Test Architect Agent)
**Last updated:** 2026-02-07
**Framework version:** Playwright 1.58+
**Knowledge base version:** TEA v5.0
