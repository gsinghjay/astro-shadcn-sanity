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
}

/**
 * Static trusted-origin allowlist driven by CLOUDFLARE_ENV (per-Worker constant).
 * Capstone is the only deployment that runs auth (rwc + *-preview Workers 503 portal
 * routes), so the allowlist is empty there. CLOUDFLARE_ENV is undeclared in the
 * astro:env schema and inlined from process.env at build time by Astro 6 / Vite.
 *
 * Read at call time (not module init) so vitest can stub via vi.stubEnv between cases.
 */
function getTrustedOrigins(): string[] {
  const cfEnv = import.meta.env.CLOUDFLARE_ENV ?? 'capstone';
  if (cfEnv !== 'capstone') return [];
  return [BETTER_AUTH_URL].filter(Boolean) as string[];
}

/**
 * Checks if an email is on the sponsor whitelist by querying Sanity.
 * Returns true if the email matches any sponsor's contactEmail or exists in any sponsor's allowedEmails[].
 * Fails closed (returns false) on any error — non-whitelisted users default to student role.
 *
 * Email is lowercased before the GROQ comparison (which is case-sensitive) so the
 * create-before hook (raw provider email) and middleware escalation (already
 * normalised) agree on whitelist membership for the same physical user.
 */
export async function checkSponsorWhitelist(email: string): Promise<boolean> {
  try {
    const result = await sanityClient.fetch<boolean>(SPONSOR_WHITELIST_QUERY, { email: email.toLowerCase() });
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
 * `baseURL` and `trustedOrigins` are derived from BETTER_AUTH_URL + CLOUDFLARE_ENV
 * — the request `Origin` header is intentionally NOT consulted. A request-derived
 * allowlist is self-referential against any non-browser HTTP client (which can
 * forge Origin freely), defeating Better Auth's CSRF gate.
 *
 * @param options.db - Shared Drizzle instance from getDrizzle()
 */
export function createAuth({ db }: CreateAuthOptions) {
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

  const baseURL = BETTER_AUTH_URL;
  const trustedOrigins = getTrustedOrigins();

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
      // Sponsor identity is established by the primary login (whitelist-checked
      // at sign-in). GitHub is linked only for repo metadata, not authz, so the
      // OAuth provider email need not match the portal email.
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
      },
    },
    plugins: [
      magicLink({
        disableSignUp: true,
        expiresIn: 600,
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
          // Sponsor role gate — only assign 'sponsor' when the provider verified the email
          // AND the email is on the Sanity whitelist. Better Auth normalizes the provider's
          // verification field (Google `email_verified`, GitHub primary-email `verified` via
          // `/user/emails`) into `user.emailVerified` before this hook fires, so this is the
          // single signal we trust. Anything else (no provider verification, unrecognized
          // provider) → 'student'.
          //
          // Magic-link reachability: with `disableSignUp: true` Better Auth rejects unknown
          // emails with `new_user_signup_disabled` BEFORE creating a user, so this hook does
          // not fire on a normal magic-link click. It would fire only if a future flow
          // creates a user via the magic-link plugin path (admin pre-provisioning etc.); in
          // that case the plugin sets `emailVerified: true` because the click itself proves
          // email control. AC 8 closes the privilege-escalation path in upstream Better Auth.
          before: async (user, ctx) => {
            const emailIsVerified = (user as { emailVerified?: boolean }).emailVerified === true;
            // `pathSegment` is the URL last-segment of the auth route that triggered creation
            // (e.g. 'google', 'github', 'magic-link'). Used for ops correlation only — it is
            // NOT necessarily an OAuth provider name.
            const pathSegment = ctx?.path?.split('/').filter(Boolean).pop() ?? 'unknown';
            const isSponsor = emailIsVerified ? await checkSponsorWhitelist(user.email) : false;
            if (!emailIsVerified) {
              log.warn('auth-denied-sponsor-role-unverified-email', {
                email: user.email,
                pathSegment,
              });
            }
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
    trustedOrigins,
    basePath: '/api/auth',
  });
}
