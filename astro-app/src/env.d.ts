/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />
/// <reference path="../worker-configuration.d.ts" />

/** Rate limiter Durable Object RPC interface (hosted in rate-limiter-worker).
 *  Extends Rpc.DurableObjectBranded so the type satisfies DurableObjectNamespace<T>'s
 *  brand constraint — without this, callers see `DurableObjectStub<undefined>` and
 *  calls to `checkLimit` type-error. */
interface RateLimiterDO extends Rpc.DurableObjectBranded {
  checkLimit(windowMs: number, maxRequests: number): Promise<{
    allowed: boolean;
    remaining: number;
    retryAfterMs: number;
  }>;
}

// Augment wrangler-generated Cloudflare.Env with bindings/extras that wrangler
// can't infer locally. Declared env *vars* now come from the astro:env schema
// (astro.config.mjs) and are read via astro:env/server | astro:env/client —
// they don't need to live here. Only bindings + non-schema dev tokens remain.
declare namespace Cloudflare {
  interface Env {
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
