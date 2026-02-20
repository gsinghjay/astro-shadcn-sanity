import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro/zod';
import { createClient } from '@sanity/client';

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
    handler: async (input, context) => {
      const { env } = context.locals.runtime;

      // 1. Validate Turnstile token
      const verifyRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: env.TURNSTILE_SECRET_KEY,
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
        projectId: import.meta.env.PUBLIC_SANITY_STUDIO_PROJECT_ID,
        dataset: import.meta.env.PUBLIC_SANITY_STUDIO_DATASET,
        apiVersion: '2024-01-01',
        useCdn: false,
        token: env.SANITY_API_WRITE_TOKEN,
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
      } catch {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Submission failed',
        });
      }

      // 3. Discord notification (fire-and-forget — don't fail if Discord errors)
      try {
        await fetch(env.DISCORD_WEBHOOK_URL, {
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

      return { success: true };
    },
  }),
};
