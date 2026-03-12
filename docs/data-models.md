# Data Models

*Generated: 2026-03-11 | Scan Level: deep*

## Overview

This project uses two data stores:
1. **Sanity Content Lake** — Structured content (pages, sponsors, projects, events, testimonials)
2. **Cloudflare D1** — Authentication data (users, sessions, accounts, verification tokens)

---

## Sanity Content Lake

### Document Types (7)

#### page
The core page builder document. Each page has a template and an array of content blocks.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | Page title |
| slug | slug | Yes | URL path (source: title) |
| site | string | Conditional | rwc-us or rwc-intl (hidden on production dataset) |
| template | string | No | default, fullWidth, landing, sidebar, twoColumn |
| seo | seo (object) | No | Meta title, description, OG image |
| blocks | array | No | 23 block types supported |

**Block/template compatibility:** Certain blocks warn when used in constrained templates (sidebar, twoColumn).

#### siteSettings (Singleton)
Global site configuration — one document per workspace.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| siteName | string | Yes | Site display name |
| site | string | Conditional | Multi-site field |
| siteDescription | text | No | Site description |
| logo | image (with alt) | Yes | Primary logo |
| logoLight | image (with alt) | No | Light variant logo |
| ctaButton | button (object) | No | Header CTA |
| navigationItems | array of link | No | Main nav with dropdown children |
| footerContent | object | No | text, copyrightText |
| socialLinks | array | No | platform + url pairs |
| contactInfo | object | No | address, email, phone |
| footerLinks | array of link | No | Footer navigation |
| resourceLinks | array of link | No | Resource links |
| programLinks | array of link | No | Program links |
| currentSemester | string | No | e.g., "Fall 2026" |

#### sponsor
Industry sponsors with tier-based classification and portal access whitelist.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | Yes | Sponsor name |
| slug | slug | Yes | URL path |
| site | string | Conditional | Multi-site field |
| logo | image (with alt) | Yes | Sponsor logo |
| description | text | No | About the sponsor |
| website | url | No | External website |
| contactEmail | string | No | Primary contact (email validated) |
| allowedEmails | array of string | No | Portal whitelist (email validated) |
| industry | string | No | Industry sector |
| tier | string | No | platinum, gold, silver, bronze |
| hidden | boolean | No | Default: false |
| featured | boolean | No | Default: false |
| seo | seo (object) | No | SEO metadata |

#### project
Capstone projects linked to sponsors with technology tags.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | Project title |
| slug | slug | Yes | URL path |
| site | string | Conditional | Multi-site field |
| sponsor | reference → sponsor | No | Associated sponsor |
| status | string | Yes | active, completed, archived (default: active) |
| featured | boolean | No | Default: false |
| semester | string | No | Academic semester |
| content | portableText | No | Rich text description |
| outcome | text | No | Outcome & Impact |
| team | array of objects | No | name + role per member |
| mentor | object | No | name, title, department |
| technologyTags | array of string | No | 70+ predefined technology options |
| seo | seo (object) | No | SEO metadata |

#### testimonial
Quotes from industry partners and students.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | Yes | Person's name |
| site | string | Conditional | Multi-site field |
| quote | text | Yes | Testimonial text |
| role | string | No | Job title / role |
| organization | string | No | Company / school |
| type | string | No | industry or student |
| photo | image (with alt) | No | Person's photo |
| project | reference → project | No | Related project |

#### event
Calendar events with categories and date ranges.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | Event title |
| slug | slug | Yes | URL path |
| site | string | Conditional | Multi-site field |
| date | datetime | Yes | Start date/time |
| endDate | datetime | No | End date (validated: must be after start) |
| location | string | No | Venue |
| description | text | No | Event description |
| isAllDay | boolean | No | Default: false |
| category | string | No | workshop, lecture, social, competition, other |
| eventType | string | No | showcase, networking, workshop |
| status | string | No | upcoming, past (default: upcoming) |
| seo | seo (object) | No | SEO metadata |

