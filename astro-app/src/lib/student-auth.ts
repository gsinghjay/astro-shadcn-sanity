/**
 * Better Auth configuration for student authentication.
 * Uses Google OAuth only (no email/password — bcrypt exceeds 10ms CPU limit).
 * D1 adapter via shared Drizzle ORM instance from db.ts.
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type * as schema from './drizzle-schema';

/**
 * Environment variables required for Better Auth configuration.
 * PORTAL_DB is NOT included — Drizzle instance is provided externally via getDrizzle().
 */
export interface AuthEnv {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}

interface CreateAuthOptions {
  db: DrizzleD1Database<typeof schema>;
  env: AuthEnv;
  /** Request origin (e.g., https://feat-branch.ywcc-capstone.pages.dev). Used as baseURL
   *  so OAuth callbacks route to the correct deployment, and added to trustedOrigins
   *  so Better Auth CSRF checks pass on preview deployments. */
  requestOrigin?: string;
}

/**
 * Creates a Better Auth instance bound to the request's D1 database.
 * Must be called per-request since D1 binding comes from the runtime env.
 *
 * @param options.db - Shared Drizzle instance from getDrizzle(locals)
 * @param options.env - Auth-specific environment variables
 */
export function createAuth({ db, env, requestOrigin }: CreateAuthOptions) {
  const required: (keyof AuthEnv)[] = ['BETTER_AUTH_SECRET', 'BETTER_AUTH_URL', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
  for (const key of required) {
    if (!env[key]?.trim()) {
      throw new Error(`Missing required auth environment variable: ${key}`);
    }
  }

  // Use request origin when available so OAuth callbacks and CSRF checks
  // work on preview deployments (e.g., feat-branch.ywcc-capstone.pages.dev).
  const baseURL = requestOrigin || env.BETTER_AUTH_URL;
  const origins = [env.BETTER_AUTH_URL];
  if (requestOrigin && requestOrigin !== env.BETTER_AUTH_URL) {
    origins.push(requestOrigin);
  }

  return betterAuth({
    baseURL,
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
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // refresh session every 24h
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5-minute cookie cache → reduces D1 reads
      },
    },
    trustedOrigins: origins,
    basePath: '/api/auth',
  });
}
