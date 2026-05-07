# Integration Architecture

**Project:** ywcc-capstone-template v2.0.0
**Generated:** 2026-04-29 (full rescan, deep)

How the parts of this monorepo communicate with each other and with external services.

## Integration map

```
            ┌──────────────────────────────────────────────────────────────────┐
            │                      CLOUDFLARE WORKERS                          │
            │                                                                  │
            │  ┌──────────────────────────────────┐                            │
            │  │  ywcc-capstone (astro-app SSR)   │                            │
            │  │                                  │                            │
            │  │  ┌────────┐   ┌────────────────┐ │      ┌──────────────────┐ │
            │  │  │ Sanity │   │ Better Auth +  │ │      │ rate-limiter-    │ │
            │  │  │ client │   │ Drizzle (D1)   │ │ RPC  │ worker (DO       │ │
            │  │  │        │   │                │◄┼──────┤ SlidingWindow…)  │ │
            │  │  └───┬────┘   │ KV: SESSION_…  │ │      └──────────────────┘ │
            │  │      │        └────────────────┘ │                            │
            │  └──────┼────────────────────────────┘                            │
            │         │                                                        │
            │         │   D1 (shared)                                          │
            │         │   ┌────────────────────────────────┐                   │
            │         │   │  PORTAL_DB / DB                 │                   │
            │         │   │  ywcc-capstone-portal           │                   │
            │         │   └─────────────┬──────────────────┘                   │
            │         │                 │                                      │
            │         │     ┌───────────┘                                      │
            │         │     │                                                  │
            │         │  ┌──┴────────────────────────┐                         │
            │         │  │ ywcc-event-reminders      │                         │
            │         │  │ (cron 0 9 * * *)          │                         │
            │         │  │ reads sent_reminders +    │                         │
            │         │  │ subscribers, sends Resend │                         │
            │         │  └────┬─────────────────┬────┘                         │
            │         │       │                 │                              │
            │  ┌──────┼───────┼─────────────────┼────┐                         │
            │  │ rwc-us / rwc-intl (no D1/KV/DO)     │                         │
            │  │  Sanity client only                  │                         │
            │  └──────┼───────┼─────────────────┼────┘                         │
            │         │       │                 │                              │
            │  ┌──────┼───────┼─────────────────┼────┐                         │
            │  │ ywcc-capstone-preview / *-preview   │                         │
            │  │  Sanity client (drafts perspective) │                         │
            │  └──────┼───────┼─────────────────┼────┘                         │
            └─────────┼───────┼─────────────────┼──────────────────────────────┘
                      │       │                 │
   ┌──────────────────▼───────┴─────────────────▼──────────────────────────────┐
   │                       EXTERNAL SERVICES                                    │
   │                                                                            │
   │  Sanity Content Lake          Resend          GitHub OAuth   Google OAuth │
   │  (project 49nk9b0w,           (transactional + magic-link)                │
   │   datasets production / rwc)                                              │
   │                                                                            │
   │  Cloudflare Turnstile         Discord (webhook)              GA4 / GTM     │
   │  (siteverify endpoint)        (ops + content notifications)               │
   └────────────────────────────────────────────────────────────────────────────┘
```

## Inter-part integrations (this repo)

### 1. astro-app ↔ rate-limiter-worker (cross-script DO RPC)

**Direction**: `ywcc-capstone` → `rate-limiter-worker`. Bound at deploy time:

```jsonc
"durable_objects": {
  "bindings": [{
    "name": "RATE_LIMITER",
    "class_name": "SlidingWindowRateLimiter",
    "script_name": "rate-limiter-worker"
  }]
}
```

**Protocol**: Workers RPC. From `middleware.ts`:

```ts
import { env } from 'cloudflare:workers';
const id = env.RATE_LIMITER.idFromName(rateLimitKey);
const stub = env.RATE_LIMITER.get(id);
const result = await stub.checkLimit(60_000, 100);
if (!result.allowed) return new Response('Too many requests', { status: 429 });
```

**Failure mode**: capstone middleware fails closed if the binding is unhealthy (returns 5xx). Deploy `rate-limiter-worker` first when bootstrapping a fresh CF account.

