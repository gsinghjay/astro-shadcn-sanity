import { mergeTests } from '@playwright/test'
import { test as networkErrorMonitorFixture } from '@seontechnologies/playwright-utils/network-error-monitor/fixtures'
import { test as logFixture } from '@seontechnologies/playwright-utils/log/fixtures'

/**
 * Merged test fixtures for the astro-shadcn-sanity project.
 *
 * Included:
 *   - networkErrorMonitor: Auto-detects HTTP 4xx/5xx during page loads (broken assets, scripts)
 *   - log: Structured logging attached to Playwright HTML reports
 *
 * Not included (static SSG — no runtime APIs or auth):
 *   - apiRequest, authSession, recurse, interceptNetworkCall, networkRecorder
 *
 * Add fixtures here as the project grows (e.g. auth when forms phase begins).
 */
export const test = mergeTests(networkErrorMonitorFixture, logFixture)

export { expect } from '@playwright/test'
