# Cloudflare Workers Best-Practices Review — `astro-app/`

Review against the Workers best-practices skill (rules.md / review.md) and the
canonical page at `developers.cloudflare.com/workers/best-practices/workers-best-practices/`.

Scope: `astro-app/wrangler.jsonc`, `astro-app/astro.config.mjs`,
`astro-app/src/middleware.ts`, `astro-app/src/actions/`, `astro-app/src/pages/api/**`,
`astro-app/src/lib/{db,auth-config,sanity,agent-discovery}.ts`,
`astro-app/src/env.d.ts`, `astro-app/worker-configuration.d.ts`.

Date: 2026-05-02. Reviewed against `compatibility_date: 2026-04-01` +
`compatibility_flags: ["nodejs_compat", "global_fetch_strictly_public"]`.

Severity legend: **CRITICAL** (security / data loss) · **HIGH** (correctness,
broken config, type drift) · **MEDIUM** (best-practice gap, observability) ·
**LOW** (style, minor optimization).

---

## TL;DR — Top items to fix

1. [HIGH] Floating fire-and-forget promises in `middleware.ts` and `actions/index.ts` should move to `ctx.waitUntil()` via `Astro.locals.cfContext`. (§ 1)
2. [HIGH] `worker-configuration.d.ts` is stale — `GITHUB_CLIENT_ID` mismatch vs `wrangler.jsonc`, references retired `disable_nodejs_process_v2` flag. Re-run `npx wrangler types -C astro-app`. (§ 2)
3. [HIGH] Dashboard secrets typed as `string` (non-optional) in *all* generated env interfaces, including RWC content-only envs that don't have them — runtime `undefined` will not type-error. Move declarations to optional `?` in the manual augment, or stop adding them across non-capstone envs. (§ 3)
4. [MEDIUM] Retire dead `STUDIO_ADMIN_TOKEN` binding (replaced by Studio cookie + `SANITY_PROJECT_READ_TOKEN` per Story 24.1.5). (§ 4)
5. [MEDIUM] Enable `observability.traces` (or document the deliberate skip). Currently only logs are configured. (§ 5)
6. [MEDIUM] Logging is unstructured strings — switch to `console.log(JSON.stringify({...}))` for searchable Workers Logs. (§ 6)
7. [MEDIUM] `request.json()` on user-controlled bodies (`subscribe`, `accept`) is unbounded — add a content-length cap. (§ 7)

Items below are organized by Refactor / Optimize / Update.

---

# Refactor

## 1. [HIGH] Move fire-and-forget side effects to `ctx.waitUntil()`

**Rule** — *"A Promise that is not `await`ed, `return`ed, or passed to `ctx.waitUntil()` is a floating promise."* The runtime may terminate the isolate before completion.

There are **zero** `ctx.waitUntil()` / `cfContext.waitUntil()` calls in the
codebase. Every background side-effect uses `.catch(...)` to silence the
floating-promise complaint, but this does not extend isolate lifetime past the
response.

Affected sites:

- `astro-app/src/middleware.ts:191` — KV cache write after D1 fallback
- `astro-app/src/middleware.ts:212` — KV cache write after sponsor escalation
- `astro-app/src/middleware.ts:219` — D1 `UPDATE user SET role = 'sponsor'`
- `astro-app/src/middleware.ts:224` — KV cache delete on non-sponsor
- `astro-app/src/middleware.ts:266` — KV cache write after agreement-row read
- `astro-app/src/actions/index.ts:76` — Discord webhook (currently `await`-blocks the response)

Recommended pattern (per CLAUDE.md, Astro middleware exposes `Astro.locals.cfContext`):

```ts
// middleware.ts — add cfContext to the destructure
export const onRequest = defineMiddleware(async (context, next) => {
  const cfContext = context.locals.cfContext; // ExecutionContext

  // ...
  if (kvCache && sessionToken) {
    cfContext?.waitUntil(
      kvCache.put(sessionToken, JSON.stringify(userData), { expirationTtl: 300 })
        .catch((e) => console.error(JSON.stringify({ msg: "kv-write-failed", err: String(e) }))),
    );
  }
});
```

For the Discord webhook in `actions/index.ts:76`, this also unblocks the user
response (Discord can take 200–800 ms; current code blocks the action result on
the webhook).

