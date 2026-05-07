import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro/zod';
import { createClient } from '@sanity/client';
import { env } from 'cloudflare:workers';
import { eq, and } from 'drizzle-orm';
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
import {
  getSponsorAgreementRev,
  loadQuery,
  getSiteParams,
  SPONSOR_BY_EMAIL_QUERY,
  SPONSOR_PROJECTS_API_QUERY,
  EVENTS_BY_MONTH_QUERY,
} from '@/lib/sanity';
import type {
  SPONSOR_BY_EMAIL_QUERY_RESULT,
  SPONSOR_PROJECTS_API_QUERY_RESULT,
  EVENTS_BY_MONTH_QUERY_RESULT,
} from '@/sanity.types';
import { getDrizzle } from '@/lib/db';
import { account, projectGithubRepos, user } from '@/lib/drizzle-schema';
import { getGitHubToken, getUserRepos } from '@/lib/github';
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
      // getSponsorAgreementRev already returns null on inner errors, but wrap defensively so a
      // future refactor (e.g. throwing a typed error) cannot regress first-time acceptance into
      // a 500 — the rev === null branch below already implements the documented fail-open path.
      let rev: string | null = null;
      try {
        rev = await getSponsorAgreementRev();
      } catch (err) {
        log.error('accept-agreement-rev-fetch-failed', err);
      }

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

  getSponsorProjects: defineAction({
    input: z.object({ sponsorId: z.string().optional() }),
    handler: async (input, ctx) => {
      const sessionUser = ctx.locals.user;
      if (!sessionUser?.email) {
        throw new ActionError({ code: 'UNAUTHORIZED', message: 'unauthorized' });
      }

      if (input.sponsorId) {
        const { result: sponsor } = await loadQuery<SPONSOR_BY_EMAIL_QUERY_RESULT>({
          query: SPONSOR_BY_EMAIL_QUERY,
          params: { email: sessionUser.email, ...getSiteParams() },
        });

        if (!sponsor || sponsor._id !== input.sponsorId) {
          throw new ActionError({ code: 'FORBIDDEN', message: 'forbidden' });
        }

        const { result: projects } = await loadQuery<SPONSOR_PROJECTS_API_QUERY_RESULT>({
          query: SPONSOR_PROJECTS_API_QUERY,
          params: { sponsorId: input.sponsorId, ...getSiteParams() },
        });
        return projects ?? [];
      }

      const { result: sponsor } = await loadQuery<SPONSOR_BY_EMAIL_QUERY_RESULT>({
        query: SPONSOR_BY_EMAIL_QUERY,
        params: { email: sessionUser.email, ...getSiteParams() },
      });

      if (!sponsor) {
        throw new ActionError({ code: 'NOT_FOUND', message: 'No sponsor found for this email' });
      }

      const { result: projects } = await loadQuery<SPONSOR_PROJECTS_API_QUERY_RESULT>({
        query: SPONSOR_PROJECTS_API_QUERY,
        params: { sponsorId: sponsor._id, ...getSiteParams() },
      });
      return projects ?? [];
    },
  }),

  getSponsorEvents: defineAction({
    input: z.object({ start: z.string(), end: z.string() }),
    handler: async (input, ctx) => {
      const sessionUser = ctx.locals.user;
      if (!sessionUser?.email) {
        throw new ActionError({ code: 'UNAUTHORIZED', message: 'unauthorized' });
      }

      // Strip Temporal IANA annotations (e.g. "[UTC]") — Schedule-X sends these via onRangeUpdate
      const monthStart = input.start.replace(/\[.*\]$/, '');
      const monthEnd = input.end.replace(/\[.*\]$/, '');

      if (!Number.isFinite(Date.parse(monthStart)) || !Number.isFinite(Date.parse(monthEnd))) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'Invalid date format. Use ISO 8601 date strings.',
        });
      }

      const { result: events } = await loadQuery<EVENTS_BY_MONTH_QUERY_RESULT>({
        query: EVENTS_BY_MONTH_QUERY,
        params: { monthStart, monthEnd, ...getSiteParams() },
      });
      return events ?? [];
    },
  }),

  getMe: defineAction({
    input: z.object({}),
    handler: async (_input, ctx) => {
      return ctx.locals.user ?? null;
    },
  }),

  getGithubLinks: defineAction({
    input: z.object({}),
    handler: async (_input, ctx) => {
      const sessionUser = ctx.locals.user;
      if (!sessionUser?.email) {
        throw new ActionError({ code: 'UNAUTHORIZED', message: 'unauthorized' });
      }
      if (sessionUser.role !== 'sponsor') {
        throw new ActionError({ code: 'FORBIDDEN', message: 'forbidden' });
      }

      const email = sessionUser.email.toLowerCase();
      const db = getDrizzle();
      const links = await db
        .select()
        .from(projectGithubRepos)
        .where(eq(projectGithubRepos.userEmail, email))
        .all();
      return links;
    },
  }),

  linkGithubRepo: defineAction({
    input: z.object({
      projectSanityId: z.string().min(1),
      githubRepo: z
        .string()
        .regex(/^[^/]+\/[^/]+$/, 'githubRepo must be in owner/repo format'),
    }),
    handler: async (input, ctx) => {
      const sessionUser = ctx.locals.user;
      if (!sessionUser?.email) {
        throw new ActionError({ code: 'UNAUTHORIZED', message: 'unauthorized' });
      }
      if (sessionUser.role !== 'sponsor') {
        throw new ActionError({ code: 'FORBIDDEN', message: 'forbidden' });
      }

      const email = sessionUser.email.toLowerCase();
      const db = getDrizzle();
      const now = new Date();

      // Atomic upsert against the (user_email, project_sanity_id) unique index
      // — eliminates the select-then-insert race that otherwise surfaces as a
      // UNIQUE constraint violation under concurrent clicks.
      const [row] = await db
        .insert(projectGithubRepos)
        .values({
          id: crypto.randomUUID(),
          userEmail: email,
          projectSanityId: input.projectSanityId,
          githubRepo: input.githubRepo,
          linkedAt: now,
        })
        .onConflictDoUpdate({
          target: [projectGithubRepos.userEmail, projectGithubRepos.projectSanityId],
          set: { githubRepo: input.githubRepo, linkedAt: now },
        })
        .returning();
      return row;
    },
  }),

  unlinkGithubRepo: defineAction({
    input: z.object({ projectSanityId: z.string().min(1) }),
    handler: async (input, ctx) => {
      const sessionUser = ctx.locals.user;
      if (!sessionUser?.email) {
        throw new ActionError({ code: 'UNAUTHORIZED', message: 'unauthorized' });
      }
      if (sessionUser.role !== 'sponsor') {
        throw new ActionError({ code: 'FORBIDDEN', message: 'forbidden' });
      }

      const email = sessionUser.email.toLowerCase();
      const db = getDrizzle();
      await db
        .delete(projectGithubRepos)
        .where(
          and(
            eq(projectGithubRepos.userEmail, email),
            eq(projectGithubRepos.projectSanityId, input.projectSanityId),
          ),
        );
      return { success: true };
    },
  }),

  getGithubRepos: defineAction({
    input: z.object({}),
    handler: async (_input, ctx) => {
      const sessionUser = ctx.locals.user;
      if (!sessionUser?.email) {
        throw new ActionError({ code: 'UNAUTHORIZED', message: 'unauthorized' });
      }
      if (sessionUser.role !== 'sponsor') {
        throw new ActionError({ code: 'FORBIDDEN', message: 'forbidden' });
      }

      const db = getDrizzle();
      const tokenResult = await getGitHubToken(db, sessionUser.email);

      if (tokenResult.error) {
        if (tokenResult.error === 'no-github-account') {
          throw new ActionError({ code: 'NOT_FOUND', message: tokenResult.error });
        }
        throw new ActionError({ code: 'FORBIDDEN', message: tokenResult.error });
      }

      const result = await getUserRepos(tokenResult.token);
      if (result.error) {
        throw new ActionError({ code: 'BAD_GATEWAY', message: result.error });
      }
      return result.data;
    },
  }),

  disconnectGithub: defineAction({
    input: z.object({}),
    handler: async (_input, ctx) => {
      const sessionUser = ctx.locals.user;
      if (!sessionUser?.email) {
        throw new ActionError({ code: 'UNAUTHORIZED', message: 'unauthorized' });
      }
      if (sessionUser.role !== 'sponsor') {
        throw new ActionError({ code: 'FORBIDDEN', message: 'forbidden' });
      }

      const email = sessionUser.email.toLowerCase();

      try {
        const db = getDrizzle();

        const reposResult = await db
          .delete(projectGithubRepos)
          .where(eq(projectGithubRepos.userEmail, email))
          .run();

        const userRow = await db
          .select({ id: user.id })
          .from(user)
          .where(eq(user.email, email))
          .get();

        if (userRow?.id) {
          await db
            .delete(account)
            .where(and(eq(account.userId, userRow.id), eq(account.providerId, 'github')))
            .run();
        }

        // Invalidate KV session cache so middleware re-reads from D1 on next request.
        const sessionToken = extractSessionToken(ctx.request.headers.get('cookie'));
        const kvCache = env?.SESSION_CACHE;
        if (sessionToken && kvCache) {
          const hashedKey = await hashToken(sessionToken);
          await kvCache
            .delete(hashedKey)
            .catch((e: unknown) => log.error('disconnect-kv-cache-delete-failed', e));
        }

        const removedLinks =
          (reposResult as { meta?: { changes?: number } } | undefined)?.meta?.changes ?? 0;

        return { success: true, removedLinks };
      } catch (err) {
        log.error('disconnect-github-failed', err);
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Disconnect failed',
        });
      }
    },
  }),
};