#### submission (Read-Only)
Contact form submissions stored in Sanity.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | Yes | Submitter name |
| email | string | Yes | Submitter email |
| organization | string | No | Organization |
| message | text | Yes | Message content |
| form | reference → form | No | Source form |
| submittedAt | datetime | Yes | Submission timestamp |

### Object Types (14)

| Object | Fields | Used In |
|--------|--------|---------|
| seo | metaTitle (max 60), metaDescription (max 160), ogImage | page, sponsor, project, event |
| button | text, url (validated), variant (default/secondary/outline/ghost) | ctaBanner, heroBanner, sponsorSteps, sponsorshipTiers |
| link | label, href (validated), external (boolean) | siteSettings nav, footer |
| portableText | blocks (h2-h4, blockquote), marks (strong/em/code/underline), annotations (link, internalLink→page/sponsor/project/event), lists (bullet/number), image (with alt+caption), callout (tone+text) | project.content, richText, faqItem.answer, textWithImage |
| faqItem | question, answer (portableText) | faqSection |
| featureItem | icon, image, title, description | featureGrid |
| statItem | value, label, description | statsRow |
| stepItem | title, description, list (bullet points) | sponsorSteps |
| teamMember | name, role, image (with alt), links[] | teamGrid |
| galleryImage | image (with alt), caption | imageGallery |
| comparisonColumn | title, highlighted (boolean) | comparisonTable |
| comparisonRow | feature, values[], isHeader (boolean) | comparisonTable |
| timelineEntry | date, title, description, image (with alt) | timeline |
| block-base | backgroundVariant, spacing, maxWidth (shared via defineBlock) | All blocks |

### Block Types (25)

| Block | Variants | Key Fields | Display Mode |
|-------|----------|------------|--------------|
| heroBanner | centered, split, split-asymmetric, overlay, spread | heading, subheading, backgroundImages, ctaButtons, alignment | - |
| featureGrid | - | heading, items[] (featureItem), columns (2/3/4) | - |
| ctaBanner | centered, split, spread, overlay | heading, description, backgroundImages, ctaButtons | - |
| statsRow | - | heading, stats[] (statItem) | - |
| textWithImage | - | heading, content (PT), image, imagePosition (left/right) | - |
| logoCloud | - | heading, autoPopulate, sponsors[] | all / manual |
| sponsorSteps | - | heading, subheading, items[] (stepItem), ctaButtons | - |
| richText | - | content (portableText) | - |
| faqSection | - | heading, items[] (faqItem) | - |
| contactForm | - | heading, description, successMessage, form (ref) | - |
| sponsorCards | - | heading, displayMode, sponsors[] | all / featured / manual |
| testimonials | - | heading, displayMode, testimonials[] | all / industry / student / byProject / manual |
| eventList | - | heading, filterBy, limit (1-50) | all / upcoming / past |
| projectCards | - | heading, displayMode, projects[] | all / featured / manual |
| teamGrid | grid, grid-compact, split | heading, description, items[] (teamMember) | - |
| imageGallery | grid, masonry, single | heading, description, images[], columns | - |
| articleList | grid, split-featured, list | heading, description, source, limit (1-20), links | all / blog / news |
| comparisonTable | table, stacked | heading, description, columns[], rows[], links | - |
| timeline | vertical, split, horizontal | heading, description, items[] (timelineEntry), links | - |
| pullquote | centered, split, sidebar | quote, attribution, role, image | - |
| divider | line, short, labeled | label | - |
| announcementBar | inline, floating | icon, text, link, dismissible | - |
| sponsorshipTiers | - | heading, description, tiers[] (name, price, benefits, highlighted, ctaButton) | - |

### Reference Graph

```
project ──sponsor──► sponsor
testimonial ──project──► project
logoCloud ──sponsors[]──► sponsor (when autoPopulate=false)
sponsorCards ──sponsors[]──► sponsor (when displayMode=manual)
projectCards ──projects[]──► project (when displayMode=manual)
testimonials ──testimonials[]──► testimonial (when displayMode=manual)
contactForm ──form──► form (external type)
portableText ──internalLink──► page | sponsor | project | event
```

---

