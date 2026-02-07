---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
inputDocuments:
  - '/home/jay/github/astro-shadcn-sanity/initial-brainstorm.md'
  - '/home/jay/github/astro-shadcn-sanity/_bmad-output/brainstorming/brainstorming-session-2026-02-07.md'
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 1
  projectDocs: 0
classification:
  projectType: 'web_app'
  domain: 'edtech'
  complexity: 'low-medium'
  projectContext: 'greenfield'
---

# Product Requirements Document - astro-shadcn-sanity

**Author:** Jay
**Date:** 2026-02-07

## Executive Summary

The YWCC Capstone Sponsors platform is a modular, CMS-driven static website for NJIT's Ying Wu College of Computing Industry Capstone program. It connects industry sponsors with capstone teams by showcasing sponsor organizations, project proposals, team rosters, and program information.

**Differentiator:** A toolkit-not-website approach — content editors compose pages by stacking reusable UI blocks in Sanity Studio with zero code required. The block library maps editor-friendly names to shadcn/ui component internals, making the design system invisible to non-technical users.

**Tech Stack:** Astro (SSG) + Sanity.io (headless CMS) + Tailwind CSS/shadcn/ui (styling) + vanilla JS (interactivity) + Storybook via storybook-astro (component development) + Cloudflare Pages (hosting) + Cloudflare Worker (form proxy).

**Target Users:**
- Industry sponsors and prospective sponsors (site visitors)
- YWCC capstone program administrators (content editors)
- Capstone students and faculty advisors (site visitors)

**Constraints:** $0/month operating cost (all free tiers), Lighthouse 90+ across all categories, zero runtime API calls.

**Reference Site:** ywcccapstone1.com — all page types reproducible with the block library.

## Success Criteria

### User Success

- Content editors compose new pages from scratch using the block library in Sanity Studio without developer assistance
- Content editors update content (sponsors, projects, dates) and see changes live within minutes via automated rebuild
- Prospective sponsors clearly understand the program value proposition and submit inquiries through the contact form
- Students and faculty find team assignments, project details, and program dates in one centralized location

### Business Success

- Platform replaces scattered documents/web pages with a single professional hub for the YWCC Industry Capstone program
- Sponsor recruitment pipeline streamlined — clear path from landing page to inquiry submission
- $0/month operating cost sustained across all services (Sanity, Cloudflare Pages, GA4, Monsido)
- Non-technical administrators maintain the site independently after initial handoff

### Technical Success

- Lighthouse 90+ across all categories on every page type
- All 6+ page types from ywcccapstone1.com reproducible using the block library with zero custom code
- Static builds under 60 seconds; full CI/CD pipeline under 3 minutes
- Zero runtime API calls — all content baked into static HTML at build time
- Free tier headroom at 10x+ on all services

### Measurable Outcomes

- 100% of reference site pages reproducible with block library (validated at launch)
- Lighthouse 90+ on all page types (automated audit in CI)
- Build-time Sanity API usage under 10% of free tier limits
- Contact form submissions successfully written to Sanity via Cloudflare Worker

## User Journeys

### Journey 1: Dr. Sarah Chen — Prospective Industry Sponsor

**Who:** VP of Engineering at a mid-size fintech company evaluating whether to sponsor a capstone team.

**Opening Scene:** Sarah googles "NJIT capstone sponsors" and lands on the homepage. She sees the Stats Row ("50+ Sponsors", "200+ Projects") and a Logo Cloud of recognizable companies. Credibility established in 3 seconds.

**Rising Action:** She clicks "Why Sponsor," landing on a Feature Grid listing benefits (talent access, applied R&D, recruiting pipeline). She scrolls to the FAQ Accordion — "How much does it cost?", "What's the time commitment?" She clicks through to Sponsor Cards, filters by industry, and sees two fintech companies already participating.

**Climax:** She clicks "Become a Sponsor," fills out the Contact Form (name, organization, email, message about a fraud detection project idea), and gets a toast confirmation.

**Resolution:** A YWCC admin sees her submission in Sanity Studio within the hour and follows up.

**Requirements revealed:** Hero, Feature Grid, FAQ, Sponsor Cards (filtering), CTA Banner, Contact Form, Toast feedback, SEO/meta.

### Journey 2: Maria Gonzalez — YWCC Program Administrator (Content Editor)

**Who:** Capstone program coordinator at NJIT. Non-technical. Needs to update the site every semester.

**Opening Scene:** Start of Fall semester. Maria logs into Sanity Studio to add three new sponsors, update timeline dates, and create a "Fall 2026" projects page.

**Rising Action:** She creates Sponsor documents (logos, descriptions, tier badges), updates Timeline milestones, and builds a new Page by dragging in Hero, Rich Text, and Sponsor Cards blocks.