```ts
// actions/index.ts — pull ctx via the action context
submitForm: defineAction({
  // ...
  handler: async (input, ctx) => {
    // ...
    ctx.locals.cfContext?.waitUntil(
      fetch(env.DISCORD_WEBHOOK_URL, { /* ... */ }).catch(() => {}),
    );
    return { success: true };
  },
}),
```

**Why this matters more than “lint passes”**: when an isolate is evicted (cold
edge, low traffic), `.catch()`-only patterns can drop the KV write entirely.
`ctx.waitUntil()` keeps the isolate alive up to the 30 s post-response budget.

## 2. [HIGH] Regenerate `worker-configuration.d.ts`

**Rule** — *"Run `wrangler types` to generate a type definition file that matches your actual Wrangler configuration. Re-run after adding or renaming any binding."*

`astro-app/worker-configuration.d.ts:9` shows `GITHUB_CLIENT_ID: "Ov23li8R7jigMPatjOml"` but
`astro-app/wrangler.jsonc:81` has the production `Ov23liFtOiWIyCqJXJMi`. CLAUDE.md
explicitly notes a cutover happened — types are out of sync with config.

Header line:
```
// Runtime types generated with workerd@1.20260426.1 ... disable_nodejs_process_v2,global_fetch_strictly_public,nodejs_compat
```

`disable_nodejs_process_v2` is no longer in `wrangler.jsonc` (the comment in
`wrangler.jsonc:18-19` says it was superseded by `compatibility_date >= 2026-02-19`),
so the generated types still reflect a pre-rotation runtime.

**Action**: `npx wrangler types -C astro-app` and commit. CI should fail if
`worker-configuration.d.ts` is dirty after this command.

## 3. [HIGH] Dashboard-secret augment in `env.d.ts` over-promises on RWC envs

`astro-app/src/env.d.ts:38-56` augments `Cloudflare.Env` with non-optional
secrets:

```ts
declare namespace Cloudflare {
  interface Env {
    TURNSTILE_SECRET_KEY: string;
    SANITY_API_WRITE_TOKEN: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    RESEND_API_KEY: string;
    // ...
  }
}
```

But `astro-app/wrangler.jsonc:125-170` (rwc_us, rwc_intl, rwc_*_preview) carry
**no** D1 / KV / DO bindings and the comments say *"portal/auth/api routes
return 503 if hit"*. Yet typing them as required `string` means
`env.BETTER_AUTH_SECRET` etc. on those deployments compiles cleanly while being
`undefined` at runtime. The `auth-config.ts:74-78` runtime check catches this,
but the type system shouldn't pretend it's safe.

**Fix one of**:

A. Mark cross-env-optional secrets with `?` and let `auth-config.ts` keep
   doing the runtime guard:
   ```ts
   declare namespace Cloudflare {
     interface Env {
       TURNSTILE_SECRET_KEY?: string;
       SANITY_API_WRITE_TOKEN?: string;
       GOOGLE_CLIENT_ID?: string;
       // ...
       BETTER_AUTH_URL?: string;
       RESEND_API_KEY?: string;
     }
   }
   ```

B. Move the augment behind a per-env conditional via the `Cloudflare.CapstoneEnv`
   interface that `wrangler types` already generates, and stop globally
   declaring portal-only secrets across all envs. (More invasive.)

Option A is the lowest-risk fix and matches the existing auth init contract.

## 4. [MEDIUM] Retire dead `STUDIO_ADMIN_TOKEN` binding

`worker-configuration.d.ts` lists `STUDIO_ADMIN_TOKEN: string` for every env
interface, but no source file references it (`grep -r STUDIO_ADMIN_TOKEN
astro-app/src` returns nothing). CLAUDE.md / `wrangler.jsonc:67-74` documents
that Story 24.1 retired this shared admin bearer in favor of project-membership
introspection (Story 24.1.5).

**Action**:
1. `wrangler secret delete STUDIO_ADMIN_TOKEN --name ywcc-capstone` (and the preview Worker).
2. Re-run `npx wrangler types -C astro-app`.
3. Confirm by grep — should be zero references in src and types.

## 5. [MEDIUM] Module-level cache audit (`src/lib/sanity.ts`)

**Rule** — *"Workers reuse isolates across requests. Module-level mutable
variables cause cross-request data leaks."*

`src/middleware.ts:42 _agreementRevCache` and `src/pages/api/portal/admin/acceptances.ts:55 membershipCache`
are explicitly designed as per-isolate caches with TTLs and are appropriate
under this rule (the cached data is not request-scoped — it's the *current
revision* / *project-membership flag*, both global). Keep these.

