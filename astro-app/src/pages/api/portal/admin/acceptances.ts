import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { PUBLIC_SANITY_STUDIO_PROJECT_ID } from 'astro:env/server';
import { getSponsorAgreementRev } from '@/lib/sanity';

export const prerender = false;

const ALLOW_HEADERS = 'authorization, content-type';
const ALLOW_METHODS = 'GET, OPTIONS';
const ADMIN_ROLE_NAME = 'administrator';
const INTROSPECTION_TTL_MS = 60_000;
const INTROSPECTION_CACHE_MAX = 100;
const INTROSPECTION_TIMEOUT_MS = 5_000;
// Sanity session JWTs are well under 1KB; cap inbound bearer length so a
// malicious caller can't force unbounded SHA-256 work via a multi-MB header.
const MAX_BEARER_LENGTH = 4096;

interface AcceptanceRow {
  email: string;
  name: string;
  role: string;
  agreement_accepted_at: number | null;
  agreement_version: string | null;
}

interface AdminEnv {
  PORTAL_DB?: D1Database;
  STUDIO_ORIGIN?: string;
}

interface SanityUserRole {
  name: string;
  title?: string;
}

interface SanityUser {
  id: string;
  email?: string;
  name?: string;
  roles?: SanityUserRole[];
}

interface CacheEntry {
  user: SanityUser;
  expiresAt: number;
}

// Per-isolate LRU cache of introspection results. The raw bearer is never
// stored in the cache; only its SHA-256 digest is keyed. 60s TTL is short
// enough to track Sanity role/account revocation without hammering Sanity on
// every Studio poll. Bounded at 100 entries — admins per isolate will be in
// the single digits.
const introspectionCache = new Map<string, CacheEntry>();

/** Test-only hook so each unit test starts with an empty cache. */
export function _resetIntrospectionCacheForTests(): void {
  introspectionCache.clear();
}

async function hashToken(token: string): Promise<string> {
  const buf = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  const bytes = new Uint8Array(digest);
  let hex = '';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return hex;
}

function readCache(key: string): SanityUser | null {
  const entry = introspectionCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    introspectionCache.delete(key);
    return null;
  }
  // Refresh LRU position so the most-recent hit is evicted last.
  introspectionCache.delete(key);
  introspectionCache.set(key, entry);
  return entry.user;
}

function writeCache(key: string, user: SanityUser): void {
  if (introspectionCache.size >= INTROSPECTION_CACHE_MAX) {
    const oldest = introspectionCache.keys().next().value;
    if (oldest !== undefined) introspectionCache.delete(oldest);
  }
  introspectionCache.set(key, { user, expiresAt: Date.now() + INTROSPECTION_TTL_MS });
}

/**
 * Resolve the Sanity user who owns the given session bearer. Uses Sanity's
 * project-scoped `/v1/users/me` endpoint — which authenticates the bearer and
 * returns the user profile + roles. Returns null on any failure (network,
 * non-2xx, malformed body) so the caller can map it to a single 401.
 */