**Climax:** She hits Publish. Cloudflare Pages rebuilds automatically. Within 3 minutes, the live site reflects all changes.

**Resolution:** Maria shares the link with new sponsors. No developer involved. Done in her lunch break.

**Requirements revealed:** Sanity Studio UX (intuitive schemas, drag-and-drop blocks), document types, webhook-triggered rebuilds, flat block array architecture.

### Journey 3: Kevin Park — Computer Science Senior (Student)

**Who:** Senior CS student assigned to a capstone team. Needs to find his team assignment, sponsor project details, and key dates.

**Opening Scene:** Kevin clicks through from a program email to the capstone site.

**Rising Action:** He navigates to "Projects," finds his team's card (sponsor, project description, tech stack, team members). He clicks the sponsor name to see their full profile and other projects.

**Climax:** He checks the Timeline — Demo Day is April 18th, mid-semester check-in is March 7th, proposal deadline already passed (marked completed).

**Resolution:** Kevin bookmarks the site for periodic date and project updates.

**Requirements revealed:** Project/team document types, sponsor detail pages, Timeline with status indicators, document cross-references.

### Journey 4: Jay — Template Developer / Maintainer

**Who:** Developer building and maintaining the base template. Needs to add blocks and ensure maintainability.

**Opening Scene:** Request: "We need a Testimonials carousel for the homepage."

**Rising Action:** Jay creates a Sanity schema (`testimonials.ts`) inheriting the shared base schema, a matching `Testimonials.astro` component using shadcn Card + Avatar + Carousel patterns, and registers it in BlockRenderer.

**Climax:** Local build — Lighthouse scores hold at 95+. Carousel uses vanilla JS, zero framework runtime.

**Resolution:** The block ships. Maria can immediately drag it onto any page.

**Requirements revealed:** Block registration pattern (schema + component + BlockRenderer), shared base schema inheritance, vanilla JS interactivity, Lighthouse CI validation.

### Journey Requirements Summary

| Capability | Revealed By |
|---|---|
| SEO & meta tags | Journey 1 (search discovery) |
| Content filtering (tier, industry) | Journey 1, 3 (browsing) |
| Contact form → Sanity submission | Journey 1 (sponsor inquiry) |
| Toast/feedback UI | Journey 1 (form confirmation) |
| Drag-and-drop page builder | Journey 2 (page composition) |
| Webhook-triggered rebuilds | Journey 2 (publish → deploy) |
| Document cross-references | Journey 3 (sponsor → project → team) |
| Timeline with status states | Journey 3 (date tracking) |
| Shared base schema pattern | Journey 4 (block development) |
| BlockRenderer registration | Journey 4 (adding new blocks) |
| Lighthouse CI validation | Journey 4 (performance guardrails) |

## Web App Specific Requirements

### Architecture Overview

Multi-page application (MPA) built with Astro SSG. Pages pre-rendered at build time as flat arrays of CMS blocks rendered to static HTML. Interactive elements use scoped vanilla JS with data-attribute driven event delegation.

**Rendering:** SSG via Astro. No runtime API calls. Hybrid SSR available via `@astrojs/cloudflare` adapter if needed later. BlockRenderer maps Sanity `_type` to Astro components at build time.

**Browser Support:** Modern evergreen browsers (Chrome, Firefox, Safari, Edge — last 2 versions). Progressive enhancement — core content accessible without JS.

**Responsive Design:** Mobile-first with Tailwind breakpoints. Mobile navigation via shadcn Sheet/Drawer. Shared block base schema includes max-width variants (Narrow/Default/Full).

### SEO Strategy

- Static HTML with full server-rendered content — optimal for crawlers
- Per-page SEO fields in Sanity (metaTitle, metaDescription, ogImage)
- Semantic HTML5 (heading hierarchy, landmarks, alt text)
- Sitemap via `@astrojs/sitemap`, canonical URLs, Open Graph tags

### Implementation Considerations

- **Images:** Sanity CDN with `@sanity/image-url` for responsive `srcset` and WebP/AVIF format negotiation
- **Fonts:** System font stack or NJIT brand font with `font-display: swap`
- **JS budget:** Under 2KB minified total — accordion (~25 lines), tabs (~20 lines), mobile nav (~30 lines), carousel (~40 lines), form handler (~50 lines)
- **CSS:** Tailwind purged at build time — under 10KB final
- **Build:** Astro + Vite pipeline

## Project Scoping & Phased Development

### MVP Strategy

**Approach:** Problem-solving MVP — deliver the minimum block set and CMS architecture that lets a content editor build all core pages without developer intervention.

