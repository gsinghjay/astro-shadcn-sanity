import type { APIRoute } from 'astro';
import { eq, and } from 'drizzle-orm';
import { env } from 'cloudflare:workers';
import { getDrizzle } from '@/lib/db';
import { account, projectGithubRepos, user } from '@/lib/drizzle-schema';

export const prerender = false;

const JSON_HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' };

function extractSessionToken(cookie: string | null): string | null {
  if (!cookie) return null;
  const match = cookie.match(/(?:__Secure-)?better-auth\.session_token=([^;]+)/);
  return match?.[1] ?? null;
}

/**
 * DELETE — fully unlink the sponsor's GitHub OAuth account.
 *
 * Wipes (1) every project_github_repos row owned by this sponsor's email,
 * (2) the Better Auth `account` row for providerId='github', and
 * (3) the user's cached session in KV (so middleware doesn't serve stale
 * `has-token` state for up to 5 min after disconnect). Client then reloads
 * /portal/progress, which renders in `no-github-account` state.
 *
 * No client-side authClient.unlinkAccount() — Better Auth's /unlink-account
 * route would throw ACCOUNT_NOT_FOUND on the row this handler just deleted,
 * and freshSessionMiddleware (default 24h) would 403 stale sessions anyway.
 *
 * Email is lowercased before the lookups; middleware already normalizes, but
 * legacy mixed-case rows could otherwise miss the WHERE filter.
 */
export const DELETE: APIRoute = async ({ locals, request }) => {
  const sessionUser = locals.user;

  if (!sessionUser?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: JSON_HEADERS,
    });
  }

  if (sessionUser.role !== 'sponsor') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: JSON_HEADERS,
    });
  }

  const email = sessionUser.email.toLowerCase();

  try {
    const db = getDrizzle();

    const reposResult = await db
      .delete(projectGithubRepos)
      .where(eq(projectGithubRepos.userEmail, email))
      .run();

    const userRow = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email))
      .get();

    if (userRow?.id) {
      await db
        .delete(account)
        .where(and(eq(account.userId, userRow.id), eq(account.providerId, 'github')))
        .run();
    }

    // Invalidate KV session cache so middleware re-reads from D1 on next request.
    // Without this, /portal/progress can render `has-token` for up to 5 min
    // (cache TTL) after a successful disconnect.
    const sessionToken = extractSessionToken(request.headers.get('cookie'));
    const kvCache = env.SESSION_CACHE;
    if (sessionToken && kvCache) {
      await kvCache
        .delete(sessionToken)
        .catch((e: unknown) => console.error('[disconnect] KV cache delete failed:', e));
    }

    const removedLinks =
      (reposResult as { meta?: { changes?: number } } | undefined)?.meta?.changes ?? 0;

    return new Response(JSON.stringify({ success: true, removedLinks }), {
      headers: JSON_HEADERS,
    });
  } catch (err) {
    console.error('[disconnect] failed:', err);
    return new Response(JSON.stringify({ error: 'Disconnect failed' }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
};
