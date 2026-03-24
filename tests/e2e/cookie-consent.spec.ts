import { test, expect } from '../support/fixtures';

test.describe('Cookie Consent Banner', () => {
  test.beforeEach(async ({ context }) => {
    // Clear localStorage before each test for a clean state
    await context.addInitScript(() => {
      localStorage.removeItem('cookie-consent');
    });
  });

  test('banner is visible on first visit (no localStorage)', async ({ page }) => {
    await page.goto('/');

    const banner = page.locator('[data-cookie-consent-banner]');
    // Banner may not exist if PUBLIC_GTM_ID is not set
    if ((await banner.count()) === 0) {
      test.skip();
      return;
    }

    await expect(banner).toHaveAttribute('data-state', 'visible');
    await expect(banner).toContainText('Accept');
    await expect(banner).toContainText('Reject');
  });

  test('clicking Accept hides banner and sets localStorage to accepted', async ({ page }) => {
    await page.goto('/');

    const banner = page.locator('[data-cookie-consent-banner]');
    if ((await banner.count()) === 0) {
      test.skip();
      return;
    }

    await page.locator('[data-cookie-accept]').click();

    await expect(banner).toHaveAttribute('data-state', 'hidden');

    const consent = await page.evaluate(() => localStorage.getItem('cookie-consent'));
    expect(consent).toBe('accepted');
  });

  test('clicking Reject hides banner and sets localStorage to rejected', async ({ page }) => {
    await page.goto('/');

    const banner = page.locator('[data-cookie-consent-banner]');
    if ((await banner.count()) === 0) {
      test.skip();
      return;
    }

    await page.locator('[data-cookie-reject]').click();

    await expect(banner).toHaveAttribute('data-state', 'hidden');

    const consent = await page.evaluate(() => localStorage.getItem('cookie-consent'));
    expect(consent).toBe('rejected');
  });

  test('banner does NOT appear on subsequent page load when consent already stored', async ({ page }) => {
    // Pre-set consent
    await page.goto('/');
    const banner = page.locator('[data-cookie-consent-banner]');
    if ((await banner.count()) === 0) {
      test.skip();
      return;
    }

    await page.evaluate(() => localStorage.setItem('cookie-consent', 'accepted'));
    await page.reload();

    await expect(banner).toHaveAttribute('data-state', 'hidden');
  });

  test('GTM script tag is present in DOM after accepting', async ({ page }) => {
    await page.goto('/');

    const banner = page.locator('[data-cookie-consent-banner]');
    if ((await banner.count()) === 0) {
      test.skip();
      return;
    }

    await page.locator('[data-cookie-accept]').click();

    // Wait for GTM script to be injected
    const gtmScript = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]');
      return scripts.length;
    });
    expect(gtmScript).toBeGreaterThan(0);
  });

  test('GTM script tag is NOT present in DOM after rejecting', async ({ page }) => {
    await page.goto('/');

    const banner = page.locator('[data-cookie-consent-banner]');
    if ((await banner.count()) === 0) {
      test.skip();
      return;
    }

    await page.locator('[data-cookie-reject]').click();

    const gtmScript = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]');
      return scripts.length;
    });
    expect(gtmScript).toBe(0);
  });

  test('"Cookie Settings" footer link reopens the banner', async ({ page }) => {
    await page.goto('/');

    const banner = page.locator('[data-cookie-consent-banner]');
    if ((await banner.count()) === 0) {
      test.skip();
      return;
    }

    // First accept to hide banner
    await page.locator('[data-cookie-accept]').click();
    await expect(banner).toHaveAttribute('data-state', 'hidden');

    // Click Cookie Settings in footer
    await page.locator('[data-cookie-settings-trigger]').click();
    await expect(banner).toHaveAttribute('data-state', 'visible');
  });

  test('dataLayer continues to receive events after consent', async ({ page }) => {
    await page.goto('/');

    const banner = page.locator('[data-cookie-consent-banner]');
    if ((await banner.count()) === 0) {
      test.skip();
      return;
    }

    // Accept consent
    await page.locator('[data-cookie-accept]').click();

    // Check that dataLayer has both page_view and consent_update events
    const dataLayer = await page.evaluate(() => (window as any).dataLayer);
    if (!dataLayer) {
      test.skip();
      return;
    }

    const pageView = dataLayer.find((e: Record<string, unknown>) => e.event === 'page_view');
    expect(pageView).toBeDefined();

    const consentUpdate = dataLayer.find((e: Record<string, unknown>) => e.event === 'consent_update');
    expect(consentUpdate).toBeDefined();
    expect(consentUpdate.consent_status).toBe('accepted');
  });
});
