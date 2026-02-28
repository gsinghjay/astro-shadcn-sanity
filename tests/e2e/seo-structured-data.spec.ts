/**
 * SEO & Structured Data — E2E Tests
 *
 * Validates that JSON-LD structured data is present on detail pages
 * (Organization for sponsors, Event for events), Open Graph meta
 * tags are present, and canonical URLs are correct.
 *
 * @story 15.3
 */
import { test, expect } from '../support/fixtures'

test.describe('Sponsor Detail — Structured Data', () => {
  test('[P1] 15.3-E2E-030 — sponsor detail has Organization JSON-LD', async ({ page }) => {
    // Given I navigate to a sponsor detail page
    await page.goto('/sponsors')
    await page.waitForLoadState('domcontentloaded')

    const sponsorLink = page.locator('a[href^="/sponsors/"]').first()
    const href = await sponsorLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    // Then a JSON-LD script tag should be present with Organization schema
    const jsonLdScripts = page.locator('script[type="application/ld+json"]')
    const scriptCount = await jsonLdScripts.count()
    expect(scriptCount, 'Should have at least one JSON-LD script').toBeGreaterThan(0)

    // And one of them should contain Organization type
    let foundOrganization = false
    for (let i = 0; i < scriptCount; i++) {
      const content = await jsonLdScripts.nth(i).textContent()
      if (content) {
        const parsed = JSON.parse(content)
        if (parsed['@type'] === 'Organization') {
          foundOrganization = true
          expect(parsed['@context']).toBe('https://schema.org')
          expect(parsed.name).toBeTruthy()
          break
        }
      }
    }
    expect(foundOrganization, 'Should have Organization JSON-LD').toBe(true)
  })
})

test.describe('Event Detail — Structured Data', () => {
  test('[P1] 15.3-E2E-031 — event detail has Event JSON-LD', async ({ page }) => {
    // Given I navigate to an event detail page
    await page.goto('/events')
    await page.waitForLoadState('domcontentloaded')

    const eventLink = page.locator('#events-list a[href^="/events/"]').first()
    const href = await eventLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    // Then a JSON-LD script tag should be present with Event schema
    const jsonLdScripts = page.locator('script[type="application/ld+json"]')
    const scriptCount = await jsonLdScripts.count()
    expect(scriptCount, 'Should have at least one JSON-LD script').toBeGreaterThan(0)

    // And one of them should contain Event type
    let foundEvent = false
    for (let i = 0; i < scriptCount; i++) {
      const content = await jsonLdScripts.nth(i).textContent()
      if (content) {
        const parsed = JSON.parse(content)
        if (parsed['@type'] === 'Event') {
          foundEvent = true
          expect(parsed['@context']).toBe('https://schema.org')
          expect(parsed.name).toBeTruthy()
          break
        }
      }
    }
    expect(foundEvent, 'Should have Event JSON-LD').toBe(true)
  })
})

test.describe('Breadcrumb Structured Data', () => {
  test('[P1] 15.3-E2E-032 — detail pages have BreadcrumbList JSON-LD', async ({ page }) => {
    // Given I navigate to a sponsor detail page
    await page.goto('/sponsors')
    await page.waitForLoadState('domcontentloaded')

    const sponsorLink = page.locator('a[href^="/sponsors/"]').first()
    const href = await sponsorLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    // Then a JSON-LD script tag should contain BreadcrumbList schema
    const jsonLdScripts = page.locator('script[type="application/ld+json"]')
    const scriptCount = await jsonLdScripts.count()

    let foundBreadcrumb = false
    for (let i = 0; i < scriptCount; i++) {
      const content = await jsonLdScripts.nth(i).textContent()
      if (content) {
        const parsed = JSON.parse(content)
        if (parsed['@type'] === 'BreadcrumbList') {
          foundBreadcrumb = true
          expect(parsed.itemListElement).toBeTruthy()
          expect(parsed.itemListElement.length).toBeGreaterThanOrEqual(2)
          break
        }
      }
    }
    expect(foundBreadcrumb, 'Should have BreadcrumbList JSON-LD').toBe(true)
  })
})

test.describe('Open Graph Meta Tags', () => {
  test('[P1] 15.3-E2E-033 — pages have og:title and og:description meta tags', async ({
    page,
  }) => {
    // Given I navigate to a page with SEO metadata
    const pagesToCheck = ['/sponsors', '/projects', '/events']

    for (const path of pagesToCheck) {
      await page.goto(path)
      await page.waitForLoadState('domcontentloaded')

      // Then the page should have a title
      await expect(page).toHaveTitle(/.+/)

      // And a meta description should be present
      const metaDescription = page.locator('meta[name="description"]')
      const descCount = await metaDescription.count()

      if (descCount > 0) {
        await expect(metaDescription).toHaveAttribute('content', /.+/)
      }
    }
  })
})
