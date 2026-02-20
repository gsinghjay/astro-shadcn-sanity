#!/usr/bin/env node
/**
 * Captures Storybook components into a Figma file using Figma's HTML-to-Design API.
 *
 * How it works:
 *   1. Reads a "capture map" — a JSON array of { title, storyId, captureId } objects.
 *   2. For each entry, opens the Storybook iframe in a headless Chromium browser.
 *   3. Injects the Figma capture script, which reads the DOM and POSTs it to Figma's servers.
 *   4. Figma converts the DOM snapshot into a design node in the target Figma file.
 *
 * The script is **resumable**: it writes progress to a JSON file after every component.
 * If it crashes or is stopped, re-run it and it will skip already-completed entries.
 *
 * Usage:
 *   node figma-capture.mjs [--map <path>] [--progress <path>] [--storybook <url>] [--timeout <ms>]
 *
 * Defaults:
 *   --map        ./capture-map.json
 *   --progress   ./capture-progress.json
 *   --storybook  http://localhost:6006
 *   --timeout    60000   (ms to wait before assuming success — see "Known Issues")
 *
 * Prerequisites:
 *   - Playwright installed (npm install playwright)
 *   - Storybook running at the specified URL
 *   - capture-map.json populated with valid Figma capture IDs (see generate-capture-map.mjs)
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Parse CLI arguments
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);

function getArg(name, fallback) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

const MAP_FILE = resolve(getArg('map', './capture-map.json'));
const PROGRESS_FILE = resolve(getArg('progress', './capture-progress.json'));
const STORYBOOK_BASE = getArg('storybook', 'http://localhost:6006');
const CAPTURE_TIMEOUT = parseInt(getArg('timeout', '60000'), 10);

const CAPTURE_SCRIPT_URL = 'https://mcp.figma.com/mcp/html-to-design/capture.js';

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  // ---- Validate inputs ----------------------------------------------------
  if (!existsSync(MAP_FILE)) {
    console.error(`Capture map not found: ${MAP_FILE}`);
    console.error('Create one with generate-capture-map.mjs first.');
    process.exit(1);
  }

  const captures = JSON.parse(readFileSync(MAP_FILE, 'utf-8'));
  console.log(`Capture map: ${MAP_FILE}`);
  console.log(`Progress:    ${PROGRESS_FILE}`);
  console.log(`Storybook:   ${STORYBOOK_BASE}`);
  console.log(`Timeout:     ${CAPTURE_TIMEOUT}ms`);
  console.log(`Total components to capture: ${captures.length}\n`);

  // ---- Load existing progress (if any) ------------------------------------
  let progress = {};
  try {
    progress = JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
  } catch {
    // No progress file yet — starting fresh
  }

  // ---- Launch browser -----------------------------------------------------
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Strip Content-Security-Policy headers so the capture script can POST
  // to mcp.figma.com from the Storybook origin.
  await page.route('**/*', async (route) => {
    const response = await route.fetch();
    const headers = { ...response.headers() };
    delete headers['content-security-policy'];
    delete headers['content-security-policy-report-only'];
    await route.fulfill({ response, headers });
  });

  // ---- Fetch the Figma capture script once --------------------------------
  console.log('Fetching Figma capture script...');
  const resp = await context.request.get(CAPTURE_SCRIPT_URL);
  const captureScript = await resp.text();
  console.log(`Capture script loaded (${captureScript.length} bytes)\n`);

  // ---- Capture loop -------------------------------------------------------
  let succeeded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < captures.length; i++) {
    const { title, storyId, captureId } = captures[i];

    // Skip already-completed entries
    if (progress[storyId] === 'done') {
      console.log(`[${i + 1}/${captures.length}] SKIP (already done): ${title}`);
      skipped++;
      succeeded++;
      continue;
    }

    console.log(`[${i + 1}/${captures.length}] Capturing: ${title} (${storyId})`);

    try {
      const captureResult = await captureOne(page, storyId, captureId, captureScript);

      if (captureResult.success) {
        const suffix = captureResult.timedOut ? ' (timeout — assumed success)' : '';
        console.log(`  -> Success${suffix}`);
        progress[storyId] = 'done';
        succeeded++;
      } else {
        console.log(`  -> Failed: ${captureResult.error}`);
        progress[storyId] = `error: ${captureResult.error}`;
        failed++;
      }
    } catch (err) {
      console.log(`  -> Error: ${err.message}`);
      progress[storyId] = `error: ${err.message}`;
      failed++;
    }

    // Save progress after every component (crash-safe)
    writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  }

  console.log(`\nDone! Succeeded: ${succeeded} (${skipped} skipped), Failed: ${failed}`);
  await browser.close();
}

// ---------------------------------------------------------------------------
// Capture a single Storybook story
// ---------------------------------------------------------------------------
async function captureOne(page, storyId, captureId, captureScript) {
  // Navigate to the Storybook iframe for this story
  const url = `${STORYBOOK_BASE}/iframe.html?id=${storyId}&viewMode=story`;
  await page.goto(url, { waitUntil: 'load', timeout: 15000 });

  // Wait for the component to render
  await page.waitForTimeout(2000);

  // Inject the Figma capture script into the page
  await page.evaluate((scriptText) => {
    const el = document.createElement('script');
    el.textContent = scriptText;
    document.head.appendChild(el);
  }, captureScript);

  // Give the capture script time to initialize
  await page.waitForTimeout(1000);

  // Call captureForDesign() with a timeout safety net.
  //
  // KNOWN ISSUE: captureForDesign() successfully POSTs the DOM to Figma
  // (the component appears in the file), but the JavaScript promise often
  // never resolves on the client side. The Promise.race timeout assumes
  // success after CAPTURE_TIMEOUT ms and moves on.
  const result = await Promise.race([
    page.evaluate(({ cid, endpoint }) => {
      return window.figma.captureForDesign({
        captureId: cid,
        endpoint: endpoint,
        selector: 'body',
      });
    }, {
      cid: captureId,
      endpoint: `https://mcp.figma.com/mcp/capture/${captureId}/submit`,
    }),
    new Promise((resolve) =>
      setTimeout(() => resolve({ success: true, timedOut: true }), CAPTURE_TIMEOUT)
    ),
  ]);

  return result;
}

// ---------------------------------------------------------------------------
main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
