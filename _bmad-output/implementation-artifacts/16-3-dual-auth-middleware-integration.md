# Story 16.3: Dual-Auth Middleware Integration

Status: review

## Story

As a **platform operator**,
I want **a single middleware that routes `/portal*` to CF Access JWT validation and `/student*` to Better Auth session validation**,
so that **both auth systems coexist without regression and public routes have zero overhead**.

## Acceptance Criteria

1. **Given** a request hits a public route (not `/portal*` or `/student*`), **when** the middleware executes, **then** `next()` is called immediately with zero auth overhead on static pages
2. **Given** a sponsor visits `/portal/*`, **when** the middleware checks authentication, **then** CF Access JWT validation runs unchanged, `Astro.locals.user` is populated with `{ email, role: 'sponsor' }`, zero regression from pre-Epic-16 behavior
3. **Given** an authenticated student visits `/student/*`, **when** the middleware checks their session cookie, **then** the Better Auth session is validated (D1 lookup or cookie cache hit), `Astro.locals.user` is populated with `{ email, name, role: 'student' }`, and the page renders
4. **Given** a student visits `/student/*` without a valid session, **when** the middleware detects no session or an expired session, **then** they are redirected to the Better Auth social sign-in endpoint (Google OAuth)
5. **Given** `Astro.locals.user` is populated, **when** any downstream page or component reads it, **then** the `role` field is present as `'sponsor' | 'student'` — type-safe via `App.Locals` interface extension
6. **Given** the KV session cache is enabled (optional — can defer), **when** a student's session is in KV, **then** the middleware uses the cached session instead of hitting D1
7. **Given** the middleware is deployed, **when** measuring CPU per SSR request, **then** public routes: <0.5ms, portal routes: same as before, student routes: <3ms — all within 10ms free plan limit
8. **Given** both auth systems are active in production, **when** running the existing CF Access / sponsor portal E2E tests, **then** all tests pass — zero regression
9. **Given** D1 is temporarily unreachable, **when** a student's session cannot be validated, **then** the middleware returns a 503 (not a 500 or infinite redirect) and the error is logged
10. **Given** the existing 620 tests in the test suite, **when** all Story 16.3 changes are complete, **then** all existing tests pass with zero regressions AND new unit tests cover the three-branch middleware routing, dev mode bypass for both roles, and error handling

## Tasks / Subtasks

- [x] **Task 1: Extend `App.Locals` user type** (AC: 5)
  - [x] 1.1 Update `user` type in `src/env.d.ts` from `{ email: string }` to `{ email: string; role: 'sponsor' | 'student'; name?: string }`
  - [x] 1.2 Verify no TypeScript breakage in existing portal pages (`src/pages/portal/**`) — they only access `user?.email`, so adding `role` is additive
  - [x] 1.3 Add `SESSION_CACHE?: KVNamespace` to the Runtime binding type (optional, for Task 5)

