import type { APIRoute } from 'astro';
import { loadQuery, EVENTS_BY_MONTH_QUERY, getSiteParams } from '@/lib/sanity';
import type { EVENTS_BY_MONTH_QUERY_RESULT } from '@/sanity.types';

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  const user = locals.user;

  if (!user?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rawStart = url.searchParams.get('start');
  const rawEnd = url.searchParams.get('end');

  if (!rawStart || !rawEnd) {
    return new Response(JSON.stringify({ error: 'Missing required query params: start, end (ISO date strings)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Strip Temporal IANA annotations (e.g. "[UTC]") — Schedule-X sends these via onRangeUpdate
  const start = rawStart.replace(/\[.*\]$/, '');
  const end = rawEnd.replace(/\[.*\]$/, '');

  // Validate ISO date format
  if (isNaN(Date.parse(start)) || isNaN(Date.parse(end))) {
    return new Response(JSON.stringify({ error: 'Invalid date format. Use ISO 8601 date strings.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { result: events } = await loadQuery<EVENTS_BY_MONTH_QUERY_RESULT>({
    query: EVENTS_BY_MONTH_QUERY,
    params: { monthStart: start, monthEnd: end, ...getSiteParams() },
  });

  return new Response(JSON.stringify(events ?? []), {
    headers: { 'Content-Type': 'application/json' },
  });
};