### 2. astro-app ↔ event-reminders-worker (shared D1)

**Direction**: both Workers read/write `ywcc-capstone-portal` D1. **There is no direct binding** between them — coordination is through the database.

| Worker                    | Tables read           | Tables written                     |
|---------------------------|-----------------------|------------------------------------|
| ywcc-capstone (astro-app) | `subscribers` (during signup), `user`, `session`, `account`, `verification`, `project_github_repos` | All of the above |
| ywcc-event-reminders      | `subscribers`, `sent_reminders` | `sent_reminders` (insert per send) |

**Coordination requirement**: any migration affecting `subscribers` or `sent_reminders` (currently 0004 / 0005) must be deployed before either Worker is updated to read new columns. Migrations under `astro-app/migrations/` are the source of truth — `event-reminders-worker` does not maintain its own migration set.

### 3. astro-app ↔ studio (Sanity Content Lake)

**Direction**: read-mostly from astro-app to Sanity. Writes only via:

- **`submitForm` Action**: creates a `submission` document with `SANITY_API_WRITE_TOKEN`.
- **Sanity Studio**: editorial UI; writes documents directly through the Sanity API.

**Protocol**: HTTPS to `https://<projectId>.api.sanity.io/`. The astro-app uses three modes:

| Mode                  | Trigger                                                        | Perspective | useCdn | Stega        |
|-----------------------|----------------------------------------------------------------|-------------|:------:|--------------|
| Production (published)| `PUBLIC_SANITY_VISUAL_EDITING_ENABLED=false`                   | published   |   ✓    | off          |
| Preview (drafts)      | `PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true` (preview Workers)  | drafts      |   ✗    | on           |
| Live preview          | Within a preview Worker, subscribes to live updates via SSE    | drafts      |   ✗    | on           |

**Caching**: module-level caches (`_sponsorsCache`, `_siteSettingsCache`) are bypassed when `visualEditingEnabled === true`. Live subscriptions use exponential backoff (`lib/sanity-live.ts`, max 5 reconnect attempts).

**Webhook → deploy**: a single Sanity webhook (publish-only on `_type in [...]`, drafts excluded) triggers three CF Deploy Hooks (one per production Worker). Rebuild + deploy: ~45-75s per environment.

### 4. astro-app ↔ Sanity Studio (Visual Editing iframe)

**Direction**: Sanity Studio's Presentation tool loads a preview iframe pointing at one of the `*-preview` Workers. The Studio passes context (origin, perspective, document path) via postMessage. The astro-app emits stega markers in rendered HTML; clicking in the iframe focuses the corresponding Studio field.

The `studio/src/presentation/resolve.ts` resolver picks the iframe origin **per workspace**:

| Workspace  | Preview origin (production)                          |
|------------|------------------------------------------------------|
| capstone   | https://ywcc-capstone-preview.js426.workers.dev      |
| rwc-us     | https://rwc-us-preview.js426.workers.dev             |
| rwc-intl   | https://rwc-intl-preview.js426.workers.dev           |

The preview Workers carry `PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true` in their `vars` block.

### 5. astro-app ↔ studio (TypeGen pipeline)

**Direction**: studio → astro-app, build-time only. The studio extracts the schema and generates types; astro-app consumes them.

```
studio/src/schemaTypes/*.ts
        │  (sanity schema extract)
        ▼
studio/schema.json
        │  (sanity typegen generate)
        ▼
studio/sanity.types.ts
        │  (consumed by astro-app/src/lib/types.ts)
        ▼
astro-app component prop types
```

`npm run typegen` (root) runs this chain. After any schema change, the 4-step pipeline (update local schema → `schema:deploy` → `typegen` → update `lib/types.ts`) is mandatory before MCP content tools work with new types.

### 6. astro-app ↔ portal-api / discord-bot (NOT WIRED)

`platform-api` and `discord-bot` are **not currently wired into astro-app**. Their bindings are placeholders. If you need them in the request path:

