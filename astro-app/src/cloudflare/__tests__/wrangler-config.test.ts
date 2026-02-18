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

  it("pages_build_output_dir points to ./dist", () => {
    const app = loadAppWranglerJsonc();
    expect(app.pages_build_output_dir).toBe("./dist");
  });
});
