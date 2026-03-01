# Story 16.2: D1 Schema & Better Auth Infrastructure

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **student user**,
I want **a production-ready authentication system using Better Auth with Google OAuth and D1 session storage**,
so that **I can securely sign in with my @njit.edu Google account and access student portal pages with persistent sessions**.

## Acceptance Criteria

1. **Given** the spike code from Story 16.1 exists, **when** the developer refactors `student-auth.ts` to use the shared `getDrizzle()` instance from `db.ts`, **then** there is a single Drizzle ORM initialization per request (no duplicate `drizzle()` calls) and all auth queries use the shared instance
2. **Given** Better Auth is configured for production, **when** a student signs in via Google OAuth, **then** the OAuth flow completes successfully: authorization redirect → Google consent → callback → D1 user upsert → session cookie set → redirect to `/student/`
3. **Given** a valid session cookie exists, **when** Better Auth validates the session via `auth.api.getSession()`, **then** the session data (user email, name, id) is returned within the 10ms CPU budget
4. **Given** a session cookie is tampered with (modified, truncated, or forged), **when** Better Auth validates the session, **then** the validation returns null/error and the user is treated as unauthenticated (no crash, no data leak)
5. **Given** the Google OAuth provider is temporarily unavailable (network error, Google outage), **when** a student attempts to sign in, **then** the auth route returns an appropriate HTTP error (502 or 503) with a user-friendly error message — no unhandled exceptions or stack traces exposed
6. **Given** the D1 database is unreachable (binding error, D1 outage), **when** any auth operation (sign-in, session lookup, sign-out) is attempted, **then** the operation fails gracefully with an HTTP 503 response — no unhandled promise rejections
7. **Given** a student's Google account is suspended or deleted after they created a session, **when** their existing session cookie is validated, **then** the session remains valid until expiry (Better Auth does not re-validate Google tokens on session lookup — this is expected behavior documented in dev notes)
8. **Given** the auth client module is created, **when** imported in a student page, **then** it provides typed `authClient.signIn.social()`, `authClient.signOut()`, and `authClient.getSession()` methods pointing to `/api/auth`
9. **Given** the production auth configuration, **when** session options are set, **then** `expiresIn` is 7 days, `updateAge` is 1 day, and cookie cache is enabled with 5-minute maxAge to minimize D1 reads
10. **Given** the existing 587+ tests in the test suite, **when** all Story 16.2 changes are complete, **then** all existing tests pass with zero regressions AND new unit tests cover: `createAuth()` factory, `getDrizzle()` shared instance, auth client configuration, and error handling paths

## Tasks / Subtasks

- [x] **Task 1: Consolidate Drizzle instance — shared `getDrizzle()` usage** (AC: 1)
  - [x] 1.1 Refactor `student-auth.ts` to accept a Drizzle instance instead of creating its own via `drizzle(env.PORTAL_DB, { schema })`
  - [x] 1.2 Update `createAuth()` signature: accept `{ db: DrizzleD1Database, env: AuthEnv }` where `db` comes from `getDrizzle(locals)`
  - [x] 1.3 Update `[...all].ts` API route to call `getDrizzle(locals)` once and pass to `createAuth()`
  - [x] 1.4 Remove duplicate `drizzle()` import from `student-auth.ts` — only `db.ts` should create Drizzle instances
  - [x] 1.5 Verify the shared Drizzle instance works with Better Auth's `drizzleAdapter`

- [x] **Task 2: Production Better Auth configuration** (AC: 2, 9)
  - [x] 2.1 Add session configuration to `createAuth()`: `expiresIn: 60 * 60 * 24 * 7` (7 days), `updateAge: 60 * 60 * 24` (1 day), `cookieCache: { enabled: true, maxAge: 5 * 60 }` (5 min)
  - [x] 2.2 Add `trustedOrigins` configuration for production URLs (ywcc-capstone.pages.dev + custom domain if applicable)
  - [x] 2.3 Remove spike comments/TODOs — make `student-auth.ts` production-ready
  - [x] 2.4 Validate BETTER_AUTH_URL is set correctly per environment (local: `http://localhost:4321`, preview: `https://<branch>.ywcc-capstone.pages.dev`, production: production URL)

