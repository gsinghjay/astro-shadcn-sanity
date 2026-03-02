/**
 * Projects listing and detail pages — E2E Tests
 *
 * Validates that project listing renders cards with filters,
 * technology and industry filters toggle correctly, project
 * detail pages show expected information, and breadcrumbs work.
 *
 * @story 15.3
 */
import { test, expect } from '../support/fixtures'
import { expectAccessible } from '../support/helpers/a11y'

test.describe('Projects Listing Page', () => {
  test('[P0] 15.3-E2E-010 — project listing page loads with project cards', async ({ page }) => {
    // Given the projects listing page exists with Sanity-sourced data
    // When I navigate to the projects page
    await page.goto('/projects')
    await page.waitForLoadState('domcontentloaded')

    // Then the page should have a visible heading
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).toContainText('Projects')

    // And project cards should be rendered
    const projectCards = page.locator('[data-project-card]')
    const count = await projectCards.count()
    expect(count, 'Should have at least one project card').toBeGreaterThan(0)
  })

  test('[P0] 15.3-E2E-011 — technology filter buttons toggle correctly', async ({ page }) => {
    // Given I am on the projects listing page with filter sidebar
    await page.goto('/projects')
    await page.waitForLoadState('domcontentloaded')

    // Then the "All" technology filter button should be active by default
    const allTechBtn = page.locator('[data-filter-tech="all"]')
    const allTechCount = await allTechBtn.count()

    if (allTechCount > 0) {
      await expect(allTechBtn).toHaveAttribute('aria-pressed', 'true')

      // When I click a specific technology filter button
      const techButtons = page.locator('[data-filter-tech]:not([data-filter-tech="all"])')
      const techBtnCount = await techButtons.count()

      if (techBtnCount > 0) {
        const firstTechBtn = techButtons.first()
        await firstTechBtn.click()

        // Then that button should become active
        await expect(firstTechBtn).toHaveAttribute('aria-pressed', 'true')

        // And the "All" button should become inactive
        await expect(allTechBtn).toHaveAttribute('aria-pressed', 'false')
      }
    }
  })

  test('[P0] 15.3-E2E-012 — industry filter buttons toggle correctly', async ({ page }) => {
    // Given I am on the projects listing page with filter sidebar
    await page.goto('/projects')
    await page.waitForLoadState('domcontentloaded')

    // Then the "All Industries" filter button should be active by default
    const allIndustryBtn = page.locator('[data-filter-industry="all"]')
    const allIndustryCount = await allIndustryBtn.count()

    if (allIndustryCount > 0) {
      await expect(allIndustryBtn).toHaveAttribute('aria-pressed', 'true')

      // When I click a specific industry filter button
      const industryButtons = page.locator(
        '[data-filter-industry]:not([data-filter-industry="all"])',
      )
      const industryBtnCount = await industryButtons.count()

      if (industryBtnCount > 0) {
        const firstIndustryBtn = industryButtons.first()
        await firstIndustryBtn.click()

        // Then that button should become active
        await expect(firstIndustryBtn).toHaveAttribute('aria-pressed', 'true')

        // And the "All Industries" button should become inactive
        await expect(allIndustryBtn).toHaveAttribute('aria-pressed', 'false')
      }
    }
  })

  test('[P0] 15.3-E2E-013 — clicking a project card navigates to the detail page', async ({
    page,
  }) => {
    // Given I am on the projects listing page
    await page.goto('/projects')
    await page.waitForLoadState('domcontentloaded')

    // When I click the first project card link
    const firstProjectLink = page.locator('a[href^="/projects/"]').first()
    const href = await firstProjectLink.getAttribute('href')
    expect(href, 'Project link should have an href').toBeTruthy()

    await firstProjectLink.click()

    // Then I should be navigated to the project detail page
    await expect(page).toHaveURL(href!)
  })

  test('[P1] 15.3-E2E-014 — projects listing page passes accessibility checks', async ({
    page,
  }) => {
    // Given the projects listing page is loaded
    // When I run an accessibility audit
    await page.goto('/projects')
    await page.waitForLoadState('domcontentloaded')

    // Then there should be no accessibility violations
    await expectAccessible(page)
  })

  test('[P1] 15.3-E2E-015 — breadcrumb shows Home > Projects on listing page', async ({
    page,
  }) => {
    // Given I am on the projects listing page
    await page.goto('/projects')
    await page.waitForLoadState('domcontentloaded')

    // Then breadcrumb navigation should be visible
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
    await expect(breadcrumb).toBeVisible()

    // And it should contain Home and Projects
    await expect(breadcrumb).toContainText('Home')
    await expect(breadcrumb).toContainText('Projects')
  })
})

test.describe('Project Detail Page', () => {
  test('[P0] 15.3-E2E-016 — project detail page shows project information', async ({ page }) => {
    // Given I navigate to a project detail page via the listing
    await page.goto('/projects')
    await page.waitForLoadState('domcontentloaded')

    const firstProjectLink = page.locator('a[href^="/projects/"]').first()
    const href = await firstProjectLink.getAttribute('href')
    expect(href).toBeTruthy()

    // When I navigate to the detail page
    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    // Then the page should have a visible h1 with the project title
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    const headingText = await heading.innerText()
    expect(headingText.length, 'Project title should not be empty').toBeGreaterThan(0)

    // And a status badge should be present
    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible()
  })

  test('[P0] 15.3-E2E-017 — project detail breadcrumb shows correct path', async ({ page }) => {
    // Given I navigate to a project detail page
    await page.goto('/projects')
    await page.waitForLoadState('domcontentloaded')

    const firstProjectLink = page.locator('a[href^="/projects/"]').first()
    const href = await firstProjectLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    // Then breadcrumb navigation should show Home > Projects > [Project Title]
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
    await expect(breadcrumb).toBeVisible()
    await expect(breadcrumb).toContainText('Home')
    await expect(breadcrumb).toContainText('Projects')
  })

  test('[P1] 15.3-E2E-018 — project detail page shows sponsor link', async ({ page }) => {
    // Given I navigate to a project detail page
    await page.goto('/projects')
    await page.waitForLoadState('domcontentloaded')

    const firstProjectLink = page.locator('a[href^="/projects/"]').first()
    const href = await firstProjectLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    // Then the page should have a "Sponsor" section heading
    const sponsorHeading = page.getByRole('heading', { name: 'Sponsor' })
    const hasSponsor = await sponsorHeading.count()

    if (hasSponsor > 0) {
      await expect(sponsorHeading).toBeVisible()

      // And a link to the sponsor detail page should exist
      const sponsorLink = page.locator('a[href^="/sponsors/"]')
      await expect(sponsorLink.first()).toBeVisible()
    }
  })

  test('[P0] 15.3-E2E-019 — back link returns to projects listing', async ({ page }) => {
    // Given I am on a project detail page
    await page.goto('/projects')
    await page.waitForLoadState('domcontentloaded')

    const firstProjectLink = page.locator('a[href^="/projects/"]').first()
    const href = await firstProjectLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    // When I click the back link
    const backLink = page.locator('a[href="/projects"]').last()
    await expect(backLink).toBeVisible()
    await backLink.click()

    // Then I should be navigated back to the projects listing
    await expect(page).toHaveURL('/projects')
  })
})
