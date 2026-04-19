# Data Models

**Project:** ywcc-capstone-template v1.18.0
**Generated:** 2026-04-15

The system maintains data in **two** authoritative stores. Every schema change requires a migration in the appropriate layer — never cross the boundary with raw SQL into Sanity, or with GROQ into D1.

| Store | Technology | Purpose | Source of truth |
|---|---|---|---|
| Sanity Content Lake | Sanity 5.20 (3 workspaces) | Editorial content (pages, articles, sponsors, projects, events, authors, listing pages, settings) | `studio/src/schemaTypes/**`, committed, deployed with `npx sanity schema deploy` |
| Cloudflare D1 | SQLite (`ywcc-capstone-portal`) via Drizzle ORM | Auth + operational data (users, sessions, subscribers, reminder log, project → GitHub links) | `astro-app/src/lib/drizzle-schema.ts` + `astro-app/migrations/*.sql` |

Generated types land at `astro-app/src/sanity.types.ts` (22,303 lines) for Sanity and are inferred from Drizzle for D1.

---

## Part 1 — Sanity Content Lake

**Workspaces:** capstone (dataset: `capstone`), rwc-us + rwc-intl (dataset: `rwc`). App ID `zi1cig2o607y1js5cfoyird6`.

**Site-aware filtering:** types flagged `site-aware` expose a required `site` field in RWC workspaces and hide it in capstone. Uniqueness checks are scoped per site via `siteScopedIsUnique` (see `studio/src/schemaTypes/fields/site-field.ts`).

### Document types (11)

| Type | Site-aware | Singleton | Fields (summary) |
|---|---|---|---|
| `page` | ✅ | ❌ | `title`, `slug`, `site`, `body[]` (38 block types), `seo` (seo object) |
| `sponsor` | ✅ | ❌ | `name`, `slug`, `site`, `logo`, `logoSquare` *(new)*, `logoHorizontal` *(new)*, `tier`, `description` (portable text), `website`, `contacts[]` (email-based whitelist), `featured`, `seo` |
| `project` | ✅ | ❌ | `title`, `slug`, `site`, `sponsor` (ref), `description`, `teamMembers[]`, `semester`, `year`, `status`, `techStack[]`, `featuredImage`, `body[]`, `seo` |
| `event` | ✅ | ❌ | `title`, `slug`, `site`, `date`, `endDate`, `location`, `rsvpUrl`, `status` (upcoming/past), `description`, `body[]`, `seo` |
| `testimonial` | ✅ | ❌ | `quote`, `author`, `role`, `site`, `avatar` |
| `article` | ✅ | ❌ | `title`, `slug`, `site`, `excerpt`, `featuredImage`, `body` (portable text), `author` (ref to `author`), `publishedAt`, `updatedAt`, `category` (ref), `tags[]`, `relatedArticles[]`, `seo` |
| `article-category` | ❌ | ❌ | `title`, `slug`, `description` |
| `author` | ✅ | ❌ | `name`, `slug`, `site`, `role`, `bio`, `credentials[]`, `image`, `sameAs[]` (for Person JSON-LD), `socialLinks[]` (`{platform, url}`) |
| `listing-page` | ✅ | per-site/route | `route` (enum: articles/authors/events/gallery/projects/sponsors), `title`, `description`, `seo`, `headerBlocks[]`, `footerBlocks[]`. One per route per site. IDs: capstone `listingPage-{route}`; RWC `listingPage-{route}-{siteId}`. |
| `site-settings` | ✅ | per-site | Singleton per workspace. IDs: `siteSettings` (capstone) or `siteSettings-{siteId}` (RWC). Holds nav, footer, global SEO, social links. |
| `submission` | ❌ | ❌ | Read-only contact-form capture. Fields depend on form config but typically include name, email, message, timestamp, page of origin. |

### Object types (23)

Reusable building blocks referenced by document types and blocks.

| Type | Purpose |
|---|---|
| `portable-text` | Rich text with embedded image, link, blockquote, callout, internal link, table, videoEmbed variants |
| `seo` | Per-doc SEO (title, description, keywords, ogImage, canonical, robots, structured data overrides) |
| `button`, `link` | CTA button + internal/external link primitives |
| `feature-item`, `service-item`, `product-item` | Content card items consumed by featureGrid / serviceCards / productShowcase |
| `stat-item`, `step-item`, `faq-item` | Stats row counters, steps, FAQ Q&A |
| `pricing-tier`, `sponsorship-tier-item`, `metric-item` | Pricing + sponsorship + KPI items |
| `link-card-item`, `card-grid-item` | Generic linked cards |
| `team-member` | Team grid member (name, role, photo, social) |
| `gallery-image` | Image with metadata (featured, year, category, alt) consumed by imageGallery |
| `timeline-entry` | Timeline milestone |
| `accordion-item`, `tab-item` | Accordion / tabs content |
| `comparison-row`, `comparison-column` | Comparison table cells |
| `block-base` | Shared shell: `_meta` (spacing, background, maxWidth, alignment, id, hiddenByVariant) |

