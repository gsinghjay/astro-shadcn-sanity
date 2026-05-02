import { describe, it, expect, vi, beforeEach } from "vitest";

// astro:middleware is a virtual module — defineMiddleware is an identity function
vi.mock("astro:middleware", () => ({
  defineMiddleware: (fn: unknown) => fn,
}));

const { mockEnv, mockAssetsFetch } = vi.hoisted(() => {
  const mockAssetsFetch = vi.fn<(input: URL | string | Request) => Promise<Response>>();
  const mockEnv: Record<string, unknown> = {
    ASSETS: { fetch: mockAssetsFetch },
    // Bindings the auth path reads — kept undefined so we never reach auth
    SESSION_CACHE: undefined,
    RATE_LIMITER: undefined,
    PORTAL_DB: undefined,
  };
  return { mockEnv, mockAssetsFetch };
});

vi.mock("@/lib/db", () => ({ getDrizzle: vi.fn() }));
vi.mock("@/lib/auth-config", () => ({
  createAuth: vi.fn(),
  checkSponsorWhitelist: vi.fn(),
}));
vi.mock("cloudflare:workers", () => ({ env: mockEnv }));

import {
  buildLinkHeader,
  estimateTokens,
  hasMarkdownTwin,
  markdownTwinPath,
  parseAcceptHeader,
  LINK_HEADER_RESOURCES,
} from "../lib/agent-discovery";

import { decorateForAgents } from "../middleware";

