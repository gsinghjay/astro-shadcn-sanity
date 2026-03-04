/**
 * Better Auth catch-all API route.
 * Handles all /api/auth/* requests (sign-in, callback, session, sign-out).
 * This route must be SSR (not prerendered) since it handles OAuth callbacks.
 */
import type { APIRoute } from 'astro';
import { getDrizzle } from '@/lib/db';
import { createAuth } from '@/lib/auth-config';

export const prerender = false;

const handleAuth: APIRoute = async ({ locals, request }) => {
  try {
    const env = locals.runtime.env;
    const db = getDrizzle(locals);
    const requestOrigin = new URL(request.url).origin;
    const auth = createAuth({
      db,
      env: {
        GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
        GITHUB_CLIENT_ID: env.GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET: env.GITHUB_CLIENT_SECRET,
        BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
        BETTER_AUTH_URL: env.BETTER_AUTH_URL,
        RESEND_API_KEY: env.RESEND_API_KEY,
      },
      requestOrigin,
    });
    return await auth.handler(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown auth error';
    const isEnvError = message.includes('Missing required') || message.includes('binding not available');
    const status = isEnvError ? 500 : 503;

    console.error(`[auth] ${message}`);

    return new Response(JSON.stringify({ error: isEnvError ? 'Auth configuration error' : 'Auth service unavailable' }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const GET = handleAuth;
export const POST = handleAuth;
