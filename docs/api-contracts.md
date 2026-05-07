# API Contracts

**Project:** ywcc-capstone-template v2.0.0
**Generated:** 2026-04-29 (full rescan, deep)
**Scope:** Public + authenticated HTTP surfaces. Astro Actions, Durable Object RPC, and scheduled (cron) handlers are covered at the contract level.

## Overview

The astro-app exposes a small HTTP surface in three groups:

- **Public API** (`/api/*`) — auth catch-all, newsletter, iCal feeds, agreement endpoints (admin-/user-facing).
- **Portal API** (`/portal/api/*`) — authenticated routes for the sponsor portal UI.
- **Astro Actions** — single server-only action `submitForm`, called via the Astro `<form>` Action client.

Plus three non-HTTP surfaces:

- **`SlidingWindowRateLimiter`** Durable Object (cross-script RPC from `ywcc-capstone` middleware).
- **`scheduled()`** handler in `ywcc-event-reminders` (daily 09:00 UTC cron).
- **Sanity Webhook → CF Deploy Hooks** (publish-only, server-to-server).

All HTTP routes run on the SSR Worker (Astro 6 + adapter v13). RWC content-only Workers do not have D1/KV/DO bindings — any portal/auth/api hit on those Workers returns **503**. Only `ywcc-capstone` serves portal traffic.

## Public API (`astro-app/src/pages/api/`)

### `GET|POST /api/auth/[...all]` (Better Auth catch-all)

**File**: `src/pages/api/auth/[...all].ts`. Forwards every method/path to Better Auth's request handler. Sub-paths handled (representative):

| Path                                  | Purpose                                                |
|---------------------------------------|--------------------------------------------------------|
| `POST /api/auth/sign-in/social`       | OAuth sign-in (provider: `google` or `github`)         |
| `POST /api/auth/sign-in/magic-link`   | Magic link email request (Resend dispatch)             |
| `POST /api/auth/sign-out`             | Session destroy + cookie clear                         |
| `GET /api/auth/callback/<provider>`   | OAuth callback                                         |
| `POST /api/auth/verify-email`         | Magic link verification token                          |
| `GET /api/auth/get-session`           | Returns session JSON for the client                    |

Bindings used: D1 `PORTAL_DB`, KV `SESSION_CACHE`, secrets `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`.

### `POST /api/subscribe`

**File**: `src/pages/api/subscribe.ts`. Adds an email to the `subscribers` D1 table (no double-opt-in confirm flow yet — `confirmed_at` is set immediately).

| Field         | Type     | Notes                                              |
|---------------|----------|----------------------------------------------------|
| `email`       | string   | Required. Stored after a basic format check.       |
| `source`      | string?  | Optional. Useful for newsletter / event tagging.   |

Returns `200 { ok: true }` on success or `400/500` on validation/database failure.

### `GET /api/events/[slug].ics`

**File**: `src/pages/api/events/[slug].ics.ts`. Returns an iCal `.ics` calendar feed for a single Sanity event.

- Looks up via `EVENT_BY_SLUG_QUERY`.
- Returns `Content-Type: text/calendar`.
- Used by the Schedule-X portal calendar export and event-detail "Add to Calendar" buttons.

### `POST /api/portal/admin/acceptances`

**File**: `src/pages/api/portal/admin/acceptances.ts`. Backs the Studio `SponsorAcceptancesTool` (Capstone workspace). Reads agreement-acceptance audit columns (`agreement_*`) from `user`, joined to Sanity sponsors via email.

Authorization: the calling Studio user's Sanity session JWT in `Authorization: Bearer <jwt>`. The endpoint introspects via `https://<projectId>.api.sanity.io/v1/users/me` and authorizes only when the user has the `administrator` role on the project. The `Origin` must equal `STUDIO_ORIGIN` (defense-in-depth). NOT for end-user calls.

### `POST /api/portal/agreement/accept`

**File**: `src/pages/api/portal/agreement/accept.ts`. Records a sponsor's agreement acceptance: writes `user.agreement_accepted_at`, `agreement_version`, `agreement_accepted_ip`, and `agreement_accepted_user_agent`. Releases the gate set by middleware.

Auth: existing portal session required.

