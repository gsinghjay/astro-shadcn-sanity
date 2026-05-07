import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import {
  AGENT_CONTENT_SIGNAL,
  buildLinkHeader,
  estimateTokens,
  getMarkdownTwin,
  hasMarkdownTwin,
  parseAcceptHeader,
} from "@/lib/agent-discovery";
import { log } from "@/lib/log";

/** Rate limiting configuration */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 100;

/** Paths under /portal/* that skip auth checks (matched after trailing-slash normalization) */
const PORTAL_PUBLIC_PATHS = new Set(["/portal/login", "/portal/denied"]);

/** Astro Action endpoint for accepting the sponsor agreement.
 *  Classified as portal so the auth flow runs (otherwise `ctx.locals.user` is unset),
 *  AND skipped from the agreement gate so a not-yet-accepted sponsor can submit. */
const ACCEPT_AGREEMENT_ACTION_PATH = "/_actions/acceptAgreement";

const jsonError = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), {
    status,
    headers: { "content-type": "application/json" },
  });

/** Shape stored in SESSION_CACHE. `expiresAt` (epoch ms) is required and checked on every read —
 *  see Story 24.3. `undefined` on the agreement fields means the cache predates that field and we
 *  should re-query D1 (mirrors the original `agreementAcceptedAt === undefined` fallback). */
type CachedSession = {
  email: string;
  name: string;
  role: string;
  expiresAt: number;
  agreementAcceptedAt?: number | null;
  agreementVersion?: string | null;
};

/** Hash a session token for KV-cache key derivation. SHA-256 → lowercase hex (64 chars).
 *  KV reads/writes never use the raw bearer cookie — see Story 24.3 (audit H-2). */
export async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** KV's minimum expirationTtl is 60 seconds; the freshness window caps at 5 minutes. */
const KV_TTL_MIN_SECONDS = 60;
const SESSION_CACHE_FRESHNESS_MS = 5 * 60 * 1000;

/** Module-scope cache of the current Sanity sponsor-agreement `_rev`. Persists across requests
 *  within a Worker isolate (CF reuses isolates aggressively), so cache hit rate is very high.
 *  Cold-start penalty is one Sanity API call per isolate, ~50ms. 5-min worst-case lag between
 *  agreement publish and re-prompt — acceptable for a doc that changes ~1×/year. */
let _agreementRevCache: { rev: string | null; expiresAt: number } | null = null;
const AGREEMENT_REV_TTL_MS = 5 * 60 * 1000;