- [x] **Task 3: Auth client module for student pages** (AC: 8)
  - [x] 3.1 Create `astro-app/src/lib/auth-client.ts` with `createAuthClient()` from `better-auth/client`
  - [x] 3.2 Configure `baseURL` to use relative path `/api/auth` (same-origin, no env var needed)
  - [x] 3.3 Export typed `authClient` instance with `signIn.social({ provider: 'google' })`, `signOut()`, `getSession()` methods
  - [x] 3.4 This module will be imported by student pages (Story 16.3+) for client-side auth interactions

- [x] **Task 4: Error handling and edge cases** (AC: 4, 5, 6, 7)
  - [x] 4.1 Add try/catch wrapper in `[...all].ts` around `auth.handler(request)` — catch D1 connection errors and return 503
  - [x] 4.2 Add try/catch wrapper for `createAuth()` initialization — catch missing env vars and return 500 with descriptive message (no secrets in response)
  - [x] 4.3 Validate that tampered session cookies return null from `getSession()` (Better Auth handles this internally via HMAC signature verification — verified by design)
  - [x] 4.4 Document in dev notes: Google account suspension does NOT invalidate existing sessions (Better Auth validates cookie signature + D1 session record, not Google token validity)
  - [x] 4.5 Ensure no unhandled promise rejections in auth flow — all async paths have error boundaries

- [x] **Task 5: Token encryption evaluation** (AC: 1 — from 16.1 TODO)
  - [x] 5.1 Evaluate whether OAuth tokens (access_token, refresh_token, id_token) in the `account` table need encryption at rest
  - [x] 5.2 Decision criteria: Google tokens are short-lived (1hr access, ~6mo refresh). D1 is encrypted at rest by Cloudflare. Token theft requires D1 API access which means the attacker already has the Cloudflare account. **Decision: skip app-level encryption, document rationale.**
  - [x] 5.3 N/A — encryption not needed (see 5.2)
  - [x] 5.4 Document decision in dev notes section regardless of outcome

- [x] **Task 6: Unit tests** (AC: 10)
  - [x] 6.1 Create `astro-app/src/lib/__tests__/student-auth.test.ts`: 13 tests covering factory, env validation, session config, social provider, basePath, trustedOrigins
  - [x] 6.2 Create `astro-app/src/lib/__tests__/auth-client.test.ts`: 5 tests covering exports, signIn/signOut/getSession methods, baseURL
  - [x] 6.3 Create `astro-app/src/lib/__tests__/db.test.ts`: 5 tests covering getDb() binding access, getDrizzle() instance creation, error on missing binding
  - [x] 6.4 Run full test suite: `npm run test:unit` — 620 passed, 0 failed, 3 skipped. Zero regressions (was 587 → now 620 = +33 new tests)

## Dev Notes

### Architecture Context

This story builds production-ready auth infrastructure on the validated spike from Story 16.1. The spike confirmed:

- **GO decision**: Better Auth + Drizzle ORM runs on CF Workers free plan
- **CPU**: ~3-5ms per auth request (well within 10ms limit)
- **D1 latency**: 0.1-0.2ms per session lookup
- **Bundle**: Auth adds only 55KB to the 2.7MB compressed worker
- **Cold start**: 345ms total (pre-existing, not auth-caused)
- **No polyfills needed**: Better Auth runs natively on CF Workers

The dual-auth architecture is documented in `docs/authentication-strategy.md`:
- **Sponsors** (`/portal/*`): Cloudflare Access edge auth + JWT middleware (existing, unchanged)
- **Students** (`/student/*`): Better Auth + D1 sessions (this story builds the infra, Story 16.3 wires the middleware)

### Critical Design Decisions

1. **Per-request auth factory pattern**: D1 binding only available at request time → `createAuth(db, env)` called per-request. This is architecturally correct for serverless (confirmed in spike).

2. **Google OAuth only (no email/password)**: `bcrypt` hashing requires 50-200ms CPU — exceeds free plan 10ms limit. All NJIT students have Google accounts (@njit.edu). No password auth = no password hashing = fits CPU budget.

