# Project Overview

**Generated:** 2026-02-13 | **Mode:** Exhaustive Rescan | **Workflow:** document-project v1.2.0

## Executive Summary

**YWCC Capstone Sponsors** is a CMS-driven static website for NJIT's Ying Wu College of Computing Industry Capstone program. Content editors compose pages by stacking reusable UI blocks in Sanity Studio — zero code required. The platform connects industry sponsors with capstone teams by showcasing sponsor organizations, project proposals, team rosters, and program information.

**Reference site:** [ywcccapstone1.com](https://ywcccapstone1.com)

## Key Goals

- Content editors build and update pages independently with no developer involvement
- Prospective sponsors discover the program and submit inquiries
- Students find team assignments, project details, and key dates in one hub
- $0/month operating cost using free tiers across all services
- Lighthouse 90+ across all categories on every page

## Repository Type

**Monorepo** using npm workspaces with 2 parts:

| Part | Path | Role |
|------|------|------|
| **astro-app** | `./astro-app/` | Astro 5 frontend (SSG) — static site with block-based page composition |
| **studio** | `./studio/` | Sanity Studio v5 — headless CMS admin for content editing |

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | [Astro](https://astro.build/) | 5.17.x |
| CMS | [Sanity](https://www.sanity.io/) | 5.9.x |
| UI Components | [fulldev/ui](https://ui.full.dev) (via shadcn CLI) | — |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | 4.1.x |
| Reactive Islands | [React](https://react.dev/) | 19.2.x |
| Icons | @iconify/utils + Lucide + Simple Icons | — |
| Interactivity | Vanilla JS | < 5KB total |
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com/) | — |
| Component Dev | [Storybook](https://storybook.js.org/) | 10.2.x |
| Unit/Component Tests | [Vitest](https://vitest.dev/) | 3.2.x |
| E2E Tests | [Playwright](https://playwright.dev/) | 1.58.x |
| CI/CD | [GitHub Actions](https://github.com/features/actions) | — |
| Releases | [semantic-release](https://semantic-release.gitbook.io/) | — |
| Containerization | Docker + Docker Compose | — |

## Architecture Pattern

**Block-based page composition** — a toolkit-not-website approach where a block library maps editor-friendly names to fulldev/ui component internals (vanilla Astro components). Content editors compose pages from 11 custom blocks and 100+ UI variant blocks without touching code.

```
Editor → Sanity Studio → Webhook → Astro SSG Build → Cloudflare Pages → Visitor
```

Production builds bake all content into static HTML — zero runtime API calls. The `preview` branch uses SSR for live Visual Editing with draft content.

## Project Scale

| Metric | Count |
|--------|-------|
| Custom block components | 11 (with test coverage + Storybook stories) |
| UI variant blocks | ~100 (fulldev/ui template blocks) |
| UI primitive components | ~39 (shadcn/ui style) |
| Sanity document types | 3 (page, siteSettings, sponsor) |
| Sanity block types | 11 |
| Sanity object types | 8 |
| Page templates | 5 (default, fullWidth, landing, sidebar, twoColumn) |
| Unit/component test files | 19 |
| E2E test specs | 4 (34 test cases across 5 browser projects) |
| Integration test files | 19 (241 test cases) |
| CI/CD workflows | 7 |
| Documentation files | 134+ |

## Current Version

**v1.4.0** (2026-02-12) — Latest features include containerized dev environment and stegaClean BlockWrapper polish.

## Related Documentation

- [Architecture](./architecture.md) — System design, patterns, data flow
- [Source Tree Analysis](./source-tree-analysis.md) — Annotated directory tree
- [Component Inventory](./component-inventory.md) — Full component catalog
- [Data Models](./data-models.md) — Sanity schemas and GROQ queries
- [Development Guide](./development-guide.md) — Setup, commands, testing
- [Integration Architecture](./integration-architecture.md) — Part communication
