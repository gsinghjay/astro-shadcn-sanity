import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sanityClient } from "sanity:client";

// Ensure Visual Editing is off for unit tests (getViteConfig loads .env)
vi.stubEnv("PUBLIC_SANITY_VISUAL_EDITING_ENABLED", "false");

// Must import AFTER stubbing env so module-level const picks up the stub
const {
  loadQuery,
  getSiteSettings,
  getAllSponsors,
  getSponsorBySlug,
  getAllProjects,
  getProjectBySlug,
  resolveBlockSponsors,
  getSyncTags,
  resetSyncTags,
  SITE_SETTINGS_QUERY,
  ALL_PAGE_SLUGS_QUERY,
  ALL_SPONSORS_QUERY,
  ALL_SPONSOR_SLUGS_QUERY,
  SPONSOR_BY_SLUG_QUERY,
  ALL_PROJECTS_QUERY,
  ALL_PROJECT_SLUGS_QUERY,
  PROJECT_BY_SLUG_QUERY,
  PAGE_BY_SLUG_QUERY,
  EVENT_BY_SLUG_QUERY,
} = await import("@/lib/sanity");

// Reset module state between tests (clears _siteSettingsCache)
beforeEach(() => {
  vi.stubEnv("PUBLIC_SANITY_VISUAL_EDITING_ENABLED", "false");
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
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

  it("ALL_SPONSORS_QUERY targets sponsor type with full projection", () => {
    expect(ALL_SPONSORS_QUERY).toContain('_type == "sponsor"');
    expect(ALL_SPONSORS_QUERY).toContain("name");
    expect(ALL_SPONSORS_QUERY).toContain("slug.current");
    expect(ALL_SPONSORS_QUERY).toContain("tier");
    expect(ALL_SPONSORS_QUERY).toContain("featured");
    expect(ALL_SPONSORS_QUERY).toContain("order(name asc)");
  });

  it("ALL_SPONSOR_SLUGS_QUERY targets sponsor type with slug projection", () => {
    expect(ALL_SPONSOR_SLUGS_QUERY).toContain('_type == "sponsor"');
    expect(ALL_SPONSOR_SLUGS_QUERY).toContain("defined(slug.current)");
    expect(ALL_SPONSOR_SLUGS_QUERY).toContain("slug.current");
  });

  it("SPONSOR_BY_SLUG_QUERY fetches single sponsor by slug with all fields", () => {
    expect(SPONSOR_BY_SLUG_QUERY).toContain('_type == "sponsor"');
    expect(SPONSOR_BY_SLUG_QUERY).toContain("$slug");
    expect(SPONSOR_BY_SLUG_QUERY).toContain("name");
    expect(SPONSOR_BY_SLUG_QUERY).toContain("slug.current");
    expect(SPONSOR_BY_SLUG_QUERY).toContain("tier");
    expect(SPONSOR_BY_SLUG_QUERY).toContain("description");
    expect(SPONSOR_BY_SLUG_QUERY).toContain("website");
    expect(SPONSOR_BY_SLUG_QUERY).toContain("industry");
    expect(SPONSOR_BY_SLUG_QUERY).toContain("featured");
    expect(SPONSOR_BY_SLUG_QUERY).toContain("seo");
  });

  it("SPONSOR_BY_SLUG_QUERY includes projects sub-query", () => {
    expect(SPONSOR_BY_SLUG_QUERY).toContain('_type == "project"');
    expect(SPONSOR_BY_SLUG_QUERY).toContain("references(^._id)");
  });

  it("ALL_PROJECTS_QUERY targets project type with sponsor reference", () => {
    expect(ALL_PROJECTS_QUERY).toContain('_type == "project"');
    expect(ALL_PROJECTS_QUERY).toContain("sponsor->");
    expect(ALL_PROJECTS_QUERY).toContain("slug.current");
    expect(ALL_PROJECTS_QUERY).toContain("technologyTags");
    expect(ALL_PROJECTS_QUERY).toContain("order(title asc)");
  });

  it("ALL_PROJECT_SLUGS_QUERY targets project type with slug projection", () => {
    expect(ALL_PROJECT_SLUGS_QUERY).toContain('_type == "project"');
    expect(ALL_PROJECT_SLUGS_QUERY).toContain("defined(slug.current)");
    expect(ALL_PROJECT_SLUGS_QUERY).toContain("slug.current");
  });

  it("PROJECT_BY_SLUG_QUERY fetches single project by slug with all fields", () => {
    expect(PROJECT_BY_SLUG_QUERY).toContain('_type == "project"');
    expect(PROJECT_BY_SLUG_QUERY).toContain("$slug");
    expect(PROJECT_BY_SLUG_QUERY).toContain("sponsor->");
    expect(PROJECT_BY_SLUG_QUERY).toContain("technologyTags");
    expect(PROJECT_BY_SLUG_QUERY).toContain("team[]");
    expect(PROJECT_BY_SLUG_QUERY).toContain("mentor");
    expect(PROJECT_BY_SLUG_QUERY).toContain("outcome");
    expect(PROJECT_BY_SLUG_QUERY).toContain("seo");
  });

  it("PROJECT_BY_SLUG_QUERY includes testimonials sub-query", () => {
    expect(PROJECT_BY_SLUG_QUERY).toContain('_type == "testimonial"');
    expect(PROJECT_BY_SLUG_QUERY).toContain("project._ref == ^._id");
  });

  it("EVENT_BY_SLUG_QUERY fetches single event by slug with all fields", () => {
    expect(EVENT_BY_SLUG_QUERY).toContain('_type == "event"');
    expect(EVENT_BY_SLUG_QUERY).toContain("$slug");
    expect(EVENT_BY_SLUG_QUERY).toContain("date");
    expect(EVENT_BY_SLUG_QUERY).toContain("endDate");
    expect(EVENT_BY_SLUG_QUERY).toContain("location");
    expect(EVENT_BY_SLUG_QUERY).toContain("description");
    expect(EVENT_BY_SLUG_QUERY).toContain("eventType");
    expect(EVENT_BY_SLUG_QUERY).toContain("status");
    expect(EVENT_BY_SLUG_QUERY).toContain("seo");
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

  it("PAGE_BY_SLUG_QUERY does NOT contain inline sponsor sub-queries", () => {
    // The old query had `*[_type == "sponsor"]` inside logoCloud and sponsorCards.
    // After hoisting, the page query should only reference sponsors[]->{ _id }.
    // Count occurrences of the inline sub-query pattern:
    const inlineSponsorQueries = (PAGE_BY_SLUG_QUERY.match(/\*\[_type == "sponsor"/g) || []).length;
    expect(inlineSponsorQueries).toBe(0);
  });

  it("PAGE_BY_SLUG_QUERY logoCloud projection includes config fields", () => {
    expect(PAGE_BY_SLUG_QUERY).toContain("autoPopulate");
    expect(PAGE_BY_SLUG_QUERY).toContain('sponsors[]->{ _id }');
  });

  it("PAGE_BY_SLUG_QUERY sponsorCards projection includes config fields", () => {
    expect(PAGE_BY_SLUG_QUERY).toContain("displayMode");
  });
});

describe("loadQuery()", () => {
  it("calls sanityClient.fetch with query and params", async () => {
    const mockResult = { title: "Test" };
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: mockResult,
      syncTags: ["s1:abc"],
    } as never);

    const response = await loadQuery<{ title: string }>({
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
    expect(response.result).toEqual(mockResult);
    expect(response.syncTags).toEqual(["s1:abc"]);
  });

  it("defaults params to empty object when not provided", async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: null,
      syncTags: [],
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
      syncTags: [],
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

  it("returns empty syncTags when API response omits them", async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: { title: "Test" },
    } as never);

    const response = await loadQuery<{ title: string }>({
      query: '*[_type == "test"]',
    });

    expect(response.syncTags).toEqual([]);
  });
});

describe("getSyncTags() and resetSyncTags()", () => {
  it("collects sync tags from loadQuery calls", async () => {
    resetSyncTags();

    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: { title: "A" },
      syncTags: ["s1:tag1", "s1:tag2"],
    } as never);

    await loadQuery({ query: "*" });
    expect(getSyncTags()).toEqual(["s1:tag1", "s1:tag2"]);
  });

  it("deduplicates sync tags across multiple loadQuery calls", async () => {
    resetSyncTags();

    vi.mocked(sanityClient.fetch)
      .mockResolvedValueOnce({
        result: null,
        syncTags: ["s1:tag1", "s1:tag2"],
      } as never)
      .mockResolvedValueOnce({
        result: null,
        syncTags: ["s1:tag2", "s1:tag3"],
      } as never);

    await loadQuery({ query: "*" });
    await loadQuery({ query: "*" });

    const tags = getSyncTags();
    expect(tags).toHaveLength(3);
    expect(tags).toContain("s1:tag1");
    expect(tags).toContain("s1:tag2");
    expect(tags).toContain("s1:tag3");
  });

  it("resetSyncTags clears collected tags", async () => {
    resetSyncTags();

    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: null,
      syncTags: ["s1:tag1"],
    } as never);

    await loadQuery({ query: "*" });
    expect(getSyncTags()).toHaveLength(1);

    resetSyncTags();
    expect(getSyncTags()).toEqual([]);
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

describe("getAllSponsors()", () => {
  it("fetches and returns sponsors from Sanity", async () => {
    const mockSponsors = [
      { _id: "sp-1", name: "Alpha Corp", featured: true },
      { _id: "sp-2", name: "Beta Inc", featured: false },
    ];
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: mockSponsors,
    } as never);

    const result = await getAllSponsors();
    expect(result).toEqual(mockSponsors);
    expect(sanityClient.fetch).toHaveBeenCalledOnce();
  });

  it("returns cached result on subsequent calls without additional API calls", async () => {
    // Use a fresh module so cache is empty and no test-ordering dependency
    vi.resetModules();
    vi.stubEnv("PUBLIC_SANITY_VISUAL_EDITING_ENABLED", "false");
    const { sanityClient: freshClient } = await import("sanity:client");
    const freshModule = await import("@/lib/sanity");

    const mockSponsors = [
      { _id: "sp-1", name: "Alpha Corp", featured: true },
    ];
    vi.mocked(freshClient.fetch).mockResolvedValueOnce({
      result: mockSponsors,
    } as never);

    // First call — populates cache
    await freshModule.getAllSponsors();
    expect(freshClient.fetch).toHaveBeenCalledOnce();

    vi.mocked(freshClient.fetch).mockClear();

    // Second call — should hit cache, no fetch
    const cached = await freshModule.getAllSponsors();
    expect(cached).toEqual(mockSponsors);
    expect(freshClient.fetch).not.toHaveBeenCalled();
  });
});

