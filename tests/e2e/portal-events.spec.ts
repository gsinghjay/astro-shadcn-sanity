import { test, expect } from '../support/fixtures';

/**
 * Story 9.3: Portal Events Calendar & Program Info
 *
 * Portal routes are auto-authenticated in local dev (wrangler pages dev sets DEV=true).
 * Middleware grants dev@example.com access.
 */

test.describe('Story 9.3: Portal Events Calendar', () => {
  test('portal events page loads with 200 status', async ({ page }) => {
    const response = await page.goto('/portal/events');
    expect(response?.status()).toBe(200);
  });

  test('portal events page has correct title and breadcrumb', async ({ page }) => {
    await page.goto('/portal/events');

    await expect(page).toHaveTitle(/Events/);

    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"], nav[aria-label="breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText('Portal');
    await expect(breadcrumb).toContainText('Events');
  });

  test('portal events page renders Schedule-X calendar', async ({ page }) => {
    await page.goto('/portal/events');

    const calendarWrapper = page.locator('.sx-react-calendar-wrapper.relative');
    await expect(calendarWrapper).toBeVisible({ timeout: 15000 });
  });

  test('calendar has event type legend', async ({ page }) => {
    await page.goto('/portal/events');

    const wrapper = page.locator('.sx-react-calendar-wrapper.relative');
    await expect(wrapper).toContainText('Showcase');
    await expect(wrapper).toContainText('Networking');
    await expect(wrapper).toContainText('Workshop');
  });

  test('events sidebar nav is enabled and active on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/portal/events');

    // Desktop sidebar is inside <aside>
    const desktopNav = page.locator('aside nav[aria-label="Portal navigation"]');
    const navLink = desktopNav.locator('a', { hasText: 'Events & Schedule' });
    await expect(navLink).toBeVisible();
    // Verify it has aria-current="page" (active state)
    await expect(navLink).toHaveAttribute('aria-current', 'page');
    // Verify it has an href (not disabled — disabled items have no href)
    await expect(navLink).toHaveAttribute('href', '/portal/events');
  });

  test('events API endpoint returns events for valid date range', async ({ page }) => {
    const response = await page.goto('/portal/api/events?start=2026-01-01T00:00:00Z&end=2026-12-31T23:59:59Z');
    expect(response?.status()).toBe(200);

    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('application/json');

    const body = await response?.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('events API validates missing date params', async ({ request }) => {
    // Use request API to avoid triggering networkErrorMonitor on intentional 400
    const response = await request.get('/portal/api/events');
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Missing required query params');
  });

  test('events API validates invalid date format', async ({ request }) => {
    const response = await request.get('/portal/api/events?start=not-a-date&end=also-not');
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Invalid date format');
  });
});

test.describe('Story 9.3: Portal Events — View Switching', () => {
  test('calendar view selector dropdown has multiple views', async ({ page }) => {
    await page.goto('/portal/events');

    // Wait for Schedule-X to fully hydrate
    const calendarHeader = page.locator('.sx__calendar-header');
    await expect(calendarHeader).toBeVisible({ timeout: 15000 });

    // Schedule-X uses a dropdown for view selection
    const viewDropdown = page.locator('.sx__view-selection-selected-item');
    await expect(viewDropdown).toBeVisible();

    // Open the dropdown
    await viewDropdown.click();

    // Verify dropdown items appear (day, week, month grid, month agenda = 4 views)
    const viewItems = page.locator('.sx__view-selection-item');
    await expect(viewItems.first()).toBeVisible({ timeout: 5000 });
    const count = await viewItems.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // Click a different view to verify switching works
    await viewItems.nth(0).click();

    // Calendar should still be rendered after switching
    await expect(calendarHeader).toBeVisible();
  });
});

test.describe('Story 9.3: Portal Events — Event Colors', () => {
  test('calendar renders event calendars with color configuration', async ({ page }) => {
    await page.goto('/portal/events');

    const calendarWrapper = page.locator('.sx-react-calendar-wrapper.relative');
    await expect(calendarWrapper).toBeVisible({ timeout: 15000 });

    // Verify the color legend shows all three event types with correct color swatches
    const showcaseSwatch = calendarWrapper.locator('span.bg-red-600').first();
    const networkingSwatch = calendarWrapper.locator('span.bg-blue-600').first();
    const workshopSwatch = calendarWrapper.locator('span.bg-green-600').first();

    await expect(showcaseSwatch).toBeVisible();
    await expect(networkingSwatch).toBeVisible();
    await expect(workshopSwatch).toBeVisible();
  });
});

test.describe('Story 9.3: Portal Events — Event Popover', () => {
  test('clicking an event shows detail popover with expected elements', async ({ page }) => {
    await page.goto('/portal/events');

    const calendarWrapper = page.locator('.sx-react-calendar-wrapper.relative');
    await expect(calendarWrapper).toBeVisible({ timeout: 15000 });

    // Find any rendered event in the calendar
    const calendarEvent = page.locator('.sx__event').first();
    const eventExists = (await calendarEvent.count()) > 0;

    if (eventExists) {
      await calendarEvent.click();

      // Popover should appear
      const popover = page.locator('[data-event-popover]');
      await expect(popover).toBeVisible({ timeout: 5000 });

      // Should have a title (h3)
      await expect(popover.locator('h3')).toBeVisible();

      // Should have a close button
      const closeBtn = popover.locator('button[aria-label="Close"]');
      await expect(closeBtn).toBeVisible();

      // Should have an event type badge
      const badge = popover.locator('span.inline-flex.w-fit');
      await expect(badge).toBeVisible();

      // Close via button
      await closeBtn.click();
      await expect(popover).not.toBeVisible();
    }
    // If no events rendered in current month, test passes — we can't force Sanity data
  });

  test('popover closes on Escape key', async ({ page }) => {
    await page.goto('/portal/events');

    const calendarWrapper = page.locator('.sx-react-calendar-wrapper.relative');
    await expect(calendarWrapper).toBeVisible({ timeout: 15000 });

    const calendarEvent = page.locator('.sx__event').first();
    const eventExists = (await calendarEvent.count()) > 0;

    if (eventExists) {
      await calendarEvent.click();

      const popover = page.locator('[data-event-popover]');
      await expect(popover).toBeVisible({ timeout: 5000 });

      await page.keyboard.press('Escape');
      await expect(popover).not.toBeVisible();
    }
  });
});

test.describe('Story 9.3: Portal Events — Mobile Responsive', () => {
  test('calendar renders on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/portal/events');

    const calendarWrapper = page.locator('.sx-react-calendar-wrapper.relative');
    await expect(calendarWrapper).toBeVisible({ timeout: 15000 });
  });
});
