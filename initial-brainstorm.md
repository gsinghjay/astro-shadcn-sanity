# YWCC Capstone Sponsors — Project Brief

**Industry Capstone Sponsor Platform | Modular Page Builder with Headless CMS**

Prepared for: **New Jersey Institute of Technology — Ying Wu College of Computing**
February 2026 · Version 1.0

---

## Project Overview

Build a modular, CMS-driven platform for the NJIT Ying Wu College of Computing (YWCC) Industry Capstone program that connects **industry sponsors** with capstone teams. The platform showcases sponsor organizations, project proposals, team rosters, and program information. Content editors compose pages by stacking reusable UI blocks (Hero, Feature Grid, FAQ, CTA, Sponsor Cards, etc.) in Sanity Studio — no code required. The entire stack runs at **$0/month** with Lighthouse scores targeting **90+**.

| | |
|---|---|
| **Primary Audience** | Industry sponsors, prospective sponsors, capstone students, faculty advisors |
| **Content Editors** | YWCC capstone program administrators |
| **Performance Target** | Lighthouse 90+ across all categories |
| **Monthly Budget** | $0 (all free tiers) |
| **Hosting** | GitHub Pages (static) + Cloudflare Worker (forms) |
| **Timeline** | 4–6 weeks to MVP |

---

## Purpose & Goals

The YWCC Capstone Sponsors platform serves as the public-facing hub for NJIT's Industry Capstone program, replacing static documents or scattered web pages with a centralized, professionally designed site.

### Key Objectives

1. **Recruit new sponsors:** Clearly communicate the value proposition of sponsoring a capstone team — access to student talent, applied R&D on real business problems, and a pipeline for recruiting.
2. **Showcase current sponsors:** Highlight participating organizations with logos, descriptions, and project themes to build credibility and encourage renewals.
3. **Streamline sponsor onboarding:** Provide a clear path from interest to commitment with contact forms, FAQ sections, and timeline information.
4. **Inform students and faculty:** Publish team assignments, project descriptions, important dates, and program expectations in one accessible location.
5. **Maintain easily:** Allow non-technical administrators to update all content — sponsors, projects, dates, pages — through a visual drag-and-drop page builder with zero code changes.

---

## Technology Stack

### Core Architecture

| Layer | Technology | Role |
|---|---|---|
| CMS | Sanity.io (Free) | Headless CMS with visual page builder, structured content schemas, real-time collaboration, hosted Studio. Unlimited free admin users. |
| Static Site Generator | Astro | Builds static HTML at deploy time, ships zero JS by default. Content baked into pages at build time — no runtime API calls. |
| Styling | Tailwind CSS + shadcn/ui patterns | Utility-first CSS with pre-designed component patterns (buttons, cards, accordions, badges) adapted from shadcn/ui. |
| Interactivity | Vanilla JavaScript | Scoped scripts for accordions, tabs, mobile nav, carousels. Zero framework dependencies. Data-attribute driven with event delegation. |
| Hosting | GitHub Pages | Free static hosting with unlimited bandwidth. GitHub Actions for CI/CD. No commercial use restrictions. |
| Form Processing | Cloudflare Worker | Serverless proxy for secure Sanity writes. Keeps write token server-side. 100K requests/day free. Handles sponsor inquiry and contact forms. |

### Why These Choices

**Astro:** Produces static HTML with near-perfect Lighthouse scores. Built-in TypeScript, scoped styles, component architecture, and the option to add SSR pages later via hybrid rendering. First-class Sanity integration.

**Vanilla JS over Alpine.js/React:** The platform needs only 4–5 interactive components (accordion, tabs, mobile nav, carousel, form feedback). Each requires 20–30 lines of vanilla JS. This eliminates runtime dependencies, maximizes Lighthouse performance, and removes upgrade concerns.

**GitHub Pages + Cloudflare Worker:** GitHub Pages provides the simplest deployment via GitHub Actions. Form submissions route through a separate Cloudflare Worker (~50 lines) that securely proxies writes to Sanity. Both services are free with generous limits.

**Sanity.io:** Unlimited free admin users, powerful GROQ query language, real-time collaboration, customizable Studio. Content fetched at build time means the free tier (100K API requests/month) is rarely stressed.

---

## Hosting Options

Two viable hosting configurations were evaluated. Option A is recommended.

### Option A: GitHub Pages + Cloudflare Worker (Recommended)

| | |
|---|---|
| **Static hosting** | GitHub Pages (free, unlimited bandwidth) |
| **Form processing** | Cloudflare Worker (free, 100K req/day) |
| **Deploy targets** | 2 (GitHub Actions + Cloudflare dashboard) |
| **Cost** | $0/month |
| **Pros** | Simple static hosting, familiar GitHub workflow, no vendor lock-in |
| **Cons** | Form handler deployed separately from main site |

### Option B: Cloudflare Pages (Single Deploy)

