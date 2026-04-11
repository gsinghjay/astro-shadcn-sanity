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

    // One of the article slugs the static build emits. If the slug list changes
    // this test can be updated or switched to a fetch-then-pick pattern, but
    // AC #14 only requires "one article detail page".
    await page.goto('/articles/building-ywcc-capstone-rwc-platform')
    await page.waitForLoadState('domcontentloaded')

    await expect(page).toHaveTitle(/.+/)
    await expect(page.locator('h1').first()).toBeVisible()

    // Newsletter CTA marker from Story 19.7 — the article-body variant's form
    // carries data-gtm-label="article-body".
    const cta = page.locator('form[data-gtm-label="article-body"]')
    await expect(cta).toBeVisible()
    await expect(cta.locator('input[type="email"]')).toBeVisible()
    await expect(cta.locator('button[type="submit"]')).toBeVisible()

    // Default heading text from the component ("Stay updated") should be on the page.
    await expect(page.getByText('Stay updated').first()).toBeVisible()

    expect(errors, `Console errors found:\n${errors.join('\n')}`).toHaveLength(0)
  })
})
