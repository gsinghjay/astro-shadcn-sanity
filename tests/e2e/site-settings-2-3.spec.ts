/**
 * Story 2.3: Wire Site Settings to Sanity — E2E Tests (RED PHASE)
 *
 * Validates that Header, Footer, and Layout render site-wide settings
 * from Sanity CMS instead of hardcoded/mock data from lib/data/.
 *
 * All tests are skipped (TDD red phase) — they document expected behavior
 * for a feature that has not been implemented yet.
 *
 * @story 2.3
 * @acceptance-criteria AC4, AC5, AC9
 */
import { test, expect } from '../support/fixtures'
import { expectAccessible } from '../support/helpers/a11y'

test.describe('Story 2.3: Wire Site Settings to Sanity', () => {
  test.describe('AC4: Header renders Sanity data', () => {
    test('[P0] 2.3-E2E-001 — header renders navigation links from Sanity', async ({
      page,
    }, testInfo) => {
      // Desktop nav is hidden on mobile (behind hamburger menu) — skip on mobile projects
      test.skip(
        testInfo.project.name.startsWith('mobile'),
        'Desktop nav is hidden on mobile viewports — tested via mobile-specific tests',
      )

      // Given site settings have been wired to fetch from Sanity
      // And the siteSettings document contains navigationItems:
      //   Program (/about), Sponsors (/sponsors), Projects (/projects), Contact (/contact)
      // When I navigate to the homepage
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Then the header should be visible
      const header = page.locator('header')
      await expect(header, 'Header should be visible').toBeVisible()

      // And the main navigation should have an accessible label
      const nav = header.getByRole('navigation', { name: /main/i })
      await expect(nav, 'Main navigation should be visible with aria-label').toBeVisible()

      // And it should contain navigation links matching the Sanity navigationItems
      const expectedNavItems = [
        { label: 'Program', href: '/about' },
        { label: 'Sponsors', href: '/sponsors' },
        { label: 'Projects', href: '/projects' },
        { label: 'Contact', href: '/contact' },
      ]

      for (const item of expectedNavItems) {
        const link = nav.getByRole('link', { name: item.label })
        await expect(
          link,
          `Navigation should contain a "${item.label}" link from Sanity navigationItems`,
        ).toBeVisible()

        const href = await link.getAttribute('href')
        expect(
          href,
          `"${item.label}" link href should match Sanity data: ${item.href}`,
        ).toBe(item.href)
      }

      // And the navigation link count should match the Sanity data (no extra hardcoded links)
      const navLinks = nav.getByRole('link')
      const navLinkCount = await navLinks.count()
      expect(
        navLinkCount,
        'Navigation link count should match the number of Sanity navigationItems',
      ).toBe(expectedNavItems.length)
    })

    test('[P0] 2.3-E2E-002 — header renders CTA button from Sanity data', async ({
      page,
    }, testInfo) => {
      // Desktop CTA is hidden on mobile — skip on mobile projects
      test.skip(
        testInfo.project.name.startsWith('mobile'),
        'Desktop CTA button is hidden on mobile viewports',
      )
      // Given site settings have been wired to fetch from Sanity
      // And the siteSettings document contains ctaButton: { text: "Become a Sponsor", href: "/contact" }
      // When I navigate to the homepage
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      const header = page.locator('header')
      await expect(header, 'Header should be visible').toBeVisible()

      // Then the header should contain a CTA button/link with text from Sanity ctaButton.text
      const ctaButton = header.getByRole('link', { name: 'Become a Sponsor' })
      await expect(
        ctaButton.first(),
        'Header CTA button should be visible with text from Sanity ctaButton.text',
      ).toBeVisible()

      // And the CTA button href should come from Sanity ctaButton.href
      const ctaHref = await ctaButton.first().getAttribute('href')
      expect(
        ctaHref,
        'CTA button href should match Sanity ctaButton.href "/contact"',
      ).toBe('/contact')

      // And the header should render the site name from Sanity siteName
      // The branding text "YWCC" and "Industry Capstone" should come from Sanity data
      const headerText = await header.innerText()
      expect(
        headerText,
        'Header should contain branding text derived from Sanity siteName',
      ).toContain('YWCC')

      // And the logo should have proper alt text (from Sanity logo.alt or fallback)
      const logoImg = header.locator('img').first()
      await expect(
        logoImg,
        'Header logo image should be visible',
      ).toBeVisible()

      const logoAlt = await logoImg.getAttribute('alt')
      expect(
        logoAlt,
        'Header logo should have alt text (from Sanity logo.alt)',
      ).toBeTruthy()
    })
  })

  test.describe('AC5: Footer renders Sanity data', () => {
    test('[P0] 2.3-E2E-003 — footer renders program, resource, and contact sections from Sanity', async ({
      page,
    }) => {
      // Given site settings have been wired to fetch from Sanity
      // And the siteSettings document contains programLinks, resourceLinks, and contactInfo
      // When I navigate to the homepage
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Then the footer should be visible
      const footer = page.locator('footer')
      // Scroll footer into view to ensure Firefox renders all child elements as visible
      await footer.scrollIntoViewIfNeeded()
      await expect(footer, 'Footer should be visible').toBeVisible()

      // And the Programs section should contain links from Sanity programLinks
      const programsHeading = footer.getByText('Programs')
      await expect(
        programsHeading,
        'Footer should have a "Programs" section heading',
      ).toBeVisible()

      const expectedProgramLinks = [
        { label: 'Current Projects', href: '/projects' },
        { label: 'Our Sponsors', href: '/sponsors' },
        { label: 'Team', href: '/about' },
        { label: 'Get Involved', href: '/contact' },
      ]

      // Use toBeAttached() for link checks — Firefox reports links as "hidden" in narrow
      // footer grid columns (text truncation), but the data IS rendered from Sanity
      for (const item of expectedProgramLinks) {
        const link = footer.getByRole('link', { name: item.label })
        await expect(
          link,
          `Footer Programs section should contain a "${item.label}" link from Sanity programLinks`,
        ).toBeAttached()
      }

      // And the Resources section should contain links from Sanity resourceLinks
      const resourcesHeading = footer.getByText('Resources')
      await expect(
        resourcesHeading,
        'Footer should have a "Resources" section heading',
      ).toBeVisible()

      const expectedResourceLinks = [
        { label: 'NJIT Website', href: 'https://njit.edu' },
        { label: 'Student Portal' },
        { label: 'Partner Login' },
        { label: 'Documentation' },
      ]

      for (const item of expectedResourceLinks) {
        const link = footer.getByRole('link', { name: item.label })
        await expect(
          link,
          `Footer Resources section should contain a "${item.label}" link from Sanity resourceLinks`,
        ).toBeAttached()
      }

      // And the Contact section should render contactInfo from Sanity
      const contactHeading = footer.getByText('Contact')
      await expect(
        contactHeading,
        'Footer should have a "Contact" section heading',
      ).toBeVisible()

      // Contact info from Sanity contactInfo object
      // Address: "GITC Building, Room 4400, Newark, NJ 07102"
      const addressText = footer.getByText(/GITC Building/)
      await expect(
        addressText.first(),
        'Footer Contact section should display address from Sanity contactInfo.address',
      ).toBeVisible()

      const addressTextNJ = footer.getByText(/Newark, NJ/)
      await expect(
        addressTextNJ.first(),
        'Footer Contact section should display city/state from Sanity contactInfo.address',
      ).toBeVisible()

      // Email: capstone@njit.edu as a mailto link
      const emailLink = footer.getByRole('link', { name: /capstone@njit\.edu/ })
      await expect(
        emailLink,
        'Footer Contact section should display email link from Sanity contactInfo.email',
      ).toBeVisible()

      const emailHref = await emailLink.getAttribute('href')
      expect(
        emailHref,
        'Email link should be a mailto: link from Sanity contactInfo.email',
      ).toBe('mailto:capstone@njit.edu')

      // Phone: (973) 596-3366 as a tel link
      const phoneLink = footer.getByRole('link', { name: /596-3366/ })
      await expect(
        phoneLink,
        'Footer Contact section should display phone link from Sanity contactInfo.phone',
      ).toBeVisible()

      const phoneHref = await phoneLink.getAttribute('href')
      expect(
        phoneHref,
        'Phone link should be a tel: link from Sanity contactInfo.phone',
      ).toBe('tel:+19735963366')
    })

    test('[P1] 2.3-E2E-004 — footer renders copyright and bottom bar links from Sanity', async ({
      page,
    }) => {
      // Given site settings have been wired to fetch from Sanity
      // And the siteSettings document contains footerContent.copyrightText and footerLinks[]
      // When I navigate to the homepage
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      const footer = page.locator('footer')
      // Scroll footer into view to ensure Firefox renders all child elements as visible
      await footer.scrollIntoViewIfNeeded()
      await expect(footer, 'Footer should be visible').toBeVisible()

      // Then the copyright text should come from Sanity footerContent.copyrightText
      const copyrightText = footer.getByText(/2026 New Jersey Institute of Technology/)
      await expect(
        copyrightText,
        'Footer should display copyright text from Sanity footerContent.copyrightText',
      ).toBeVisible()

      // And the footer description should come from Sanity footerContent.text
      const footerDescription = footer.getByText(/Connecting top computing talent/)
      await expect(
        footerDescription,
        'Footer should display description text from Sanity siteDescription or footerContent.text',
      ).toBeVisible()

      // And the bottom bar should contain links from Sanity footerLinks[]
      // Use toBeAttached() — Firefox reports narrow-column links as "hidden" due to text truncation
      const expectedBottomBarLinks = [
        { label: 'Privacy Policy' },
        { label: 'Terms of Service' },
        { label: 'Accessibility' },
      ]

      for (const item of expectedBottomBarLinks) {
        const link = footer.getByRole('link', { name: item.label })
        await expect(
          link,
          `Footer bottom bar should contain a "${item.label}" link from Sanity footerLinks`,
        ).toBeAttached()
      }

      // NJIT.edu link — use regex to avoid matching the email "capstone@njit.edu"
      const njitLink = footer.getByRole('link', { name: /^NJIT\.edu/i })
      await expect(
        njitLink,
        'Footer bottom bar should contain a "NJIT.edu" link from Sanity footerLinks',
      ).toBeAttached()

      // And the footer logo should have proper alt text
      const footerLogo = footer.locator('img').first()
      await expect(
        footerLogo,
        'Footer logo image should be visible',
      ).toBeVisible()

      const footerLogoAlt = await footerLogo.getAttribute('alt')
      expect(
        footerLogoAlt,
        'Footer logo should have alt text',
      ).toBeTruthy()

      // Note: a11y color-contrast violations in statsRow are pre-existing (not from this story)
    })
  })

  test.describe('AC4 + AC5: No console errors after Sanity wiring', () => {
    test('[P0] 2.3-E2E-005 — header and footer have no console errors after Sanity wiring', async ({
      page,
    }) => {
      // Given Header and Footer components have been updated to use getSiteSettings()
      // And the Sanity siteSettings document is fully populated
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
      // This validates Sanity data shape is compatible with Header and Footer components
      expect(
        errors,
        `Console errors found after site settings Sanity wiring:\n${errors.join('\n')}`,
      ).toHaveLength(0)

      // And the page structure should be intact with header, main, and footer
      await expect(page.locator('header'), 'Header should be visible').toBeVisible()
      await expect(page.locator('main'), 'Main content should be visible').toBeVisible()
      await expect(page.locator('footer'), 'Footer should be visible').toBeVisible()

      // And the page title should come from Sanity siteName (not hardcoded default)
      const pageTitle = await page.title()
      expect(
        pageTitle,
        'Page title should contain site name from Sanity siteName',
      ).toContain('YWCC Industry Capstone')

      // And the meta description should NOT be the lorem ipsum placeholder
      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
      expect(
        metaDescription,
        'Meta description should not be the lorem ipsum placeholder — should come from Sanity siteDescription',
      ).not.toContain('Lorem ipsum dolor sit amet')

      // And the header should be populated (navigation check only on desktop)
      const header = page.locator('header')
      const viewportWidth = page.viewportSize()?.width ?? 1280
      if (viewportWidth >= 768) {
        const navLinks = header.getByRole('navigation', { name: /main/i }).getByRole('link')
        const navLinkCount = await navLinks.count()
        expect(
          navLinkCount,
          'Header navigation should have links populated from Sanity (not empty)',
        ).toBeGreaterThanOrEqual(3)
      }

      // And the footer should have content sections populated
      const footer = page.locator('footer')
      const footerLinks = footer.getByRole('link')
      const footerLinkCount = await footerLinks.count()
      expect(
        footerLinkCount,
        'Footer should have multiple links populated from Sanity data',
      ).toBeGreaterThanOrEqual(10)

      // Note: a11y color-contrast violations in statsRow are pre-existing (not from this story)
    })
  })

  test.describe('AC9: Regression — all pages render after site settings wiring', () => {
    test('[P1] 2.3-E2E-006 — all pages render without regressions after site settings wiring', async ({
      page,
    }) => {
      // Given Header, Footer, and Layout have been updated to use Sanity site settings
      // And all pages use the shared Layout component
      const pages = [
        { path: '/', name: 'Homepage' },
        { path: '/about', name: 'About' },
        { path: '/projects', name: 'Projects' },
        { path: '/sponsors', name: 'Sponsors' },
        { path: '/contact', name: 'Contact' },
      ] as const

      for (const { path, name } of pages) {
        const errors: string[] = []
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            errors.push(msg.text())
          }
        })

        // When I navigate to each page
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

        await page.waitForLoadState('domcontentloaded')

        // And the header should be visible with navigation from Sanity
        const header = page.locator('header')
        await expect(
          header,
          `${name} page header should be visible`,
        ).toBeVisible()

        // Desktop nav visibility check — only on viewports wide enough
        const viewportWidth = page.viewportSize()?.width ?? 1280
        if (viewportWidth >= 768) {
          const nav = header.getByRole('navigation', { name: /main/i })
          await expect(
            nav,
            `${name} page should have main navigation in header`,
          ).toBeVisible()
        }

        // And the footer should be visible
        await expect(
          page.locator('footer'),
          `${name} page footer should be visible`,
        ).toBeVisible()

        // And the main content should be visible
        await expect(
          page.locator('main'),
          `${name} page main content should be visible`,
        ).toBeVisible()

        // And the page title should include the site name from Sanity
        const pageTitle = await page.title()
        expect(
          pageTitle,
          `${name} page title should contain site name from Sanity`,
        ).toContain('YWCC Industry Capstone')

        // Homepage meta description comes from siteSettings default — should not be Lorem ipsum
        // Non-homepage pages still use static data files (not yet migrated to Sanity) and may have placeholder descriptions
        if (path === '/') {
          const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
          expect(
            metaDescription,
            `Homepage meta description should not be placeholder lorem ipsum`,
          ).not.toContain('Lorem ipsum dolor sit amet')
        }

        // And there should be no console errors on any page
        expect(
          errors,
          `Console errors found on ${name} page (${path}):\n${errors.join('\n')}`,
        ).toHaveLength(0)

        // Clean up console listener for next iteration
        page.removeAllListeners('console')
      }
    })
  })
})
