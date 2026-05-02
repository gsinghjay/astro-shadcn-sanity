/**
 * Story 5.21: Agent discovery — RFC 8288 Link headers + Accept: text/markdown.
 *
 * Exercises the live contract through the Playwright preview server (built
 * Astro Worker). Uses request.fetch (APIRequestContext) so we can drive
 * arbitrary headers — Page navigation can't override Accept the way an
 * agent does.
 *
 * @story 5-21
 */
import { test, expect } from "@playwright/test";

const PATHS = ["/", "/sponsors", "/projects"] as const;

test.describe("[P0] 5-21-E2E Link headers", () => {
  for (const path of PATHS) {
    test(`5-21-E2E-001 :: ${path} responds with Link header on HTML`, async ({ request }) => {
      const res = await request.get(path, { headers: { accept: "text/html" } });
      expect(res.status()).toBe(200);
      const link = res.headers()["link"] ?? "";
      expect(link, `Link header missing on ${path}`).toContain("</llms.txt>");
      expect(link).toContain('rel="describedby"');
      expect(link).toContain("</llms-full.txt>");
      expect(link).toContain("</sitemap-index.xml>");
      expect(link).toContain('rel="sitemap"');
      expect(link).toContain('type="text/markdown"');
    });

    test(`5-21-E2E-002 :: ${path} sets Vary: Accept on HTML`, async ({ request }) => {
      const res = await request.get(path, { headers: { accept: "text/html" } });
      const vary = res.headers()["vary"] ?? "";
      expect(vary.toLowerCase()).toContain("accept");
    });
  }
});

test.describe("[P0] 5-21-E2E Markdown negotiation", () => {
  for (const path of PATHS) {
    test(`5-21-E2E-003 :: ${path} returns markdown for Accept: text/markdown`, async ({ request }) => {
      const res = await request.get(path, { headers: { accept: "text/markdown" } });
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toMatch(/text\/markdown/);
      expect(res.headers()["vary"]?.toLowerCase()).toContain("accept");
      expect(res.headers()["link"] ?? "").toContain("</llms.txt>");
      const tokens = Number(res.headers()["x-markdown-tokens"]);
      expect(tokens).toBeGreaterThan(0);
      const body = await res.text();
      expect(body.length).toBeGreaterThan(0);
      // Sanity: not the HTML doctype
      expect(body.startsWith("<!doctype") || body.startsWith("<html")).toBe(false);
    });
  }

  test("5-21-E2E-004 :: HTML wins on Accept tie-break", async ({ request }) => {
    // markdown q=0.5 < html q=0.9 → HTML wins
    const res = await request.get("/", {
      headers: { accept: "text/markdown;q=0.5,text/html;q=0.9" },
    });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/text\/html/);
  });

  test("5-21-E2E-005 :: excluded path falls through to HTML, no 406", async ({ request }) => {
    // /portal/login is whitelisted in middleware (no auth) and is excluded
    // from the markdown corpus → must serve HTML, never 406.
    const res = await request.get("/portal/login", { headers: { accept: "text/markdown" } });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/text\/html/);
  });

  test("5-21-E2E-006 :: direct .md request unaffected by negotiation", async ({ request }) => {
    const res = await request.get("/sponsors.md");
    // Workers Static Assets serves .md as text/plain by default; the
    // negotiation layer must not rewrite this.
    expect([200, 404]).toContain(res.status());
    if (res.status() === 200) {
      const ct = res.headers()["content-type"] ?? "";
      expect(ct).not.toMatch(/text\/markdown/); // Static assets keep their default content-type
    }
  });
});
