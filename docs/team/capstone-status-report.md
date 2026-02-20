# YWCC Capstone Website -- Status Report

**Generated:** 2026-02-19
**Last updated:** 2026-02-20 (Story 6.1 contact form backend marked done)
**Source:** Automated codebase audit against `docs/team/capstone-stakeholders.pdf`

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Astro (SSG + selective SSR) | ^5.17.1 |
| CMS | Sanity Studio v3 | ^5.10.0 |
| UI | shadcn/ui + Swiss design system (Tailwind v4) | ^3.8.4 / ^4.1.18 |
| Deployment | Cloudflare Pages (Workers) | wrangler ^4.63.0 |
| Auth | Cloudflare Access (JWT via `jose`) | ^6.1.3 |
| Testing | Vitest (unit/component) + Playwright (E2E) | ^3.2.1 / ^1.58.2 |
| CI/CD | GitHub Actions (7 workflows) + semantic-release | -- |

**Architecture:** Static site generation with a CMS page builder (13 block types, 5 page templates). Pages are composed in Sanity Studio and rendered at build time via a `[...slug]` catch-all route. The `/portal` routes use SSR with Cloudflare Access authentication.

---

## WordPress Scrape Data (for content migration)

The original WordPress site at `https://ywcccapstone1.com/` was fully scraped on 2026-02-19. All content and images are stored locally for migration into Sanity.

| Asset | Location |
|---|---|
| **Structured content** (all pages) | `_wp-scrape/scraped-content.md` |
| **Downloaded images** (25 files, 24MB) | `_wp-scrape/images/` |

### Scraped Pages

| WP Page | URL | Migrated? |
|---|---|---|
| Homepage | `/` | **Partially** -- hero images + heading updated, logoCloud added |
| About the Capstone Program | `/about-the-capstone-program/` | Not yet (Sanity page exists with test content) |
| Research & Development | `/research-development/` | **Done** -- created as `/rnd` with 6 blocks + images |
| Sponsor Guide | `/sponsor-guide/` | Not yet (maps to existing `/how-to-become-a-sponsor`) |
| Partner With Us | `/partner-with-us/` | Not yet (partnership inquiry form with Formsite embed) |
| Events | `/events/` | Not yet (only 1 real event: Spring 2026 Showcase, May 7) |
| Activities | `/activities/` | Not yet (no equivalent page in Astro site) |
| Contact | `/contact/` | Not yet (has Subject field + office hours our form lacks) |
| Featured Projects | `/past-project/` | Not yet (9 real projects scraped) |
| Website Capstone Team | `/website-capstone-team/` | Not yet |

### Downloaded Images Inventory

**Sponsor logos (7):** verizon-logo.png, forbes-logo.png, ups-logo.png, boa-logo.png, eco-logo.jpeg, cisco-logo.png, angeles-logo.png -- **All uploaded to Sanity**

**Hero/banner (4):** hero-1.png, hero-2.jpg, hero-3.png, featured-img7985.jpg -- **hero-1/2/3 uploaded to Sanity**

**About page (5):** about-logo.webp, about-teams-at-work.jpg, about-screenshot.png, about-img7146.jpg -- **Not yet uploaded**

**Step icons (4):** step1.png, step2.png, step3.png, step4.png -- **All uploaded to Sanity**

**R&D (2):** rnd-hero.jpg, rnd-step3.png -- **All uploaded to Sanity**

**Activities (4):** activities-hero.jpg, activities-1.jpg, activities-2.jpg, activities-3.jpg -- **Not yet uploaded**

### Sanity Image Asset IDs (already uploaded)

