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
 * Pure functions only — no Workers globals, no Astro context. The runtime
 * implementation lives in `agent-discovery-runtime.mjs` (plain JS) so the
 * postbuild wrapper at `scripts/wrap-entry-for-agents.mjs` can share the same
 * source. This file is the typed surface used by `src/middleware.ts` and tests.
 */

import * as runtime from "./agent-discovery-runtime.mjs";

export interface LinkResource {
  href: string;
  rel: string;
  type: string;
}

export interface AcceptPreference {
  prefersMarkdown: boolean;
}

export interface AssetFetcher {
  fetch(input: URL | string | Request): Promise<Response>;
}

export const LINK_HEADER_RESOURCES: readonly LinkResource[] = runtime.LINK_HEADER_RESOURCES;
export const AGENT_CONTENT_SIGNAL: string = runtime.AGENT_CONTENT_SIGNAL;

export const hasMarkdownTwin: (pathname: string) => boolean = runtime.hasMarkdownTwin;
export const markdownTwinPath: (pathname: string) => string = runtime.markdownTwinPath;
export const buildLinkHeader: (pathname: string, includeMarkdownTwin: boolean) => string =
  runtime.buildLinkHeader;
export const parseAcceptHeader: (accept: string | null | undefined) => AcceptPreference =
  runtime.parseAcceptHeader;
export const estimateTokens: (body: string) => number = runtime.estimateTokens;
export const getMarkdownTwin: (
  pathname: string,
  fetcher: AssetFetcher,
  baseUrl: string,
) => Promise<Response | null> = runtime.getMarkdownTwin;