async function getStudioUser(token: string, projectId: string): Promise<SanityUser | null> {
  try {
    const res = await fetch(`https://${projectId}.api.sanity.io/v1/users/me`, {
      headers: { authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(INTROSPECTION_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as SanityUser;
    if (!body || typeof body !== 'object' || typeof body.id !== 'string') return null;
    // Reject any response shape where `roles` is present but not an array — a
    // malformed Sanity payload (e.g. `roles: "administrator"` string, or an
    // object) would otherwise silently fail isAdmin() and 403 a legit admin.
    // `undefined` is allowed (guest user / partial body) and falls through to
    // a clean 403 via isAdmin() returning false.
    if (body.roles !== undefined && !Array.isArray(body.roles)) return null;
    return body;
  } catch (err) {
    console.error('[admin/acceptances] sanity introspection failed:', err);
    return null;
  }
}

function isAdmin(user: SanityUser): boolean {
  return Array.isArray(user.roles) && user.roles.some((r) => r?.name === ADMIN_ROLE_NAME);
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': ALLOW_METHODS,
    'Access-Control-Allow-Headers': ALLOW_HEADERS,
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
}

function json(body: Record<string, unknown>, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
  });
}

export const OPTIONS: APIRoute = ({ request }) => {
  const env = (workerEnv ?? {}) as AdminEnv;
  // Fail-closed when any env required by the GET handler is missing. Mirroring
  // the GET check here avoids a window where a cacheable 204 preflight masks a
  // misconfiguration that 503s every real request.
  if (!env.STUDIO_ORIGIN || !env.PORTAL_DB || !PUBLIC_SANITY_STUDIO_PROJECT_ID) {
    return new Response(null, { status: 503 });
  }
  const origin = request.headers.get('origin');
  if (origin !== env.STUDIO_ORIGIN) {
    return new Response(null, { status: 403 });
  }
  return new Response(null, { status: 204, headers: corsHeaders(env.STUDIO_ORIGIN) });
};

export const GET: APIRoute = async ({ request, url }) => {
  const env = (workerEnv ?? {}) as AdminEnv;
  const origin = request.headers.get('origin');
  // Echo CORS on error responses when origin matches, so the Studio caller can read the body
  // (browsers block cross-origin reads without Access-Control-Allow-Origin).
  const errorCors =
    env.STUDIO_ORIGIN && origin === env.STUDIO_ORIGIN ? corsHeaders(env.STUDIO_ORIGIN) : {};

  if (!env.STUDIO_ORIGIN || !env.PORTAL_DB || !PUBLIC_SANITY_STUDIO_PROJECT_ID) {
    return json({ error: 'service_unavailable' }, 503, errorCors);
  }

  if (origin !== env.STUDIO_ORIGIN) {
    return json({ error: 'forbidden_origin' }, 403);
  }

  const auth = request.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token || token.length > MAX_BEARER_LENGTH) {
    return json({ error: 'unauthorized' }, 401, errorCors);
  }

  // Introspect the Studio session bearer. Cache lookups key on SHA-256(token)
  // — the raw bearer is never persisted past the hash call.
  const cacheKey = await hashToken(token);
  let user = readCache(cacheKey);
  if (!user) {
    user = await getStudioUser(token, PUBLIC_SANITY_STUDIO_PROJECT_ID);
    if (!user) return json({ error: 'unauthorized' }, 401, errorCors);
    writeCache(cacheKey, user);
  }
  if (!isAdmin(user)) {
    return json({ error: 'forbidden' }, 403, errorCors);
  }

  const filter = url.searchParams.get('accepted'); // true | false | all | null
  const versionDrift = url.searchParams.get('versionDrift') === 'true';

  // Fetch current Sanity rev once per request — needed for both the SQL bind (when versionDrift
  // filter is requested) and the per-row `versionMatch` derivation. Null on Sanity error → drift
  // detection cannot happen; report `versionMatch: null` for rows so admins see "unknown" rather
  // than a misleading "match" / "drift".
  const currentRev = await getSponsorAgreementRev();

  let where = "role = 'sponsor'";
  if (filter === 'true') where += ' AND agreement_accepted_at IS NOT NULL';
  else if (filter === 'false') where += ' AND agreement_accepted_at IS NULL';

  // Drift filter requires currentRev. Without it (Sanity error), we can't compute drift in SQL —
  // fall back to "no drift filter applied" rather than returning empty results.
  if (versionDrift && currentRev) {
    where +=
      ' AND agreement_accepted_at IS NOT NULL AND (agreement_version IS NULL OR agreement_version != ?)';
  }

  // `agreement_accepted_at IS NULL` first puts NULLs after non-null when sorted DESC,
  // matching `NULLS LAST` semantics across all SQLite versions (D1 backend may vary).
  const sql =
    `SELECT email, name, role, agreement_accepted_at, agreement_version FROM user WHERE ${where} ` +
    `ORDER BY agreement_accepted_at IS NULL, agreement_accepted_at DESC, email ASC`;

  try {
    const stmt = env.PORTAL_DB.prepare(sql);
    const bound = versionDrift && currentRev ? stmt.bind(currentRev) : stmt;
    const rs = await bound.all<AcceptanceRow>();
    const acceptances = (rs.results ?? []).map((r) => {
      const accepted = r.agreement_accepted_at != null;
      // versionMatch is `null` when there's no acceptance, when Sanity rev fetch failed, or when
      // the row has no pinned version (grandfathered). Only `false` / `true` indicate a real check.
      let versionMatch: boolean | null = null;
      if (accepted && currentRev != null && r.agreement_version != null) {
        versionMatch = r.agreement_version === currentRev;
      }
      return {
        email: r.email,
        name: r.name,
        role: r.role,
        agreementAcceptedAt: r.agreement_accepted_at,
        agreementVersion: r.agreement_version,
        versionMatch,
      };
    });
    return json(
      { acceptances, currentVersion: currentRev, generatedAt: Date.now() },
      200,
      {
        'cache-control': 'private, max-age=0, must-revalidate',
        ...corsHeaders(env.STUDIO_ORIGIN),
      },
    );
  } catch (e) {
    console.error('[admin/acceptances] D1 error:', e);
    return json({ error: 'service_unavailable' }, 503, errorCors);
  }
};

export const ALL: APIRoute = () =>
  new Response('Method Not Allowed', {
    status: 405,
    headers: { allow: ALLOW_METHODS, 'content-type': 'text/plain' },
  });