- `platform-api`: set the real KV/D1 IDs in `platform-api/wrangler.jsonc`, deploy with `wrangler deploy` from that dir, and add a service binding to `astro-app/wrangler.jsonc`.
- `discord-bot` (Python): needs its own deploy target; not designed for CF Workers in its current form. The production Discord bot lives in `capstone-bot` + `capstone-ask-worker` (see "Out-of-tree" below).

## External integrations

### Authentication — Better Auth (Google + GitHub OAuth + Magic Link)

| Component                | Where                                                 | Role                                  |
|--------------------------|-------------------------------------------------------|---------------------------------------|
| Better Auth instance     | `astro-app/src/lib/auth-config.ts`                    | OAuth + magic-link configuration      |
| Catch-all routes         | `src/pages/api/auth/[...all].ts`                       | Provider sign-in / callback / sign-out |
| Sponsor lookup query     | `SPONSOR_BY_EMAIL_QUERY` (Sanity)                      | Maps user email → sponsor identity   |
| Magic-link mailer        | `Resend` (`RESEND_API_KEY` secret)                    | Transactional one-time tokens         |
| Session storage          | D1 `session` (Drizzle) + KV `SESSION_CACHE`           |                                       |

GitHub OAuth client ID `Ov23liFtOiWIyCqJXJMi` (production capstone). At cutover, `GITHUB_CLIENT_SECRET` must be re-put with the prod App's secret.

### Email — Resend

- Auth: magic-link emails to portal users.
- Reminders: `ywcc-event-reminders` daily cron sends event reminder emails.
- From address: `RESEND_FROM_EMAIL` env var (default `YWCC Capstone <noreply@intraphase.com>`).

### Bot protection — Cloudflare Turnstile

- Site key (public): `PUBLIC_TURNSTILE_SITE_KEY`. Same value across environments (`0x4AAAAAACf0yCNwVePpAiMn`).
- Secret: `TURNSTILE_SECRET_KEY` (Worker secret).
- Verified server-side in `submitForm` Astro Action via `POST https://challenges.cloudflare.com/turnstile/v0/siteverify`.

### Discord — webhook

- Ops + content notifications.
- Used by:
  - `submitForm` Action (form submission alerts).
  - `event-reminders-worker` (daily run summary).
  - `sync-preview.yml` GitHub Action (auto-merge result).
- Webhook URLs are stored as Worker secrets / GitHub Action secrets (per environment).

### GTM / GA4

- Container ID: `GTM-NS9N926Q`.
- Loaded via `Layout.astro` `<head>`.
- Tracking attributes: `data-gtm-category` / `data-gtm-action` / `data-gtm-label` on interactive elements (NEVER inline event handlers).
- Disabled in preview Workers (`PUBLIC_GTM_ID=""`).

### GitHub REST (via OAuth user tokens)

- Portal: when a sponsor has a GitHub OAuth account linked, `/portal/api/github/repos` calls `https://api.github.com/user/repos` server-side using the user's stored access token.
- `/portal/api/github/links` persists sponsor → repo selections in `project_github_repos` D1 table.

### Sanity Content Lake (project `49nk9b0w`)

- Datasets: `production` (capstone) + `rwc` (RWC sites). Schemas are shared across all three workspaces; site filtering is applied at query time.
- API token usage:
  - `SANITY_API_READ_TOKEN`: preview Workers only (drafts perspective).
  - `SANITY_API_WRITE_TOKEN`: server-only in production (used by `submitForm` and event reminders).
  - The `SponsorAcceptancesTool` admin endpoint authenticates the calling Studio user's own Sanity session JWT (no shared bearer); see `api-contracts.md` `POST /api/portal/admin/acceptances`.

### Cloudflare AI Search (production, out-of-tree)

- Index: `bf002610-921a-4047-9298-cc2d2668451a`.
- Consumed by `capstone-ask-worker` (RAG) — service-bound from `capstone-bot`.
- The astro-app's `ChatBubble.astro` uses `@cloudflare/ai-search-snippet` (a vendor web component, Shadow-DOM-rendered) to surface answers from this index.

## Multi-site mechanics

The same astro-app codebase serves three production environments. Differentiation is driven by:

