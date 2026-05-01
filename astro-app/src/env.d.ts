/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />
/// <reference path="../worker-configuration.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_SANITY_STUDIO_PROJECT_ID: string;
  readonly PUBLIC_SANITY_STUDIO_DATASET: string;
  readonly PUBLIC_SANITY_DATASET: string;
  readonly PUBLIC_SANITY_VISUAL_EDITING_ENABLED: string;
  readonly PUBLIC_SANITY_LIVE_CONTENT_ENABLED: string;
  readonly PUBLIC_SANITY_STUDIO_URL: string;
  readonly PUBLIC_SITE_ID: string;
  readonly PUBLIC_SITE_THEME: "red" | "blue" | "green";
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_GTM_ID: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Rate limiter Durable Object RPC interface (hosted in rate-limiter-worker). */
interface RateLimiterDO {
  checkLimit(windowMs: number, maxRequests: number): Promise<{
    allowed: boolean;
    remaining: number;
    retryAfterMs: number;
  }>;
}

// Augment wrangler-generated Cloudflare.Env with dashboard-managed secrets
// (which wrangler can't see locally) and properly-typed Durable Object RPC.
declare namespace Cloudflare {
  interface Env {
    TURNSTILE_SECRET_KEY: string;
    SANITY_API_WRITE_TOKEN: string;
    SANITY_API_READ_TOKEN?: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    RESEND_API_KEY: string;
    RESEND_FROM_EMAIL?: string;
    DISCORD_WEBHOOK_URL?: string;
    GITHUB_DEV_TOKEN?: string;
    RATE_LIMITER?: DurableObjectNamespace<RateLimiterDO>;
  }
}

declare namespace App {
  interface Locals {
    user?: { email: string; role: 'sponsor' | 'student'; name?: string };
    /** Sponsor Agreement Gate — true when a sponsor must accept the CMS agreement before proceeding */
    requiresAgreement?: boolean;
  }
}
