import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";

const DIST = resolve(__dirname, "../../../dist");

/**
 * These tests validate the Cloudflare Workers build output (Astro 6 / @astrojs/cloudflare v13).
 * Structure: dist/client/ (static assets), dist/server/ (worker entry).
 * They require `npm run build --workspace=astro-app` to have run first.
 */
const describeIfBuilt = existsSync(DIST) ? describe : describe.skip;

describeIfBuilt("Build output — Cloudflare Workers structure", () => {
  it("dist/ directory exists", () => {
    expect(existsSync(DIST)).toBe(true);
  });

  it("dist/server/ directory exists (worker entrypoint)", () => {
    expect(existsSync(resolve(DIST, "server"))).toBe(true);
  });

  it("dist/server/entry.mjs exists (main worker script)", () => {
    expect(existsSync(resolve(DIST, "server/entry.mjs"))).toBe(true);
  });

  it("dist/client/ directory exists (static assets)", () => {
    expect(existsSync(resolve(DIST, "client"))).toBe(true);
  });

  it("dist/client/_astro/ contains hashed JS bundles", () => {
    const files = readdirSync(resolve(DIST, "client/_astro"));
    const jsFiles = files.filter((f) => f.endsWith(".js"));
    expect(jsFiles.length).toBeGreaterThan(0);
  });

  it("published pages are prerendered as static HTML", () => {
    const indexHtml = resolve(DIST, "client/index.html");
    expect(existsSync(indexHtml), "index.html should exist (prerendered)").toBe(true);
  });

  it("server chunks include server island map", () => {
    const chunksDir = resolve(DIST, "server/chunks");
    const chunks = readdirSync(chunksDir).filter((f) => f.endsWith(".mjs"));
    const allChunks = chunks.map((f) => readFileSync(resolve(chunksDir, f), "utf-8")).join("\n");
    expect(allChunks).toContain("serverIslandMap");
    expect(allChunks).toContain("SanityPageContent");
  });

  it("_headers file exists in client dir (Cloudflare custom headers)", () => {
    expect(existsSync(resolve(DIST, "client/_headers"))).toBe(true);
  });

  it("dist/server/wrangler.json exists (auto-generated worker config)", () => {
    expect(existsSync(resolve(DIST, "server/wrangler.json"))).toBe(true);
  });
});