```
# Sponsor logos
verizon    -> image-3157a75c31673fb3d1f4fc26fb3c237d42d1d27b-2560x574-png
forbes     -> image-cdf07906abd0da02d5afad022093852a999e4f54-4096x4096-png
ups        -> image-fe492fcae31cb8906039a4fc1e13e3de6de017fb-3000x2000-png
boa        -> image-6e8f13ae7c9b0d098a9997152966cee1454be1cf-3840x2160-png
eco        -> image-5d1e627ef1771da07599acf3860e16c33e327b56-225x225-jpg
cisco      -> image-fecb9fbbbcd58213fbcde8e5ef184533cef113a9-3795x2000-png
angeles    -> image-cb4c236197e378e4e99c69334754f333af944e54-256x256-webp

# Hero images
hero-1     -> image-554548c26dcbd73c5c8c9dd31e2ebd45b3cfd7e9-2180x894-png
hero-2     -> image-d760f0da3c184147e49428b6f5ae74b75a07706b-5712x4284-jpg
hero-3     -> image-ed7c80c3ec54bd2d5371a46682fcebdc3b36b93d-1926x1014-png

# R&D page images
rnd-hero   -> image-71574efb5c5275f02c0ee49a07fbafe4eb0219a2-1140x600-jpg
rnd-step3  -> image-dc9829482a063cd5ebbacaa1e28992ed4c26419e-1024x1024-png

# Step icons
step1      -> image-2a6401c1446d28831232afe928a2eb5eca445ee5-1024x1024-png
step2      -> image-d7fc6412e224310fad351e63f752f0a3cd7603e2-1024x1024-png
step3      -> image-ab9a4d3f6c3b2fdc989e85a2ecbd19047cafc679-1024x1024-png
step4      -> image-b58cfccc754c1c5c735fcb5b63ef9e2b368a1368-1024x1024-png
```

---

## What Is Done

### Sanity Schema (27 types deployed)

| Category | Types |
|---|---|
| **Documents (6)** | `page`, `siteSettings` (singleton), `sponsor`, `project`, `testimonial`, `event` |
| **Objects (8)** | `seo`, `button`, `link`, `portableText`, `faqItem`, `featureItem`, `statItem`, `stepItem` |
| **Page Builder Blocks (13)** | `heroBanner`, `featureGrid`, `ctaBanner`, `statsRow`, `textWithImage`, `logoCloud`, `sponsorSteps`, `richText`, `faqSection`, `contactForm`, `sponsorCards`, `testimonials`, `eventList` |

### Sanity Content Status

#### Sponsors -- UPDATED with real data (2026-02-20)

All 7 sponsors replaced with real companies from the WordPress site. Document IDs preserved so project references remain valid.

| Sponsor | ID | Tier | Featured | Logo |
|---|---|---|---|---|
| Verizon | `b4aaf35f-dc0d-4567-993b-33bc66820e67` | platinum | yes | Uploaded |
| Cisco | `0ac25e8d-f75d-478a-8512-994d83fe6177` | platinum | yes | Uploaded |
| Bank of America | `004122e9-a8d4-40c3-82ab-3e980bd5cb72` | gold | yes | Uploaded |
| Forbes | `e2febb59-87ae-473f-a91e-60adb83f3e6d` | gold | yes | Uploaded |
| UPS | `789cb14e-e72e-4335-b6d5-ac3bb87b022d` | gold | yes | Uploaded |
| Eco-Enterprise | `6f2a7a01-a75e-416d-b219-c59b4c6a2dc5` | silver | no | Uploaded |
| Angeles de Medellin Foundation | `72e7a364-fd4e-4b38-9acd-a3314ed4cb95` | bronze | no | Uploaded |

#### Pages

| Page | Slug | ID | Blocks | Status |
|---|---|---|---|---|
| Home | `home` | `99664be0-7a28-45a0-b9be-df5554b35438` | 7 | **Updated 2026-02-20:** hero images (3), heading updated, logoCloud block added |
| About the Capstone Program | `about-the-capstone-program` | `bf3c96a6-16e3-48d0-978b-6ca4f2f934b0` | 7 | Test content -- needs WP content migration |
| How to Become a Sponsor | `how-to-become-a-sponsor` | `911c1cfa-4cf3-4d6f-99c5-8f7d43ccd6d8` | 11 | Test content -- needs WP content migration |
| Events & Engagement | `events` | `ca81cc32-6d67-4cda-8933-633dfae1904d` | 4 | Test content |
| Testimonials | `testimonials` | `ada5ce67-a539-448c-b3c7-79b34911c19a` | 4 | Test content |
| Contact | `contact` | `9449931a-adef-41b0-b3e1-390b45849574` | 3 | **Form backend live** (Story 6.1) -- Astro Action + Turnstile + Sanity submissions + Discord webhook |
| **Research & Development** | `rnd` | `2d09c2a5-e300-4084-92de-3c81cb45da4a` | 6 | **Created 2026-02-20** with real WP content + images |
| Pranav (test) | `pranav` | `9288ba72-d543-4510-882e-02b49fe5099b` | 1 | Test page -- should be deleted |

