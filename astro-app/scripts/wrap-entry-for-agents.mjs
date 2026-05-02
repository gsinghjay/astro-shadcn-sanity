#!/usr/bin/env node
/**
 * Story 5.21 postbuild step.
 *
 * Wraps the adapter-generated `dist/server/entry.mjs` with a thin Cloudflare
 * Worker fetch handler that runs **before** the @astrojs/cloudflare adapter's
 * own asset short-circuit (line ~18289 of `chunks/worker-entry_*.mjs`):
 *
 *   if (app.manifest.assets.has(requestPathname)) {
 *     return env2.ASSETS.fetch(request.url.replace(/\.html$/, ""));
 *   }
 *
 * Because that line runs before Astro's middleware pipeline, the project's
 * `src/middleware.ts` never sees prerendered HTML requests. We need to inject
 * markdown content negotiation BEFORE the adapter has a chance to delegate to
 * the asset binding. Do that here, on the Cloudflare-Worker entry point.
 *
 * Behaviour matrix:
 *   - `Accept: text/markdown` (q-ranked over text/html) AND path is a public
 *     content path AND `${path}.md` exists in ASSETS → serve the .md twin
 *     with content-type: text/markdown; charset=utf-8 + vary: Accept +
 *     x-markdown-tokens + Link header + content-signal.
 *   - Anything else (browsers, q=html-wins, excluded paths, missing twin)
 *     → delegate to the adapter as-is (HTML response, decorated by `_headers`
 *     for the static-assets path or by middleware for SSR responses).
 *
 * Idempotent: detects its own marker line at the top of `entry.mjs` and
 * skips re-wrapping. The `chunks/worker-entry_*.mjs` filename hash is read
 * dynamically from the unwrapped entry so it tracks every fresh build.
 *
 * Single source of truth: copies `src/lib/agent-discovery-runtime.mjs`
 * verbatim into `dist/server/agent-discovery-runtime.mjs` so the wrapper and
 * the TypeScript module in middleware share identical runtime logic.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ENTRY_PATH = join(__dirname, "../dist/server/entry.mjs");
const RUNTIME_SOURCE = join(__dirname, "../src/lib/agent-discovery-runtime.mjs");
const RUNTIME_PATH = join(__dirname, "../dist/server/agent-discovery-runtime.mjs");
const WRAPPER_PATH = join(__dirname, "../dist/server/agent-discovery-wrapper.mjs");
const MARKER = "// >>> agent-discovery-wrapper (Story 5.21)";

if (!existsSync(ENTRY_PATH)) {
  console.warn(`[wrap-entry-for-agents] ${ENTRY_PATH} missing — skipping`);
  process.exit(0);
}
if (!existsSync(RUNTIME_SOURCE)) {
  console.error(`[wrap-entry-for-agents] ${RUNTIME_SOURCE} missing — aborting`);
  process.exit(1);
}

const original = readFileSync(ENTRY_PATH, "utf8");
if (original.includes(MARKER)) {
  console.log("[wrap-entry-for-agents] entry already wrapped — skipping");
  process.exit(0);
}

// Pull the chunks/worker-entry_<hash>.mjs path out of the auto-generated
// entry so we can re-import it from the wrapper.
const importMatch = original.match(
  /import\s*{\s*w\s*}\s*from\s*["'](\.\/chunks\/worker-entry_[^"']+\.mjs)["']/,
);
if (!importMatch) {
  console.error("[wrap-entry-for-agents] couldn't find adapter chunk import — aborting");
  process.exit(1);
}
const chunkPath = importMatch[1];

const runtimeSource = readFileSync(RUNTIME_SOURCE, "utf8");
const runtimeOut = `${MARKER}\n// Auto-copied at postbuild from src/lib/agent-discovery-runtime.mjs.\n// Edit the source file, not this artifact.\n\n${runtimeSource}`;

const wrapperHelper = `${MARKER}
// Auto-generated wrapper helper. Imports shared runtime from
// ./agent-discovery-runtime.mjs (copied from src/lib/ at postbuild).
import {
  hasMarkdownTwin,
  markdownTwinPath,
  parseAcceptHeader,
  estimateTokens,
  buildLinkHeader,
  AGENT_CONTENT_SIGNAL,
} from "./agent-discovery-runtime.mjs";

export async function tryServeMarkdownTwin(request, env) {
  if (!env || !env.ASSETS) return null;
  const url = new URL(request.url);
  const path = url.pathname;
  if (path.endsWith(".md")) return null;
  if (!parseAcceptHeader(request.headers.get("accept")).prefersMarkdown) return null;
  if (!hasMarkdownTwin(path)) return null;
  const twinPath = markdownTwinPath(path);
  try {
    // Pass through original request (preserves UA, Range, etc.) so logs reflect
    // the real client and Range requests can short-circuit below.
    const twinResponse = await env.ASSETS.fetch(new Request(new URL(twinPath, url.origin), request));
    if (!twinResponse.ok) return null;
    // Range requests yield 206 with Content-Range; rewriting to 200 would strip
    // that header and break partial-content semantics. Fall through to the
    // adapter so the asset binding's native handling is preserved.
    if (twinResponse.status !== 200) return null;
    const body = await twinResponse.text();
    const tokens = estimateTokens(body);
    const headers = new Headers();
    headers.set("content-type", "text/markdown; charset=utf-8");
    headers.set("vary", "Accept");
    headers.set("link", buildLinkHeader(path, true));
    headers.set("x-markdown-tokens", String(tokens));
    headers.set("content-signal", AGENT_CONTENT_SIGNAL);
    const upstreamCacheControl = twinResponse.headers.get("cache-control");
    if (upstreamCacheControl) headers.set("cache-control", upstreamCacheControl);
    return new Response(body, { status: twinResponse.status, headers });
  } catch {
    return null;
  }
}
`;

const wrapped = `${MARKER}
globalThis.process ??= {};
globalThis.process.env ??= {};
// Side-effect import: registers the Workers runtime polyfills the adapter
// chunk relies on (env access, ExecutionContext, etc.). Must come before the
// adapter import so the chunk's top-level evaluation sees the binding shims.
import "cloudflare:workers";
import { w as adapterHandler } from "${chunkPath}";
import { tryServeMarkdownTwin } from "./agent-discovery-wrapper.mjs";

export default {
  async fetch(request, env, ctx) {
    const negotiated = await tryServeMarkdownTwin(request, env);
    if (negotiated) return negotiated;
    return adapterHandler.fetch(request, env, ctx);
  },
};
`;

writeFileSync(RUNTIME_PATH, runtimeOut);
writeFileSync(WRAPPER_PATH, wrapperHelper);
writeFileSync(ENTRY_PATH, wrapped);
console.log(`[wrap-entry-for-agents] wrapped ${ENTRY_PATH} → ${chunkPath}`);
