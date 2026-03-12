# YWCC Capstone Project Documentation

> Documentation index for the astro-shadcn-sanity monorepo.
> Last updated: 2026-03-11 | Scan level: deep | Mode: full_rescan

## Project Overview

- **Name:** ywcc-capstone-template (YWCC Industry Capstone)
- **Version:** 1.11.0
- **Type:** Monorepo (npm workspaces) with 4 parts
- **Primary Language:** TypeScript (+ Python for discord-bot)
- **Architecture:** Jamstack + Selective SSR (Astro 5.17 + Sanity 5.14)
- **Deployment:** Cloudflare Pages + Workers + D1 + KV + Durable Objects

### Parts

| Part | Type | Framework | Path |
|------|------|-----------|------|
| astro-app | Web Frontend (SSG + SSR) | Astro 5.17 + React 19 + Tailwind 4 | `astro-app/` |
| studio | CMS Admin | Sanity Studio v5.14 | `studio/` |
| rate-limiter-worker | Backend Worker | Cloudflare Durable Object | `rate-limiter-worker/` |
| discord-bot | Backend | Python FastAPI + discord.py | `discord-bot/` |

### Quick Reference

- **Routes:** 20 (8 SSG + 9 SSR + 5 API)
- **Schema Types:** 51 (7 documents, 14 objects, 25 blocks, 5 helpers)
- **Components:** 508+ files (23 custom blocks, 115+ generic blocks, 39 UI primitives, 15 top-level, 8 portal)
- **Tests:** 94 test files (58 unit/component + 14 E2E + 22 integration)
- **Storybook Stories:** 120+
- **CI/CD Workflows:** 6 GitHub Actions

---

## Generated Documentation

- [Project Overview](./project-overview.md) — Executive summary, tech stack, key metrics
- [Architecture](./architecture.md) — System architecture, diagrams, patterns, security
- [Source Tree Analysis](./source-tree-analysis.md) — Annotated directory tree, critical folders, entry points
- [Component Inventory](./component-inventory.md) — Full component catalog, design system, test coverage
- [Data Models](./data-models.md) — Sanity schema (51 types), D1 tables, GROQ queries
- [Development Guide](./development-guide.md) — Setup, commands, common tasks, CI/CD, conventions
- [Integration Architecture](./integration-architecture.md) — Part communication, data flows, shared deps

---

## Existing Documentation

### Infrastructure & Deployment
- [Cloudflare Guide](./cloudflare-guide.md) — Cloudflare setup and usage
- [Cloudflare Infrastructure Guide](./cloudflare-infrastructure-guide.md) — Infrastructure details
- [Cloudflare Serverless Primer](./cloudflare-serverless-primer.md) — Workers primer
- [VPS Migration Plan](./vps-migration-plan.md) — VPS migration strategy
- [Cost Optimization Strategy](./cost-optimization-strategy.md) — Cost reduction tactics
- [Rate Limiting with Durable Objects](./rate-limiting-with-durable-objects.md) — Rate limiter docs

### Authentication
- [Auth Consolidation Strategy](./auth-consolidation-strategy.md) — Authentication approach
- [Better Auth vs Identity Servers](./better-auth-vs-identity-servers.md) — Auth tech comparison

### Analytics & Images
- [GTM Analytics Strategy](./gtm-analytics-strategy.md) — Google Tag Manager strategy
- [Image Optimization Strategy](./image-optimization-strategy.md) — Image handling + optimization

---

## Getting Started

### For Development
```bash
git clone https://github.com/gsinghjay/astro-shadcn-sanity.git
cd astro-shadcn-sanity
npm install
cp astro-app/.env.example astro-app/.env
cp studio/.env.example studio/.env
# Edit .env files with your Sanity credentials
npm run dev
```

### For AI-Assisted Development
1. Start with this index to understand project structure
2. Read [Architecture](./architecture.md) for system design decisions
3. Read [Component Inventory](./component-inventory.md) for reusable components
4. Read [Data Models](./data-models.md) for content schema
5. Read [Development Guide](./development-guide.md) for commands and conventions

### Key Commands
```bash
npm run dev                    # Astro (4321) + Studio (3333)
npm run test:unit              # Vitest unit + component + integration
npm run test:chromium          # Playwright Chromium (fast E2E)
npm run typegen                # Regenerate TypeScript types from Sanity schema
npx sanity schema deploy       # Deploy schema changes (from studio/)
```

### Brownfield PRD
When planning new features, point the PRD workflow to this file (`docs/index.md`) as project context input.

---

*Generated: 2026-03-11 | Scan Level: deep | Mode: full_rescan | Workflow: document-project v1.2.0*
