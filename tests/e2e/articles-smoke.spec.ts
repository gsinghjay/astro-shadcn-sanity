import { test, expect } from '../support/fixtures'

// Story 19.7 AC #14 — chromium smoke for /articles listing and one /articles/[slug]
// detail page. Validates build + page load + no console errors + presence of the
// newsletter CTA markup on the detail page (static component from Story 19.7).

test.describe('Articles smoke — Story 19.7 CTA integration', () => {
  test('[P0] 19-7-E2E-001 — /articles listing loads without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/articles')
    await page.waitForLoadState('domcontentloaded')

    await expect(page).toHaveTitle(/.+/)
    await expect(page.locator('body')).toBeVisible()
    expect(errors, `Console errors found:\n${errors.join('\n')}`).toHaveLength(0)
  })

  test('[P0] 19-7-E2E-002 — article detail page loads and renders the newsletter CTA', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    // Fetch the first article href from the listing page rather than hard-coding
    // a slug — keeps the test resilient to dataset changes (slug renames,
    // unpublished articles, multi-site filtering). AC #14 only requires "one
    // article detail page", and "the first one we find" is good enough.
    //
    // Story 19.10 added a category chip nav that also emits `/articles/...`
    // links, so scope the locator to anchors INSIDE an `<article>` (the
    // ArticleCard's root element) and exclude the `/articles/category/...`
    // chip path defensively.
    await page.goto('/articles')
    await page.waitForLoadState('domcontentloaded')
    const firstArticleHref = await page
      .locator('article a[href^="/articles/"]:not([href*="/articles/category/"])')
      .first()
      .getAttribute('href')
    expect(firstArticleHref, 'no /articles/<slug> link found on /articles listing').toBeTruthy()

    await page.goto(firstArticleHref!)
    await page.waitForLoadState('domcontentloaded')

    await expect(page).toHaveTitle(/.+/)
    await expect(page.locator('h1').first()).toBeVisible()

    // Newsletter CTA marker from Story 19.7 — the article-body variant's form
    // carries data-gtm-label="article-body".
    const cta = page.locator('form[data-gtm-label="article-body"]')
    await expect(cta).toBeVisible()
    await expect(cta.locator('input[type="email"]')).toBeVisible()
    await expect(cta.locator('button[type="submit"]')).toBeVisible()

    // Assert the heading via role + exact text — `getByText` is a substring
    // match and could match unrelated content elsewhere on the page (false
    // positive). `getByRole('heading', ...)` requires an actual <h1-h6>, and
    // `exact: true` rules out substring collisions.
    await expect(page.getByRole('heading', { name: 'Stay updated', exact: true })).toBeVisible()

    expect(errors, `Console errors found:\n${errors.join('\n')}`).toHaveLength(0)
  })
})