describe("getSponsorBySlug()", () => {
  it("fetches a sponsor by slug with the correct query and params", async () => {
    const mockSponsor = {
      _id: "sp-1",
      name: "Acme Corp",
      slug: "acme-corp",
      tier: "gold",
      projects: [],
    };
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: mockSponsor,
    } as never);

    const result = await getSponsorBySlug("acme-corp");
    expect(result).toEqual(mockSponsor);
    expect(sanityClient.fetch).toHaveBeenCalledWith(
      SPONSOR_BY_SLUG_QUERY,
      { slug: "acme-corp" },
      expect.objectContaining({
        filterResponse: false,
        perspective: "published",
      }),
    );
  });

  it("returns null when sponsor is not found", async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: null,
    } as never);

    const result = await getSponsorBySlug("nonexistent");
    expect(result).toBeNull();
  });
});

describe("getAllProjects()", () => {
  it("fetches and returns projects from Sanity", async () => {
    const mockProjects = [
      { _id: "proj-1", title: "Project Alpha", slug: "project-alpha" },
      { _id: "proj-2", title: "Project Beta", slug: "project-beta" },
    ];
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: mockProjects,
    } as never);

    const result = await getAllProjects();
    expect(result).toEqual(mockProjects);
    expect(sanityClient.fetch).toHaveBeenCalledOnce();
  });

  it("returns cached result on subsequent calls without additional API calls", async () => {
    vi.resetModules();
    vi.stubEnv("PUBLIC_SANITY_VISUAL_EDITING_ENABLED", "false");
    const { sanityClient: freshClient } = await import("sanity:client");
    const freshModule = await import("@/lib/sanity");

    const mockProjects = [
      { _id: "proj-1", title: "Project Alpha" },
    ];
    vi.mocked(freshClient.fetch).mockResolvedValueOnce({
      result: mockProjects,
    } as never);

    await freshModule.getAllProjects();
    expect(freshClient.fetch).toHaveBeenCalledOnce();

    vi.mocked(freshClient.fetch).mockClear();

    const cached = await freshModule.getAllProjects();
    expect(cached).toEqual(mockProjects);
    expect(freshClient.fetch).not.toHaveBeenCalled();
  });
});