#### Projects -- STILL TEST DATA

7 fictitious projects remain. Need to be replaced with the 9 real projects scraped from WP:

| Real Project (from WP) | Sponsor | Technologies | Mapped to Existing ID? |
|---|---|---|---|
| Zero Trust Microsegmentation Network | Cisco | Network Security, VLAN, 802.1X, RADIUS | Not yet |
| 5G-Enabled Alzheimer's Care Application | Verizon | 5G, Healthcare IoT, AI/ML, Edge Computing | Not yet |
| Educational Platform for At-Risk Youth | Angeles de Medellin | React, Node.js, MongoDB, WebRTC | Not yet |
| Blockchain-Secured DNS Infrastructure | Cisco | Blockchain, DNS, Ethereum, Smart Contracts | Not yet |
| ML Article Appeal Prediction | Forbes | ML, NLP, Data Analytics | Not yet |
| Azure ML Resource Optimization | UPS | Azure ML, Cloud, Predictive Analytics | Not yet |
| Sentiment Analysis & Workforce Optimization | Bank of America | Data Science, Sentiment Analysis | Not yet |
| Eco-Strategy Sustainability Portal 3.0 | Eco-Enterprise | Sustainability, Gamification, IoT, Blockchain | Not yet |
| YWCC Capstone Website | NJIT (internal) | WordPress, PHP, Elementor | Not yet |

#### Testimonials -- STILL TEST DATA

10 fictitious testimonials remain. The WP site does not have individual testimonials pages, but project outcomes contain testimonial-worthy content (e.g., "All 8 students hired as equity partners").

#### Events -- STILL TEST DATA

7 fictitious events remain. The WP site has only 1 real event: Spring 2026 Capstone Showcase (May 7, 2026, 2-5 PM, Campus Center Ballroom).

### Implemented Routes

| URL | Source | Rendering |
|---|---|---|
| `/` | `pages/index.astro` | SSG -- Homepage (page builder blocks from Sanity) |
| `/sponsors` | `pages/sponsors/index.astro` | SSG -- Sponsor listing grid |
| `/sponsors/[slug]` | `pages/sponsors/[slug].astro` | SSG -- Sponsor detail (logo, tier, industry, projects, JSON-LD) |
| `/projects` | `pages/projects/index.astro` | SSG -- Project listing with client-side tag/industry filtering |
| `/projects/[slug]` | `pages/projects/[slug].astro` | SSG -- Project detail (Portable Text content, team, mentor, outcome, testimonials) |
| `/events/[slug]` | `pages/events/[slug].astro` | SSG -- Event detail (date/time, location, type, JSON-LD Event) |
| `/portal` | `pages/portal/index.astro` | SSR -- Sponsor portal (authenticated, placeholder cards) |
| `/portal/api/me` | `pages/portal/api/me.ts` | SSR -- JSON endpoint for authenticated user |
| `/[...slug]` | `pages/[...slug].astro` | SSG -- Catch-all for CMS pages (about, contact, testimonials, R&D, etc.) |

### How It Works

**Page Builder Flow:**
1. Content editors compose pages in Sanity Studio using the `blocks[]` array field
2. Each block type (heroBanner, featureGrid, contactForm, etc.) has its own schema fields
3. At build time, `PAGE_BY_SLUG_QUERY` fetches the page with type-conditional GROQ projections
4. `BlockRenderer.astro` maps each block's `_type` to the correct Astro component
5. `BlockWrapper.astro` applies shared styling (background variant, spacing, max width)
6. Helper functions (`resolveBlockSponsors`, `resolveBlockTestimonials`, `resolveBlockEvents`) resolve data references per-block

**Build & Deploy Flow:**
1. Content publish in Sanity triggers webhook -> GitHub `repository_dispatch`
2. GitHub Actions builds Astro site and deploys to Cloudflare Pages via wrangler
3. Feature branches -> `preview` branch -> `main` (enforced by CI)
4. Semantic-release on `main` generates versions/changelogs

**Visual Editing:**
- Stega encoding embeds invisible markers in rendered text
- `@sanity/visual-editing` MPA overlay makes content click-to-edit in Sanity Presentation tool
- Server Islands (`SanityPageContent`) serve draft content in preview mode

