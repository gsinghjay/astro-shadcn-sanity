/**
 * Dynamic Pages (catch-all routes) — E2E Tests
 *
 * Validates that dynamic pages rendered via the [...slug].astro
 * catch-all route load correctly, render blocks within the page,
 * and have proper titles and meta tags.
 *
 * @story 15.3
 */
import { test, expect } from '../support/fixtures'
import { expectAccessible } from '../support/helpers/a11y'

test.describe('Dynamic Pages', () => {
  test('[P1] 15.3-E2E-034 — /about page renders with correct template', async ({ page }) => {
    // Given the /about page is a dynamic page rendered via the catch-all route
    // When I navigate to /about
    const response = await page.goto('/about')
    await page.waitForLoadState('domcontentloaded')

    // Then the page should return a successful response
    expect(response, 'About page should return a response').not.toBeNull()
    expect(
      response!.ok(),
      `About page should return 200-level status (got ${response!.status()})`,
    ).toBe(true)

    // And the page should have basic layout structure
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()

    // And the page should have a title
    await expect(page).toHaveTitle(/.+/)
  })

  test('[P1] 15.3-E2E-035 — /contact page renders with correct template', async ({ page }) => {
    // Given the /contact page is a dynamic page rendered via the catch-all route
    // When I navigate to /contact
    const response = await page.goto('/contact')
    await page.waitForLoadState('domcontentloaded')

    // Then the page should return a successful response
    expect(response, 'Contact page should return a response').not.toBeNull()
    expect(
      response!.ok(),
      `Contact page should return 200-level status (got ${response!.status()})`,
    ).toBe(true)

    // And the page should have basic layout structure
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()

    // And the page should have a title
    await expect(page).toHaveTitle(/.+/)
  })

  test('[P1] 15.3-E2E-036 — dynamic pages render block sections from Sanity', async ({
    page,
  }) => {
    // Given the /about page contains block sections from Sanity
    // When I navigate to /about
    await page.goto('/about')
    await page.waitForLoadState('domcontentloaded')

    // Then the main content area should contain rendered sections
    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible()

    const sections = mainContent.locator('section')
    const sectionCount = await sections.count()
    expect(
      sectionCount,
      'Dynamic page should render at least one block section',
    ).toBeGreaterThanOrEqual(1)
  })

  test('[P1] 15.3-E2E-037 — dynamic pages have proper meta description', async ({ page }) => {
    // Given the /about page has SEO metadata from Sanity
    await page.goto('/about')
    await page.waitForLoadState('domcontentloaded')

    // Then the page should have a non-empty title
    await expect(page).toHaveTitle(/.+/)

    // And a viewport meta tag should be present
    const viewport = page.locator('meta[name="viewport"]')
    await expect(viewport).toHaveAttribute('content', /width=device-width/)
  })

  test('[P1] 15.3-E2E-038 — dynamic pages pass accessibility checks', async ({ page }) => {
    // Given a dynamic page is loaded
    await page.goto('/about')
    await page.waitForLoadState('domcontentloaded')

    // Then there should be no accessibility violations
    await expectAccessible(page)
  })

  test('[P1] 15.3-E2E-039 — dynamic pages load without console errors', async ({ page }) => {
    // Given a dynamic page loads content from Sanity
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // When I navigate to /about
    await page.goto('/about')
    await page.waitForLoadState('domcontentloaded')

    // Then there should be zero console errors
    expect(
      errors,
      `Console errors found on /about:\n${errors.join('\n')}`,
    ).toHaveLength(0)
  })
})
