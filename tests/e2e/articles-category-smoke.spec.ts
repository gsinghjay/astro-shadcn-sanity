import { test, expect } from '../support/fixtures'

// Strip Sanity stega zero-width markers and other invisible Unicode out of
// rendered text so equality comparisons work whether or not visual editing
// is enabled in the build env. Stega encodes metadata as runs of zero-width
// joiner / non-joiner / invisible separator characters that the user never
// sees but `.textContent()` returns verbatim.
function normalizeStega(text: string): string {
  return text.replace(/[\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF]/g, '').trim()
}

// Story 19.10 AC #21 — Playwright smoke for /articles category navigation:
//   - /articles renders the chip row
//   - clicking a category chip routes to /articles/category/<slug>
//   - the category page header H1 == category title
//   - the "All" chip on a category page links back to /articles
//   - empty category renders empty-state copy with HTTP 200 (NOT a 404)
//
// Tests rely on real Sanity content available at build time. They discover
// the first available category chip from /articles rather than hard-coding a
// slug — keeps the spec resilient to dataset/site changes.

test.describe('Articles category navigation — Story 19.10', () => {
  test('[P0] 19-10-E2E-001 — /articles renders the category chip row with an "All" chip', async ({ page }) => {
    await page.goto('/articles')
    await page.waitForLoadState('domcontentloaded')

    const chipNav = page.getByRole('navigation', { name: 'Article categories' })
    await expect(chipNav).toBeVisible()

    const allChip = chipNav.getByRole('link', { name: 'All', exact: true })
    await expect(allChip).toBeVisible()
    await expect(allChip).toHaveAttribute('href', '/articles')
  })

  test('[P0] 19-10-E2E-002 — clicking a category chip navigates to /articles/category/<slug> and renders the category H1', async ({ page }) => {
    await page.goto('/articles')
    await page.waitForLoadState('domcontentloaded')

    // Find the first category chip (anything inside the chip nav whose href
    // starts with /articles/category/). Skips the "All" chip which targets
    // /articles directly.
    const chipNav = page.getByRole('navigation', { name: 'Article categories' })
    const firstCategoryChip = chipNav.locator('a[href^="/articles/category/"]').first()
    await expect(firstCategoryChip, 'no category chip rendered on /articles — does the dataset have any categories?').toBeVisible()

    const targetHref = await firstCategoryChip.getAttribute('href')
    const expectedTitle = normalizeStega((await firstCategoryChip.textContent()) ?? '')
    expect(targetHref).toBeTruthy()
    expect(expectedTitle.length).toBeGreaterThan(0)

    await firstCategoryChip.click()
    await page.waitForLoadState('domcontentloaded')

    expect(page.url()).toContain(targetHref!)

    // The H1 must equal the chip's category title (AC #7.3). Normalize stega
    // markers from both sides — visual editing builds embed zero-width chars
    // in rendered text that .textContent() returns verbatim.
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
    const headingText = normalizeStega((await heading.textContent()) ?? '')
    expect(headingText).toBe(expectedTitle)
  })

  test('[P0] 19-10-E2E-003 — the "All" chip on a category page navigates back to /articles', async ({ page }) => {
    // Discover a category page via the listing chip row.
    await page.goto('/articles')
    await page.waitForLoadState('domcontentloaded')
    const firstCategoryHref = await page
      .getByRole('navigation', { name: 'Article categories' })
      .locator('a[href^="/articles/category/"]')
      .first()
      .getAttribute('href')
    expect(firstCategoryHref, 'no category chip rendered on /articles').toBeTruthy()

    await page.goto(firstCategoryHref!)
    await page.waitForLoadState('domcontentloaded')

    // The chip row exists on the category page too, with an "All" chip
    // routing back to /articles.
    const allChip = page
      .getByRole('navigation', { name: 'Article categories' })
      .getByRole('link', { name: 'All', exact: true })
    await expect(allChip).toBeVisible()
    await expect(allChip).toHaveAttribute('href', '/articles')

    await allChip.click()
    await page.waitForLoadState('domcontentloaded')
    // Wrangler's static handler may serve `/articles/` (trailing slash) for
    // the index file. Accept both shapes — the user-facing route is the same.
    expect(new URL(page.url()).pathname).toMatch(/^\/articles\/?$/)
  })

  test('[P1] 19-10-E2E-004 — every category archive returns HTTP 200 and a category page with empty state OR articles', async ({ page, request }) => {
    // Discover all category hrefs from the listing page.
    await page.goto('/articles')
    await page.waitForLoadState('domcontentloaded')
    const categoryLinks = await page
      .getByRole('navigation', { name: 'Article categories' })
      .locator('a[href^="/articles/category/"]')
      .all()

    expect(categoryLinks.length, 'expected at least one category chip on /articles').toBeGreaterThan(0)

    // Walk every category — assert 200 and either an empty-state paragraph
    // or at least one article card. AC #9 says zero-article categories
    // render the empty state, NOT a 404.
    for (const link of categoryLinks) {
      const href = await link.getAttribute('href')
      expect(href).toBeTruthy()

      const response = await request.get(href!)
      expect(response.status(), `category page ${href} should return HTTP 200, got ${response.status()}`).toBe(200)

      await page.goto(href!)
      await page.waitForLoadState('domcontentloaded')

      // The page must render the H1 + chip row regardless of whether the
      // category has any articles assigned.
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.getByRole('navigation', { name: 'Article categories' })).toBeVisible()

      const articleCards = page.locator('article')
      const emptyState = page.getByText('No articles in this category yet.', { exact: true })

      // Either we see at least one article card or the empty-state copy.
      const cardCount = await articleCards.count()
      if (cardCount === 0) {
        await expect(emptyState).toBeVisible()
      }
    }
  })
})
