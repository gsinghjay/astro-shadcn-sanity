# Integration Architecture

*Generated: 2026-03-11 | Scan Level: deep*

## Overview

The YWCC Capstone monorepo has 4 parts that integrate via APIs, shared databases, and Cloudflare bindings.

## Part Communication Map

```
┌──────────────┐     GROQ API      ┌──────────────┐
│              │◄───────────────────│              │
│   Sanity     │     Content Lake   │  Sanity      │
│   Content    │───────────────────►│  Studio      │
│   Lake       │   Schema Deploy    │  (capstone   │
│              │                    │   + rwc)     │
└──────┬───────┘                    └──────────────┘
       │
       │ GROQ Queries (build-time + live)
       │ Visual Editing (stega)
       │ Live Content API (subscriptions)
       ▼
┌──────────────┐     DO RPC         ┌──────────────┐
│              │───────────────────►│              │
│  Astro App   │  checkLimit()      │ Rate Limiter │
│  (Cloudflare │                    │   Worker     │
│   Pages)     │                    │ (Durable     │
│              │                    │  Object)     │
│  ┌─────────┐ │                    └──────────────┘
│  │Middleware│ │
│  │(Auth +   │ │     D1 SQL        ┌──────────────┐
│  │RateLimit)│ │───────────────────►│  Cloudflare  │
│  └─────────┘ │  Drizzle ORM       │  D1 Database │
│              │                    │  (SQLite)    │
│  ┌─────────┐ │                    └──────────────┘
│  │ KV Cache│ │
│  │(Sessions)│ │     KV API        ┌──────────────┐
│  └─────────┘ │───────────────────►│  Cloudflare  │
│              │  get/put (5-min)    │  KV Store    │
│              │                    └──────────────┘
│  ┌─────────┐ │
│  │Better   │ │     OAuth 2.0      ┌──────────────┐
│  │Auth     │ │───────────────────►│  Google /    │
│  │Handler  │ │                    │  GitHub      │
│  └─────────┘ │                    └──────────────┘
│              │
│              │     REST API       ┌──────────────┐
│              │───────────────────►│  Resend      │
│              │  Magic Link email   │  (Email)     │
└──────────────┘                    └──────────────┘

┌──────────────┐
│  Discord Bot │  (Python, standalone — not integrated yet)
│  FastAPI     │
└──────────────┘
```

## Integration Points

### 1. Astro App ↔ Sanity Content Lake

| Aspect | Details |
|--------|---------|
| Protocol | GROQ over HTTPS |
| Client | @sanity/astro (wraps @sanity/client) |
| Auth | Public API (CDN) for SSG, Read Token for Visual Editing |
| Caching | Module-level caching per build (sponsors, projects, events, testimonials, pages) |
| Queries | 15+ defineQuery queries in lib/sanity.ts |
| Visual Editing | Presentation tool with stega encoding, MPA history adapter |
| Live Content | Sync tags collection + EventSource subscription with backoff |
| Multi-site | GROQ params filter by site field when dataset=rwc |

### 2. Astro App ↔ Cloudflare D1

| Aspect | Details |
|--------|---------|
| Protocol | SQLite via D1 binding |
| ORM | Drizzle ORM |
| Database | ywcc-capstone-portal |
| Tables | user, session, account, verification |
| Usage | Better Auth session storage, user accounts, OAuth tokens |
| Binding | `env.PORTAL_DB` in wrangler.jsonc |

### 3. Astro App ↔ Cloudflare KV

| Aspect | Details |
|--------|---------|
| Protocol | KV binding API |
| Namespace | SESSION_CACHE |
| Usage | Session validation cache (avoid D1 reads) |
| TTL | 300 seconds (5 minutes) |
| Pattern | Check KV first → fallback to D1 → cache result back to KV |
| Binding | `env.SESSION_CACHE` in wrangler.jsonc |

### 4. Astro App ↔ Rate Limiter Worker

