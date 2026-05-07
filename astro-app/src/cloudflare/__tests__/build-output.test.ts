import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";

const DIST = resolve(__dirname, "../../../dist");
const CLIENT = resolve(DIST, "client");
const SERVER = resolve(DIST, "server");

/**
 * Validates the Cloudflare Workers Static Assets build output (Astro 6 +
 * `@astrojs/cloudflare` v13). Requires a prior `astro build` — gated by
 * `existsSync(DIST)` so CI without a build step skips the suite.
 *
 * Shape: with `output: "server"` and adapter v13, Astro emits TWO top-level
 * directories under `dist/`:
 *   - `dist/client/` — static assets (mounted as the ASSETS binding)
 *   - `dist/server/` — the Worker code (entry.mjs + chunks + adapter-generated
 *                     `wrangler.json`, which overrides the user-facing
 *                     `wrangler.jsonc` at deploy time).
 *
 * Pages-era artifacts (`dist/_worker.js/`, `dist/_routes.json`) are NO LONGER
 * emitted.
 */
const describeIfBuilt = existsSync(DIST) ? describe : describe.skip;

describeIfBuilt("Build output — Cloudflare Workers Static Assets", () => {
  it("dist/ exists with split client/ + server/ trees (adapter v13 layout)", () => {
    expect(existsSync(DIST)).toBe(true);
    expect(existsSync(CLIENT)).toBe(true);
    expect(existsSync(SERVER)).toBe(true);
  });

  it("does NOT emit dist/_worker.js (Pages-era artifact removed in adapter v13)", () => {
    expect(existsSync(resolve(DIST, "_worker.js"))).toBe(false);
  });

  it("does NOT emit dist/_routes.json (Pages routing replaced by Workers Static Assets)", () => {
    expect(existsSync(resolve(DIST, "_routes.json"))).toBe(false);
  });

  it("dist/client/_astro/ contains hashed JS bundles", () => {
    const astroDir = resolve(CLIENT, "_astro");
    expect(existsSync(astroDir)).toBe(true);
    const files = readdirSync(astroDir);
    const jsFiles = files.filter((f) => f.endsWith(".js"));
    expect(jsFiles.length).toBeGreaterThan(0);
  });

  it("public pages are prerendered as static HTML under dist/client/", () => {
    const indexHtml = resolve(CLIENT, "index.html");
    expect(existsSync(indexHtml), "dist/client/index.html should exist (prerendered)").toBe(true);
  });

  it("dist/client/_headers is emitted with the security baseline copied from public/_headers", () => {
    const headersPath = resolve(CLIENT, "_headers");
    expect(existsSync(headersPath)).toBe(true);
    const headers = readFileSync(headersPath, "utf-8");
    expect(headers).toContain("X-Content-Type-Options: nosniff");
    expect(headers).toContain("Referrer-Policy: strict-origin-when-cross-origin");
  });

  it("dist/server/entry.mjs is the Worker entrypoint", () => {
    expect(existsSync(resolve(SERVER, "entry.mjs"))).toBe(true);
  });

  it("dist/server/wrangler.json is the adapter-generated deploy config", () => {
    const generated = resolve(SERVER, "wrangler.json");
    expect(existsSync(generated)).toBe(true);
    const cfg = JSON.parse(readFileSync(generated, "utf-8")) as {
      main?: string;
      assets?: { directory?: string; binding?: string };
    };
    // Adapter rewrites `main` and `assets.directory` to per-build paths.
    expect(cfg.main).toBe("entry.mjs");
    expect(cfg.assets?.directory).toBe("../client");
    expect(cfg.assets?.binding).toBe("ASSETS");
  });
});
