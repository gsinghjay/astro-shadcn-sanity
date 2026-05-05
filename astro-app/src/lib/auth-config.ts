/**
 * Better Auth configuration for unified authentication (students + sponsors).
 * Providers: Google OAuth, GitHub OAuth, Magic Link (Resend).
 * D1 adapter via shared Drizzle ORM instance from db.ts.
 * Role assignment via Sanity whitelist check on user creation.
 */
import { betterAuth } from 'better-auth';
import { magicLink } from 'better-auth/plugins/magic-link';
import { emailOTP } from 'better-auth/plugins/email-otp';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { Resend } from 'resend';
import { defineQuery } from 'groq';
import { sanityClient } from 'sanity:client';
import { log } from '@/lib/log';
import {
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
} from 'astro:env/server';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type * as schema from './drizzle-schema';

const SPONSOR_WHITELIST_QUERY = defineQuery(
  `count(*[_type == "sponsor" && (contactEmail == $email || $email in allowedEmails[])]) > 0`,
);

interface CreateAuthOptions {
  db: DrizzleD1Database<typeof schema>;
  /** Request origin (e.g., https://feat-branch.ywcc-capstone.pages.dev). Used as baseURL
   *  so OAuth callbacks route to the correct deployment, and added to trustedOrigins
   *  so Better Auth CSRF checks pass on preview deployments. */
  requestOrigin?: string;
}

/**
 * Checks if an email is on the sponsor whitelist by querying Sanity.
 * Returns true if the email matches any sponsor's contactEmail or exists in any sponsor's allowedEmails[].
 * Fails closed (returns false) on any error — non-whitelisted users default to student role.
 */
export async function checkSponsorWhitelist(email: string): Promise<boolean> {
  try {
    const result = await sanityClient.fetch<boolean>(SPONSOR_WHITELIST_QUERY, { email });
    return result === true;
  } catch (err) {
    log.error('auth-sanity-whitelist-check-failed', err);
    return false;
  }
}

/**
 * Creates a Better Auth instance bound to the request's D1 database.
 * Must be called per-request since D1 binding comes from the runtime env.
 *
 * Auth env vars are imported directly from astro:env/server — required ones
 * (BETTER_AUTH_SECRET / GOOGLE_CLIENT_SECRET / GITHUB_CLIENT_SECRET /
 * RESEND_API_KEY) are validated at build start by validateSecrets:true.
 * The optional public vars (BETTER_AUTH_URL / GITHUB_CLIENT_ID /
 * RESEND_FROM_EMAIL) are checked at runtime below — fail-loud on rwc Workers
 * where they're absent rather than letting Better Auth surface a confusing
 * internal error.
 *
 * @param options.db - Shared Drizzle instance from getDrizzle()
 */
export function createAuth({ db, requestOrigin }: CreateAuthOptions) {
  const required = {
    BETTER_AUTH_SECRET, BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET,
    RESEND_API_KEY,
  } as const;
  for (const [key, value] of Object.entries(required)) {
    if (!value?.trim()) {
      throw new Error(`Missing required auth environment variable: ${key}`);
    }
  }

  // Use request origin when available so OAuth callbacks and CSRF checks
  // work on preview deployments (e.g., feat-branch.ywcc-capstone.pages.dev).
  const baseURL = requestOrigin || BETTER_AUTH_URL;
  const origins = [BETTER_AUTH_URL];
  if (requestOrigin && requestOrigin !== BETTER_AUTH_URL) {
    origins.push(requestOrigin);
  }

  const resendClient = new Resend(RESEND_API_KEY);

  return betterAuth({
    baseURL,
    secret: BETTER_AUTH_SECRET,
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
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        scope: ['repo'],
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
      },
    },
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          const fromAddress = RESEND_FROM_EMAIL?.trim() || 'YWCC Capstone <noreply@ywcc-capstone.pages.dev>';
          if (!RESEND_FROM_EMAIL?.trim()) {
            log.warn('auth-resend-from-email-missing', {
              detail: 'using default .pages.dev sender; set RESEND_FROM_EMAIL to a verified domain for production',
            });
          }
          const safeUrl = url.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          await resendClient.emails.send({
            from: fromAddress,
            to: email,
            subject: 'Sign in to the Sponsor Portal',
            html: `<p>Click the link below to sign in to the Sponsor Portal:</p><p><a href="${safeUrl}">Sign in to Sponsor Portal</a></p><p>This link expires in 10 minutes.</p>`,
          });
        },
      }),
      // OTP fallback for inboxes whose link scanners (Microsoft Defender Safe Links,
      // Proofpoint, Mimecast) pre-fetch URLs and consume single-use magic-link tokens
      // before the human can click. A copy-paste 6-digit code survives scanning.
      emailOTP({
        sendVerificationOTP: async ({ email, otp, type }) => {
          if (type !== 'sign-in') return;
          const fromAddress = RESEND_FROM_EMAIL?.trim() || 'YWCC Capstone <noreply@ywcc-capstone.pages.dev>';
          await resendClient.emails.send({
            from: fromAddress,
            to: email,
            subject: 'Your Sponsor Portal sign-in code',
            html: `<p>Your sign-in code:</p><p style="font-size:24px;letter-spacing:4px;font-weight:bold;">${otp}</p><p>This code expires in 5 minutes.</p>`,
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
        // cookieCache includes additionalFields (role) in the cached payload.
        // If a future Better Auth update changes this, middleware falls back to
        // role ?? "student" and self-heals via Sanity whitelist escalation.
      },
    },
    trustedOrigins: origins,
    basePath: '/api/auth',
  });
}
