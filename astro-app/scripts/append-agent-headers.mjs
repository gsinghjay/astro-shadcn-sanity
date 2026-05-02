#!/usr/bin/env node
/**
 * Story 5.21 postbuild step.
 *
 * Walks `dist/client/*.md` and appends per-path Link rules to the deployed
 * `_headers` so each prerendered page advertises its `.md` twin. The base
 * three Link members are emitted globally by the `/*` rule in
 * `public/_headers`; this script appends the *4th* member per page.
 *
 * Why a postbuild script rather than middleware: `@astrojs/cloudflare` v13
 * short-circuits prerendered HTML inside the adapter's worker entry (see
 * `dist/server/chunks/worker-entry_*.mjs:18289` — `if (app.manifest.assets.has
 * (requestPathname)) return env2.ASSETS.fetch(...)`). The middleware is never
 * invoked for prerendered pages, so per-page Link headers cannot be set
 * dynamically. Workers Static Assets `_headers` rules apply to those
 * responses and give us a static-but-conditional header fallback.
 *
 * Idempotent: re-running over an already-decorated `_headers` is a no-op.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST_CLIENT = join(__dirname, "../dist/client");
const HEADERS_FILE = join(DIST_CLIENT, "_headers");
const SECTION_BEGIN = "# >>> agent-discovery (Story 5.21) — auto-generated, do not edit by hand";
const SECTION_END = "# <<< agent-discovery";

/** Walk a directory recursively, returning all `.md` paths relative to it. */
function walkMd(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkMd(full, base));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      out.push("/" + relative(base, full).replace(/\\/g, "/"));
    }
  }
  return out;
}

/** Resolve the page path that a `.md` twin corresponds to. CF Workers Static
 *  Assets canonicalises non-root URLs to trailing-slash form before matching
 *  `_headers` (default `html_handling: "auto-trailing-slash"`), so non-root
 *  rules MUST end with `/` to match the served asset. The homepage stays `/`.
 *  - `/.md` → `/`
 *  - `/sponsors.md` → `/sponsors/`
 *  - `/articles/foo.md` → `/articles/foo/`
 */
function pagePathForTwin(twinPath) {
  if (twinPath === "/.md") return "/";
  return twinPath.replace(/\.md$/, "/");
}

function buildSection(twins) {
  // Per-path rules only need the 4th Link member (the page's .md twin); the
  // base three are already emitted by the `/*` wildcard rule and Workers
  // Static Assets merges wildcard + path-specific Link headers additively.
  // Same with `Vary: Accept` — wildcard provides it.
  const lines = [SECTION_BEGIN];
  for (const twin of twins.sort()) {
    const page = pagePathForTwin(twin);
    lines.push(page);
    lines.push(`  Link: <${twin}>; rel="alternate"; type="text/markdown"`);
    lines.push("");
  }
  lines.push(SECTION_END);
  return lines.join("\n");
}

function main() {
  let original;
  try {
    original = readFileSync(HEADERS_FILE, "utf8");
  } catch {
    console.warn(`[append-agent-headers] ${HEADERS_FILE} missing — skipping`);
    return;
  }

  let twins;
  try {
    twins = walkMd(DIST_CLIENT);
  } catch {
    console.warn(`[append-agent-headers] no dist/client — skipping`);
    return;
  }

  if (twins.length === 0) {
    console.warn(`[append-agent-headers] no .md twins found — skipping`);
    return;
  }

  const section = buildSection(twins);
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cleaned = original.replace(
    new RegExp(`\\n*${escape(SECTION_BEGIN)}[\\s\\S]*?${escape(SECTION_END)}\\n*`),
    "\n",
  );
  const next = `${cleaned.trimEnd()}\n\n${section}\n`;

  if (next === original) {
    console.log(`[append-agent-headers] _headers already up to date`);
    return;
  }

  writeFileSync(HEADERS_FILE, next);
  console.log(`[append-agent-headers] appended ${twins.length} per-page Link rules`);
}

main();