**Authentication (Portal):**
- Cloudflare Access enforces auth at the edge for `/portal*` routes
- Middleware validates JWT server-side via JWKS endpoint as defense-in-depth
- User email extracted from JWT and available in `Astro.locals.user`

### Testing Infrastructure

| Layer | Count | Details |
|---|---|---|
| Unit (Vitest) | 3 test files | `cn()` util, image URL helpers, GROQ query strings |
| Component (Vitest + Container API) | 17 test files | All 13 block types + BlockRenderer, BlockWrapper, ProjectCard, Breadcrumb, Header |
| SSR Smoke (Vitest + Miniflare) | 3 test files | Worker smoke, build output, wrangler config |
| Integration (Vitest) | Multiple suites | Schema registration, data fetching, architecture validation |
| E2E (Playwright) | 5 specs | Smoke, pages, homepage, site settings, GTM data layer |
| Browsers | 5 targets | Chromium, Firefox, WebKit, Mobile Chrome (Pixel 7), Mobile Safari (iPhone 14) |

### Features Beyond Stakeholder Requirements

- **Visual Editing** -- Full Sanity Presentation tool integration with stega + Server Islands
- **GTM Analytics** -- Page views, form events, FAQ expand, carousel nav, link click tracking
- **JSON-LD Structured Data** -- EducationalOrganization, Organization, Event, BreadcrumbList
- **SEO** -- Per-page meta, OG/Twitter cards, Content Security Policy
- **Build Caching** -- Module-level data caching with parallel batch pre-fetching
- **Storybook** -- Component documentation deployed to GitHub Pages (~95 pre-built blocks)
- **Multi-Template System** -- 5 layout templates selectable per-page in CMS
- **Responsive Design** -- Full mobile support across all pages and portal

---

## Summary Matrix

| Stakeholder Section | Status |
|---|---|
| 4.1 Homepage | **Updated** -- hero images + heading from WP, logoCloud added. Still needs Featured Projects block. |
| 4.2 About the Capstone Program | Page exists with test content -- needs WP content migration. Sponsorship Levels need comparison block. |
| 4.3 Industry Projects Showcase | Projects are still test data -- 9 real projects scraped from WP, need to be migrated. |
| 4.4 Sponsorship Opportunities | **Form backend live** (Story 6.1) -- Turnstile bot protection, Sanity submissions, Discord notifications. Tiers comparison block still needed. |
| 4.5 Research and Development | **Done** -- R&D page created with 6 blocks + images from WP content |
| 4.6 Testimonials and Success Stories | Page exists with test content (industry/student/byProject modes work) |
| 4.7 Events and Engagement | Page exists with test data -- needs standalone `/events` listing page |
| 5. How to Become a Sponsor | Page exists with test content -- WP Sponsor Guide has richer content to migrate |
| 6.1 Interactive Sponsor Dashboard | Stub only -- auth works, all features are placeholder cards |
| 6.2 Event Calendar and Notifications | Partially done -- event list exists, no calendar view or reminders |
| 7. Design/UX | Done -- responsive, professional, easy CMS editing |
| 8. CMS | Done (Sanity, not WordPress as originally specified) -- role-based access via Cloudflare Access |
| 9. Security | Done -- SSL, JWT auth, CSP headers, HTTPS enforced |

---

## Remaining Work Checklist

### P0 -- Critical Path (blocks stakeholder acceptance)

#### 4.5 Research & Development

- [x] ~~Create R&D CMS page in Sanity with slug `rnd` so the existing nav link works~~ (Done 2026-02-20)
- [x] ~~Add `textWithImage` / `featureGrid` / `richText` blocks with real-world research focus~~ (Done: 6 blocks)
- [x] ~~Add hero + textWithImage images from WP site~~ (Done: rnd-hero.jpg + rnd-step3.png)
- [ ] Add content covering publication and conference opportunities (can add a `richText` or `featureGrid` block to the existing R&D page)
- [ ] Add content covering mentorship and collaboration (can add blocks to R&D page)
- [ ] *(Optional stretch)* Create `publication` document type if structured publication data is needed

#### 4.4 Contact/Sponsor Inquiry Form -- backend (DONE -- Story 6.1)

