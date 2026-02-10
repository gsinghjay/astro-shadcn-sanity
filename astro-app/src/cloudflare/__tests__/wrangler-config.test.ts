import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { parse as parseToml } from "@iarna/toml";

const ROOT = resolve(__dirname, "../../../..");
const ASTRO_APP = resolve(__dirname, "../../..");

/** Parse the root wrangler.toml */
function loadRootWranglerToml(): Record<string, unknown> {
  const path = resolve(ROOT, "wrangler.toml");
  const content = readFileSync(path, "utf-8");
  return parseToml(content) as Record<string, unknown>;
}

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

describe("Wrangler config — root wrangler.toml", () => {
  it("exists at project root", () => {
    expect(existsSync(resolve(ROOT, "wrangler.toml"))).toBe(true);
  });

  it("has required name field", () => {
    const config = loadRootWranglerToml();
    expect(config.name).toBe("ywcc-capstone");
  });

  it("points pages_build_output_dir to astro-app/dist", () => {
    const config = loadRootWranglerToml();
    expect(config.pages_build_output_dir).toBe("astro-app/dist");
  });

  it("has a compatibility_date", () => {
    const config = loadRootWranglerToml();
    expect(config.compatibility_date).toBeDefined();
    expect(typeof config.compatibility_date).toBe("string");
    // Should be a valid YYYY-MM-DD format
    expect(config.compatibility_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("has nodejs_compat flag enabled", () => {
    const config = loadRootWranglerToml();
    expect(config.compatibility_flags).toContain("nodejs_compat");
  });
});

describe("Wrangler config — astro-app/wrangler.jsonc", () => {
  it("exists in astro-app", () => {
    expect(existsSync(resolve(ASTRO_APP, "wrangler.jsonc"))).toBe(true);
  });

  it("has matching name with root config", () => {
    const root = loadRootWranglerToml();
    const app = loadAppWranglerJsonc();
    expect(app.name).toBe(root.name);
  });

  it("has matching compatibility_date with root config", () => {
    const root = loadRootWranglerToml();
    const app = loadAppWranglerJsonc();
    expect(app.compatibility_date).toBe(root.compatibility_date);
  });

  it("has matching compatibility_flags with root config", () => {
    const root = loadRootWranglerToml();
    const app = loadAppWranglerJsonc();
    expect(app.compatibility_flags).toEqual(root.compatibility_flags);
  });

  it("pages_build_output_dir points to ./dist", () => {
    const app = loadAppWranglerJsonc();
    expect(app.pages_build_output_dir).toBe("./dist");
  });
});

describe("Wrangler config — consistency", () => {
  it("root output dir resolves to same location as app output dir", () => {
    const root = loadRootWranglerToml();
    const app = loadAppWranglerJsonc();

    // Root says "astro-app/dist", app says "./dist" — both resolve to astro-app/dist
    const rootResolved = resolve(ROOT, root.pages_build_output_dir as string);
    const appResolved = resolve(ASTRO_APP, app.pages_build_output_dir as string);
    expect(rootResolved).toBe(appResolved);
  });
});
