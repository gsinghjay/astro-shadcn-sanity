/**
 * Story 2.2: Homepage GROQ Queries & Data Fetching — E2E Tests (RED PHASE)
 *
 * Validates that the homepage renders CMS-driven content from Sanity
 * instead of placeholder data, and that other pages remain unaffected.
 *
 * All tests are skipped (TDD red phase) — they document expected behavior
 * for a feature that has not been implemented yet.
 *
 * @story 2.2
 * @acceptance-criteria AC3, AC5, AC7, AC9
 */
import { test, expect } from '../support/fixtures'
import { expectAccessible } from '../support/helpers/a11y'

test.describe('Story 2.2: Homepage Sanity Data Fetching', () => {
  test.describe('AC3 + AC7: Homepage renders Sanity content', () => {
    test('[P0] 2.2-E2E-001 — homepage renders content from Sanity (not placeholder)', async ({
      page,
    }) => {
      // Given the homepage has been wired to fetch from Sanity
      // When I navigate to the homepage
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Then it should NOT contain the placeholder lorem ipsum headline
      const bodyText = await page.locator('body').innerText()
      expect(
        bodyText,
        'Homepage should not contain placeholder lorem ipsum headline',
      ).not.toContain('Lorem Ipsum Dolor Sit Amet')

      // And it should render real Sanity content
      // The hero section should have a visible heading from the Sanity `heading` field
      const heroHeading = page.locator('h1').first()
      await expect(
        heroHeading,
        'Homepage should have a visible h1 heading from Sanity content',
      ).toBeVisible()

      // And the heading text should NOT be the placeholder text
      const headingText = await heroHeading.innerText()
      expect(
        headingText,
        'Hero heading should not be the placeholder "Lorem Ipsum Dolor Sit Amet"',
      ).not.toBe('Lorem Ipsum Dolor Sit Amet')

      // And the main content area should have block sections rendered
      const mainContent = page.locator('main')
      await expect(mainContent, 'Main content area should be visible').toBeVisible()

      const sections = mainContent.locator('section')
      const sectionCount = await sections.count()
      expect(
        sectionCount,
        'Homepage should have multiple block sections rendered from Sanity',
      ).toBeGreaterThanOrEqual(3)
    })
  })

  test.describe('AC5: Block components accept Sanity field names', () => {
    test('[P0] 2.2-E2E-002 — HeroBanner block renders with Sanity field structure', async ({
      page,
    }) => {
      // Given the HeroBanner component has been updated to accept Sanity field names
      // (heading instead of headline, subheading instead of subheadline,
      //  ctaButtons[] instead of ctaText/ctaUrl)
      // When I navigate to the homepage
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Then a hero section should exist with a visible heading
      const heroSection = page.locator('section').first()
      await expect(heroSection, 'Hero section should be visible').toBeVisible()

      const heroHeading = heroSection.locator('h1')
      await expect(
        heroHeading,
        'Hero section should contain a visible h1 heading from Sanity `heading` field',
      ).toBeVisible()

      // And a subheading should be visible (from Sanity `subheading` field)
      const heroParagraph = heroSection.locator('p').first()
      await expect(
        heroParagraph,
        'Hero section should contain a visible subheading paragraph',
      ).toBeVisible()

      // And CTA button(s) should be rendered from Sanity `ctaButtons[]` array
      const ctaButtons = heroSection.getByRole('link').filter({ hasText: /.+/ })
      const ctaCount = await ctaButtons.count()
      expect(
        ctaCount,
        'Hero section should have at least one CTA button rendered from ctaButtons array',
      ).toBeGreaterThanOrEqual(1)

      // And the CTA should have non-empty text from the Sanity button object
      const firstCtaText = await ctaButtons.first().innerText()
      expect(
        firstCtaText.length,
        'CTA button should have non-empty text from Sanity button object',
      ).toBeGreaterThan(0)
    })

    test('[P0] 2.2-E2E-003 — multiple block types render on homepage', async ({ page }) => {
      // Given all homepage block components have been updated to accept Sanity field names
      // When I navigate to the homepage
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      const mainContent = page.locator('main')

      // Then at least 3 distinct block sections should be visible
      const sections = mainContent.locator('section')
      const sectionCount = await sections.count()
      expect(
        sectionCount,
        'Homepage should render at least 3 distinct block sections from Sanity',
      ).toBeGreaterThanOrEqual(3)

      // And h2 headings should be present (from FeatureGrid, CtaBanner, or TextWithImage)
      // Sanity blocks use `heading` field which renders as h2
      const h2Headings = mainContent.locator('h2')
      const h2Count = await h2Headings.count()
      expect(
        h2Count,
        'Homepage should have at least one h2 heading from Sanity block content',
      ).toBeGreaterThanOrEqual(1)

      // And the page should pass accessibility checks after Sanity migration
      await expectAccessible(page)
    })
  })

  test.describe('AC7: Homepage renders correctly from Sanity content', () => {
    test('[P0] 2.2-E2E-004 — homepage has no console errors after Sanity migration', async ({
      page,
    }) => {
      // Given the homepage fetches from Sanity and components accept Sanity field names
      const errors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })

      // When I navigate to the homepage
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Then there should be zero console errors
      // This validates Sanity data shape is compatible with components
      expect(
        errors,
        `Console errors found after Sanity migration:\n${errors.join('\n')}`,
      ).toHaveLength(0)

      // And the page structure should be intact
      await expect(page.locator('header'), 'Header should be visible').toBeVisible()
      await expect(page.locator('main'), 'Main content should be visible').toBeVisible()
      await expect(page.locator('footer'), 'Footer should be visible').toBeVisible()
    })
  })

  test.describe('AC9: Other pages unaffected (regression)', () => {
    test('[P0] 2.2-E2E-005 — other pages still render correctly after homepage migration', async ({
      page,
    }) => {
      // Given only the homepage has been migrated to Sanity
      // And other pages still use placeholder data from lib/data/
      const otherPages = [
        { path: '/about', name: 'About', expectedPattern: /about|mission|program/i },
        { path: '/projects', name: 'Projects', expectedPattern: /project|capstone/i },
        { path: '/sponsors', name: 'Sponsors', expectedPattern: /sponsor|partner/i },
        { path: '/contact', name: 'Contact', expectedPattern: /contact|form|email/i },
      ] as const

      for (const { path, name, expectedPattern } of otherPages) {
        // When I navigate to each non-homepage page
        const response = await page.goto(path)

        // Then the page should return a 200-level status
        expect(
          response,
          `${name} page (${path}) should return a response`,
        ).not.toBeNull()
        expect(
          response!.ok(),
          `${name} page (${path}) should return 200-level status (got ${response!.status()})`,
        ).toBe(true)

        // And the page should have visible content
        await expect(
          page.locator('body'),
          `${name} page body should be visible`,
        ).toBeVisible()

        await expect(
          page.locator('header'),
          `${name} page header should be visible`,
        ).toBeVisible()

        await expect(
          page.locator('footer'),
          `${name} page footer should be visible`,
        ).toBeVisible()

        // And the page should render expected block content from placeholder data
        await expect(
          page.getByText(expectedPattern).first(),
          `${name} page should contain text matching ${expectedPattern}`,
        ).toBeVisible()
      }
    })
  })
})