1. **`CLOUDFLARE_ENV` build var**: selects `[env.<name>]` block in `wrangler.jsonc`. The astro.config reads the block's `vars` and mirrors them into `process.env` before `defineConfig`.
2. **`PUBLIC_SITE_ID`** (`capstone` / `rwc-us` / `rwc-intl`): drives GROQ `$site` parameter.
3. **`PUBLIC_SITE_THEME`** (`red` / `blue` / `green`): sets `<html data-site-theme>` for CSS theming.
4. **`PUBLIC_SANITY_DATASET`** (`production` / `rwc`): flips multi-site mode (`isMultiSite = DATASET === 'rwc'`).
5. **`PUBLIC_SANITY_VISUAL_EDITING_ENABLED`**: flips drafts vs published, stega on/off, useCdn on/off, server:defer islands, `astro-llms-md` (gated OFF when stega is on).

Three preview Workers carry the same env layering plus visual editing on. Studio Presentation iframe URL is selected by workspace.

## Branch + release flow (CI integration)

```
feature/* ─► preview ─► main
                          │
                          ├─► release.yml → semantic-release tag + CHANGELOG commit
                          │
                          ├─► deploy-storybook.yml → GH Pages (path-filtered)
                          │
                          └─► sync-preview.yml → main → preview auto-merge + Discord notify
```

| Workflow                       | Triggers              | Purpose                                                      |
|--------------------------------|-----------------------|--------------------------------------------------------------|
| `ci.yml`                       | PR to `preview`       | Vitest unit + LHCI + Pa11y (sitemap-driven)                   |
| `release.yml`                  | push to `main`        | semantic-release versioning + tagging                         |
| `deploy-storybook.yml`         | push to `main`        | GH Pages publish                                              |
| `enforce-preview-branch.yml`   | PR to `main`          | Blocks any source other than `preview`                        |
| `enforce-preview-source.yml`   | PR to `preview`       | Blocks `main → preview` PRs                                   |
| `sync-preview.yml`             | release.yml completion| Auto-merge `main → preview` + Discord notify                  |

There is **no automated CF deploy on `main`** for the astro-app — `wrangler deploy` happens on demand via `npm run deploy:capstone` etc. The Sanity webhook → CF Deploy Hook flow handles content-driven rebuilds.

## Out-of-tree services (production)

Operationally adjacent but not part of this repo's deploy pipeline:

| Service                     | Type                                | Bindings                                                              |
|-----------------------------|-------------------------------------|-----------------------------------------------------------------------|
| `capstone-bot`              | CF Worker (Discord bot)             | service binding `ASK_WORKER` → `capstone-ask-worker`, KV, Sanity vars  |
| `capstone-ask-worker`       | CF Worker (RAG over AI Search)      | AI Search index `bf002610-…`                                          |
| `little-dawn-0015-nlweb`    | CF Worker (MCP-style tool surface)  | AI, ASSETS, MCP_OBJECT (DO), RAG_ID, RATE_LIMITER (ratelimit binding) |

These are pinned to the same CF account but deploy independently. If you change Sanity schemas or Discord webhook URLs, audit downstream consumers in this list before merging.

## Risks (integration-level)

1. **Cross-script DO**: `ywcc-capstone` middleware fails closed if `rate-limiter-worker` is undeployed. Always deploy the rate limiter first when standing up a new CF account.
2. **Shared D1**: `astro-app` + `event-reminders-worker` share `ywcc-capstone-portal`. Migration changes affect both — coordinate deploys.
3. **Sanity webhook scope**: filter is `_type in ["page","siteSettings","sponsor","project","team","event"]`. Adding a new content type that should trigger rebuild requires updating the webhook config in the Sanity dashboard — not in code.
4. **Discord webhook URLs**: stored as secrets in Worker / Action contexts. A leaked URL allows arbitrary message posting; rotate via the Discord channel settings.
5. **Stale OAuth tokens**: the prod GitHub client secret must be re-put at cutover (the staging-phase secret is invalid). Documented in `wrangler.jsonc` comments.
6. **`platform-api` placeholders**: deploying with placeholder KV/D1 IDs breaks at runtime. Treat as a scaffold until IDs are real.
