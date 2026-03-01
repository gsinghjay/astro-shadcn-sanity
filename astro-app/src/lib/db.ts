import type { AstroGlobal } from 'astro';

export function getDb(locals: App.Locals): D1Database {
  const db = locals.runtime.env.PORTAL_DB;
  if (!db) throw new Error('PORTAL_DB binding not available');
  return db;
}
