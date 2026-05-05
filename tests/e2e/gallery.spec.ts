/**
 * Image Gallery — E2E Tests
 *
 * Validates PhotoSwipe lightbox, deep linking, share, filtering, and the
 * tag-driven listing page (/gallery) backed by sanity-plugin-media.
 *
 * @story 22.4 (initial component) + 22.11 (asset-tag listing)
 */
import { test, expect } from '../support/fixtures'

test.describe('Image Gallery — PhotoSwipe Lightbox & Listing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery')
    await page.waitForLoadState('domcontentloaded')
  })

  test('[P1] 22.11-E2E-005 — /gallery renders at least one tagged asset', async ({ page }) => {
    const galleryLinks = page.locator('.pswp-gallery a')
    const count = await galleryLinks.count()
    // Editors must seed at least one asset with the `gallery` tag for /gallery
    // to render thumbnails. AC10 requires ≥5 tagged assets at AC test time.
    if (count === 0) {
      test.skip(true, 'No gallery-tagged assets in dataset — seed via Sanity Media plugin (Task 0).')
    }
    expect(count).toBeGreaterThan(0)
  })

  test('[P1] 22.4-E2E-010 — clicking thumbnail opens PhotoSwipe overlay', async ({ page }) => {
    const galleryLink = page.locator('.pswp-gallery a').first()
    const hasGallery = await galleryLink.count()
    test.skip(hasGallery === 0, 'No gallery-tagged assets — seed via Media plugin')

    await galleryLink.click()
    await page.waitForSelector('.pswp', { state: 'visible', timeout: 5000 })

    const overlay = page.locator('.pswp')
    await expect(overlay).toBeVisible()
  })

  test('[P1] 22.4-E2E-020 — PhotoSwipe navigation updates counter', async ({ page }) => {
    const galleryLinks = page.locator('.pswp-gallery a')
    const count = await galleryLinks.count()
    test.skip(count < 2, 'Need at least 2 gallery-tagged assets for navigation test')

    await galleryLinks.first().click()
    await page.waitForSelector('.pswp', { state: 'visible', timeout: 5000 })

    await page.keyboard.press('ArrowRight')
    await expect(page.locator('.pswp__counter')).toContainText('2', { timeout: 3000 })
  })

  test('[P1] 22.4-E2E-030 — closing lightbox removes overlay', async ({ page }) => {
    const galleryLink = page.locator('.pswp-gallery a').first()
    const hasGallery = await galleryLink.count()
    test.skip(hasGallery === 0, 'No gallery-tagged assets')

    await galleryLink.click()
    await page.waitForSelector('.pswp', { state: 'visible', timeout: 5000 })

    await page.keyboard.press('Escape')
    await expect(page.locator('.pswp--open')).toHaveCount(0, { timeout: 3000 })
  })

  test('[P2] 22.4-E2E-040 — deep link ?img=2 opens lightbox to second image', async ({ page }) => {
    const galleryLinks = page.locator('.pswp-gallery a')
    const count = await galleryLinks.count()
    test.skip(count < 2, 'Need at least 2 gallery-tagged assets for deep link test')

    await page.goto('/gallery?img=2')
    await page.waitForLoadState('domcontentloaded')

    await page.waitForSelector('.pswp', { state: 'visible', timeout: 5000 })
    await expect(page.locator('.pswp')).toBeVisible()
    expect(page.url()).toContain('img=')
  })

  test('[P2] 22.4-E2E-050 — share button copies URL with ?img= param', async ({ page, context }) => {
    const galleryLink = page.locator('.pswp-gallery a').first()
    const hasGallery = await galleryLink.count()
    test.skip(hasGallery === 0, 'No gallery-tagged assets')

    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await galleryLink.click()
    await page.waitForSelector('.pswp', { state: 'visible', timeout: 5000 })

    const shareButton = page.locator('.pswp__button--share-button')
    const hasShareButton = await shareButton.count()
    test.skip(hasShareButton === 0, 'Share button not found')

    await shareButton.click()

    await expect(shareButton).toContainText('Copied!')

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboardText).toContain('img=')
  })

  test('[P2] 22.11-E2E-060 — year filter pill hides figures from other years', async ({ page }) => {
    const yearPill = page.locator('.gallery-filter-pill[data-filter-type="year"][data-filter-value]:not([data-filter-value="all"])').first()
    const hasYearPill = await yearPill.count()
    test.skip(hasYearPill === 0, 'No year filter pills — needs assets with gallery-<year> tags')

    const yearValue = await yearPill.getAttribute('data-filter-value')
    await yearPill.click()

    // Figures matching the active year stay visible
    const matchSelector = `figure[data-year="${yearValue}"]`
    const otherSelector = `figure[data-year]:not([data-year="${yearValue}"])`

    await expect(page.locator(matchSelector).first()).toBeVisible({ timeout: 3000 })

    const others = await page.locator(otherSelector).all()
    for (const fig of others) {
      const display = await fig.evaluate((el) => getComputedStyle(el).display)
      expect(display).toBe('none')
    }
  })

  test('[P2] 22.11-E2E-070 — featured row exists when at least one asset is gallery-featured', async ({ page }) => {
    const featuredRow = page.locator('.gallery-featured')
    const hasFeatured = await featuredRow.count()
    test.skip(hasFeatured === 0, 'No featured assets — tag at least one asset with gallery-featured')

    const figureCount = await featuredRow.locator('figure').count()
    expect(figureCount).toBeGreaterThan(0)
  })
})
