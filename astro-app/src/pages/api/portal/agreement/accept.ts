import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { extractSessionToken, normalizeEmail } from '@/middleware';

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

export const POST: APIRoute = async ({ request, locals, url }) => {  // eslint-disable-line @typescript-eslint/no-unused-vars
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

  // Read existing acceptance state first so we can distinguish three outcomes:
  //   row missing      → 404 user_not_found
  //   already accepted → 409 already_accepted
  //   accepted now     → 200
  const existing = await env.PORTAL_DB
    .prepare('SELECT agreement_accepted_at FROM user WHERE LOWER(email) = ?')
    .bind(email)
    .first<{ agreement_accepted_at: number | null }>();

  if (!existing) return json({ error: 'user_not_found' }, 404);
  if (existing.agreement_accepted_at != null) {
    return json({ error: 'already_accepted' }, 409);
  }

  await env.PORTAL_DB
    .prepare('UPDATE user SET agreement_accepted_at = ? WHERE LOWER(email) = ?')
    .bind(acceptedAt, email)
    .run();

  // Refresh KV session cache with the new acceptance timestamp. Writing rather than deleting
  // means a propagation delay or write failure leaves a stale-but-still-correct entry, never a
  // stale "unaccepted" entry that re-prompts the modal.
  const sessionToken = extractSessionToken(request.headers.get('cookie'));
  if (sessionToken && env.SESSION_CACHE) {
    try {
      const cached = await env.SESSION_CACHE.get<{
        email: string;
        name: string;
        role: string;
        agreementAcceptedAt?: number | null;
      }>(sessionToken, { type: 'json' });
      if (cached) {
        await env.SESSION_CACHE.put(
          sessionToken,
          JSON.stringify({ ...cached, agreementAcceptedAt: acceptedAt }),
          { expirationTtl: 300 },
        );
      } else {
        await env.SESSION_CACHE.delete(sessionToken);
      }
    } catch (e) {
      console.error('[agreement/accept] KV refresh failed:', e);
      // Fall through — the D1 write succeeded, the modal will re-prompt up to 5 min until
      // KV TTL expires. Log so ops can correlate user reports.
    }
  }

  return json({ acceptedAt }, 200);
};

export const ALL: APIRoute = () =>
  new Response('Method Not Allowed', {
    status: 405,
    headers: { allow: 'POST', 'content-type': 'text/plain' },
  });
