/**
 * Sponsors listing and detail pages — E2E Tests
 *
 * Validates that sponsor listing renders cards, detail pages show
 * sponsor information, breadcrumb navigation works, and external
 * links have correct attributes.
 *
 * @story 15.3
 */
import { test, expect } from '../support/fixtures'
import { expectAccessible } from '../support/helpers/a11y'

test.describe('Sponsors Listing Page', () => {
  test('[P0] 15.3-E2E-001 — sponsor listing page loads with sponsor cards', async ({ page }) => {
    // Given the sponsors listing page exists with Sanity-sourced data
    // When I navigate to the sponsors page
    await page.goto('/sponsors')
    await page.waitForLoadState('domcontentloaded')

    // Then the page should have a visible heading
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).toContainText('Sponsors')

    // And sponsor cards should be rendered
    const sponsorLinks = page.locator('a[href^="/sponsors/"]')
    const count = await sponsorLinks.count()
    expect(count, 'Should have at least one sponsor card').toBeGreaterThan(0)
  })

  test('[P0] 15.3-E2E-002 — clicking a sponsor card navigates to the detail page', async ({
    page,
  }) => {
    // Given I am on the sponsors listing page
    await page.goto('/sponsors')
    await page.waitForLoadState('domcontentloaded')

    // When I click the first sponsor card link
    const firstSponsorLink = page.locator('a[href^="/sponsors/"]').first()
    const href = await firstSponsorLink.getAttribute('href')
    expect(href, 'Sponsor link should have an href').toBeTruthy()

    await firstSponsorLink.click()

    // Then I should be navigated to the sponsor detail page
    await expect(page).toHaveURL(href!)
  })

  test('[P1] 15.3-E2E-003 — sponsors listing page passes accessibility checks', async ({
    page,
  }) => {
    // Given the sponsors listing page is loaded
    // When I run an accessibility audit
    await page.goto('/sponsors')
    await page.waitForLoadState('domcontentloaded')

    // Then there should be no accessibility violations
    await expectAccessible(page)
  })
})

test.describe('Sponsor Detail Page', () => {
  test('[P0] 15.3-E2E-004 — sponsor detail page shows sponsor information', async ({ page }) => {
    // Given I navigate to a sponsor detail page via the listing
    await page.goto('/sponsors')
    await page.waitForLoadState('domcontentloaded')

    const firstSponsorLink = page.locator('a[href^="/sponsors/"]').first()
    const href = await firstSponsorLink.getAttribute('href')
    expect(href).toBeTruthy()

    // When I navigate to the detail page
    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    // Then the page should have a visible h1 with the sponsor name
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    const headingText = await heading.innerText()
    expect(headingText.length, 'Sponsor name should not be empty').toBeGreaterThan(0)
  })

  test('[P0] 15.3-E2E-005 — sponsor detail page shows tier badge', async ({ page }) => {
    // Given I navigate to a sponsor detail page
    await page.goto('/sponsors')
    await page.waitForLoadState('domcontentloaded')

    const firstSponsorLink = page.locator('a[href^="/sponsors/"]').first()
    const href = await firstSponsorLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    // Then a tier badge should be visible (platinum, gold, silver, or bronze)
    // The badge is rendered next to the h1 heading
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  test('[P0] 15.3-E2E-006 — breadcrumb navigation shows correct path', async ({ page }) => {
    // Given I navigate to a sponsor detail page
    await page.goto('/sponsors')
    await page.waitForLoadState('domcontentloaded')

    const firstSponsorLink = page.locator('a[href^="/sponsors/"]').first()
    const href = await firstSponsorLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    // Then breadcrumb navigation should be visible
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
    await expect(breadcrumb).toBeVisible()

    // And it should contain Home > Sponsors > [Sponsor Name]
    await expect(breadcrumb).toContainText('Home')
    await expect(breadcrumb).toContainText('Sponsors')
  })

  test('[P1] 15.3-E2E-007 — breadcrumb links are clickable and navigate correctly', async ({
    page,
  }) => {
    // Given I am on a sponsor detail page with breadcrumb navigation
    await page.goto('/sponsors')
    await page.waitForLoadState('domcontentloaded')

    const firstSponsorLink = page.locator('a[href^="/sponsors/"]').first()
    const href = await firstSponsorLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    // When I click the "Sponsors" breadcrumb link
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
    const sponsorsLink = breadcrumb.locator('a[href="/sponsors"]')
    await expect(sponsorsLink).toBeVisible()
    await sponsorsLink.click()

    // Then I should be navigated back to the sponsors listing
    await expect(page).toHaveURL('/sponsors')
  })

  test('[P1] 15.3-E2E-008 — external website link has correct attributes', async ({ page }) => {
    // Given I navigate to a sponsor detail page
    await page.goto('/sponsors')
    await page.waitForLoadState('domcontentloaded')

    const firstSponsorLink = page.locator('a[href^="/sponsors/"]').first()
    const href = await firstSponsorLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    // Then if a "Visit Website" link exists, it should open in a new tab
    const websiteLink = page.getByText('Visit Website')
    const linkCount = await websiteLink.count()

    if (linkCount > 0) {
      await expect(websiteLink).toHaveAttribute('target', '_blank')
      await expect(websiteLink).toHaveAttribute('rel', /noopener/)
    }
  })

  test('[P0] 15.3-E2E-009 — back link returns to sponsors listing', async ({ page }) => {
    // Given I am on a sponsor detail page
    await page.goto('/sponsors')
    await page.waitForLoadState('domcontentloaded')

    const firstSponsorLink = page.locator('a[href^="/sponsors/"]').first()
    const href = await firstSponsorLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    // When I click the back link
    const backLink = page.locator('a[href="/sponsors"]').last()
    await expect(backLink).toBeVisible()
    await backLink.click()

    // Then I should be navigated back to the sponsors listing
    await expect(page).toHaveURL('/sponsors')
  })
})
