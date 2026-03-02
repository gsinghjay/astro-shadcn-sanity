---
title: Professional Development Guide
description: What you gain from contributing to this project, and how to present it on your resume and LinkedIn
---

# Professional Development Guide

This document explains what you gain from contributing to the YWCC Capstone Platform and gives you ready-to-use templates for your LinkedIn profile and resume. Every role on this project — frontend, backend, analytics, or bot development — produces verifiable, production-grade work that sets you apart in interviews.

## Table of Contents

- [Why This Project Matters for Your Career](#why-this-project-matters-for-your-career)
- [Team Roles](#team-roles)
- [What You Build — By Role](#what-you-build--by-role)
- [Skills You Develop](#skills-you-develop)
- [Technologies on Your Resume](#technologies-on-your-resume)
- [Resume Bullet Points](#resume-bullet-points)
- [LinkedIn Templates](#linkedin-templates)
- [LinkedIn Skills to Add](#linkedin-skills-to-add)
- [Personalization Tips](#personalization-tips)

---

## Why This Project Matters for Your Career

Most student projects use a framework tutorial as a starting point and never leave localhost. This one is different. You are building a **production-grade, multi-site platform** deployed on serverless infrastructure using the same architecture, tooling, and engineering standards that professional teams use at companies shipping real products.

Here is what sets this apart:

- **Serverless-first architecture** — The entire platform runs on Cloudflare's edge network. Static pages deploy to Cloudflare Pages, the Sponsor Portal runs on Cloudflare Workers with SSR, the chatbot uses Workers AI for RAG inference, and backend services (API, Discord bot) run as Python Workers. You learn to build and operate production systems with zero traditional servers.
- **Modern JAMstack + headless CMS** — Astro and Sanity are used individually by companies like Nike, Figma, Cloudflare, and Burger King. The SSG + headless CMS pattern you learn here is the same architecture that powers production marketing sites across the industry.
- **Multi-site platform from a single codebase** — Three websites (Capstone, RWC US, RWC International) share one block library, one CMS, and one deployment pipeline. You learn multi-tenancy patterns used by SaaS companies.
- **Zero-cost RAG chatbot** — An AI assistant powered by Sanity Embeddings + Cloudflare Workers AI delivers semantic search and generated answers at zero incremental cost, with three-tier graceful degradation. You learn production AI/ML integration patterns.
- **Authenticated Sponsor Portal** — Cloudflare Access provides Zero Trust authentication (email OTP + Google login). You learn identity, authorization, and SSR on edge infrastructure.
- **Performance engineering** — The project targets Lighthouse 89+ across all four categories with LCP under 2 seconds. Once deployed and audited, that becomes a measurable, verifiable claim you put on a resume.
- **Accessibility compliance** — You build to WCAG 2.1 AA standards with enforced alt text, keyboard navigation, ARIA patterns, and screen reader support. Accessibility skills are in high demand and most junior developers lack them.
- **$20/month total operating cost** — The architecture runs on Sanity Growth ($15/mo) and Cloudflare Workers Paid ($5/mo). You learn how to ship production systems without burning money.
- **7-person cross-functional team** — Two teams working across frontend, backend, analytics, and DevOps with sprint workflows, code review, and story-level acceptance criteria.

**The bottom line:** When an interviewer asks "tell me about a project you've worked on," you have a real answer with real technologies, real architectural decisions, and real performance numbers — running on real production infrastructure.

## Team Roles

| Member | Team | Role | Primary Focus |
|---|---|---|---|
| Jay (gsinghjay) | A | PM + Lead Dev | Architecture, platform infrastructure, CMS, portal, chatbot, deployment |
| jo-las | A | CMS Developer/QA | Block variant infrastructure, Hero/CTA/Video/Logo/Contact variants |
| panzemary | A | CMS Developer/QA | Content/Feature/FAQ/Steps/Stats/Testimonial block variants |
| mi329-gif | B | Assistant PM + Analytics Dev | GTM configuration, GA4 dashboards, accessibility analysis, reporting |
| pac27-cloud | B | API Dev | Aggregated Platform API (FastAPI on Cloudflare Workers) |
| SahilP20 | B | Discord Bot Dev | Discord bot (FastAPI on Cloudflare Workers) with slash commands |
| ras242 | B | Content/QA Dev | RWC site content entry, cross-site QA review |

---

## What You Build — By Role

### PM + Lead Dev (Jay)

You own the platform architecture and deliver cross-cutting infrastructure that the entire team depends on.

- **Platform foundation** — Monorepo with Astro frontend + Sanity Studio CMS, block composition system, dynamic page routing
- **13+ block schemas** with `defineType`, `defineField`, `defineBlock` helpers, validation rules, and cross-document references
- **GROQ query architecture** — Build-time data fetching with `defineQuery`, field projections, and reference expansion
- **Sponsor Portal** — SSR routes on Cloudflare Workers with Cloudflare Access authentication (email OTP + Google login), project dashboards, event calendar with RSVP, NDA tracking
- **Multi-site infrastructure** — Site-field filtering, 3 Studio workspaces, per-site GROQ parameterization, Cloudflare Pages multi-project deployment
- **Zero-cost RAG chatbot** — Sanity Embeddings Index setup, Chatbot Worker with RAG pipeline (Workers AI generation), neuron budget management via KV, three-tier graceful degradation
- **Publishing pipeline** — Queue Event Bus, selective site rebuild consumer, schema change pipeline
- **CI/CD** — GitHub Actions pipelines, Cloudflare Pages deployment, Lighthouse CI + Pa11y accessibility scans
- **DevOps** — CSP security headers, SEO structured data (JSON-LD, Open Graph), image optimization with LQIP placeholders, GTM data attributes
- **FastAPI Worker template** — Reference scaffold for Python services on Cloudflare Workers (used by API and Discord bot tracks)

### CMS Developer/QA (jo-las, panzemary)

You extend the block composition system with layout variants — multiple visual presentations for each block type — so content editors can choose how content appears without writing code.

- **Variant infrastructure** — Extend `defineBlock` helper with variant configuration, create `VariantLayout.astro` component, add conditional field hiding (`hiddenByVariant`), update GROQ base projections
- **Block variants** — Implement 2-5 layout variants per block type across 10+ block types:
  - Hero Banner (centered, split, full-bleed, minimal, video background)
  - CTA Banner (horizontal, stacked, floating, minimal)
  - Text With Image (image-left, image-right, overlay, full-width)
  - Feature Grid (cards, list, icons, alternating)
  - Rich Text (default, narrow, wide, sidebar)
  - FAQ Section (accordion, two-column, search, categorized)
  - Sponsor Steps (numbered, timeline, cards)
  - Stats Row (cards, inline, large, animated)
  - Testimonials (carousel, grid, featured, masonry, marquee)
  - Video Embed (inline, lightbox, background)
  - Logo Cloud (grid, marquee, tiered)
  - Contact Form (standard, side-by-side, minimal)
- **Schema work** — Add variant fields to existing schemas, run `npm run typegen` after changes, deploy schemas with `npx sanity schema deploy`
- **Cross-site QA** — Verify variants render correctly across all 3 sites (Capstone, RWC US, RWC International)

### Analytics Dev (mi329-gif)

You own the analytics and accessibility monitoring pipeline across all three program websites.

- **GTM container configuration** — Tags, triggers, and variables for all interactive elements (CTA clicks, form submissions, FAQ interactions, carousel navigation, section visibility)
- **GA4 custom event tracking** — `page_view`, `form_start`, `form_submit`, `faq_expand`, `carousel_navigate` with custom parameters
- **GA4 Explorations dashboards** — Traffic, content performance, user flow, device/demographics, conversion goals
- **Cross-site analytics** — Extend tracking to RWC US and RWC International sites, build comparison views
- **Accessibility baseline analysis** — Consume Pa11y + Lighthouse CI scan data, inventory WCAG 2.1 AA violations, categorize issues, produce prioritized reports
- **Final analytics report** — Cross-site traffic summary, content performance analysis, user flow and conversion funnels, device/demographics breakdown, before/after accessibility comparison, optimization recommendations, executive summary, and presentation slides

### API Dev (pac27-cloud)

You build a unified REST API that aggregates all platform services behind a single documented interface.

- **FastAPI Python Worker** — Deployed to Cloudflare Workers at `/api/v1/` with Pydantic v2 typed models and auto-generated OpenAPI/Swagger docs
- **Content endpoints** — GROQ queries against Sanity for sponsors, projects, events, and pages with `?site=` filtering and pagination
- **Forms endpoints** — Cloudflare Turnstile verification, submission storage in Sanity, rate limiting via KV (10 requests/min per IP)
- **Platform endpoints** — Cloudflare Pages API deployment status, deploy hook rebuild triggers, aggregated health checks
- **Chat endpoints** — RAG pipeline proxy (Sanity Embeddings + Workers AI), neuron budget status via KV counter, chatbot configuration from Sanity
- **Discord notification endpoint** — Channel-mapped webhook proxy with Discord embed formatting
- **Infrastructure** — API key authentication middleware, CORS middleware, KV caching layer (5-minute TTL), httpx async HTTP client
- **Deliverables** — Exported Postman collection, integration test suite with mocked external services, handoff README

### Discord Bot Dev (SahilP20)

You build a Discord bot that integrates with the CMS and provides team coordination features.

- **FastAPI Discord bot Worker** — Python on Cloudflare Workers, handling Discord Interactions API via HTTP POST (not WebSocket gateway)
- **Security** — Ed25519 signature verification using Web Crypto FFI (not PyNaCl)
- **Slash commands (read)** — `/ping` health check, `/project-status <name>`, `/sponsor-info <name>`, `/upcoming-events [limit]`, `/program-stats`, `/capstone <query>` free-text search
- **Slash commands (write)** — `/draft-event <title> <date> <type>` (create Sanity draft), `/update-status <project> <status>` (update project status)
- **Automated digests** — Weekly Cron Trigger (Monday 9am ET) for project digest, daily event reminders (48h lookahead), "quiet week" fallback
- **Infrastructure** — Pydantic models for Discord interaction payloads, deferred response pattern (type 5) for cold start handling, KV caching for Sanity queries (60s TTL), command registration script
- **Authorization** — Discord role-based access for write operations, button confirmation flow, audit trail logging

### Content/QA Dev (ras242)

You own content entry for the RWC program websites and perform cross-site quality assurance.

- **RWC content entry** — Compose pages for RWC US and RWC International sites using the shared block library in Sanity Studio
- **Content modeling** — Work within established schemas to create program descriptions, partner showcases, student experiences, and contact pages
- **Design-to-CMS translation** — Reference Figma design files to ensure CMS content matches intended layouts, spacing, and visual hierarchy
- **Component verification in Storybook** — Use Storybook to review block component variants and verify content renders as designed before publishing
- **Cross-site QA** — Verify content renders correctly across all 3 sites, test site-field filtering, confirm SEO metadata and Open Graph tags
- **Accessibility review** — Manual testing against WCAG 2.1 AA checklist (keyboard navigation, screen reader, color contrast)
- **Content migration assistance** — Help with WordPress content migration validation

---

## Skills You Develop

### Technical Skills — All Roles

| Skill | What You Learn |
|---|---|
| Serverless Architecture | Edge computing, Cloudflare Workers, zero-server production deployment |
| Headless CMS | Content modeling, schema design, GROQ queries, reference resolution |
| Static Site Generation | Build-time rendering, zero-JS runtime, file-based routing |
| TypeScript | Strict mode, typed props, interface patterns, path aliases |
| Accessibility | WCAG 2.1 AA, ARIA patterns, keyboard navigation, semantic HTML |
| Performance | Lighthouse optimization, Core Web Vitals, image optimization, LQIP |
| Version Control | Monorepo workflow, feature branches, npm workspaces, code review |
| CI/CD | GitHub Actions pipelines, automated builds, Cloudflare deployments |

### Technical Skills — By Role

**CMS Developers (jo-las, panzemary):**

| Skill | What You Learn |
|---|---|
| Component Architecture | Block system, variant patterns, UI composition, props and slots |
| CSS Engineering | Tailwind CSS v4, design tokens, responsive design, CSS custom properties |
| Content Modeling | `defineType`, `defineField`, `defineBlock`, validation rules, GROQ projections |
| Testing | Schema validation, build verification, cross-site rendering checks |

**Analytics Dev (mi329-gif):**

| Skill | What You Learn |
|---|---|
| Google Tag Manager | Container configuration, custom triggers, data layer variables, tag sequencing |
| Google Analytics 4 | Custom events, conversion goals, Explorations dashboards, audience segmentation |
| Accessibility Auditing | Pa11y CI, Lighthouse CI, WCAG 2.1 AA violation analysis, remediation prioritization |
| Data Analysis | Cross-site traffic comparison, conversion funnel analysis, data-driven recommendations |

**API Dev (pac27-cloud):**

| Skill | What You Learn |
|---|---|
| Python API Development | FastAPI, Pydantic v2, async/await, httpx, OpenAPI spec generation |
| Serverless Python | Cloudflare Workers (Pyodide runtime), KV bindings, Wrangler CLI |
| API Design | RESTful patterns, authentication middleware, CORS, rate limiting, caching |
| Documentation | Auto-generated Swagger/OpenAPI docs, Postman collections, handoff guides |

**Discord Bot Dev (SahilP20):**

| Skill | What You Learn |
|---|---|
| Bot Development | Discord Interactions API, slash commands, embeds, deferred responses |
| Cryptography | Ed25519 signature verification, Web Crypto API |
| Serverless Python | Cloudflare Workers (Pyodide runtime), Cron Triggers, KV bindings |
| CMS Integration | GROQ queries from Python, Sanity Mutations API, real-time content access |

**Content/QA Dev (ras242):**

| Skill | What You Learn |
|---|---|
| CMS Operations | Sanity Studio, block-based page composition, content workflows |
| Design-to-Implementation | Figma file interpretation, design token reference, layout fidelity verification |
| Component Documentation | Storybook navigation, variant review, visual regression checking |
| Quality Assurance | Cross-site testing, content isolation verification, regression testing |
| SEO | Metadata validation, Open Graph tags, sitemap verification, structured data |
| Accessibility Testing | Manual WCAG 2.1 AA testing, screen reader verification, keyboard navigation |

### Professional Skills — All Roles

- **Reading and working in an existing codebase** — You navigate, understand, and extend code that is already in production
- **Following architectural constraints** — The project has documented rules covering code style, patterns, and anti-patterns
- **Cross-functional collaboration** — Working on a 7-person team across two sub-teams with defined stories, acceptance criteria, and sprint workflows
- **Sprint execution** — Story estimation, task breakdown, dependency management, midterm and final deliverable deadlines
- **Code review** — Reviewing others' code and incorporating feedback on your own

---

## Technologies on Your Resume

When listing technologies, use these exact names and versions. Interviewers and ATS systems recognize them.

### All Roles

**Platforms:** Cloudflare Pages, Cloudflare Workers, Sanity.io

**Tools:** Git, GitHub Actions, npm Workspaces

**Standards:** WCAG 2.1 AA, Lighthouse CI

### PM + Lead Dev (Jay)

**Languages:** TypeScript, Python, HTML, CSS, GROQ

**Frameworks & Libraries:** Astro 5, Sanity.io v5, FastAPI, Pydantic v2, Tailwind CSS v4, shadcn/ui, Playwright, Vitest

**Tools & Platforms:** Cloudflare Workers, Cloudflare Pages, Cloudflare Access, Cloudflare KV, Cloudflare D1, Workers AI, Node.js 24, Vite 7, Wrangler CLI, GitHub Actions

**Standards & Practices:** Serverless Architecture, Multi-Site Platform Design, Zero Trust Authentication, JAMstack, Headless CMS Architecture, CI/CD Pipeline Design, Agile Project Management, WCAG 2.1 AA, Core Web Vitals

### CMS Developers (jo-las, panzemary)

**Languages:** TypeScript, HTML, CSS, GROQ

**Frameworks & Libraries:** Astro 5, Sanity.io v5, Tailwind CSS v4, shadcn/ui, Storybook

**Tools & Platforms:** Node.js 24, Vite 7, Cloudflare Pages, GitHub Actions

**Standards & Practices:** WCAG 2.1 AA, Core Web Vitals, Static Site Generation (SSG), JAMstack, Headless CMS Architecture, Component-Driven Development

### Analytics Dev (mi329-gif)

**Tools & Platforms:** Google Tag Manager, Google Analytics 4, Pa11y CI, Lighthouse CI, Cloudflare Pages

**Standards & Practices:** WCAG 2.1 AA, Core Web Vitals, Conversion Rate Optimization, Data-Driven Decision Making

### API Dev (pac27-cloud)

**Languages:** Python, TypeScript, GROQ

**Frameworks & Libraries:** FastAPI, Pydantic v2, httpx

**Tools & Platforms:** Cloudflare Workers, Cloudflare KV, Cloudflare Turnstile, Wrangler CLI, Postman, Swagger/OpenAPI

**Standards & Practices:** RESTful API Design, API Key Authentication, Rate Limiting, OpenAPI 3.0 Specification

### Discord Bot Dev (SahilP20)

**Languages:** Python, TypeScript, GROQ

**Frameworks & Libraries:** FastAPI, Pydantic v2, httpx, Discord Interactions API

**Tools & Platforms:** Cloudflare Workers, Cloudflare KV, Wrangler CLI, Discord Developer Portal

**Standards & Practices:** Ed25519 Cryptographic Verification, Serverless Bot Architecture, Cron-Based Automation

### Content/QA Dev (ras242)

**Tools & Platforms:** Sanity Studio, Figma, Storybook, Cloudflare Pages, Google Tag Manager

**Standards & Practices:** WCAG 2.1 AA, SEO Best Practices, Cross-Site Content QA, Structured Data (JSON-LD), Design-to-Implementation Fidelity

---

## Resume Bullet Points

Pick the bullets that match your specific contributions. Adjust numbers if the project grows beyond these targets.

### PM + Lead Dev (Jay)

**For a "Projects" section:**

- Architected and led development of a multi-site serverless platform serving 3 program websites on Cloudflare Pages + Workers, with $20/month total operating cost
- Built a block-based page composition system (13+ block types) enabling non-technical editors to create pages in Sanity Studio with zero code required
- Implemented an authenticated Sponsor Portal using Cloudflare Access (Zero Trust) with SSR on Cloudflare Workers for project dashboards, event RSVP, and NDA tracking
- Designed and deployed a zero-cost RAG chatbot using Sanity Embeddings + Cloudflare Workers AI with three-tier graceful degradation and neuron budget management
- Established CI/CD pipelines with GitHub Actions, Cloudflare Pages preview deployments, Lighthouse CI, and Pa11y accessibility scanning
- Led a 7-person cross-functional team across 2 sub-teams delivering 90+ stories over 5 sprints using agile workflows with story-level acceptance criteria

### CMS Developers (jo-las, panzemary)

**For a "Projects" section:**

- Developed layout variant infrastructure for a block-based CMS platform, enabling 2-5 visual presentations per block type across 10+ content block types
- Implemented reusable content block components (Hero Banner, CTA, Feature Grid, FAQ, Testimonials, and more) with TypeScript strict mode in Astro 5
- Extended Sanity CMS schemas with variant fields, conditional field visibility, and GROQ query projections for type-safe data fetching
- Built responsive component variants using Tailwind CSS v4 with mobile-first design patterns and WCAG 2.1 AA accessibility compliance
- Verified block rendering across 3 program websites sharing a single component library and CMS instance

**For a "Work Experience" or "Capstone" section:**

- Contributed to a 7-person engineering team building a modular, CMS-driven platform for NJIT's Ying Wu College of Computing on Cloudflare's serverless infrastructure
- Delivered features across the full stack: Sanity CMS schemas, Astro frontend components, GROQ data queries, and cross-site rendering verification
- Followed a structured sprint workflow with story-level acceptance criteria and code review processes in a monorepo (npm workspaces)

### Analytics Dev (mi329-gif)

**For a "Projects" section:**

- Configured Google Tag Manager across a 3-site platform with custom triggers for CTA clicks, form submissions, FAQ interactions, carousel navigation, and section visibility
- Built GA4 Explorations dashboards tracking traffic, content performance, user flow, device demographics, and conversion funnels across 3 program websites
- Produced a WCAG 2.1 AA accessibility baseline report by analyzing Pa11y CI and Lighthouse CI scan data, categorizing violations, and prioritizing remediation
- Delivered a cross-site analytics report with data-driven optimization recommendations and executive summary for program stakeholders

**For a "Work Experience" or "Capstone" section:**

- Served as Assistant Project Manager and Analytics Developer on a 7-person team building a multi-site CMS platform for NJIT's Ying Wu College of Computing
- Owned the analytics and accessibility monitoring pipeline from GTM configuration through final stakeholder reporting

### API Dev (pac27-cloud)

**For a "Projects" section:**

- Built a unified REST API using FastAPI (Python) deployed as a Cloudflare Worker, aggregating Sanity CMS, Cloudflare KV/D1, and Workers AI behind a single documented interface
- Implemented content, forms, platform health, chat (RAG), and Discord notification endpoints with Pydantic v2 typed models and auto-generated OpenAPI/Swagger documentation
- Designed API key authentication, CORS middleware, and KV-based rate limiting (10 requests/min per IP) for production-grade security
- Integrated Cloudflare Turnstile bot protection for form submissions with server-side token verification
- Delivered an exported Postman collection, integration test suite with mocked external services, and a handoff guide for future maintainers

**For a "Work Experience" or "Capstone" section:**

- Designed and deployed a production REST API on Cloudflare Workers (Python) serving content, forms, and platform operations for a 3-site CMS platform
- Operated within a monorepo alongside frontend and CMS workspaces, coordinating with 6 other developers across 2 sub-teams

### Discord Bot Dev (SahilP20)

**For a "Projects" section:**

- Built a Discord bot using FastAPI (Python) deployed as a Cloudflare Worker, handling Discord Interactions API with Ed25519 cryptographic signature verification
- Implemented slash commands querying live Sanity CMS content (`/project-status`, `/sponsor-info`, `/upcoming-events`) with Discord embed formatting and error handling
- Designed deferred response patterns (interaction type 5) to handle Cloudflare Workers cold starts within Discord's 3-second deadline
- Built automated Cron Triggers for weekly project digests and daily event reminders with channel-mapped notification routing
- Implemented content write operations (`/draft-event`, `/update-status`) with Discord role-based authorization and audit trail logging

**For a "Work Experience" or "Capstone" section:**

- Developed a production Discord bot on Cloudflare Workers (Python) integrating with a headless CMS for real-time content queries, automated digests, and team coordination
- Followed a structured development approach: local MVP with Postman/curl testing, then Cloudflare deployment with live Discord integration testing

### Content/QA Dev (ras242)

**For a "Projects" section:**

- Composed content pages for 2 program websites using a block-based page builder in Sanity Studio, selecting from 13+ block types with multiple layout variants
- Translated Figma design files into CMS content, ensuring layout fidelity, spacing, and visual hierarchy matched design specifications
- Verified component rendering against Storybook documentation to confirm block variants displayed as designed before publishing
- Performed cross-site QA across 3 program websites, verifying content isolation (site-field filtering), SEO metadata, and responsive rendering
- Conducted manual accessibility testing against WCAG 2.1 AA standards including keyboard navigation, screen reader compatibility, and color contrast verification
- Validated WordPress content migration accuracy and contributed to content gap identification

**For a "Work Experience" or "Capstone" section:**

- Owned content entry and quality assurance for a multi-site CMS platform serving 3 NJIT program websites on Cloudflare Pages
- Bridged design and development by referencing Figma mockups and Storybook component documentation to ensure content matched intended visual designs
- Worked within a 7-person cross-functional team using sprint workflows, GitHub project boards, and story-level acceptance criteria

---

## LinkedIn Templates

Copy the text below and paste it into a new LinkedIn **Experience** or **Project** entry. Replace the placeholder sections with your specific contributions.

> **Paste tip:** LinkedIn's rich text editor may reformat line breaks. After pasting, review the formatting and adjust spacing as needed.

---

### Experience Entry — PM + Lead Dev

**Title:** Project Manager & Lead Developer (Capstone Project)

**Company:** NJIT Ying Wu College of Computing

**Description:**

```text
Led a 7-person cross-functional team building a multi-site serverless
platform for NJIT's Ying Wu College of Computing. The platform serves
3 program websites from a single Astro 5 + Sanity.io codebase deployed
on Cloudflare Pages and Workers with $20/month total operating cost.

Key contributions:
- Architected a block-based page composition system (13+ block types)
  enabling non-technical editors to compose pages in Sanity Studio
- Built an authenticated Sponsor Portal with Cloudflare Access (Zero
  Trust) and SSR on Cloudflare Workers for project dashboards, event
  RSVP, and NDA signature tracking
- Designed and deployed a zero-cost RAG chatbot using Sanity Embeddings
  + Cloudflare Workers AI with three-tier graceful degradation and
  neuron budget management (10K neurons/day)
- Established multi-site infrastructure: site-field filtering, 3 Studio
  workspaces, per-site Cloudflare Pages deployments, and webhook-driven
  auto-rebuild pipeline
- Built CI/CD pipelines with GitHub Actions, Cloudflare Pages preview
  deployments, Lighthouse CI (89+ scores), and Pa11y accessibility
  scanning
- Created a FastAPI Worker template (Python on Cloudflare Workers) used
  as the scaffold for the Platform API and Discord bot services
- Managed sprint planning, story estimation, dependency tracking, and
  code review across 90+ stories over 5 sprints

Stack: Astro 5, Sanity.io, TypeScript, Python, FastAPI, Cloudflare
Workers, Cloudflare Pages, Cloudflare Access, Cloudflare KV/D1,
Workers AI, Tailwind CSS v4, GROQ, GitHub Actions, Playwright, Vitest
```

---

### Experience Entry — CMS Developer

**Title:** Full-Stack Web Developer (Capstone Project)

**Company:** NJIT Ying Wu College of Computing

**Description:**

```text
Built a production-grade, multi-site CMS platform for the YWCC Industry
Capstone program using Astro 5, Sanity.io headless CMS, Tailwind CSS v4,
and TypeScript in strict mode. The platform serves 3 program websites
from a single codebase deployed on Cloudflare Pages with $20/month total
operating cost.

Key contributions:
- Developed layout variants for 10+ content block types (Hero, CTA,
  Feature Grid, FAQ, Testimonials, and more) enabling editors to choose
  visual presentations in Sanity Studio with zero code required
- Extended Sanity CMS schemas with variant infrastructure, conditional
  field visibility, and GROQ build-time queries
- Targeted Lighthouse 89+ across Performance, Accessibility, Best
  Practices, and SEO with LCP under 2 seconds
- Implemented WCAG 2.1 AA accessibility: keyboard navigation, ARIA
  patterns, screen reader support, and enforced alt text
- Worked in a monorepo (npm workspaces) with CI/CD via GitHub Actions
  and Cloudflare Pages preview deployments

Stack: Astro 5, Sanity.io, Tailwind CSS v4, TypeScript, GROQ,
shadcn/ui, Cloudflare Pages, GitHub Actions
```

---

### Experience Entry — API Developer

**Title:** Backend API Developer (Capstone Project)

**Company:** NJIT Ying Wu College of Computing

**Description:**

```text
Built a unified REST API using FastAPI (Python) deployed as a Cloudflare
Worker for a multi-site CMS platform serving 3 NJIT program websites.
The API aggregates Sanity CMS, Cloudflare KV/D1, Workers AI, and
Cloudflare Pages behind a single documented interface.

Key contributions:
- Designed and implemented content, forms, platform health, chat (RAG),
  and Discord notification endpoints with Pydantic v2 typed models
- Built API key authentication, CORS middleware, and KV-based rate
  limiting for production-grade security
- Integrated Cloudflare Turnstile for server-side bot protection on
  form submissions
- Auto-generated OpenAPI/Swagger documentation with exported Postman
  collection for manual testing
- Delivered integration test suite and handoff guide for future
  maintainers

Stack: Python, FastAPI, Pydantic v2, httpx, Cloudflare Workers,
Cloudflare KV, Wrangler CLI, OpenAPI/Swagger, Postman
```

---

### Experience Entry — Discord Bot Developer

**Title:** Bot Developer (Capstone Project)

**Company:** NJIT Ying Wu College of Computing

**Description:**

```text
Built a Discord bot using FastAPI (Python) deployed as a Cloudflare
Worker for a multi-site CMS platform. The bot integrates with Sanity.io
headless CMS for real-time content queries and automated team
coordination.

Key contributions:
- Implemented Discord Interactions API with Ed25519 cryptographic
  signature verification using Web Crypto API
- Built slash commands querying live CMS content with Discord embed
  formatting and ephemeral error handling
- Designed deferred response patterns to handle serverless cold starts
  within Discord's 3-second interaction deadline
- Automated weekly project digests and daily event reminders via
  Cloudflare Cron Triggers
- Implemented content write operations with role-based authorization
  and audit trail logging

Stack: Python, FastAPI, Pydantic v2, httpx, Cloudflare Workers,
Cloudflare KV, Discord Interactions API, Sanity.io, GROQ
```

---

### Experience Entry — Analytics Developer

**Title:** Analytics & Accessibility Developer (Capstone Project)

**Company:** NJIT Ying Wu College of Computing

**Description:**

```text
Owned the analytics and accessibility monitoring pipeline for a
multi-site CMS platform serving 3 NJIT program websites on Cloudflare
Pages. Served as Assistant Project Manager coordinating a 4-person
sub-team.

Key contributions:
- Configured Google Tag Manager with custom triggers for CTA clicks,
  form submissions, FAQ interactions, and section visibility tracking
  across 3 websites
- Built GA4 Explorations dashboards for traffic, content performance,
  user flow, and conversion funnels
- Produced a WCAG 2.1 AA accessibility baseline report analyzing
  Pa11y CI and Lighthouse CI scan data with prioritized remediation
  recommendations
- Delivered a cross-site analytics report with data-driven optimization
  recommendations for program stakeholders

Stack: Google Tag Manager, Google Analytics 4, Pa11y CI, Lighthouse CI,
Cloudflare Pages
```

---

### Experience Entry — Content/QA Developer

**Title:** Content Developer & QA Engineer (Capstone Project)

**Company:** NJIT Ying Wu College of Computing

**Description:**

```text
Owned content entry and quality assurance for a multi-site CMS platform
serving 3 NJIT program websites. Composed pages using a block-based
page builder in Sanity Studio and performed cross-site QA across all
program sites.

Key contributions:
- Composed content pages for 2 program websites using 13+ block types
  with multiple layout variants in Sanity Studio
- Translated Figma design files into CMS content, verifying layout
  fidelity, spacing, and visual hierarchy against design specs
- Used Storybook component documentation to review block variants and
  confirm rendering matched design intent before publishing
- Performed cross-site QA verifying content isolation, SEO metadata,
  responsive rendering, and accessibility compliance
- Conducted manual WCAG 2.1 AA accessibility testing: keyboard
  navigation, screen reader compatibility, color contrast
- Validated WordPress content migration accuracy and identified content
  gaps for stakeholder review

Stack: Sanity Studio, Figma, Storybook, Cloudflare Pages, Google Tag
Manager, WCAG 2.1 AA
```

---

### Project Entry (shorter format — any role)

**Project Name:** YWCC Capstone Platform

**Description:**

```text
Multi-site CMS platform for NJIT's Industry Capstone and Real World
Connections programs. 3 websites from a single Astro + Sanity.io
codebase deployed on Cloudflare Pages. Block-based page builder lets
editors compose pages with zero code. Authenticated Sponsor Portal on
Cloudflare Workers. Zero-cost RAG chatbot via Workers AI. FastAPI
backend services (API + Discord bot) on Python Workers.

7-person team, 2 sub-teams, 5 sprints. Lighthouse 89+ all categories.
WCAG 2.1 AA accessible. $20/month total operating cost.

Stack: Astro, Sanity.io, TypeScript, Python, FastAPI, Cloudflare
Workers, Cloudflare Pages, Tailwind CSS v4, GROQ, GitHub Actions
```

---

## LinkedIn Skills to Add

Add these to your LinkedIn **Skills** section. They are searchable by recruiters.

### All Roles

- Cloudflare Pages
- Cloudflare Workers
- Sanity.io
- Web Accessibility (WCAG)
- GitHub Actions

### PM + Lead Dev

- Astro (Web Framework)
- Tailwind CSS
- TypeScript
- Python
- FastAPI
- Cloudflare Access
- Workers AI
- Serverless Computing
- Static Site Generation (SSG)
- Headless CMS
- JAMstack
- Agile Project Management
- CI/CD
- Web Performance Optimization
- Playwright
- Vitest

### CMS Developers

- Astro (Web Framework)
- Tailwind CSS
- TypeScript
- Static Site Generation (SSG)
- Headless CMS
- Storybook
- Component-Driven Development
- JAMstack
- Web Performance Optimization
- ARIA
- Responsive Web Design

### Analytics Dev

- Google Tag Manager
- Google Analytics 4
- Data Analysis
- Accessibility Auditing
- Conversion Rate Optimization
- Data Visualization

### API Dev

- Python
- FastAPI
- REST API Design
- OpenAPI/Swagger
- Postman
- Pydantic
- Serverless Computing
- API Security

### Discord Bot Dev

- Python
- FastAPI
- Discord API
- Serverless Computing
- Cryptography (Ed25519)
- Bot Development

### Content/QA Dev

- Content Management Systems
- Figma
- Storybook
- Quality Assurance
- SEO
- Accessibility Testing
- Content Strategy

---

## Personalization Tips

- **Replace generic bullets with your specific work.** "Developed the heroBanner and featureGrid block variants" is stronger than "Developed block variants."
- **Include numbers where you can.** "13 block types," "3 websites," "Lighthouse 89+," "LCP < 2s," "$20/month operating cost" — these are concrete and verifiable.
- **Mention the team size.** "Contributed to a 7-person engineering team" signals you work well with others.
- **Mention the serverless architecture.** Cloudflare Workers experience is in high demand. Saying "deployed on Cloudflare's edge network" signals modern infrastructure knowledge.
- **Link to the live site** once it is deployed. A working URL turns your project entry from a claim into proof.
- **Link to the Storybook** if it is publicly deployed. It shows your component work visually.
- **Link to the API docs** if the Swagger UI is publicly accessible. It shows your API design and documentation skills.
- **Highlight the $20/month cost.** Interviewers are impressed when you demonstrate cost-conscious architecture decisions.
