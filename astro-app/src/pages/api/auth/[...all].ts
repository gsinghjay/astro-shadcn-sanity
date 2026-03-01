/**
 * Better Auth catch-all API route.
 * Spike 16.1 — handles all /api/auth/* requests (sign-in, callback, session, sign-out).
 *
 * This route must be SSR (not prerendered) since it handles OAuth callbacks.
 */
import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/student-auth';

export const prerender = false;

const handleAuth: APIRoute = async ({ locals, request }) => {
  const env = locals.runtime.env;
  const auth = createAuth({
    PORTAL_DB: env.PORTAL_DB,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL,
  });
  return auth.handler(request);
};

export const GET = handleAuth;
export const POST = handleAuth;
