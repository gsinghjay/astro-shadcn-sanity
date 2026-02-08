# Test Framework

Playwright-based E2E test suite for the astro-shadcn-sanity monorepo.

## Setup

```bash
# Install dependencies (from project root)
npm install

# Install browsers
npx playwright install --with-deps
```

Requires Node 24+ (see `.nvmrc`).

## Running Tests

```bash
# All browsers (chromium, firefox, webkit, mobile)
npm test

# Single browser — fast feedback
npm run test:chromium

# Headed mode — see the browser
npm run test:headed

# Playwright UI — interactive explorer
npm run test:ui

# Specific test file
npx playwright test tests/e2e/smoke.spec.ts

# Specific project
npx playwright test --project=mobile-safari
```

## Architecture

```
tests/
├── e2e/                          # End-to-end test specs
│   └── smoke.spec.ts             # Homepage smoke + a11y + perf baseline
├── support/
│   ├── fixtures/
│   │   └── index.ts              # Merged fixtures (network-error-monitor + log)
│   └── helpers/
│       └── a11y.ts               # Axe-core WCAG 2.1 AA helper
├── .env                          # Test environment variables
└── .env.example                  # Template
```

### Fixtures

All tests import from `tests/support/fixtures/index.ts`:

```typescript
import { test, expect } from '../support/fixtures'
```

Current fixtures (via `@seontechnologies/playwright-utils`):

- **network-error-monitor** — Auto-fails tests when HTTP 4xx/5xx errors occur during page loads (broken assets, missing scripts). Opt out with `{ annotation: [{ type: 'skipNetworkMonitoring' }] }`.
- **log** — Structured logging attached to Playwright HTML reports.

No auth or API fixtures — this is a static SSG site with zero runtime API calls.

### Helpers

- **`a11y.ts`** — `expectAccessible(page)` runs an axe-core audit scoped to WCAG 2.1 AA. Fails the test with detailed violation output if issues are found.

## Best Practices

### Selectors

Use `data-testid` attributes for test-specific selectors. The project already uses `data-*` attributes for JS state (architecture pattern), so keep test selectors separate:

```html
<!-- Production JS state (existing pattern) -->
<div data-state="open" data-faq-target="answer-1">

<!-- Test selectors (add as needed) -->
<div data-testid="hero-banner">
```

Prefer semantic locators where possible:

```typescript
page.getByRole('heading', { name: 'Welcome' })
page.getByText('Learn More')
page.locator('header nav a')
```

### Test Isolation

- Each test is independent — no shared state between tests.
- `fullyParallel: true` in config — tests run concurrently.
- No data factories needed — all content is static from Sanity at build time.

### Accessibility

Every new page or block should include an a11y test:

```typescript
test('block should have no a11y violations', async ({ page }) => {
  await page.goto('/page-with-block')
  await expectAccessible(page)
})
```

## CI Integration

The `playwright.config.ts` is CI-ready:

- `forbidOnly: true` in CI — prevents `.only()` from blocking pipelines
- `retries: 2` in CI — handles transient failures
- `workers: 1` in CI — serial execution for stability
- Artifacts uploaded on failure: screenshots, videos, traces
- JUnit XML at `test-results/results.xml` for CI reporting
- HTML report at `playwright-report/`

### GitHub Actions Example

```yaml
- name: Run E2E tests
  run: npm test
  env:
    CI: true

- name: Upload artifacts
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: |
      test-results/
      playwright-report/
    retention-days: 30
```

## Browser Matrix

| Project | Device | Use Case |
|---|---|---|
| chromium | Desktop Chrome | Primary desktop browser |
| firefox | Desktop Firefox | Cross-browser coverage |
| webkit | Desktop Safari | macOS/iOS engine |
| mobile-chrome | Pixel 7 | Android responsive |
| mobile-safari | iPhone 14 | iOS responsive |

## Dependencies

- `@playwright/test` — Test runner and browser automation
- `@axe-core/playwright` — WCAG accessibility auditing
- `@seontechnologies/playwright-utils` — Production-tested fixtures (network monitor, logging)
