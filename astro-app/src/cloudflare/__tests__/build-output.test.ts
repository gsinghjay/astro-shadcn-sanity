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

  it("all pages are SSR-rendered via catch-all route (no prerendered HTML)", () => {
    // After Story 2.2b, all pages are served by [...slug].astro (SSR)
    // so no prerendered HTML files should exist for these routes
    const ssrPages = ["about", "contact", "projects", "sponsors"];
    for (const page of ssrPages) {
      const indexPath = resolve(DIST, page, "index.html");
      expect(existsSync(indexPath), `${page}/index.html should NOT exist (SSR)`).toBe(false);
    }
  });

  it("_headers file exists (Cloudflare custom headers)", () => {
    expect(existsSync(resolve(DIST, "_headers"))).toBe(true);
  });
});
