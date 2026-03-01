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

test.describe('Story 9.3: Portal Events — Mobile Responsive', () => {
  test('calendar renders on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/portal/events');

    const calendarWrapper = page.locator('.sx-react-calendar-wrapper.relative');
    await expect(calendarWrapper).toBeVisible({ timeout: 15000 });
  });
});
