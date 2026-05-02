import type { APIRoute } from 'astro';
import { eq, and } from 'drizzle-orm';
import { getDrizzle } from '@/lib/db';
import { account, projectGithubRepos, user } from '@/lib/drizzle-schema';

export const prerender = false;

const JSON_HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' };

/**
 * DELETE — fully unlink the sponsor's GitHub OAuth account.
 *
 * Wipes (1) every project_github_repos row owned by this sponsor's email and
 * (2) the Better Auth `account` row for providerId='github'. The client then
 * calls authClient.unlinkAccount() to flush in-memory session state and
 * reloads /portal/progress (which renders in `no-github-account` state).
 *
 * Order matters: clearing project rows BEFORE the OAuth row prevents an
 * orphan window where project_github_repos points at a repo the sponsor no
 * longer has portal token access to.
 *
 * The user.id is resolved by email lookup because App.Locals.user does not
 * carry it (the locals shape is narrower than Better Auth's user object).
 */
export const DELETE: APIRoute = async ({ locals }) => {
  const sessionUser = locals.user;

  if (!sessionUser?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: JSON_HEADERS,
    });
  }

  // Defense-in-depth: middleware already gates /portal/* but the endpoint
  // must not assume the role from upstream.
  if (sessionUser.role !== 'sponsor') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: JSON_HEADERS,
    });
  }

  try {
    const db = getDrizzle();

    const reposResult = await db
      .delete(projectGithubRepos)
      .where(eq(projectGithubRepos.userEmail, sessionUser.email))
      .run();

    const userRow = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, sessionUser.email))
      .get();

    if (userRow?.id) {
      await db
        .delete(account)
        .where(and(eq(account.userId, userRow.id), eq(account.providerId, 'github')))
        .run();
    }

    const removedLinks =
      (reposResult as { meta?: { changes?: number } } | undefined)?.meta?.changes ?? 0;

    return new Response(JSON.stringify({ success: true, removedLinks }), {
      headers: JSON_HEADERS,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Disconnect failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
};