3. **Session strategy — D1 database sessions**: Cookie contains session token, validated against D1 `session` table. Cookie cache (5-min) reduces D1 reads. Better Auth handles HMAC cookie signing via `BETTER_AUTH_SECRET`.

4. **Shared Drizzle instance**: The spike created a separate `drizzle()` call in `student-auth.ts` (marked as TODO). This story consolidates to use `getDrizzle(locals)` from `db.ts` to avoid duplicate ORM initialization.

5. **No `better-auth-cloudflare` package**: The spike validated that Better Auth works natively on CF Workers without the third-party `better-auth-cloudflare` wrapper. KV session caching, rate limiting, and geolocation tracking are features for future consideration — not needed for MVP. Keep dependency surface minimal.

6. **Token encryption decision**: OAuth tokens in the `account` table are short-lived (Google access tokens expire in 1 hour). D1 is encrypted at rest by Cloudflare infrastructure. App-level encryption adds complexity without meaningful security improvement for this use case. Document decision and revisit if storing long-lived sensitive data.

### Spike Code Locations (modify in-place)

| File | Spike State | 16.2 Action |
|------|-------------|-------------|
| `astro-app/src/lib/student-auth.ts` | Working but creates own Drizzle instance | Refactor to accept shared Drizzle, add session config, remove spike TODOs |
| `astro-app/src/lib/drizzle-schema.ts` | Production-ready (4 tables, relations, indexes) | No changes needed |
| `astro-app/src/lib/db.ts` | Has `getDb()` + `getDrizzle()` | No changes needed — already correct |
| `astro-app/src/pages/api/auth/[...all].ts` | Working but no error handling | Add try/catch, use shared Drizzle |
| `astro-app/src/env.d.ts` | Has all auth env vars typed | No changes needed |
| `astro-app/migrations/0001_student_auth.sql` | Production-ready DDL | No changes needed |
| `astro-app/wrangler.jsonc` | Has PORTAL_DB binding | No changes needed |

### New Files to Create

| File | Purpose |
|------|---------|
| `astro-app/src/lib/auth-client.ts` | Client-side Better Auth client for student pages |
| `astro-app/src/lib/__tests__/student-auth.test.ts` | Unit tests for auth factory |
| `astro-app/src/lib/__tests__/auth-client.test.ts` | Unit tests for auth client |

### Files NOT to Touch (Story 16.3 scope)

| File | Why it's 16.3 |
|------|---------------|
| `astro-app/src/middleware.ts` | Middleware extension (dual-auth routing) is Story 16.3 |
| `astro-app/src/lib/auth.ts` | CF Access JWT validation — remains unchanged |
| Student page files (`/student/*`) | Student portal pages are Story 16.4+ |

### Project Structure Notes

- Follows monorepo structure: all auth code in `astro-app/src/lib/`
- Tests follow 4-layer architecture: unit tests in `src/lib/__tests__/`
- Schema follows existing pattern: Drizzle schema alongside Sanity types in `src/lib/`
- API route follows Astro pattern: `src/pages/api/auth/[...all].ts` with `prerender = false`
- Env vars typed in `env.d.ts` Runtime interface (Cloudflare Workers bindings pattern)

### Better Auth API Reference (from context7 research)

**Server-side session check (for middleware in 16.3):**
```typescript
const session = await auth.api.getSession({
  headers: context.request.headers,
});
// Returns { user: { id, name, email, ... }, session: { id, token, expiresAt, ... } } or null
```

**Client-side auth client:**
```typescript
import { createAuthClient } from 'better-auth/client';
export const authClient = createAuthClient({
  baseURL: '/api/auth', // relative path works for same-origin
});
// authClient.signIn.social({ provider: 'google' })
// authClient.signOut()
// authClient.getSession()
```

**Session configuration options:**
```typescript
betterAuth({
  session: {
    expiresIn: 60 * 60 * 24 * 7,  // 7 days
    updateAge: 60 * 60 * 24,       // refresh session every 24h
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,              // 5-minute cookie cache → reduces D1 reads
    },
  },
});
```

