import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { extractSessionToken, normalizeEmail } from '@/middleware';
import { getSponsorAgreementRev } from '@/lib/sanity';

export const prerender = false;

const json = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

/** Same-origin check for state-changing endpoints. Falls back to Referer when Origin is absent
 *  (older Safari, some privacy extensions strip Origin on same-origin POSTs). */
function isSameOrigin(request: Request, expectedOrigin: string): boolean {
  const origin = request.headers.get('origin');
  if (origin) return origin === expectedOrigin;
  const referer = request.headers.get('referer');
  if (!referer) return false;
  try {
    return new URL(referer).origin === expectedOrigin;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request, locals, url }) => {
  // `locals` retained for `locals.user` (set by middleware); env now imported from cloudflare:workers.
  if (!isSameOrigin(request, url.origin)) {
    return json({ error: 'forbidden_origin' }, 403);
  }

  const user = locals.user;
  if (!user) return json({ error: 'unauthorized' }, 401);
  if (user.role !== 'sponsor') return json({ error: 'forbidden' }, 403);

  if (!env?.PORTAL_DB) return json({ error: 'service_unavailable' }, 503);

  const email = normalizeEmail(user.email);
  const acceptedAt = Date.now();

  // Read existing acceptance state first. With version pinning, "already accepted" means
  //   "accepted against the CURRENT revision" — drift (NULL version, or stale rev) is a valid
  //   re-acceptance path that the middleware actively re-prompts for.
  //   row missing                                    → 404 user_not_found
  //   accepted AND version matches current Sanity rev → 409 already_accepted
  //   accepted but version differs/null OR not accepted yet → 200 (write fresh acceptance)
  const existing = await env.PORTAL_DB
    .prepare('SELECT agreement_accepted_at, agreement_version FROM user WHERE LOWER(email) = ?')
    .bind(email)
    .first<{ agreement_accepted_at: number | null; agreement_version: string | null }>();

  if (!existing) return json({ error: 'user_not_found' }, 404);

  // Audit fields. `cf-connecting-ip` is Cloudflare-injected and trusted; falsifiable only by the
  // originating client. UA is best-effort. Sanity rev is fail-open: a Sanity outage writes NULL
  // rather than blocking acceptance — the row will trigger version-drift on next request and
  // re-prompt once Sanity is reachable again.
  const ip = request.headers.get('cf-connecting-ip');
  const ua = request.headers.get('user-agent');
  const rev = await getSponsorAgreementRev();

  // 409 only when the user has truly already accepted the current published revision. Without a
  // current rev (Sanity outage) we can't prove drift, so fall back to the old timestamp-only
  // semantics rather than allowing accidental double-accepts.
  if (existing.agreement_accepted_at != null) {
    const upToDate =
      rev === null
        ? true
        : existing.agreement_version != null && existing.agreement_version === rev;
    if (upToDate) return json({ error: 'already_accepted' }, 409);
  }

  await env.PORTAL_DB
    .prepare(
      'UPDATE user SET agreement_accepted_at = ?, agreement_version = ?, agreement_accepted_ip = ?, agreement_accepted_user_agent = ? WHERE LOWER(email) = ?',
    )
    .bind(acceptedAt, rev, ip, ua, email)
    .run();

  // Invalidate the cached session so middleware re-reads D1 on the next request and sees the new
  // acceptance + version. Delete (rather than refresh) avoids smuggling a stale agreementVersion
  // into the cached blob and keeps the gate behavior driven by D1.
  const sessionToken = extractSessionToken(request.headers.get('cookie'));
  if (sessionToken && env.SESSION_CACHE) {
    try {
      await env.SESSION_CACHE.delete(sessionToken);
    } catch (e) {
      console.error('[agreement/accept] KV invalidation failed:', e);
      // Fall through — D1 write succeeded; KV entry will TTL out within 5 min.
    }
  }

  return json({ acceptedAt }, 200);
};

export const ALL: APIRoute = () =>
  new Response('Method Not Allowed', {
    status: 405,
    headers: { allow: 'POST', 'content-type': 'text/plain' },
  });
