import { describe, it, expect } from "vitest";
import {
  sponsorsPage,
  aboutPage,
  projectsPage,
  contactPage,
} from "@/lib/data";

/**
 * Validates mock data structures match the expected shape
 * for rendering via BlockRenderer. Catches structural regressions
 * when types or block schemas change.
 */
describe("Mock data — structural validation", () => {
  const pages = [
    { name: "sponsors", data: sponsorsPage },
    { name: "about", data: aboutPage },
    { name: "projects", data: projectsPage },
    { name: "contact", data: contactPage },
  ];

  it.each(pages)("$name page has required top-level fields", ({ data }) => {
    expect(data).toHaveProperty("title");
    expect(data).toHaveProperty("blocks");
    expect(typeof data.title).toBe("string");
    expect(Array.isArray(data.blocks!)).toBe(true);
  });

  it.each(pages)(
    "$name page blocks all have _type and _key",
    ({ data }) => {
      for (const block of data.blocks!) {
        expect(block).toHaveProperty("_type");
        expect(block).toHaveProperty("_key");
        expect(typeof block._type).toBe("string");
        expect(typeof block._key).toBe("string");
        expect(block._key.length).toBeGreaterThan(0);
      }
    },
  );

  it.each(pages)(
    "$name page block _keys are unique",
    ({ data }) => {
      const keys = data.blocks!.map(
        (b: { _key: string }) => b._key,
      );
      expect(new Set(keys).size).toBe(keys.length);
    },
  );

  it("sponsors page contains sponsorCards or sponsorSteps block", () => {
    const types = sponsorsPage.blocks!.map(
      (b: { _type: string }) => b._type,
    );
    expect(
      types.some((t: string) => t === "sponsorCards" || t === "sponsorSteps"),
    ).toBe(true);
  });

  it("contact page contains contactForm block", () => {
    const types = contactPage.blocks!.map(
      (b: { _type: string }) => b._type,
    );
    expect(types).toContain("contactForm");
  });
});
