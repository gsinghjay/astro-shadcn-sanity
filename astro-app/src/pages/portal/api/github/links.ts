import type { APIRoute } from 'astro';
import { eq, and } from 'drizzle-orm';
import { getDrizzle } from '@/lib/db';
import { projectGithubRepos } from '@/lib/drizzle-schema';

export const prerender = false;

const JSON_HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' };

/** GET — return sponsor's project-repo mappings from D1 */
export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;

  if (!user?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: JSON_HEADERS,
    });
  }

  const db = getDrizzle();
  const links = await db
    .select()
    .from(projectGithubRepos)
    .where(eq(projectGithubRepos.userEmail, user.email))
    .all();

  return new Response(JSON.stringify(links), { headers: JSON_HEADERS });
};

/** POST — upsert a project-repo mapping */
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: JSON_HEADERS,
    });
  }

  let body: { projectSanityId?: string; githubRepo?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const { projectSanityId, githubRepo } = body;

  if (!projectSanityId || !githubRepo) {
    return new Response(JSON.stringify({ error: 'Missing projectSanityId or githubRepo' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  // Validate owner/repo format
  if (!/^[^/]+\/[^/]+$/.test(githubRepo)) {
    return new Response(JSON.stringify({ error: 'githubRepo must be in owner/repo format' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const db = getDrizzle();

  // Check if a link already exists for this project
  const existing = await db
    .select()
    .from(projectGithubRepos)
    .where(
      and(
        eq(projectGithubRepos.userEmail, user.email),
        eq(projectGithubRepos.projectSanityId, projectSanityId),
      ),
    )
    .get();

  if (existing) {
    // Update existing link
    await db
      .update(projectGithubRepos)
      .set({ githubRepo, linkedAt: new Date() })
      .where(eq(projectGithubRepos.id, existing.id));

    const updated = await db
      .select()
      .from(projectGithubRepos)
      .where(eq(projectGithubRepos.id, existing.id))
      .get();

    return new Response(JSON.stringify(updated), { headers: JSON_HEADERS });
  }

  // Insert new link
  const id = crypto.randomUUID();
  await db.insert(projectGithubRepos).values({
    id,
    userEmail: user.email,
    projectSanityId,
    githubRepo,
    linkedAt: new Date(),
  });

  const created = await db
    .select()
    .from(projectGithubRepos)
    .where(eq(projectGithubRepos.id, id))
    .get();

  return new Response(JSON.stringify(created), {
    status: 201,
    headers: JSON_HEADERS,
  });
};

/** DELETE — remove a project-repo mapping */
export const DELETE: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: JSON_HEADERS,
    });
  }

  let body: { projectSanityId?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const { projectSanityId } = body;

  if (!projectSanityId) {
    return new Response(JSON.stringify({ error: 'Missing projectSanityId' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const db = getDrizzle();
  await db
    .delete(projectGithubRepos)
    .where(
      and(
        eq(projectGithubRepos.userEmail, user.email),
        eq(projectGithubRepos.projectSanityId, projectSanityId),
      ),
    );

  return new Response(JSON.stringify({ success: true }), { headers: JSON_HEADERS });
};
