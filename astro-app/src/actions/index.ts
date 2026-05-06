import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro/zod';
import { createClient } from '@sanity/client';
import { env } from 'cloudflare:workers';
import {
  TURNSTILE_SECRET_KEY,
  SANITY_API_WRITE_TOKEN,
  DISCORD_WEBHOOK_URL,
} from 'astro:env/server';
import {
  PUBLIC_SANITY_STUDIO_PROJECT_ID,
  PUBLIC_SANITY_STUDIO_DATASET,
} from 'astro:env/client';
import { extractSessionToken, hashToken, normalizeEmail } from '@/middleware';
import { getSponsorAgreementRev } from '@/lib/sanity';
import { log } from '@/lib/log';

export const server = {
  submitForm: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email address'),
      organization: z.string().optional().default(''),
      message: z.string().min(1, 'Message is required').max(5000, 'Message too long'),
      form_id: z.string().optional().default(''),
      'cf-turnstile-response': z.string().min(1, 'Bot verification required'),
    }),
    handler: async (input, ctx) => {
      // 1. Validate Turnstile token
      const verifyRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: TURNSTILE_SECRET_KEY,
            response: input['cf-turnstile-response'],
          }),
        },
      );
      const verify = (await verifyRes.json()) as { success: boolean };
      if (!verify.success) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Bot verification failed',
        });
      }

      // 2. Create submission document in Sanity
      const writeClient = createClient({
        projectId: PUBLIC_SANITY_STUDIO_PROJECT_ID,
        dataset: PUBLIC_SANITY_STUDIO_DATASET,
        apiVersion: '2025-05-01',
        useCdn: false,
        token: SANITY_API_WRITE_TOKEN,
      });

      try {
        await writeClient.create({
          _type: 'submission',
          name: input.name,
          email: input.email,
          organization: input.organization,
          message: input.message,
          form: input.form_id
            ? { _type: 'reference', _ref: input.form_id }
            : undefined,
          submittedAt: new Date().toISOString(),
        });
      } catch (err) {
        log.error('submitForm-sanity-write-failed', err, {
          hasWriteToken: Boolean(SANITY_API_WRITE_TOKEN),
          projectId: PUBLIC_SANITY_STUDIO_PROJECT_ID,
          dataset: PUBLIC_SANITY_STUDIO_DATASET,
          formId: input.form_id || '(none)',
        });
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Submission failed',
        });
      }

      // 3. Discord notification (fire-and-forget — don't fail if Discord errors).
      // DISCORD_WEBHOOK_URL is optional in the schema (rwc Workers don't carry it);
      // the trim() guard avoids `fetch(undefined)` AND `fetch("   ")` (a whitespace
      // value passes envField.string validation but throws TypeError: Invalid URL).
      // `cfContext.waitUntil` keeps the isolate alive past response so the webhook
      // POST isn't dropped on isolate eviction. The fetch expression lives INSIDE
      // the optional chain so a missing cfContext (vitest, non-Worker runtimes)
      // short-circuits the whole call instead of leaving a floating fetch behind.
      // Mirrors middleware.ts pattern. Net effect vs prior `await fetch(...)`:
      // action returns ~200–800ms faster.
      if (DISCORD_WEBHOOK_URL?.trim()) {
        const discordWebhookUrl = DISCORD_WEBHOOK_URL;
        ctx.locals.cfContext?.waitUntil(
          fetch(discordWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              embeds: [
                {
                  title: 'New Sponsor Inquiry',
                  color: 0x0066cc,
                  fields: [
                    { name: 'Name', value: input.name, inline: true },
                    { name: 'Email', value: input.email, inline: true },
                    {
                      name: 'Organization',
                      value: input.organization || 'N/A',
                      inline: true,
                    },
                    {
                      name: 'Message',
                      value: input.message.slice(0, 1024),
                    },
                  ],
                  timestamp: new Date().toISOString(),
                },
              ],
            }),
          }).catch((e) => log.error('submitForm-discord-webhook-failed', e)),
        );
      }

      return { success: true };
    },
  }),

  acceptAgreement: defineAction({
    input: z.object({}),
    handler: async (_input, ctx) => {
      const user = ctx.locals.user;
      if (!user) throw new ActionError({ code: 'UNAUTHORIZED', message: 'unauthorized' });
      if (user.role !== 'sponsor') throw new ActionError({ code: 'FORBIDDEN', message: 'forbidden' });
      if (!env?.PORTAL_DB) throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'service_unavailable' });

      const email = normalizeEmail(user.email);
      const acceptedAt = Date.now();

      const existing = await env.PORTAL_DB
        .prepare('SELECT agreement_accepted_at, agreement_version FROM user WHERE LOWER(email) = ?')
        .bind(email)
        .first<{ agreement_accepted_at: number | null; agreement_version: string | null }>();

      if (!existing) throw new ActionError({ code: 'NOT_FOUND', message: 'user_not_found' });

      const ip = ctx.request.headers.get('cf-connecting-ip');
      const ua = ctx.request.headers.get('user-agent');
      const rev = await getSponsorAgreementRev();

      // Sanity outage (rev === null) → trust the existing accepted_at to avoid double-accept;
      // otherwise re-accept on version drift.
      if (existing.agreement_accepted_at != null) {
        const upToDate =
          rev === null
            ? true
            : existing.agreement_version != null && existing.agreement_version === rev;
        if (upToDate) {
          return { status: 'already_accepted' as const, acceptedAt: existing.agreement_accepted_at };
        }
      }

      await env.PORTAL_DB
        .prepare(
          'UPDATE user SET agreement_accepted_at = ?, agreement_version = ?, agreement_accepted_ip = ?, agreement_accepted_user_agent = ? WHERE LOWER(email) = ?',
        )
        .bind(acceptedAt, rev, ip, ua, email)
        .run();

      const sessionToken = extractSessionToken(ctx.request.headers.get('cookie'));
      if (sessionToken && env.SESSION_CACHE) {
        try {
          const hashedKey = await hashToken(sessionToken);
          await env.SESSION_CACHE.delete(hashedKey);
        } catch (e) {
          log.error('agreement-accept-kv-invalidation-failed', e);
        }
      }

      return { status: 'accepted' as const, acceptedAt };
    },
  }),
};
