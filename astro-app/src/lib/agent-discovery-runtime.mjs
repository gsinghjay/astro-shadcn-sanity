// Story 5.21 runtime for agent discovery (RFC 8288 Link headers + Accept:
// text/markdown content negotiation). Plain JS so the postbuild wrapper at
// scripts/wrap-entry-for-agents.mjs can copy this file verbatim into
// dist/server/agent-discovery-runtime.mjs without a TS transpile step. The
// TypeScript surface in agent-discovery.ts is a thin typed re-export of this
// module — single source of truth for both the middleware (SSR path) and the
// adapter-entry wrapper (prerendered path).

export const MARKDOWN_EXCLUDED_PREFIXES = [
  "/portal/",
  "/auth/",
  "/student/",
  "/demo/",
  "/api/",
];

export const MARKDOWN_EXCLUDED_EXACT = new Set([
  "/portal",
  "/auth",
  "/student",
  "/demo",
  "/api",
  "/404",
  "/404.html",
]);

export const LINK_HEADER_RESOURCES = [
  { href: "/llms.txt", rel: "describedby", type: "text/plain" },
  { href: "/llms-full.txt", rel: "alternate", type: "text/plain" },
  { href: "/sitemap-index.xml", rel: "sitemap", type: "application/xml" },
];

// Cloudflare's "Markdown for Agents" platform feature sets this header on
// every markdown response (see developers.cloudflare.com/fundamentals/reference/markdown-for-agents/).
// We mirror the default value for protocol parity.
export const AGENT_CONTENT_SIGNAL = "ai-train=yes, search=yes, ai-input=yes";

export function normalizePath(pathname) {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

export function hasMarkdownTwin(pathname) {
  const path = normalizePath(pathname);
  if (MARKDOWN_EXCLUDED_EXACT.has(path)) return false;
  for (const prefix of MARKDOWN_EXCLUDED_PREFIXES) {
    if (path.startsWith(prefix)) return false;
  }
  if (path.startsWith("/_astro/")) return false;
  const ext = path.match(/\.[a-z0-9]+$/i);
  if (ext && ext[0] !== ".html") return false;
  return true;
}

export function markdownTwinPath(pathname) {
  const path = normalizePath(pathname);
  if (path === "" || path === "/") return "/.md";
  return `${path}.md`;
}

export function buildLinkHeader(pathname, includeMarkdownTwin) {
  const resources = LINK_HEADER_RESOURCES.map((r) => ({ ...r }));
  if (includeMarkdownTwin) {
    resources.push({
      href: markdownTwinPath(pathname),
      rel: "alternate",
      type: "text/markdown",
    });
  }
  return resources
    .map(({ href, rel, type }) => `<${encodeURI(href)}>; rel="${rel}"; type="${type}"`)
    .join(", ");
}

export function parseAcceptHeader(accept) {
  if (!accept) return { prefersMarkdown: false };
  let mdQ = -1;
  let htmlQ = -1;
  for (const segment of accept.split(",")) {
    const parts = segment.trim().split(";").map((s) => s.trim());
    const mediaType = parts[0]?.toLowerCase();
    if (!mediaType) continue;
    let q = 1;
    for (const param of parts.slice(1)) {
      const m = param.match(/^q=([0-9]*\.?[0-9]+)$/i);
      if (m) {
        const parsed = Number.parseFloat(m[1]);
        // RFC 9110 §12.4.2 caps quality values to [0, 1]; clamp out-of-range.
        if (Number.isFinite(parsed)) q = Math.min(1, Math.max(0, parsed));
        break;
      }
    }
    if (mediaType === "text/markdown") mdQ = Math.max(mdQ, q);
    else if (mediaType === "text/html") htmlQ = Math.max(htmlQ, q);
  }
  if (mdQ <= 0) return { prefersMarkdown: false };
  return { prefersMarkdown: mdQ > htmlQ };
}

export function estimateTokens(body) {
  return Math.ceil(body.length / 4);
}

export async function getMarkdownTwin(pathname, fetcher, baseUrl) {
  if (pathname.endsWith(".md")) return null;
  if (!hasMarkdownTwin(pathname)) return null;
  try {
    const twinUrl = new URL(markdownTwinPath(pathname), baseUrl);
    const res = await fetcher.fetch(twinUrl);
    if (res.ok) return res;
    return null;
  } catch {
    return null;
  }
}