describe("getProjectBySlug()", () => {
  it("fetches a project by slug with the correct query and params", async () => {
    const mockProject = {
      _id: "proj-1",
      title: "Smart Campus",
      slug: "smart-campus",
      sponsor: { _id: "sp-1", name: "Acme Corp" },
      testimonials: [],
    };
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: mockProject,
    } as never);

    const result = await getProjectBySlug("smart-campus");
    expect(result).toEqual(mockProject);
    expect(sanityClient.fetch).toHaveBeenCalledWith(
      PROJECT_BY_SLUG_QUERY,
      { slug: "smart-campus" },
      expect.objectContaining({
        filterResponse: false,
        perspective: "published",
      }),
    );
  });

  it("returns null when project is not found", async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: null,
    } as never);

    const result = await getProjectBySlug("nonexistent");
    expect(result).toBeNull();
  });
});

describe("resolveBlockSponsors()", () => {
  const allSponsors = [
    { _id: "sp-1", name: "Alpha", featured: true },
    { _id: "sp-2", name: "Beta", featured: false },
    { _id: "sp-3", name: "Gamma", featured: true },
  ] as any[];

  describe("logoCloud blocks (autoPopulate)", () => {
    it("returns all sponsors when autoPopulate is true", () => {
      const block = { _type: "logoCloud", autoPopulate: true, sponsors: null };
      expect(resolveBlockSponsors(block, allSponsors)).toEqual(allSponsors);
    });

    it("returns manual sponsors when autoPopulate is false", () => {
      const block = { _type: "logoCloud", autoPopulate: false, sponsors: [{ _id: "sp-2" }] };
      const result = resolveBlockSponsors(block, allSponsors);
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe("sp-2");
    });

    it("returns empty array when autoPopulate is false and no sponsors selected", () => {
      const block = { _type: "logoCloud", autoPopulate: false, sponsors: null };
      expect(resolveBlockSponsors(block, allSponsors)).toEqual([]);
    });
  });

  describe("sponsorCards blocks (displayMode)", () => {
    it("returns all sponsors when displayMode is 'all'", () => {
      const block = { _type: "sponsorCards", displayMode: "all", sponsors: null };
      expect(resolveBlockSponsors(block, allSponsors)).toEqual(allSponsors);
    });

    it("returns all sponsors when displayMode is null (defaults to all)", () => {
      const block = { _type: "sponsorCards", displayMode: null, sponsors: null };
      expect(resolveBlockSponsors(block, allSponsors)).toEqual(allSponsors);
    });

    it("returns featured sponsors when displayMode is 'featured'", () => {
      const block = { _type: "sponsorCards", displayMode: "featured", sponsors: null };
      const result = resolveBlockSponsors(block, allSponsors);
      expect(result).toHaveLength(2);
      expect(result.every((s: any) => s.featured)).toBe(true);
    });

    it("returns manual sponsors when displayMode is 'manual'", () => {
      const block = { _type: "sponsorCards", displayMode: "manual", sponsors: [{ _id: "sp-1" }, { _id: "sp-3" }] };
      const result = resolveBlockSponsors(block, allSponsors);
      expect(result).toHaveLength(2);
      expect(result.map((s: any) => s._id)).toEqual(["sp-1", "sp-3"]);
    });

    it("returns empty array when displayMode is 'manual' and no sponsors selected", () => {
      const block = { _type: "sponsorCards", displayMode: "manual", sponsors: null };
      expect(resolveBlockSponsors(block, allSponsors)).toEqual([]);
    });
  });
});