### Free Plan Budget Impact (from spike analysis)

| Resource | Free Limit | Story 16.2 Impact | Cumulative |
|----------|-----------|-------------------|------------|
| Worker CPU | 10ms/request | ~3-5ms for auth check | Within budget |
| D1 reads | 5M/day | ~200/day (session lookups, indexed) | 25,000x headroom |
| D1 writes | 100K/day | ~50/day (logins, session creates) | 2,000x headroom |
| D1 storage | 5 GB | ~5 MB (400 users + sessions) | 1,000x headroom |
| Bundle size | — | +55KB auth chunk | Negligible |

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Story 9.8 (D1 Database Setup) | **done** | PORTAL_DB binding, getDb(), migration workflow |
| Story 16.1 (Spike) | **done** | GO decision, spike code in place, validated on CF Workers |
| `better-auth` npm package | **installed** `^1.5.0` (from spike) | Already in astro-app/package.json |
| `drizzle-orm` npm package | **installed** `^0.45.1` (from spike) | Already in astro-app/package.json |
| Google OAuth credentials | **configured** (from spike) | In `.dev.vars` + CF Pages secrets |
| `BETTER_AUTH_SECRET` | **configured** (from spike) | In `.dev.vars` + CF Pages secrets |

### Previous Story Intelligence (16.1 Spike)

Key learnings from the spike that MUST be applied:

1. **Per-request factory is mandatory**: D1 binding comes from `locals.runtime.env`, only available during request handling. Cannot create a module-level auth instance.

2. **Preview environment secrets**: CF Pages preview deployments require secrets set separately with `npx wrangler pages secret put <name> --env preview`. Production secrets are NOT inherited.

3. **`wrangler.jsonc` CF_ACCESS_AUD**: Moved from `vars` to dashboard-only secret during spike (was causing binding conflict). Don't add it back to wrangler.jsonc.

4. **Test gap from spike**: No unit tests written for `drizzle-schema.ts`, `student-auth.ts`, `[...all].ts`. This story must fill that gap.

5. **All 587 existing tests passed**: Zero regressions during spike — the auth code is isolated from existing functionality.

### Git Intelligence

Recent commits (most recent first):
```
458335f fix: address code review findings for Better Auth spike (Story 16.1)
ccd5b5b chore: update sprint status for spike 16.1 to review
e3b81af feat: add Better Auth + Drizzle ORM spike for student auth (Story 16.1)
c307aa2 fix: address code review findings for D1 database setup (Story 9.8)
a484fb5 feat: add Cloudflare D1 database setup and portal schema (Story 9.8)
```

Patterns established:
- Commit prefix convention: `feat:`, `fix:`, `chore:`, `docs:`
- Story reference in commit message: `(Story X.Y)`
- Code review fixes as separate commits after initial implementation
- Branch naming: `spike/16-1-better-auth-drizzle-cf-workers` (current branch)

### References