| Aspect | Details |
|--------|---------|
| Protocol | Durable Object RPC (service binding) |
| Method | `checkLimit(windowMs, maxRequests)` |
| Config | 100 requests per 60 seconds per IP |
| Failure Mode | Fail-open (request proceeds if DO unavailable) |
| DO Class | SlidingWindowRateLimiter |
| Storage | SQLite (Durable Object SQL storage) |
| Binding | `env.RATE_LIMITER` in wrangler.jsonc |

### 5. Astro App ↔ OAuth Providers

| Aspect | Details |
|--------|---------|
| Providers | Google OAuth 2.0, GitHub OAuth 2.0, Magic Link (email) |
| Handler | Better Auth catch-all at /api/auth/[...all] |
| Callback | Better Auth manages redirect flow |
| Secrets | GOOGLE_CLIENT_ID/SECRET, GITHUB_CLIENT_ID/SECRET |

### 6. Astro App ↔ Resend (Email)

| Aspect | Details |
|--------|---------|
| Protocol | REST API |
| Usage | Magic link authentication emails |
| Secret | RESEND_API_KEY |
| From | RESEND_FROM_EMAIL (optional override) |

### 7. Studio ↔ Sanity Content Lake

| Aspect | Details |
|--------|---------|
| Protocol | Sanity Client API |
| Operations | CRUD content, schema deploy, GraphQL deploy |
| Workspaces | capstone (production dataset), rwc (rwc dataset) |
| Plugins | structureTool, presentationTool, visionTool, formSchema |

### 8. CI/CD ↔ External Services

| Integration | Trigger | Service | Purpose |
|-------------|---------|---------|---------|
| release.yml | push to main | GitHub API | Semantic release, tags, changelog |
| sync-preview.yml | after release | Discord Webhook | Release notifications |
| deploy-storybook.yml | push to main | GitHub Pages | Storybook deployment |
| ci.yml | PR to preview | Lighthouse | Performance audits |

## Data Flow: Page Request (SSG)

```
Build time:
1. Astro calls loadQuery(PAGE_BY_SLUG_QUERY, {slug})
2. Sanity returns page data with all blocks
3. BlockRenderer dispatches each block._type to component
4. Block resolvers fetch referenced sponsors/projects/events/testimonials
5. Components render to static HTML
6. HTML deployed to Cloudflare CDN

Request time:
1. CDN serves pre-rendered HTML
2. No server involvement (pure static)
```

## Data Flow: Portal Request (SSR)

```
1. Request hits Cloudflare Worker
2. Middleware classifies route (/portal/* → sponsor auth required)
3. Extract session token from cookie
4. Check KV cache for session → if hit, skip D1
5. If miss, query D1 via Better Auth for session validation
6. Cache valid session back to KV (fire-and-forget)
7. Check rate limit via DO RPC (100/60s per IP)
8. If sponsor route: check Sanity whitelist for role escalation
9. Set Astro.locals.user with validated user data
10. Astro page renders with user context
11. React islands hydrate for interactive portal components
```

## Data Flow: Auth (Magic Link)

```
1. User enters email on /portal/login
2. POST /api/auth/magic-link with email
3. Better Auth creates verification token in D1
4. Resend API sends email with magic link
5. User clicks link → GET /api/auth/magic-link/verify?token=xxx
6. Better Auth validates token, creates session in D1
7. Set session cookie, redirect to /portal
8. Middleware validates session on subsequent requests
```

## Shared Dependencies

| Dependency | Used By | Purpose |
|------------|---------|---------|
| TypeScript | astro-app, studio, rate-limiter | Language |
| React 19 | astro-app, studio | UI rendering |
| wrangler | astro-app, rate-limiter | Cloudflare tooling |
| Vitest | astro-app, rate-limiter | Test runner |
| ESLint | astro-app, studio | Linting |
| Prettier | astro-app, studio | Formatting |

---
*Generated: 2026-03-11 | Scan Level: deep | Mode: full_rescan*