**Resource Requirements:** Solo developer (Jay) + content editor for validation.

### Phase 1 — MVP

**Journeys Supported:** Prospective Sponsor (full inquiry path), Content Editor (create/update pages), Student (find assignments and dates).

| Capability | Rationale |
|---|---|
| 12 P0 Blocks (Hero Banner, Feature Grid, Sponsor Cards, Rich Text, CTA Banner, FAQ, Contact Form, Timeline, Logo Cloud, Stats Row, Team Grid, Text With Image) | Full set to reproduce all reference site pages. Stats Row, Team Grid, and Text With Image promoted from P1 (already implemented in reference project). |
| Shared block base schema (background, spacing, max-width) | Consistent block behavior foundation |
| BlockRenderer + flat block array architecture | Core page builder pattern |
| 7 Sanity document types (page, sponsor, project, team, event, submission, siteSettings) | Content model for all core data |
| Cloudflare Pages + CI/CD | Production hosting |
| Cloudflare Worker form proxy | Secure form submissions |
| Site layout (nav, footer, breadcrumb, mobile nav) | shadcn NavigationMenu, Sheet, Breadcrumb |
| SEO (meta tags, sitemap, Open Graph) | Search discoverability |
| GA4 + Monsido | Analytics from day one |

**Deferred from MVP:** CarouselWrapper, client-side filtering on Sponsor Cards/Projects, cookie consent banner (TBD on NJIT policy), webhook-triggered rebuilds.

### Phase 2 — Growth

- 3 P1 blocks: Tabbed Content, Testimonials, Data Table (Stats Row, Team Grid promoted to P0)
- CarouselWrapper as reusable layout variant
- Client-side filtering on Sponsor Cards (tier, industry) and Projects (semester, tech)
- GA4 consent mode (cookieless pings until opt-in)
- Sanity webhook → Cloudflare Pages auto-rebuild on content publish
- Cookie consent banner (once NJIT policy confirmed)

### Phase 3 — Expansion

- 3 P2 blocks: Image Gallery, Video Embed, Alert/Notice
- SSR hybrid pages via `@astrojs/cloudflare` if dynamic features needed
- Admin training video / onboarding walkthrough
- Additional shadcn blocks as editor needs emerge
- Multi-language support (if international sponsors require it)

### Risk Mitigation

| Risk | Mitigation |
|---|---|
| Block complexity creep | Shared base schema + flat-array constraint. No nested blocks. |
| Vanilla JS maintainability | Each component under 50 lines, consistent data-attribute patterns |
| Sanity schema breaking builds | TypeScript schemas + GROQ query validation in CI |
| Editor adoption | Editor-friendly naming, constrained presets, no shadcn jargon |
| Sponsor engagement | Clear CTA paths, professional design matching reference site |
| Solo developer | Formulaic block pattern (schema + component + BlockRenderer). All blocks follow same structure. Storybook enables isolated component development and documentation. |
| Time constraints | Cut P0 to 6 essential blocks (Hero, Rich Text, CTA, Contact Form, Sponsor Cards, FAQ). Remaining 3 follow immediately. |

## Functional Requirements

### Page Composition & Content Management

- **FR1:** Content editors can create new pages by selecting and arranging blocks from the block library
- **FR2:** Content editors can reorder, add, and remove blocks on any page without developer assistance
- **FR3:** Content editors can configure each block's background variant, spacing, and max-width from constrained presets
- **FR4:** Content editors can preview page content before publishing
- **FR5:** Content editors can publish changes that trigger automated site rebuild and deployment

### Sponsor Management

- **FR6:** Content editors can create and manage sponsor profiles (name, logo, description, website, industry, tier)
- **FR7:** Content editors can mark sponsors as featured for homepage prominence
- **FR8:** Site visitors can browse all sponsors in a card-based layout
- **FR9:** Site visitors can view individual sponsor detail pages with description, logo, website, and associated projects

### Project & Team Management

- **FR10:** Content editors can create project records (title, description, sponsor ref, technology tags, team ref, semester, status)
- **FR11:** Content editors can create team records (member names, roles, photos, LinkedIn, project ref, advisor ref)
- **FR12:** Site visitors can browse projects with sponsor, team, and technology details
- **FR13:** Site visitors can navigate between related content (sponsor → projects → teams) via cross-references

### Program Information

- **FR14:** Content editors can manage program events (title, date, location, description, type)
- **FR15:** Site visitors can view a timeline of milestones with current/completed/upcoming status indicators
- **FR16:** Content editors can update program dates and milestones each semester

### Sponsor Inquiry & Contact

