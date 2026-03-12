# Architecture

*Generated: 2026-03-11 | Scan Level: deep*

## Executive Summary

The YWCC Capstone Template is a monorepo containing an Astro 5 static-first website with selective SSR, a Sanity Studio v5 CMS, a Cloudflare Durable Object rate limiter, and a Python Discord bot. The architecture prioritizes build-time rendering for performance while enabling request-time rendering for authenticated portal experiences.

## Architecture Pattern

**Jamstack + Selective SSR** — Public content is pre-rendered at build time (SSG) via Astro, while authenticated portal pages and API endpoints are server-rendered at request time via Cloudflare Workers. Content is managed in Sanity CMS and fetched via GROQ API.

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Rendering Strategy | Static-first with per-route SSR | Performance for public pages, dynamic auth for portal |
| CMS | Sanity (headless) | Visual editing, structured content, real-time API |
| Deployment | Cloudflare Pages + Workers | Edge computing, D1 database, Durable Objects |
| Auth | Better Auth | Multi-provider (OAuth + Magic Link), D1 adapter |
| Database | Cloudflare D1 (SQLite) | Serverless, zero-config, edge-local |
| Rate Limiting | Durable Objects | Per-IP state, SQLite-backed sliding window |
| UI Framework | Astro + React islands | Minimal client JS, hydration only where needed |
| Styling | Tailwind CSS v4 | CSS-first config, design tokens, multi-theme |
| Component Library | shadcn/fulldev-ui pattern | Copy-paste ownership, 39 primitive families |

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cloudflare Edge                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Cloudflare Pages (ywcc-capstone)             │   │
│  │  ┌────────────┐  ┌────────────────┐  ┌───────────────┐  │   │
│  │  │ Static CDN │  │ Worker (SSR)   │  │ API Endpoints │  │   │
│  │  │ /index.html│  │ /portal/*      │  │ /api/auth/*   │  │   │
│  │  │ /sponsors/ │  │ /student/*     │  │ /portal/api/* │  │   │
│  │  │ /projects/ │  │                │  │               │  │   │
│  │  │ /events/   │  │ Middleware:    │  │ Better Auth   │  │   │
│  │  │ /[...slug] │  │ - Auth check   │  │ handler       │  │   │
│  │  │            │  │ - Rate limit   │  │               │  │   │
│  │  │  8 SSG     │  │ - KV cache     │  │  5 endpoints  │  │   │
│  │  │  pages     │  │  9 SSR pages   │  │               │  │   │
│  │  └────────────┘  └───────┬────────┘  └───────┬───────┘  │   │
│  └──────────────────────────┼───────────────────┼──────────┘   │
│                             │                   │               │
│  ┌──────────┐  ┌───────────┴─┐  ┌──────────────┴──────────┐   │
│  │ KV Store │  │ D1 Database │  │ Durable Object          │   │
│  │ SESSION  │  │ PORTAL_DB   │  │ rate-limiter-worker      │   │
│  │ _CACHE   │  │ (SQLite)    │  │ SlidingWindowRateLimiter │   │
│  │          │  │             │  │ (SQLite storage)         │   │
│  │ 5-min    │  │ Tables:     │  │                          │   │
│  │ session  │  │ - user      │  │ 100 req/60s per IP       │   │
│  │ TTL      │  │ - session   │  │ Alarm-based cleanup      │   │
│  │          │  │ - account   │  │                          │   │
│  │          │  │ - verifica- │  │                          │   │
│  │          │  │   tion      │  │                          │   │
│  └──────────┘  └─────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │                              │
         │ GROQ API                     │ OAuth 2.0
         ▼                              ▼
┌─────────────────┐            ┌─────────────────┐
│  Sanity          │            │  Auth Providers  │
│  Content Lake    │            │  - Google OAuth  │
│                  │            │  - GitHub OAuth  │
│  Dataset:        │            │  - Magic Link    │
│  - production    │            │    (via Resend)  │
│  - rwc           │            │                  │
│                  │            └─────────────────┘
│  Documents: 68+  │
│  Types: 51       │            ┌─────────────────┐
│                  │            │  Sanity Studio   │
│  Visual Editing  │◄───────────│  (Hosted)        │
│  Presentation    │            │  Multi-workspace │
│  Live Content    │            │  capstone + rwc  │
└─────────────────┘            └─────────────────┘
```

## Frontend Architecture (astro-app)

### Rendering Modes

| Mode | Routes | Trigger | Details |
|------|--------|---------|---------|
| SSG | 8 public pages | Build time | Pre-rendered HTML, served from CDN |
| SSR | 9 portal/auth pages | Request time | Worker-rendered, auth middleware |
| API | 5 endpoints | Request time | JSON responses, Better Auth handler |

### Page Builder Architecture

The page builder is the core content architecture:

1. **Schema (Studio):** `page.ts` defines blocks array accepting 23 block types
2. **Query (Lib):** `PAGE_BY_SLUG_QUERY` fetches page with all block data
3. **Dispatch (Component):** `BlockRenderer.astro` maps `block._type` → component
4. **Registry:** `block-registry.ts` auto-discovers components via `import.meta.glob()`
5. **Wrapper:** `BlockWrapper.astro` applies spacing, background, max-width from `blockBaseFields`
6. **Variants:** `variant-layouts.ts` maps block type + variant → Section layout config

### Component Architecture

```
Components (508 files)
├── blocks/custom/ (23)    ← Sanity-connected page builder blocks
├── blocks/ (115+)         ← Generic UI block variants (hero, cta, features, etc.)
├── ui/ (39 families)      ← shadcn-style primitives (button, section, field, etc.)
├── portal/ (8)            ← React hydrated portal components
└── top-level (14)         ← Application components (Header, Footer, Breadcrumb, etc.)
```

### Middleware Pipeline

```
Request → Route Classification → Auth Check → Rate Limit → Handler
              │                       │              │
              ├─ Public: skip         ├─ Cookie      ├─ DO RPC
              ├─ Portal: sponsor auth │   extract     │   100/60s
              └─ Student: student auth├─ KV cache     └─ Fail-open
                                      │   (5-min TTL)
                                      ├─ D1 fallback
                                      │   (Better Auth)
                                      └─ Sponsor escalation
                                          (Sanity whitelist)
```

### State Management

- **Server state:** Sanity content cached at build time (module-level caching in `sanity.ts`)
- **Auth state:** `Astro.locals.user` populated by middleware for all authenticated routes
- **Client state:** `nanostores` for React portal components, `@preact/signals` for fine-grained reactivity
- **Session state:** Better Auth sessions in D1, cached in KV (5-min TTL)

## CMS Architecture (studio)

### Schema Organization

```
51 Schema Types
├── Documents (7): page, siteSettings, sponsor, project, testimonial, event, submission
├── Objects (14): seo, button, link, portableText, faqItem, featureItem, statItem,
│                 stepItem, teamMember, galleryImage, comparisonColumn, comparisonRow,
│                 timelineEntry, block-base
└── Blocks (25): heroBanner, featureGrid, ctaBanner, statsRow, textWithImage,
                 logoCloud, sponsorSteps, richText, faqSection, contactForm,
                 sponsorCards, testimonials, eventList, projectCards, teamGrid,
                 imageGallery, articleList, comparisonTable, timeline, pullquote,
                 divider, announcementBar, sponsorshipTiers + 2 more
```

### Multi-Workspace Architecture

- **Capstone workspace:** Production dataset, site field hidden, singleton siteSettings
- **RWC workspace:** rwc dataset, site field visible (rwc-us / rwc-intl), filtered content
- **Shared schema:** `createSchemaTypesForWorkspace(targetDataset)` adapts field visibility

### Block System Patterns

- **defineBlock():** Factory helper providing consistent structure with variant support
- **Layout fieldset:** All blocks share `backgroundVariant`, `spacing`, `maxWidth`
- **Variant system:** Multiple layout options per block (e.g., heroBanner: centered, split, overlay, spread, split-asymmetric)
- **hiddenByVariant:** Conditional field visibility based on selected variant
- **Display modes:** all / featured / manual for content-fetching blocks
- **Template compatibility:** Page validates block/template combinations with warnings

### Reference Graph

```
project.sponsor ──────────► sponsor
testimonial.project ──────► project
logoCloud.sponsors[] ─────► sponsor (conditional)
sponsorCards.sponsors[] ──► sponsor (conditional)
projectCards.projects[] ──► project (conditional)
testimonials.items[] ────► testimonial (conditional)
contactForm.form ────────► form (external)
portableText.internalLink ► page | sponsor | project | event
```

## Data Architecture

### Cloudflare D1 (Auth Database)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| user | User accounts | id, name, email, emailVerified, role, image |
| session | Active sessions | id, userId, token, expiresAt, ipAddress, userAgent |
| account | OAuth accounts | id, userId, providerId, accountId, accessToken |
| verification | Magic link tokens | id, identifier, value, expiresAt |

### Sanity Content Lake

| Document Type | Count | Purpose |
|---------------|-------|---------|
| page | 8+ | Page builder pages |
| siteSettings | 1 | Singleton site config |
| sponsor | 7+ | Industry sponsors |
| project | 7+ | Capstone projects |
| testimonial | 10+ | Quotes and reviews |
| event | 7+ | Calendar events |
| submission | 0+ | Contact form submissions |
| sanity.imageAsset | 24+ | Uploaded images |

### KV Store

| Namespace | Key Pattern | TTL | Purpose |
|-----------|-------------|-----|---------|
| SESSION_CACHE | `session:{token}` | 300s | Session validation cache |

## Testing Architecture

### Test Pyramid

```
                    ┌──────────┐
                    │   E2E    │  14 files × 5 browsers = 70 runs
                    │Playwright│  smoke, a11y, SEO, nav, content
                    ├──────────┤
                    │Integration│  22 files (schema, data, deploy)
                    │  Vitest   │  Block schemas, page templates
                ┌───┴──────────┴───┐
                │  Component Tests  │  42 files (Astro Container API)
                │     Vitest        │  Block rendering, fixtures
            ┌───┴──────────────────┴───┐
            │       Unit Tests          │  11 files (lib utilities)
            │         Vitest            │  cn(), urlFor(), queries, auth
            ├───────────────────────────┤
            │     Visual Testing        │  120+ Storybook stories
            │   Storybook + Chromatic   │  UI primitives, blocks, portal
            └───────────────────────────┘
```

### Browser Matrix (E2E)

| Project | Device | Resolution |
|---------|--------|------------|
| chromium | Desktop Chrome | default |
| firefox | Desktop Firefox | default |
| webkit | Desktop Safari | default |
| mobile-chrome | Pixel 7 | 412×915 |
| mobile-safari | iPhone 14 | 390×844 |

## Deployment Architecture

### CI/CD Pipeline

```
feature branch ──PR──► preview branch ──PR──► main branch
                  │                      │          │
                  ▼                      ▼          ▼
              ci.yml:                enforce:    release.yml:
              - unit tests           preview     - semantic-release
              - Lighthouse CI        only        - changelog + tag
                                                     │
                                                     ▼
                                              sync-preview.yml:
                                              - merge main→preview
                                              - Discord webhook
                                                     │
                                                     ▼
                                              deploy-storybook.yml:
                                              - build Storybook
                                              - deploy to GH Pages
```

### Branch Strategy

`feature → preview → main` (preview gates main, auto-sync back after release)

### Infrastructure

| Service | Platform | Purpose |
|---------|----------|---------|
| Website (SSG) | Cloudflare Pages CDN | Static HTML + assets |
| Website (SSR) | Cloudflare Workers | Portal, auth, API endpoints |
| Auth Database | Cloudflare D1 | User sessions (SQLite) |
| Session Cache | Cloudflare KV | Fast session lookups |
| Rate Limiter | Cloudflare DO | Per-IP sliding window |
| CMS | Sanity Cloud | Content management |
| Studio | Sanity Hosting | Editor interface |
| Storybook | GitHub Pages | Component library |
| Email | Resend | Magic link auth emails |

## Multi-Site Architecture

The platform supports 3 site variants from a single codebase:

| Variant | Dataset | Site ID | Theme | Port (dev) |
|---------|---------|---------|-------|------------|
| Capstone | production | capstone | red | 4321 |
| RWC US | rwc | rwc-us | blue | 4322 |
| RWC International | rwc | rwc-intl | green | 4323 |

**Implementation:**
- `PUBLIC_SANITY_DATASET` selects content dataset
- `PUBLIC_SITE_ID` filters content within dataset
- `PUBLIC_SITE_THEME` applies CSS custom property overrides (`[data-site-theme]`)
- Studio `siteField` enables per-document site assignment
- Docker Compose runs all 3 variants simultaneously

## Security Architecture

### Authentication Flow

1. User visits `/portal/login` → chooses OAuth or Magic Link
2. Better Auth handles OAuth redirect or email verification
3. On success → session stored in D1, cached in KV
4. Middleware validates session on every `/portal/*` request
5. Sponsor role escalation: checks Sanity `sponsor.allowedEmails`
6. Non-whitelisted users get student role, redirected accordingly

### Rate Limiting

- Per-IP sliding window: 100 requests per 60 seconds
- Implemented via Durable Objects with SQLite storage
- Fail-open: if DO unavailable, request proceeds
- 429 response with `Retry-After` header when exceeded

### Access Control

| Route Pattern | Required Role | Auth Method |
|---------------|---------------|-------------|
| `/portal/*` | sponsor | Better Auth + Sanity whitelist |
| `/student/*` | student | Better Auth |
| `/api/auth/*` | none | Better Auth handler |
| Public pages | none | No auth |

---
*Generated: 2026-03-11 | Scan Level: deep | Mode: full_rescan*
