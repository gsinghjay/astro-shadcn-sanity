import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { getSponsorAgreementRev } from '@/lib/sanity';

export const prerender = false;

const ALLOW_HEADERS = 'authorization, content-type';
const ALLOW_METHODS = 'GET, OPTIONS';

interface AcceptanceRow {
  email: string;
  name: string;
  role: string;
  agreement_accepted_at: number | null;
  agreement_version: string | null;
}

interface AdminEnv {
  PORTAL_DB?: D1Database;
  STUDIO_ADMIN_TOKEN?: string;
  STUDIO_ORIGIN?: string;
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

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

function json(body: Record<string, unknown>, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
  });
}

export const OPTIONS: APIRoute = ({ request }) => {
  const env = (workerEnv ?? {}) as AdminEnv;
  // Fail-closed when env is missing so misconfiguration is observable rather than masked as CORS.
  if (!env.STUDIO_ORIGIN) {
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

  if (!env.STUDIO_ADMIN_TOKEN || !env.STUDIO_ORIGIN || !env.PORTAL_DB) {
    return json({ error: 'service_unavailable' }, 503, errorCors);
  }

  if (origin !== env.STUDIO_ORIGIN) {
    return json({ error: 'forbidden_origin' }, 403);
  }

  const auth = request.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || !constantTimeEqual(token, env.STUDIO_ADMIN_TOKEN)) {
    return json({ error: 'unauthorized' }, 401, errorCors);
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