Body: `{ agreementId: string, version: string }`. Validated against the active `sponsorAgreement` document via `SPONSOR_AGREEMENT_REV_QUERY`.

## Portal API (`astro-app/src/pages/portal/api/`)

All routes require an active session (enforced by `middleware.ts`). Unauthenticated requests are redirected (HTML) or return 401 (JSON `Accept` header).

| Route                              | Method | Returns                                      | Notes                                               |
|------------------------------------|--------|----------------------------------------------|-----------------------------------------------------|
| `/portal/api/me`                   | GET    | `{ user: { id, email, name, role, sponsorSlug } }` | Hydrates the current sponsor's identity.       |
| `/portal/api/projects`             | GET    | `{ projects: SponsorProject[] }`              | Sponsor's projects via `SPONSOR_PROJECTS_API_QUERY`.|
| `/portal/api/events`               | GET    | `{ events: PortalEvent[] }`                  | Upcoming events (Schedule-X consumption shape).     |
| `/portal/api/db-health`            | GET    | `{ tables: string[], rowCounts: {…} }`       | ⚠ **Known risk**: exposes SQLite table names to any authenticated user. TODO: admin gate. |
| `/portal/api/github/links`         | GET    | `{ links: ProjectGithubRepo[] }`             | Reads `project_github_repos` for the user.          |
| `/portal/api/github/links`         | POST   | `{ ok: true, link: ProjectGithubRepo }`      | Creates a sponsor → repo link.                      |
| `/portal/api/github/links`         | DELETE | `{ ok: true }`                                | Removes a link by ID.                                |
| `/portal/api/github/repos`         | GET    | `{ repos: GithubRepo[] }`                    | Calls GitHub REST API server-side using the user's stored OAuth token. |

Auth gate: middleware verifies session + applies the agreement gate. If `user.agreement_accepted_at` is null OR `user.agreement_version` doesn't match the active `sponsorAgreement` revision, requests to `/portal/*` (except `/portal/agreement` and `/portal/api/admin/*`) redirect to `/portal/agreement`.

Rate limit: 100 requests / 60s sliding window via cross-script DO RPC. Exceeding returns 429.

## Astro Actions (`astro-app/src/actions/`)

### `submitForm` (server-only)

