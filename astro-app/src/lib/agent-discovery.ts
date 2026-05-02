/**
 * Agent discovery primitives for AI crawlers / LLM clients.
 *
 * Two coupled concerns (see Story 5.21):
 *   1. RFC 8288 `Link` response headers on every HTML response, advertising the
 *      machine-readable corpus emitted by `astro-llms-md` (`/llms.txt`,
 *      `/llms-full.txt`, `/sitemap-index.xml`, plus a per-page `.md` twin).
 *   2. Markdown content negotiation (`Accept: text/markdown`) — when an agent
 *      asks for markdown, return the pre-built `.md` twin from `dist/client/`
 *      via the Workers ASSETS binding.
 *
 * Pure functions only — no Workers globals, no Astro context — so middleware
 * stays a thin caller and the matrix is exhaustively unit-testable.
 */

/** Path prefixes whose pages are not in the `astro-llms-md` corpus.
 *  Must stay in sync with `exclude:` in `astro.config.mjs:215-218`. */
const MARKDOWN_EXCLUDED_PREFIXES = [
  "/portal/",
  "/auth/",
  "/student/",
  "/demo/",
  "/api/",
] as const;

/** Bare path equivalents of the prefixes (so `/portal` itself is excluded, not just `/portal/x`). */
const MARKDOWN_EXCLUDED_EXACT = new Set<string>([
  "/portal",
  "/auth",
  "/student",
  "/demo",
  "/api",
  "/404",
  "/404.html",
]);

export interface LinkResource {
  href: string;
  rel: string;
  type: string;
}

/** Fixed corpus-level resources advertised on every HTML response. */
export const LINK_HEADER_RESOURCES: readonly LinkResource[] = [
  { href: "/llms.txt", rel: "describedby", type: "text/plain" },
  { href: "/llms-full.txt", rel: "alternate", type: "text/plain" },
  { href: "/sitemap-index.xml", rel: "sitemap", type: "application/xml" },
] as const;

/** Strip a single trailing slash, preserving the root `/`. */
function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

/** Returns true when the requested path is part of the public `.md` twin corpus.
 *  Mirrors the `exclude` list in `astro-llms-md` (astro.config.mjs:215-218) plus
 *  basic guards for asset paths and 404 routes. */
export function hasMarkdownTwin(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (MARKDOWN_EXCLUDED_EXACT.has(path)) return false;
  for (const prefix of MARKDOWN_EXCLUDED_PREFIXES) {
    if (path.startsWith(prefix)) return false;
  }
  if (path.startsWith("/_astro/")) return false;
  // Any path with a file extension other than `.html` is an asset, not a page.
  // `path === '/'` has no extension; root passes through.
  const ext = path.match(/\.[a-z0-9]+$/i)?.[0];
  if (ext && ext !== ".html") return false;
  return true;
}

/** Resolve the request path to its `.md` twin URL.
 *  - `/` → `/.md` (the literal artifact emitted for the homepage)
 *  - `/sponsors` → `/sponsors.md`
 *  - `/sponsors/` → `/sponsors.md` (trailing slash normalized)
 */
export function markdownTwinPath(pathname: string): string {
  const path = normalizePath(pathname);
  if (path === "" || path === "/") return "/.md";
  return `${path}.md`;
}

/** Build the comma-separated RFC 8288 `Link` header value for a request.
 *  When `includeMarkdownTwin` is true, appends `<{path}.md>; rel="alternate"; type="text/markdown"`. */
export function buildLinkHeader(pathname: string, includeMarkdownTwin: boolean): string {
  const resources: LinkResource[] = LINK_HEADER_RESOURCES.map(r => ({ ...r }));
  if (includeMarkdownTwin) {
    resources.push({
      href: markdownTwinPath(pathname),
      rel: "alternate",
      type: "text/markdown",
    });
  }
  return resources
    .map(({ href, rel, type }) => `<${href}>; rel="${rel}"; type="${type}"`)
    .join(", ");
}

export interface AcceptPreference {
  prefersMarkdown: boolean;
}

/** Parse an `Accept` header per RFC 9110 §12.5.1 and decide whether the client
 *  prefers `text/markdown` over `text/html`. HTML wins ties — browsers send
 *  `text/html` with q=1 by default, so an agent must explicitly outrank HTML. */
export function parseAcceptHeader(accept: string | null | undefined): AcceptPreference {
  if (!accept) return { prefersMarkdown: false };
  let mdQ = -1;
  let htmlQ = -1;
  for (const segment of accept.split(",")) {
    const parts = segment.trim().split(";").map(s => s.trim());
    const mediaType = parts[0]?.toLowerCase();
    if (!mediaType) continue;
    let q = 1;
    for (const param of parts.slice(1)) {
      const m = param.match(/^q=([0-9]*\.?[0-9]+)$/i);
      if (m) {
        const parsed = Number.parseFloat(m[1]);
        if (Number.isFinite(parsed)) q = parsed;
        break;
      }
    }
    if (mediaType === "text/markdown") mdQ = Math.max(mdQ, q);
    else if (mediaType === "text/html") htmlQ = Math.max(htmlQ, q);
  }
  // q=0 means "do not accept"; ignore. HTML wins when md <= html.
  if (mdQ <= 0) return { prefersMarkdown: false };
  return { prefersMarkdown: mdQ > htmlQ };
}

/** OpenAI rule-of-thumb: ~4 chars per token for English text (GPT-4 family).
 *  Documented as approximation; swap for `tiktoken-bpe` if precise budgeting matters later. */
export function estimateTokens(body: string): number {
  return Math.ceil(body.length / 4);
}

/** Minimal shape of the Workers ASSETS binding's fetcher. */
export interface AssetFetcher {
  fetch(input: URL | string | Request): Promise<Response>;
}

/** Fetch the `.md` twin for `pathname` from the ASSETS binding.
 *  Returns the response on 200 and `null` for any other outcome (404, error, excluded path,
 *  direct `.md` request). The middleware caller falls through to HTML on null. */
export async function getMarkdownTwin(
  pathname: string,
  fetcher: AssetFetcher,
  baseUrl: string,
): Promise<Response | null> {
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