- [Source: Story 16.1 Spike Results](/_bmad-output/implementation-artifacts/16-1-spike-better-auth-drizzle-cf-workers.md)
- [Source: Story 9.8 D1 Database Setup](/_bmad-output/implementation-artifacts/9-8-cloudflare-d1-database-setup.md)
- [Source: architecture.md — Authentication & Security](/_bmad-output/planning-artifacts/architecture.md#authentication--security)
- [Source: docs/authentication-strategy.md — Dual-auth architecture](docs/authentication-strategy.md)
- [Source: project-context.md — Testing Rules, Framework Rules](/_bmad-output/project-context.md)
- [Better Auth Docs — Astro Integration](https://www.better-auth.com/docs/integrations/astro)
- [Better Auth Docs — Session Management](https://www.better-auth.com/docs/concepts/session-management)
- [Better Auth Cloudflare (context7)](https://github.com/zpg6/better-auth-cloudflare)
- [Drizzle ORM D1 Adapter (context7)](https://orm.drizzle.team/docs/get-started/d1-new)
- [CF Docs: D1 Getting Started](https://developers.cloudflare.com/d1/get-started/)
- [CF Docs: Workers Free Plan Limits](https://developers.cloudflare.com/workers/platform/limits/)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

### Completion Notes List

- **Session cookie tampering (AC 4):** Better Auth validates cookies via HMAC signature using `BETTER_AUTH_SECRET`. Tampered cookies return `null` from `getSession()` — no crash, no data leak. This is internal to Better Auth and verified by design.
- **Google account suspension (AC 7):** Better Auth does NOT re-validate Google tokens on session lookup. Session validation checks cookie signature + D1 session record only. If a student's Google account is suspended after login, their existing session remains valid until expiry. This is expected behavior — documented here as per AC 7.
- **Token encryption decision (Task 5):** App-level encryption of OAuth tokens (access_token, refresh_token, id_token) in the `account` table is **not needed**. Rationale: (1) Google access tokens expire in 1 hour. (2) D1 is encrypted at rest by Cloudflare infrastructure. (3) Token theft requires D1 API access, which means the attacker already controls the Cloudflare account. (4) App-level encryption adds complexity (key management, Web Crypto API) without meaningful security improvement for this use case. Revisit if storing long-lived sensitive data in D1.
- **Task 1 — Drizzle consolidation:** Refactored `createAuth()` to accept `{ db, env }` instead of creating its own Drizzle instance. Updated `[...all].ts` to call `getDrizzle(locals)` once and pass to `createAuth()`. Removed runtime `drizzle()` import from `student-auth.ts`.
- **Task 2 — Production config:** Added session config (7-day expiry, 24h refresh, 5-min cookie cache). Added `trustedOrigins` from `BETTER_AUTH_URL`. Removed all spike TODOs.
- **Task 3 — Auth client:** Created `auth-client.ts` with `createAuthClient({ baseURL: '/api/auth' })`. Typed methods: `signIn.social()`, `signOut()`, `getSession()`.
- **Task 4 — Error handling:** Added try/catch in `[...all].ts` — env errors → 500, D1/runtime errors → 503. No secrets in error responses. Added env validation in `createAuth()`.
- **Task 6 — Tests:** 33 new unit tests across 4 files. Full suite: 620 passed, 0 failed.

### Change Log

- **2026-03-01 — Story created by SM agent (Bob).** Comprehensive context engine analysis completed. All spike learnings incorporated. Error/edge-case ACs from sprint decomposition included.
- **2026-03-01 — Story implemented by Dev agent (Amelia).** All 6 tasks completed. 23 new unit tests. Zero regressions (610 total). Production-ready auth infrastructure.
- **2026-03-01 — Code review fixes by Dev agent (Amelia).** Fixed 7 review findings: added 8 route error-handling tests, 1 whitespace env validation test, 1 getDrizzle error propagation test; removed spike comment from drizzle-schema.ts; added trim() to env validation; updated getDrizzle JSDoc; corrected test counts and File List. Suite: 620 passed, 0 failed.

### File List

**Modified:**
- `astro-app/src/lib/student-auth.ts` — Refactored: accepts shared Drizzle instance, added session config, trustedOrigins, env validation with trim()
- `astro-app/src/lib/drizzle-schema.ts` — Removed spike comment and token encryption TODO
- `astro-app/src/lib/db.ts` — Updated getDrizzle() JSDoc to clarify per-call instantiation
- `astro-app/src/pages/api/auth/[...all].ts` — Uses shared getDrizzle(), added try/catch error handling

**Created:**
- `astro-app/src/lib/auth-client.ts` — Client-side Better Auth client for student pages
- `astro-app/src/lib/__tests__/student-auth.test.ts` — 14 unit tests for createAuth() factory
- `astro-app/src/lib/__tests__/auth-client.test.ts` — 5 unit tests for auth client module
- `astro-app/src/lib/__tests__/db.test.ts` — 6 unit tests for getDb()/getDrizzle()
- `astro-app/src/lib/__tests__/auth-route.test.ts` — 8 unit tests for [...all].ts error handling
- `docs/authentication-strategy.md` — Dual-auth architecture documentation (sponsors vs students)

**Tracking:**
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Status: in-progress → review
- `_bmad-output/implementation-artifacts/16-2-d1-schema-better-auth-infrastructure.md` — This file
