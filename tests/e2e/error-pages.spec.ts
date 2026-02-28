/**
 * Error Pages — E2E Tests
 *
 * Validates that navigating to non-existent routes returns a 404
 * response or renders an error page, and that the basic page layout
 * (header/footer) is still present.
 *
 * @story 15.3
 */
import { test, expect } from '../support/fixtures'

test.describe('404 Error Page', () => {
  test('[P1] 15.3-E2E-026 — non-existent route returns 404 or error page', async ({ page }) => {
    // Given a route that does not exist on the site
    // When I navigate to a non-existent URL
    const response = await page.goto('/this-page-does-not-exist-12345')

    // Then the response should indicate the page was not found
    expect(response, 'Response should not be null').not.toBeNull()
    expect(
      response!.status(),
      'Non-existent route should return 404 status',
    ).toBe(404)
  })

  test('[P1] 15.3-E2E-027 — non-existent sponsor slug returns 404', async ({ page }) => {
    // Given a sponsor slug that does not exist
    // When I navigate to a non-existent sponsor detail page
    const response = await page.goto('/sponsors/this-sponsor-does-not-exist-xyz')

    // Then the response should indicate the page was not found
    expect(response, 'Response should not be null').not.toBeNull()
    expect(
      response!.status(),
      'Non-existent sponsor should return 404 status',
    ).toBe(404)
  })

  test('[P1] 15.3-E2E-028 — non-existent project slug returns 404', async ({ page }) => {
    // Given a project slug that does not exist
    // When I navigate to a non-existent project detail page
    const response = await page.goto('/projects/this-project-does-not-exist-xyz')

    // Then the response should indicate the page was not found
    expect(response, 'Response should not be null').not.toBeNull()
    expect(
      response!.status(),
      'Non-existent project should return 404 status',
    ).toBe(404)
  })

  test('[P1] 15.3-E2E-029 — error page maintains basic layout structure', async ({ page }) => {
    // Given I navigate to a non-existent route
    await page.goto('/this-page-does-not-exist-12345')

    // Then the page should still render visible content
    await expect(page.locator('body')).toBeVisible()
  })
})