describe("prefetchPages() and getPage() cache", () => {
  it("prefetchPages populates cache and getPage returns cached results", async () => {
    vi.resetModules();
    vi.stubEnv("PUBLIC_SANITY_VISUAL_EDITING_ENABLED", "false");
    const { sanityClient: freshClient } = await import("sanity:client");
    const freshModule = await import("@/lib/sanity");

    const mockPageA = { _id: "page-a", title: "Page A", slug: "about" };
    const mockPageB = { _id: "page-b", title: "Page B", slug: "contact" };

    vi.mocked(freshClient.fetch)
      .mockResolvedValueOnce({ result: mockPageA } as never)
      .mockResolvedValueOnce({ result: mockPageB } as never);

    await freshModule.prefetchPages(["about", "contact"]);
    expect(freshClient.fetch).toHaveBeenCalledTimes(2);

    vi.mocked(freshClient.fetch).mockClear();

    // getPage should return cached results without additional API calls
    const pageA = await freshModule.getPage("about");
    const pageB = await freshModule.getPage("contact");
    expect(pageA).toEqual(mockPageA);
    expect(pageB).toEqual(mockPageB);
    expect(freshClient.fetch).not.toHaveBeenCalled();
  });

  it("getPage fetches from API on cache miss", async () => {
    vi.resetModules();
    vi.stubEnv("PUBLIC_SANITY_VISUAL_EDITING_ENABLED", "false");
    const { sanityClient: freshClient } = await import("sanity:client");
    const freshModule = await import("@/lib/sanity");

    const mockPage = { _id: "page-x", title: "Uncached", slug: "uncached" };
    vi.mocked(freshClient.fetch).mockResolvedValueOnce({ result: mockPage } as never);

    const result = await freshModule.getPage("uncached");
    expect(result).toEqual(mockPage);
    expect(freshClient.fetch).toHaveBeenCalledOnce();
  });

  it("prefetchPages is a no-op when Visual Editing is enabled", async () => {
    vi.resetModules();
    vi.stubEnv("PUBLIC_SANITY_VISUAL_EDITING_ENABLED", "true");
    const { sanityClient: freshClient } = await import("sanity:client");
    const freshModule = await import("@/lib/sanity");

    await freshModule.prefetchPages(["about", "contact"]);
    expect(freshClient.fetch).not.toHaveBeenCalled();
  });

  it("prefetchPages respects concurrency chunking", async () => {
    vi.resetModules();
    vi.stubEnv("PUBLIC_SANITY_VISUAL_EDITING_ENABLED", "false");
    const { sanityClient: freshClient } = await import("sanity:client");
    const freshModule = await import("@/lib/sanity");

    const slugs = ["a", "b", "c", "d", "e"];
    for (const slug of slugs) {
      vi.mocked(freshClient.fetch).mockResolvedValueOnce({
        result: { _id: slug, title: slug },
      } as never);
    }

    // concurrency=2 → 3 sequential chunks: [a,b], [c,d], [e]
    await freshModule.prefetchPages(slugs, 2);
    expect(freshClient.fetch).toHaveBeenCalledTimes(5);

    vi.mocked(freshClient.fetch).mockClear();

    // All 5 should be cached
    for (const slug of slugs) {
      const page = await freshModule.getPage(slug);
      expect(page).toEqual({ _id: slug, title: slug });
    }
    expect(freshClient.fetch).not.toHaveBeenCalled();
  });
});