### Block types (38) — referenced from `page.body`, `article.body`, `event.body`

See [component-inventory.md](./component-inventory.md) for the matching Astro components. Block schemas live under `studio/src/schemaTypes/blocks/**`.

Layout: `columnsBlock`, `divider`, `announcementBar`.
Hero/marketing: `heroBanner`, `ctaBanner`, `textWithImage`, `logoCloud`, `sponsorshipTiers`.
Content: `featureGrid`, `statsRow`, `testimonials`, `teamGrid`, `imageGallery`, `articleList`, `eventList`.
Forms: `contactForm`, `newsletter`, `accordion`, `tabsBlock`, `faqSection`.
Commerce: `pricingTable`, `productShowcase`, `serviceCards`.
Editorial: `comparisonTable`, `timeline`, `pullquote`, `beforeAfter`.
Media: `videoEmbed`, `embedBlock`, `mapBlock`, `countdownTimer`.
Social: `sponsorCards`, `sponsorSteps`, `projectCards`, `richText`.
Essentials: `linkCards`, `metricsDashboard`, `cardGrid`.

### Relationships

- `article.author` → `author` (ref, same site).
- `article.category` → `article-category` (ref).
- `article.relatedArticles[]` → `article` (refs, same site).
- `project.sponsor` → `sponsor` (ref, same site).
- Every block that renders other docs (articleList, sponsorCards, projectCards, eventList) takes either an explicit `items[]` array of refs or a query-driven `source`/`contentType` discriminator.

### Migrations (`studio/migrations/`)

1. **`add-item-types.mjs`** (Story 7.10) — Adds `_type` to array items that were previously inline objects: `featureGrid.items → featureItem`, `statsRow.stats → statItem`, `sponsorSteps.items → stepItem`.
2. **`rename-18-6-fields.mjs`** (Story 18.6) — Field renames: `testimonials.displayMode → testimonialSource`, `eventList.filterBy → eventStatus`, `articleList.source → contentType`, `articleList.links → ctaButtons`, `videoEmbed.videoUrl → youtubeUrl`, `newsletter.placeholderText → inputPlaceholder` + `buttonText → submitButtonLabel` + `disclaimer → privacyDisclaimerText`, `comparisonTable.columns/rows → options/criteria`. Supports `--dry-run`.
3. **`rename-18-7-richtext-variants.mjs`** (Story 18.7) — Portable Text variant renames.

Run with `npx sanity migration run <name> --dry-run` first, then `--no-dry-run --confirm`.

### GROQ queries (30 `defineQuery` exports in `astro-app/src/lib/sanity.ts`)

Site settings: `SITE_SETTINGS_QUERY`.
Pages: `PAGE_BY_SLUG_QUERY`, `ALL_PAGES_SLUGS_QUERY` (for `getStaticPaths`).
Articles: `ALL_ARTICLES_QUERY`, `ARTICLE_BY_SLUG_QUERY`, `ALL_ARTICLE_CATEGORIES_QUERY`, `ARTICLE_CATEGORY_BY_SLUG_QUERY`, `ARTICLES_BY_CATEGORY_QUERY`.
Authors: `ALL_AUTHORS_QUERY`, `AUTHOR_BY_SLUG_QUERY`.
Sponsors: `ALL_SPONSORS_QUERY`, `SPONSOR_BY_SLUG_QUERY`, `SPONSOR_PORTAL_QUERY` (portal-only fields incl. contacts), `SPONSOR_WHITELIST_QUERY` (email → role escalation).
Projects: `ALL_PROJECTS_QUERY`, `PROJECT_BY_SLUG_QUERY`, `SPONSOR_PROJECTS_QUERY`.
Events: `ALL_EVENTS_QUERY`, `EVENT_BY_SLUG_QUERY`.
Testimonials: `ALL_TESTIMONIALS_QUERY`.
Listing pages: `LISTING_PAGE_QUERY`.
Gallery: gallery slug + detail queries (via `imageGallery` block projection).

All queries use shared projection fragments (`INNER_BLOCK_FIELDS_PROJECTION`, `BLOCK_FIELDS_PROJECTION`) that include `asset.metadata.lqip` for blur-up placeholders.

### Type generation

```
studio/schema.json (17,861 lines, committed)
    ↓ npx sanity typegen generate
astro-app/src/sanity.types.ts (22,303 lines, committed)
    ↓ imported by src/lib/sanity.ts and every page
<component props typed as QueryResult<typeof QUERY>>
```

Required cadence: run `npm run typegen` whenever schemas or query fragments change. CI's `astro check` step fails on drift.

---

## Part 2 — Cloudflare D1 (`ywcc-capstone-portal`)

