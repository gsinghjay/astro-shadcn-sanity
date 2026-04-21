import { test, expect } from '../support/fixtures';

/**
 * Story 5.18 Path A — ChatBubble Swiss-design upgrade.
 *
 * Uses the same skip-if-missing pattern as cookie-consent.spec.ts so the suite
 * passes when `aiSearch.enabled=false` (no bubble rendered).
 */

async function getSiteId(page: import('@playwright/test').Page): Promise<string> {
  const siteId = await page.evaluate(() => {
    const wrapper = document.querySelector<HTMLElement>('[data-chat-bubble-wrapper]');
    return wrapper?.dataset.siteId ?? null;
  });
  if (siteId === null) {
    throw new Error('[chat-bubble.spec] data-chat-bubble-wrapper missing — cannot resolve siteId.');
  }
  return siteId;
}

async function isOpenByDefault(page: import('@playwright/test').Page): Promise<boolean> {
  return page.evaluate(() => {
    const wrapper = document.querySelector<HTMLElement>('[data-chat-bubble-wrapper]');
    return wrapper?.dataset.openByDefault === 'true';
  });
}

function isPanelOpen(page: import('@playwright/test').Page): Promise<boolean> {
  return page.evaluate(() => {
    const el = document.querySelector('chat-bubble-snippet');
    const root = el?.shadowRoot;
    if (!root) return false;
    const candidate = root.querySelector<HTMLElement>(
      '.chat-bubble-window, .bubble-window, [role="dialog"][open], [data-open="true"], [aria-expanded="true"]',
    );
    if (!candidate) return false;
    const style = window.getComputedStyle(candidate);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

test.describe('ChatBubble (Story 5.18 Path A)', () => {
  test('external Swiss trigger is visible when bubble is enabled', async ({ page }) => {
    await page.goto('/');

    const trigger = page.locator('[data-chat-bubble-external-trigger]');
    if ((await trigger.count()) === 0) {
      test.skip();
      return;
    }

    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-label', 'Chat');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveAttribute('aria-controls', 'chat-bubble-snippet');
  });

  test('clicking the external trigger opens the chat panel (Shadow DOM)', async ({ page }) => {
    await page.goto('/');

    const trigger = page.locator('[data-chat-bubble-external-trigger]');
    if ((await trigger.count()) === 0) {
      test.skip();
      return;
    }

    // Wait for the vendor snippet to hydrate (Shadow DOM + inner button ready).
    await page.waitForFunction(() => {
      const el = document.querySelector('chat-bubble-snippet');
      return Boolean(el?.shadowRoot?.querySelector('.bubble-button, button'));
    }, null, { timeout: 5000 });

    await trigger.click();

    // Wait for the panel to actually render (visible, not just present).
    await page.waitForFunction(() => {
      const el = document.querySelector('chat-bubble-snippet');
      const root = el?.shadowRoot;
      if (!root) return false;
      const candidate = root.querySelector(
        '.chat-bubble-window, .bubble-window, [role="dialog"][open], [data-open="true"], [aria-expanded="true"]',
      );
      if (!candidate) return false;
      const style = window.getComputedStyle(candidate as HTMLElement);
      return style.display !== 'none' && style.visibility !== 'hidden';
    }, null, { timeout: 5000 });

    expect(await isPanelOpen(page)).toBe(true);
  });

  test('first visit writes to chatBubbleDismissed-{siteId} after auto-open', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/', { waitUntil: 'load' });

    const trigger = page.locator('[data-chat-bubble-external-trigger]');
    if ((await trigger.count()) === 0) {
      test.skip();
      return;
    }

    // Skip explicitly when openByDefault is off — the auto-open path is not
    // exercised at all on this dataset, so any assertion would be misleading.
    if (!(await isOpenByDefault(page))) {
      test.skip(true, 'openByDefault is false in this dataset; auto-open path is not exercised');
      return;
    }

    const siteId = await getSiteId(page);

    // Clear any pre-existing dismiss flag so auto-open logic runs.
    await page.evaluate((id) => {
      localStorage.removeItem(`chatBubbleDismissed-${id}`);
      localStorage.removeItem(`chatBubbleSeen-${id}`);
    }, siteId);
    await page.reload({ waitUntil: 'load' });

    // Wait deterministically for the migration + 1.5s auto-open delay to
    // write the dismiss flag, rather than burning a fixed timeout.
    await page.waitForFunction(
      (id) => localStorage.getItem(`chatBubbleDismissed-${id}`) !== null,
      siteId,
      { timeout: 5000 },
    );

    const dismissed = await page.evaluate(
      (id) => localStorage.getItem(`chatBubbleDismissed-${id}`),
      siteId,
    );
    expect(dismissed).toBe('true');
  });

  test('pre-set chatBubbleDismissed prevents auto-open on reload', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });

    const trigger = page.locator('[data-chat-bubble-external-trigger]');
    if ((await trigger.count()) === 0) {
      test.skip();
      return;
    }

    const siteId = await getSiteId(page);

    await page.evaluate((id) => {
      localStorage.setItem(`chatBubbleDismissed-${id}`, 'true');
    }, siteId);
    await page.reload({ waitUntil: 'load' });

    // Wait past the 1.5s auto-open delay (using a real wall-clock window
    // here is correct — we're asserting absence of a side effect that
    // happens after a known timer).
    await page.waitForTimeout(2000);

    expect(await isPanelOpen(page)).toBe(false);
  });

  test('legacy chatBubbleSeen-{siteId} is migrated to chatBubbleDismissed-{siteId}', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });

    const trigger = page.locator('[data-chat-bubble-external-trigger]');
    if ((await trigger.count()) === 0) {
      test.skip();
      return;
    }

    const siteId = await getSiteId(page);

    // Seed the legacy key, clear the new key, then reload so init runs.
    await page.evaluate((id) => {
      localStorage.removeItem(`chatBubbleDismissed-${id}`);
      localStorage.setItem(`chatBubbleSeen-${id}`, 'true');
    }, siteId);
    await page.reload({ waitUntil: 'load' });

    // Wait deterministically for the synchronous migration to complete.
    await page.waitForFunction(
      (id) => localStorage.getItem(`chatBubbleDismissed-${id}`) !== null,
      siteId,
      { timeout: 5000 },
    );

    const result = await page.evaluate(
      (id) => ({
        legacy: localStorage.getItem(`chatBubbleSeen-${id}`),
        current: localStorage.getItem(`chatBubbleDismissed-${id}`),
      }),
      siteId,
    );

    expect(result.current).toBe('true');
    expect(result.legacy).toBeNull();
  });
});
