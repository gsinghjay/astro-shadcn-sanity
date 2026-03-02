import type { APIRoute } from 'astro';
import { loadQuery, SPONSOR_BY_EMAIL_QUERY, SPONSOR_PROJECTS_API_QUERY, getSiteParams } from '@/lib/sanity';
import type { SPONSOR_BY_EMAIL_QUERY_RESULT, SPONSOR_PROJECTS_API_QUERY_RESULT } from '@/sanity.types';

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  const user = locals.user;

  if (!user?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
    });
  }

  // Accept sponsorId query param, or look up sponsor by authenticated email
  const sponsorId = url.searchParams.get('sponsorId');

  if (sponsorId) {
    // Validate the requesting user's email matches this sponsor
    const { result: sponsor } = await loadQuery<SPONSOR_BY_EMAIL_QUERY_RESULT>({
      query: SPONSOR_BY_EMAIL_QUERY,
      params: { email: user.email, ...getSiteParams() },
    });

    if (!sponsor || sponsor._id !== sponsorId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
      });
    }

    const { result: projects } = await loadQuery<SPONSOR_PROJECTS_API_QUERY_RESULT>({
      query: SPONSOR_PROJECTS_API_QUERY,
      params: { sponsorId, ...getSiteParams() },
    });

    return new Response(JSON.stringify(projects ?? []), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
    });
  }

  // No sponsorId — look up sponsor by email and return their projects
  const { result: sponsor } = await loadQuery<SPONSOR_BY_EMAIL_QUERY_RESULT>({
    query: SPONSOR_BY_EMAIL_QUERY,
    params: { email: user.email, ...getSiteParams() },
  });

  if (!sponsor) {
    return new Response(JSON.stringify({ error: 'No sponsor found for this email' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
    });
  }

  const { result: projects } = await loadQuery<SPONSOR_PROJECTS_API_QUERY_RESULT>({
    query: SPONSOR_PROJECTS_API_QUERY,
    params: { sponsorId: sponsor._id, ...getSiteParams() },
  });

  return new Response(JSON.stringify(projects ?? []), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
  });
};
