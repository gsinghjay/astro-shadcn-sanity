/**
 * Navigation — E2E Tests
 *
 * Validates that header navigation is present on all pages, all main
 * nav links work, breadcrumbs on detail pages are correct and clickable,
 * back links navigate correctly, and footer links are present.
 *
 * @story 15.3
 */
import { test, expect } from '../support/fixtures'

test.describe('Header Navigation', () => {
  test('[P0] 15.3-E2E-020 — header navigation is present on all main pages', async ({ page }) => {
    // Given the site has a consistent header across pages
    const pages = ['/', '/sponsors', '/projects', '/events']

    for (const path of pages) {
      // When I navigate to each page
      await page.goto(path)
      await page.waitForLoadState('domcontentloaded')

      // Then the header should be visible
      await expect(
        page.locator('header'),
        `Header should be visible on ${path}`,
      ).toBeVisible()

      // And navigation links should exist within the header
      const navLinks = page.locator('header nav a, header a')
      const count = await navLinks.count()
      expect(count, `Header on ${path} should have navigation links`).toBeGreaterThan(0)
    }
  })

  test('[P0] 15.3-E2E-021 — main nav links return valid responses', async ({ page }) => {
    // Given I am on the homepage
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Then all key routes should return successful responses
    const routes = [
      { path: '/', name: 'Home' },
      { path: '/sponsors', name: 'Sponsors' },
      { path: '/projects', name: 'Projects' },
      { path: '/events', name: 'Events' },
    ]

    for (const { path, name } of routes) {
      // When I navigate to each route
      const response = await page.goto(path)

      // Then it should return a successful response
      expect(response, `${name} page should return a response`).not.toBeNull()
      expect(
        response!.ok(),
        `${name} page (${path}) should return 200-level status (got ${response!.status()})`,
      ).toBe(true)

      // And the page should have basic structure
      await expect(
        page.locator('body'),
        `${name} page body should be visible`,
      ).toBeVisible()
    }
  })
})

test.describe('Footer', () => {
  test('[P0] 15.3-E2E-022 — footer is present on all main pages', async ({ page }) => {
    // Given the site has a consistent footer across pages
    const pages = ['/', '/sponsors', '/projects', '/events']

    for (const path of pages) {
      // When I navigate to each page
      await page.goto(path)
      await page.waitForLoadState('domcontentloaded')

      // Then the footer should be visible
      await expect(
        page.locator('footer'),
        `Footer should be visible on ${path}`,
      ).toBeVisible()
    }
  })
})

test.describe('Breadcrumb Navigation', () => {
  test('[P0] 15.3-E2E-023 — detail pages have correct breadcrumb structure', async ({ page }) => {
    // Given I navigate to a sponsor detail page
    await page.goto('/sponsors')
    await page.waitForLoadState('domcontentloaded')

    const sponsorLink = page.locator('a[href^="/sponsors/"]').first()
    const href = await sponsorLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    // Then breadcrumb should show Home > Sponsors > [Name]
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
    await expect(breadcrumb).toBeVisible()
    await expect(breadcrumb).toContainText('Home')
    await expect(breadcrumb).toContainText('Sponsors')

    // And the Home link should point to /
    const homeLink = breadcrumb.locator('a[href="/"]')
    await expect(homeLink).toBeVisible()

    // And the Sponsors link should point to /sponsors
    const sponsorsLink = breadcrumb.locator('a[href="/sponsors"]')
    await expect(sponsorsLink).toBeVisible()
  })

  test('[P1] 15.3-E2E-024 — breadcrumb Home link navigates to homepage', async ({ page }) => {
    // Given I am on a sponsor detail page
    await page.goto('/sponsors')
    await page.waitForLoadState('domcontentloaded')

    const sponsorLink = page.locator('a[href^="/sponsors/"]').first()
    const href = await sponsorLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    // When I click the Home breadcrumb link
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
    const homeLink = breadcrumb.locator('a[href="/"]')
    await homeLink.click()

    // Then I should be navigated to the homepage
    await expect(page).toHaveURL('/')
  })
})

test.describe('Back Links', () => {
  test('[P0] 15.3-E2E-025 — back links on detail pages navigate to listing pages', async ({
    page,
  }) => {
    // Given detail pages have back links to their listing pages
    const sections = [
      { listing: '/sponsors', linkSelector: 'a[href^="/sponsors/"]', backHref: '/sponsors' },
      { listing: '/projects', linkSelector: 'a[href^="/projects/"]', backHref: '/projects' },
      { listing: '/events', linkSelector: '#events-list a[href^="/events/"]', backHref: '/events' },
    ]

    for (const { listing, linkSelector, backHref } of sections) {
      // When I navigate to a detail page
      await page.goto(listing)
      await page.waitForLoadState('domcontentloaded')

      const detailLink = page.locator(linkSelector).first()
      const href = await detailLink.getAttribute('href')

      if (href) {
        await page.goto(href)
        await page.waitForLoadState('domcontentloaded')

        // Then a back link to the listing page should be visible
        const backLink = page.locator(`a[href="${backHref}"]`).last()
        await expect(
          backLink,
          `Back link to ${backHref} should be visible on ${href}`,
        ).toBeVisible()
      }
    }
  })
})