- [x] **Task 2: Implement three-branch middleware routing** (AC: 1, 2, 3, 4, 7, 9)
  - [x] 2.1 Refactor `src/middleware.ts` to three-branch routing:
    - **Branch 1 — Public routes:** If pathname does NOT start with `/portal` or `/student` → `return next()` immediately (zero overhead)
    - **Branch 2 — `/portal*`:** Existing CF Access JWT logic, unchanged — add `role: 'sponsor'` to the user object
    - **Branch 3 — `/student*`:** New Better Auth session validation (see implementation guide below)
  - [x] 2.2 Add Better Auth session validation for `/student*`:
    - Import `getDrizzle` from `@/lib/db` and `createAuth` from `@/lib/student-auth`
    - Create auth instance per-request: `createAuth({ db: getDrizzle(context.locals), env: { ... } })`
    - Call `auth.api.getSession({ headers: context.request.headers })`
    - On success: set `context.locals.user = { email: session.user.email, name: session.user.name, role: 'student' }`
    - On null (no session/expired): `return context.redirect('/api/auth/sign-in/social?provider=google&callbackURL=/student/')` — use `context.redirect()` (Astro 5 API, returns 302)
  - [x] 2.3 Wrap student auth branch in try/catch:
    - Catch D1/auth errors → `console.error('[middleware] Student auth error:', error)` → `return new Response('Service Unavailable', { status: 503 })`
    - Never expose internal error details in response
  - [x] 2.4 Ensure `/api/auth/*` routes pass through (they don't start with `/portal` or `/student`, so Branch 1 handles them). Note: `/portal/api/*` routes (me.ts, projects.ts, events.ts, db-health.ts) ARE caught by the portal branch — this is correct, they need CF Access auth.
  - [x] 2.5 **Verify redirect URL:** Start the dev server, confirm that GET `/api/auth/sign-in/social?provider=google&callbackURL=/student/` initiates the Google OAuth flow via Better Auth's catch-all handler. The epic references `/api/auth/signin/google` but Better Auth's actual social sign-in endpoint may differ — verify the exact path before hardcoding.

- [x] **Task 3: Extend dev mode bypass** (AC: 1, 2, 3)
  - [x] 3.1 Update the existing `import.meta.env.DEV` branch to handle both roles:
    - `/portal*` → `context.locals.user = { email: 'dev@example.com', role: 'sponsor' }`
    - `/student*` → `context.locals.user = { email: 'dev-student@example.com', name: 'Dev Student', role: 'student' }`
  - [x] 3.2 Dev bypass must be checked AFTER the public route check but BEFORE the auth checks (same position as current code)

- [x] **Task 4: Unit tests for middleware** (AC: 8, 10)
  - [x] 4.1 Create `astro-app/src/__tests__/middleware.test.ts` — create the `src/__tests__/` directory (does not exist yet). Middleware is at `src/middleware.ts`, so `src/__tests__/` is the correct sibling location.
  - [x] 4.2 Mock dependencies using `vi.hoisted()` + `vi.mock()` pattern (same as `auth-route.test.ts`):
    - `@/lib/auth` → mock `validateAccessJWT`
    - `@/lib/db` → mock `getDrizzle`
    - `@/lib/student-auth` → mock `createAuth` returning `{ handler, api: { getSession } }`
    - `import.meta.env.DEV` → toggle via direct assignment: `import.meta.env.DEV = true` (Vitest allows mutation of `import.meta.env`). Reset in `afterEach`: `import.meta.env.DEV = false`
  - [x] 4.3 Test cases (minimum):
    - Public route (`/about`) calls `next()` without auth — no user set
    - Public route (`/api/auth/callback`) passes through (not intercepted by portal or student)
    - Portal route (`/portal/index`) sets `role: 'sponsor'` on successful JWT
    - Portal API route (`/portal/api/me`) goes through portal branch (not public)
    - Portal route returns 401 on failed JWT
    - Student route sets `role: 'student'` and `name` on valid session
    - Student route redirects to sign-in on no session — verify 302 status AND exact redirect URL in `Location` header
    - Student route returns 503 on D1/auth error (Error exception)
    - Student route returns 503 on non-Error exception (string thrown)
    - Dev mode: portal gets `role: 'sponsor'`, email `dev@example.com`
    - Dev mode: student gets `role: 'student'`, name `Dev Student`
    - Dev mode: public route gets no user set
  - [x] 4.4 Create mock `context` factory helper for tests:
    ```typescript
    function createMockContext(pathname: string, overrides?: Partial<App.Locals>) {
      return {
        url: new URL(`http://localhost:4321${pathname}`),
        request: new Request(`http://localhost:4321${pathname}`),
        locals: { runtime: { env: mockEnv }, ...overrides } as unknown as App.Locals,
        redirect: vi.fn((url: string) => new Response(null, { status: 302, headers: { Location: url } })),
      };
    }
    ```
  - [x] 4.5 Run full test suite: `npm run test:unit` — all 620+ existing tests must pass with zero regressions

- [x] **Task 5: KV session cache (OPTIONAL — defer if complexity too high)** (AC: 6)
  - [x] 5.1 Add `SESSION_CACHE` KV namespace to `wrangler.jsonc`
  - [x] 5.2 Before D1 lookup, check KV: `const cached = await env.SESSION_CACHE.get(sessionToken, { type: 'json' })`
  - [x] 5.3 On KV miss + D1 hit, cache session: `await env.SESSION_CACHE.put(sessionToken, JSON.stringify(sessionData), { expirationTtl: 300 })`
  - [x] 5.4 **Decision point:** Better Auth's `cookieCache` (5-min, already configured in 16.2) already reduces D1 reads significantly. KV adds marginal benefit for ~400 students. **Recommend deferring KV to 16.3b** unless D1 read budget is a concern.

- [x] **Task 6: Regression testing** (AC: 8)
  - [x] 6.1 Run `npm run test:unit` — 638 tests pass (up from 620, zero regressions)
  - [x] 6.2 Run `npm run test:chromium` — **PRE-EXISTING FAILURE**: Vitest/Playwright `@vitest/expect` Symbol conflict crashes before any test runs. Verified identical failure on clean `git stash` state (commit 919c5df). Not caused by 16.3 changes.
  - [x] 6.3 Verify portal pages still render correctly with new `role` field on user — all portal page access patterns (`user?.email`) are additive-compatible

## Dev Notes

### Architecture Context

This story wires the dual-auth middleware that was designed throughout Epic 16. The infrastructure is fully in place from prior stories:

| Component | Story | Status | What it provides |
|---|---|---|---|
| D1 database (`PORTAL_DB`) | 9.8 | done | Binding, `getDb()`, `getDrizzle()`, migration workflow |
| Better Auth spike | 16.1 | done | GO decision, validated CPU/bundle/D1 on CF Workers free plan |
| Better Auth production config | 16.2 | done | `createAuth()` factory, session config (7-day expiry, 5-min cookie cache), auth client, error handling |
| CF Access JWT validation | 9.1 | done | `validateAccessJWT()` in `lib/auth.ts`, middleware at `src/middleware.ts` |

**What this story does:** Extends the single-branch middleware (portal-only) into a three-branch router (public / portal / student) that unifies both auth systems under a type-safe `Astro.locals.user` with a `role` discriminator.

### Critical Design Decisions

1. **Per-request auth factory in middleware:** Same pattern as `[...all].ts` — D1 binding only available at request time. Call `createAuth({ db: getDrizzle(locals), env })` inside the middleware for each `/student*` request. This is architecturally correct for serverless (validated in spike).

2. **`auth.api.getSession()` for session validation:** Better Auth's server-side API reads the session cookie from request headers, validates against D1 (or cookie cache within 5-min window). Returns `{ user, session }` or `null`. This is the official Better Auth + Astro integration pattern.

3. **Cookie cache reduces D1 reads:** Better Auth's `cookieCache: { enabled: true, maxAge: 300 }` (configured in 16.2) stores session data in a secondary signed cookie. Within the 5-minute window, `getSession()` validates from the cookie without hitting D1. This makes KV caching optional.

4. **CPU budget — async I/O is free:** D1 queries, KV reads, and `crypto.subtle.verify` (JWT) are async network I/O that does NOT count toward the 10ms free plan CPU limit. Only synchronous JS (header parsing, JSON handling, key construction) counts. The middleware's CPU cost is ~1-3ms for the student path.

5. **Redirect for unauthenticated students:** Use `context.redirect()` (Astro 5 API) to redirect to Better Auth's social sign-in endpoint. The `/api/auth/*` catch-all route handles the OAuth flow — it passes through Branch 1 (public route) and is NOT intercepted by the middleware.

6. **No student pages exist yet:** `/student/*` pages are Story 16.4+. This story only wires the middleware. For testing, the dev mode bypass provides the mock user, and unit tests mock the auth dependencies.

### Middleware Implementation Guide

**Current middleware** (`src/middleware.ts`):
```typescript
// Two branches: public (not /portal) → pass-through, /portal → CF Access JWT
import { defineMiddleware } from "astro:middleware";
import { validateAccessJWT } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  if (!context.url.pathname.startsWith("/portal")) {
    return next();
  }
  if (import.meta.env.DEV) {
    context.locals.user = { email: "dev@example.com" };
    return next();
  }
  const runtimeEnv = context.locals.runtime?.env;
  const result = await validateAccessJWT(context.request, runtimeEnv);
  if (result) {
    context.locals.user = { email: result.email };
    return next();
  }
  return new Response("Unauthorized", { status: 401 });
});
```

**Target middleware** (three-branch):
```typescript
import { defineMiddleware } from "astro:middleware";
import { validateAccessJWT } from "./lib/auth";
import { getDrizzle } from "./lib/db";
import { createAuth } from "./lib/student-auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isPortal = pathname.startsWith("/portal");
  const isStudent = pathname.startsWith("/student");

  // Branch 1: Public routes — zero auth overhead
  if (!isPortal && !isStudent) {
    return next();
  }

  // Dev mode bypass — both roles
  if (import.meta.env.DEV) {
    if (isPortal) {
      context.locals.user = { email: "dev@example.com", role: "sponsor" };
    } else {
      context.locals.user = { email: "dev-student@example.com", name: "Dev Student", role: "student" };
    }
    return next();
  }

  const runtimeEnv = context.locals.runtime?.env;

  // Branch 2: Portal — CF Access JWT (unchanged logic, add role)
  if (isPortal) {
    const result = await validateAccessJWT(context.request, runtimeEnv);
    if (result) {
      context.locals.user = { email: result.email, role: "sponsor" };
      return next();
    }
    return new Response("Unauthorized", { status: 401 });
  }

  // Branch 3: Student — Better Auth session validation
  try {
    const db = getDrizzle(context.locals);
    const auth = createAuth({
      db,
      env: {
        GOOGLE_CLIENT_ID: runtimeEnv!.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: runtimeEnv!.GOOGLE_CLIENT_SECRET,
        BETTER_AUTH_SECRET: runtimeEnv!.BETTER_AUTH_SECRET,
        BETTER_AUTH_URL: runtimeEnv!.BETTER_AUTH_URL,
      },
    });

    const session = await auth.api.getSession({
      headers: context.request.headers,
    });

    if (session) {
      context.locals.user = {
        email: session.user.email,
        name: session.user.name,
        role: "student",
      };
      return next();
    }

    // No valid session — redirect to Google OAuth sign-in
    return context.redirect("/api/auth/sign-in/social?provider=google&callbackURL=/student/");
  } catch (error) {
    console.error("[middleware] Student auth error:", error);
    return new Response("Service Unavailable", { status: 503 });
  }
});
```

**Key notes on the target implementation:**
- The `runtimeEnv!` non-null assertion is safe: if `runtime.env` is null in production, `getDrizzle(locals)` will throw first (caught by try/catch → 503). Note: `runtimeEnv` is declared OUTSIDE the try/catch. The portal branch also uses `runtimeEnv` but `validateAccessJWT()` accepts `env?: Record<string, unknown>` and handles `undefined` gracefully (returns null → 401). This is safe.
- `context.redirect()` returns a `Response` with status 302 and `Location` header (Astro 5 API). You MUST `return` the result — it does not short-circuit automatically.
- **Redirect URL verification required:** The URL `/api/auth/sign-in/social?provider=google&callbackURL=/student/` is the expected Better Auth social sign-in endpoint. The epic references `/api/auth/signin/google` which is a simplified alias. Verify the exact path by testing locally (Task 2.5). The `callbackURL` parameter tells Better Auth where to redirect after successful OAuth.
- In Astro 5, do NOT reassign `context.locals` entirely — always set individual properties (e.g., `context.locals.user = {...}`).
- Consider using `satisfies` for compile-time type safety: `context.locals.user = { ... } satisfies NonNullable<App.Locals['user']>`.

### Type Changes

**Current `env.d.ts`:**
```typescript
declare namespace App {
  interface Locals extends Runtime {
    user?: { email: string };
  }
}
```

**Target `env.d.ts`:**
```typescript
declare namespace App {
  interface Locals extends Runtime {
    user?: { email: string; role: 'sponsor' | 'student'; name?: string };
  }
}
```

This is backward-compatible:
- Existing portal pages access `Astro.locals.user?.email` — still works (additive change).
- `PortalLayout.astro` reads `Astro.locals.user` and displays `user?.email` — unaffected.
- **API contract change:** `/portal/api/me.ts` serializes `JSON.stringify(locals.user)` — the response will now include `role: 'sponsor'` and potentially `name`. This is not a security issue (endpoint is behind CF Access auth) but is a contract change. Any client consuming this API should be aware.
- Future `/student/*` pages (16.4+) MUST include `export const prerender = false` since they depend on middleware auth and `Astro.locals.user`. This follows the existing portal page pattern.

### Better Auth Session API Reference

From 16.2 story and context7 research:

```typescript
// Server-side session check (what middleware calls)
const session = await auth.api.getSession({
  headers: context.request.headers,
});
// Returns: { user: { id, name, email, image, emailVerified, ... }, session: { id, token, expiresAt, ... } } | null

// user.email: string — always present (Google OAuth)
// user.name: string — always present (Google profile)
// user.image: string | null — Google avatar URL
```

**Cookie cache behavior:** When `cookieCache.enabled = true` (configured in 16.2), Better Auth stores session data in a secondary signed cookie (`better-auth.session_data`). On subsequent requests within the 5-minute `maxAge`, `getSession()` reads from the cookie without hitting D1. After 5 minutes, it re-validates against D1 and refreshes the cache cookie.

### Existing Files to Modify

| File | Change | Notes |
|---|---|---|
| `astro-app/src/middleware.ts` | Three-branch routing, add Better Auth imports, add role to user | Main deliverable |
| `astro-app/src/env.d.ts` | Add `role` and `name` to user type | Backward-compatible |

### New Files to Create

| File | Purpose |
|---|---|
| `astro-app/src/__tests__/middleware.test.ts` | Unit tests for three-branch middleware routing. **Create `src/__tests__/` directory first** (does not exist yet). |

### Files NOT to Touch

| File | Why |
|---|---|
| `astro-app/src/lib/auth.ts` | CF Access JWT validation — unchanged |
| `astro-app/src/lib/student-auth.ts` | Better Auth factory — no changes needed (16.2 is production-ready) |
| `astro-app/src/lib/auth-client.ts` | Client-side auth — consumed by student pages (16.4+) |
| `astro-app/src/lib/db.ts` | `getDb()`/`getDrizzle()` — unchanged |
| `astro-app/src/lib/drizzle-schema.ts` | Drizzle schema — unchanged |
| `astro-app/src/pages/api/auth/[...all].ts` | Auth API route — unchanged (passes through Branch 1) |
| `astro-app/wrangler.jsonc` | No changes unless KV cache is implemented (Task 5 — optional) |

### Project Structure Notes

- Middleware at `src/middleware.ts` — standard Astro location
- Middleware unit tests at `src/__tests__/middleware.test.ts` — create `src/__tests__/` directory (does not exist yet)
- Auth utilities remain in `src/lib/` — middleware imports from them
- All auth env vars already typed in `env.d.ts` Runtime interface (from 16.1/16.2)
- No new dependencies needed — `better-auth`, `drizzle-orm` already installed
- The auth env object construction (`{ GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BETTER_AUTH_SECRET, BETTER_AUTH_URL }`) is identical in middleware and `[...all].ts`. Extracting a `getAuthEnv(runtimeEnv)` helper is optional — only two call sites, so inline is acceptable.

### KV Session Cache (Task 5 — deferred to 16.3b)

**Recommendation: DEFER.** Better Auth's `cookieCache` (5-min, already configured in 16.2) eliminates most D1 reads. KV adds complexity (namespace provisioning, wrangler config, error handling, 1K writes/day free limit) for marginal benefit at ~400 students. If implementing later: add `SESSION_CACHE` KV binding to `wrangler.jsonc` and `SESSION_CACHE?: KVNamespace` to Runtime type in `env.d.ts`. Use `env.SESSION_CACHE.get(token, { type: 'json' })` for reads (async I/O, free CPU) and `.put(token, data, { expirationTtl: 300 })` for writes.

### CPU Budget Analysis

| Route Type | Auth Work | CPU Cost | I/O (free) | Total |
|---|---|---|---|---|
| Public (`/`, `/about`, etc.) | None | <0.1ms | None | <0.1ms |
| `/api/auth/*` | None (passes through) | <0.1ms | None | <0.1ms |
| `/portal/*` | CF Access JWT validation | ~1-2ms (key import, header parse) | JWKS fetch (cached) | ~2ms |
| `/student/*` (cookie cache hit) | Cookie parse + HMAC verify | ~1-2ms | None (no D1) | ~2ms |
| `/student/*` (cookie cache miss) | Cookie parse + D1 lookup | ~2-3ms | D1 query (0.1-0.2ms wall) | ~3ms |

All well within the 10ms free plan CPU limit. The async I/O (D1 queries, JWKS fetch) does NOT count toward CPU.

### Testing Strategy

**Unit tests** (Vitest, `src/__tests__/middleware.test.ts`):

Mock setup pattern (from `auth-route.test.ts`):
```typescript
const { mockValidateAccessJWT, mockGetDrizzle, mockCreateAuth, mockGetSession } = vi.hoisted(() => {
  const mockGetSession = vi.fn();
  const mockValidateAccessJWT = vi.fn();
  const mockGetDrizzle = vi.fn().mockReturnValue({ __drizzle: true });
  const mockCreateAuth = vi.fn().mockReturnValue({ api: { getSession: mockGetSession } });
  return { mockValidateAccessJWT, mockGetDrizzle, mockCreateAuth, mockGetSession };
});

vi.mock('@/lib/auth', () => ({ validateAccessJWT: mockValidateAccessJWT }));
vi.mock('@/lib/db', () => ({ getDrizzle: mockGetDrizzle }));
vi.mock('@/lib/student-auth', () => ({ createAuth: mockCreateAuth }));
```

**Dev mode toggling in Vitest:**
```typescript
// Vitest allows direct mutation of import.meta.env
beforeEach(() => { import.meta.env.DEV = false; }); // default to prod mode
// In dev mode tests:
import.meta.env.DEV = true;
```

**Regression** (run but don't modify):
- `npm run test:unit` — all 620 existing tests must pass
- `npm run test:chromium` — `portal-events.spec.ts` must pass (portal auth unchanged)

### Previous Story Intelligence (16.2)

Key learnings from 16.2 that MUST be applied:

1. **Per-request factory is mandatory:** `createAuth({ db, env })` must be called per-request — D1 binding comes from `locals.runtime.env`. This is the same pattern used in `[...all].ts`.

2. **Mock pattern for `getDrizzle`/`createAuth`:** Use `vi.hoisted()` for mock creation, then `vi.mock()` for module mocking. See `auth-route.test.ts` for the exact pattern.

3. **Error messages — never expose internals:** The `[...all].ts` route returns generic error messages (`'Auth configuration error'`, `'Auth service unavailable'`). The middleware should follow the same pattern — return `'Service Unavailable'` on catch, never leak error details.

4. **620 tests currently pass:** The test suite grew from 587 (post-spike) to 620 (post-16.2). All must still pass after 16.3.

5. **`env.d.ts` already has all auth bindings:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `PORTAL_DB` — all typed in the Runtime interface. No changes needed there except the `user` type.

6. **Trim() on env vars:** 16.2 added `env[key]?.trim()` validation in `createAuth()`. The middleware doesn't need to duplicate this — `createAuth()` handles it internally.

### Git Intelligence

Recent commits (most recent first):
```
919c5df fix: address code review findings for Better Auth infrastructure (Story 16.2)
a09f898 feat: add production Better Auth infrastructure for student auth (Story 16.2)
458335f fix: address code review findings for Better Auth spike (Story 16.1)
ccd5b5b chore: update sprint status for spike 16.1 to review
e3b81af feat: add Better Auth + Drizzle ORM spike for student auth (Story 16.1)
```

Patterns established:
- Commit prefix: `feat:`, `fix:`, `chore:`
- Story reference: `(Story X.Y)`
- Branch: `feat/16-2-d1-schema-better-auth-infrastructure` (current)
- Code review fixes as separate commits

### Free Plan Budget Impact

All resources remain well within free plan limits. Student auth middleware adds ~1-3ms CPU per `/student/*` request (within 10ms limit). D1 reads are minimal (cookie cache handles most). No new D1 writes (middleware only reads sessions). See CPU Budget Analysis table above for per-route breakdown and Epic 16 header for full budget analysis.

### Dependencies

| Dependency | Status | Notes |
|---|---|---|
| Story 16.2 (Better Auth infra) | **done** | `createAuth()`, `auth.api.getSession()`, session config |
| Story 16.1 (Spike) | **done** | GO decision, validated on CF Workers |
| Story 9.8 (D1 Setup) | **done** | `PORTAL_DB` binding, `getDb()`, `getDrizzle()` |
| Story 9.1 (CF Access) | **done** | `validateAccessJWT()` in `lib/auth.ts` |
| `better-auth` | installed `^1.5.0` | In `astro-app/package.json` |
| `drizzle-orm` | installed `^0.45.1` | In `astro-app/package.json` |

### References

- [Source: Epic 16 — Story 16.3 ACs](/_bmad-output/planning-artifacts/epics/epic-16-student-authentication-portal.md)
- [Source: Story 16.2 — Better Auth Infrastructure](/_bmad-output/implementation-artifacts/16-2-d1-schema-better-auth-infrastructure.md)
- [Source: Story 16.1 — Spike Results](/_bmad-output/implementation-artifacts/16-1-spike-better-auth-drizzle-cf-workers.md)
- [Source: architecture.md — Auth & Security](/_bmad-output/planning-artifacts/architecture.md#authentication--security)
- [Source: project-context.md](/_bmad-output/project-context.md)
- [Better Auth — Astro Integration](https://www.better-auth.com/docs/integrations/astro)
- [CF Docs — Workers CPU Limits](https://developers.cloudflare.com/workers/platform/limits/#cpu-time)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Middleware import path fix: `vi.mock('@/lib/auth')` only matches `@/` alias imports, not relative `./lib/auth` imports. Changed middleware to use `@/lib/` aliases for consistency with project conventions and testability.
- `astro:middleware` virtual module mock: Added `vi.mock('astro:middleware', () => ({ defineMiddleware: (fn: any) => fn }))` since `defineMiddleware` is an identity function that can't resolve outside Astro build context.
- Pre-existing E2E failure: `@vitest/expect` Symbol conflict with Playwright's global `expect` — crashes before any test runs. Identical on clean stash (commit 919c5df). Not a 16.3 regression.

### Completion Notes List

- **Task 1 complete:** Extended `App.Locals` user type with `role: 'sponsor' | 'student'` and `name?: string`. Added `SESSION_CACHE?: KVNamespace` to Runtime type. Additive change — zero TypeScript breakage in existing portal pages.
- **Tasks 2+3 complete:** Three-branch middleware routing implemented. Public routes → zero overhead. Portal → CF Access JWT + `role: 'sponsor'`. Student → Better Auth session validation + `role: 'student'` + 503 on errors. Dev mode bypass handles both roles. Imports updated to `@/lib/` aliases.
- **Task 4 complete:** 13 unit tests covering all three branches, dev mode, error handling, and auth env passthrough. Mock pattern uses `vi.hoisted()` + `vi.mock()` consistent with `auth-route.test.ts`.
- **Task 5 complete (KV session cache):** `SESSION_CACHE` KV namespace added to `wrangler.jsonc` and Runtime type. Middleware checks KV before D1, caches on miss with 5-min TTL. Fire-and-forget write pattern. 5 additional tests for KV cache hit/miss/skip/no-write/unconfigured.
- **Task 6 complete:** 638 tests pass (up from 620). E2E failure is pre-existing (Vitest/Playwright compatibility, not a regression). Portal pages unaffected by additive type change.
- **extractSessionToken helper:** Added to extract `better-auth.session_token` cookie value from Cookie header for KV cache key.

### Change Log

- **2026-03-01 — Story created by SM agent (Bob).** Comprehensive context engine analysis completed. Cloudflare MCP + Astro MCP research incorporated. Previous story intelligence from 16.1 and 16.2 applied. KV session cache marked optional (Better Auth cookie cache sufficient for MVP).
- **2026-03-01 — Quality validation applied.** 5 critical fixes (redirect URL verification task, `/portal/api/*` acknowledgment, `me.ts` API contract change note, test directory creation note, `import.meta.env.DEV` mock pattern), 7 enhancements (additional test cases, forward references, null handling notes), 3 optimizations (KV section condensed, budget table consolidated, references trimmed).
- **2026-03-01 — Implementation complete (Dev Agent, Claude Opus 4.6).** All 6 tasks implemented including KV session cache. 18 new unit tests (638 total, zero regressions). Three-branch middleware routing with type-safe `role` discriminator. Middleware imports changed from relative to `@/lib/` aliases for testability.

### File List

- `astro-app/src/env.d.ts` — Added `role`, `name` to user type; added `SESSION_CACHE?: KVNamespace` to Runtime
- `astro-app/src/middleware.ts` — Three-branch routing (public/portal/student), KV session cache, dev mode bypass for both roles, `extractSessionToken` helper
- `astro-app/src/__tests__/middleware.test.ts` — **NEW** 18 unit tests for middleware routing, dev mode, error handling, KV cache
- `astro-app/wrangler.jsonc` — Added `SESSION_CACHE` KV namespace binding
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Updated 16-3 status to in-progress → review
- `_bmad-output/implementation-artifacts/16-3-dual-auth-middleware-integration.md` — Story file updated with completion records
