# Project Scope Document

## Project Overview

| Field | Detail |
|---|---|
| **Project Name** | YWCC Capstone Sponsors Platform |
| **Sponsor** | NJIT Ying Wu College of Computing |
| **Business Unit** | Industry Capstone Program |
| **IT Project Director** | Brian Bollard |
| **Project Manager** | Jose Andrew Gonzalez |
| **Requested Start Date** | February 7, 2026 |
| **Requested End Date** | May 29, 2026 |
| **Projected Start Date** | February 7, 2026 |
| **Projected End Date** | May 29, 2026 |

## Objective

Build a modular, CMS-driven static website that connects industry sponsors with NJIT capstone teams by showcasing sponsor organizations, project proposals, team rosters, and program information. Content editors compose pages by stacking reusable UI blocks in Sanity Studio with zero code required.

## Narrative

The NJIT Ying Wu College of Computing Industry Capstone program needs a centralized platform to manage its growing network of sponsors, projects, and student teams. The current process relies on scattered documents and manual updates that become outdated each semester.

This project delivers a block-based website where program administrators can create and update pages by arranging pre-built components -- hero banners, sponsor cards, project listings, timelines, and more -- directly in the Sanity CMS. The system generates a static site at build time, ensuring fast load times, zero hosting costs, and no runtime dependencies. Prospective sponsors can browse existing partnerships, learn about the program, and submit inquiry forms. Students and faculty can find team assignments, project details, and key program dates in one location.

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Sanity free tier limits (100K API requests/month) | Medium | All queries build-time only; zero runtime API calls |
| Schema changes after content entry begins | High | Deprecation pattern (never delete fields); migration scripts |
| Cloudflare migration complexity for forms | Low | Deferred until all static content is live; GitHub Pages sufficient for initial launch |
| Storybook-Astro framework compatibility | Low | Wrapper pattern proven in Epic 1; documented in constitution |
| Scope creep from new sponsor feature requests | Medium | Block library absorbs new layouts without new code |

## Dependencies

| Dependency | Details |
|---|---|
| **Frontend Framework** | Astro 5.x (static site generation) |
| **CMS** | Sanity.io 4.x (headless, free tier) |
| **Styling** | Tailwind CSS 4.x (CSS-first config) + fulldev/ui (shadcn for Astro) |
| **Language** | TypeScript 5.x throughout both workspaces |
| **Component Dev** | Storybook via storybook-astro |
| **Hosting (Phase 1)** | GitHub Pages (pure static) |
| **Hosting (Phase 2)** | Cloudflare Pages (when forms are needed) |
| **CI/CD** | GitHub Actions |
| **Node.js** | 24+ |

## Boundaries

### In Scope

- Modular block-based page composition system (12 P0 block types)
- Sponsor management with tiers, featured flags, and detail pages
- Project and team roster management with cross-reference navigation
- Program event timeline with status indicators
- SEO metadata, sitemap generation, and Open Graph tags
- GA4 analytics and Monsido accessibility monitoring
- GitHub Pages deployment with CI/CD pipeline
- Storybook component documentation
- Sponsor inquiry contact form (deferred to Phase 2 with Cloudflare)

### Out of Scope

- User authentication or login system
- Payment processing or e-commerce
- Real-time content updates (site is statically generated)
- Email notification system for form submissions
- Multi-language / internationalization support
- Custom CMS dashboard or admin portal beyond Sanity Studio

## Project Deliverables

### Phase 1: Static Platform (Epics 1--5)

- Monorepo with Astro frontend + Sanity Studio CMS
- 12 reusable block components composable in Sanity Studio
- 7 document types (page, site-settings, sponsor, project, team, event, submission)
- 5 content pages (Home, About, Sponsors, Projects, Contact) rendering from CMS
- Dynamic page routing via `[...slug].astro` catch-all
- Sponsor listing and detail pages at `/sponsors/` and `/sponsors/[slug]`
- Project listing page at `/projects/`
- Storybook documentation site for all UI components and blocks
- GitHub Pages deployment with automated CI/CD
- Lighthouse 90+ scores across Performance, Accessibility, Best Practices, SEO

### Phase 2: Interactive Platform (Epic 6, Deferred)

- Cloudflare Pages hosting with SSR capability
- Cloudflare Worker form proxy with rate limiting
- Contact form block with client-side validation and honeypot
- Submission documents in Sanity Studio for admin review

## Project Assumptions

- NJIT IT standards and WCAG 2.1 AA accessibility requirements will be followed
- All hosting services will remain within free tier limits ($0/month operating cost)
- Content editors have basic familiarity with CMS interfaces (Sanity Studio)
- The application must function on both mobile and desktop environments
- There will be adequate time and resources allocated across the 16-week timeline
- The existing reference site (ywcccapstone1.com) serves as the design baseline

## Estimated Budget

| Item | Cost |
|---|---|
| Sanity.io (free tier) | $0/month |
| GitHub Pages hosting | $0/month |
| Cloudflare Pages (Phase 2) | $0/month |
| Domain name (if applicable) | ~$12/year |
| **Total Operating Cost** | **$0--$1/month** |

The project will take 16 weeks to complete across 6 epics.

## Signatures

| Role | Name | Date |
|---|---|---|
| **Sponsor** | NJIT Ying Wu College of Computing | |
| **Project Manager** | Jose Andrew Gonzalez | |
