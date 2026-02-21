import { test, expect } from '../support/fixtures'

test.describe('Events Calendar Page (Story 2-15)', () => {
  test('[P0] 2.15-E2E-001 — events listing page loads with list view by default', async ({ page }) => {
    await page.goto('/events')

    await expect(page).toHaveTitle(/Events/)
    await expect(page.locator('h1')).toContainText('Events')

    // List view should be visible
    const eventsList = page.locator('#events-list')
    await expect(eventsList).toBeVisible()

    // Breadcrumb should show Home > Events
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
    await expect(breadcrumb).toContainText('Home')
    await expect(breadcrumb).toContainText('Events')
  })

  test('[P0] 2.15-E2E-002 — toggle button shows "Calendar View" text initially', async ({ page }) => {
    await page.goto('/events')

    const toggleButton = page.locator('button[aria-pressed]')
    await expect(toggleButton).toBeVisible()
    await expect(toggleButton).toContainText('Calendar View')
    await expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
  })

  test('[P1] 2.15-E2E-003 — clicking toggle shows calendar and hides list', async ({ page }) => {
    await page.goto('/events')

    const toggleButton = page.locator('button[aria-pressed]')
    await toggleButton.click()

    // Toggle text should change
    await expect(toggleButton).toContainText('List View')
    await expect(toggleButton).toHaveAttribute('aria-pressed', 'true')

    // Calendar should be visible (Schedule-X renders a container)
    const calendarWrapper = page.locator('.sx-calendar-wrapper')
    await expect(calendarWrapper).toBeVisible()
  })

  test('[P1] 2.15-E2E-004 — clicking toggle again shows list view', async ({ page }) => {
    await page.goto('/events')

    const toggleButton = page.locator('button[aria-pressed]')

    // Toggle to calendar
    await toggleButton.click()
    await expect(toggleButton).toContainText('List View')

    // Toggle back to list
    await toggleButton.click()
    await expect(toggleButton).toContainText('Calendar View')
    await expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
  })

  test('[P1] 2.15-E2E-005 — event cards link to detail pages', async ({ page }) => {
    await page.goto('/events')

    // Find any event link
    const eventLink = page.locator('#events-list a[href^="/events/"]').first()
    const href = await eventLink.getAttribute('href')

    if (href) {
      await eventLink.click()
      await expect(page).toHaveURL(href)
    }
  })

  test('[P1] 2.15-E2E-006 — event detail page links back to events listing', async ({ page }) => {
    await page.goto('/events')

    // Navigate to first event
    const eventLink = page.locator('#events-list a[href^="/events/"]').first()
    const href = await eventLink.getAttribute('href')

    if (href) {
      await page.goto(href)

      // Back link should point to /events
      const backLink = page.locator('a[href="/events"]')
      await expect(backLink).toBeVisible()
    }
  })
})
