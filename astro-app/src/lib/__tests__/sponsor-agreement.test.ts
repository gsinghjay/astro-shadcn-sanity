import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("astro:env/client", () => ({
  PUBLIC_SANITY_VISUAL_EDITING_ENABLED: false,
  PUBLIC_SANITY_DATASET: "production",
  PUBLIC_SITE_ID: "capstone",
}));

vi.mock("astro:env/server", () => ({
  SANITY_API_READ_TOKEN: undefined,
}));

// Import after vi.mock so module-level constants pick up mocked env values.
const { sanityClient } = await import("sanity:client");

describe("SPONSOR_AGREEMENT_QUERY and getSponsorAgreement()", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("astro:env/client", () => ({
      PUBLIC_SANITY_VISUAL_EDITING_ENABLED: false,
      PUBLIC_SANITY_DATASET: "production",
      PUBLIC_SITE_ID: "capstone",
    }));
    vi.doMock("astro:env/server", () => ({
      SANITY_API_READ_TOKEN: undefined,
    }));
  });

  it("SPONSOR_AGREEMENT_QUERY targets sponsorAgreement by _id with all fields", async () => {
    const mod = await import("@/lib/sanity");
    const q = mod.SPONSOR_AGREEMENT_QUERY;
    expect(q).toContain('_type == "sponsorAgreement"');
    expect(q).toContain("_id == $id");
    expect(q).toContain("title");
    expect(q).toContain("intro");
    expect(q).toContain("pdfFile");
    expect(q).toContain("originalFilename");
    expect(q).toContain("checkboxLabel");
    expect(q).toContain("acceptButtonText");
    expect(q).toContain("bodyContent");
  });

  it("returns null and swallows errors when loadQuery throws", async () => {
    const { sanityClient: client } = await import("sanity:client");
    const mod = await import("@/lib/sanity");

    vi.mocked(client.fetch).mockRejectedValueOnce(new Error("network down"));

    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await mod.getSponsorAgreement();
    expect(result).toBeNull();
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it("does not cache between calls — every call hits Sanity (CDN handles edge caching)", async () => {
    const { sanityClient: client } = await import("sanity:client");
    const mod = await import("@/lib/sanity");

    vi.mocked(client.fetch).mockResolvedValue({ result: null, syncTags: [] } as never);

    const first = await mod.getSponsorAgreement();
    expect(first).toBeNull();
    expect(client.fetch).toHaveBeenCalledOnce();

    const second = await mod.getSponsorAgreement();
    expect(second).toBeNull();
    expect(client.fetch).toHaveBeenCalledTimes(2);
  });

  it("returns document fetched from Sanity (no module cache)", async () => {
    const { sanityClient: client } = await import("sanity:client");
    const mod = await import("@/lib/sanity");

    const doc = {
      _id: "sponsorAgreement",
      title: "Sponsor Agreement",
      intro: null,
      pdfFile: { asset: { _id: "asset-1", url: "https://cdn.example/agreement.pdf", originalFilename: "agreement.pdf", size: 1234, mimeType: "application/pdf" } },
      checkboxLabel: "I accept",
      acceptButtonText: "Accept & Continue",
      bodyContent: null,
    };
    vi.mocked(client.fetch).mockResolvedValue({ result: doc, syncTags: [] } as never);

    const first = await mod.getSponsorAgreement();
    expect(first).toEqual(doc);
    expect(client.fetch).toHaveBeenCalledWith(
      expect.stringContaining('_type == "sponsorAgreement"'),
      { id: "sponsorAgreement" },
      expect.objectContaining({ filterResponse: false, perspective: "published" }),
    );

    const second = await mod.getSponsorAgreement();
    expect(second).toEqual(doc);
    expect(client.fetch).toHaveBeenCalledTimes(2);
  });

  it("always uses the un-suffixed singleton ID — agreement is capstone-only, RWC has no portal", async () => {
    vi.resetModules();
    vi.doMock("astro:env/client", () => ({
      PUBLIC_SANITY_VISUAL_EDITING_ENABLED: false,
      PUBLIC_SANITY_DATASET: "rwc",
      PUBLIC_SITE_ID: "rwc-us",
    }));
    vi.doMock("astro:env/server", () => ({
      SANITY_API_READ_TOKEN: undefined,
    }));
    const { sanityClient: client } = await import("sanity:client");
    const mod = await import("@/lib/sanity");

    vi.mocked(client.fetch).mockResolvedValueOnce({ result: null, syncTags: [] } as never);

    await mod.getSponsorAgreement();
    expect(client.fetch).toHaveBeenCalledWith(
      expect.any(String),
      { id: "sponsorAgreement" },
      expect.any(Object),
    );
  });
});

// Keep the top-level import referenced so the file compiles with isolatedModules
void sanityClient;
