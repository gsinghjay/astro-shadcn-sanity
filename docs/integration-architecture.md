# Integration Architecture

**Project:** ywcc-capstone-template v1.18.0
**Generated:** 2026-04-15

## Parts & their integration status

| Part | Role | Integration status |
|---|---|---|
| `astro-app` | Public website + sponsor/student portal | **Hub.** Calls every production backend. |
| `studio` | Editorial CMS | Publishes to Sanity Content Lake (capstone, rwc-us, rwc-intl datasets). |
| `rate-limiter-worker` | Edge rate limiter (DO) | **Wired** into astro-app via DO binding `RATE_LIMITER`. |
| `event-reminders-worker` | Cron email + Discord notifier | **Wired** to shared D1 + Sanity + Resend + Discord webhook. |
| `platform-api` | Typed REST/GROQ proxy (Python Worker) | **Scaffold only.** No astro-app caller; wrangler has placeholder IDs. |
| `discord-bot` | Discord slash commands | **Scaffold only.** Standalone; queries Sanity directly. |

## Integration diagram

```
                ┌────────────────────────────────────────────────────────┐
                │                 Sanity Content Lake                    │
                │           (capstone / rwc-us / rwc-intl datasets)      │
                └──▲────────────────▲──────────────────────▲─────────────┘
         publish  │   GROQ read     │   GROQ read          │   GROQ read
                  │                 │                      │
  ┌─────────┐     │    ┌────────────┴──────┐   ┌───────────┴────────────┐
  │ Studio  │─────┘    │ astro-app         │   │ event-reminders-worker │
  │ (hosted)│          │ (CF Pages)        │   │ (CF Worker, cron)      │
  └─────────┘          │                   │   │  0 9 * * *             │
                       │ middleware.ts ───▶│DO │                        │
                       │                   │RPC│                        │
                       │                   └─┬─┘                        │
                       │     ┌───────────────┼──┐                       │
                       │     │rate-limiter-  │  │                       │
                       │     │worker (DO+SQL)│  │                       │
                       │     └───────────────┘  │                       │
                       │                        │                       │
                       │  Drizzle / D1 ◀────────┼──── D1 (write)        │
                       │  KV SESSION_CACHE      │                       │
                       │                        │                       │
                       │  Resend (email) ◀──────┼──── Resend (email)    │
                       │  GitHub API            │                       │
                       │  Better Auth           │                       │
                       │                        └──── Discord webhook ─▶│
                       └──────▲─────────────────┘                       │
                              │                                         │
                       ┌──────┴──────┐                                  │
                       │ Users       │                                  │
                       │ (browsers)  │                                  │
                       └─────────────┘                                  │
                                                                        │
   ┌──────────────────────────┐                                         │
   │ D1 ywcc-capstone-portal  │◀────────────────────────────────────────┘
   │ • user, session, account, verification (Better Auth)               │
   │ • subscribers                                                      │
   │ • sent_reminders (idempotency)                                     │
   │ • project_github_repos                                             │
   └────────────────────────────────────────────────────────────────────┘

   ┌──────────────────┐          ┌─────────────────┐
   │ platform-api     │          │ discord-bot     │
   │ (CF Python Worker│   ──X──  │ (traditional    │
   │  — scaffold)     │ not wired│  server         │
   └──────────────────┘          │  — scaffold)    │
                                 │  slash commands │
                                 │  query Sanity   │
                                 └─────────────────┘
```

## Integration points (authoritative list)

### 1. astro-app → Sanity Content Lake
- **Transport:** HTTPS via `@sanity/astro` client (module `sanity:client`).
- **Auth:** public read for SSG; `SANITY_API_READ_TOKEN` for draft/Visual Editing previews.
- **Volume:** 30 `defineQuery` exports in `astro-app/src/lib/sanity.ts` (pages, sponsors, projects, events, articles, article-categories, authors, listing-page singletons, sponsor portal, sponsor whitelist, testimonials, site settings).
- **Caching:** Module-level `const QUERY = defineQuery(…)` bodies and GROQ results are cached by `@sanity/client`'s built-in ETag / deduping during the build. At runtime SSR routes re-fetch per request.
- **Block projections:** shared `INNER_BLOCK_FIELDS_PROJECTION` includes image + `metadata.lqip` (for LQIP placeholders) and recursive ColumnsBlock expansion.
- **Visual Editing:** Stega markers injected when `PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true`. Presentation resolvers live in `studio/src/presentation/resolve.ts` and map route slugs to preview URLs.
- **Live Content:** Optional client-side subscription via `sanity-live.ts` when `PUBLIC_SANITY_LIVE_CONTENT_ENABLED=true`.

