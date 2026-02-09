# YWCC Capstone Sponsors — Project Overview

**Generated:** 2026-02-09 | **Scan Level:** Exhaustive | **Workflow:** document-project v1.2.0

## Executive Summary

YWCC Capstone Sponsors is a CMS-driven static website for NJIT's Ying Wu College of Computing Industry Capstone program. Content editors compose pages by stacking reusable UI blocks in Sanity Studio with zero code required. The build pipeline bakes all content into static HTML with zero runtime API calls, targeting Lighthouse 90+ scores and $0/month operating costs.

**Reference site:** [ywcccapstone1.com](https://ywcccapstone1.com)

## Project Identity

| Attribute | Value |
|---|---|
| **Project Name** | ywcc-capstone-template |
| **Repository Type** | Monorepo (npm workspaces) |
| **Parts** | 2 (`astro-app`, `studio`) |
| **Primary Language** | TypeScript |
| **Architecture** | Static Site Generation + Headless CMS |
| **License** | UNLICENSED |

## Tech Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Frontend | Astro (SSG) | 5.x |
| CMS | Sanity.io | v5 |
| UI Components | fulldev/ui (shadcn CLI) | via shadcn 3.x |
| Styling | Tailwind CSS | v4 |
| Component Docs | Storybook | 10.x |
| Testing | Playwright | 1.58+ |
| Interactivity | Vanilla JS + TypeScript | < 5KB total |
| CI/CD | GitHub Actions | Storybook deploy |
| Hosting (current) | GitHub Pages (Storybook) | - |
| Hosting (future) | Cloudflare Pages | - |
| Node.js | v24 LTS | - |

## Architecture Pattern

**Block-based page composition** — Pages are assembled from a flat array of CMS-managed blocks. Each block maps to a Sanity object schema and an Astro component. The architecture follows a "toolkit-not-website" approach where a block library maps editor-friendly names to fulldev/ui component internals.

```
Content Editor → Sanity Studio → Webhook → Astro SSG Build → Static HTML → Cloudflare Pages
```

## Key Goals

- Content editors build and update pages independently (no developer involvement)
- Prospective sponsors discover the program and submit inquiries
- Students find team assignments, project details, and key dates
- $0/month operating cost using free tiers
- Lighthouse 90+ across all categories on every page

## Parts Overview

### astro-app (Web Frontend)
- **Type:** Static Site Generator
- **Framework:** Astro 5.x with `output: 'static'`
- **Styling:** Tailwind CSS v4 (CSS-first config, no tailwind.config.mjs)
- **Components:** 251 UI primitives + 102 pre-built blocks + 13 custom blocks
- **Pages:** 6 routes (/, /about, /contact, /projects, /sponsors, /[...slug])
- **Templates:** 5 layout templates (Default, FullWidth, Landing, Sidebar, TwoColumn)

### studio (Sanity CMS Studio)
- **Type:** Headless CMS admin interface
- **Framework:** Sanity v5 with React 19
- **Schemas:** 3 document types + 11 block schemas + 4 object schemas
- **Features:** Visual editing, Presentation tool, Structure tool, Vision tool
- **Singleton:** Site Settings (fixed document ID)

## Performance Targets

| Metric | Target |
|---|---|
| Lighthouse Performance | 95+ |
| Lighthouse Accessibility | 90+ |
| Cumulative Layout Shift | < 0.05 |
| JS payload | < 5KB minified |
| CSS payload | < 15KB after purge |
