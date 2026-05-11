#!/usr/bin/env node
/**
 * Story 26.1 (O-2) postbuild step.
 *
 * Patches the @astrojs/cloudflare adapter's worker-entry chunk so requests
 * carrying a Sanity preview cookie bypass the prerendered-HTML short-circuit
 * and dispatch through the SSR pipeline. This lets the existing middleware →
 * AsyncLocalStorage → loadQuery(perspective:'drafts') chain render real-time
 * drafts on routes that are otherwise prerendered for cookieless traffic.
 *
 * Three surgical replacements in dist/server/chunks/worker-entry_*.mjs:
 *
 *   1. Asset short-circuit (handle()): gated on `!hasPreviewCookie` so
 *      cookieless traffic still serves prerendered HTML from ASSETS.
 *   2. app.match(request): pass `allowPrerenderedRoutes = hasPreviewCookie`
 *      so prerendered routes return a match (instead of `undefined`) when
 *      the cookie is present.
 *   3. After match, clone routeData with `prerender:false` when the cookie
 *      is present. The renderer's middleware-skip gate keys off
 *      `routeData.prerender`; without this, ALS would not be set and
 *      loadQuery() would use the published perspective.
 *
 * Idempotent via the MARKER line. The chunk filename is read dynamically
 * from dist/server/entry.mjs so it tracks every fresh build (mirrors the
 * Story 5.21 agent-discovery wrapper's shape).
 *
 * Why patch the chunk and not entry.mjs: the asset short-circuit and the
 * match() call live inside the chunk's handle() function. The chunk's only
 * export (`workerEntry as w`) wraps both, so a higher-level wrapper can't
 * compose around them — we have to patch the source.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ENTRY_PATH = join(__dirname, "../dist/server/entry.mjs");
const SERVER_DIR = join(__dirname, "../dist/server");
const MARKER = "// >>> preview-cookie-routing (Story 26.1 O-2)";

if (!existsSync(ENTRY_PATH)) {
  console.warn(`[wrap-entry-for-preview-cookie] ${ENTRY_PATH} missing — skipping`);
  process.exit(0);
}

const entrySource = readFileSync(ENTRY_PATH, "utf8");
const chunkMatch = entrySource.match(
  /from\s+["'](\.\/chunks\/worker-entry_[^"']+\.mjs)["']/,
);
if (!chunkMatch) {
  console.error(
    "[wrap-entry-for-preview-cookie] couldn't find worker-entry chunk import in entry.mjs — aborting",
  );
  process.exit(1);
}
const chunkRelPath = chunkMatch[1];
const chunkPath = join(SERVER_DIR, chunkRelPath);

if (!existsSync(chunkPath)) {
  console.error(`[wrap-entry-for-preview-cookie] ${chunkPath} missing — aborting`);
  process.exit(1);
}

const original = readFileSync(chunkPath, "utf8");
if (original.includes(MARKER)) {
  console.log("[wrap-entry-for-preview-cookie] chunk already patched — skipping");
  process.exit(0);
}

const ASSET_SHORTCIRCUIT = `if (app.manifest.assets.has(requestPathname)) {
    return env2.ASSETS.fetch(request.url.replace(/\\.html$/, ""));
  }`;

const ASSET_SHORTCIRCUIT_PATCHED = `${MARKER}
  // Cookie-bearing requests bypass the prerender short-circuit so they SSR
  // through middleware → AsyncLocalStorage → loadQuery(drafts). Cookieless
  // traffic keeps the asset short-circuit — zero LCP cost on the 93% path.
  const __hasPreviewCookie = /(?:^|;\\s*)(?:__Secure-sanity-preview|sanity-preview)=/.test(request.headers.get("cookie") || "");
  if (!__hasPreviewCookie && app.manifest.assets.has(requestPathname)) {
    return env2.ASSETS.fetch(request.url.replace(/\\.html$/, ""));
  }`;

const MATCH_CALL = `routeData = app.match(request);`;
const MATCH_CALL_PATCHED = `routeData = app.match(request, __hasPreviewCookie);`;

const POSTMATCH_TARGET = `  if (!routeData) {
    const asset = await env2.ASSETS.fetch(`;

const POSTMATCH_PATCHED = `  if (__hasPreviewCookie && routeData && routeData.prerender) {
    // Clone routeData with prerender:false so the renderer runs middleware
    // (the middleware-skip gate inside render() keys off routeData.prerender).
    // Mutating the shared manifest object would race across concurrent
    // requests in the same isolate, so clone first.
    routeData = { ...routeData, prerender: false };
  }
  if (!routeData) {
    const asset = await env2.ASSETS.fetch(`;

if (!original.includes(ASSET_SHORTCIRCUIT)) {
  console.error(
    "[wrap-entry-for-preview-cookie] couldn't locate asset short-circuit block — adapter version drift?",
  );
  process.exit(1);
}
if (!original.includes(MATCH_CALL)) {
  console.error(
    "[wrap-entry-for-preview-cookie] couldn't locate app.match(request) call — adapter version drift?",
  );
  process.exit(1);
}
if (!original.includes(POSTMATCH_TARGET)) {
  console.error(
    "[wrap-entry-for-preview-cookie] couldn't locate post-match insert target — adapter version drift?",
  );
  process.exit(1);
}

const patched = original
  .replace(ASSET_SHORTCIRCUIT, ASSET_SHORTCIRCUIT_PATCHED)
  .replace(MATCH_CALL, MATCH_CALL_PATCHED)
  .replace(POSTMATCH_TARGET, POSTMATCH_PATCHED);

writeFileSync(chunkPath, patched);
console.log(`[wrap-entry-for-preview-cookie] patched ${chunkRelPath}`);
