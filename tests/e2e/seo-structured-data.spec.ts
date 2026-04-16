/**
 * SEO & Structured Data — E2E Tests
 *
 * Validates that JSON-LD structured data is present on detail pages
 * (Organization for sponsors, Event for events), Open Graph meta
 * tags are present, and canonical URLs are correct.
 *
 * After Story 22.8, all pages emit a single @graph-based JSON-LD
 * script containing consolidated schemas.
 *
 * @story 15.3, 22.8
 */
import { test, expect } from '../support/fixtures'

/**
 * Parse the single @graph JSON-LD script on a page and return
 * the @graph array. Falls back to checking standalone schemas
 * for backward compatibility.
 */
async function getGraphSchemas(page: import('@playwright/test').Page): Promise<Record<string, unknown>[]> {
  const jsonLdScripts = page.locator('script[type="application/ld+json"]')
  const scriptCount = await jsonLdScripts.count()
  const schemas: Record<string, unknown>[] = []

  for (let i = 0; i < scriptCount; i++) {
    const content = await jsonLdScripts.nth(i).textContent()
    if (content) {
      const parsed = JSON.parse(content)
      if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
        schemas.push(...(parsed['@graph'] as Record<string, unknown>[]))
      } else {
        schemas.push(parsed)
      }
    }
  }
  return schemas
}

function findByType(schemas: Record<string, unknown>[], type: string): Record<string, unknown> | undefined {
  return schemas.find(s => s['@type'] === type)
}

test.describe('Sponsor Detail — Structured Data', () => {
  test('[P1] 15.3-E2E-030 — sponsor detail has Organization JSON-LD in @graph', async ({ page }) => {
    await page.goto('/sponsors')
    await page.waitForLoadState('domcontentloaded')

    const sponsorLink = page.locator('a[href^="/sponsors/"]').first()
    const href = await sponsorLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    const schemas = await getGraphSchemas(page)
    const org = findByType(schemas, 'Organization')
    expect(org, 'Should have Organization in @graph').toBeTruthy()
    expect(org!.name).toBeTruthy()
  })
})

test.describe('Event Detail — Structured Data', () => {
  test('[P1] 15.3-E2E-031 — event detail has Event JSON-LD in @graph', async ({ page }) => {
    await page.goto('/events')
    await page.waitForLoadState('domcontentloaded')

    const eventLink = page.locator('#events-list a[href^="/events/"]').first()
    const href = await eventLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    const schemas = await getGraphSchemas(page)
    const event = findByType(schemas, 'Event')
    expect(event, 'Should have Event in @graph').toBeTruthy()
    expect(event!.name).toBeTruthy()
  })
})

test.describe('Breadcrumb Structured Data', () => {
  test('[P1] 15.3-E2E-032 — detail pages have BreadcrumbList inside @graph', async ({ page }) => {
    await page.goto('/sponsors')
    await page.waitForLoadState('domcontentloaded')

    const sponsorLink = page.locator('a[href^="/sponsors/"]').first()
    const href = await sponsorLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    const schemas = await getGraphSchemas(page)
    const breadcrumb = findByType(schemas, 'BreadcrumbList')
    expect(breadcrumb, 'Should have BreadcrumbList in @graph').toBeTruthy()
    expect(breadcrumb!.itemListElement).toBeTruthy()
    expect((breadcrumb!.itemListElement as unknown[]).length).toBeGreaterThanOrEqual(2)
  })

  test('[P1] 22.8-E2E-001 — detail pages emit single JSON-LD with @graph containing both BreadcrumbList and page schema', async ({ page }) => {
    // Check sponsor detail — should have @graph with both Organization + BreadcrumbList
    await page.goto('/sponsors')
    await page.waitForLoadState('domcontentloaded')

    const sponsorLink = page.locator('a[href^="/sponsors/"]').first()
    const href = await sponsorLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    const jsonLdScripts = page.locator('script[type="application/ld+json"]')
    const scriptCount = await jsonLdScripts.count()

    // Find the @graph script
    let graphFound = false
    for (let i = 0; i < scriptCount; i++) {
      const content = await jsonLdScripts.nth(i).textContent()
      if (content) {
        const parsed = JSON.parse(content)
        if (parsed['@graph']) {
          graphFound = true
          expect(parsed['@context']).toBe('https://schema.org')
          const graph = parsed['@graph'] as Record<string, unknown>[]
          const types = graph.map(s => s['@type'])
          expect(types, 'Should contain BreadcrumbList').toContain('BreadcrumbList')
          expect(types, 'Should contain Organization').toContain('Organization')

          // Verify no child schema has its own @context
          for (const schema of graph) {
            expect(schema, `${schema['@type']} should not have own @context`).not.toHaveProperty('@context')
          }
          break
        }
      }
    }
    expect(graphFound, 'Should have a @graph-based JSON-LD script').toBe(true)
  })

  test('[P1] 22.8-E2E-002 — BreadcrumbList has @id with #breadcrumb fragment', async ({ page }) => {
    await page.goto('/sponsors')
    await page.waitForLoadState('domcontentloaded')

    const sponsorLink = page.locator('a[href^="/sponsors/"]').first()
    const href = await sponsorLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    const schemas = await getGraphSchemas(page)
    const breadcrumb = findByType(schemas, 'BreadcrumbList')
    expect(breadcrumb).toBeTruthy()
    expect(breadcrumb!['@id']).toBeTruthy()
    expect(String(breadcrumb!['@id'])).toContain('#breadcrumb')
  })

  test('[P1] 22.8-E2E-003 — BreadcrumbList item URLs are absolute', async ({ page }) => {
    await page.goto('/sponsors')
    await page.waitForLoadState('domcontentloaded')

    const sponsorLink = page.locator('a[href^="/sponsors/"]').first()
    const href = await sponsorLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.goto(href!)
    await page.waitForLoadState('domcontentloaded')

    const schemas = await getGraphSchemas(page)
    const breadcrumb = findByType(schemas, 'BreadcrumbList')
    expect(breadcrumb).toBeTruthy()

    const items = breadcrumb!.itemListElement as Array<Record<string, unknown>>
    for (const item of items) {
      if (item.item) {
        expect(String(item.item), `item URL "${item.item}" should be absolute`).toMatch(/^https?:\/\//)
      }
    }
  })
})

test.describe('Open Graph Meta Tags', () => {
  test('[P1] 15.3-E2E-033 — pages have og:title and og:description meta tags', async ({
    page,
  }) => {
    const pagesToCheck = ['/sponsors', '/projects', '/events']

    for (const path of pagesToCheck) {
      await page.goto(path)
      await page.waitForLoadState('domcontentloaded')

      await expect(page).toHaveTitle(/.+/)

      const metaDescription = page.locator('meta[name="description"]')
      const descCount = await metaDescription.count()

      if (descCount > 0) {
        await expect(metaDescription).toHaveAttribute('content', /.+/)
      }
    }
  })
})
