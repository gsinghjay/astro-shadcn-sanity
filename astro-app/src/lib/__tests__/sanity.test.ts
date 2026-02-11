import { describe, it, expect, vi, beforeEach } from "vitest";
import { sanityClient } from "sanity:client";

// Ensure Visual Editing is off for unit tests (getViteConfig loads .env)
vi.stubEnv("PUBLIC_SANITY_VISUAL_EDITING_ENABLED", "false");

// Must import AFTER stubbing env so module-level const picks up the stub
const { loadQuery, getSiteSettings, SITE_SETTINGS_QUERY, ALL_PAGE_SLUGS_QUERY, PAGE_BY_SLUG_QUERY } =
  await import("@/lib/sanity");

// Reset module state between tests (clears _siteSettingsCache)
beforeEach(() => {
  vi.restoreAllMocks();
});

describe("GROQ query definitions", () => {
  it("SITE_SETTINGS_QUERY is a non-empty string", () => {
    expect(typeof SITE_SETTINGS_QUERY).toBe("string");
    expect(SITE_SETTINGS_QUERY.length).toBeGreaterThan(0);
    expect(SITE_SETTINGS_QUERY).toContain('_type == "siteSettings"');
  });

  it("ALL_PAGE_SLUGS_QUERY targets page type with slug projection", () => {
    expect(ALL_PAGE_SLUGS_QUERY).toContain('_type == "page"');
    expect(ALL_PAGE_SLUGS_QUERY).toContain("slug.current");
  });

  it("PAGE_BY_SLUG_QUERY includes all block type projections", () => {
    const blockTypes = [
      "heroBanner",
      "featureGrid",
      "ctaBanner",
      "statsRow",
      "textWithImage",
      "logoCloud",
      "sponsorSteps",
      "richText",
      "faqSection",
      "contactForm",
      "sponsorCards",
    ];
    for (const blockType of blockTypes) {
      expect(PAGE_BY_SLUG_QUERY).toContain(`_type == "${blockType}"`);
    }
  });

  it("PAGE_BY_SLUG_QUERY uses $slug parameter", () => {
    expect(PAGE_BY_SLUG_QUERY).toContain("$slug");
  });
});

describe("loadQuery()", () => {
  it("calls sanityClient.fetch with query and params", async () => {
    const mockResult = { title: "Test" };
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: mockResult,
    } as never);

    const result = await loadQuery<{ title: string }>({
      query: '*[_type == "test"]',
      params: { id: "123" },
    });

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      '*[_type == "test"]',
      { id: "123" },
      expect.objectContaining({
        filterResponse: false,
        perspective: "published",
      }),
    );
    expect(result).toEqual(mockResult);
  });

  it("defaults params to empty object when not provided", async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: null,
    } as never);

    await loadQuery({ query: '*[_type == "test"]' });

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      '*[_type == "test"]',
      {},
      expect.any(Object),
    );
  });

  it("uses published perspective when visual editing is disabled", async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: null,
    } as never);

    await loadQuery({ query: "*" });

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      "*",
      {},
      expect.objectContaining({
        perspective: "published",
        stega: false,
      }),
    );
  });
});

describe("getSiteSettings()", () => {
  it("throws when no siteSettings document exists", async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: null,
    } as never);

    await expect(getSiteSettings()).rejects.toThrow(
      "No siteSettings document found",
    );
  });

  it("returns site settings when document exists", async () => {
    const mockSettings = {
      siteName: "Test Site",
      siteDescription: "A test site",
    };
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: mockSettings,
    } as never);

    const result = await getSiteSettings();
    expect(result).toEqual(mockSettings);
  });
});
