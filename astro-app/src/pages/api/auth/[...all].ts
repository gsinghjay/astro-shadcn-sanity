/**
 * Better Auth catch-all API route.
 * Handles all /api/auth/* requests (sign-in, callback, session, sign-out).
 * This route must be SSR (not prerendered) since it handles OAuth callbacks.
 */
import type { APIRoute } from 'astro';
import { getDrizzle } from '@/lib/db';
import { createAuth } from '@/lib/auth-config';
import { log } from '@/lib/log';

export const prerender = false;

const handleAuth: APIRoute = async ({ request }) => {
  try {
    const db = getDrizzle();
    const auth = createAuth({ db });
    return await auth.handler(request);
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
