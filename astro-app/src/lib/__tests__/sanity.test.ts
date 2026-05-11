import { describe, it, expect, vi, beforeEach } from "vitest";
import { sanityClient } from "sanity:client";

// Mock astro:env modules — vi.mock is hoisted, so these run before any imports.
// Defaults mirror astro.config.mjs env.schema defaults for a standard test env.
vi.mock("astro:env/client", () => ({
  PUBLIC_SANITY_VISUAL_EDITING_ENABLED: false,
  PUBLIC_SANITY_DATASET: "production",
  PUBLIC_SITE_ID: "capstone",
}));

vi.mock("astro:env/server", () => ({
  SANITY_API_READ_TOKEN: undefined,
}));

// Must import AFTER mocking env so module-level const picks up the mock
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
  getSiteParams,
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
  EVENTS_BY_MONTH_QUERY,
  ALL_EVENTS_QUERY,
  ALL_EVENT_SLUGS_QUERY,
  ALL_TESTIMONIALS_QUERY,
  SPONSOR_PROJECTS_QUERY,
  ALL_ARTICLES_QUERY,
  ALL_ARTICLE_SLUGS_QUERY,
  ARTICLE_BY_SLUG_QUERY,
  getAllArticles,
  getArticleBySlug,
  resolveBlockArticles,
  ALL_AUTHORS_QUERY,
  ALL_AUTHOR_SLUGS_QUERY,
  AUTHOR_BY_SLUG_QUERY,
  getAllAuthors,
  getAuthorBySlug,
  GALLERY_ASSETS_QUERY,
  getGalleryAssets,
  resetAllCaches,
} = await import("@/lib/sanity");

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

  it("ALL_SPONSORS_QUERY targets sponsor type with full projection", () => {
    expect(ALL_SPONSORS_QUERY).toContain('_type == "sponsor"');
    expect(ALL_SPONSORS_QUERY).toContain("hidden != true");
    expect(ALL_SPONSORS_QUERY).toContain("name");
    expect(ALL_SPONSORS_QUERY).toContain("slug.current");
    expect(ALL_SPONSORS_QUERY).toContain("tier");
    expect(ALL_SPONSORS_QUERY).toContain("featured");
    expect(ALL_SPONSORS_QUERY).toContain("order(name asc)");
  });

  it("ALL_SPONSOR_SLUGS_QUERY targets sponsor type with slug projection", () => {
    expect(ALL_SPONSOR_SLUGS_QUERY).toContain('_type == "sponsor"');
    expect(ALL_SPONSOR_SLUGS_QUERY).toContain("hidden != true");
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
    expect(PROJECT_BY_SLUG_QUERY).toContain("mentor{ name, title, department }");
    expect(PROJECT_BY_SLUG_QUERY).toContain("outcome");
    expect(PROJECT_BY_SLUG_QUERY).toContain("seo");
  });

  it("PROJECT_BY_SLUG_QUERY includes testimonials sub-query", () => {
    expect(PROJECT_BY_SLUG_QUERY).toContain('_type == "testimonial"');
    expect(PROJECT_BY_SLUG_QUERY).toContain("project._ref == ^._id");
  });

  it("ALL_EVENTS_QUERY includes calendar-friendly fields (isAllDay, category)", () => {
    expect(ALL_EVENTS_QUERY).toContain('_type == "event"');
    expect(ALL_EVENTS_QUERY).toContain("isAllDay");
    expect(ALL_EVENTS_QUERY).toContain("category");
    expect(ALL_EVENTS_QUERY).toContain("description");
    expect(ALL_EVENTS_QUERY).toContain("eventType");
  });

  it("EVENTS_BY_MONTH_QUERY filters events by date range with expected fields", () => {
    expect(EVENTS_BY_MONTH_QUERY).toContain('_type == "event"');
    expect(EVENTS_BY_MONTH_QUERY).toContain("$monthStart");
    expect(EVENTS_BY_MONTH_QUERY).toContain("$monthEnd");
    expect(EVENTS_BY_MONTH_QUERY).toContain("dateTime(date)");
    expect(EVENTS_BY_MONTH_QUERY).toContain("order(date asc)");
    expect(EVENTS_BY_MONTH_QUERY).toContain("slug.current");
    expect(EVENTS_BY_MONTH_QUERY).toContain("eventType");
    expect(EVENTS_BY_MONTH_QUERY).toContain("status");
    expect(EVENTS_BY_MONTH_QUERY).toContain("description");
    expect(EVENTS_BY_MONTH_QUERY).toContain("isAllDay");
    expect(EVENTS_BY_MONTH_QUERY).toContain("category");
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
    expect(EVENT_BY_SLUG_QUERY).toContain("isAllDay");
    expect(EVENT_BY_SLUG_QUERY).toContain("category");
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
      // Story 2.9 — content display
      "teamGrid",
      "imageGallery",
      "articleList",
      // Story 2.10 — data/editorial
      "comparisonTable",
      "timeline",
      "pullquote",
      // Story 2.11 — utility
      "divider",
      "announcementBar",
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

  it("SPONSOR_PROJECTS_QUERY fetches projects by sponsor email", () => {
    expect(SPONSOR_PROJECTS_QUERY).toContain('_type == "project"');
    expect(SPONSOR_PROJECTS_QUERY).toContain('_type == "sponsor"');
    expect(SPONSOR_PROJECTS_QUERY).toContain("contactEmail");
    expect(SPONSOR_PROJECTS_QUERY).toContain("allowedEmails");
    expect(SPONSOR_PROJECTS_QUERY).toContain("$email");
    expect(SPONSOR_PROJECTS_QUERY).toContain("title");
    expect(SPONSOR_PROJECTS_QUERY).toContain("slug.current");
    expect(SPONSOR_PROJECTS_QUERY).toContain("status");
    expect(SPONSOR_PROJECTS_QUERY).toContain("order(title asc)");
  });

  it("ALL_ARTICLES_QUERY targets article type ordered by publishedAt desc", () => {
    expect(ALL_ARTICLES_QUERY).toContain('_type == "article"');
    expect(ALL_ARTICLES_QUERY).toContain("order(publishedAt desc)");
    expect(ALL_ARTICLES_QUERY).toContain("title");
    expect(ALL_ARTICLES_QUERY).toContain("slug.current");
    expect(ALL_ARTICLES_QUERY).toContain("excerpt");
    expect(ALL_ARTICLES_QUERY).toContain("featuredImage");
    expect(ALL_ARTICLES_QUERY).toContain("author->");
    expect(ALL_ARTICLES_QUERY).toContain("publishedAt");
    expect(ALL_ARTICLES_QUERY).toContain("category->");
  });

  it("ALL_ARTICLE_SLUGS_QUERY targets article type with slug projection", () => {
    expect(ALL_ARTICLE_SLUGS_QUERY).toContain('_type == "article"');
    expect(ALL_ARTICLE_SLUGS_QUERY).toContain("defined(slug.current)");
    expect(ALL_ARTICLE_SLUGS_QUERY).toContain("slug.current");
  });

  it("ARTICLE_BY_SLUG_QUERY fetches single article by slug with full fields", () => {
    expect(ARTICLE_BY_SLUG_QUERY).toContain('_type == "article"');
    expect(ARTICLE_BY_SLUG_QUERY).toContain("$slug");
    expect(ARTICLE_BY_SLUG_QUERY).toContain("title");
    expect(ARTICLE_BY_SLUG_QUERY).toContain("slug.current");
    expect(ARTICLE_BY_SLUG_QUERY).toContain("excerpt");
    expect(ARTICLE_BY_SLUG_QUERY).toContain("body[]");
    expect(ARTICLE_BY_SLUG_QUERY).toContain("author->");
    expect(ARTICLE_BY_SLUG_QUERY).toContain("publishedAt");
    expect(ARTICLE_BY_SLUG_QUERY).toContain("updatedAt");
    expect(ARTICLE_BY_SLUG_QUERY).toContain("category->");
    expect(ARTICLE_BY_SLUG_QUERY).toContain("tags");
    expect(ARTICLE_BY_SLUG_QUERY).toContain("relatedArticles[]->");
    expect(ARTICLE_BY_SLUG_QUERY).toContain("seo");
  });

  it("ARTICLE_BY_SLUG_QUERY includes expanded author fields", () => {
    expect(ARTICLE_BY_SLUG_QUERY).toContain("role");
    expect(ARTICLE_BY_SLUG_QUERY).toContain("image{");
    expect(ARTICLE_BY_SLUG_QUERY).toContain("sameAs");
  });

  it("ALL_AUTHORS_QUERY targets author type ordered by name asc", () => {
    expect(ALL_AUTHORS_QUERY).toContain('_type == "author"');
    expect(ALL_AUTHORS_QUERY).toContain("order(name asc)");
    expect(ALL_AUTHORS_QUERY).toContain("name");
    expect(ALL_AUTHORS_QUERY).toContain("slug.current");
    expect(ALL_AUTHORS_QUERY).toContain("role");
    expect(ALL_AUTHORS_QUERY).toContain("bio");
    expect(ALL_AUTHORS_QUERY).toContain("image{");
    expect(ALL_AUTHORS_QUERY).toContain("defined(slug.current)");
  });

  it("ALL_AUTHOR_SLUGS_QUERY targets author type with slug projection", () => {
    expect(ALL_AUTHOR_SLUGS_QUERY).toContain('_type == "author"');
    expect(ALL_AUTHOR_SLUGS_QUERY).toContain("defined(slug.current)");
    expect(ALL_AUTHOR_SLUGS_QUERY).toContain("slug.current");
  });

  it("AUTHOR_BY_SLUG_QUERY fetches single author by slug with full fields", () => {
    expect(AUTHOR_BY_SLUG_QUERY).toContain('_type == "author"');
    expect(AUTHOR_BY_SLUG_QUERY).toContain("$slug");
    expect(AUTHOR_BY_SLUG_QUERY).toContain("name");
    expect(AUTHOR_BY_SLUG_QUERY).toContain("slug.current");
    expect(AUTHOR_BY_SLUG_QUERY).toContain("role");
    expect(AUTHOR_BY_SLUG_QUERY).toContain("bio");
    expect(AUTHOR_BY_SLUG_QUERY).toContain("credentials");
    expect(AUTHOR_BY_SLUG_QUERY).toContain("image{");
    expect(AUTHOR_BY_SLUG_QUERY).toContain("sameAs");
    expect(AUTHOR_BY_SLUG_QUERY).toContain("socialLinks[]");
    expect(AUTHOR_BY_SLUG_QUERY).toContain("platform");
    expect(AUTHOR_BY_SLUG_QUERY).toContain("url");
  });

  it("AUTHOR_BY_SLUG_QUERY includes inline reverse reference for articles", () => {
    expect(AUTHOR_BY_SLUG_QUERY).toContain('_type == "article"');
    expect(AUTHOR_BY_SLUG_QUERY).toContain("author._ref == ^._id");
    expect(AUTHOR_BY_SLUG_QUERY).toContain("order(publishedAt desc)");
    expect(AUTHOR_BY_SLUG_QUERY).toContain("category->");
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

  it("returns site settings when document exists and passes siteSettingsId param", async () => {
    const mockSettings = {
      siteName: "Test Site",
      siteDescription: "A test site",
    };
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: mockSettings,
    } as never);

    const result = await getSiteSettings();
    expect(result).toEqual(mockSettings);
    expect(sanityClient.fetch).toHaveBeenCalledWith(
      SITE_SETTINGS_QUERY,
      { siteSettingsId: "siteSettings" },
      expect.objectContaining({ filterResponse: false, perspective: "published" }),
    );
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
    vi.doMock("astro:env/client", () => ({
      PUBLIC_SANITY_VISUAL_EDITING_ENABLED: false,
      PUBLIC_SANITY_DATASET: "production",
      PUBLIC_SITE_ID: "capstone",
    }));
    vi.doMock("astro:env/server", () => ({
      SANITY_API_READ_TOKEN: undefined,
    }));
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
      { slug: "acme-corp", site: "" },
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
    vi.doMock("astro:env/client", () => ({
      PUBLIC_SANITY_VISUAL_EDITING_ENABLED: false,
      PUBLIC_SANITY_DATASET: "production",
      PUBLIC_SITE_ID: "capstone",
    }));
    vi.doMock("astro:env/server", () => ({
      SANITY_API_READ_TOKEN: undefined,
    }));
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
      { slug: "smart-campus", site: "" },
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

describe("getAllArticles()", () => {
  it("fetches and returns articles from Sanity", async () => {
    const mockArticles = [
      { _id: "art-1", title: "First Post", slug: "first-post", publishedAt: "2026-04-10" },
      { _id: "art-2", title: "Second Post", slug: "second-post", publishedAt: "2026-04-09" },
    ];
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: mockArticles,
    } as never);

    const result = await getAllArticles();
    expect(result).toEqual(mockArticles);
    expect(sanityClient.fetch).toHaveBeenCalledOnce();
  });

  it("returns cached result on subsequent calls without additional API calls", async () => {
    vi.resetModules();
    vi.doMock("astro:env/client", () => ({
      PUBLIC_SANITY_VISUAL_EDITING_ENABLED: false,
      PUBLIC_SANITY_DATASET: "production",
      PUBLIC_SITE_ID: "capstone",
    }));
    vi.doMock("astro:env/server", () => ({
      SANITY_API_READ_TOKEN: undefined,
    }));
    const { sanityClient: freshClient } = await import("sanity:client");
    const freshModule = await import("@/lib/sanity");

    const mockArticles = [
      { _id: "art-1", title: "First Post" },
    ];
    vi.mocked(freshClient.fetch).mockResolvedValueOnce({
      result: mockArticles,
    } as never);

    await freshModule.getAllArticles();
    expect(freshClient.fetch).toHaveBeenCalledOnce();

    vi.mocked(freshClient.fetch).mockClear();

    const cached = await freshModule.getAllArticles();
    expect(cached).toEqual(mockArticles);
    expect(freshClient.fetch).not.toHaveBeenCalled();
  });
});

describe("getArticleBySlug()", () => {
  it("fetches an article by slug with the correct query and params", async () => {
    const mockArticle = {
      _id: "art-1",
      title: "First Post",
      slug: "first-post",
      body: [],
      author: { name: "Jane Doe", slug: "jane-doe" },
    };
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: mockArticle,
    } as never);

    const result = await getArticleBySlug("first-post");
    expect(result).toEqual(mockArticle);
    expect(sanityClient.fetch).toHaveBeenCalledWith(
      ARTICLE_BY_SLUG_QUERY,
      { slug: "first-post", site: "" },
      expect.objectContaining({
        filterResponse: false,
        perspective: "published",
      }),
    );
  });

  it("returns null when article is not found", async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: null,
    } as never);

    const result = await getArticleBySlug("nonexistent");
    expect(result).toBeNull();
  });
});