| | |
|---|---|
| **Static + SSR hosting** | Cloudflare Pages (free, unlimited bandwidth) |
| **Form processing** | Astro Actions via @astrojs/cloudflare adapter |
| **Deploy targets** | 1 (Cloudflare dashboard or Wrangler CLI) |
| **Cost** | $0/month (500 builds/month, 100K Worker invocations/day) |
| **Pros** | Single project, Astro Actions with built-in Zod validation |
| **Cons** | Tied to Cloudflare ecosystem, slightly more complex config |

---

## Page Builder Architecture

The core of the platform is a modular page builder. Content editors compose pages in Sanity Studio by stacking reusable blocks. Each block type has a Sanity schema (defining editor fields) and a corresponding Astro component (defining frontend rendering with shadcn/ui Tailwind patterns).

### Content Model

| Document Type | Purpose | Key Fields |
|---|---|---|
| page | Composable pages | title, slug, seo (metaTitle, metaDescription, ogImage), blocks[] |
| sponsor | Sponsor organizations | name, slug, logo, description, website, industry, tier (gold/silver/bronze), featured, projects[] |
| project | Capstone projects | title, slug, sponsor (ref), description, technologies[], team (ref), semester, status (active/completed) |
| team | Student teams | name, members[] (name, role, photo, linkedin), project (ref), advisor (ref) |
| event | Program events/dates | title, date, location, description, type (open-house/demo-day/deadline) |
| submission | Form data storage | name, email, organization, message, formType (inquiry/contact), submittedAt |
| siteSettings | Global config (singleton) | siteName, logo, navigation[], footer, socialLinks[], currentSemester |

### Block Library

| Block | JS Required | Priority | Description |
|---|---|---|---|
| Hero | No | P0 | Full-width banner with heading, subheading, CTA button, optional background image. Configurable alignment. |
| Feature Grid | No | P0 | 2/3/4 column grid of icon + title + description cards. Ideal for "Why Sponsor" benefits section. |
| Sponsor Cards | No | P0 | Filterable grid of sponsor logos/names with tier badges (gold/silver/bronze). Links to sponsor detail pages. |
| Rich Text | No | P0 | Portable Text block with inline images, callout boxes (info/warning/success), configurable max-width. |
| CTA Banner | No | P0 | Centered heading + description + buttons. Background variants (white, muted, primary, dark). "Become a Sponsor" CTA. |
| FAQ Accordion | Vanilla JS | P0 | Expandable Q&A pairs with CSS grid animation and ARIA attributes. Sponsor FAQ section. |
| Contact Form | Vanilla JS | P0 | Sponsor inquiry form (name, org, email, message). Submits via Cloudflare Worker, saves to Sanity. |
| Timeline | No | P0 | Vertical timeline of program milestones (proposal deadline, team matching, demo day). Auto-highlights current phase. |
| Logo Cloud | No | P0 | Row of sponsor logos, auto-populated from sponsor documents. "Our Sponsors" social proof section. |
| Tabs | Vanilla JS | P1 | Horizontal tab navigation. Useful for "For Sponsors" / "For Students" / "For Faculty" content switching. |
| Testimonials | Vanilla JS | P1 | Carousel of quotes from past sponsors and students about capstone experience. |
| Stats Counter | No | P1 | Large numbers with labels ("50+ Sponsors", "200+ Projects Completed", "95% Satisfaction Rate"). |
| Project Showcase | Vanilla JS | P1 | Filterable grid of past/current capstone projects with sponsor, team, and technology tags. |
| Image Gallery | Vanilla JS | P2 | Responsive grid with lightbox. Demo Day photos, team presentations, sponsor events. |
| Video Embed | No | P2 | Responsive YouTube/Vimeo embed. Program overview videos, sponsor testimonials. |

---

## Example Site Pages

| Page | URL | Blocks Used |
|---|---|---|
| Homepage | `/` | Hero, Stats Counter, Feature Grid ("Why Sponsor"), Logo Cloud, Testimonials, CTA Banner |
| Sponsors | `/sponsors` | Hero, Sponsor Cards (filterable by tier/industry), CTA Banner |
| Sponsor Detail | `/sponsors/[slug]` | Auto-generated from sponsor document: logo, description, projects list, website link |
| Projects | `/projects` | Hero, Project Showcase (filterable by semester, sponsor, tech) |
| How It Works | `/how-it-works` | Hero, Timeline, Tabs (Sponsors/Students/Faculty), Rich Text, FAQ Accordion |
| Become a Sponsor | `/become-a-sponsor` | Hero, Feature Grid (benefits), Rich Text (process), Contact Form, FAQ Accordion |
| Events | `/events` | Auto-generated from event documents: upcoming/past events, Open House, Demo Day |
| Contact | `/contact` | Rich Text (contact info), Contact Form |

---

## Deployment Workflow

Content changes flow from Sanity Studio to the live site automatically via a webhook-triggered rebuild pipeline:

1. **Content Update:** An admin edits content in Sanity Studio (hosted free by Sanity).
2. **Webhook Trigger:** Sanity fires a webhook to the GitHub repository, triggering a GitHub Action.
3. **Static Build:** Astro fetches all content from Sanity via GROQ queries and generates static HTML pages.
4. **Deploy:** Static HTML is deployed to GitHub Pages. Build typically completes in under 60 seconds.
5. **Live Site:** Visitors see fully pre-rendered pages with zero runtime API calls. All content is baked into the HTML.

