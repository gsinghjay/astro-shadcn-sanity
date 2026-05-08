#!/usr/bin/env node
/**
 * Tier-leak guard for the Vitest test.projects workspace (Story 27.2).
 *
 * The unit-node project does NOT include Astro's Vite chain — running an
 * experimental_AstroContainer test there fails at .astro / .css resolution.
 * This script greps the directories the unit-node project includes for
 * forbidden imports and exits non-zero if any leak is found.
 *
 * Run from CI before `npm run test:unit` so a leak surfaces loudly instead
 * of as a confusing "TypeError: Unknown file extension '.css'" runtime
 * error inside an unrelated test.
 */

import { execSync } from "node:child_process";
import { resolve, relative } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..", "..");
const astroApp = resolve(import.meta.dirname, "..");

// Directories whose .test.ts files MUST stay pure-Node (the unit-node tier).
// Mirror the unit-node `include` from astro-app/vitest.config.ts; do NOT
// list directories that legitimately import the Container API.
const unitNodeRoots = [
  "astro-app/src/lib/__tests__",
  "astro-app/src/cloudflare/__tests__",
  "astro-app/src/__tests__",
  "astro-app/src/pages/__tests__",
  "astro-app/src/pages/api",
  "astro-app/src/actions/__tests__",
  "studio/src/__tests__",
];

const forbiddenPatterns = [
  // experimental_AstroContainer or any astro/container import — the marker
  // for "this test renders .astro components and needs the Astro Vite chain".
  "experimental_AstroContainer",
  "from ['\\\"]astro/container",
  // Direct .astro imports — only unit-astro can compile these.
  "from ['\\\"][^'\\\"]+\\.astro['\\\"]",
];

const violations = [];

for (const dir of unitNodeRoots) {
  const fullDir = resolve(repoRoot, dir);
  for (const pattern of forbiddenPatterns) {
    let out = "";
    try {
      out = execSync(
        `grep -rEl ${JSON.stringify(pattern)} ${JSON.stringify(fullDir)} 2>/dev/null`,
        { encoding: "utf8" },
      );
    } catch (err) {
      // grep exits 1 when no matches — that's the success case here.
      if (err.status !== 1) throw err;
    }
    for (const file of out.split("\n").filter(Boolean)) {
      const rel = relative(repoRoot, file);
      // Only flag actual test files; ignore matches in helpers/fixtures.
      if (!rel.endsWith(".test.ts") && !rel.endsWith(".test.tsx")) continue;
      violations.push({ file: rel, pattern });
    }
  }
}

if (violations.length === 0) {
  console.log("[verify-test-tiers] OK — unit-node tier is clean.");
  process.exit(0);
}

console.error(
  "[verify-test-tiers] FAIL — unit-node tier contains tests that need unit-astro:",
);
for (const { file, pattern } of violations) {
  console.error(`  - ${file}  (matched: ${pattern})`);
}
console.error(
  "\nMove these files to a directory served by the unit-astro project, " +
    "or update astro-app/vitest.config.ts and this guard script in lockstep.",
);
process.exit(1);