describe("getAllAuthors()", () => {
  it("fetches and returns authors from Sanity", async () => {
    const mockAuthors = [
      { _id: "auth-1", name: "Alice", slug: "alice", role: "Developer" },
      { _id: "auth-2", name: "Bob", slug: "bob", role: "Writer" },
    ];
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: mockAuthors,
    } as never);

    const result = await getAllAuthors();
    expect(result).toEqual(mockAuthors);
    expect(sanityClient.fetch).toHaveBeenCalledOnce();
  });

  it("returns cached result on subsequent calls without additional API calls", async () => {
    vi.resetModules();
    vi.doMock("astro:env/client", () => ({
      PUBLIC_SANITY_VISUAL_EDITING_ENABLED: false,
      PUBLIC_SANITY_DATASET: "production",
      PUBLIC_SITE_ID: "capstone",
    }));
    vi.doMock("astro:env/server", () => ({
      SANITY_API_READ_TOKEN: undefined,
    }));
    const { sanityClient: freshClient } = await import("sanity:client");
    const freshModule = await import("@/lib/sanity");

    const mockAuthors = [{ _id: "auth-1", name: "Alice" }];
    vi.mocked(freshClient.fetch).mockResolvedValueOnce({
      result: mockAuthors,
    } as never);

    await freshModule.getAllAuthors();
    expect(freshClient.fetch).toHaveBeenCalledOnce();

    vi.mocked(freshClient.fetch).mockClear();

    const cached = await freshModule.getAllAuthors();
    expect(cached).toEqual(mockAuthors);
    expect(freshClient.fetch).not.toHaveBeenCalled();
  });
});

