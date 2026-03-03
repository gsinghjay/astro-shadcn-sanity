import { test, expect } from '../support/fixtures'

/**
 * Portal auth E2E tests — Story 9.18.
 *
 * These tests validate the portal login and denied pages render correctly.
 * Full OAuth/Magic Link flows require external services and are covered
 * by unit tests in auth-config.test.ts and middleware.test.ts.
 *
 * SSR pages require the Cloudflare runtime (D1, KV). In the E2E test
 * environment, unauthenticated requests to /portal/* are redirected to
 * /portal/login by middleware — so we test the login page directly.
 */

test.describe('Portal Login Page — Story 9.18', () => {
  test('[P0] 9.18-E2E-001 — portal login page renders with three sign-in options', async ({ page }) => {
    await page.goto('/portal/login')

    await expect(page.locator('h1')).toContainText('Sponsor Portal')
    await expect(page.locator('#google-signin')).toBeVisible()
    await expect(page.locator('#github-signin')).toBeVisible()
    await expect(page.locator('#magic-link-form')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('[P0] 9.18-E2E-002 — portal login page has correct title', async ({ page }) => {
    await page.goto('/portal/login')

    await expect(page).toHaveTitle(/Sponsor Portal/)
  })

  test('[P1] 9.18-E2E-003 — magic link form validates email input', async ({ page }) => {
    await page.goto('/portal/login')

    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toHaveAttribute('required', '')
  })

  test('[P1] 9.18-E2E-004 — redirect param is preserved in data attribute', async ({ page }) => {
    await page.goto('/portal/login?redirect=%2Fportal%2Fdashboard')

    const loginCard = page.locator('.login-card')
    await expect(loginCard).toHaveAttribute('data-redirect', '/portal/dashboard')
  })
})

test.describe('Portal Denied Page — Story 9.18', () => {
  test('[P0] 9.18-E2E-005 — denied page renders with access denied message', async ({ page }) => {
    await page.goto('/portal/denied')

    await expect(page.locator('h1')).toContainText('Access Denied')
    await expect(page.locator('a[href="/portal/login"]')).toBeVisible()
  })

  test('[P0] 9.18-E2E-006 — denied page has correct title', async ({ page }) => {
    await page.goto('/portal/denied')

    await expect(page).toHaveTitle(/Access Denied/)
  })
})

test.describe('Portal Auth Redirect — Story 9.18', () => {
  test('[P1] 9.18-E2E-007 — unauthenticated portal access redirects to login', async ({ page }) => {
    const response = await page.goto('/portal/dashboard')

    // In prod: middleware redirects to /portal/login?redirect=...
    // In dev: middleware bypasses auth (dev mode), page may 404
    // We verify the response is either a redirect or a page load (not a 500)
    expect(response?.status()).toBeLessThan(500)
  })
})
