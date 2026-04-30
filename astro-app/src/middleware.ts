import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";

/** Rate limiting configuration */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 100;

/** Paths under /portal/* that skip auth checks (matched after trailing-slash normalization) */
const PORTAL_PUBLIC_PATHS = new Set(["/portal/login", "/portal/denied"]);

/** Endpoint that handles agreement acceptance — must remain reachable while the gate is active */
const AGREEMENT_ACCEPT_PATH = "/api/portal/agreement/accept";

const jsonError = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), {
    status,
    headers: { "content-type": "application/json" },
  });

/** Shape stored in SESSION_CACHE. `agreementAcceptedAt === undefined` means the cache predates the field. */
type CachedSession = {
  email: string;
  name: string;
  role: string;
  agreementAcceptedAt?: number | null;
};

/** Better Auth session user shape including custom additionalFields */
interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  // Admin endpoints under /api/portal/admin/* authenticate via STUDIO_ADMIN_TOKEN
  // (cross-origin Studio caller, no session cookie). Skip the session gate so the
  // route handler can run its own bearer/origin checks and emit CORS headers.
  const isPortalAdminApi = pathname.startsWith("/api/portal/admin/");
  const isPortalApi = pathname.startsWith("/api/portal/") && !isPortalAdminApi;
  const isPortalPage = pathname.startsWith("/portal/") || pathname === "/portal";
  const isPortal = isPortalPage || isPortalApi;
  const isStudent = pathname.startsWith("/student/") || pathname === "/student";

  // Branch 1: Public routes (and admin API) — zero auth overhead
  if (!isPortal && !isStudent) {
    return next();
  }

  // Whitelist login/denied pages from auth check (normalize trailing slash)
  const cleanPath = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  if (PORTAL_PUBLIC_PATHS.has(cleanPath)) {
    return next();
  }

  // Dev mode bypass — both roles (also skips rate limiting and the agreement gate)
  if (import.meta.env.DEV) {
    if (isPortal) {
      context.locals.user = { email: "dev@example.com", name: "Dev Sponsor", role: "sponsor" };
    } else {
      context.locals.user = { email: "dev-student@example.com", name: "Dev Student", role: "student" };
    }
    context.locals.requiresAgreement = false;
    return next();
  }

  // Email comparisons are case-insensitive: Better Auth lowercases on signup, but D1 has no
  // case-folding constraint so a sponsor whose row was inserted with a different case would
  // be locked out of the agreement gate. `normalizeEmail()` is the single point of truth.

  // Lazy-load auth dependencies — avoids MiddlewareCantBeLoaded errors when
  // better-auth/drizzle-orm/resend aren't installed (e.g., Docker dev with stale volumes)
  const { getDrizzle } = await import("@/lib/db");
  const { createAuth, checkSponsorWhitelist } = await import("@/lib/auth-config");

  const runtimeEnv = env;
  // Rate limiting — per-IP sliding window via Durable Object (fail-open)
  const rateLimiter = runtimeEnv.RATE_LIMITER;
  if (rateLimiter) {
    const ip = context.request.headers.get("CF-Connecting-IP") ?? "unknown";
    try {
      const id = rateLimiter.idFromName(`ip:${ip}`);
      const stub = rateLimiter.get(id);
      const result = await stub.checkLimit(RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS);
      if (!result.allowed) {
        const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000);
        return new Response("Too Many Requests", {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
          },
        });
      }
    } catch (e) {
      console.error("[middleware] Rate limiter error, failing open:", e);
      // Continue to auth — don't block legitimate users
    }
  }

  // Unified session check — one path for both sponsors and students
  try {
    const kvCache = runtimeEnv?.SESSION_CACHE;
    const sessionToken = extractSessionToken(context.request.headers.get("cookie"));

    let userData: CachedSession | null = null;

    // KV cache check — skip D1 if session is cached
    if (kvCache && sessionToken) {
      const cached = await kvCache.get<CachedSession>(sessionToken, { type: "json" });
      if (cached) {
        userData = cached;
      }
    }

    // D1 fallback via Better Auth
    if (!userData && sessionToken) {
      const db = getDrizzle();
      const auth = createAuth({
        db,
        env: {
          GOOGLE_CLIENT_ID: runtimeEnv.GOOGLE_CLIENT_ID,
          GOOGLE_CLIENT_SECRET: runtimeEnv.GOOGLE_CLIENT_SECRET,
          GITHUB_CLIENT_ID: runtimeEnv.GITHUB_CLIENT_ID,
          GITHUB_CLIENT_SECRET: runtimeEnv.GITHUB_CLIENT_SECRET,
          BETTER_AUTH_SECRET: runtimeEnv.BETTER_AUTH_SECRET,
          BETTER_AUTH_URL: runtimeEnv.BETTER_AUTH_URL,
          RESEND_API_KEY: runtimeEnv.RESEND_API_KEY,
        },
        requestOrigin: context.url.origin,
      });

      const session = await auth.api.getSession({
        headers: context.request.headers,
      });

      if (session?.user) {
        const sessionUser = session.user as SessionUser;
        userData = {
          email: normalizeEmail(sessionUser.email),
          name: sessionUser.name ?? "",
          role: sessionUser.role ?? "student",
        };

        // Cache session in KV (fire-and-forget, 5-min TTL)
        if (kvCache) {
          kvCache.put(sessionToken, JSON.stringify(userData), { expirationTtl: 300 }).catch((e: unknown) => console.error('[middleware] KV cache write failed:', e));
        }
      }
    }

    // No session → 401 JSON for API routes, redirect for pages
    if (!userData) {
      if (isPortalApi) return jsonError(401, "unauthorized");
      const loginUrl = isPortalPage
        ? `/portal/login?redirect=${encodeURIComponent(pathname)}`
        : `/auth/login?redirect=${encodeURIComponent(pathname)}`;
      return context.redirect(loginUrl);
    }

    // Sanity whitelist check for portal routes (role escalation for existing users)
    if (isPortal && userData.role !== "sponsor") {
      const isSponsor = await checkSponsorWhitelist(userData.email);
      if (isSponsor) {
        userData.role = "sponsor";
        // Persist escalated role to KV cache (fire-and-forget)
        if (kvCache && sessionToken) {
          kvCache.put(sessionToken, JSON.stringify(userData), { expirationTtl: 300 }).catch((e: unknown) => console.error('[middleware] KV cache write failed:', e));
        }
        // Persist escalated role to D1 so future sessions don't re-query Sanity (fire-and-forget)
        if (runtimeEnv?.PORTAL_DB) {
          runtimeEnv.PORTAL_DB.prepare('UPDATE user SET role = ? WHERE LOWER(email) = ?')
            .bind('sponsor', userData.email)
            .run()
            .catch((e: unknown) => console.error('[middleware] D1 role update failed:', e));
        }
      } else {
        // Non-sponsor on portal: 403 JSON for API, denied-page redirect for pages
        if (kvCache && sessionToken) {
          kvCache.delete(sessionToken).catch((e: unknown) => console.error('[middleware] KV cache delete failed:', e));
        }
        if (isPortalApi) return jsonError(403, "forbidden");
        return new Response(null, {
          status: 302,
          headers: {
            Location: '/portal/denied',
            'Set-Cookie': 'better-auth.session_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
          },
        });
      }
    }

    // Role-based authorization
    if (isStudent && userData.role !== "student") {
      return new Response("Forbidden", { status: 403 });
    }

    // Sponsor Agreement gate — sponsors must accept the CMS agreement once before using the portal.
    // The accept endpoint itself must remain reachable so the modal can submit acceptance.
    const skipsAgreementPath =
      PORTAL_PUBLIC_PATHS.has(cleanPath) || cleanPath === AGREEMENT_ACCEPT_PATH;
    if (userData.role === "sponsor" && !skipsAgreementPath) {
      let agreementAcceptedAt = userData.agreementAcceptedAt ?? null;
      if (userData.agreementAcceptedAt === undefined && runtimeEnv?.PORTAL_DB) {
        try {
          const row = await runtimeEnv.PORTAL_DB
            .prepare("SELECT agreement_accepted_at FROM user WHERE LOWER(email) = ?")
            .bind(userData.email)
            .first<{ agreement_accepted_at: number | null }>();
          agreementAcceptedAt = row?.agreement_accepted_at ?? null;
          userData.agreementAcceptedAt = agreementAcceptedAt;
          if (kvCache && sessionToken) {
            kvCache
              .put(sessionToken, JSON.stringify(userData), { expirationTtl: 300 })
              .catch((e: unknown) => console.error("[middleware] KV cache write failed:", e));
          }
        } catch (e) {
          // Fail closed: keep agreementAcceptedAt = null so requiresAgreement stays true.
          // A D1 outage blocks portal access rather than letting unaccepted sponsors through.
          console.error("[middleware] agreement lookup failed, failing closed:", e);
          agreementAcceptedAt = null;
        }
      }
      context.locals.requiresAgreement = agreementAcceptedAt === null;
    } else {
      context.locals.requiresAgreement = false;
    }

    context.locals.user = { email: userData.email, name: userData.name, role: userData.role as 'sponsor' | 'student' };
    return next();
  } catch (error) {
    console.error("[middleware] Auth error:", error);
    return new Response("Service Unavailable", { status: 503 });
  }
});

/** Extract Better Auth session token from Cookie header.
 *  Handles both standard and __Secure- prefixed cookie names
 *  (the latter is used when `advanced.useSecureCookies` is enabled). */
export function extractSessionToken(cookie: string | null): string | null {
  if (!cookie) return null;
  const match = cookie.match(/(?:__Secure-)?better-auth\.session_token=([^;]+)/);
  return match?.[1] ?? null;
}

/** Lowercase a user email so D1 lookups and KV cache keys are case-insensitive. */
export function normalizeEmail(email: string): string {
  return email.toLowerCase();
}
