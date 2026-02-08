import { test, expect } from '../support/fixtures'
import { expectAccessible } from '../support/helpers/a11y'

test.describe('Homepage Smoke Tests', () => {
  test('[P0] 0.0-E2E-001 — should load the homepage', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/.+/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('[P0] 0.0-E2E-002 — should have no accessibility violations', async ({ page }) => {
    await page.goto('/')

    await expectAccessible(page)
  })

  test('[P1] 0.0-E2E-003 — should have valid meta tags for SEO', async ({ page }) => {
    await page.goto('/')

    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)

    const viewport = page.locator('meta[name="viewport"]')
    await expect(viewport).toHaveAttribute('content', /width=device-width/)
  })
})

test.describe('Navigation', () => {
  test('[P0] 0.0-E2E-004 — should render header and footer', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })

  test('[P1] 0.0-E2E-005 — should have working navigation links', async ({ page }) => {
    await page.goto('/')

    const navLinks = page.locator('header nav a, header a')
    const count = await navLinks.count()

    expect(count).toBeGreaterThan(0)

    // Verify first nav link is navigable
    const firstLink = navLinks.first()
    const href = await firstLink.getAttribute('href')
    expect(href).toBeTruthy()
  })
})

test.describe('Performance Baseline', () => {
  test('[P0] 0.0-E2E-006 — should load without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    expect(errors, `Console errors found:\n${errors.join('\n')}`).toHaveLength(0)
  })

  test('[P1] 0.0-E2E-007 — should load within performance budget', async ({ page }) => {
    const start = Date.now()
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const loadTime = Date.now() - start

    // SSG pages should load fast — 5s budget is generous
    expect(loadTime).toBeLessThan(5_000)
  })
})
