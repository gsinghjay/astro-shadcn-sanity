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
//
// Portal-only secrets are marked optional so RWC content-only Workers (which
// don't carry these bindings) type-error when content routes accidentally
// reference them. The runtime guard in auth-config.ts:74-78 still throws on
// missing values at request time — this is a type-safety fix only.
declare namespace Cloudflare {
  interface Env {
    GITHUB_DEV_TOKEN?: string;
    RATE_LIMITER?: DurableObjectNamespace<RateLimiterDO>;
    TURNSTILE_SECRET_KEY?: string;
    SANITY_API_WRITE_TOKEN?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;
    BETTER_AUTH_SECRET?: string;
    BETTER_AUTH_URL?: string;
    RESEND_API_KEY?: string;
  }
}

declare namespace App {
  interface Locals {
    user?: { email: string; role: 'sponsor' | 'student'; name?: string };
    /** Sponsor Agreement Gate — true when a sponsor must accept the CMS agreement before proceeding */
    requiresAgreement?: boolean;
    /** Cloudflare Workers ExecutionContext — set by @astrojs/cloudflare v13 adapter on every request.
     *  Use `cfContext?.waitUntil(promise)` for fire-and-forget side effects so the runtime keeps
     *  the isolate alive past response. The `?.` is required because vitest pool environments
     *  don't inject `cfContext` and the property is only present in the Workers runtime. */
    cfContext?: ExecutionContext;
  }
}
