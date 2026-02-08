/**
 * Story 1-2: Migrate Reference Project — E2E Page Tests
 * Validates all 5 pages render with block content, no broken resources,
 * and pass accessibility audits.
 * @story 1-2
 */
import { test, expect } from '../support/fixtures'
import { expectAccessible } from '../support/helpers/a11y'

const ALL_PAGES = ['/', '/about', '/projects', '/sponsors', '/contact'] as const

test.describe('Story 1-2: Page Rendering', () => {
  test('[P0] 1.2-E2E-001 — all 5 pages return 200 and have content', async ({ page }) => {
    for (const path of ALL_PAGES) {
      const response = await page.goto(path)
      expect(response, `${path} should return a response`).not.toBeNull()
      expect(response!.ok(), `${path} should return 200-level status (got ${response!.status()})`).toBe(true)

      await expect(
        page.locator('body'),
        `${path} body should be visible`,
      ).toBeVisible()

      await expect(
        page.locator('header'),
        `${path} header should be visible`,
      ).toBeVisible()

      await expect(
        page.locator('footer'),
        `${path} footer should be visible`,
      ).toBeVisible()

      const mainContent = page.locator('main')
      const mainExists = (await mainContent.count()) > 0
      if (mainExists) {
        await expect(mainContent, `${path} main should be visible`).toBeVisible()
      } else {
        const bodyText = await page.locator('body').innerText()
        expect(bodyText.trim().length, `${path} body should have text content`).toBeGreaterThan(0)
      }
    }
  })

  test.describe('[P1] 1.2-E2E-002 — each page renders visible block content', () => {
    const pages = [
      { path: '/', name: 'Home', expectedText: 'Industry Capstone' },
      { path: '/about', name: 'About', expectedText: /about|mission|program/i },
      { path: '/projects', name: 'Projects', expectedText: /project|capstone/i },
      { path: '/sponsors', name: 'Sponsors', expectedText: /sponsor|partner/i },
      { path: '/contact', name: 'Contact', expectedText: /contact|form|email/i },
    ] as const

    for (const { path, name, expectedText } of pages) {
      test(`${name} page (${path}) renders expected block content`, async ({ page }) => {
        await page.goto(path)
        await page.waitForLoadState('domcontentloaded')

        if (typeof expectedText === 'string') {
          await expect(
            page.getByText(expectedText, { exact: false }).first(),
            `${name} page should contain "${expectedText}"`,
          ).toBeVisible()
        } else {
          await expect(
            page.getByText(expectedText).first(),
            `${name} page should contain text matching ${expectedText}`,
          ).toBeVisible()
        }
      })
    }
  })

  test.describe('[P1] 1.2-E2E-003 — no console errors on any page', () => {
    for (const path of ALL_PAGES) {
      test(`${path} has no console errors`, async ({ page }) => {
        const errors: string[] = []
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            errors.push(msg.text())
          }
        })

        await page.goto(path)
        await page.waitForLoadState('domcontentloaded')

        expect(
          errors,
          `Console errors found on ${path}:\n${errors.join('\n')}`,
        ).toHaveLength(0)
      })
    }
  })

  test.describe('[P1] 1.2-E2E-004 — accessibility audit on all 5 pages', () => {
    for (const path of ALL_PAGES) {
      test(`${path} passes WCAG 2.1 AA accessibility audit`, async ({ page }) => {
        await page.goto(path)
        await page.waitForLoadState('domcontentloaded')

        await expectAccessible(page)
      })
    }
  })
})