- **Database ID:** `76887418-c356-46d8-983b-fa6e395d8b16`
- **Binding name:** `PORTAL_DB` (from `astro-app/wrangler.jsonc`); `DB` in `event-reminders-worker`.
- **ORM:** Drizzle 0.45.1 (`astro-app/src/lib/db.ts`, `drizzle-schema.ts`).
- **Migrations:** `astro-app/migrations/0000_*.sql` … `0006_*.sql`. The astro-app workspace is the single source of truth; other workers only read.

### Tables

#### `user` (Better Auth)
| Column | Type | Notes |
|---|---|---|
| `id` | text PK | Better Auth user ID |
| `email` | text unique | Lowercased |
| `name` | text | Display name |
| `role` | text | `student` or `sponsor`. Default `student`; escalated by middleware via `SPONSOR_WHITELIST_QUERY`. Added in `0002_add_user_role.sql`; backfilled in `0003_backfill_sponsor_roles.sql`. |
| `emailVerified` | boolean | |
| `image` | text | |
| `createdAt`, `updatedAt` | timestamps | |

#### `session`
| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `token` | text unique | Session token (also the cookie value) |
| `userId` | text FK → `user.id` | Indexed (`session_userId_idx`) |
| `expiresAt` | timestamp | |
| `ipAddress`, `userAgent` | text | |
| `createdAt`, `updatedAt` | timestamps | |

Cached in KV `SESSION_CACHE` for fast-path lookup; D1 is authoritative.

#### `account`
OAuth + credential linkages.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `userId` | text FK → `user.id` | Indexed (`account_userId_idx`) |
| `providerId` | text | `google`, `github`, `email` (Magic Link) |
| `accountId` | text | Provider's user id |
| `accessToken`, `refreshToken`, `idToken` | text | Encrypted where applicable |
| `accessTokenExpiresAt`, `refreshTokenExpiresAt` | timestamps | |
| `scope` | text | OAuth scopes granted |
| `password` | text | Only for password-based (unused) |

#### `verification`
Email / password reset tokens (Better Auth default).

#### `subscribers`
| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `email` | text unique | |
| `source` | text | Where they subscribed (e.g., `article-19.7`, `footer`) |
| `createdAt` | timestamp | |

Writes from `/api/subscribe`. Read by `event-reminders-worker` to decide who gets reminders.

#### `sent_reminders`
Idempotency log to prevent duplicate reminder emails.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `eventId` | text | Sanity event `_id` |
| `subscriberId` | text | FK → `subscribers.id` (optional if reminder is Discord-only) |
| `tier` | text | `30d`, `7d`, `1d` |
| `sentAt` | timestamp | |

Unique constraint: (`eventId`, `subscriberId`, `tier`).

#### `project_github_repos`
Sponsor self-serve project → GitHub repository links.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `userId` | text FK → `user.id` | Indexed (`idx_github_repos_user`) |
| `projectId` | text | Sanity `project._id` |
| `repoFullName` | text | e.g. `gsinghjay/some-repo` |
| `repoUrl` | text | Canonical URL |
| `createdAt`, `updatedAt` | timestamps | |

Unique constraint: `uq_github_repos_user_project` on (`userId`, `projectId`). Populated via `/portal/api/github/links` (POST/DELETE).

### Migration history

| Migration | Purpose |
|---|---|
| `0000_init.sql` | Better Auth core tables (`user`, `account`, `session`, `verification`) |
| `0001_student_auth.sql` | Student auth additions |
| `0002_add_user_role.sql` | Adds `role` column to `user` |
| `0003_backfill_sponsor_roles.sql` | Data migration: existing emails matching sponsor whitelist → `role=sponsor` |
| `0004_create_subscribers.sql` | Newsletter subscribers |
| `0005_create_sent_reminders.sql` | Event reminder idempotency log |
| `0006_create_project_github_repos.sql` | Project → GitHub repo links |

### Query patterns

- **Read-first, cache-second:** Middleware reads KV then D1 for session validation.
- **Write-through:** Writes go to D1 directly; KV cache is populated lazily on next read.
- **Joins for `/portal/api/projects`:** Drizzle joins `user` → `project_github_repos` with Sanity-sourced project metadata.

---

## Cross-store linkage

- `user.email` ↔ `sponsor.contacts[].email` — defines role escalation (Sanity side authoritative).
- `user.role` ↔ route access — middleware enforces `/portal/**` for `sponsor`, `/student` for `student`.
- `project_github_repos.projectId` ↔ Sanity `project._id` — not a hard FK (Sanity data can be deleted), so the Portal UI must gracefully degrade when a project no longer exists.
- `sent_reminders.eventId` ↔ Sanity `event._id` — same caveat.

## Known gaps

- No cleanup policy for orphaned `project_github_repos` rows when a Sanity project is deleted.
- `submission` doc type is write-only (submissions accumulate); no archival or export tooling.
- TypeGen does not yet run as a pre-commit hook — relies on developers running `npm run typegen` before pushing.
- `event-reminders-worker` and `astro-app` both read the same D1; a coordinated migration process is required to avoid one worker outpacing the other.