- **FR17:** Site visitors can submit a sponsor inquiry form (name, organization, email, message)
- **FR18:** Form input is validated before submission
- **FR19:** Form submissions are stored as documents in Sanity via secure server-side proxy
- **FR20:** Content editors can view and manage all form submissions in Sanity Studio
- **FR21:** Site visitors receive visual confirmation after successful form submission

### Block Library (P0)

- **FR22:** Hero Banner blocks render with heading, subheading, optional background image, CTA buttons, and configurable alignment
- **FR23:** Feature Grid blocks render with icon/image + title + description cards in configurable column layouts
- **FR24:** Sponsor Cards blocks render from sponsor documents with tier badges
- **FR25:** Rich Text blocks render from Portable Text with inline images and callout boxes
- **FR26:** CTA Banner blocks render with heading, description, and action buttons
- **FR27:** FAQ Accordion blocks render with expandable question/answer pairs and keyboard accessibility
- **FR28:** Contact Form blocks render with configurable fields and server-side submission
- **FR29:** Timeline blocks render with date-ordered milestones and current-phase highlighting
- **FR30:** Logo Cloud blocks render from sponsor document logos
- **FR41:** Stats Row blocks render with configurable stat value/label pairs in a responsive row layout
- **FR42:** Team Grid blocks render team member cards with photos, names, roles, and optional LinkedIn links
- **FR43:** Text With Image blocks render rich text content alongside a positioned image (left/right)

> **Change Log (2026-02-07):** FR41-FR43 added. Stats Row, Team Grid, and Text With Image promoted from P1 to P0 per Sprint Change Proposal — these blocks already exist in the reference implementation.

### Site Navigation & Layout

- **FR31:** Persistent header navigation menu across all pages
- **FR32:** Slide-out navigation drawer for mobile devices
- **FR33:** Breadcrumb navigation on interior pages
- **FR34:** Site footer with key links and information

### SEO & Discoverability

- **FR35:** Content editors can set per-page SEO metadata (title, description, Open Graph image)
- **FR36:** Sitemap generated for search engine crawlers
- **FR37:** Semantic HTML with proper heading hierarchy and landmark regions

### Analytics & Monitoring

- **FR38:** Page views and visitor behavior tracked via GA4
- **FR39:** Accessibility compliance monitored via Monsido

### Site Configuration

- **FR40:** Content editors can manage global site settings (site name, logo, navigation, footer, social links, current semester) from a single settings document

## Non-Functional Requirements

### Performance

- **NFR1:** Lighthouse Performance score 95+ on mobile and desktop
- **NFR2:** First Contentful Paint under 1.0s on 4G connections
- **NFR3:** Largest Contentful Paint under 2.0s on 4G connections
- **NFR4:** Total Blocking Time under 100ms — no framework runtime
- **NFR5:** Cumulative Layout Shift under 0.05
- **NFR6:** Page JavaScript payload under 5KB minified (excluding third-party analytics)
- **NFR7:** CSS payload under 15KB after Tailwind purge
- **NFR8:** Static build under 60 seconds; full CI/CD pipeline under 3 minutes

### Security

- **NFR9:** Sanity write token never exposed to client — form submissions route through Cloudflare Worker
- **NFR10:** Contact form includes honeypot field and rate limiting
- **NFR11:** HTTPS with security headers (CSP, X-Frame-Options, X-Content-Type-Options)
- **NFR12:** No user credentials or PII stored client-side

### Accessibility

- **NFR13:** WCAG 2.1 AA compliance on all pages
- **NFR14:** Lighthouse Accessibility score 90+ on all page types
- **NFR15:** All interactive elements keyboard navigable with visible focus indicators
- **NFR16:** All images require descriptive alt text (enforced via Sanity schema)
- **NFR17:** Color contrast meets AA minimums (4.5:1 normal text, 3:1 large text) across all background variants
- **NFR18:** Screen reader compatibility verified for all block types and navigation
- **NFR19:** Skip-to-content link on every page

### Integration

- **NFR20:** Sanity content fetched exclusively at build time — zero runtime API calls
- **NFR21:** Build-time Sanity API usage under 10% of free tier (100K requests/month)
- **NFR22:** Cloudflare Worker handles up to 100 form submissions/day within free tier
- **NFR23:** GA4 loads asynchronously, does not block page rendering
- **NFR24:** Monsido operates without impacting performance metrics

### Maintainability

- **NFR25:** Adding a new block requires exactly 3 files: Sanity schema, Astro component, BlockRenderer registration
- **NFR26:** All Sanity schemas use TypeScript for type safety
- **NFR27:** Block components follow consistent patterns: shared base schema inheritance, Tailwind utilities, data-attribute driven JS
- **NFR28:** Zero external JS framework dependencies (no React, Vue, Alpine runtime)
