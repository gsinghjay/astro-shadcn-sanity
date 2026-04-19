import type { APIRoute } from 'astro';
import { extractSessionToken } from '@/middleware';

export const prerender = false;

const json = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export const POST: APIRoute = async ({ request, locals, url }) => {
  // Same-origin CSRF check — mirrors Better Auth's pattern for state-changing endpoints
  const origin = request.headers.get('origin');
  if (!origin || origin !== url.origin) {
    return json({ error: 'forbidden_origin' }, 403);
  }

  const user = locals.user;
  if (!user) return json({ error: 'unauthorized' }, 401);
  if (user.role !== 'sponsor') return json({ error: 'forbidden' }, 403);

  const env = locals.runtime?.env;
  if (!env?.PORTAL_DB) return json({ error: 'service_unavailable' }, 503);

  const acceptedAt = Date.now();
  const result = await env.PORTAL_DB
    .prepare('UPDATE user SET agreement_accepted_at = ? WHERE email = ? AND agreement_accepted_at IS NULL')
    .bind(acceptedAt, user.email)
    .run();

  if (!result.meta?.changes) {
    return json({ error: 'already_accepted' }, 409);
  }

  // Invalidate KV session cache so the next request reflects acceptance
  const sessionToken = extractSessionToken(request.headers.get('cookie'));
  if (sessionToken && env.SESSION_CACHE) {
    await env.SESSION_CACHE.delete(sessionToken).catch((e: unknown) =>
      console.error('[agreement/accept] KV delete failed:', e),
    );
  }

  return json({ acceptedAt }, 200);
};

export const ALL: APIRoute = () =>
  new Response('Method Not Allowed', {
    status: 405,
    headers: { allow: 'POST', 'content-type': 'text/plain' },
  });
