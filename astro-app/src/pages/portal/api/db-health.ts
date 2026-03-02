import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';

export const prerender = false;

// TODO: Gate behind admin check once Story 9.15 lands — sponsors should not
// see internal table names in production.
export const GET: APIRoute = async ({ locals }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  try {
    const db = getDb(locals);
    const { results } = await db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf_%' ORDER BY name",
      )
      .all();
    return new Response(JSON.stringify({ ok: true, tables: results }), {
      headers,
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers,
    });
  }
};
