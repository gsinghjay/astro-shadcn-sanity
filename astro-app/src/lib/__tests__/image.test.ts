import { describe, test, expect } from "vitest";
import { urlFor } from "@/lib/image";

const validSource = {
  _type: "image" as const,
  asset: {
    _ref: "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg",
    _type: "reference" as const,
  },
};

describe("urlFor", () => {
  test("returns image URL builder for valid source", () => {
    const result = urlFor(validSource);
    expect(result).toBeDefined();
    expect(typeof result.url).toBe("function");
  });

  test("generates CDN URL with project config", () => {
    const url = urlFor(validSource).url();
    expect(url).toContain("cdn.sanity.io");
    expect(url).toContain("test-project");
    expect(url).toContain("test-dataset");
  });

  test("supports builder chaining (width, height, format)", () => {
    const url = urlFor(validSource).width(400).height(300).format("webp").url();
    expect(url).toContain("w=400");
    expect(url).toContain("h=300");
    expect(url).toContain("fm=webp");
  });
});