- [x] ~~Replace simulated form submission in `main.ts` `initContactForm()` with a real backend~~ (Done: Astro Action in `src/actions/index.ts`)
- [x] ~~Create a server-side API endpoint that receives form data~~ (Done: Astro Action with `accept: 'form'` + Zod validation)
- [x] ~~Integrate notification delivery~~ (Done: Discord webhook notification on submission)
- [x] ~~Add server-side validation~~ (Done: Zod schema + Cloudflare Turnstile bot protection)
- [x] ~~Store submissions in Sanity~~ (Done: `submission` document type, viewable in Studio)
- [x] ~~Update `ContactForm.astro` to submit and handle success/error responses~~ (Done: `import { actions } from 'astro:actions'`)
- [ ] Add Subject field, office hours, program director info from WP (content gap, not backend)

### P1 -- High Priority (core stakeholder requirements)

#### Content migration from WP (Sanity MCP tasks)

- [ ] **Replace 7 test projects** with 9 real projects from WP scrape (see project table above). Each needs: title, slug, sponsor reference, status, semester, content (Portable Text), outcome, team members, mentor, technology tags. Source: `_wp-scrape/scraped-content.md` Projects section.
- [ ] **Update events** -- replace 7 test events with real event(s). Only 1 real event from WP: Spring 2026 Capstone Showcase (May 7, 2-5 PM, Campus Center Ballroom).
- [ ] **Update About page** (`bf3c96a6`) -- migrate WP content (mission, core values, 4-step process, 6 benefit cards). Images to upload: about-teams-at-work.jpg, about-screenshot.png, about-img7146.jpg.
- [ ] **Update How to Become a Sponsor page** (`911c1cfa`) -- WP Sponsor Guide has richer content (5.1-5.5 sections, FAQs). May need to restructure blocks.
- [ ] **Update Contact page** (`9449931a`) -- add Subject field, office hours, program director info from WP.
- [ ] **Update testimonials** -- replace test testimonials with content derived from real project outcomes (WP has no dedicated testimonials but projects have notable outcomes).
- [ ] **Update siteSettings** -- update contact info to match WP (323 Dr MLK Jr Blvd, office hours, social links with Facebook added).
- [ ] **Delete Pranav test page** (`9288ba72`)

#### 4.1 Homepage gaps

- [x] ~~Add a `logoCloud` block to the Home page in Sanity~~ (Done 2026-02-20: autoPopulate=true)
- [x] ~~Add hero background images~~ (Done 2026-02-20: 3 carousel images from WP)
- [x] ~~Update hero heading/subheading to match WP~~ (Done 2026-02-20)
- [ ] Create a `projectCards` page builder block schema (similar to `sponsorCards`) with display modes: `all`, `featured`, `manual`
- [ ] Build `ProjectCards.astro` component for the new block
- [ ] Register the block in `BlockRenderer.astro` and the page schema's block array
- [ ] Add the `projectCards` block to the Home page in Sanity
- [ ] Run `npm run typegen` after schema changes
- [ ] Deploy schema (`npx sanity schema deploy` from `studio/`)

#### 4.2/4.4 Sponsorship Tiers comparison

- [ ] Create a `sponsorshipTiers` page builder block schema with tier name, price/cost (if applicable), and benefits list per tier
- [ ] Build `SponsorshipTiers.astro` component (pricing-table style comparison layout)
- [ ] Register the block in `BlockRenderer.astro` and the page schema
- [ ] Add the block to the "About" or "How to Become a Sponsor" page in Sanity
- [ ] Run `npm run typegen` and deploy schema

#### Events listing page

- [ ] Create `/events` index page (`pages/events/index.astro`) with `getStaticPaths`, listing all events
- [ ] Add client-side filtering by event type (showcase, networking, workshop) and status (upcoming, past)
- [ ] Fix events breadcrumb to link to `/events` instead of `/`
- [ ] Verify navigation in Sanity `siteSettings` links to `/events`

#### 4.3 Project filtering improvements

- [ ] Add sorting controls to `/projects` page (by semester, by title, by status)
- [ ] *(Optional)* Add a `topic` or `category` field to the `project` schema if topic-based filtering is needed
- [ ] Run `npm run typegen` if schema is changed

