import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import {
  PUBLIC_SANITY_STUDIO_PROJECT_ID,
  SANITY_PROJECT_READ_TOKEN,
} from 'astro:env/server';
import { getSponsorAgreementRev } from '@/lib/sanity';

export const prerender = false;

const ALLOW_HEADERS = 'content-type, x-sanity-user-id';
const ALLOW_METHODS = 'GET, OPTIONS';
const MEMBERSHIP_TTL_MS = 60_000;
const MEMBERSHIP_CACHE_MAX = 100;
const MEMBERSHIP_TIMEOUT_MS = 5_000;
// Sanity user IDs are short alphanumeric (`p` + 8-9 chars in practice). Cap
// inbound header length so a malicious caller can't stuff multi-MB payloads
// into the membership URL.
const MAX_USER_ID_LENGTH = 64;
const SANITY_API_VERSION = '2024-10-01';

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

interface CacheEntry {
  expiresAt: number;
}

// Per-isolate LRU cache of project-membership lookups. The user ID is not a
// secret (it appears in Sanity API responses, GROQ projections, and audit
// logs) so it's keyed directly without hashing. 60s TTL tracks Sanity
// membership revocation without hammering Sanity on every Studio poll.
const membershipCache = new Map<string, CacheEntry>();

/** Test-only hook so each unit test starts with an empty cache. */
export function _resetMembershipCacheForTests(): void {
  membershipCache.clear();
}

function readCache(userId: string): boolean {
  const entry = membershipCache.get(userId);
  if (!entry) return false;
  if (entry.expiresAt <= Date.now()) {
    membershipCache.delete(userId);
    return false;
  }
  // Refresh LRU position so the most-recent hit is evicted last.
  membershipCache.delete(userId);
  membershipCache.set(userId, entry);
  return true;
}

function writeCache(userId: string): void {
  if (membershipCache.size >= MEMBERSHIP_CACHE_MAX) {
    const oldest = membershipCache.keys().next().value;
    if (oldest !== undefined) membershipCache.delete(oldest);
  }
  membershipCache.set(userId, { expiresAt: Date.now() + MEMBERSHIP_TTL_MS });
}

/**
 * Verify the claimed Sanity user ID is a current member of the configured
 * project. Calls the project-scoped users endpoint with a Worker-only read
 * token; on 200 with a matching `id`, the user is admitted. Any other outcome
 * (404, non-2xx, malformed body, network/timeout) returns false so the caller
 * can map it to a single 403.
 */
async function verifyProjectMembership(
  userId: string,
  projectId: string,
  readToken: string,
): Promise<boolean> {
  if (readCache(userId)) return true;
  try {
    const res = await fetch(
      `https://api.sanity.io/v${SANITY_API_VERSION}/projects/${projectId}/users/${userId}`,
      {
        headers: { authorization: `Bearer ${readToken}` },
        signal: AbortSignal.timeout(MEMBERSHIP_TIMEOUT_MS),
      },
    );
    if (!res.ok) return false;
    const body = (await res.json()) as { id?: unknown };
    if (!body || typeof body !== 'object' || typeof body.id !== 'string') {
      return false;
    }
    if (body.id !== userId) return false;
    writeCache(userId);
    return true;
  } catch (err) {
    console.error('[admin/acceptances] sanity membership lookup failed:', err);
    return false;
  }
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

function envReady(env: AdminEnv): boolean {
  return Boolean(
    env.STUDIO_ORIGIN &&
      env.PORTAL_DB &&
      PUBLIC_SANITY_STUDIO_PROJECT_ID &&
      SANITY_PROJECT_READ_TOKEN,
  );
}

export const OPTIONS: APIRoute = ({ request }) => {
  const env = (workerEnv ?? {}) as AdminEnv;
  // Fail-closed when any env required by the GET handler is missing. Mirroring
  // the GET check here avoids a window where a cacheable 204 preflight masks a
  // misconfiguration that 503s every real request.
  if (!envReady(env)) {
    return new Response(null, { status: 503 });
  }
  const origin = request.headers.get('origin');
  if (origin !== env.STUDIO_ORIGIN) {
    return new Response(null, { status: 403 });
  }
  return new Response(null, { status: 204, headers: corsHeaders(env.STUDIO_ORIGIN!) });
};

export const GET: APIRoute = async ({ request, url }) => {
  const env = (workerEnv ?? {}) as AdminEnv;
  const origin = request.headers.get('origin');
  // Echo CORS on error responses when origin matches, so the Studio caller can read the body
  // (browsers block cross-origin reads without Access-Control-Allow-Origin).
  const errorCors =
    env.STUDIO_ORIGIN && origin === env.STUDIO_ORIGIN ? corsHeaders(env.STUDIO_ORIGIN) : {};

  if (!envReady(env)) {
    return json({ error: 'service_unavailable' }, 503, errorCors);
  }

  if (origin !== env.STUDIO_ORIGIN) {
    return json({ error: 'forbidden_origin' }, 403);
  }

  const userId = (request.headers.get('x-sanity-user-id') ?? '').trim();
  if (!userId || userId.length > MAX_USER_ID_LENGTH) {
    return json({ error: 'unauthorized' }, 401, errorCors);
  }

  const isMember = await verifyProjectMembership(
    userId,
    PUBLIC_SANITY_STUDIO_PROJECT_ID,
    SANITY_PROJECT_READ_TOKEN!,
  );
  if (!isMember) {
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
    const stmt = env.PORTAL_DB!.prepare(sql);
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
        ...corsHeaders(env.STUDIO_ORIGIN!),
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
