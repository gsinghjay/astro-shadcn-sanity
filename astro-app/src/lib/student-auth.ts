/**
 * Better Auth configuration for student authentication.
 * Spike 16.1 — validates Better Auth + Drizzle on CF Workers free plan.
 *
 * Uses Google OAuth only (no email/password — bcrypt exceeds 10ms CPU limit).
 * D1 adapter via Drizzle ORM against PORTAL_DB binding.
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './drizzle-schema';

/**
 * Creates a Better Auth instance bound to the request's D1 database.
 * Must be called per-request since D1 binding comes from the runtime env.
 */
interface AuthEnv {
  PORTAL_DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}

export function createAuth(env: AuthEnv) {
  const db = drizzle(env.PORTAL_DB, { schema });

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: 'sqlite',
    }),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    basePath: '/api/auth',
  });
}