### 2. astro-app → Cloudflare D1 (PORTAL_DB)
- **Database:** `ywcc-capstone-portal` (id `76887418-c356-46d8-983b-fa6e395d8b16`).
- **ORM:** Drizzle ORM 0.45.1 (`astro-app/src/lib/db.ts`, `drizzle-schema.ts`).
- **Tables:** `user`, `session`, `account`, `verification` (Better Auth); `subscribers`; `sent_reminders`; `project_github_repos`.
- **Migrations:** 7 SQL files at `astro-app/migrations/`. Applied via `npx wrangler d1 migrations apply PORTAL_DB`.
- **Sharing:** `event-reminders-worker` binds the same D1 database to read `subscribers` and write `sent_reminders`.

### 3. astro-app → KV SESSION_CACHE
- **Purpose:** Fast-path lookup for Better Auth sessions (avoids a D1 round-trip on hot paths).
- **Binding:** `SESSION_CACHE` KV namespace `f78af5695075451c9d3d7887368e90dc`.
- **Policy:** Middleware reads KV first; on miss or error, falls back to D1 via Drizzle. **Fail-open** on KV failure — a bad KV never blocks sign-in.

### 4. astro-app → Durable Object (RATE_LIMITER)
- **Binding:** `RATE_LIMITER` → `SlidingWindowRateLimiter` class from `rate-limiter-worker`.
- **Protocol:** DO RPC. `middleware.ts` calls `stub.checkLimit(60_000, 100)` per request, keyed by IP.
- **Response:** `{ allowed: boolean, remaining: number, retryAfterMs: number }`. If blocked, middleware returns HTTP 429 with `Retry-After`.
- **Resilience:** Fail-open on any DO error.

### 5. astro-app → Better Auth
- **Entry:** `/api/auth/[...all].ts` (SSR). Delegates to Better Auth's route handler.
- **Providers:** Google OAuth, GitHub OAuth, Resend Magic Link.
- **Cookies:** HttpOnly session cookie signed with `BETTER_AUTH_SECRET`.
- **Sponsor escalation:** After initial sign-in, middleware runs `SPONSOR_WHITELIST_QUERY` against Sanity. Matching emails get role `sponsor`; all others `student`. Roles are persisted on `user.role`.

### 6. astro-app → Resend
- **Use cases:** Magic Link delivery (Better Auth), newsletter signup (`/api/subscribe`), optional contact form notifications.
- **Secret:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.

### 7. astro-app → GitHub API
- **Entry:** `/portal/api/github/repos.ts`, `/portal/api/github/links.ts`.
- **Purpose:** Let sponsors link/unlink GitHub repositories to their projects (persisted in `project_github_repos`).
- **Auth:** User's GitHub OAuth access token from Better Auth `account` table.

### 8. astro-app → rate-limiter-worker (runtime)
Already covered in point 4. Deploy separately (`npm run deploy:rate-limiter`) so the DO class is available to astro-app.

### 9. event-reminders-worker → D1 + Sanity + Resend + Discord
- **Trigger:** `0 9 * * *` (daily 09:00 UTC) via `scheduled()` handler.
- **Flow:**
  1. Query Sanity for events with `status == "upcoming"` within 30 days.
  2. For each event, check `sent_reminders` table for idempotency.
  3. If unsent and `days_to_event` matches a reminder tier (30/7/1), dispatch:
     - 1 Discord embed per event via `DISCORD_WEBHOOK_URL`.
     - 1 per-subscriber email via Resend (for subscribers in the `subscribers` table).
  4. Write rows to `sent_reminders` to prevent re-sends.
- **Secrets:** `SANITY_API_TOKEN`, `DISCORD_WEBHOOK_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.

### 10. Sanity Studio ↔ TypeGen ↔ astro-app types
- **Contract:** `studio/schema.json` (extracted/deployed) is the source of truth.
- **Build step:** `npm run typegen` (root) runs `npx sanity typegen generate` from `studio/` with output to `astro-app/src/sanity.types.ts`.
- **Enforcement:** `astro-app/astro.config.mjs` build runs `astro check`, which fails on any drift between queries and TypeGen result types.
- **Deploy step:** `npx sanity schema deploy` (from `studio/`) updates the hosted schema for **all three workspaces**. This was fixed in PR `8bcf552` (previously deployed to capstone only).

### 11. Multi-workspace Sanity
- **Workspaces:** capstone (`/capstone`), rwc-us (`/rwc-us`), rwc-intl (`/rwc-intl`).
- **Shared schema:** `studio/src/schemaTypes/workspace-utils.ts#createSchemaTypesForWorkspace(siteId)` returns a schema set with the `site` field hidden for capstone and visible/required for rwc-us/rwc-intl.
- **Uniqueness:** `studio/src/schemaTypes/fields/site-field.ts#siteScopedIsUnique` validates slug uniqueness **per site** using a GROQ count query (so two RWC sites can share slugs without collision).
- **Desk filtering:** `rwc-desk-structure.ts` filters every site-aware type with GROQ `_type == $type && site == $site`. Listing-page singletons use composite IDs `listingPage-{route}-{siteId}`; site-settings singletons use `siteSettings-{siteId}`.

## Inactive / scaffold integration points

