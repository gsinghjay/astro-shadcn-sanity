import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const ASTRO_APP = resolve(__dirname, "../../..");

/** Parse the astro-app wrangler.jsonc (strip comments, preserve strings) */
function loadAppWranglerJsonc(): Record<string, unknown> {
  const path = resolve(ASTRO_APP, "wrangler.jsonc");
  const content = readFileSync(path, "utf-8");
  // Remove lines that are only comments (start with optional whitespace + //)
  // and strip trailing comments that aren't inside strings
  const stripped = content
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("//"))
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  return JSON.parse(stripped);
}

describe("Wrangler config — astro-app/wrangler.jsonc", () => {
  it("exists in astro-app", () => {
    expect(existsSync(resolve(ASTRO_APP, "wrangler.jsonc"))).toBe(true);
  });

  it("has required name field", () => {
    const app = loadAppWranglerJsonc();
    expect(app.name).toBe("ywcc-capstone");
  });

  it("has a valid compatibility_date", () => {
    const app = loadAppWranglerJsonc();
    expect(app.compatibility_date).toBeDefined();
    expect(typeof app.compatibility_date).toBe("string");
    expect(app.compatibility_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("has nodejs_compat flag enabled", () => {
    const app = loadAppWranglerJsonc();
    expect(app.compatibility_flags).toContain("nodejs_compat");
  });

  it("uses Workers Static Assets pointing to ./dist with ASSETS binding", () => {
    const app = loadAppWranglerJsonc();
    // Adapter v13 / post-Pages: `pages_build_output_dir` is replaced by an
    // `assets` block. The directory still points at the Astro `dist/` output;
    // the binding name `ASSETS` is what `@astrojs/cloudflare` reads at runtime.
    const assets = app.assets as { directory?: string; binding?: string } | undefined;
    expect(assets).toBeDefined();
    expect(assets?.directory).toBe("./dist");
    expect(assets?.binding).toBe("ASSETS");
    expect(app.pages_build_output_dir).toBeUndefined();
  });

  it("uses the unified Astro adapter entrypoint (not a built _worker.js path)", () => {
    const app = loadAppWranglerJsonc();
    // adapter v13 ships a static module entrypoint; do NOT change to dist/_worker.js/index.js.
    expect(app.main).toBe("@astrojs/cloudflare/entrypoints/server");
  });

  it("declares per-environment blocks for rwc_us and rwc_intl", () => {
    const app = loadAppWranglerJsonc();
    const envBlock = app.env as Record<string, { name?: string }> | undefined;
    expect(envBlock?.rwc_us?.name).toBe("rwc-us");
    expect(envBlock?.rwc_intl?.name).toBe("rwc-intl");
  });
});
