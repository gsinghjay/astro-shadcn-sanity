/**
 * Story 5.21: Agent discovery — markdown twin corpus shape.
 *
 * The runtime negotiation contract (Accept: text/markdown → .md body, plus
 * Link headers on HTML responses) is exercised end-to-end in
 * `tests/e2e/agent-discovery.spec.ts` against the Playwright preview server.
 * This file just asserts the build emitted the corpus the runtime negotiates
 * against — pure FS shape checks, skip-if-missing so unit-only runs stay
 * green.
 *
 * @story 5-21
 */
import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";

// Astro 6 + @astrojs/cloudflare v13 emits client output to dist/client/.
const DIST_CLIENT = resolve(__dirname, "../../../astro-app/dist/client");
const LLMS_TXT = join(DIST_CLIENT, "llms.txt");
const LLMS_FULL_TXT = join(DIST_CLIENT, "llms-full.txt");
const HOMEPAGE_TWIN = join(DIST_CLIENT, ".md");

const corpusPresent = existsSync(LLMS_TXT);
const describeIfBuilt = corpusPresent ? describe : describe.skip;

describeIfBuilt("Story 5-21: markdown corpus available for negotiation", () => {
  it("emits the homepage twin at /.md", () => {
    expect(existsSync(HOMEPAGE_TWIN)).toBe(true);
    const body = readFileSync(HOMEPAGE_TWIN, "utf8");
    expect(body.trim().length).toBeGreaterThan(0);
  });

  it("emits llms.txt and llms-full.txt the Link header advertises", () => {
    expect(existsSync(LLMS_TXT)).toBe(true);
    expect(existsSync(LLMS_FULL_TXT)).toBe(true);
  });

  it("emits at least three top-level .md twins", () => {
    const mdFiles = readdirSync(DIST_CLIENT, { withFileTypes: true })
      .filter(e => e.isFile() && e.name.endsWith(".md"))
      .map(e => e.name);
    expect(mdFiles.length).toBeGreaterThanOrEqual(3);
  });

  it("excludes portal/auth/student/demo paths from llms.txt index", () => {
    const body = readFileSync(LLMS_TXT, "utf8");
    for (const blocked of ["/portal/", "/auth/", "/student/", "/demo/"]) {
      expect(body).not.toContain(blocked);
    }
  });
});
