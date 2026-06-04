import type { APIRoute } from "astro";
import { log } from "@/lib/log";

/**
 * Story 26.1 — Clear the Sanity Preview Mode cookie.
 *
 * Sets Max-Age=0 on both cookie names (the prod __Secure- variant and the
 * dev fallback) so the next request renders the published path.
 */
export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const target = url.searchParams.get("redirect") || "/";

  // Match the SameSite policy used on enable.ts so the browser matches the
  // existing cookie and overwrites it with Max-Age=0. Mismatched attributes
  // can leave the old cookie alive in some browser implementations.
  const expire = (name: string, secure: boolean) =>
    [
      `${name}=`,
      "Path=/",
      "HttpOnly",
      secure ? "Secure" : "",
      secure ? "SameSite=None" : "SameSite=Lax",
      "Max-Age=0",
    ]
      .filter(Boolean)
      .join("; ");

  const headers = new Headers({
    "Cache-Control": "no-store",
    Location: new URL(target, url).toString(),
  });
  // Append two Set-Cookie headers so we cover both prod (__Secure- prefix) and
  // local-dev (no prefix) names without guessing which one is currently set.
  headers.append("Set-Cookie", expire("__Secure-sanity-preview", true));
  headers.append("Set-Cookie", expire("sanity-preview", false));

  log.info("draft-mode-disable-ok", { redirectTo: target });
  return new Response(null, { status: 307, headers });
};