The eight caches in `src/lib/sanity.ts` (`_siteSettingsCache:422`,
`_sponsorsCache:465`, `_projectsCache:569`, `_testimonialsCache:627`,
`_eventsCache:668`, `_articlesCache:789`, `_articleCategoriesCache:898`,
`_authorsCache:982`) are also per-isolate immutable content caches keyed by the
build-time-pinned dataset, but their multi-tenant interaction deserves an
explicit invariant comment:

> Each Worker isolate (capstone vs rwc-us vs rwc-intl) is a *separate
> deployment* (different `name`), so cross-tenant leakage is impossible —
> isolates are not shared across Workers. Within one Worker the dataset is
> build-time pinned, so the cache key (none) is safe.

Worth adding a one-liner to each cache so the next reviewer doesn't have to
re-derive this.

# Optimize

## 6. [MEDIUM] Stream the markdown twin instead of buffering

`src/middleware.ts:319` — `const body = await twin.text()` reads the entire
markdown twin into memory just to (a) compute `x-markdown-tokens` and (b)
re-emit the body. Twins are bounded (HTML page sized) so it's not a memory
crash risk, but it doubles peak memory and slows TTFB.

If `x-markdown-tokens` is informational (consumed by AI agents), it could be
emitted from the *static asset's* file size at build time and stamped into the
response headers without buffering:

```ts
// Stream-through path
return new Response(twin.body, {
  status: twin.status,
  headers: {
    "content-type": "text/markdown; charset=utf-8",
    "vary": "Accept",
    "link": buildLinkHeader(pathname, true),
    "content-signal": AGENT_CONTENT_SIGNAL,
    "x-markdown-tokens": twin.headers.get("x-markdown-tokens") ?? "",
    ...(twin.headers.get("cache-control")
      ? { "cache-control": twin.headers.get("cache-control")! }
      : {}),
  },
});
```

Stamp `x-markdown-tokens` during the `astro-llms-md` postbuild
(`scripts/append-agent-headers.mjs`) into the static asset metadata so the
header is precomputed.

## 7. [MEDIUM] Cap user-controlled JSON body size

`src/pages/api/subscribe.ts:14` and `src/pages/api/portal/agreement/accept.ts:34`
read `await request.json()` with no `Content-Length` check. The runtime caps
request bodies eventually, but it's cheap to add a guard:

```ts
const contentLength = Number(request.headers.get('content-length') ?? '0');
if (contentLength > 10_000) {
  return jsonResponse({ success: false, error: 'Payload too large' }, 413);
}
```

10 KB is generous for a subscribe payload (~100 chars of email). For
`accept.ts` the body is empty — reject anything > 1 KB.

## 8. [LOW] Better Auth + KV `SESSION_CACHE` are two layers of the same cache

`src/lib/auth-config.ts:171-179` enables Better Auth's 5-min `cookieCache`
**and** middleware writes the session to KV with a 5-min TTL. Both serve the
same purpose (skip D1 on subsequent hits within the window). This is double
spending — a cookie cache hit means Better Auth's verification short-circuits
without reading KV, but the KV write still fires on every D1 fallback.

Pick one:

- **Drop KV `SESSION_CACHE`** — Better Auth's cookie cache is signed with
  `BETTER_AUTH_SECRET` and self-contained per-browser. Removes a binding, KV
  cost, and the KV-invalidation dance in `accept.ts:88` and the
  fire-and-forget writes in middleware.
- **Drop `cookieCache`** — keeps the cross-tab/cross-device cache (KV is
  shared) but slower on cold path.

Better Auth's cookie cache is the typical choice. The KV layer was
likely added before cookieCache was on; revisit.

## 9. [LOW] Module-level state has been *intentional* but undocumented

The module-level `let` for `_agreementRevCache` (middleware.ts:42) does have a
prose comment justifying it. The eight `lib/sanity.ts` caches do not. Each
needs a one-liner: *"Per-isolate, build-time-pinned dataset, immutable content
— safe per Workers isolate model."*

# Update

## 10. [MEDIUM] Add `observability.traces`

**Rule** — *"Enable Workers Logs and Traces before deploying to production."*

`wrangler.jsonc` enables `observability.logs` (head_sampling_rate: 1) on every
env, but no traces. Best practices recommends:

```jsonc
"observability": {
  "enabled": true,
  "logs": { "enabled": true, "head_sampling_rate": 1 },
  "traces": { "enabled": true, "head_sampling_rate": 0.01 }
}
```