async function getCurrentAgreementRev(): Promise<string | null> {
  const now = Date.now();
  if (_agreementRevCache && _agreementRevCache.expiresAt > now) {
    return _agreementRevCache.rev;
  }
  try {
    const { getSponsorAgreementRev } = await import("@/lib/sanity");
    const rev = await getSponsorAgreementRev();
    _agreementRevCache = { rev, expiresAt: now + AGREEMENT_REV_TTL_MS };
    return rev;
  } catch (err) {
    log.warn("middleware-agreement-rev-fetch-failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/** Test-only: reset the module-scope rev cache. */
export function _resetAgreementRevCache(): void {
  _agreementRevCache = null;
}

/** Better Auth session user shape including custom additionalFields */
interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  // Adapter v13 attaches the Workers ExecutionContext as `locals.cfContext`.
  // Calling `cfContext.waitUntil(...)` keeps the isolate alive past response so
  // fire-and-forget side effects (KV cache writes, D1 background updates) are
  // not silently dropped on isolate eviction. NEVER destructure waitUntil — it
  // loses its `this` binding and throws "Illegal invocation" at runtime.
  const cfContext = context.locals.cfContext;
  // Admin endpoints under /api/portal/admin/* authenticate via the Studio user's
  // Sanity session JWT (cross-origin Studio caller, no portal session cookie).
  // Skip the portal session gate so the route handler can run its own
  // identity introspection + origin check + CORS emission.
  const isPortalAdminApi = pathname.startsWith("/api/portal/admin/");
  const isPortalApi = pathname.startsWith("/api/portal/") && !isPortalAdminApi;
  const isPortalPage = pathname.startsWith("/portal/") || pathname === "/portal";
  // The acceptAgreement Action endpoint runs through the portal auth flow so its handler
  // sees `ctx.locals.user`; the agreement gate then skips this same path so the not-yet-accepted
  // sponsor can actually submit. Other Astro Actions (e.g. submitForm on public pages) are NOT
  // portal-routed — they remain unauthenticated by design.
  const isAcceptAgreementAction = pathname === ACCEPT_AGREEMENT_ACTION_PATH;
  const isPortal = isPortalPage || isPortalApi || isAcceptAgreementAction;
  const isStudent = pathname.startsWith("/student/") || pathname === "/student";

  // Branch 1: Public routes (and admin API) — zero auth overhead.
  // Layer in agent discovery: RFC 8288 Link headers on HTML responses, plus
  // `Accept: text/markdown` content negotiation against the static `.md` twins.
  if (!isPortal && !isStudent) {
    return decorateForAgents(context, next);
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

  // Rate limiting — per-IP sliding window via Durable Object (fail-open)
  const rateLimiter = env.RATE_LIMITER;
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
      log.error("middleware-rate-limiter-failed-open", e);
      // Continue to auth — don't block legitimate users
    }
  }

  // Unified session check — one path for both sponsors and students
  try {
    const kvCache = env?.SESSION_CACHE;
    const sessionToken = extractSessionToken(context.request.headers.get("cookie"));

    let userData: CachedSession | null = null;
    // Cache the hashed key per request so we don't re-derive SHA-256 on each KV op.
    const hashedSessionKey = sessionToken ? await hashToken(sessionToken) : null;
    // When upstream session.expiresAt is unparseable we synthesize a fallback so this request's
    // in-memory auth flow proceeds, but writing that synthetic value to KV would persist a forged
    // expiry into later requests' caches (whitelist re-cache, agreement re-cache). Default true so
    // the KV-cached path keeps working; the new-session branch overrides to Number.isFinite(parsed).
    let kvCacheable = true;

    // KV cache check — skip D1 if session is cached. Stale entries (expiresAt elapsed) are
    // dropped fire-and-forget; the request falls through to the D1 path either way.
    if (kvCache && hashedSessionKey) {
      const cached = await kvCache.get<CachedSession>(hashedSessionKey, { type: "json" });
      if (cached && Date.now() < cached.expiresAt) {
        userData = cached;
      } else if (cached) {
        cfContext?.waitUntil(
          kvCache
            .delete(hashedSessionKey)
            .catch((e: unknown) => log.error('middleware-kv-stale-delete-failed', e)),
        );
      }
    }

    // D1 fallback via Better Auth
    if (!userData && sessionToken) {
      const db = getDrizzle();
      const auth = createAuth({ db });

      const session = await auth.api.getSession({
        headers: context.request.headers,
      });

      if (session?.user) {
        const sessionUser = session.user as SessionUser;
        // Better Auth returns session.expiresAt as a Date in some versions, an epoch number in
        // others — handle both. Cap the cache lifetime at min(now+5min, sessionExpiry) so a
        // cached entry never outlives the underlying Better Auth session.
        const sessionExpiryRaw = session.session?.expiresAt as Date | number | string | undefined;
        const parsed =
          sessionExpiryRaw instanceof Date
            ? sessionExpiryRaw.getTime()
            : typeof sessionExpiryRaw === 'string'
              ? Date.parse(sessionExpiryRaw)
              : typeof sessionExpiryRaw === 'number'
                ? sessionExpiryRaw
                : NaN;
        // Fall back to the freshness window when the adapter returns an unexpected
        // shape — never poison the cache with NaN (Math.min(_, NaN) is NaN, which
        // would write expirationTtl: NaN and reject the KV put).
        const sessionExpiryMs = Number.isFinite(parsed)
          ? parsed
          : Date.now() + SESSION_CACHE_FRESHNESS_MS;
        // Distinguish "field absent" (legacy fallback — write KV with freshness window) from
        // "field present but unparseable" (garbage like 'not-a-date' — never persist). The
        // narrower gate preserves the documented synthetic-expiry fallback for sessions whose
        // adapter omits expiresAt while still preventing forged values from poisoning later
        // requests' caches via whitelist + agreement re-cache code paths.
        kvCacheable = sessionExpiryRaw === undefined || Number.isFinite(parsed);
        const cacheExpiresAt = Math.min(Date.now() + SESSION_CACHE_FRESHNESS_MS, sessionExpiryMs);
        userData = {
          email: normalizeEmail(sessionUser.email),
          name: sessionUser.name ?? "",
          role: sessionUser.role ?? "student",
          expiresAt: cacheExpiresAt,
        };

        // Cache session in KV (fire-and-forget). KV expirationTtl floors at 60s.
        // Skip when kvCacheable is false (synthetic expiry) so a forged expiresAt never persists.
        if (kvCacheable && kvCache && hashedSessionKey) {
          const ttlSeconds = Math.max(
            KV_TTL_MIN_SECONDS,
            Math.floor((cacheExpiresAt - Date.now()) / 1000),
          );
          cfContext?.waitUntil(
            kvCache
              .put(hashedSessionKey, JSON.stringify(userData), { expirationTtl: ttlSeconds })
              .catch((e: unknown) => log.error('middleware-kv-write-failed', e)),
          );
        } else if (!kvCacheable) {
          log.warn('middleware-kv-write-skipped-unparseable-expiry');
        }
      }
    }

    // No session → 401 JSON for API routes, redirect for pages
    if (!userData) {
      // JSON response for fetch-based callers (portal API + acceptAgreement Action endpoint).
      // Astro Actions invoke handlers via fetch and expect a structured response — a 302 to
      // /auth/login would be opaque to the React client.
      if (isPortalApi || isAcceptAgreementAction) return jsonError(401, "unauthorized");
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
        // Persist escalated role to KV cache (fire-and-forget). Reuse the original expiresAt so
        // role escalation cannot extend the cache lifetime past the session window. Skip when
        // kvCacheable is false (synthetic expiry from unparseable upstream session.expiresAt).
        if (kvCacheable && kvCache && hashedSessionKey) {
          const ttlSeconds = Math.max(
            KV_TTL_MIN_SECONDS,
            Math.floor((userData.expiresAt - Date.now()) / 1000),
          );
          cfContext?.waitUntil(
            kvCache
              .put(hashedSessionKey, JSON.stringify(userData), { expirationTtl: ttlSeconds })
              .catch((e: unknown) => log.error('middleware-kv-write-failed', e)),
          );
        }
        // Persist escalated role to D1 so future sessions don't re-query Sanity (fire-and-forget)
        if (env?.PORTAL_DB) {
          cfContext?.waitUntil(
            env.PORTAL_DB.prepare('UPDATE user SET role = ? WHERE LOWER(email) = ?')
              .bind('sponsor', userData.email)
              .run()
              .catch((e: unknown) => log.error('middleware-d1-role-update-failed', e)),
          );
        }
      } else {
        // Non-sponsor on portal: 403 JSON for API, denied-page redirect for pages
        if (kvCache && hashedSessionKey) {
          cfContext?.waitUntil(
            kvCache
              .delete(hashedSessionKey)
              .catch((e: unknown) => log.error('middleware-kv-delete-failed', e)),
          );
        }
        if (isPortalApi || isAcceptAgreementAction) return jsonError(403, "forbidden");
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
    // The acceptAgreement Action endpoint must remain reachable so the modal can submit acceptance.
    const skipsAgreementPath =
      PORTAL_PUBLIC_PATHS.has(cleanPath) || cleanPath === ACCEPT_AGREEMENT_ACTION_PATH;
    if (userData.role === "sponsor" && !skipsAgreementPath) {
      let agreementAcceptedAt = userData.agreementAcceptedAt ?? null;
      let agreementVersion = userData.agreementVersion ?? null;
      const cacheMissesAcceptance = userData.agreementAcceptedAt === undefined;
      const cacheMissesVersion = userData.agreementVersion === undefined;
      if ((cacheMissesAcceptance || cacheMissesVersion) && env?.PORTAL_DB) {
        try {
          const row = await env.PORTAL_DB
            .prepare(
              "SELECT agreement_accepted_at, agreement_version FROM user WHERE LOWER(email) = ?",
            )
            .bind(userData.email)
            .first<{ agreement_accepted_at: number | null; agreement_version: string | null }>();
          agreementAcceptedAt = row?.agreement_accepted_at ?? null;
          agreementVersion = row?.agreement_version ?? null;
          userData.agreementAcceptedAt = agreementAcceptedAt;
          userData.agreementVersion = agreementVersion;
          // Skip the re-cache when kvCacheable is false (synthetic expiry).
          if (kvCacheable && kvCache && hashedSessionKey) {
            const ttlSeconds = Math.max(
              KV_TTL_MIN_SECONDS,
              Math.floor((userData.expiresAt - Date.now()) / 1000),
            );
            cfContext?.waitUntil(
              kvCache
                .put(hashedSessionKey, JSON.stringify(userData), { expirationTtl: ttlSeconds })
                .catch((e: unknown) => log.error("middleware-kv-write-failed", e)),
            );
          }
        } catch (e) {
          // Fail closed: keep agreementAcceptedAt = null so requiresAgreement stays true.
          // A D1 outage blocks portal access rather than letting unaccepted sponsors through.
          log.error("middleware-agreement-lookup-failed-closed", e);
          agreementAcceptedAt = null;
          agreementVersion = null;
        }
      }
      // Re-prompt when never accepted, OR when accepted against a different/null rev than the
      // current Sanity revision. Rev fetch failure returns null (fail-open) — paired with a
      // non-null version this short-circuits to "no prompt" so a Sanity outage doesn't lock
      // sponsors out. Grandfathered rows (acceptedAt != null, version == null) re-prompt once
      // because currentRev is non-null after first successful fetch.
      const currentRev = await getCurrentAgreementRev();
      const versionDrift = currentRev !== null && agreementVersion !== currentRev;
      context.locals.requiresAgreement = agreementAcceptedAt === null || versionDrift;
    } else {
      context.locals.requiresAgreement = false;
    }

    context.locals.user = { email: userData.email, name: userData.name, role: userData.role as 'sponsor' | 'student' };
    return next();
  } catch (error) {
    log.error("middleware-auth-error", error);
    return new Response("Service Unavailable", { status: 503 });
  }
});

/** Public-route handler that adds RFC 8288 `Link` headers to HTML responses
 *  and content-negotiates `Accept: text/markdown` against the static `.md`
 *  twin corpus emitted by `astro-llms-md` (Story 5.19). Pure layering on top
 *  of `next()` — no auth or rate-limiting concerns intrude here. */
export async function decorateForAgents(
  context: { url: URL; request: Request },
  next: () => Promise<Response>,
): Promise<Response> {
  const { pathname } = context.url;

  // Step 1: Markdown content negotiation. Only attempt for paths that have a
  // twin in the corpus — excluded paths fall through to HTML. Direct `.md`
  // requests are served as static assets by the runtime; we don't intercept.
  const accept = context.request.headers.get("accept");
  const { prefersMarkdown } = parseAcceptHeader(accept);
  if (prefersMarkdown && hasMarkdownTwin(pathname) && !pathname.endsWith(".md")) {
    const assets = (env as { ASSETS?: { fetch: (input: URL | string | Request) => Promise<Response> } }).ASSETS;
    if (assets) {
      const twin = await getMarkdownTwin(pathname, assets, context.url.origin);
      // Range requests come back as 206 with Content-Range; rewriting to 200
      // would strip partial-content semantics. Fall through so the adapter
      // serves the asset natively in that case.
      if (twin && twin.status === 200) {
        const body = await twin.text();
        const headers = new Headers();
        headers.set("content-type", "text/markdown; charset=utf-8");
        headers.set("vary", "Accept");
        headers.set("link", buildLinkHeader(pathname, true));
        headers.set("x-markdown-tokens", String(estimateTokens(body)));
        headers.set("content-signal", AGENT_CONTENT_SIGNAL);
        // Mirror upstream cache-control if the static asset declared one
        // (parity with HTML response per AC). Default to no override.
        const upstreamCacheControl = twin.headers.get("cache-control");
        if (upstreamCacheControl) headers.set("cache-control", upstreamCacheControl);
        return new Response(body, { status: twin.status, headers });
      }
    }
    // Asset fetch failed or twin missing — fall through to HTML below.
  }

  const response = await next();
  const contentType = response.headers.get("content-type") ?? "";

  // Step 2: Link + Vary headers on HTML responses only. Non-HTML responses
  // (`/llms.txt`, `/sitemap-index.xml`, `/api/*` JSON, asset bytes) skip this
  // — they own their own content-type contract.
  if (contentType.includes("text/html")) {
    response.headers.set("link", buildLinkHeader(pathname, hasMarkdownTwin(pathname)));
    // Vary: Accept is required so caches don't return HTML to a markdown-prefering
    // agent (or vice-versa) once a path has two representations.
    const existingVary = response.headers.get("vary");
    if (!existingVary) {
      response.headers.set("vary", "Accept");
    } else if (!/\baccept\b/i.test(existingVary)) {
      response.headers.set("vary", `${existingVary}, Accept`);
    }
  }

  return response;
}

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
