import { defineMiddleware } from "astro:middleware";
import { getDrizzle } from "@/lib/db";
import { createAuth, checkSponsorWhitelist } from "@/lib/auth-config";

/** Rate limiting configuration */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 100;

/** Paths under /portal/* that skip auth checks */
const PORTAL_PUBLIC_PATHS = ["/portal/login", "/portal/denied"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isPortal = pathname.startsWith("/portal");
  const isStudent = pathname.startsWith("/student");

  // Branch 1: Public routes — zero auth overhead
  if (!isPortal && !isStudent) {
    return next();
  }

  // Whitelist login/denied pages from auth check
  if (PORTAL_PUBLIC_PATHS.includes(pathname)) {
    return next();
  }

  // Dev mode bypass — both roles (also skips rate limiting)
  if (import.meta.env.DEV) {
    if (isPortal) {
      context.locals.user = { email: "dev@example.com", name: "Dev Sponsor", role: "sponsor" };
    } else {
      context.locals.user = { email: "dev-student@example.com", name: "Dev Student", role: "student" };
    }
    return next();
  }

  const runtimeEnv = context.locals.runtime?.env;

  // Rate limiting — per-IP sliding window via Durable Object (fail-open)
  const rateLimiter = runtimeEnv?.RATE_LIMITER;
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

    let userData: { email: string; name: string; role: string } | null = null;

    // KV cache check — skip D1 if session is cached
    if (kvCache && sessionToken) {
      const cached = await kvCache.get<{ email: string; name: string; role: string }>(sessionToken, { type: "json" });
      if (cached) {
        userData = cached;
      }
    }

    // D1 fallback via Better Auth
    if (!userData && sessionToken) {
      const db = getDrizzle(context.locals);
      const auth = createAuth({
        db,
        env: {
          GOOGLE_CLIENT_ID: runtimeEnv!.GOOGLE_CLIENT_ID,
          GOOGLE_CLIENT_SECRET: runtimeEnv!.GOOGLE_CLIENT_SECRET,
          GITHUB_CLIENT_ID: runtimeEnv!.GITHUB_CLIENT_ID,
          GITHUB_CLIENT_SECRET: runtimeEnv!.GITHUB_CLIENT_SECRET,
          BETTER_AUTH_SECRET: runtimeEnv!.BETTER_AUTH_SECRET,
          BETTER_AUTH_URL: runtimeEnv!.BETTER_AUTH_URL,
          RESEND_API_KEY: runtimeEnv!.RESEND_API_KEY,
        },
        requestOrigin: context.url.origin,
      });

      const session = await auth.api.getSession({
        headers: context.request.headers,
      });

      if (session?.user) {
        userData = {
          email: session.user.email,
          name: session.user.name ?? "",
          role: (session.user as { role?: string }).role ?? "student",
        };

        // Cache session in KV (fire-and-forget, 5-min TTL)
        if (kvCache) {
          kvCache.put(sessionToken, JSON.stringify(userData), { expirationTtl: 300 }).catch((e) => console.error('[middleware] KV cache write failed:', e));
        }
      }
    }

    // No session → redirect to appropriate login page
    if (!userData) {
      const loginUrl = isPortal
        ? `/portal/login?redirect=${encodeURIComponent(pathname)}`
        : `/auth/login?redirect=${encodeURIComponent(pathname)}`;
      return context.redirect(loginUrl);
    }

    // Sanity whitelist check for portal routes (role escalation for existing users)
    if (isPortal && userData.role !== "sponsor") {
      const isSponsor = await checkSponsorWhitelist(userData.email);
      if (isSponsor) {
        userData.role = "sponsor";
        // Update KV cache with correct role
        if (kvCache && sessionToken) {
          kvCache.put(sessionToken, JSON.stringify(userData), { expirationTtl: 300 }).catch((e) => console.error('[middleware] KV cache write failed:', e));
        }
      } else {
        return context.redirect("/portal/denied");
      }
    }

    // Role-based authorization
    if (isStudent && userData.role !== "student") {
      return new Response("Forbidden", { status: 403 });
    }

    context.locals.user = { email: userData.email, name: userData.name, role: userData.role as 'sponsor' | 'student' };
    return next();
  } catch (error) {
    console.error("[middleware] Auth error:", error);
    return new Response("Service Unavailable", { status: 503 });
  }
});

/** Extract Better Auth session token from Cookie header */
function extractSessionToken(cookie: string | null): string | null {
  if (!cookie) return null;
  const match = cookie.match(/better-auth\.session_token=([^;]+)/);
  return match?.[1] ?? null;
}