## Cloudflare D1 (Auth Database)

Database: `ywcc-capstone-portal` (ID: 76887418-c356-46d8-983b-fa6e395d8b16)
ORM: Drizzle (schema in `astro-app/src/lib/drizzle-schema.ts`)

### Tables

#### user
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | text | PK | UUID |
| name | text | NOT NULL | Display name |
| email | text | NOT NULL, UNIQUE | Login email |
| emailVerified | integer | NOT NULL | Boolean (0/1) |
| image | text | | Profile image URL |
| role | text | | "sponsor" or "student" |
| createdAt | integer | NOT NULL | Unix timestamp |
| updatedAt | integer | NOT NULL | Unix timestamp |

#### session
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | text | PK | Session ID |
| userId | text | NOT NULL, FK→user | Owner |
| token | text | NOT NULL, UNIQUE | Session token (cookie value) |
| expiresAt | integer | NOT NULL | Expiry timestamp |
| ipAddress | text | | Client IP |
| userAgent | text | | Browser UA |
| createdAt | integer | NOT NULL | Creation time |
| updatedAt | integer | NOT NULL | Last activity |

#### account
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | text | PK | Account ID |
| userId | text | NOT NULL, FK→user | Owner |
| accountId | text | NOT NULL | Provider's user ID |
| providerId | text | NOT NULL | google, github, email |
| accessToken | text | | OAuth access token |
| refreshToken | text | | OAuth refresh token |
| accessTokenExpiresAt | integer | | Token expiry |
| refreshTokenExpiresAt | integer | | Refresh expiry |
| scope | text | | OAuth scopes |
| idToken | text | | OIDC ID token |
| password | text | | Hashed (magic link) |
| createdAt | integer | NOT NULL | Creation time |
| updatedAt | integer | NOT NULL | Last update |

#### verification
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | text | PK | Verification ID |
| identifier | text | NOT NULL | Email address |
| value | text | NOT NULL | Token value |
| expiresAt | integer | NOT NULL | Token expiry |
| createdAt | integer | | Creation time |
| updatedAt | integer | | Last update |

### Relationships

```
user ◄──1:N──► session (userId FK)
user ◄──1:N──► account (userId FK)
verification (standalone, linked by identifier=email)
```

---

## GROQ Queries

All queries use `defineQuery()` and are defined in `astro-app/src/lib/sanity.ts`.

| Query | Purpose | Key Projections |
|-------|---------|-----------------|
| SITE_SETTINGS_QUERY | Global site config | Full siteSettings with nav, footer, social |
| ALL_PAGE_SLUGS_QUERY | Static path generation | slug.current array |
| PAGE_BY_SLUG_QUERY | Page builder content | Page with all blocks expanded |
| ALL_SPONSORS_QUERY | Sponsors listing | All sponsor fields |
| ALL_SPONSOR_SLUGS_QUERY | Static path generation | slug.current array |
| SPONSOR_BY_SLUG_QUERY | Sponsor detail | Full sponsor with projects |
| ALL_PROJECTS_QUERY | Projects listing | All project fields with sponsor ref |
| ALL_PROJECT_SLUGS_QUERY | Static path generation | slug.current array |
| PROJECT_BY_SLUG_QUERY | Project detail | Full project with sponsor |
| ALL_TESTIMONIALS_QUERY | Testimonials listing | All testimonial fields |
| ALL_EVENTS_QUERY | Events listing | All event fields |
| ALL_EVENT_SLUGS_QUERY | Static path generation | slug.current array |
| EVENT_BY_SLUG_QUERY | Event detail | Full event data |

### Block Resolver Functions

| Function | Purpose |
|----------|---------|
| resolveBlockSponsors() | Fetches sponsors for logoCloud/sponsorCards blocks |
| resolveBlockProjects() | Fetches projects for projectCards blocks |
| resolveBlockTestimonials() | Fetches testimonials for testimonials blocks |
| resolveBlockEvents() | Fetches events for eventList blocks |

---
*Generated: 2026-03-11 | Scan Level: deep | Mode: full_rescan*