Form submissions follow a separate path: the browser sends form data to the Cloudflare Worker, which validates input and creates a **submission** document in Sanity. Admins view and manage all inquiries directly in Sanity Studio.

---

## Free Tier Limits

| Service | Free Tier Limit | Projected Usage | Risk |
|---|---|---|---|
| Sanity API Requests | 100K/month | ~500–1,000 (build-time only) | Very Low |
| Sanity API CDN | 500K/month | ~500–1,000 (build-time only) | Very Low |
| Sanity Documents | 10,000 | ~100 pages/sponsors + submissions | Low |
| Sanity Assets | 5GB | ~200–500MB (logos, photos) | Low |
| GitHub Pages Bandwidth | 100GB/month | ~1–3GB | Very Low |
| CF Worker Requests | 100K/day | ~5–20/day (form submissions) | Very Low |
| Sanity Admin Users | Unlimited | Program administrators | None |

All content is fetched at build time. Visitor page views **never touch the Sanity API**. Only content publishes (triggering rebuilds) consume API requests.

---

## Cost Summary

| Service | Plan | Monthly Cost |
|---|---|---|
| Sanity.io | Free (unlimited admins) | $0 |
| GitHub Pages | Free (public repo) | $0 |
| Cloudflare Worker | Free (100K req/day) | $0 |
| Custom Domain | Via NJIT or purchased | $0–12/year |
| **Total** | | **$0/month** |

---

## Performance Targets

All pages target a minimum Lighthouse score of **90** across all categories.

| Category | Static Pages | Interactive Pages | Form Pages |
|---|---|---|---|
| Performance | 95–100 | 90–100 | 90–98 |
| Accessibility | 95–100 | 90–100 | 90–100 |
| Best Practices | 95–100 | 95–100 | 95–100 |
| SEO | 95–100 | 95–100 | 95–100 |

---

## Project Structure

```
ywcc-capstone-sponsors/
  astro.config.mjs              # Astro configuration
  tailwind.config.mjs           # Tailwind + shadcn theme tokens (NJIT brand colors)
  src/
    components/
      blocks/                   # Block components (Hero.astro, SponsorCards.astro, Timeline.astro, etc.)
      BlockRenderer.astro       # Maps Sanity block _type to Astro component
      MobileNav.astro           # Responsive navigation with vanilla JS
    layouts/
      Layout.astro              # Base HTML layout with <head>, nav, footer
    lib/
      sanity.ts                 # Sanity client config, GROQ queries, image URL builder
    pages/
      index.astro               # Homepage (page builder)
      [...slug].astro           # Dynamic catch-all for CMS-built pages
      sponsors/index.astro      # Sponsor listing page
      sponsors/[slug].astro     # Sponsor detail pages
      projects/index.astro      # Project showcase
      contact.astro             # Contact / sponsor inquiry form
    styles/
      global.css                # Tailwind imports + shadcn CSS variables
  sanity/
    schemas/
      blocks/                   # Block schemas (hero.ts, faq.ts, sponsorCards.ts, timeline.ts, etc.)
      documents/                # Document schemas (page.ts, sponsor.ts, project.ts, team.ts, event.ts)
    sanity.config.ts            # Studio configuration
  worker/
    index.js                    # Cloudflare Worker for form submissions to Sanity
  .github/workflows/
    deploy.yml                  # Build Astro + deploy to GitHub Pages
```

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Sanity free tier exceeded | Very Low | Build-time fetching means visitor traffic never hits API. ~100x headroom on all limits. |
| GitHub Pages downtime | Low | 99.9%+ uptime. Cloudflare Pages is a drop-in backup with same build process. |
| Editor training needed | Medium | Sanity Studio is intuitive (drag-and-drop blocks). 10-minute video walkthrough for onboarding. |
| Build-time delay | Low | Astro builds in < 60s. GitHub Actions completes in 2–3 minutes total. |
| Form spam | Medium | Honeypot field + rate limiting in Worker. Cloudflare Turnstile CAPTCHA available (free). |
| NJIT branding compliance | Low | Tailwind theme tokens configured to NJIT brand colors from day one. Easy to adjust. |

---

## Next Steps

1. **Scaffold Astro project** with Tailwind, NJIT brand tokens, shadcn CSS variables, and Sanity client
2. **Define Sanity schemas** for all P0 blocks and document types (page, sponsor, project, team, event, submission)
3. **Build P0 Astro components** with Tailwind/shadcn patterns and vanilla JS for interactive blocks
4. **Deploy Cloudflare Worker** for sponsor inquiry form proxy to Sanity
5. **Configure GitHub Actions** for automated builds on push and Sanity webhook triggers
6. **Seed content** with current capstone sponsors, projects, and program information
7. **Lighthouse audit** all page types to verify 90+ scores
8. **Admin training** session for program coordinators on Sanity Studio page builder