### P2 -- Medium Priority (polish and completeness)

#### 4.3 Impact Case Studies

- [ ] *(Option A -- lightweight)* Create a CMS page with slug `case-studies` using `testimonials` blocks in `byProject` display mode combined with `richText` blocks for narrative
- [ ] *(Option B -- structured)* Create a `caseStudy` document type with fields: project reference, challenge, solution, results, sponsor testimonial, and metrics
- [ ] If Option B: build `CaseStudyCards` page builder block and `CaseStudy` detail page route

#### 4.4 Sponsorship Opportunities standalone page

- [ ] Create a CMS page in Sanity with slug `sponsorship-opportunities` (or consolidate with existing "How to Become a Sponsor" page)
- [ ] Ensure it includes: Why Sponsor (`textWithImage`/`featureGrid`), Sponsorship Tiers (new block from P1), and Inquiry Form (`contactForm`)

#### Homepage content arrangement (CMS-only tasks)

- [ ] Review Home page blocks in Sanity Studio and reorder/add blocks to match stakeholder spec order: Hero -> Program Overview -> Sponsor CTA -> Featured Projects -> Sponsor Logos
- [ ] Update homepage stats to match real program data (84+ teams, 400+ students, 30+ judges, 100% satisfaction)

#### Remaining image uploads

- [ ] Upload about page images: about-teams-at-work.jpg, about-screenshot.png, about-img7146.jpg, about-logo.webp
- [ ] Upload activities images: activities-hero.jpg, activities-1.jpg, activities-2.jpg, activities-3.jpg
- [ ] Upload featured-img7985.jpg (projects banner)

### P3 -- Lower Priority (nice-to-have / deferred features)

#### 6.1 Sponsor Portal features

- [ ] **Story 9.2 -- My Projects:** Look up sponsor by authenticated email, query their sponsored projects from Sanity, display project cards with status
- [ ] **Story 9.2 -- Project Progress:** Display project milestones/deliverables (requires new `milestone` schema or enriching the `project` schema with milestone array)
- [ ] **Story 9.3 -- Events & Schedule:** Show upcoming events relevant to the sponsor, with RSVP or attendance tracking
- [ ] **Story 9.4 -- My Sponsorship:** Display sponsorship tier, renewal dates, benefits summary, contact info for program director
- [ ] Create Sanity schema types to back portal features (e.g., `sponsorProfile` linking email to sponsor, `milestone`, `sponsorshipAgreement`)
- [ ] Add portal-specific GROQ queries and data fetching
- [ ] Enable portal nav items (currently disabled in `PortalLayout`)
- [ ] Write Playwright E2E tests for portal flows

#### 6.2 Event Calendar and Notifications

- [ ] Build a calendar view component for events (month/week grid or integrate a library like FullCalendar)
- [ ] Add iCal export endpoint (`.ics` file generation for individual events or full calendar)
- [ ] *(Stretch)* Add "Add to Calendar" buttons on event detail pages (Google Calendar, Outlook, iCal links)
- [ ] *(Stretch)* Implement email notification/reminder system (Cloudflare Workers scheduled triggers + email integration)
- [ ] *(Stretch)* Add subscriber schema in Sanity and subscription management UI

#### Additional polish

- [ ] Add `topic` field to project schema for topic-based filtering (if stakeholders require it)
- [ ] Add video embed support to testimonials (stakeholder doc mentions "video testimonials")
- [ ] Create a `mentorship` page or section with structured mentor profiles (beyond the plain string field)
- [ ] Add search functionality across projects, sponsors, and events
- [ ] Implement GDPR-compliant cookie consent banner (stakeholder section 9 mentions GDPR)
- [ ] Create Activities page (exists on WP, no equivalent in Astro site)

### Testing checklist (for new features)

- [ ] New block component -> Container API test with full + minimal fixture data
- [ ] New GROQ query -> Verify query string contains expected type/field references
- [ ] Schema changes -> Run `npm run typegen` and fix any type errors in fixtures/components
- [ ] New API endpoint (contact form) -> Integration test with Vitest
- [ ] New interactive behavior (calendar, filtering) -> Playwright E2E spec
- [ ] Portal features -> Playwright E2E with auth fixture
- [ ] Run full test suite before merging: `npm run test:unit` + `npm run test:e2e`