function ctx(pathname: string, accept?: string) {
  const headers: Record<string, string> = {};
  if (accept) headers.accept = accept;
  return {
    url: new URL(`http://localhost:4321${pathname}`),
    request: new Request(`http://localhost:4321${pathname}`, { headers }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAssetsFetch.mockReset();
});

describe("agent-discovery lib", () => {
  describe("hasMarkdownTwin", () => {
    it("returns true for content paths", () => {
      expect(hasMarkdownTwin("/")).toBe(true);
      expect(hasMarkdownTwin("/sponsors")).toBe(true);
      expect(hasMarkdownTwin("/sponsors/")).toBe(true);
      expect(hasMarkdownTwin("/projects/sample-project")).toBe(true);
      expect(hasMarkdownTwin("/articles/some-article")).toBe(true);
    });

    it("returns false for excluded prefixes", () => {
      expect(hasMarkdownTwin("/portal/dashboard")).toBe(false);
      expect(hasMarkdownTwin("/portal")).toBe(false);
      expect(hasMarkdownTwin("/auth/callback")).toBe(false);
      expect(hasMarkdownTwin("/student/dashboard")).toBe(false);
      expect(hasMarkdownTwin("/demo/blocks")).toBe(false);
      expect(hasMarkdownTwin("/api/portal/agreement")).toBe(false);
    });

    it("returns false for asset paths and 404", () => {
      expect(hasMarkdownTwin("/_astro/foo.js")).toBe(false);
      expect(hasMarkdownTwin("/llms.txt")).toBe(false);
      expect(hasMarkdownTwin("/sitemap-index.xml")).toBe(false);
      expect(hasMarkdownTwin("/sponsors.md")).toBe(false);
      expect(hasMarkdownTwin("/404")).toBe(false);
    });
  });

  describe("markdownTwinPath", () => {
    it("maps homepage to /.md", () => {
      expect(markdownTwinPath("/")).toBe("/.md");
    });
    it("appends .md to non-root paths", () => {
      expect(markdownTwinPath("/sponsors")).toBe("/sponsors.md");
      expect(markdownTwinPath("/projects/foo")).toBe("/projects/foo.md");
    });
    it("normalizes trailing slash", () => {
      expect(markdownTwinPath("/sponsors/")).toBe("/sponsors.md");
    });
  });

  describe("buildLinkHeader", () => {
    it("emits the three base resources without a twin", () => {
      const link = buildLinkHeader("/portal/dashboard", false);
      expect(link).toContain('</llms.txt>; rel="describedby"; type="text/plain"');
      expect(link).toContain('</llms-full.txt>; rel="alternate"; type="text/plain"');
      expect(link).toContain('</sitemap-index.xml>; rel="sitemap"; type="application/xml"');
      expect(link).not.toContain("text/markdown");
    });

    it("appends per-page twin when includeMarkdownTwin=true", () => {
      const link = buildLinkHeader("/sponsors", true);
      expect(link).toContain('</sponsors.md>; rel="alternate"; type="text/markdown"');
    });

    it("uses /.md for the homepage twin", () => {
      const link = buildLinkHeader("/", true);
      expect(link).toContain('</.md>; rel="alternate"; type="text/markdown"');
    });

    it("comma-separates members per RFC 8288", () => {
      const link = buildLinkHeader("/sponsors", true);
      // 3 base + 1 twin = 4 members → 3 ", " separators
      expect(link.split(", ")).toHaveLength(4);
    });

    it("LINK_HEADER_RESOURCES is the expected base set", () => {
      expect(LINK_HEADER_RESOURCES).toHaveLength(3);
      expect(LINK_HEADER_RESOURCES.map(r => r.href)).toEqual([
        "/llms.txt",
        "/llms-full.txt",
        "/sitemap-index.xml",
      ]);
    });
  });

  describe("parseAcceptHeader", () => {
    it("returns prefersMarkdown=false for absent / empty", () => {
      expect(parseAcceptHeader(null)).toEqual({ prefersMarkdown: false });
      expect(parseAcceptHeader("")).toEqual({ prefersMarkdown: false });
      expect(parseAcceptHeader(undefined)).toEqual({ prefersMarkdown: false });
    });

    it("recognizes plain text/markdown", () => {
      expect(parseAcceptHeader("text/markdown")).toEqual({ prefersMarkdown: true });
    });

    it("recognizes markdown with html tie — HTML wins", () => {
      // q defaults to 1 for both; HTML wins ties
      expect(parseAcceptHeader("text/markdown,text/html")).toEqual({ prefersMarkdown: false });
    });

    it("recognizes markdown when q ranks higher than html", () => {
      expect(parseAcceptHeader("text/markdown,text/html;q=0.9")).toEqual({ prefersMarkdown: true });
      expect(parseAcceptHeader("text/markdown;q=1.0,text/html;q=0.5")).toEqual({ prefersMarkdown: true });
    });

    it("returns false when html outranks markdown", () => {
      expect(parseAcceptHeader("text/markdown;q=0.5,text/html;q=0.9")).toEqual({ prefersMarkdown: false });
    });

    it("returns false for browser default Accept", () => {
      expect(
        parseAcceptHeader("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),
      ).toEqual({ prefersMarkdown: false });
    });

    it("ignores q=0 (do not accept)", () => {
      expect(parseAcceptHeader("text/markdown;q=0,text/html")).toEqual({ prefersMarkdown: false });
    });

    it("handles whitespace and casing", () => {
      expect(parseAcceptHeader("  TEXT/MARKDOWN  ;  q=0.9  ,  TEXT/HTML ; q=0.5")).toEqual({
        prefersMarkdown: true,
      });
    });
  });

  describe("estimateTokens", () => {
    it("returns Math.ceil(length / 4)", () => {
      expect(estimateTokens("")).toBe(0);
      expect(estimateTokens("abc")).toBe(1);
      expect(estimateTokens("abcd")).toBe(1);
      expect(estimateTokens("abcde")).toBe(2);
      expect(estimateTokens("a".repeat(400))).toBe(100);
    });
  });
});

describe("middleware decorateForAgents", () => {
  describe("Link headers on HTML responses", () => {
    it("emits Link with all four rel values for an HTML page with a twin", async () => {
      const next = vi.fn(async () => new Response("<html></html>", {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      }));
      const res = await decorateForAgents(ctx("/sponsors"), next);
      const link = res.headers.get("link") ?? "";
      expect(link).toContain('</llms.txt>; rel="describedby"');
      expect(link).toContain('</llms-full.txt>; rel="alternate"');
      expect(link).toContain('</sitemap-index.xml>; rel="sitemap"');
      expect(link).toContain('</sponsors.md>; rel="alternate"; type="text/markdown"');
    });

    it("omits the .md twin for excluded paths but still emits base resources", async () => {
      const next = vi.fn(async () => new Response("<html></html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      }));
      const res = await decorateForAgents(ctx("/api/something/page"), next);
      // /api is excluded by middleware path routing in real flow, but the helper
      // is also defensive — verify with a content path that's still public/HTML.
      const link = res.headers.get("link") ?? "";
      // /api would not actually reach decorateForAgents in production, but the
      // helper itself should still avoid advertising a twin for excluded paths.
      expect(link).not.toContain("text/markdown");
    });

    it("emits </.md> for the homepage twin", async () => {
      const next = vi.fn(async () => new Response("<html></html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      }));
      const res = await decorateForAgents(ctx("/"), next);
      expect(res.headers.get("link") ?? "").toContain('</.md>; rel="alternate"; type="text/markdown"');
    });

    it("sets Vary: Accept on HTML responses", async () => {
      const next = vi.fn(async () => new Response("<html></html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      }));
      const res = await decorateForAgents(ctx("/sponsors"), next);
      expect(res.headers.get("vary")).toBe("Accept");
    });

    it("appends Accept to existing Vary header", async () => {
      const next = vi.fn(async () => new Response("<html></html>", {
        status: 200,
        headers: { "content-type": "text/html", vary: "Cookie" },
      }));
      const res = await decorateForAgents(ctx("/sponsors"), next);
      expect(res.headers.get("vary")).toBe("Cookie, Accept");
    });

    it("does not duplicate Accept when already present", async () => {
      const next = vi.fn(async () => new Response("<html></html>", {
        status: 200,
        headers: { "content-type": "text/html", vary: "Accept, Cookie" },
      }));
      const res = await decorateForAgents(ctx("/sponsors"), next);
      expect(res.headers.get("vary")).toBe("Accept, Cookie");
    });

    it("does NOT emit Link or Vary on non-HTML responses (llms.txt)", async () => {
      const next = vi.fn(async () => new Response("# llms", {
        status: 200,
        headers: { "content-type": "text/plain; charset=utf-8" },
      }));
      const res = await decorateForAgents(ctx("/llms.txt"), next);
      expect(res.headers.get("link")).toBeNull();
      expect(res.headers.get("vary")).toBeNull();
    });

    it("does NOT emit Link on sitemap.xml responses", async () => {
      const next = vi.fn(async () => new Response("<urlset/>", {
        status: 200,
        headers: { "content-type": "application/xml" },
      }));
      const res = await decorateForAgents(ctx("/sitemap-index.xml"), next);
      expect(res.headers.get("link")).toBeNull();
    });

    it("does NOT emit Link on JSON responses (api/health)", async () => {
      const next = vi.fn(async () => new Response('{"ok":true}', {
        status: 200,
        headers: { "content-type": "application/json" },
      }));
      const res = await decorateForAgents(ctx("/api/health"), next);
      expect(res.headers.get("link")).toBeNull();
    });
  });

  describe("Markdown content negotiation", () => {
    it("returns markdown body when Accept: text/markdown and twin exists", async () => {
      mockAssetsFetch.mockResolvedValue(
        new Response("# Sponsors\n\nMarkdown body.", {
          status: 200,
          headers: { "content-type": "text/markdown" },
        }),
      );
      const next = vi.fn();
      const res = await decorateForAgents(ctx("/sponsors", "text/markdown"), next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
      expect(res.headers.get("vary")).toBe("Accept");
      expect(res.headers.get("link")).toContain('</sponsors.md>; rel="alternate"; type="text/markdown"');
      expect(res.headers.get("x-markdown-tokens")).toBeTruthy();
      const tokens = Number(res.headers.get("x-markdown-tokens"));
      expect(tokens).toBeGreaterThan(0);
      expect(await res.text()).toBe("# Sponsors\n\nMarkdown body.");
    });

    it("falls through to HTML for excluded paths even when Accept: text/markdown", async () => {
      // /portal is excluded — but decorateForAgents wouldn't be called for /portal
      // in production (auth branch). For belt-and-braces, test it directly here:
      // call with an excluded path and verify next() was used (HTML response).
      const next = vi.fn(async () => new Response("<html>portal</html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      }));
      const res = await decorateForAgents(ctx("/portal/dashboard", "text/markdown"), next);

      expect(next).toHaveBeenCalled();
      expect(res.headers.get("content-type")).toBe("text/html");
      expect(mockAssetsFetch).not.toHaveBeenCalled();
    });

    it("returns HTML when Accept: text/html even if a twin exists", async () => {
      const next = vi.fn(async () => new Response("<html>sponsors</html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      }));
      const res = await decorateForAgents(ctx("/sponsors", "text/html"), next);

      expect(next).toHaveBeenCalled();
      expect(res.headers.get("content-type")).toBe("text/html");
      expect(mockAssetsFetch).not.toHaveBeenCalled();
      expect(res.headers.get("link")).toContain("text/markdown");
    });

    it("falls through to HTML when twin asset returns 404", async () => {
      mockAssetsFetch.mockResolvedValue(new Response("Not Found", { status: 404 }));
      const next = vi.fn(async () => new Response("<html>missing twin</html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      }));
      const res = await decorateForAgents(ctx("/some-page-without-twin", "text/markdown"), next);

      expect(mockAssetsFetch).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(res.headers.get("content-type")).toBe("text/html");
      expect(res.headers.get("link")).toContain('</some-page-without-twin.md>');
    });

    it("html wins on q-value tie (text/markdown,text/html;q=0.9 returns markdown; equal q returns html)", async () => {
      // Sub-case 1: markdown clearly preferred → markdown
      mockAssetsFetch.mockResolvedValueOnce(new Response("md", {
        status: 200, headers: { "content-type": "text/markdown" },
      }));
      const r1 = await decorateForAgents(ctx("/sponsors", "text/markdown,text/html;q=0.9"), vi.fn());
      expect(r1.headers.get("content-type")).toBe("text/markdown; charset=utf-8");

      // Sub-case 2: html outranks markdown → html
      const next = vi.fn(async () => new Response("<html>html</html>", {
        status: 200, headers: { "content-type": "text/html" },
      }));
      const r2 = await decorateForAgents(ctx("/sponsors", "text/markdown;q=0.5,text/html;q=0.9"), next);
      expect(next).toHaveBeenCalled();
      expect(r2.headers.get("content-type")).toBe("text/html");
    });

    it("returns markdown for the homepage Accept: text/markdown", async () => {
      mockAssetsFetch.mockResolvedValue(new Response("# Home\n\nWelcome.", {
        status: 200,
        headers: { "content-type": "text/markdown" },
      }));
      const res = await decorateForAgents(ctx("/", "text/markdown"), vi.fn());

      expect(mockAssetsFetch).toHaveBeenCalledOnce();
      const fetchedUrl = mockAssetsFetch.mock.calls[0][0];
      expect(String(fetchedUrl)).toContain("/.md");
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    });

    it("does not intercept direct .md requests (lets Workers asset handler serve them)", async () => {
      const next = vi.fn(async () => new Response("# direct", {
        status: 200,
        headers: { "content-type": "text/plain" },
      }));
      const res = await decorateForAgents(ctx("/sponsors.md", "text/markdown"), next);

      expect(mockAssetsFetch).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(res.headers.get("content-type")).toBe("text/plain");
    });
  });
});
