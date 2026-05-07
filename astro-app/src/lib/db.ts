import { drizzle } from 'drizzle-orm/d1';
import { env } from 'cloudflare:workers';
import * as schema from './drizzle-schema';

export function getDb(): D1Database {
  const db = env.PORTAL_DB;
  if (!db) throw new Error('PORTAL_DB binding not available');
  return db;
}

/** Creates a Drizzle ORM instance wrapping the PORTAL_DB D1 binding. Call once per request. */
export function getDrizzle() {
  return drizzle(getDb(), { schema });
}
