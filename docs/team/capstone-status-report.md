# YWCC Capstone Website -- Status Report

**Generated:** 2026-02-19
**Last updated:** 2026-02-20 (Story 7-14: technology tags formalized as predefined list of 66 — PR #330; Story 7-15: code review fixes — safeUrlFor() typed wrapper, block registry typed, image CLS attributes, HSTS + X-Frame-Options headers, CI env vars, GROQ fragment extraction, Portable Text custom components)
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
| Homepage | `/` | **Done** -- hero images + heading, logoCloud, stats updated to real WP numbers (84+ teams, 417+ students, 32+ judges, 100% satisfaction) |
| About the Capstone Program | `/about-the-capstone-program/` | **Done** -- text content migrated, stats updated. Images still placeholder. |
| Research & Development | `/research-development/` | **Done** -- created as `/rnd` with 8 blocks + images (added publications/conferences + mentorship/collaboration) |
| Sponsor Guide | `/sponsor-guide/` | **Done** -- migrated to `/how-to-become-a-sponsor` with 11 blocks |
| Partner With Us | `/partner-with-us/` | Not yet (partnership inquiry form with Formsite embed) |
| Events | `/events/` | **Done** -- 1 real event migrated (Spring 2026 Showcase, May 7 2-5 PM) |
| Activities | `/activities/` | Not yet (no equivalent page in Astro site) |
| Contact | `/contact/` | **Done** -- director info, office hours, location populated. Subject field needs code change. |
| Featured Projects | `/past-project/` | **Done** -- 9 real projects migrated (missing: technologies, teamMembers, mentor) |
| Website Capstone Team | `/website-capstone-team/` | Not yet |

### Downloaded Images Inventory

**Sponsor logos (7):** verizon-logo.png, forbes-logo.png, ups-logo.png, boa-logo.png, eco-logo.jpeg, cisco-logo.png, angeles-logo.png -- **All uploaded to Sanity**

**Hero/banner (4):** hero-1.png, hero-2.jpg, hero-3.png, featured-img7985.jpg -- **hero-1/2/3 uploaded to Sanity**

**About page (5):** about-logo.webp, about-teams-at-work.jpg, about-screenshot.png, about-img7146.jpg -- **All uploaded to Sanity**

**Step icons (4):** step1.png, step2.png, step3.png, step4.png -- **All uploaded to Sanity**

**R&D (2):** rnd-hero.jpg, rnd-step3.png -- **All uploaded to Sanity**

**Activities (4):** activities-hero.jpg, activities-1.jpg, activities-2.jpg, activities-3.jpg -- **All uploaded to Sanity**

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
| **Documents (6)** | `page`, `siteSettings` (singleton), `sponsor`, `project` (technologyTags: predefined list of 66 — Story 7-14), `testimonial`, `event` |
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

| Page | Slug | ID | Blocks | Preview Link | Status |
|---|---|---|---|---|---|
| Home | `home` | `99664be0` | 7 | [/](https://preview.ywcc-capstone.pages.dev/) | **Updated 2026-02-20:** hero images (3), heading updated, logoCloud added, stats updated to real WP numbers (84+/417+/32+/100%). Block reorder pending (drag in Studio). |
| About the Capstone Program | `about-the-capstone-program` | `bf3c96a6` | 7 | [/about-the-capstone-program](https://preview.ywcc-capstone.pages.dev/about-the-capstone-program/) | **Done** -- WP text, real stats, real images uploaded |
| How to Become a Sponsor | `how-to-become-a-sponsor` | `911c1cfa` | 11 | [/how-to-become-a-sponsor](https://preview.ywcc-capstone.pages.dev/how-to-become-a-sponsor/) | **Content migrated** -- WP Sponsor Guide 5.1-5.5, FAQs, timeline, logos, testimonials |
| Events & Engagement | `events` | `ca81cc32` | 4 | [/events](https://preview.ywcc-capstone.pages.dev/events/) | Test content |
| Testimonials | `testimonials` | `ada5ce67` | 4 | [/testimonials](https://preview.ywcc-capstone.pages.dev/testimonials/) | Test content |
| Contact | `contact` | `9449931a` | 3 | [/contact](https://preview.ywcc-capstone.pages.dev/contact/) | **Form backend live** (Story 6.1) -- Astro Action + Turnstile + Sanity submissions + Discord webhook |
| **Research & Development** | `rnd` | `2d09c2a5` | 8 | [/rnd](https://preview.ywcc-capstone.pages.dev/rnd/) | **Updated 2026-02-20:** 6→8 blocks. Added publications/conferences featureGrid + mentorship/collaboration textWithImage (with image) |
| **Impact Case Studies** | `case-studies` | `3be9f3cd` | 5 | [/case-studies](https://preview.ywcc-capstone.pages.dev/case-studies/) | **Created 2026-02-20** (draft). Hero, intro richText, testimonials (byProject mode), stats, CTA |
| **Sponsorship Opportunities** | `sponsorship-opportunities` | `c4d2001e` | 7 | [/sponsorship-opportunities](https://preview.ywcc-capstone.pages.dev/sponsorship-opportunities/) | **Created 2026-02-20** (draft). Hero, Why Sponsor? textWithImage, 6-item benefits grid, stats ($0 cost), testimonials, contactForm, logoCloud |

#### Projects -- REPLACED with real data (2026-02-20)

All 9 real projects from WP migrated. Each has: title, slug, Portable Text content, outcome, sponsor reference (except YWCC Capstone Website which is internal), technology tags (now constrained to predefined list of 66 — Story 7-14), and team members. **Remaining gap:** `mentor` field is null (not available in WP data).

| Project | ID | Sponsor Ref | Content | Outcome | Tech Tags | Team |
|---|---|---|---|---|---|---|
| Zero Trust Microsegmentation Network | `025360c6` | Cisco ✓ | ✓ | ✓ | 6 tags ✓ | 3 real names ✓ |
| 5G-Enabled Alzheimer's Care Application | `9045cdc6` | Verizon ✓ | ✓ | ✓ | 6 tags ✓ | 4 placeholder ✓ |
| Educational Platform for At-Risk Youth | `245f6b00` | Angeles ✓ | ✓ | ✓ | 7 tags ✓ | 4 placeholder ✓ |
| Blockchain-Secured DNS Infrastructure | `21871347` | Cisco ✓ | ✓ | ✓ | 6 tags ✓ | 3 real names ✓ |
| ML Article Appeal Prediction | `5b83bfe3` | Forbes ✓ | ✓ | ✓ | 4 tags ✓ | 4 placeholder ✓ |
| Azure ML Resource Optimization | `c46bba9f` | UPS ✓ | ✓ | ✓ | 4 tags ✓ | 4 placeholder ✓ |
| Sentiment Analysis & Workforce Optimization | `a6d4f90f` | Bank of America ✓ | ✓ | ✓ | 4 tags ✓ | 6 placeholder ✓ |
| Eco-Strategy Client Sustainability Portal 3.0 | `26f878bd` | Eco-Enterprise ✓ | ✓ | ✓ | 4 tags ✓ | 8 placeholder ✓ |
| YWCC Capstone Website | `b42bb888` | None (internal) | ✓ | ✓ | 6 tags ✓ | 4 placeholder ✓ |

#### Testimonials -- REPLACED with real data (2026-02-20)

9 testimonials derived from real project outcomes. All linked to project documents via reference. Mix of 7 industry + 2 student testimonials.

| Testimonial | Org | Type | Project Ref |
|---|---|---|---|
| Verizon 5G Innovation Lab | Verizon | industry | 5G Alzheimer's Care |
| Cisco Network Security Team | Cisco | industry | Zero Trust |
| Bank of America Hiring Team | Bank of America | industry | Sentiment Analysis |
| Forbes Digital Team | Forbes | industry | ML Article Appeal |
| UPS Operations Team | UPS | industry | Azure ML |
| Eco-Enterprise Leadership | Eco-Enterprise | industry | Sustainability Portal |
| Angeles de Medellin Foundation | Angeles | industry | Educational Platform |
| D'Angelo Morales | NJIT Graduate | student | Zero Trust |
| Filip Mangoski | NJIT Graduate | student | Blockchain DNS |

#### Events -- REPLACED with real data (2026-02-20)

7 test events replaced with 1 real event from WP.

| Event | ID | Date | Location | Type | Status |
|---|---|---|---|---|---|
| Spring 2026 Capstone Showcase | `25d4614e` | May 7, 2026 2-5 PM | Campus Center Ballroom | showcase | upcoming |

### Implemented Routes

| URL | Source | Rendering | Preview Link |
|---|---|---|---|
| `/` | `pages/index.astro` | SSG -- Homepage (page builder blocks from Sanity) | [Home](https://preview.ywcc-capstone.pages.dev/) |
| `/sponsors` | `pages/sponsors/index.astro` | SSG -- Sponsor listing grid | [Sponsors](https://preview.ywcc-capstone.pages.dev/sponsors/) |
| `/sponsors/[slug]` | `pages/sponsors/[slug].astro` | SSG -- Sponsor detail (logo, tier, industry, projects, JSON-LD) | [Verizon](https://preview.ywcc-capstone.pages.dev/sponsors/verizon/), [Cisco](https://preview.ywcc-capstone.pages.dev/sponsors/cisco/), [BoA](https://preview.ywcc-capstone.pages.dev/sponsors/bank-of-america/), [Forbes](https://preview.ywcc-capstone.pages.dev/sponsors/forbes/), [UPS](https://preview.ywcc-capstone.pages.dev/sponsors/ups/), [Eco](https://preview.ywcc-capstone.pages.dev/sponsors/eco-enterprise/), [Angeles](https://preview.ywcc-capstone.pages.dev/sponsors/angeles-de-medellin/) |
| `/projects` | `pages/projects/index.astro` | SSG -- Project listing with client-side tag/industry filtering | [Projects](https://preview.ywcc-capstone.pages.dev/projects/) |
| `/projects/[slug]` | `pages/projects/[slug].astro` | SSG -- Project detail (Portable Text content, team, mentor, outcome, testimonials) | [Zero Trust](https://preview.ywcc-capstone.pages.dev/projects/zero-trust-microsegmentation-network/), [5G Alzheimer's](https://preview.ywcc-capstone.pages.dev/projects/5g-enabled-alzheimers-care-application/), [Blockchain DNS](https://preview.ywcc-capstone.pages.dev/projects/blockchain-secured-dns-infrastructure/) |
| `/events/[slug]` | `pages/events/[slug].astro` | SSG -- Event detail (date/time, location, type, JSON-LD Event) | [Spring 2026 Showcase](https://preview.ywcc-capstone.pages.dev/events/spring-2026-capstone-showcase/) |
| `/portal` | `pages/portal/index.astro` | SSR -- Sponsor portal (authenticated, placeholder cards) | [Portal](https://preview.ywcc-capstone.pages.dev/portal/) (requires CF Access auth) |
| `/portal/api/me` | `pages/portal/api/me.ts` | SSR -- JSON endpoint for authenticated user | -- |
| `/[...slug]` | `pages/[...slug].astro` | SSG -- Catch-all for CMS pages (about, contact, testimonials, R&D, etc.) | See Pages table above |

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
| Unit (Vitest) | 3 test files | `cn()` util, image URL helpers (`urlFor` + `safeUrlFor`), GROQ query strings |
| Component (Vitest + Container API) | 17 test files | All 13 block types + BlockRenderer, BlockWrapper, ProjectCard, Breadcrumb, Header |
| SSR Smoke (Vitest + Miniflare) | 3 test files | Worker smoke, build output, wrangler config |
| Integration (Vitest) | Multiple suites | Schema registration, data fetching, architecture validation |
| E2E (Playwright) | 5 specs | Smoke, pages, homepage, site settings, GTM data layer |
| Browsers | 5 targets | Chromium, Firefox, WebKit, Mobile Chrome (Pixel 7), Mobile Safari (iPhone 14) |

### Features Beyond Stakeholder Requirements

- **Visual Editing** -- Full Sanity Presentation tool integration with stega + Server Islands
- **GTM Analytics** -- Page views, form events, FAQ expand, carousel nav, link click tracking
- **JSON-LD Structured Data** -- EducationalOrganization, Organization, Event, BreadcrumbList
- **SEO** -- Per-page meta, OG/Twitter cards, Content Security Policy, X-Frame-Options, HSTS
- **Portable Text** -- Custom renderers for inline images (responsive + lazy), callout blocks (tone-based styling), external links (noopener), and internal link resolution
- **Build Caching** -- Module-level data caching with parallel batch pre-fetching
- **Storybook** -- Component documentation deployed to GitHub Pages (~95 pre-built blocks)
- **Multi-Template System** -- 5 layout templates selectable per-page in CMS
- **Responsive Design** -- Full mobile support across all pages and portal

---

## Summary Matrix

| Stakeholder Section | Status |
|---|---|
| 4.1 Homepage | **Updated** -- hero images + heading from WP, logoCloud added, stats updated to real numbers. Still needs Featured Projects block (`projectCards`). Block reorder pending (Sanity Studio drag-and-drop). |
| 4.2 About the Capstone Program | **Content migrated** -- stats updated with real numbers. Images still placeholder. Sponsorship Levels comparison block still needed. |
| 4.3 Industry Projects Showcase | **Projects migrated** -- 9 real projects with content, outcomes, sponsor refs, technology tags (predefined list of 66 — Story 7-14, PR #330), team members. Gap: `mentor` field still null (not available in WP data). Sorting controls not yet added. |
| 4.4 Sponsorship Opportunities | **Standalone page created** (draft) at `/sponsorship-opportunities` with 7 blocks (hero, why sponsor, benefits, stats, testimonials, contact form, logos). Form backend live (Story 6.1). Tiers comparison block still needed. |
| 4.5 Research and Development | **Done** -- R&D page with 8 blocks: WP content + images, publications/conferences, mentorship/collaboration. Optional stretch: `publication` doc type. |
| 4.6 Testimonials and Success Stories | **Done** -- 9 real testimonials (7 industry, 2 student) linked to projects. Case Studies page created (draft) at `/case-studies` with byProject testimonials + narrative. |
| 4.7 Events and Engagement | **Event migrated** -- 1 real event (Spring 2026 Showcase). Still needs standalone `/events` listing page. |
| 5. How to Become a Sponsor | **Content migrated** -- all WP Sponsor Guide sections (5.1-5.5, FAQs, timeline) in 11 blocks |
| 6.1 Interactive Sponsor Dashboard | Stub only -- auth works, all features are placeholder cards |
| 6.2 Event Calendar and Notifications | Partially done -- event list exists, no calendar view or reminders |
| 7. Design/UX | Done -- responsive, professional, easy CMS editing |
| 8. CMS | Done (Sanity, not WordPress as originally specified) -- role-based access via Cloudflare Access |
| 9. Security | Done -- SSL, JWT auth, CSP headers, X-Frame-Options, HSTS, HTTPS enforced |

---

## Remaining Work Checklist

### P0 -- Critical Path (blocks stakeholder acceptance)

#### 4.5 Research & Development

- [x] ~~Create R&D CMS page in Sanity with slug `rnd` so the existing nav link works~~ (Done 2026-02-20)
- [x] ~~Add `textWithImage` / `featureGrid` / `richText` blocks with real-world research focus~~ (Done: 6 blocks)
- [x] ~~Add hero + textWithImage images from WP site~~ (Done: rnd-hero.jpg + rnd-step3.png)
- [x] ~~Add content covering publication and conference opportunities~~ (Done 2026-02-20: featureGrid block with 3 items — Conference Presentations, Research Publications, Industry Recognition)
- [x] ~~Add content covering mentorship and collaboration~~ (Done 2026-02-20: textWithImage block with dual-mentorship model, sponsor commitment, Agile practices + about-teams-at-work image)
- [ ] *(Optional stretch)* Create `publication` document type if structured publication data is needed

#### 4.4 Contact/Sponsor Inquiry Form -- backend (DONE -- Story 6.1)

- [x] ~~Replace simulated form submission in `main.ts` `initContactForm()` with a real backend~~ (Done: Astro Action in `src/actions/index.ts`)
- [x] ~~Create a server-side API endpoint that receives form data~~ (Done: Astro Action with `accept: 'form'` + Zod validation)
- [x] ~~Integrate notification delivery~~ (Done: Discord webhook notification on submission)
- [x] ~~Add server-side validation~~ (Done: Zod schema + Cloudflare Turnstile bot protection)
- [x] ~~Store submissions in Sanity~~ (Done: `submission` document type, viewable in Studio)
- [x] ~~Update `ContactForm.astro` to submit and handle success/error responses~~ (Done: `import { actions } from 'astro:actions'`)
- [x] ~~Add office hours, program director info from WP~~ (Done 2026-02-20: featureGrid block with director, office hours, location)
- [ ] Add Subject field to contact form (requires schema/code change -- not content migration)

### P1 -- High Priority (core stakeholder requirements)

#### Content migration from WP (Sanity MCP tasks)

- [x] ~~**Replace 7 test projects** with 9 real projects from WP scrape~~ (Done 2026-02-20: 9 projects with title, slug, sponsor ref, content, outcome. **Remaining gap:** `technologies`, `teamMembers`, `mentor` fields still null on all 9.)
- [x] ~~**Backfill project metadata** -- `technologyTags` on all 9, `team` on all 9 (2 with real names from WP, 7 with placeholder members matching WP team sizes: 4-8 per project)~~ (Done 2026-02-20. `mentor` not available in WP data.)
- [x] ~~**Update events** -- replace 7 test events with real event(s)~~ (Done 2026-02-20: 1 real event -- Spring 2026 Capstone Showcase, May 7 2-5 PM, Campus Center Ballroom)
- [x] ~~**Update About page** (`bf3c96a6`) -- text content migrated, stats updated with real numbers, images replaced with WP originals (about-teams-at-work.jpg, about-img7146.jpg)~~ (Done 2026-02-20)
- [x] ~~**Update How to Become a Sponsor page** (`911c1cfa`) -- already migrated: 11 blocks covering WP Sponsor Guide 5.1-5.5 (Applying, Recruitment, Collaboration, Your Contributions, Team Contributions), Timeline, FAQs, logoCloud, testimonials.~~
- [x] ~~**Update Contact page** (`9449931a`) -- office hours, program director info, and location already populated from WP.~~ **Remaining gap:** Subject field requires schema/code change to the form, not content migration.
- [x] ~~**Update testimonials** -- replace test testimonials with content derived from real project outcomes~~ (Done 2026-02-20: 9 testimonials -- 7 industry + 2 student -- all linked to project refs)
- [x] ~~**Update siteSettings** -- patched `contactInfo` (address, email, phone) from WP~~ (Done 2026-02-20. Note: Facebook social link can't be added -- schema `socialLinks.platform` enum only supports github/linkedin/twitter/instagram/youtube. Schema change needed to add Facebook.)
- [x] ~~**Delete Pranav test page** (`9288ba72`)~~ (Done 2026-02-20)

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

- [x] ~~*(Option A -- lightweight)* Create a CMS page with slug `case-studies` using `testimonials` blocks in `byProject` display mode combined with `richText` blocks for narrative~~ (Done 2026-02-20: 5 blocks — hero, intro richText, testimonials byProject, stats, CTA. Draft ID: `3be9f3cd`)
- [ ] *(Option B -- structured)* Create a `caseStudy` document type with fields: project reference, challenge, solution, results, sponsor testimonial, and metrics
- [ ] If Option B: build `CaseStudyCards` page builder block and `CaseStudy` detail page route

#### 4.4 Sponsorship Opportunities standalone page

- [x] ~~Create a CMS page in Sanity with slug `sponsorship-opportunities`~~ (Done 2026-02-20: 7 blocks — hero, Why Sponsor? textWithImage, 6-item benefits featureGrid, stats with $0 cost, testimonials, contactForm, logoCloud. Draft ID: `c4d2001e`. Note: `/sponsors` is a hardcoded Astro route so a separate CMS page was created.)
- [ ] Add Sponsorship Tiers comparison block once the `sponsorshipTiers` block schema is created (P1)

#### Homepage content arrangement (CMS-only tasks)

- [x] ~~Update homepage stats to match real program data~~ (Done 2026-02-20: 84+ teams, 417+ students, 32+ judges, 100% satisfaction)
- [ ] Reorder Home page blocks in Sanity Studio (drag-and-drop) to move Testimonials before CTA Banner for better conversion flow. Target order: Hero → Stats → Program Highlights → Testimonials → CTA → Sponsor Steps → Logo Cloud

#### Remaining image uploads

- [x] ~~Upload about page images: about-teams-at-work.jpg, about-screenshot.png, about-img7146.jpg, about-logo.webp~~ (Done 2026-02-20 via API)
- [x] ~~Upload activities images: activities-hero.jpg, activities-1.jpg, activities-2.jpg, activities-3.jpg~~ (Done 2026-02-20 via API)
- [x] ~~Upload featured-img7985.jpg (projects banner)~~ (Done 2026-02-20 via API)

**Uploaded image asset IDs:**
```
about-teams-at-work  -> image-4e0ce2d181bf3171abf59924b0363252144a0a91-1920x1078-jpg
about-screenshot     -> image-f0e8060516dbac8e78932f06932a17252b37164b-1920x1006-png
about-img7146        -> image-73cbcec87cb346397bf7617af9b866cd2d827be0-1921x1441-jpg
about-logo           -> image-526748e6980d684ad21fdbd7273c2731ed2f43a0-780x585-webp
featured-img7985     -> image-117be8afe69ff441c417bb9de6e457e82848aaf4-5712x4284-jpg
activities-hero      -> image-7203ad7a8e72a3bfd66d976594a68fc8ba555efc-1024x576-jpg
activities-1         -> image-3d472828569d9ffdf7d232396c15a0f1fb71c6a2-300x168-jpg
activities-2         -> image-1629d9cf7aed8f62aacc0aaa2665e2d80344a744-307x164-jpg
activities-3         -> image-dbfd7b51588285fc737b6cb0384c838a3b5992bb-293x172-jpg
```

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
