import { test, expect } from '../support/fixtures';

/**
 * Story 9.4: GitHub Dev Dashboard — Portal Progress Page
 *
 * Portal routes are auto-authenticated in local dev (wrangler pages dev sets DEV=true).
 * Middleware grants dev@example.com sponsor access.
 *
 * Note: In dev mode, the dev user may not have a GitHub account in D1,
 * so the page will show the "Connect GitHub" prompt. This validates the
 * page state machine works correctly.
 */

test.describe('Story 9.4: Portal Progress Page', () => {
  test('portal progress page loads with 200 status', async ({ page }) => {
    const response = await page.goto('/portal/progress');
    expect(response?.status()).toBe(200);
  });

  test('portal progress page has correct title and breadcrumb', async ({ page }) => {
    await page.goto('/portal/progress');

    await expect(page).toHaveTitle(/Project Progress/);

    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"], nav[aria-label="breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText('Portal');
    await expect(breadcrumb).toContainText('Project Progress');
  });

  test('portal progress page renders one of the valid states', async ({ page }) => {
    await page.goto('/portal/progress');

    // The page should display one of these states:
    // 1. Connect GitHub prompt
    // 2. Re-authorize prompt
    // 3. No projects found
    // 4. Repo linker
    // 5. Dashboard
    const heading = page.locator('h1');
    await expect(heading).toContainText('Project Progress');

    // At minimum, the page should have rendered content below the heading
    const content = page.locator('h1 ~ *').first();
    await expect(content).toBeVisible();
  });

  test('progress sidebar nav is enabled and active on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/portal/progress');

    // Desktop sidebar is inside <aside>
    const desktopNav = page.locator('aside nav[aria-label="Portal navigation"]');
    const navLink = desktopNav.locator('a', { hasText: 'Project Progress' });
    await expect(navLink).toBeVisible();
    // Verify it has aria-current="page" (active state)
    await expect(navLink).toHaveAttribute('aria-current', 'page');
    // Verify it has an href (not disabled — disabled items have no href)
    await expect(navLink).toHaveAttribute('href', '/portal/progress');
  });

  test('portal progress page renders on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const response = await page.goto('/portal/progress');
    expect(response?.status()).toBe(200);

    const heading = page.locator('h1');
    await expect(heading).toContainText('Project Progress');
  });
});

test.describe('Story 9.19: Extended GitHub Dashboard Insights', () => {
  test('progress page still loads after extended insights changes (regression)', async ({ page }) => {
    const response = await page.goto('/portal/progress');
    expect(response?.status()).toBe(200);

    // Page should render without JS errors
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    const heading = page.locator('h1');
    await expect(heading).toContainText('Project Progress');

    // No JS errors should have been thrown
    expect(errors).toHaveLength(0);
  });

  test('progress page renders valid state without crashing (extended insights)', async ({ page }) => {
    await page.goto('/portal/progress');

    // The page should show one of the valid UI states (Connect GitHub, dashboard, etc.)
    // without throwing errors from the new tab/component code
    const content = page.locator('h1 ~ *').first();
    await expect(content).toBeVisible();
  });
});

test.describe('Story 9.4: Portal Landing Page — Progress Card', () => {
  test('landing page "Project Progress" card is enabled and links to /portal/progress', async ({ page }) => {
    await page.goto('/portal/');

    // Find the Project Progress card
    const progressCard = page.locator('text=Project Progress').first();
    await expect(progressCard).toBeVisible();

    // The card should be clickable (has an ancestor with href)
    const cardLink = page.locator('a[href="/portal/progress"]');
    await expect(cardLink).toBeVisible();

    // Verify it does NOT have "Coming Soon" badge (not disabled)
    const card = cardLink.first();
    const badge = card.locator('text=Coming Soon');
    await expect(badge).not.toBeVisible();
  });
});

test.describe('Story 9.4: GitHub API Endpoints', () => {
  test('GET /portal/api/github/repos returns JSON', async ({ request }) => {
    // In dev mode, the dev user likely has no GitHub account, so we expect 404
    const response = await request.get('/portal/api/github/repos');
    // Should return JSON regardless of status
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
    // Status should be either 200 (has token) or 404 (no github account) or 403 (missing scope)
    expect([200, 403, 404]).toContain(response.status());
  });

  test('GET /portal/api/github/links returns JSON array', async ({ request }) => {
    const response = await request.get('/portal/api/github/links');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('POST /portal/api/github/links validates missing fields', async ({ request }) => {
    const response = await request.post('/portal/api/github/links', {
      data: {},
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test('POST /portal/api/github/links validates owner/repo format', async ({ request }) => {
    const response = await request.post('/portal/api/github/links', {
      data: { projectSanityId: 'test-id', githubRepo: 'not-a-valid-format' },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('owner/repo');
  });

  test('DELETE /portal/api/github/links validates missing fields', async ({ request }) => {
    const response = await request.delete('/portal/api/github/links', {
      data: {},
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });
});
