import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';

export const prerender = false;

// Portal middleware already gates this on session + role, but any portal user
// (sponsor or above) can hit it — so the response is intentionally minimal.
// Returns { ok, tableCount } to confirm the D1 binding is wired without
// disclosing schema. For full schema introspection use `wrangler d1 execute`.
export const GET: APIRoute = async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  try {
    const db = getDb();
    const { results } = await db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf_%'",
      )
      .all();
    return new Response(JSON.stringify({ ok: true, tableCount: results.length }), {
      headers,
    });
  } catch (e) {
    console.error('[db-health] D1 error:', e);
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers,
    });
  }
};
