import { defineConfig } from '@playwright/test'

/**
 * Playwright config for integration tests (schema validation, module tests).
 * No browser, no webServer — pure Node.js module validation.
 * Uses tsx for TypeScript module resolution in dynamic imports.
 *
 * Usage: npx playwright test --config=playwright.integration.config.ts
 */
export default defineConfig({
  testDir: './tests/integration',
  outputDir: './test-results/integration',
  fullyParallel: true,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  timeout: 120_000,
})