**File**: `src/actions/index.ts`. The single Action exported — bound to public-facing forms (Contact, Sponsor inquiry, Newsletter where the simple `subscribe` endpoint isn't enough).

**Flow**:

1. Validate Cloudflare Turnstile token server-side (`POST https://challenges.cloudflare.com/turnstile/v0/siteverify` with `TURNSTILE_SECRET_KEY`).
2. Sanity client write (`SANITY_API_WRITE_TOKEN`): create a `submission` document with the form payload + originating site / form id.
3. Discord webhook notify (URL via env): summary message for fast triage.
4. Return `{ ok: true, submissionId }` or `{ ok: false, error }`.

Bindings: `SANITY_API_WRITE_TOKEN` (server secret), `TURNSTILE_SECRET_KEY` (server secret), Discord webhook URL.

The Action is callable from `<form method="POST" action={actions.submitForm}>` or programmatically via `import { actions } from 'astro:actions'`.

## Durable Object RPC (`rate-limiter-worker`)

### `class SlidingWindowRateLimiter extends DurableObject`

Cross-script bound from `ywcc-capstone` Worker:

```jsonc
"durable_objects": {
  "bindings": [{
    "name": "RATE_LIMITER",
    "class_name": "SlidingWindowRateLimiter",
    "script_name": "rate-limiter-worker"
  }]
}
```

**RPC method**:

```ts
checkLimit(windowMs: number, maxRequests: number): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;  // ms epoch
}>
```

Storage: per-DO-instance SQLite table `requests(timestamp INTEGER)` with an index on `timestamp`. The `alarm()` handler performs periodic cleanup of expired timestamps.

**Failure mode**: middleware fails closed if the binding is unhealthy. Deploy `rate-limiter-worker` first when bootstrapping a fresh CF account.

## Cron handler (`ywcc-event-reminders`)

### `scheduled(controller, env, ctx)`

**File**: `event-reminders-worker/src/index.ts`. Trigger: `0 9 * * *` (daily 09:00 UTC).

**Flow**:

1. Query Sanity for upcoming events (next 7 days) via the same `ALL_EVENTS_QUERY` shape.
2. For each event, query D1 `subscribers` for matching audience (site + opt-in flags).
3. For each subscriber, check D1 `sent_reminders` for an existing send (dedupe key: `event_id + subscriber_email + kind`).
4. If not yet sent: dispatch via Resend (HTML email), insert into `sent_reminders`, fire a Discord webhook for ops visibility.

Bindings: `DB` (D1 PORTAL_DB), `SANITY_API_TOKEN` (read), `RESEND_API_KEY`, `DISCORD_WEBHOOK_URL`, `RESEND_FROM_EMAIL`. All non-PUBLIC values are stored as Worker secrets.

Health check: a thin `fetch()` on the same Worker returns `200 ok` for uptime monitors (no auth).

## Sanity Webhooks → CF Deploy Hooks

Server-to-server. Configured in Sanity dashboard. Filter:

```
_type in ["page","siteSettings","sponsor","project","team","event"] && !(_id in path("drafts.**"))
```

Three deploy hooks, one per production Worker:

| Worker         | Hook ID                                  | Hook name                              | Branch |
|----------------|------------------------------------------|----------------------------------------|--------|
| ywcc-capstone  | `f6e2c5c6-8951-455c-b48b-6afcbbc82bbb`   | sanity-content-update-capstone         | main   |
| rwc-us         | `bca5ddca-d7d0-4742-9308-e405aa38122f`   | sanity-content-update-rwc-us           | main   |
| rwc-intl       | `8edab80c-19c0-4b68-8ca2-5bba8586646c`   | sanity-content-update-rwc-intl         | main   |

Drafts are excluded (publish-only). Rebuild + deploy takes ~45-75s.

## Error conventions

- HTTP routes: success returns `2xx` with JSON `{ ok: true, … }`. Failures: `400` for validation, `401` for auth, `403` for auth+verified-but-forbidden (agreement gate), `429` for rate limit, `5xx` for server errors. Bodies: `{ ok: false, error: string }` (or full `Error` object in dev).
- Astro Actions: return discriminated `ActionError` with `code` + `message`. Forms read via `Astro.getActionResult(actions.submitForm)`.
- Cron: errors logged via Worker logs (observability enabled, `head_sampling_rate: 1`); no retry (cron triggers once daily and is idempotent via `sent_reminders`).

## Headers + security middleware

- Static asset CSP + STS via `astro-app/public/_headers`.
- Per-request CSP injection in `Layout.astro` `<meta http-equiv="Content-Security-Policy">` (allows GTM, Sanity, CF Turnstile origins).
- Permissions-Policy: `camera=(), microphone=(), geolocation=()`.
- Frame-ancestors locked to Sanity Studio origins (so the preview iframe works while clickjacking is blocked elsewhere).

## Auth requirements summary

| Route group                  | Session required | Gate                                  | Rate-limited |
|------------------------------|:----------------:|---------------------------------------|:------------:|
| `/api/auth/[...all]`         |       —          | (provider OAuth flow)                 |    yes        |
| `/api/subscribe`             |       —          | —                                     |    yes        |
| `/api/events/[slug].ics`     |       —          | —                                     |    yes        |
| `/api/portal/admin/*`        |       admin token in header     | —                       |    yes        |
| `/api/portal/agreement/accept`|     ✓            | session valid                         |    yes        |
| `/portal/*` (HTML)           |       ✓          | + agreement gate                      |    yes        |
| `/portal/api/*`              |       ✓          | + agreement gate                      |    yes        |
| public pages                 |       —          | —                                     |    no         |

## Out-of-tree services (production but managed elsewhere)

- **capstone-bot** (CF Worker): Discord bot front-end. Service-binds to `capstone-ask-worker`.
- **capstone-ask-worker** (CF Worker): RAG over CF AI Search index `bf002610-921a-4047-9298-cc2d2668451a`.
- **little-dawn-0015-nlweb** (CF Worker): MCP-style tool exposing AI / ASSETS / RAG / DO-rate-limiter bindings.

These are operationally adjacent but not part of this repo's deploy lifecycle. Touch them with their own change windows.
