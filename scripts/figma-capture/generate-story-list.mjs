#!/usr/bin/env node
/**
 * Extracts every Storybook story from a running Storybook instance
 * and writes them to a JSON file.
 *
 * How it works:
 *   1. Fetches the Storybook index API (stories.json / index.json).
 *   2. Picks one story per component (the first/default story).
 *   3. Writes an array of { title, storyId } objects.
 *
 * Usage:
 *   node generate-story-list.mjs [--storybook <url>] [--output <path>] [--all]
 *
 * Defaults:
 *   --storybook  http://localhost:6006
 *   --output     ./component-stories.json
 *   --all        If set, include ALL stories (not just the first per component)
 *
 * Prerequisites:
 *   - Storybook running at the specified URL
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Parse CLI arguments
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);

function getArg(name, fallback) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

const STORYBOOK_BASE = getArg('storybook', 'http://localhost:6006');
const OUTPUT_FILE = resolve(getArg('output', './component-stories.json'));
const INCLUDE_ALL = args.includes('--all');

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`Storybook URL: ${STORYBOOK_BASE}`);

  // Storybook 7+ uses /index.json, older versions use /stories.json
  let storiesData;
  for (const endpoint of ['/index.json', '/stories.json']) {
    try {
      const url = `${STORYBOOK_BASE}${endpoint}`;
      console.log(`Trying ${url}...`);
      const resp = await fetch(url);
      if (resp.ok) {
        storiesData = await resp.json();
        console.log(`Found stories at ${endpoint}`);
        break;
      }
    } catch {
      // Try next endpoint
    }
  }

  if (!storiesData) {
    console.error('Could not fetch stories from Storybook. Is it running?');
    process.exit(1);
  }

  // The index has an "entries" (v7+) or "stories" (v6) property
  const entries = storiesData.entries || storiesData.stories || {};
  const allStories = Object.values(entries);

  console.log(`Total stories found: ${allStories.length}`);

  let output;

  if (INCLUDE_ALL) {
    // Include every story
    output = allStories.map((s) => ({
      title: s.title,
      storyId: s.id,
      name: s.name,
    }));
  } else {
    // One story per component (first/default story)
    // Group by component title, take the first story from each group
    const seen = new Map();
    for (const story of allStories) {
      if (!seen.has(story.title)) {
        seen.set(story.title, {
          title: story.title,
          storyId: story.id,
        });
      }
    }
    output = [...seen.values()];
  }

  // Sort alphabetically by title
  output.sort((a, b) => a.title.localeCompare(b.title));

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${output.length} components to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
