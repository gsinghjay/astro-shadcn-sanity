---
title: "Migration Assessment: Sanity + Astro to PayloadCMS + Next.js"
description: "Effort estimate and feasibility analysis for migrating from Sanity + Astro to PayloadCMS + Next.js on a self-hosted VPS Docker stack"
date: 2026-02-20
status: assessment-complete
complements: vps-migration-plan.md
---

# Migration Assessment: Sanity + Astro to PayloadCMS + Next.js

> **Last updated:** 2026-02-20
> **Status:** Assessment Complete
> **Complements:** [VPS Migration Plan](vps-migration-plan.md)
> **Decision:** No-go for post-midterm (Apr 3 - Apr 23). Viable for summer 2026 roadmap.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Scope of Change](#2-scope-of-change)
3. [Current Codebase Inventory](#3-current-codebase-inventory)
4. [Detailed Effort Breakdown](#4-detailed-effort-breakdown)
5. [Docker Stack Comparison](#5-docker-stack-comparison)
6. [Lighthouse 89+ Risk Assessment](#6-lighthouse-89-risk-assessment)
7. [Epic 9 Impact](#7-epic-9-impact)
8. [What You Lose vs Gain](#8-what-you-lose-vs-gain)
9. [Recommendation and Timeline Options](#9-recommendation-and-timeline-options)
10. [Decision Matrix](#10-decision-matrix)

---

## 1. Executive Summary

This assessment evaluates migrating the full stack from **Sanity + Astro + Cloudflare Pages** to **PayloadCMS + Next.js + VPS Docker**. The migration offers compelling architectural advantages:

- **Docker stack collapses from 7 containers to 4** (Authentik eliminated)
- **Memory drops from ~615-845 MB to ~205-385 MB** at idle
- **All 15 Epic 9 stories become feasible and most get simpler**
- **Content updates become instant** (no rebuild webhook pipeline)
- **Unified TypeScript/React stack** with built-in auth

However, the **frontend rewrite requires 4-7 weeks** (with team parallelization), making it infeasible within the 3-week post-midterm window (Apr 3 - Apr 23).

**Key clarification:** This migration uses **React shadcn/ui** (the canonical library) — not porting custom Astro components. Only existing custom blocks and actually-used UI components are brought over. The ~95 generic numbered UI blocks (hero-1..14, cta-1..8, etc.) are **not migrated** — new blocks will be built with shadcn/React as needed.

---

## 2. Scope of Change

### What Changes

| Layer | Current | Target | Effort |
|-------|---------|--------|--------|
| CMS | Sanity (hosted, GROQ, Portable Text) | PayloadCMS 3.x (self-hosted, Local API, Lexical) | Medium |
| Frontend framework | Astro (zero client JS) | Next.js App Router (React Server Components) | High |
| UI components | Custom Astro shadcn (~32 used) | React shadcn/ui (canonical library) | **Low-Medium** |
| CMS blocks | 13 custom Astro blocks | 13 React blocks using shadcn/ui | Medium |
| Rich text | Portable Text + astro-portabletext | Lexical + @payloadcms/richtext-lexical | Medium |
| Image pipeline | Sanity CDN + urlFor() + LQIP (20 files) | next/image + sharp + local/S3 storage | Medium |
| Auth | Cloudflare Access / Authentik | PayloadCMS built-in auth | Low-Medium |
| Database | Sanity Content Lake + PostgreSQL (app) | PostgreSQL (unified: CMS + app) | Low |
| Hosting | Cloudflare Pages / VPS Docker (7 containers) | VPS Docker (4 containers) | Low |
| CI/CD | GitHub Actions + Sanity webhook rebuild | GitHub Actions (no webhook needed) | Low |
| Queries | 13 GROQ queries (defineQuery) | PayloadCMS Local API calls | Medium |
| Visual Editing | Stega + Presentation Tool + Server Islands | PayloadCMS Live Preview | Medium |

### What Stays the Same

- Tailwind CSS, class-variance-authority, clsx, tailwind-merge (framework-agnostic)
- PostgreSQL (already in VPS plan)
- Docker deployment model, nginx, Let's Encrypt, GitHub Actions runner
- GTM/GA4 analytics (client-side)
- Content structure and information architecture

---

## 3. Current Codebase Inventory

### Component Usage (Actually Used)

| Category | Total Files | Actually Imported | Critical Path |
|----------|------------|-------------------|---------------|
| UI components (astro-app/src/components/ui/) | 38 directories | **32 used** | 9 core (Section, Icon, Button, Image, Tile, Item, Avatar, Rating, List) |
| Custom CMS blocks | 13 | 13 (all used) | All |
| Generic numbered UI blocks (hero-1..14, etc.) | **101** | Used by page builder | **NOT migrating** — rebuild with shadcn as needed |
| Unused UI components | 6 | 0 | Alert, Empty, Label, Skeleton, Spinner, Tabs |

### Core UI Components (Must Migrate)

These 9 components account for 61% of all UI component imports:

| Component | Import Count | Sub-files | Migration Approach |
|-----------|-------------|-----------|-------------------|
| Section | 111 | 11 | Custom React component (layout wrapper) |
| Icon | 106 | 1 | Switch to lucide-react |
| Button | 96 | 2 | Use shadcn/ui Button directly |
| Image | 46 | 2 | Use next/image + custom wrapper |
| Tile | 45 | 9 | Use shadcn/ui Card + custom variants |
| Item | 31 | 8 | Custom React component |
| Avatar | 27 | 4 | Use shadcn/ui Avatar directly |
| Rating | 22 | 1 | Custom React component |
| List | 21 | 3 | Custom React component |

### Additional Used Components (23 more)

Logo, Badge, Video, Price, Sheet, Marquee, Accordion, Sidebar, Header, Footer, Auto-form, Collapsible, Theme-toggle, Navigation-menu, Separator, Native-carousel, Banner, Checkbox, Input, Textarea, Table, Radio-group, Native-select, Field.

Many of these have direct shadcn/ui React equivalents (Accordion, Sheet, Sidebar, Input, Checkbox, Textarea, Table, etc.).

### Pages and Routes (9 total)

| Route | Type | Notes |
|-------|------|-------|
| `index.astro` | Static (SSG) | Homepage, page builder |
| `[...slug].astro` | Static (SSG) | CMS catch-all, 5 templates |
| `sponsors/index.astro` | Static (SSG) | Sponsor listing |
| `sponsors/[slug].astro` | Static (SSG) | Sponsor detail |
| `projects/index.astro` | Static (SSG) | Project listing |
| `projects/[slug].astro` | Static (SSG) | Project detail |
| `events/[slug].astro` | Static (SSG) | Event detail |
| `portal/index.astro` | SSR | Authenticated portal |
| `portal/api/me.ts` | SSR API | User identity endpoint |

### CMS Schema (Sanity)

| Type | Count | Migration Complexity |
|------|-------|---------------------|
| Document types | 7 (page, siteSettings, sponsor, project, testimonial, event, submission) | Medium — near-1:1 to PayloadCMS collections |
| Object types | 8 (seo, button, link, portableText, featureItem, faqItem, statItem, stepItem) | Low — become PayloadCMS groups/blocks |
| Block types (page builder) | 13 | Medium — map to PayloadCMS `blocks` field |
| GROQ queries | 13 | Medium — rewrite as Local API calls |
| Portable Text locations | 5 (project.content, faqItem.answer, richText block, textWithImage block, custom callout) | Medium — convert to Lexical |

---

## 4. Detailed Effort Breakdown

### 4A. Frontend Migration: Astro to Next.js (4-7 weeks with team)

**Key reduction from original estimate:** Using React shadcn/ui (canonical library) instead of porting Astro components, and not migrating the ~95 generic numbered blocks.

| Category | Count | Effort | Notes |
|----------|-------|--------|-------|
| React shadcn/ui setup + config | 1 | 1-2 days | `npx shadcn@latest init` — most components available out of box |
| Custom UI components (Section, Tile, Item, Rating, List, etc.) | ~10 custom | 3-5 days | Only components without shadcn/ui equivalents |
| Custom CMS blocks (13) | 13 | 1-2 weeks | Core page builder logic + data fetching + rendering |
| Pages + layouts + templates | 9 pages, 3 layouts, 5 templates | 3-5 days | App Router structure |
| Block registry + renderer | 3 core files | 2-3 days | Architecture-level rewrite |
| Lib files (data access, image, types, cache) | ~8 | 2-3 days | New PayloadCMS data access layer |
| Middleware + actions + API routes | 3 | 1-2 days | Near-direct port |
| Storybook migration (Astro -> React) | ~25 stories | 3-5 days | React Storybook is more mature |
| Test migration (Vitest + Playwright) | ~30 files | 1 week | Config + component test updates |
| Integration, debugging, polish | — | 1-2 weeks | Inevitable integration issues |
| **Subtotal** | | **4-7 weeks** (with 3-4 devs in parallel) | |

**vs original estimate:** Down from 8-14 weeks because:
1. shadcn/ui React components are ready-made (Accordion, Sheet, Button, Input, etc.)
2. Not porting 101 generic numbered blocks
3. Only 32 actually-used UI components, not 150+

### 4B. CMS Migration: Sanity to PayloadCMS (2-3 weeks)

| Category | Count | Effort | Notes |
|----------|-------|--------|-------|
| Collection definitions (document types) | 7 | 3-4 days | Near-1:1 mapping |
| Object types → PayloadCMS groups/fields | 8 | 2-3 days | Straightforward |
| Block types (page builder) | 13 | 4-5 days | Map to `blocks` field type |
| defineBlock base fields pattern | 1 | 1 day | Shared field config in PayloadCMS |
| Access control rules | Per-collection | 2-3 days | PayloadCMS access functions |
| Admin panel customization | Singletons, structure | 2-3 days | PayloadCMS admin config |
| Portable Text -> Lexical content migration | ~200 docs | 3-5 days | Custom converter script |
| GROQ -> Local API query rewrite | 13 queries | 3-4 days | PAGE_BY_SLUG is most complex |
| Hooks (afterChange, validation) | ~5 | 1-2 days | Well-documented |
| Form builder setup | 1 plugin | 2-4 hours | `@payloadcms/plugin-form-builder` — official first-party plugin, direct replacement for `@sanity/form-toolkit` |
| **Subtotal** | | **2-3 weeks** | Can run in parallel with frontend |

### 4C. Content Migration (1-2 days)

| Task | Effort |
|------|--------|
| Export ~200 docs from Sanity via GROQ | 2-4 hours |
| Transform Portable Text -> Lexical format | 4-8 hours |
| Import into PayloadCMS via Local API | 2-4 hours |
| Download + re-upload media assets | 1-2 hours |
| Verification and cleanup | 2-4 hours |
| **Subtotal** | **1-2 days** |

### 4D. Infrastructure (3-5 days)

| Task | Effort |
|------|--------|
| Docker Compose for PayloadCMS stack (4 containers) | 4-8 hours |
| nginx config (simplified, no auth blocks) | 2-4 hours |
| Dockerfile (Next.js standalone build) | 2-4 hours |
| PostgreSQL backup strategy (pg_dump cron) | 2-4 hours |
| CI/CD pipeline update | 4-8 hours |
| DNS / Cloudflare proxy + SSL setup | 3-6 hours |
| **Subtotal** | **3-5 days** |

### 4E. Auth System (3-5 days)

| Task | Effort |
|------|--------|
| PayloadCMS auth collection (users/sponsors) | 4-8 hours |
| Role-based access control (admin, sponsor roles) | 4-8 hours |
| OAuth integration (payload-authjs) | 8-16 hours |
| Login/registration flows | 4-8 hours |
| **Subtotal** | **3-5 days** |

### 4F. Total Effort Summary

| Component | Duration | Parallel? |
|-----------|----------|-----------|
| Frontend (Astro -> Next.js) | 4-7 weeks | **Critical path** |
| CMS (Sanity -> PayloadCMS) | 2-3 weeks | Yes (parallel with frontend) |
| Content migration | 1-2 days | End of project |
| Infrastructure | 3-5 days | Yes (parallel) |
| Auth system | 3-5 days | Yes (parallel with CMS) |
| **Total elapsed** | **~5-8 weeks** | With 3-4 devs in parallel |

---

## 5. Docker Stack Comparison

### Side-by-Side

```
VPS PLAN (Sanity + Astro + Authentik)     PAYLOADCMS STACK
7 containers, ~615-845 MB idle            4 containers, ~205-385 MB idle
┌──────────────────────────────┐          ┌──────────────────────────────┐
│ nginx               ~10 MB  │          │ nginx               ~10 MB  │
│ Astro Node.js      ~100 MB  │          │ Next.js + PayloadCMS ~300 MB │
│ Authentik server   ~220 MB  │          │ PostgreSQL           ~60 MB  │
│ Authentik worker   ~160 MB  │          │ certbot                      │
│ PostgreSQL          ~60 MB  │          └──────────────────────────────┘
│ Redis               ~15 MB  │
│ certbot                     │
└──────────────────────────────┘
```

### Memory Budget on 2 GB VPS

| Component | VPS Plan | PayloadCMS Stack |
|-----------|----------|-----------------|
| Linux kernel + OS | ~150-200 MB | ~150-200 MB |
| Docker daemon | ~60-80 MB | ~60-80 MB |
| nginx | ~5-10 MB | ~5-10 MB |
| Application server | ~50-100 MB (Astro) | ~150-300 MB (Next.js + PayloadCMS) |
| Auth system | ~300-380 MB (Authentik) | **0 MB (built-in)** |
| PostgreSQL | ~40-60 MB | ~40-60 MB |
| Redis | ~10-15 MB | **0 MB (optional)** |
| **Total at idle** | **~615-845 MB** | **~405-650 MB** |
| **Headroom** | ~1,155-1,385 MB | **~1,350-1,595 MB** |

PayloadCMS stack has **~200-400 MB more headroom** despite Next.js being heavier than Astro, because Authentik is eliminated.

**Caveat:** Real-world reports suggest Next.js + PayloadCMS can use ~600 MB including cache under load. The 2 GB VPS works but with less margin. Cap Node.js heap with `NODE_OPTIONS=--max-old-space-size=256` if needed. Upgrading to a 4 GB VPS ($12/month) provides comfortable headroom.

### What Gets Eliminated

| Component | Why |
|-----------|-----|
| Authentik server + worker (2 containers) | PayloadCMS has built-in auth with RBAC |
| Redis | No longer needed for auth sessions (JWT-based) |
| Sanity API CDN dependency | Content served from local PostgreSQL |
| Sanity webhook -> repository_dispatch pipeline | Content changes are instant DB writes |
| nginx auth_request blocks (~60% of config) | Auth handled internally by PayloadCMS |
| External Sanity Studio hosting | Admin panel at `/admin` route |
| Separate Drizzle ORM schema | PayloadCMS collections ARE the schema |

### Simplified nginx Config

The entire Authentik section (outpost, auth_request, identity headers, `/if/` routes, `/ws/` websocket, `/api/` proxy) is deleted. nginx becomes a straightforward reverse proxy:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL + security headers (same as VPS plan)

    location / {
        proxy_pass http://payload:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /_next/static/ {
        proxy_pass http://payload:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Gzip (same as VPS plan)
}
```

### Simplified CI/CD

```yaml
# No more Sanity webhook trigger needed
on:
  push:
    branches: [main]
  # Content changes don't need rebuilds — SSR reads from DB

jobs:
  deploy:
    runs-on: [self-hosted, vps]
    steps:
      - uses: actions/checkout@v4
      - name: Build and deploy
        run: docker compose up -d --build payload
      - name: Run migrations
        run: docker compose exec -T payload npx payload migrate
```

---

## 6. Lighthouse 89+ Risk Assessment

### Current State (Astro)

The site ships **near-zero client JavaScript** — only 1 `client:only` component (dev-only visual editing). All public pages are pure HTML+CSS. Estimated Performance score: **95+**.

### After Migration (Next.js)

| Metric | Risk | Why | Mitigation |
|--------|------|-----|------------|
| **LCP** | Medium | next/image adds JS loader (~20kB) | Use `priority` prop on hero images, `sizes` attribute |
| **TBT** | Medium-High | React runtime hydration (~85-100kB gzipped) | Minimize `'use client'` components |
| **CLS** | Low | next/image handles dimensions | Proper width/height |
| **FCP** | Low | Server-rendered HTML | SSG/ISR for public pages |
| **INP** | Low-Medium | React event handling overhead | Minimal interactive components |

### Strategies to Hit 89+ Performance

1. **SSG for all public pages** (`generateStaticParams`) — SSR only for `/portal/*`
2. **Limit `'use client'` to**: accordion toggles, form interactions, carousel, GTM events
3. **`next/font`** for font optimization (improvement over current manual approach)
4. **`<Script strategy="lazyOnload">`** for GTM
5. **Route-level code splitting** (automatic in App Router)
6. **Tree-shake icon imports** from lucide-react
7. **ISR with revalidation** for CMS pages (content freshness without full rebuilds)

### Realistic Score Expectations

| Category | Current (Astro) | Expected (Next.js) | Target Met? |
|----------|----------------|-------------------|-------------|
| Performance | 95+ | **85-92** | Tight — achievable with discipline |
| Accessibility | 95+ | 95+ | Yes |
| Best Practices | 95+ | 95+ | Yes |
| SEO | 95+ | 95+ | Yes (Next.js metadata API is excellent) |

**The 89+ Performance target is achievable but requires strict discipline** on client-side JavaScript. Every `'use client'` component adds bundle weight. The current Astro site's near-zero JS is a luxury that Next.js cannot replicate.

---

## 7. Epic 9 Impact

Every story that was constrained by Cloudflare free-tier limits or required Authentik becomes simpler with PayloadCMS:

| Story | VPS Plan (Sanity + Authentik) | PayloadCMS Stack | Change |
|-------|------------------------------|------------------|--------|
| 9.1 Auth config | Authentik setup + proxy config | `auth: true` on collection | **Simpler** |
| 9.2 Sponsor project view | Astro SSR + GROQ | Next.js RSC + Local API | Same |
| 9.3 Events & program info | Astro SSR + GROQ | Next.js RSC + Local API | Same |
| 9.4 Dev dashboard | Astro SSR | Next.js RSC | Same |
| 9.5 Site health CI | Filesystem + PostgreSQL | Same | Same |
| 9.6 Site health dashboard | Read from filesystem + PostgreSQL | Same | Same |
| 9.7 Submission dashboard | GA4 Data API | Same | Same |
| 9.8 Database setup | Separate Drizzle ORM schema | **Collections ARE the schema** | **Simpler** |
| 9.9 Activity tracking | Drizzle ORM writes | **PayloadCMS hooks (afterChange, afterLogin)** | **Simpler** |
| 9.10 Event RSVPs | Drizzle ORM + access control | PayloadCMS collection + access | **Simpler** |
| 9.11 Evaluations | Drizzle ORM + JSONB | PayloadCMS collection + JSON field | **Simpler** |
| 9.12 Agreement signatures | Drizzle ORM | PayloadCMS collection | Same |
| 9.13 Notifications | Custom implementation | **PayloadCMS hooks (server-side)** | **Simpler** |
| 9.14 Multi-provider auth | Authentik federation | payload-authjs plugin (Auth.js) | **Similar** |
| 9.15 Admin analytics | PostgreSQL aggregates | Same (Local API + SQL) | **Simpler** |

**Result:** All 15 stories feasible. 7 stories become simpler, 7 stay the same, 1 is similar.

---

## 8. What You Lose vs Gain

### What You Lose

| Sanity Feature | Impact | PayloadCMS Alternative |
|---------------|--------|----------------------|
| Managed CDN for images (urlFor + LQIP) | Medium | next/image + sharp (good, not identical) |
| GROQ query language | Low | PayloadCMS Local API (typed, in-process) |
| Real-time collaboration (presence, co-editing) | Low | Not available (small team, rarely needed) |
| Managed infrastructure (zero-ops CMS) | Medium | Self-hosted: you own backups, updates |
| Visual Editing (stega + Presentation tool) | Medium | PayloadCMS Live Preview (different paradigm) |
| @sanity/form-toolkit plugin | **None** | `@payloadcms/plugin-form-builder` — official first-party plugin with dynamic form schemas, submission storage, email notifications, and custom confirmation flows |
| Sanity free tier (500K CDN requests/month) | Low | N/A — local DB has no API call limits |
| LQIP blur placeholders (built into metadata) | Low-Medium | Custom implementation with sharp/plaiceholder |

### What You Gain

| Capability | Value |
|-----------|-------|
| Built-in authentication (eliminates Authentik) | **High** — saves ~380 MB, removes 2 containers + all OAuth proxy config |
| Self-hosted data ownership | **High** — full PostgreSQL access, no vendor lock-in |
| Instant content updates (no rebuild needed) | **High** — editors see changes immediately |
| Unified TypeScript/React stack | **Medium** — one language, one framework |
| PayloadCMS Local API (in-process queries) | **Medium** — zero HTTP overhead for data fetching |
| Simplified Docker stack (4 vs 7 containers) | **Medium** — less to maintain, monitor, debug |
| ~200-400 MB more memory headroom | **Medium** — more room for traffic spikes |
| No external CMS vendor dependency | **Medium** — immune to Sanity pricing changes |
| Single PostgreSQL for everything | **Medium** — one backup strategy, one DB |
| MCP plugin for AI-assisted workflows | **Medium** — `payload-plugin-mcp` auto-generates tools per collection, works with Claude Desktop/Cursor. Direct replacement for current Sanity MCP workflow |

---

## 9. Recommendation and Timeline Options

### Verdict: NO-GO for Post-Midterm

**Why it doesn't fit:**

| Constraint | Available | Needed |
|-----------|-----------|--------|
| Calendar time | 20 days (Apr 3-23) | ~35-56 days (5-8 weeks) |
| Developer bandwidth | Shared with Sprint 5, QA, docs, presentations | Dedicated team of 3-4 |
| Risk tolerance | Zero — capstone grading depends on working site | High — full rewrite of production system |

**The math doesn't work.** Even the reduced estimate (4-7 weeks frontend with team parallelization) exceeds the 3-week window. The team also has Sprint 5 deliverables, bug fixes, documentation, and final presentation prep competing for those same weeks.

### Recommended Path

**Now through Apr 23:** Execute the existing VPS migration plan (Sanity + Astro + Authentik). All 15 Epic 9 stories are feasible on this stack.

**Summer 2026 (post-capstone):** Execute PayloadCMS + Next.js migration with dedicated effort.

### Summer Migration Phases

| Phase | Duration | Team | Deliverable |
|-------|----------|------|-------------|
| 1. PayloadCMS setup | 2 weeks | 1-2 devs | All 7 collections + 13 blocks + admin + auth |
| 2. Next.js scaffold | 1-2 weeks | 2-3 devs | App Router, layouts, shadcn/ui, data layer |
| 3. Component conversion | 2-3 weeks | 3-4 devs | All pages, blocks, and used components |
| 4. Portal + Epic 9 features | 1-2 weeks | 2 devs | Auth, portal routes, hooks |
| 5. Content migration | 3-5 days | 1 dev | Sanity export -> PayloadCMS import |
| 6. Lighthouse + polish | 1 week | 1-2 devs | 89+ scores confirmed, E2E tests passing |
| **Total** | **~8-10 weeks** | 3-4 devs avg | Full migration complete |

### Alternative: CMS-Only Swap (Option C) — PayloadCMS + Astro

If the primary goal is eliminating external CMS dependency and simplifying the Docker stack without the Lighthouse risk of Next.js:

1. **Replace Sanity with PayloadCMS** but **keep Astro** as the frontend
2. PayloadCMS admin panel runs as a separate Next.js service (or on a separate port/route) — it requires Next.js for the admin UI
3. Astro queries PayloadCMS via **REST API** at build time (`fetch()` to `/api/[collection]` endpoints)
4. Preserves Astro's zero-JS performance advantage (Lighthouse 95+)
5. Effort: ~4-6 weeks (no frontend framework rewrite)

**Astro + PayloadCMS integration status:**

| Integration | Type | Notes |
|------------|------|-------|
| [Astro CMS Guide](https://docs.astro.build/en/guides/cms/payload/) | Official Astro docs | REST API `fetch()` pattern — documented and supported |
| [astro-payload-plugin](https://github.com/coxmi/astro-payload-plugin) | Community | Runs PayloadCMS Local API inside Astro (same server). Early-stage: 3 stars, last active 2023 |
| PayloadCMS official Astro support | [Discussion #10928](https://github.com/payloadcms/payload/discussions/10928) | No official integration planned. Lexical rich text uses React Server Components which don't work in Astro templates |

**Key limitation:** PayloadCMS's Lexical rich text editor outputs React Server Components for rendering. In an Astro frontend, you'd need to either: (a) use `@portabletext/react`-style custom renderers but for Lexical's JSON format, or (b) render rich text via PayloadCMS's REST API HTML serialization. No equivalent of `astro-portabletext` exists for Lexical yet.

**Architecture for Option C:** Two containers — PayloadCMS/Next.js (admin panel + API on port 3000) and Astro (frontend on port 4321). nginx routes `/admin/*` and `/api/*` to PayloadCMS, everything else to Astro. Astro fetches content from PayloadCMS REST API at build time. ISR equivalent via Astro's on-demand revalidation.

---

## 10. Decision Matrix

| Option | Effort | Timeline | Lighthouse | Epic 9 | VPS Memory | Containers | Maintenance |
|--------|--------|----------|-----------|--------|-----------|------------|-------------|
| **A. VPS plan as-is** (Sanity + Astro + Authentik) | Low | Fits deadline | 95+ | All 15 | ~615-845 MB | 7 | Moderate |
| **B. PayloadCMS + Next.js** (full migration) | High | 5-8 weeks | 85-92 | All 15 (simpler) | ~205-385 MB | 4 | Lower |
| **C. PayloadCMS + Astro** (CMS swap only) | Medium | 4-6 weeks | 95+ | All 15 (simpler) | ~305-535 MB | 5 (Astro + PayloadCMS/Next.js + PG + nginx + certbot) | Lower |
| **D. Sanity + Next.js** (framework swap only) | High | 4-7 weeks | 85-92 | All 15 | ~615-845 MB | 7 | Moderate |

**Recommendation: Option A now. Evaluate Option B or C for post-capstone.**

---

## Appendix A: PayloadCMS vs Sanity Feature Comparison

| Feature | PayloadCMS 3.x | Sanity |
|---------|---------------|--------|
| Schema definition | CollectionConfig / GlobalConfig (TypeScript) | defineType / defineField (TypeScript) |
| Rich text | Lexical (Meta's editor) | Portable Text (array-based) |
| Image handling | Upload collection + storage adapters | Dedicated image type + CDN |
| Query language | Local API / REST / GraphQL | GROQ (proprietary) |
| Authentication | Built-in (JWT, RBAC, field-level access) | None (external auth required) |
| Form builder | `@payloadcms/plugin-form-builder` (official first-party) | `@sanity/form-toolkit` (official) |
| Page builder | `blocks` field type | `array` of block types |
| Draft/publish | `versions: { drafts: true }` | Draft prefix system |
| Live preview | Built-in for Next.js | Presentation tool + stega |
| Database | PostgreSQL, MongoDB, SQLite, D1 | Proprietary Content Lake |
| Hosting | Self-hosted (any platform) | Managed (sanity.io) |
| Localization | Built-in field-level | Field-level (similar) |
| Hooks | Extensive (before/after CRUD) | Document actions + webhooks |
| Admin panel | React-based, customizable | React-based (Studio), customizable |
| MCP (AI integration) | `payload-plugin-mcp` (official) — auto-generates tools per collection | Sanity MCP Server (official) — schema, query, CRUD tools |
| Pricing | Free (self-hosted) | Free tier with limits |

## Appendix B: Files Affected

### Files to Create (in repo)

| File | Purpose |
|------|---------|
| `payload.config.ts` | PayloadCMS configuration (collections, globals, plugins) |
| `src/collections/*.ts` | 7 collection definitions |
| `src/blocks/*.ts` | 13 block definitions |
| `src/globals/*.ts` | siteSettings global |
| `src/access/*.ts` | Access control functions |
| `next.config.js` | Next.js configuration |
| `Dockerfile` | Next.js standalone + PayloadCMS |
| `docker-compose.yml` | 4-container stack |

### Files to Delete (from repo)

| File | Reason |
|------|--------|
| `astro-app/` (entire directory) | Replaced by Next.js app |
| `studio/` (entire directory) | Replaced by PayloadCMS admin |
| `astro-app/wrangler.jsonc` | No Cloudflare deployment |
| `.github/workflows/sanity-deploy.yml` | No Sanity webhook |

### Files to Modify

| File | Change |
|------|--------|
| `package.json` | Root workspace config for Next.js + PayloadCMS |
| `.github/workflows/deploy.yml` | Simplified CI/CD |
| `docs/cloudflare-guide.md` | Add note about migration |
| `CLAUDE.md` | Update commands, patterns, boundaries |

## Appendix C: CMS Schema Mapping Reference

| Sanity Type | PayloadCMS Equivalent | Notes |
|------------|----------------------|-------|
| `defineType({ type: 'document' })` | `CollectionConfig` | 1:1 mapping |
| `defineType({ type: 'object' })` | Named field group or block | Depends on usage context |
| `defineField({ type: 'string' })` | `{ type: 'text' }` | |
| `defineField({ type: 'text' })` | `{ type: 'textarea' }` | |
| `defineField({ type: 'number' })` | `{ type: 'number' }` | |
| `defineField({ type: 'boolean' })` | `{ type: 'checkbox' }` | |
| `defineField({ type: 'image' })` | `{ type: 'upload', relationTo: 'media' }` | Media collection required |
| `defineField({ type: 'reference' })` | `{ type: 'relationship', relationTo: '...' }` | |
| `defineField({ type: 'array' })` | `{ type: 'array' }` | |
| `defineField({ type: 'object' })` | `{ type: 'group' }` | |
| `defineField({ type: 'slug' })` | `{ type: 'text' }` + custom hook | No built-in slug type |
| `defineField({ type: 'datetime' })` | `{ type: 'date' }` | |
| `defineField({ type: 'url' })` | `{ type: 'text' }` + validation | No built-in URL type |
| Portable Text blocks | `{ type: 'richText' }` (Lexical) | Different rich text model |
| Page builder array | `{ type: 'blocks', blocks: [...] }` | Near-identical pattern |
| Singleton document | `GlobalConfig` | Built-in singleton support |
