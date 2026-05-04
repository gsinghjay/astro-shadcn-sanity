import { test, expect } from '../support/fixtures';

async function hasSearchModal(page: import('@playwright/test').Page): Promise<boolean> {
  return (await page.locator('search-modal-snippet').count()) > 0;
}

async function isSearchModalOpen(page: import('@playwright/test').Page): Promise<boolean> {
  return page.evaluate(() => {
    const el = document.querySelector('search-modal-snippet') as HTMLElement & {
      isModalOpen?: () => boolean;
    } | null;
    return Boolean(el?.isModalOpen?.());
  });
}

async function waitForSearchResults(page: import('@playwright/test').Page, selector: string): Promise<void> {
  await page.waitForFunction((hostSelector) => {
    const host = document.querySelector(hostSelector) as HTMLElement | null;
    const root = host?.shadowRoot;
    return Boolean(root?.querySelector('.search-result-item'));
  }, selector, { timeout: 10_000 });
}

test.describe('Site Search Modal', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      !['chromium', 'mobile-chrome'].includes(testInfo.project.name),
      'Site search modal E2E runs on chromium + mobile-chrome only',
    );
  });

  test('desktop trigger click opens modal', async ({ page }) => {
    test.skip(
      test.info().project.name.startsWith('mobile'),
      'Desktop trigger is hidden on mobile viewports',
    );
    await page.goto('/');

    if (!(await hasSearchModal(page))) {
      test.skip();
      return;
    }

    const desktopTrigger = page.locator('[data-search-trigger][data-gtm-label="nav-desktop"]');
    if ((await desktopTrigger.count()) === 0) {
      test.skip();
      return;
    }

    await expect(desktopTrigger).toBeVisible();
    await desktopTrigger.click();

    await page.waitForFunction(() => {
      const el = document.querySelector('search-modal-snippet') as HTMLElement & {
        isModalOpen?: () => boolean;
      } | null;
      return Boolean(el?.isModalOpen?.());
    });

    expect(await isSearchModalOpen(page)).toBe(true);
  });

  test('shortcut opens modal on desktop', async ({ page }) => {
    test.skip(
      test.info().project.name.startsWith('mobile'),
      'Shortcut test is desktop only',
    );
    await page.goto('/');

    if (!(await hasSearchModal(page))) {
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

    expect(await isSearchModalOpen(page)).toBe(true);
  });

  test('typing a query shows results and Enter opens the active result', async ({ page }) => {
    test.skip(
      test.info().project.name.startsWith('mobile'),
      'Desktop trigger is hidden on mobile viewports',
    );
    await page.goto('/');

    if (!(await hasSearchModal(page))) {
      test.skip();
      return;
    }

    const desktopTrigger = page.locator('[data-search-trigger][data-gtm-label="nav-desktop"]');
    if ((await desktopTrigger.count()) === 0) {
      test.skip();
      return;
    }

    await desktopTrigger.click();

    const modal = page.locator('search-modal-snippet');
    const input = modal.locator('input');
    await expect(input).toBeVisible();
    await input.fill('NJIT');
    await input.press('Enter');

    await waitForSearchResults(page, 'search-modal-snippet');
    const firstResult = modal.locator('.search-result-item').first();
    await expect(firstResult).toBeVisible();

    const href = await firstResult.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href!.trim().length).toBeGreaterThan(0);

    // Resolve href against the current page so relative result URLs (e.g. "/about")
    // produce a concrete pathname rather than a regex that vacuously matches anything.
    const targetPath = new URL(href!, page.url()).pathname;
    expect(targetPath).not.toBe('/');

    await firstResult.focus();
    await Promise.all([
      page.waitForURL((url) => url.pathname === targetPath),
      page.keyboard.press('Enter'),
    ]);
  });

  test('Escape closes the modal', async ({ page }) => {
    test.skip(
      test.info().project.name.startsWith('mobile'),
      'Desktop trigger is hidden on mobile viewports',
    );
    await page.goto('/');

    if (!(await hasSearchModal(page))) {
      test.skip();
      return;
    }

    await page.locator('[data-search-trigger][data-gtm-label="nav-desktop"]').click();
    await expect.poll(() => isSearchModalOpen(page)).toBeTruthy();

    await page.keyboard.press('Escape');
    await expect.poll(() => isSearchModalOpen(page)).toBeFalsy();
  });

  test('mobile drawer Search item opens modal', async ({ page }) => {
    test.skip(
      !test.info().project.name.startsWith('mobile'),
      'Mobile drawer trigger is only visible on mobile viewports',
    );
    await page.goto('/');

    if (!(await hasSearchModal(page))) {
      test.skip();
      return;
    }

    const openMenu = page.locator('button[name="open-sheet-button"]');
    if ((await openMenu.count()) === 0) {
      test.skip();
      return;
    }

    await openMenu.click();

    const mobileTrigger = page.locator('[data-search-trigger][data-gtm-label="nav-mobile"]');
    if ((await mobileTrigger.count()) === 0) {
      test.skip();
      return;
    }

    await mobileTrigger.click();
    await expect.poll(() => isSearchModalOpen(page)).toBeTruthy();
  });

  test('click trigger pushes GTM event', async ({ page }) => {
    test.skip(
      test.info().project.name.startsWith('mobile'),
      'Desktop trigger is hidden on mobile viewports',
    );
    await page.goto('/');

    if (!(await hasSearchModal(page))) {
      test.skip();
      return;
    }

    const desktopTrigger = page.locator('[data-search-trigger][data-gtm-label="nav-desktop"]');
    if ((await desktopTrigger.count()) === 0) {
      test.skip();
      return;
    }

    await page.evaluate(() => {
      (window as any).dataLayer = [];
    });

    await desktopTrigger.click();

    const events = await page.evaluate(() => (window as any).dataLayer ?? []);
    expect(events.some((event: Record<string, unknown>) => event.event === 'site_search_open' && event.source === 'click')).toBe(true);
  });

  test('/search?q= auto-runs the query on the search bar snippet', async ({ page }) => {
    await page.goto('/search?q=NJIT');

    const searchBar = page.locator('search-bar-snippet');
    if ((await searchBar.count()) === 0) {
      test.skip();
      return;
    }

    await page.waitForFunction(() => customElements.get('search-bar-snippet') !== undefined);
    await waitForSearchResults(page, 'search-bar-snippet');

    const firstResult = searchBar.locator('.search-result-item').first();
    await expect(firstResult).toBeVisible();
  });

  test('search bar host exposes Swiss token overrides', async ({ page }) => {
    await page.goto('/search');

    const searchBar = page.locator('search-bar-snippet');
    if ((await searchBar.count()) === 0) {
      test.skip();
      return;
    }

    const borderRadiusToken = await searchBar.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--search-snippet-border-radius').trim(),
    );

    expect(borderRadiusToken).toBe('0');
  });

  // AC 14(g) "modal does not render when searchModalEnabled=false" is covered by
  // the SearchModal.test.ts unit tests (see "returns empty output when apiUrl is
  // empty/whitespace/non-https"). An E2E variant requires a fixture/env override
  // to flip the flag at runtime; deferred until a test-fixture pattern lands.

  test('search page shows unavailable state when search is disabled', async ({ page }) => {
    await page.goto('/search');

    const searchBar = page.locator('search-bar-snippet');
    if ((await searchBar.count()) > 0) {
      test.skip();
      return;
    }

    await expect(page.getByText('Search is currently unavailable')).toBeVisible();
  });
});