import type { APIRoute } from "astro";
import { SANITY_API_READ_TOKEN } from "astro:env/server";
import { sanityClient } from "sanity:client";
import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { log } from "@/lib/log";

/**
 * Story 26.1 — Sanity Preview Mode entry point.
 *
 * Studio Presentation calls this with `?sanity-preview-secret=<...>` (and
 * optionally `?sanity-preview-pathname=/<path>`). We validate the secret
 * against Sanity's `sanity.previewUrlSecret` doc (Sanity manages TTL itself —
 * see `@sanity/preview-url-secret` `SECRET_TTL`), then set an HTTP-only
 * cookie so subsequent same-site requests render drafts.
 *
 * The cookie value IS the validated secret — no separate HMAC layer needed
 * because Sanity's secret store is the trust root. Middleware re-validates
 * on each request (cached 5min in-isolate to keep the steady-state Sanity
 * hit rate near zero).
 *
 * Cross-origin note: Studio runs at `ywcccapstone.sanity.studio` but the
 * iframe loads `www.ywcccapstone1.com` directly, so the cookie set here is
 * **first-party** to the production domain. `SameSite=Lax` is sufficient.
 */
export const prerender = false;

const COOKIE_NAME = "__Secure-sanity-preview";
const COOKIE_MAX_AGE_SECONDS = 24 * 60 * 60; // 24h — re-enter via Studio Presentation to refresh

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const secret = url.searchParams.get("sanity-preview-secret");

  if (!secret) {
    log.warn("draft-mode-enable-missing-secret", { url: url.pathname });
    return new Response("Missing sanity-preview-secret param", { status: 400 });
  }

  // validatePreviewUrl checks the secret against Sanity's own previewUrlSecret
  // doc; returns { isValid, redirectTo, studioOrigin, studioPreviewPerspective }.
  // The `sanity.previewUrlSecret` doc is private to the project — it requires
  // a read token to fetch. The default `sanityClient` from `sanity:client` is
  // unauthenticated (token is per-call via lib/sanity.ts), so we attach the
  // read token here via withConfig.
  if (!SANITY_API_READ_TOKEN) {
    log.error("draft-mode-enable-missing-read-token", { url: url.pathname });
    return new Response("Server is missing SANITY_API_READ_TOKEN", { status: 500 });
  }
  let validation;
  try {
    const authedClient = sanityClient.withConfig({
      token: SANITY_API_READ_TOKEN,
      useCdn: false,
    });
    validation = await validatePreviewUrl(authedClient, request.url);
  } catch (err) {
    log.error("draft-mode-enable-validate-failed", err);
    return new Response("Failed to validate preview secret", { status: 502 });
  }

  if (!validation.isValid) {
    log.warn("draft-mode-enable-invalid-secret", { url: url.pathname });
    return new Response("Invalid preview secret", { status: 401 });
  }

  // Local dev: __Secure- prefix requires HTTPS. Skip the prefix in dev.
  const isHttps = url.protocol === "https:";
  const cookieName = isHttps ? COOKIE_NAME : "sanity-preview";

  // SameSite=None is REQUIRED here. Studio at `sanity.studio` embeds the
  // production domain in an iframe, which is a cross-site context from the
  // browser's perspective. SameSite=Lax cookies are NOT sent in cross-site
  // iframe contexts — even for same-origin requests within the iframe — so
  // the cookie would never reach middleware on the post-/enable redirect,
  // and visual editing could never connect. SameSite=None requires Secure,
  // which is fine over HTTPS; in local-dev HTTP we drop both flags so the
  // browser accepts the cookie at all (Lax is the dev default).
  const sameSite = isHttps ? "SameSite=None" : "SameSite=Lax";

  const cookie = [
    `${cookieName}=${encodeURIComponent(secret)}`,
    "Path=/",
    "HttpOnly",
    isHttps ? "Secure" : "",
    sameSite,
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
  ]
    .filter(Boolean)
    .join("; ");

  const target = validation.redirectTo || "/";
  log.info("draft-mode-enable-ok", { redirectTo: target });

  return new Response(null, {
    status: 307,
    headers: {
      Location: new URL(target, url).toString(),
      "Set-Cookie": cookie,
      "Cache-Control": "no-store",
    },
  });
};
