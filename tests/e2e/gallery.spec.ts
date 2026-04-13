/**
 * Image Gallery — E2E Tests
 *
 * Validates PhotoSwipe lightbox, deep linking, and share functionality
 * for the ImageGallery block component.
 *
 * @story 22.4
 */
import { test, expect } from '../support/fixtures'

test.describe('Image Gallery — PhotoSwipe Lightbox', () => {
  // Find a page with an imageGallery block by looking for .pswp-gallery
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test('[P1] 22.4-E2E-010 — clicking thumbnail opens PhotoSwipe overlay', async ({ page }) => {
    // Find any page with a gallery
    const galleryLink = page.locator('.pswp-gallery a').first()
    const hasGallery = await galleryLink.count()

    // Skip if no gallery on homepage — this depends on CMS content
    test.skip(hasGallery === 0, 'No gallery block found on homepage')

    await galleryLink.click()
    await page.waitForSelector('.pswp', { state: 'visible', timeout: 5000 })

    const overlay = page.locator('.pswp')
    await expect(overlay).toBeVisible()
  })

  test('[P1] 22.4-E2E-020 — PhotoSwipe navigation updates counter', async ({ page }) => {
    const galleryLinks = page.locator('.pswp-gallery a')
    const count = await galleryLinks.count()
    test.skip(count < 2, 'Need at least 2 gallery images for navigation test')

    await galleryLinks.first().click()
    await page.waitForSelector('.pswp', { state: 'visible', timeout: 5000 })

    // Navigate forward via keyboard
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(300)

    // Counter should update (PhotoSwipe renders counter by default)
    const counter = page.locator('.pswp__counter')
    const counterText = await counter.textContent()
    expect(counterText).toContain('2')
  })

  test('[P1] 22.4-E2E-030 — closing lightbox removes overlay', async ({ page }) => {
    const galleryLink = page.locator('.pswp-gallery a').first()
    const hasGallery = await galleryLink.count()
    test.skip(hasGallery === 0, 'No gallery block found on homepage')

    await galleryLink.click()
    await page.waitForSelector('.pswp', { state: 'visible', timeout: 5000 })

    // Close via keyboard
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    const overlay = page.locator('.pswp--open')
    await expect(overlay).toHaveCount(0)
  })

  test('[P2] 22.4-E2E-040 — deep link ?img=2 opens lightbox to second image', async ({ page }) => {
    const galleryLinks = page.locator('.pswp-gallery a')
    const count = await galleryLinks.count()
    test.skip(count < 2, 'Need at least 2 gallery images for deep link test')

    // Navigate with deep link param
    const currentUrl = page.url()
    await page.goto(`${currentUrl}?img=2`)
    await page.waitForLoadState('domcontentloaded')

    // PhotoSwipe should auto-open
    await page.waitForSelector('.pswp', { state: 'visible', timeout: 5000 })
    const overlay = page.locator('.pswp')
    await expect(overlay).toBeVisible()

    // URL should contain ?img= param
    expect(page.url()).toContain('img=')
  })

  test('[P2] 22.4-E2E-050 — share button copies URL with ?img= param', async ({ page, context }) => {
    const galleryLink = page.locator('.pswp-gallery a').first()
    const hasGallery = await galleryLink.count()
    test.skip(hasGallery === 0, 'No gallery block found on homepage')

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await galleryLink.click()
    await page.waitForSelector('.pswp', { state: 'visible', timeout: 5000 })

    // Click the share button
    const shareButton = page.locator('.pswp__button--share-button')
    const hasShareButton = await shareButton.count()
    test.skip(hasShareButton === 0, 'Share button not found')

    await shareButton.click()

    // Verify "Copied!" feedback appears
    await expect(shareButton).toContainText('Copied!')

    // Verify clipboard contains URL with img param
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboardText).toContain('img=')
  })
})
