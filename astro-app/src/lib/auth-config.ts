/**
 * Better Auth configuration for unified authentication (students + sponsors).
 * Providers: Google OAuth, GitHub OAuth, Magic Link (Resend).
 * D1 adapter via shared Drizzle ORM instance from db.ts.
 * Role assignment via Sanity whitelist check on user creation.
 */
import { betterAuth } from 'better-auth';
import { magicLink } from 'better-auth/plugins/magic-link';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { Resend } from 'resend';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type * as schema from './drizzle-schema';

/**
 * Environment variables required for Better Auth configuration.
 * PORTAL_DB is NOT included — Drizzle instance is provided externally via getDrizzle().
 */
export interface AuthEnv {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  RESEND_API_KEY: string;
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
 * Checks if an email is on the sponsor whitelist by querying Sanity.
 * Returns true if the email matches any sponsor's contactEmail or exists in any sponsor's allowedEmails[].
 */
export async function checkSponsorWhitelist(email: string): Promise<boolean> {
  const query = `count(*[_type == "sponsor" && (contactEmail == $email || $email in allowedEmails[])]) > 0`;
  const projectId = import.meta.env.PUBLIC_SANITY_STUDIO_PROJECT_ID;
  const dataset = import.meta.env.PUBLIC_SANITY_STUDIO_DATASET;
  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}&$email="${encodeURIComponent(email)}"`;

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`[auth] Sanity whitelist query failed: ${response.status}`);
    return false;
  }
  const data = await response.json();
  return data.result === true;
}

/**
 * Creates a Better Auth instance bound to the request's D1 database.
 * Must be called per-request since D1 binding comes from the runtime env.
 *
 * @param options.db - Shared Drizzle instance from getDrizzle(locals)
 * @param options.env - Auth-specific environment variables
 */
export function createAuth({ db, env, requestOrigin }: CreateAuthOptions) {
  const required: (keyof AuthEnv)[] = [
    'BETTER_AUTH_SECRET', 'BETTER_AUTH_URL',
    'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
    'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET',
    'RESEND_API_KEY',
  ];
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
    user: {
      additionalFields: {
        role: {
          type: 'string',
          required: false,
          defaultValue: 'student',
          input: false, // prevent users from setting their own role via API
        },
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          const resendClient = new Resend(env.RESEND_API_KEY);
          await resendClient.emails.send({
            from: 'YWCC Capstone <onboarding@resend.dev>',
            to: email,
            subject: 'Sign in to the Sponsor Portal',
            html: `<p>Click the link below to sign in to the Sponsor Portal:</p><p><a href="${url}">Sign in to Sponsor Portal</a></p><p>This link expires in 10 minutes.</p>`,
          });
        },
      }),
    ],
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const isSponsor = await checkSponsorWhitelist(user.email);
            return {
              data: {
                ...user,
                role: isSponsor ? 'sponsor' : 'student',
              },
            };
          },
        },
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
