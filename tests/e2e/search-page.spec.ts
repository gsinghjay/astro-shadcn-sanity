import { test, expect } from '../support/fixtures';

// Single-shot probe per worker — avoids every test double-loading /search.
let searchAvailable: boolean | null = null;
async function probeSearchAvailability(page: import('@playwright/test').Page): Promise<boolean> {
  if (searchAvailable !== null) return searchAvailable;
  await page.goto('/search');
  searchAvailable =
    (await page.getByText('Search is currently unavailable').count()) === 0;
  return searchAvailable;
}

test.describe('Search Results Page (Story 5.23)', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      !['chromium', 'mobile-chrome'].includes(testInfo.project.name),
      'Search page E2E runs on chromium + mobile-chrome only',
    );
  });

  test('AC 14a — /search (no ?q) renders empty-state panel and focuses the input', async ({ page }) => {
    if (!(await probeSearchAvailability(page))) {
      test.skip();
      return;
    }

    await page.goto('/search');

    const root = page.locator('[data-search-results-root]');
    await expect(root).toBeVisible();

    const empty = page.locator('[data-search-empty]');
    await expect(empty).toBeVisible();
    await expect(empty).toContainText(/type a query/i);

    // Input is autoFocus + visible.
    const input = page.locator('[data-search-page-input]');
    await expect(input).toBeFocused();
  });

  test('AC 14b — typing + Enter pushes ?q to URL and renders native <li> results', async ({ page }) => {
    if (!(await probeSearchAvailability(page))) {
      test.skip();
      return;
    }

    await page.goto('/search');

    const input = page.locator('[data-search-page-input]');
    await input.fill('NJIT');
    await input.press('Enter');

    await page.waitForURL(/\/search\?q=NJIT/, { timeout: 5_000 });

    // Native light-DOM <ol> reachable without shadowRoot piercing.
    const results = page.locator('main ol[data-search-results] li a');
    await expect(results.first()).toBeVisible({ timeout: 10_000 });
  });

  test('AC 14c — popstate (browser back) re-runs the previous query', async ({ page }) => {
    if (!(await probeSearchAvailability(page))) {
      test.skip();
      return;
    }

    await page.goto('/search?q=NJIT');
    await page.locator('main ol[data-search-results] li').first().waitFor({ timeout: 10_000 });

    const input = page.locator('[data-search-page-input]');
    await input.fill('Capstone');
    await input.press('Enter');
    await page.waitForURL(/\/search\?q=Capstone/, { timeout: 5_000 });

    await page.goBack();
    await page.waitForURL(/\/search\?q=NJIT/, { timeout: 5_000 });
    await expect(input).toHaveValue('NJIT');
  });

  test('AC 14d — Meta+K on /search does NOT open a modal (skip-mounted) + no GTM open event', async ({ page }) => {
    if (!(await probeSearchAvailability(page))) {
      test.skip();
      return;
    }

    await page.goto('/search');
    await page.evaluate(() => {
      (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
    });

    // Skip-mount means the snippet element is absent on /search.
    expect(await page.locator('search-modal-snippet').count()).toBe(0);
    expect(await page.locator('[data-search-trigger]').count()).toBe(0);

    const isMac = process.platform === 'darwin';
    const shortcut = isMac ? 'Meta+k' : 'Control+k';
    await page.keyboard.press(shortcut);

    // Snippet still absent — no modal stacked on top.
    expect(await page.locator('search-modal-snippet').count()).toBe(0);

    const events = await page.evaluate(
      () => (window as unknown as { dataLayer: Array<Record<string, unknown>> }).dataLayer ?? [],
    );
    expect(
      events.some(e => e.event === 'site_search_open' && e.source === 'shortcut'),
    ).toBe(false);
  });

  test('AC 14e — Meta+K on / DOES open the modal (regression guard for skip-mount scope)', async ({ page }) => {
    test.skip(
      test.info().project.name.startsWith('mobile'),
      'Shortcut test is desktop only',
    );

    await page.goto('/');
    if ((await page.locator('search-modal-snippet').count()) === 0) {
      test.skip();
      return;
    }

    const isMac = process.platform === 'darwin';
    const shortcut = isMac ? 'Meta+k' : 'Control+k';
    await page.keyboard.press(shortcut);

    await page.waitForFunction(() => {
      const el = document.querySelector('search-modal-snippet') as HTMLElement & {
        isModalOpen?: () => boolean;
      } | null;
      return Boolean(el?.isModalOpen?.());
    });
  });

  test('AC 14f — repeat query within session hits the cache (only 1 fetch for 2 identical submits)', async ({ page }) => {
    if (!(await probeSearchAvailability(page))) {
      test.skip();
      return;
    }

    await page.goto('/search');

    // Capture every request after the page is loaded — no hostname heuristic.
    // This catches the fetch regardless of whether the API is on workers.dev,
    // a custom domain, or anything else.
    const allRequests: string[] = [];
    page.on('request', req => allRequests.push(req.url()));

    const input = page.locator('[data-search-page-input]');
    await input.fill('cached query');
    await input.press('Enter');
    await page.locator('main ol[data-search-results] li').first().waitFor({ timeout: 10_000 });

    // Snapshot request count after the first submit settles.
    const requestsAfterFirstSubmit = allRequests.length;
    expect(requestsAfterFirstSubmit).toBeGreaterThan(0);

    // Re-submit the same query — should serve from cache.
    await input.fill('cached query');
    await input.press('Enter');
    await page.waitForTimeout(500);

    // No new requests after the second submit — the cache served the result.
    // (Allows trivial telemetry beacons unrelated to /search by asserting
    // equality rather than zero, since beforeFirst captures the same baseline.)
    expect(allRequests.length).toBe(requestsAfterFirstSubmit);
  });

  test('AC 14g — /search shows unavailable panel when search is disabled', async ({ page }) => {
    if (await probeSearchAvailability(page)) {
      test.skip();
      return;
    }
    await page.goto('/search');
    await expect(page.getByText('Search is currently unavailable')).toBeVisible();
  });
});
