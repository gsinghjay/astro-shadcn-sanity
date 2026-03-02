import { defineMiddleware } from "astro:middleware";
import { validateAccessJWT } from "@/lib/auth";
import { getDrizzle } from "@/lib/db";
import { createAuth } from "@/lib/student-auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isPortal = pathname.startsWith("/portal");
  const isStudent = pathname.startsWith("/student");

  // Branch 1: Public routes — zero auth overhead
  if (!isPortal && !isStudent) {
    return next();
  }

  // Dev mode bypass — both roles (also skips rate limiting)
  if (import.meta.env.DEV) {
    if (isPortal) {
      context.locals.user = { email: "dev@example.com", role: "sponsor" };
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
      const result = await stub.checkLimit(60_000, 100);
      if (!result.allowed) {
        const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000);
        return new Response("Too Many Requests", {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Remaining": "0",
          },
        });
      }
    } catch (e) {
      console.error("[middleware] Rate limiter error, failing open:", e);
      // Continue to auth — don't block legitimate users
    }
  }

  // Branch 2: Portal — CF Access JWT (unchanged logic, add role)
  if (isPortal) {
    const result = await validateAccessJWT(context.request, runtimeEnv);
    if (result) {
      context.locals.user = { email: result.email, role: "sponsor" };
      return next();
    }
    return new Response("Unauthorized", { status: 401 });
  }

  // Branch 3: Student — Better Auth session validation
  try {
    const kvCache = runtimeEnv?.SESSION_CACHE;
    const sessionToken = extractSessionToken(context.request.headers.get("cookie"));

    // KV cache check — skip D1 if session is cached
    if (kvCache && sessionToken) {
      const cached = await kvCache.get<{ email: string; name: string }>(sessionToken, { type: "json" });
      if (cached) {
        context.locals.user = { email: cached.email, name: cached.name, role: "student" };
        return next();
      }
    }

    const db = getDrizzle(context.locals);
    const auth = createAuth({
      db,
      env: {
        GOOGLE_CLIENT_ID: runtimeEnv!.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: runtimeEnv!.GOOGLE_CLIENT_SECRET,
        BETTER_AUTH_SECRET: runtimeEnv!.BETTER_AUTH_SECRET,
        BETTER_AUTH_URL: runtimeEnv!.BETTER_AUTH_URL,
      },
      requestOrigin: context.url.origin,
    });

    const session = await auth.api.getSession({
      headers: context.request.headers,
    });

    if (session) {
      const userData = { email: session.user.email, name: session.user.name };
      context.locals.user = { ...userData, role: "student" };

      // Cache session in KV (fire-and-forget, 5-min TTL)
      if (kvCache && sessionToken) {
        kvCache.put(sessionToken, JSON.stringify(userData), { expirationTtl: 300 }).catch((e) => console.error('[middleware] KV cache write failed:', e));
      }

      return next();
    }

    // No valid session — redirect to login page (outside /student/* to avoid loop)
    // Login page uses auth client to POST to Better Auth's social sign-in endpoint
    return context.redirect("/auth/student-login");
  } catch (error) {
    console.error("[middleware] Student auth error:", error);
    return new Response("Service Unavailable", { status: 503 });
  }
});

/** Extract Better Auth session token from Cookie header */
function extractSessionToken(cookie: string | null): string | null {
  if (!cookie) return null;
  const match = cookie.match(/better-auth\.session_token=([^;]+)/);
  return match?.[1] ?? null;
}
