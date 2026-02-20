import { test, expect } from '../support/fixtures';

test.describe('GTM DataLayer', () => {
  test('dataLayer contains page_view event on homepage', async ({ page }) => {
    await page.goto('/');

    const dataLayer = await page.evaluate(() => (window as any).dataLayer);

    // dataLayer may not exist if PUBLIC_GTM_ID is not set
    if (!dataLayer) {
      test.skip();
      return;
    }

    const pageView = dataLayer.find((e: Record<string, unknown>) => e.event === 'page_view');
    expect(pageView).toBeDefined();
    expect(pageView.page).toBeDefined();
    expect(pageView.page.path).toBe('/');
  });
});
