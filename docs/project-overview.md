# Project Overview

## Executive Summary
- Name: ywcc-capstone-template (YWCC Industry Capstone)
- Version: 1.11.0
- Repository type: Monorepo (npm workspaces + standalone parts)
- Primary language: TypeScript (with Python for discord-bot)
- Description: YWCC Capstone Websites — Astro + Sanity monorepo for the YWCC Industry Capstone Spring 2026 program
- Purpose: Block-based CMS website with page builder, sponsor portal, student portal, event calendar, project showcase
- Multi-site: Supports 3 site variants (Capstone red, RWC US blue, RWC International green)

## Project Parts

| Part | Path | Type | Framework | Version |
|------|------|------|-----------|---------|
| astro-app | astro-app/ | Web Frontend | Astro 5.17 + React 19 + Tailwind 4 | 0.0.1 |
| studio | studio/ | CMS Admin | Sanity Studio v5.14 | 1.0.0 |
| rate-limiter-worker | rate-limiter-worker/ | Backend Worker | Cloudflare Worker (TypeScript) | 1.0.0 |
| discord-bot | discord-bot/ | Backend | Python FastAPI + discord.py | 0.1.0 |

## Technology Stack Summary

### Frontend (astro-app)
| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Astro | ^5.17.1 |
| UI Library | React | ^19.2.4 |
| Styling | Tailwind CSS | ^4.1.18 |
| Language | TypeScript | ^5.9.3 |
| Build Tool | Vite | ^7.3.1 |
| Typography | @tailwindcss/typography | ^0.5.19 |
| Animations | tw-animate-css | ^1.4.0 |
| Icons | @iconify-json/lucide + simple-icons | ^1.2.89 |
| Component Variants | class-variance-authority | ^0.7.1 |
| Class Merging | clsx + tailwind-merge | ^2.1.1 / ^3.4.0 |
| Auth | better-auth | ^1.5.0 |
| Database ORM | drizzle-orm | ^0.45.1 |
| State Mgmt | nanostores + @preact/signals | ^1.1.0 / ^2.8.1 |
| Calendar | @schedule-x/calendar + react | ^4.2.0 |
| Email | resend | ^6.9.3 |
| Date/Time | temporal-polyfill | ^0.3.0 |
| Portable Text | astro-portabletext + @portabletext/to-html | ^0.10.0 / ^5.0.1 |

### CMS (studio)
| Category | Technology | Version |
|----------|-----------|---------|
| CMS | Sanity | ^5.14.1 |
| Integration | @sanity/astro | ^3.2.11 |
| Visual Editing | @sanity/visual-editing | ^5.2.1 |
| Image URLs | @sanity/image-url | ^1.2.0 |
| GROQ | groq | ^5.8.1 |
| Plugin | @sanity/form-toolkit | ^2.2.3 |

### Deployment
| Category | Technology | Version |
|----------|-----------|---------|
| Adapter | @astrojs/cloudflare | ^12.6.12 |
| CLI | wrangler | ^4.63.0 |
| Worker Name | ywcc-capstone | - |
| Compat Date | 2025-12-01 | - |
| Compat Flags | nodejs_compat, disable_nodejs_process_v2 | - |
| Output Mode | static (with per-route SSR) | - |
| Database | Cloudflare D1 (SQLite) | - |
| KV | SESSION_CACHE (session caching) | - |
| Durable Objects | SlidingWindowRateLimiter | - |
| Auth | Better Auth (Google OAuth, GitHub OAuth, Magic Link) | - |

### Testing
| Category | Technology | Version |
|----------|-----------|---------|
| Unit/Component | Vitest | ^3.2.1 |
| Coverage | @vitest/coverage-v8 | ^3.2.1 |
| E2E | Playwright | ^1.58.2 |
| Accessibility | @axe-core/playwright | ^4.11.1 |
| Visual | Storybook | ^10.2.7 |
| Storybook Framework | storybook-astro | ^0.1.0 |
| Visual Regression | Chromatic | ^15.1.1 |
| Performance | @lhci/cli (Lighthouse CI) | ^0.15.1 |

### Tooling
| Category | Technology | Version |
|----------|-----------|---------|
| Linting | ESLint | ^9.38.0 |
| Formatting | Prettier | ^3.6.2 |
| Concurrency | concurrently | ^9.1.0 |
| Release | semantic-release (conventional commits) | - |
| Node (CI) | 22 (most workflows), 24 (release) | - |
| Node (Docker) | 24-slim | - |
| UI Scaffolding | shadcn | ^4.0.0 |

## Architecture Summary
- Output: Static-first (`output: "static"`) with per-route SSR via Cloudflare Workers
- Public pages: Prerendered at build time (SSG) — 8 routes
- Portal/Auth pages: Server-rendered at request time (SSR) — 9 routes
- API endpoints: 5 server-side endpoints for auth, portal data, health checks
- Content: All content from Sanity CMS via GROQ API (no Astro content collections)
- Auth: Better Auth with Google OAuth, GitHub OAuth, Magic Link (Resend email)
- Database: Cloudflare D1 (SQLite) via Drizzle ORM for auth sessions
- Rate Limiting: Per-IP sliding window via Cloudflare Durable Objects
- Visual Editing: Sanity Presentation tool with stega encoding
- Live Content: Sanity Live Content API with sync tags for real-time updates
- Multi-site: 3 variants via env vars (PUBLIC_SITE_ID, PUBLIC_SITE_THEME, PUBLIC_SANITY_DATASET)

## Key Metrics (as of scan date 2026-03-11)
- Routes: 20 total (8 SSG, 9 SSR, 5 API)
- Layouts: 8 (3 main + 5 templates)
- Block Components: 115+ (generic UI blocks) + 23 custom Sanity blocks
- UI Primitive Families: 39
- Schema Types: 51 (7 documents, 14 objects, 25 blocks, 5 helpers)
- GROQ Queries: 15+ (all using defineQuery)
- Lib Utilities: 14 files
- Test Files: 58 unit/component + 14 E2E + 22 integration = 94 total
- Storybook Stories: 120+
- GitHub Actions Workflows: 6
- Docker Services: 5 (main + 2 RWC variants + studio + storybook)
- Environment Variables: 30+ public + 8+ server secrets

## Links
- [Architecture](./architecture.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Component Inventory](./component-inventory.md)
- [Data Models](./data-models.md)
- [Development Guide](./development-guide.md)
- [Integration Architecture](./integration-architecture.md)

---
*Generated: 2026-03-11 | Scan Level: deep | Mode: full_rescan*
