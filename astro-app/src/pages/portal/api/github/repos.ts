import type { APIRoute } from 'astro';
import { getDrizzle } from '@/lib/db';
import { getGitHubToken, getUserRepos } from '@/lib/github';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;

  if (!user?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
    });
  }

  const db = getDrizzle();
  const tokenResult = await getGitHubToken(db, user.email);

  if (tokenResult.error) {
    return new Response(JSON.stringify({ error: tokenResult.error }), {
      status: tokenResult.error === 'no-github-account' ? 404 : 403,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
    });
  }

  const result = await getUserRepos(tokenResult.token);

  if (result.error) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
    });
  }

  return new Response(JSON.stringify(result.data), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
  });
};
