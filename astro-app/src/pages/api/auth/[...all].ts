/**
 * Better Auth catch-all API route.
 * Handles all /api/auth/* requests (sign-in, callback, session, sign-out).
 * This route must be SSR (not prerendered) since it handles OAuth callbacks.
 */
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getDrizzle } from '@/lib/db';
import { createAuth } from '@/lib/auth-config';
import { log } from '@/lib/log';
import { extractSessionToken, hashToken } from '@/middleware';

export const prerender = false;

const handleAuth: APIRoute = async ({ request, locals, url }) => {
  // Story 24.3: invalidate the SESSION_CACHE entry on sign-out so a leaked KV read
  // can't keep authenticating a token whose cookie has just been cleared. Capture
  // the cookie BEFORE auth.handler runs (the response strips it on success).
  const isSignOut =
    request.method === 'POST' && url.pathname.endsWith('/sign-out');
  const sessionToken = isSignOut
    ? extractSessionToken(request.headers.get('cookie'))
    : null;

  try {
    const db = getDrizzle();
    const auth = createAuth({ db });
    const response = await auth.handler(request);

    // Only invalidate the KV entry when Better Auth actually accepted the sign-out.
    // Otherwise an attacker who has the cookie can hit /api/auth/sign-out with a
    // malformed body to force cache eviction on demand (D1 read amplification).
    if (isSignOut && response.status < 400 && sessionToken && env?.SESSION_CACHE) {
      const cfContext = locals.cfContext;
      const kvCache = env.SESSION_CACHE;
      const deletePromise = (async () => {
        try {
          const hashedKey = await hashToken(sessionToken);
          await kvCache.delete(hashedKey);
        } catch (e) {
          log.error('auth-signout-kv-delete-failed', e);
        }
      })();
      // Prefer waitUntil so KV latency doesn't block the redirect response.
      // If cfContext isn't attached (e.g., dev runtime), fall through and
      // rely on the awaited promise above to run before the request settles.
      if (cfContext?.waitUntil) {
        cfContext.waitUntil(deletePromise);
      } else {
        await deletePromise;
      }
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown auth error';
    const isEnvError = message.includes('Missing required') || message.includes('binding not available');
    const status = isEnvError ? 500 : 503;

    log.error('auth-handler-failed', error, { isEnvError });

    return new Response(JSON.stringify({ error: isEnvError ? 'Auth configuration error' : 'Auth service unavailable' }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const GET = handleAuth;
export const POST = handleAuth;