A 1% trace sample on capstone gives distributed-trace visibility (D1 spans, KV
spans, DO RPC spans) without runaway cost. RWC content-only envs can keep
traces at the same low rate or drop them.

## 11. [MEDIUM] Switch console logging to structured JSON

**Rule** — *"Use structured JSON logging — `console.log(JSON.stringify({...}))` —
so logs are searchable. Use `console.error` for errors."*

Current calls in `middleware.ts`, `auth-config.ts`, `actions/index.ts`,
`api/portal/admin/acceptances.ts`, `api/auth/[...all].ts` use string + Error
concatenation. Workers Logs cannot filter on structured fields.

Suggested helper in `src/lib/log.ts`:

```ts
type LogFields = Record<string, string | number | boolean | null | undefined>;

export const log = {
  info: (msg: string, fields?: LogFields) =>
    console.log(JSON.stringify({ level: "info", msg, ...fields })),
  warn: (msg: string, fields?: LogFields) =>
    console.warn(JSON.stringify({ level: "warn", msg, ...fields })),
  error: (msg: string, err: unknown, fields?: LogFields) =>
    console.error(JSON.stringify({
      level: "error",
      msg,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      ...fields,
    })),
};
```

Replace ~16 ad-hoc `console.error` calls with `log.error("kv-write-failed", e, { sessionToken: hash(t) })`.

## 12. [LOW] Stale comment about adapter v13 imageService

`astro.config.mjs:155-163` keeps `imageService: 'compile'` to avoid a vitest
incompatibility with `cloudflare-binding`. Track that follow-up — file an issue
or schedule a verification once `@astrojs/cloudflare` ships a workerd-aware
vitest pool. Otherwise the comment will rot and nobody will revisit.

## 13. [LOW] `predeploy:assert-fresh` runs `rimraf dist` before build

`astro-app/package.json:14` — `rimraf dist` before each deploy is correct
behavior (avoids stale `dist/server/wrangler.json` polluting the deploy), but
it duplicates work because `astro build` already cleans `dist/server`. The
*specific* concern is `dist/client` cache — confirm with the Astro 6 release
notes whether `astro build` cleans `dist/client` reliably. If yes, drop the
predeploy step.

# Verification checklist

After the changes above, run:

```bash
# Type-check + binding consistency
npx wrangler types -C astro-app
git diff --quiet astro-app/worker-configuration.d.ts || echo "regenerated types — commit"

# Type compile (must pass with regenerated types)
npm -w astro-app run check

# Unit tests (vitest pool simulates bindings)
npm run test:unit

# Lint for floating promises
npx eslint --rule '{"@typescript-eslint/no-floating-promises":"error"}' astro-app/src
```

# Anti-patterns explicitly **not** found (good)

- ❌ `Math.random()` for security-sensitive values — none
- ❌ `passThroughOnException()` in production code — only in test mocks
- ❌ Hardcoded secrets in source / `wrangler.jsonc` — none (only public IDs)
- ❌ `Astro.locals.runtime.env` — fully migrated to `import { env } from 'cloudflare:workers'`
- ❌ `wrangler.toml` — uses `wrangler.jsonc` ✅
- ❌ Cloudflare REST API calls from Worker — all bindings (D1, KV, DO, ASSETS) ✅
- ❌ Hand-written `Env` *replacement* — only an *augmentation* over `wrangler types` output (review § 3 for the optionality fix)
- ❌ `nodejs_compat` missing — present ✅
- ❌ `compatibility_date` stale — 2026-04-01, ~30 days old ✅

---

# Estimated effort

| Item | Effort | Risk |
|------|--------|------|
| 1. `ctx.waitUntil()` migration | M (1–2 h) | Low — additive |
| 2. Regenerate types | XS (5 min) | None |
| 3. Optional secrets in env augment | S (30 min) | Low — type-only |
| 4. Retire `STUDIO_ADMIN_TOKEN` | XS (10 min) | None |
| 5. Cache invariant comments | XS (15 min) | None |
| 6. Stream markdown twin | M (1 h) | Low |
| 7. Body size caps | XS (15 min) | None |
| 8. Drop KV `SESSION_CACHE` (or document why both) | M–L (2–4 h) | Medium — auth path |
| 10. `observability.traces` | XS (5 min) | None |
| 11. Structured logging helper | M (1 h, one-off) | None |

Recommended sprint order: **2 → 4 → 10 → 3 → 7 → 1 → 11 → 6 → 8**.
