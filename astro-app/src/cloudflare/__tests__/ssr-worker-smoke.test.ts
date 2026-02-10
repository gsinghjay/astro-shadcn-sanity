import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Miniflare, createFetchMock } from "miniflare";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { resolve, relative } from "path";

const DIST = resolve(__dirname, "../../../dist");
const WORKER_DIR = resolve(DIST, "_worker.js");
const ASTRO_APP = resolve(__dirname, "../../..");

/**
 * Recursively collect all .js and .mjs files under the _worker.js directory
 * and build the explicit modules array that Miniflare needs.
 * (Miniflare can't auto-resolve dynamic import() specifiers in Astro's bundle.)
 */
function collectWorkerModules(): Array<{ type: "ESModule"; path: string }> {
  const modules: Array<{ type: "ESModule"; path: string }> = [];

  function walk(dir: string) {
    for (const entry of readdirSync(dir)) {
      const full = resolve(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (entry.endsWith(".mjs") || entry.endsWith(".js")) {
        modules.push({ type: "ESModule", path: full });
      }
    }
  }

  walk(WORKER_DIR);

  // Entry module (index.js) must be first
  modules.sort((a, b) => {
    const aIsEntry = a.path.endsWith("index.js") ? 0 : 1;
    const bIsEntry = b.path.endsWith("index.js") ? 0 : 1;
    return aIsEntry - bIsEntry;
  });

  return modules;
}

/**
 * Detect the Sanity project ID from .env or environment variables.
 * The built worker has the project ID baked in at build time, but we
 * need it here to mock the correct Sanity API origin
 * (https://<projectId>.api.sanity.io).
 */
function getSanityProjectId(): string {
  const envPath = resolve(ASTRO_APP, ".env");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    const match = content.match(
      /PUBLIC_SANITY_STUDIO_PROJECT_ID=["']?([^"'\n\r\s]+)/,
    );
    if (match) return match[1];
  }
  return (
    process.env.PUBLIC_SANITY_STUDIO_PROJECT_ID ||
    process.env.PUBLIC_SANITY_PROJECT_ID ||
    "placeholder"
  );
}

/** Wrap a value in the Sanity Content Lake response envelope. */
function groqResponse(result: unknown): string {
  return JSON.stringify({ result, ms: 1, query: "" });
}

/** Minimal site settings — just enough to prevent Layout render crashes. */
const SITE_SETTINGS_MOCK = {
  siteName: "Smoke Test Site",
  siteDescription: "SSR worker smoke test",
  navigationItems: [],
  ctaButton: null,
  footerContent: { text: "", copyrightText: "© 2025 Test" },
  socialLinks: [],
  contactInfo: { address: "", email: "test@test.com", phone: "" },
  footerLinks: [],
  resourceLinks: [],
  programLinks: [],
  currentSemester: "Fall 2025",
  logo: null,
  logoLight: null,
};

/** Minimal page data — enough for the [...slug] route to render. */
const PAGE_MOCK = {
  _id: "smoke-test-page",
  title: "Smoke Test Home",
  slug: "home",
  template: "default",
  description: "",
  blocks: [],
};

/**
 * SSR Worker Smoke Tests
 *
 * These tests start the built Cloudflare Pages worker inside Miniflare
 * and make real HTTP requests to verify SSR behaviour. They defend
 * against the class of bugs where the worker returns [object Object]
 * instead of HTML (e.g. missing nodejs_compat / disable_nodejs_process_v2).
 *
 * Requires: `npm run build --workspace=astro-app` to have run first.
 * In CI the build step runs before test:unit, so these execute naturally.
 */
const describeIfBuilt = existsSync(DIST) ? describe : describe.skip;

describeIfBuilt("SSR Worker Smoke Tests (Miniflare)", () => {
  let mf: Miniflare;
  let mockAgent: ReturnType<typeof createFetchMock>;

  beforeAll(async () => {
    const projectId = getSanityProjectId();

    mockAgent = createFetchMock();
    mockAgent.disableNetConnect();

    // Both siteSettings and page queries hit the same Sanity origin.
    // Return a combined mock that satisfies either GROQ projection.
    const mockBody = groqResponse({ ...SITE_SETTINGS_MOCK, ...PAGE_MOCK });
    const mockOpts = {
      headers: { "content-type": "application/json" },
    };

    // Mock api.sanity.io (useCdn: false) — GET and POST for long queries
    const sanityApi = mockAgent.get(
      `https://${projectId}.api.sanity.io`,
    );
    sanityApi
      .intercept({ method: "GET", path: /.*/ })
      .reply(200, mockBody, mockOpts)
      .persist();
    sanityApi
      .intercept({ method: "POST", path: /.*/ })
      .reply(200, mockBody, mockOpts)
      .persist();

    // Mock apicdn.sanity.io in case useCdn is ever toggled
    const sanityCdn = mockAgent.get(
      `https://${projectId}.apicdn.sanity.io`,
    );
    sanityCdn
      .intercept({ method: "GET", path: /.*/ })
      .reply(200, mockBody, mockOpts)
      .persist();

    mf = new Miniflare({
      modules: collectWorkerModules(),
      compatibilityDate: "2025-12-01",
      compatibilityFlags: ["nodejs_compat", "disable_nodejs_process_v2"],
      fetchMock: mockAgent,
    });
  }, 30_000);

  afterAll(async () => {
    await mf?.dispose();
  });

  // ── P0: Critical ─────────────────────────────────────────────
  // These catch the [object Object] class of runtime bugs.

  it("worker responds to GET / without crashing", async () => {
    const res = await mf.dispatchFetch("http://localhost/");
    expect(res.status).toBeLessThan(500);
  });

  it("GET / returns status 200", async () => {
    const res = await mf.dispatchFetch("http://localhost/");
    expect(res.status).toBe(200);
  });

  it("GET / returns text/html content-type", async () => {
    const res = await mf.dispatchFetch("http://localhost/");
    expect(res.headers.get("content-type")).toContain("text/html");
  });

  it("GET / returns valid HTML, not [object Object]", async () => {
    const res = await mf.dispatchFetch("http://localhost/");
    const body = await res.text();
    expect(body).not.toContain("[object Object]");
    expect(body).toMatch(/<!DOCTYPE html>|<html/i);
  });

  // ── P1: Important ────────────────────────────────────────────
  // SSR behaviour correctness.

  it("GET / HTML body is non-trivially sized (> 500 bytes)", async () => {
    const res = await mf.dispatchFetch("http://localhost/");
    const body = await res.text();
    expect(body.length).toBeGreaterThan(500);
  });

  it("GET / HTML contains <head> and <body> structure", async () => {
    const res = await mf.dispatchFetch("http://localhost/");
    const body = await res.text();
    expect(body).toMatch(/<head[\s>]/i);
    expect(body).toMatch(/<body[\s>]/i);
  });

  it("GET /nonexistent-route does not crash the worker", async () => {
    const res = await mf.dispatchFetch(
      "http://localhost/nonexistent-slug-xyz-404",
    );
    // With our universal mock, [...slug] renders the page (200).
    // Without mocks, Sanity would return null and Astro would redirect to /404.
    // Either way, the worker must not return a 500.
    expect(res.status).toBeLessThan(500);
    if (res.status === 200) {
      const body = await res.text();
      expect(body).toMatch(/<!DOCTYPE html>|<html/i);
    }
  });

  it("dynamic route with mocked Sanity data returns HTML", async () => {
    const res = await mf.dispatchFetch("http://localhost/home");
    if (res.status === 200) {
      const body = await res.text();
      expect(body).toMatch(/<!DOCTYPE html>|<html/i);
    } else {
      // Redirect or 404 is acceptable — mock might not match exact slug
      expect([301, 302, 404]).toContain(res.status);
    }
  });

  // ── P2: Hardening ────────────────────────────────────────────

  it("concurrent requests all complete without server errors", async () => {
    const requests = Array.from({ length: 3 }, () =>
      mf.dispatchFetch("http://localhost/"),
    );
    const responses = await Promise.all(requests);
    for (const res of responses) {
      expect(res.status).toBeLessThan(500);
    }
  });

  it("no response body contains raw [object Object]", async () => {
    const paths = ["/", "/about", "/contact"];
    for (const path of paths) {
      const res = await mf.dispatchFetch(`http://localhost${path}`);
      if (res.status === 200) {
        const body = await res.text();
        expect(
          body,
          `${path} should not contain [object Object]`,
        ).not.toContain("[object Object]");
      }
    }
  });
});
