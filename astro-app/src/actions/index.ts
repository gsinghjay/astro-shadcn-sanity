import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro/zod';
import { createClient } from '@sanity/client';
import {
  TURNSTILE_SECRET_KEY,
  SANITY_API_WRITE_TOKEN,
  DISCORD_WEBHOOK_URL,
} from 'astro:env/server';
import {
  PUBLIC_SANITY_STUDIO_PROJECT_ID,
  PUBLIC_SANITY_STUDIO_DATASET,
} from 'astro:env/client';

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
    handler: async (input) => {
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
        console.error('[submitForm] Sanity write failed:', {
          message: (err as Error)?.message,
          name: (err as Error)?.name,
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
      if (DISCORD_WEBHOOK_URL?.trim()) {
        try {
          await fetch(DISCORD_WEBHOOK_URL, {
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
          });
        } catch {
          /* Discord failure doesn't affect submission success */
        }
      }

      return { success: true };
    },
  }),
};
