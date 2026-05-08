import { describe, test, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../../..");
const astroApp = resolve(repoRoot, "astro-app");
const sitemapPath = resolve(astroApp, "dist/client/sitemap-0.xml");
const hasBuildArtifact = existsSync(sitemapPath);

describe("Story 5.23 — /search SEO posture preserved", () => {
  test("astro.config.mjs sitemap filter excludes /search and /search/* (URL-form aware)", () => {
    const config = readFileSync(
      resolve(astroApp, "astro.config.mjs"),
      "utf8",
    );
    // Story 5.23 corrects 5.15's path-form check (page === '/search') which
    // silently no-op'd because Astro's sitemap filter receives full URLs.
    expect(config).toMatch(/!page\.endsWith\(['"]\/search['"]\)/);
    expect(config).toMatch(/!page\.endsWith\(['"]\/search\/['"]\)/);
    expect(config).toMatch(/!page\.includes\(['"]\/search\/['"]\)/);
  });

  // Build-artifact assertion. Vitest runs before `astro build` in CI, so this
  // only fires after a local build. Use `test.skipIf` so the skip is visible in
  // the output — the prior `try { ... } catch { return; }` was a silent no-op.
  test.skipIf(!hasBuildArtifact)(
    "dist sitemap-0.xml omits /search/ (build-output assertion)",
    () => {
      const xml = readFileSync(sitemapPath, "utf8");
      expect(xml).not.toMatch(/<loc>[^<]*\/search\/?<\/loc>/);
    },
  );

  test("astro-llms-md exclude list omits search and **/search/**", () => {
    const config = readFileSync(
      resolve(astroApp, "astro.config.mjs"),
      "utf8",
    );
    expect(config).toContain("'search'");
    expect(config).toContain("'**/search/**'");
  });

  test("robots.txt.ts disallows /search for both default + Cloudflare-AI-Search", () => {
    const robots = readFileSync(
      resolve(astroApp, "src/pages/robots.txt.ts"),
      "utf8",
    );
    const matches = robots.match(/Disallow:\s+\/search/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  test("pages/search.astro passes seo={{ noIndex: true }} to Layout", () => {
    const page = readFileSync(
      resolve(astroApp, "src/pages/search.astro"),
      "utf8",
    );
    expect(page).toMatch(/seo=\{\{\s*noIndex:\s*true\s*\}\}/);
  });

  test("pages/search.astro no longer renders <search-bar-snippet> (excluding doc comments)", () => {
    const page = readFileSync(
      resolve(astroApp, "src/pages/search.astro"),
      "utf8",
    );
    // Strip /* ... */ comments before scanning for vendor element usage.
    const stripped = page.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(stripped).not.toContain("<search-bar-snippet");
    expect(stripped).not.toContain("search-bar-shell");
  });

  test("Header.astro skip-mounts SearchModal on /search via isSearchPage gate", () => {
    const header = readFileSync(
      resolve(astroApp, "src/components/Header.astro"),
      "utf8",
    );
    expect(header).toContain("isSearchPage");
    expect(header).toMatch(/!isSearchPage/);
  });

  test("AC 13a — search.astro renders unavailable panel when searchAvailable is false", () => {
    const page = readFileSync(
      resolve(astroApp, "src/pages/search.astro"),
      "utf8",
    );
    // Disabled-state guard remains.
    expect(page).toContain("searchAvailable");
    expect(page).toMatch(/Search is currently unavailable/);
    // Disabled state panel does NOT receive the query (AC 4 disabled — no leakage).
    // Pattern: the JSX below the !searchAvailable ternary must NOT reference initialQuery.
    const disabledBranch = page.match(/!searchAvailable[\s\S]*?:\s*\(/);
    expect(disabledBranch).not.toBeNull();
    if (disabledBranch) {
      expect(disabledBranch[0]).not.toContain("initialQuery");
    }
  });

  test("AC 13g — search.astro reuses 5.15 URL allowlist (https-only, reject userinfo, normalize origin+pathname)", () => {
    const page = readFileSync(
      resolve(astroApp, "src/pages/search.astro"),
      "utf8",
    );
    expect(page).toMatch(/u\.protocol !== ['"]https:['"]/);
    expect(page).toMatch(/u\.username \|\| u\.password/);
    expect(page).toMatch(/u\.origin \+ u\.pathname/);
  });

  // AC 13g (runtime) — exercise the same predicate against bad inputs to prove
  // it actually rejects them. The validator is currently inlined as an IIFE in
  // search.astro frontmatter; this test mirrors that logic so a future drift in
  // the page's IIFE is caught by the source-text test above. TODO: extract the
  // validator into `lib/search-api-url.ts` and import in both call sites.
  test("AC 13g (runtime) — URL allowlist rejects http/credentials/scheme-less", () => {
    const validate = (raw: string): string => {
      if (!raw) return "";
      try {
        const u = new URL(raw);
        if (u.protocol !== "https:") return "";
        if (u.username || u.password) return "";
        return u.origin + u.pathname;
      } catch {
        return "";
      }
    };
    expect(validate("http://example.com/")).toBe("");
    expect(validate("https://user:pass@example.com/")).toBe("");
    expect(validate("https://:pass@example.com/")).toBe("");
    expect(validate("https://user@example.com/")).toBe("");
    expect(validate("ftp://example.com/")).toBe("");
    expect(validate("not-a-url")).toBe("");
    expect(validate("")).toBe("");
    expect(validate("https://example.com/")).toBe("https://example.com/");
    expect(validate("https://example.com/api/search")).toBe(
      "https://example.com/api/search",
    );
  });

  test("search.astro mounts the SearchResults React island via client:load", () => {
    const page = readFileSync(
      resolve(astroApp, "src/pages/search.astro"),
      "utf8",
    );
    expect(page).toContain("SearchResults");
    expect(page).toContain("client:load");
    expect(page).toContain("@/components/react/SearchResults");
  });

  test("search.astro reads initialQuery server-side from Astro.url.searchParams", () => {
    const page = readFileSync(
      resolve(astroApp, "src/pages/search.astro"),
      "utf8",
    );
    expect(page).toContain("Astro.url.searchParams.get(\"q\")");
    // 256-char cap mirrors 5.15 MAX_QUERY_LENGTH.
    expect(page).toMatch(/slice\(0,\s*256\)/);
  });
});