describe("getAuthorBySlug()", () => {
  it("fetches an author by slug with the correct query and params", async () => {
    const mockAuthor = {
      _id: "auth-1",
      name: "Alice",
      slug: "alice",
      role: "Developer",
      articles: [],
    };
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: mockAuthor,
    } as never);

    const result = await getAuthorBySlug("alice");
    expect(result).toEqual(mockAuthor);
    expect(sanityClient.fetch).toHaveBeenCalledWith(
      AUTHOR_BY_SLUG_QUERY,
      { slug: "alice", site: "" },
      expect.objectContaining({
        filterResponse: false,
        perspective: "published",
      }),
    );
  });

  it("returns null when author is not found", async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({
      result: null,
    } as never);

    const result = await getAuthorBySlug("nonexistent");
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

describe("resolveBlockArticles()", () => {
  const allArticles = [
    {
      _id: "art-1",
      title: "First",
      slug: "first",
      publishedAt: "2026-01-05T00:00:00Z",
      category: { _id: "cat-news", title: "News", slug: "news" },
    },
    {
      _id: "art-2",
      title: "Second",
      slug: "second",
      publishedAt: "2026-01-04T00:00:00Z",
      category: { _id: "cat-blog", title: "Blog", slug: "blog" },
    },
    {
      _id: "art-3",
      title: "Third",
      slug: "third",
      publishedAt: "2026-01-03T00:00:00Z",
      category: { _id: "cat-news", title: "News", slug: "news" },
    },
    {
      _id: "art-4",
      title: "Fourth",
      slug: "fourth",
      publishedAt: "2026-01-02T00:00:00Z",
      category: null,
    },
  ] as any[];

  it("returns all articles when contentType is 'all'", () => {
    const block = { _type: "articleList", contentType: "all", categories: null, limit: 10 };
    expect(resolveBlockArticles(block, allArticles)).toEqual(allArticles);
  });

  it("returns all articles when contentType is null (defaults to all)", () => {
    const block = { _type: "articleList", contentType: null, categories: null, limit: 10 };
    expect(resolveBlockArticles(block, allArticles)).toEqual(allArticles);
  });

  it("applies limit by slicing from the top (pre-sorted newest first)", () => {
    const block = { _type: "articleList", contentType: "all", categories: null, limit: 2 };
    const result = resolveBlockArticles(block, allArticles);
    expect(result).toHaveLength(2);
    expect(result.map((a: any) => a._id)).toEqual(["art-1", "art-2"]);
  });

  it("uses default limit of 6 when limit is null", () => {
    const block = { _type: "articleList", contentType: "all", categories: null, limit: null };
    const result = resolveBlockArticles(block, allArticles);
    expect(result).toHaveLength(4);
  });

  it("filters by category when contentType is 'by-category'", () => {
    const block = {
      _type: "articleList",
      contentType: "by-category",
      categories: [{ _id: "cat-news" }],
      limit: 10,
    };
    const result = resolveBlockArticles(block, allArticles);
    expect(result).toHaveLength(2);
    expect(result.map((a: any) => a._id)).toEqual(["art-1", "art-3"]);
  });

  it("filters by multiple categories", () => {
    const block = {
      _type: "articleList",
      contentType: "by-category",
      categories: [{ _id: "cat-news" }, { _id: "cat-blog" }],
      limit: 10,
    };
    const result = resolveBlockArticles(block, allArticles);
    expect(result).toHaveLength(3);
    expect(result.map((a: any) => a._id)).toEqual(["art-1", "art-2", "art-3"]);
  });

  it("excludes articles with null category when filtering by category", () => {
    const block = {
      _type: "articleList",
      contentType: "by-category",
      categories: [{ _id: "cat-news" }],
      limit: 10,
    };
    const result = resolveBlockArticles(block, allArticles);
    expect(result.find((a: any) => a._id === "art-4")).toBeUndefined();
  });

  it("returns all articles when contentType is 'by-category' but categories is empty", () => {
    const block = {
      _type: "articleList",
      contentType: "by-category",
      categories: [],
      limit: 10,
    };
    expect(resolveBlockArticles(block, allArticles)).toEqual(allArticles);
  });

  it("returns all articles when contentType is 'by-category' but categories is null", () => {
    const block = {
      _type: "articleList",
      contentType: "by-category",
      categories: null,
      limit: 10,
    };
    expect(resolveBlockArticles(block, allArticles)).toEqual(allArticles);
  });

  it("applies limit after category filtering", () => {
    const block = {
      _type: "articleList",
      contentType: "by-category",
      categories: [{ _id: "cat-news" }],
      limit: 1,
    };
    const result = resolveBlockArticles(block, allArticles);
    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe("art-1");
  });

  it("returns empty array when input is empty", () => {
    const block = { _type: "articleList", contentType: "all", categories: null, limit: 10 };
    expect(resolveBlockArticles(block, [])).toEqual([]);
  });
});

describe("prefetchPages() and getPage() cache", () => {
  it("prefetchPages populates cache and getPage returns cached results", async () => {
    vi.resetModules();
    vi.doMock("astro:env/client", () => ({
      PUBLIC_SANITY_VISUAL_EDITING_ENABLED: false,
      PUBLIC_SANITY_DATASET: "production",
      PUBLIC_SITE_ID: "capstone",
    }));
    vi.doMock("astro:env/server", () => ({
      SANITY_API_READ_TOKEN: undefined,
    }));
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
    vi.doMock("astro:env/client", () => ({
      PUBLIC_SANITY_VISUAL_EDITING_ENABLED: false,
      PUBLIC_SANITY_DATASET: "production",
      PUBLIC_SITE_ID: "capstone",
    }));
    vi.doMock("astro:env/server", () => ({
      SANITY_API_READ_TOKEN: undefined,
    }));
    const { sanityClient: freshClient } = await import("sanity:client");
    const freshModule = await import("@/lib/sanity");

    const mockPage = { _id: "page-x", title: "Uncached", slug: "uncached" };
    vi.mocked(freshClient.fetch).mockResolvedValueOnce({ result: mockPage } as never);

    const result = await freshModule.getPage("uncached");
    expect(result).toEqual(mockPage);
    expect(freshClient.fetch).toHaveBeenCalledOnce();
  });

  it("prefetchPages is a no-op when preview mode is on (Story 26.1)", async () => {
    vi.resetModules();
    vi.doMock("astro:env/client", () => ({
      PUBLIC_SANITY_DATASET: "production",
      PUBLIC_SITE_ID: "capstone",
    }));
    vi.doMock("astro:env/server", () => ({
      SANITY_API_READ_TOKEN: "test-token",
    }));
    const { sanityClient: freshClient } = await import("sanity:client");
    const freshModule = await import("@/lib/sanity");
    const { runWithPreviewMode } = await import("@/lib/preview-mode");

    // Story 26.1: preview mode is request-scoped via AsyncLocalStorage, not a
    // build-time env var. Wrap the call to flip the flag.
    await runWithPreviewMode(true, async () => {
      await freshModule.prefetchPages(["about", "contact"]);
    });
    expect(freshClient.fetch).not.toHaveBeenCalled();
  });

  it("prefetchPages respects concurrency chunking", async () => {
    vi.resetModules();
    vi.doMock("astro:env/client", () => ({
      PUBLIC_SANITY_VISUAL_EDITING_ENABLED: false,
      PUBLIC_SANITY_DATASET: "production",
      PUBLIC_SITE_ID: "capstone",
    }));
    vi.doMock("astro:env/server", () => ({
      SANITY_API_READ_TOKEN: undefined,
    }));
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

describe("getSiteParams() (production defaults)", () => {
  it("returns { site: '' } for production dataset", () => {
    const params = getSiteParams();
    expect(params).toEqual({ site: "" });
  });

  it("always includes a 'site' key", () => {
    const params = getSiteParams();
    expect(params).toHaveProperty("site");
  });
});

describe("getSiteParams() (rwc dataset)", () => {
  it("getSiteParams returns site ID for rwc dataset", async () => {
    vi.resetModules();
    vi.doMock("astro:env/client", () => ({
      PUBLIC_SANITY_VISUAL_EDITING_ENABLED: false,
      PUBLIC_SANITY_DATASET: "rwc",
      PUBLIC_SITE_ID: "rwc-us",
    }));
    vi.doMock("astro:env/server", () => ({
      SANITY_API_READ_TOKEN: undefined,
    }));
    const freshModule = await import("@/lib/sanity");

    expect(freshModule.getSiteParams()).toEqual({ site: "rwc-us" });
  });

  it("getSiteParams returns rwc-intl for international site", async () => {
    vi.resetModules();
    vi.doMock("astro:env/client", () => ({
      PUBLIC_SANITY_VISUAL_EDITING_ENABLED: false,
      PUBLIC_SANITY_DATASET: "rwc",
      PUBLIC_SITE_ID: "rwc-intl",
    }));
    vi.doMock("astro:env/server", () => ({
      SANITY_API_READ_TOKEN: undefined,
    }));
    const freshModule = await import("@/lib/sanity");

    expect(freshModule.getSiteParams()).toEqual({ site: "rwc-intl" });
  });
});

describe("Multi-site query patterns", () => {
  it("SITE_SETTINGS_QUERY uses $siteSettingsId parameter for deterministic lookup", () => {
    expect(SITE_SETTINGS_QUERY).toContain("_id == $siteSettingsId");
  });

  it("all list queries include the always-present site filter", () => {
    const listQueries = [
      { name: "ALL_PAGE_SLUGS_QUERY", query: ALL_PAGE_SLUGS_QUERY },
      { name: "ALL_SPONSORS_QUERY", query: ALL_SPONSORS_QUERY },
      { name: "ALL_SPONSOR_SLUGS_QUERY", query: ALL_SPONSOR_SLUGS_QUERY },
      { name: "ALL_PROJECTS_QUERY", query: ALL_PROJECTS_QUERY },
      { name: "ALL_PROJECT_SLUGS_QUERY", query: ALL_PROJECT_SLUGS_QUERY },
      { name: "ALL_TESTIMONIALS_QUERY", query: ALL_TESTIMONIALS_QUERY },
      { name: "ALL_EVENTS_QUERY", query: ALL_EVENTS_QUERY },
      { name: "ALL_EVENT_SLUGS_QUERY", query: ALL_EVENT_SLUGS_QUERY },
      { name: "EVENTS_BY_MONTH_QUERY", query: EVENTS_BY_MONTH_QUERY },
      { name: "ALL_ARTICLES_QUERY", query: ALL_ARTICLES_QUERY },
      { name: "ALL_ARTICLE_SLUGS_QUERY", query: ALL_ARTICLE_SLUGS_QUERY },
    ];

    for (const { name, query } of listQueries) {
      expect(query, `${name} should contain site filter`).toContain('$site == "" || site == $site');
    }
  });

  it("detail queries include the always-present site filter", () => {
    const detailQueries = [
      { name: "SPONSOR_BY_SLUG_QUERY", query: SPONSOR_BY_SLUG_QUERY },
      { name: "PROJECT_BY_SLUG_QUERY", query: PROJECT_BY_SLUG_QUERY },
      { name: "EVENT_BY_SLUG_QUERY", query: EVENT_BY_SLUG_QUERY },
      { name: "PAGE_BY_SLUG_QUERY", query: PAGE_BY_SLUG_QUERY },
      { name: "ARTICLE_BY_SLUG_QUERY", query: ARTICLE_BY_SLUG_QUERY },
      { name: "AUTHOR_BY_SLUG_QUERY", query: AUTHOR_BY_SLUG_QUERY },
    ];

    for (const { name, query } of detailQueries) {
      expect(query, `${name} should contain site filter`).toContain('$site == "" || site == $site');
    }
  });

  it("SPONSOR_BY_SLUG_QUERY has site filter on nested projects sub-query", () => {
    // Nested sub-query: *[_type == "project" && references(^._id) && ($site == "" || site == $site)]
    expect(SPONSOR_BY_SLUG_QUERY).toContain(
      '*[_type == "project" && references(^._id) && ($site == "" || site == $site)]',
    );
  });

  it("PROJECT_BY_SLUG_QUERY has site filter on nested testimonials sub-query", () => {
    // Nested sub-query: *[_type == "testimonial" && project._ref == ^._id && ($site == "" || site == $site)]
    expect(PROJECT_BY_SLUG_QUERY).toContain(
      '*[_type == "testimonial" && project._ref == ^._id && ($site == "" || site == $site)]',
    );
  });

  it("AUTHOR_BY_SLUG_QUERY has site filter on nested articles sub-query", () => {
    // Nested sub-query: *[_type == "article" && author._ref == ^._id && ...]
    expect(AUTHOR_BY_SLUG_QUERY).toContain(
      '*[_type == "article" && author._ref == ^._id && defined(slug.current) && ($site == "" || site == $site)]',
    );
  });

  it("ALL_AUTHORS_QUERY includes site filter", () => {
    expect(ALL_AUTHORS_QUERY).toContain('$site == "" || site == $site');
  });

  it("ALL_AUTHOR_SLUGS_QUERY includes site filter", () => {
    expect(ALL_AUTHOR_SLUGS_QUERY).toContain('$site == "" || site == $site');
  });
});

describe("GALLERY_ASSETS_QUERY shape (Story 22.11)", () => {
  it("targets sanity.imageAsset filtered by the 'gallery' tag in opt.media.tags", () => {
    expect(GALLERY_ASSETS_QUERY).toContain('_type == "sanity.imageAsset"');
    expect(GALLERY_ASSETS_QUERY).toContain('"gallery" in opt.media.tags[]->name.current');
    expect(GALLERY_ASSETS_QUERY).toContain('order(_createdAt desc)');
    expect(GALLERY_ASSETS_QUERY).toContain('"tags": opt.media.tags[]->name.current');
  });

  it("does NOT include a multi-site filter (assets are workspace-global)", () => {
    expect(GALLERY_ASSETS_QUERY).not.toContain('$site');
    expect(GALLERY_ASSETS_QUERY).not.toContain('site ==');
  });
});

describe("getGalleryAssets() (Story 22.11)", () => {
  function mockAsset(overrides: Record<string, unknown>) {
    return {
      _id: 'image-x-1024x768-jpg',
      url: 'https://cdn.sanity.io/images/49nk9b0w/production/x.jpg',
      altText: null,
      title: null,
      description: null,
      metadata: { lqip: null, dimensions: { width: 1024, height: 768 } },
      tags: [],
      ...overrides,
    };
  }

  it("normalizes assets into GalleryItem[] with tag-derived featured/year/category", async () => {
    const mockAssets = [
      mockAsset({ _id: 'a1', tags: ['gallery'] }),
      mockAsset({ _id: 'a2', tags: ['gallery', 'gallery-featured'] }),
      mockAsset({ _id: 'a3', tags: ['gallery', 'gallery-2026', 'gallery-web-apps'] }),
      mockAsset({ _id: 'a4', tags: ['gallery', 'gallery-featured', 'gallery-2025', 'gallery-ai-ml'] }),
    ];
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({ result: mockAssets } as never);

    resetAllCaches();
    const items = await getGalleryAssets();
    expect(items).toHaveLength(4);

    expect(items[0]).toMatchObject({ _key: 'a1', featured: false, year: null, category: null });
    expect(items[1]).toMatchObject({ _key: 'a2', featured: true, year: null, category: null });
    expect(items[2]).toMatchObject({ _key: 'a3', featured: false, year: 2026, category: 'web-apps' });
    expect(items[3]).toMatchObject({ _key: 'a4', featured: true, year: 2025, category: 'ai-ml' });
  });

  it("derives caption with description -> title -> null fallback chain", async () => {
    const mockAssets = [
      mockAsset({ _id: 'a-desc', tags: ['gallery'], description: 'desc only' }),
      mockAsset({ _id: 'a-title', tags: ['gallery'], description: null, title: 'title only' }),
      mockAsset({ _id: 'a-both', tags: ['gallery'], description: 'desc wins', title: 'title' }),
      mockAsset({ _id: 'a-none', tags: ['gallery'] }),
    ];
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({ result: mockAssets } as never);

    resetAllCaches();
    const items = await getGalleryAssets();
    expect(items[0].caption).toBe('desc only');
    expect(items[1].caption).toBe('title only');
    expect(items[2].caption).toBe('desc wins');
    expect(items[3].caption).toBeNull();
  });

  it("derives alt from altText -> null", async () => {
    const mockAssets = [
      mockAsset({ _id: 'a-alt', tags: ['gallery'], altText: 'an alt' }),
      mockAsset({ _id: 'a-noalt', tags: ['gallery'] }),
    ];
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({ result: mockAssets } as never);

    resetAllCaches();
    const items = await getGalleryAssets();
    expect(items[0].image.alt).toBe('an alt');
    expect(items[1].image.alt).toBeNull();
  });

  it("year regex is by-design lenient (4-digit), category is strict (canonical slugs only)", async () => {
    // 'gallery-2099' (out-of-range year) → year: 2099 (regex doesn't validate range)
    // 'gallery-future' (non-canonical) → category: null (not in CATEGORY_SLUGS)
    const mockAssets = [
      mockAsset({ _id: 'a1', tags: ['gallery', 'gallery-2099', 'gallery-future'] }),
    ];
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({ result: mockAssets } as never);

    resetAllCaches();
    const items = await getGalleryAssets();
    expect(items[0].year).toBe(2099);
    expect(items[0].category).toBeNull();
  });

  it("first matching year tag wins (tag order = priority)", async () => {
    const mockAssets = [
      mockAsset({ _id: 'a1', tags: ['gallery', 'gallery-2025', 'gallery-2026'] }),
    ];
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({ result: mockAssets } as never);

    resetAllCaches();
    const items = await getGalleryAssets();
    expect(items[0].year).toBe(2025);
  });

  it("normalizes asset image shape so urlFor() can consume it", async () => {
    const mockAssets = [
      mockAsset({
        _id: 'a-img',
        tags: ['gallery'],
        url: 'https://cdn.sanity.io/img.jpg',
        metadata: { lqip: 'data:image/jpeg;base64,xxx', dimensions: { width: 800, height: 600 } },
      }),
    ];
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({ result: mockAssets } as never);

    resetAllCaches();
    const items = await getGalleryAssets();
    expect(items[0].image.asset._id).toBe('a-img');
    expect(items[0].image.asset.url).toBe('https://cdn.sanity.io/img.jpg');
    expect(items[0].image.asset.metadata).toEqual({
      lqip: 'data:image/jpeg;base64,xxx',
      dimensions: { width: 800, height: 600 },
    });
  });

  it("returns [] when query returns null", async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({ result: null } as never);
    resetAllCaches();
    const items = await getGalleryAssets();
    expect(items).toEqual([]);
  });

  it("skips null/non-string tag entries from broken media.tag references", async () => {
    // Broken/unpublished media.tag refs deref to null in the GROQ projection;
    // tag.match() on null would throw — verify the helper survives.
    const mockAssets = [
      mockAsset({
        _id: 'a-broken-ref',
        tags: ['gallery', null, 'gallery-2026', undefined, 42, 'gallery-web-apps'],
      }),
    ];
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({ result: mockAssets } as never);

    resetAllCaches();
    const items = await getGalleryAssets();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ year: 2026, category: 'web-apps' });
  });

  it("strips stega markers before regex matching tag values", async () => {
    // Visual-editing previews wrap string values with stega zero-width markers;
    // raw tag strings would no longer match /^gallery-(\d{4})$/. Spec Task 2
    // CRITICAL note required this assertion.
    const { vercelStegaCombine } = await import("@vercel/stega");
    const sourcePath = { origin: 'sanity.io', href: '/x', kind: 'asset' };
    const wrap = (s: string) => vercelStegaCombine(s, sourcePath);
    const mockAssets = [
      mockAsset({
        _id: 'a-stega',
        tags: [wrap('gallery'), wrap('gallery-2026'), wrap('gallery-web-apps'), wrap('gallery-featured')],
      }),
    ];
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce({ result: mockAssets } as never);

    resetAllCaches();
    const items = await getGalleryAssets();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ featured: true, year: 2026, category: 'web-apps' });
  });

  it("returns [] and does not throw when loadQuery rejects", async () => {
    vi.mocked(sanityClient.fetch).mockRejectedValueOnce(new Error('sanity outage') as never);
    resetAllCaches();
    const items = await getGalleryAssets();
    expect(items).toEqual([]);
  });

  it("returns cached result on subsequent calls without additional API calls", async () => {
    vi.resetModules();
    vi.doMock("astro:env/client", () => ({
      PUBLIC_SANITY_VISUAL_EDITING_ENABLED: false,
      PUBLIC_SANITY_DATASET: "production",
      PUBLIC_SITE_ID: "capstone",
    }));
    vi.doMock("astro:env/server", () => ({
      SANITY_API_READ_TOKEN: undefined,
    }));
    const { sanityClient: freshClient } = await import("sanity:client");
    const freshModule = await import("@/lib/sanity");

    const mockAssets = [
      { _id: 'a1', url: 'u', altText: null, title: null, description: null, metadata: null, tags: ['gallery'] },
    ];
    vi.mocked(freshClient.fetch).mockResolvedValueOnce({ result: mockAssets } as never);

    await freshModule.getGalleryAssets();
    expect(freshClient.fetch).toHaveBeenCalledOnce();

    vi.mocked(freshClient.fetch).mockClear();

    const cached = await freshModule.getGalleryAssets();
    expect(cached).toHaveLength(1);
    expect(freshClient.fetch).not.toHaveBeenCalled();
  });

  it("resetAllCaches() clears the gallery cache so the next call refetches", async () => {
    vi.resetModules();
    vi.doMock("astro:env/client", () => ({
      PUBLIC_SANITY_VISUAL_EDITING_ENABLED: false,
      PUBLIC_SANITY_DATASET: "production",
      PUBLIC_SITE_ID: "capstone",
    }));
    vi.doMock("astro:env/server", () => ({
      SANITY_API_READ_TOKEN: undefined,
    }));
    const { sanityClient: freshClient } = await import("sanity:client");
    const freshModule = await import("@/lib/sanity");

    const mockAssets = [
      { _id: 'a1', url: 'u', altText: null, title: null, description: null, metadata: null, tags: ['gallery'] },
    ];
    vi.mocked(freshClient.fetch).mockResolvedValue({ result: mockAssets } as never);

    await freshModule.getGalleryAssets();
    await freshModule.getGalleryAssets();
    expect(freshClient.fetch).toHaveBeenCalledTimes(1);

    freshModule.resetAllCaches();

    await freshModule.getGalleryAssets();
    expect(freshClient.fetch).toHaveBeenCalledTimes(2);
  });
});
