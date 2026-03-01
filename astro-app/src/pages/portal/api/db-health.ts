import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = getDb(locals);
    const { results } = await db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all();
    return new Response(JSON.stringify({ ok: true, tables: results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
