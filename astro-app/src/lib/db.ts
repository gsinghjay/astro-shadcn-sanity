import { drizzle } from 'drizzle-orm/d1';
import * as schema from './drizzle-schema';

export function getDb(locals: App.Locals): D1Database {
  const db = locals.runtime.env.PORTAL_DB;
  if (!db) throw new Error('PORTAL_DB binding not available');
  return db;
}

/** Drizzle ORM instance wrapping the PORTAL_DB D1 binding. */
export function getDrizzle(locals: App.Locals) {
  return drizzle(getDb(locals), { schema });
}