### platform-api (not yet wired)
- Wrangler bindings include placeholder `<your-kv-namespace-id>` / `<your-d1-database-id>`.
- astro-app does **not** call any `/api/v1/*` route (grep for `PLATFORM_API_URL` and route paths returns no hits).
- Decision point: either bind to `SESSION_CACHE` + `PORTAL_DB` and implement a caller, or remove from `package.json` workspaces until wired.

### discord-bot (not yet deployed)
- Lives at `discord-bot/discord-bot/` (nested twice — historical).
- Queries Sanity directly; does not consume any astro-app API.
- Slash commands registered manually (`python register_commands.py`) — one-time per guild/global registration.
- No deployment target defined (no Dockerfile at the bot root, no wrangler).

## Cross-cutting concerns

### Session & auth propagation
Middleware populates `context.locals.user = { id, email, name, role }`. Every SSR page and `/portal/api/*` handler reads from `locals`; no page re-validates the token independently.

### Rate limiting
Applied globally in `middleware.ts`. Static prerendered pages are served from CF Pages edge cache and do not hit the middleware, so the limiter only protects dynamic/API routes.

### Caching
- **Sanity queries:** in-memory during SSG build; revalidated on every SSR request.
- **CF Pages CDN:** default for prerendered assets; headers in `astro-app/public/_headers` tune cache-control per path.
- **KV session cache:** opportunistic, not authoritative.

### Observability
- `rate-limiter-worker` has `observability.enabled = true` in `wrangler.toml`.
- Other Workers log to the CF dashboard by default (no Logpush wired).
- GTM + GA4 on the frontend via `PUBLIC_GTM_ID`; dataLayer tested by `tests/e2e/gtm-datalayer.spec.ts`.

## Data flows (typical requests)

### Anonymous visitor reads `/articles/[slug]`
1. CF CDN serves prerendered HTML.
2. No middleware executes; no DO, D1, or KV calls.
3. Only the browser hits Sanity CDN for images (via `urlFor(...)` URLs with LQIP blur-up).

### Sponsor signs in
1. User clicks "Sign in with Google" on `/portal/login`.
2. Redirects to `/api/auth/[...all]` → Google → back to `/api/auth/callback`.
3. Better Auth creates `session` + `account` rows in D1.
4. Middleware runs on the next request: reads session token, caches in KV.
5. Runs `SPONSOR_WHITELIST_QUERY` against Sanity. Email matches → `user.role = sponsor`.
6. User is redirected to `/portal`.

### Scheduled event reminders
1. Cloudflare fires `event-reminders-worker` at 09:00 UTC.
2. Worker queries Sanity for upcoming events.
3. For each eligible event, inserts a row into `sent_reminders` and dispatches Discord + Resend notifications.
4. Worker returns; next invocation at 09:00 UTC next day.

### New page published in Studio
1. Editor publishes a `page` document in the Capstone or RWC workspace.
2. Sanity triggers the workspace's configured Pages deploy hook (see "Sanity → Pages deploy hooks" below).
3. Cloudflare Pages rebuilds the matching project on the `main` branch and redeploys.
4. For in-page hydration without a full rebuild, enable Live Content (`PUBLIC_SANITY_LIVE_CONTENT_ENABLED=true`).

### Sanity → Pages deploy hooks (confirmed via Cloudflare API, 2026-04-15)

Each Pages project has a production deploy hook wired to its matching Sanity workspace. Publishing (or merging content changes) in Studio invokes these hooks, which trigger a production build on `main`.

| Pages project | Deploy hook name | Hook ID | Branch | Created |
|---|---|---|---|---|
| `ywcc-capstone` | `sanity-content-update-capstone` | `f6e2c5c6-8951-455c-b48b-6afcbbc82bbb` | `main` | 2026-02-28 |
| `rwc-us` | `sanity-content-update-rwc-us` | `bca5ddca-d7d0-4742-9308-e405aa38122f` | `main` | 2026-02-28 |
| `rwc-intl` | `sanity-content-update-rwc-intl` | `8edab80c-19c0-4b68-8ca2-5bba8586646c` | `main` | 2026-02-28 |

The Studio configures these hook URLs as webhooks on publish/unpublish events per dataset (capstone dataset → capstone hook; rwc dataset → rwc-us + rwc-intl hooks). Hooks also fire on PR merges into `main` via the standard Pages GitHub integration (separate from the Sanity webhook path).

## Risks & follow-ups

- **Single D1 shared by astro-app + event-reminders-worker.** Safe today but requires coordinated migrations. Keep `astro-app/migrations/` as the single source of truth; event-reminders-worker reads only.
- **Platform-api drift.** If the scaffold sits unwired long-term, it risks bit-rot. Either invest or archive.
- **Discord bot hosting.** With no deploy target, slash commands will drift out of date; schedule a decision or move to a cron Worker.
- **DO binding in astro-app wrangler.jsonc.** Requires `rate-limiter-worker` to be deployed first. New environments must deploy in order.
