import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";

const DIST = resolve(__dirname, "../../../dist");

/**
 * These tests validate the Cloudflare Pages build output.
 * They require `npm run build --workspace=astro-app` to have run first.
 * In CI, the build step runs before unit tests, so these will pass.
 * Locally, run `npm run build --workspace=astro-app` before `npm run test:unit`.
 */
const describeIfBuilt = existsSync(DIST) ? describe : describe.skip;

describeIfBuilt("Build output — Cloudflare Pages structure", () => {
  it("dist/ directory exists", () => {
    expect(existsSync(DIST)).toBe(true);
  });

  it("_worker.js/ directory exists (Cloudflare Workers entrypoint)", () => {
    expect(existsSync(resolve(DIST, "_worker.js"))).toBe(true);
  });

  it("_worker.js/index.js exists (main worker script)", () => {
    expect(existsSync(resolve(DIST, "_worker.js/index.js"))).toBe(true);
  });

  it("_routes.json exists (Cloudflare Pages routing)", () => {
    expect(existsSync(resolve(DIST, "_routes.json"))).toBe(true);
  });

  it("_routes.json has valid structure", () => {
    const routes = JSON.parse(readFileSync(resolve(DIST, "_routes.json"), "utf-8"));
    expect(routes).toHaveProperty("version", 1);
    expect(routes).toHaveProperty("include");
    expect(routes).toHaveProperty("exclude");
    expect(Array.isArray(routes.include)).toBe(true);
    expect(Array.isArray(routes.exclude)).toBe(true);
  });

  it("_routes.json excludes static assets from worker", () => {
    const routes = JSON.parse(readFileSync(resolve(DIST, "_routes.json"), "utf-8"));
    // _astro/ contains hashed JS/CSS bundles — should be served as static
    expect(routes.exclude).toContain("/_astro/*");
  });

  it("_astro/ directory exists (client-side bundles)", () => {
    expect(existsSync(resolve(DIST, "_astro"))).toBe(true);
  });

  it("_astro/ contains hashed JS bundles", () => {
    const files = readdirSync(resolve(DIST, "_astro"));
    const jsFiles = files.filter((f) => f.endsWith(".js"));
    expect(jsFiles.length).toBeGreaterThan(0);
  });

  it("published pages are prerendered as static HTML", () => {
    // With output: "static" + server islands (Story 7.4),
    // all pages are prerendered at build time. The server island
    // handles only the dynamic content area via /_server-islands/*.
    const indexHtml = resolve(DIST, "index.html");
    expect(existsSync(indexHtml), "index.html should exist (prerendered)").toBe(true);
  });

  it("_routes.json excludes prerendered pages from worker", () => {
    const routes = JSON.parse(readFileSync(resolve(DIST, "_routes.json"), "utf-8"));
    // Root route should be excluded — served as static HTML, not by the worker
    expect(routes.exclude).toContain("/");
  });

  it("worker entry includes server island map", () => {
    const workerEntry = readFileSync(resolve(DIST, "_worker.js/index.js"), "utf-8");
    expect(workerEntry).toContain("serverIslandMap");
    expect(workerEntry).toContain("SanityPageContent");
  });

  it("_headers file exists (Cloudflare custom headers)", () => {
    expect(existsSync(resolve(DIST, "_headers"))).toBe(true);
  });
});
