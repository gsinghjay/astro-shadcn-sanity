# Data Models

**Project:** ywcc-capstone-template v2.0.0
**Generated:** 2026-04-29 (full rescan, deep)

Two stores: **Sanity Content Lake** (project `49nk9b0w`, datasets `production` + `rwc`) for editorial content; **Cloudflare D1** (`ywcc-capstone-portal`) for portal sessions, sponsor agreements, GitHub linkages, and event-reminder dedupe.

## Sanity content schemas

### Document types (13)

Located in `studio/src/schemaTypes/documents/`. Filename → `_type` mapping (kebab-case file → camelCase `_type`):

| Document             | `_type`             | Site-aware | Singleton (Capstone)        | Notes                                              |
|----------------------|---------------------|:----------:|:---------------------------:|----------------------------------------------------|
| `page.ts`            | `page`              | ✓          |                             | Page-builder document. Holds `pageBuilder` array of blocks. |
| `sponsor.ts`         | `sponsor`           | ✓          |                             | Logo variants: `logo` (required), `logoSquare`, `logoHorizontal` |
| `project.ts`         | `project`           | ✓          |                             | References `sponsor`. Sortable on `/projects`.    |
| `event.ts`           | `event`             | ✓          |                             | `status` field with date fallback (resolver respects). |
| `article.ts`         | `article`           | ✓          |                             | References `articleCategory` + `author`. JSON-LD `Article`. |
| `author.ts`          | `author`            | ✓          |                             | JSON-LD `Person`.                                  |
| `articleCategory.ts` | `articleCategory`   | ✓          |                             | Slug-based archive at `/articles/category/[slug]`.|
| `testimonial.ts`     | `testimonial`       | ✓          |                             |                                                    |
| `submission.ts`      | `submission`        | ✓          |                             | Created by `submitForm` Astro Action.             |
| `siteSettings.ts`    | `siteSettings`      |            | ✓                           | One per workspace. Header / footer / SEO defaults. |
| `listingPage.ts`     | `listingPage`       |            | ✓                           | Singleton per listing route (e.g. `/projects`).    |
| `portalPage.ts`      | `portalPage`        |            | ✓ (Capstone-only template)  | Portal landing copy.                               |
| `sponsorAgreement.ts`| `sponsorAgreement`  |            | ✓ (Capstone-only template)  | Versioned agreement (Story 15.11). Pinned by `agreement_version` on `user`. |

**Site-aware filter pattern**: `*[_type == "X" && ($site == "" || site == $site)]`. Empty string short-circuits for Capstone (single-site). RWC workspaces pass `site == "rwc-us"` or `site == "rwc-intl"`.

### Object types (23)

Reusable nested objects in `studio/src/schemaTypes/objects/`:

`block-base`, `link`, `button`, `seo`, `accordion-item`, `faq-item`, `feature-item`, `card-grid-item`, `step-item`, `team-member`, `pricing-tier`, `metric-item`, `comparison-row`, `comparison-column`, `timeline-entry`, `tab-item`, `gallery-image`, `service-item`, `link-card-item`, `sponsorship-tier-item`, `stat-item`, `product-item`, `portable-text`.

### Block types (38)

Located in `studio/src/schemaTypes/blocks/`. Composed via the `defineBlock()` helper — never raw `defineType()` (the variant pipeline depends on it).

```
accordion           announcement-bar    article-list        before-after
card-grid           columns-block       comparison-table    contact-form
countdown-timer     cta-banner          divider             embed-block
event-list          faq-section         feature-grid        hero-banner
image-gallery       link-cards          logo-cloud          map-block
metrics-dashboard   newsletter          pricing-table       product-showcase
project-cards       pullquote           rich-text           service-cards
sponsor-cards       sponsor-steps       sponsorship-tiers   stats-row
tabs-block          team-grid           testimonials        text-with-image
timeline            video-embed
```

**Naming**: `studio/src/schemaTypes/blocks/<kebab-case>.ts` → schema `_type` is camelCase (e.g. `hero-banner.ts` → `_type: "heroBanner"`). The matching component `astro-app/src/components/blocks/custom/<PascalCase>.astro` registers itself by `_type` via `import.meta.glob({ eager: true })` in `block-registry.ts`.

**Block helpers** (`studio/src/schemaTypes/helpers/`):

- `defineBlock.ts` — composes `block-base` fields + variants + custom fields with `hiddenByVariant` conditional visibility.
- `commonFields.ts` — `headerFields(opts)` (heading + description), `displayModeBlock(config)` (all/featured/manual), `validateYouTubeUrl()`.
- `block-members.ts` — shared member type lists.

### Field types (1 + 1 test)

- `studio/src/schemaTypes/fields/site-field.ts` — custom site-aware filtering field type. Drives workspace visibility via `workspace-utils.ts`.

### Sanity migrations

`studio/migrations/` (3 `.mjs` files, run via `sanity exec`):

| File                                       | Purpose                                                              |
|--------------------------------------------|----------------------------------------------------------------------|
| `add-item-types.mjs`                       | Add typed object items to existing block arrays.                     |
| `rename-18-6-fields.mjs`                   | Story 18.6 field renames (Apr 12 2026).                              |
| `rename-18-7-richtext-variants.mjs`        | Story 18.7 rich-text variant renames (Apr 12 2026).                  |

Schema deploy is a 4-step pipeline (all required for MCP content tools to work with new types):

1. Update local schema files in `studio/src/schemaTypes/`.
2. `npm run schema:deploy -w studio` (deploys all 3 workspaces) or per-workspace `schema:deploy:capstone` / `schema:deploy:rwc`.
3. `npm run typegen` (extracts schema → generates `studio/sanity.types.ts`).
4. Update `astro-app/src/lib/types.ts` if new block / document types added.

## Reusable GROQ projections

Defined alongside queries in `astro-app/src/lib/sanity.ts` and consumed via string interpolation in larger queries:

- `IMAGE_PROJECTION` — `asset->{ _id, url, metadata { lqip, dimensions } }`. Always project `metadata.lqip` for blur placeholders + `dimensions` for CLS guards.
- `PORTABLE_TEXT_PROJECTION` — Portable Text body shape with marks + custom blocks.

## GROQ query inventory (32 in `astro-app/src/lib/sanity.ts`)

All wrapped in `defineQuery(groq\`…\`)` (required for TypeGen). Result types are auto-named `<NAME>_RESULT` and consumed via `lib/types.ts` extracts.

| Query export                       | Returns                                          |
|------------------------------------|--------------------------------------------------|
| `SITE_SETTINGS_QUERY`              | siteSettings document by ID                      |
| `ALL_PAGE_SLUGS_QUERY`             | All page slugs (for static path enumeration)     |
| `PAGE_BY_SLUG_QUERY`               | Page document by slug + page-builder data        |
| `LISTING_PAGE_QUERY`               | Listing-page singleton by ID                     |
| `PORTAL_PAGE_QUERY`                | Portal landing copy (Capstone)                   |
| `SPONSOR_AGREEMENT_QUERY`          | Current sponsor agreement                        |
| `SPONSOR_AGREEMENT_REV_QUERY`      | Specific revision (for version pinning)          |
| `ALL_SPONSORS_QUERY`               | All visible sponsors                             |
| `ALL_SPONSOR_SLUGS_QUERY`          | Sponsor slugs                                    |
| `SPONSOR_BY_SLUG_QUERY`            | Sponsor detail page                              |
| `SPONSOR_BY_EMAIL_QUERY`           | Sponsor lookup by `contactEmail` or `allowedEmails[]` (portal auth) |
| `SPONSOR_PORTAL_QUERY`             | Sponsor + projects for portal landing            |
| `SPONSOR_PROJECTS_QUERY`           | Projects for a list of sponsor IDs               |
| `SPONSOR_PROJECTS_API_QUERY`       | Single sponsor's projects (portal API)           |
| `ALL_PROJECTS_QUERY`               | All projects                                     |
| `ALL_PROJECT_SLUGS_QUERY`          | Project slugs                                    |
| `PROJECT_BY_SLUG_QUERY`            | Project detail                                   |
| `ALL_TESTIMONIALS_QUERY`           | All testimonials                                 |
| `ALL_EVENTS_QUERY`                 | All events (sorted by date asc)                  |
| `EVENTS_BY_MONTH_QUERY`            | Events filtered to a month range                 |
| `ALL_EVENT_SLUGS_QUERY`            | Event slugs                                      |
| `EVENT_BY_SLUG_QUERY`              | Event detail                                     |
| `ALL_ARTICLES_QUERY`               | All published articles                           |
| `ALL_ARTICLE_SLUGS_QUERY`          | Article slugs                                    |
| `ARTICLE_BY_SLUG_QUERY`            | Article detail                                   |
| `ARTICLES_BY_CATEGORY_QUERY`       | Articles filtered by category ID                 |
| `ALL_ARTICLE_CATEGORIES_QUERY`     | Article categories (with slugs)                  |
| `ALL_ARTICLE_CATEGORY_SLUGS_QUERY` | Category slugs                                   |
| `ARTICLE_CATEGORY_BY_SLUG_QUERY`   | Category detail (for archive page)               |
| `ALL_AUTHORS_QUERY`                | All authors                                      |
| `ALL_AUTHOR_SLUGS_QUERY`           | Author slugs                                     |
| `AUTHOR_BY_SLUG_QUERY`             | Author detail                                    |

Sponsor lookups by allowed emails use `$email in allowedEmails` — multi-contact sponsors can authorize multiple addresses.

## Cloudflare D1 schema (`ywcc-capstone-portal`)

Database ID: `76887418-c356-46d8-983b-fa6e395d8b16`. Bindings: `PORTAL_DB` on `ywcc-capstone`, `DB` on `ywcc-event-reminders`. RWC and preview Workers do not bind D1.

13 tables across two eras: legacy portal scaffolding (migration 0000) + Better Auth (0001) + feature additions (0004 / 0005 / 0006). The agreement gate stores its state as **columns on `user`** (not a separate table).

### Better Auth tables (declared in `astro-app/src/lib/drizzle-schema.ts`)

| Table                 | Drizzle export        | Columns                                                                                          | Indexes              |
|-----------------------|-----------------------|--------------------------------------------------------------------------------------------------|----------------------|
| `user`                | `user`                | `id`, `email`, `emailVerified`, `name`, `image`, `role` (default `student`, migration 0002), `agreement_accepted_at` (0007), `agreement_version` (0009), `agreement_accepted_ip` (0009), `agreement_accepted_user_agent` (0009), `created_at`, `updated_at` | unique `email`        |
| `session`             | `session`             | `id`, `expires_at`, `token`, `ip_address`, `user_agent`, `user_id` (FK), `created_at`, `updated_at` | unique `token`, `user_id` |
| `account`             | `account`             | `id`, `account_id`, `provider_id`, `user_id` (FK), `access_token`, `refresh_token`, `id_token`, `access_token_expires_at`, `refresh_token_expires_at`, `scope`, `password`, `created_at`, `updated_at` | unique `(provider_id, account_id)` |
| `verification`        | `verification`        | `id`, `identifier`, `value`, `expires_at`, `created_at`, `updated_at`                            |                      |

### Feature tables

| Table                 | Drizzle export?       | Columns                                                                                          | Source                   |
|-----------------------|-----------------------|--------------------------------------------------------------------------------------------------|--------------------------|
| `project_github_repos`| `projectGithubRepos`  | `id`, `user_id` (FK), `project_id` (Sanity), `repo_owner`, `repo_name`, `branch`, `created_at`   | migration 0006           |
| `subscribers`         | (raw)                 | `id`, `email`, `created_at`, `confirmed_at`, source                                              | migration 0004           |
| `sent_reminders`      | (raw)                 | `id`, `event_id`, `subscriber_email`, `sent_at`, `kind`                                          | migration 0005           |

### Legacy `0000_init.sql` tables (predate Better Auth)

These tables were created before the Better Auth migration. Some are used; some are dormant. None are declared in Drizzle — accessed via raw SQL where used.

| Table                       | Status      |
|-----------------------------|-------------|
| `portal_activity`           | Legacy — pre-Better-Auth activity log. |
| `event_rsvps`               | Legacy — RSVPs were superseded by sponsor `allowedEmails` flow. |
| `evaluations`               | Legacy — sponsor evaluation forms. |
| `agreement_signatures`      | Legacy — superseded by `user.agreement_*` columns (0007 / 0009). |
| `notification_preferences`  | Legacy — superseded by `subscribers` table. |
| `notifications`             | Legacy — superseded by Discord webhook + Resend. |

> Auditing recommendation: a follow-up migration could drop the legacy tables once a search of the codebase confirms no live reads remain. Treat any new feature work as Drizzle-first; do not add columns to legacy tables.

### D1 indexes + relations

Drizzle-declared (in `drizzle-schema.ts`):

- `user.email` unique
- `session.token` unique, `session.user_id` btree
- `account` unique on `(provider_id, account_id)`
- `userRelations`: `user → many(session, account)`
- `sessionRelations`: `session → one(user)`
- `accountRelations`: `account → one(user)`

Migration-declared additional indexes for `subscribers`, `sent_reminders`, `project_github_repos` (idx on the FK / lookup columns). See the matching `.sql` files for exact `CREATE INDEX` statements.

## Sanity ↔ D1 cross-store linkage

Two systems, joined at the application layer:

```
Sanity:  sponsor.contactEmail / sponsor.allowedEmails
                   │
                   ▼  (resolved at portal session creation)
D1: user.email  ──►  user.id
                   │
                   ├──► session.user_id    (Better Auth)
                   ├──► account.user_id    (OAuth linkages)
                   └──► project_github_repos.user_id  (sponsor repo linkages)

Sanity:  event._id, sponsor._id (referenced by D1 raw SQL — no FK)
                   ▼
D1: sent_reminders.event_id (string match against Sanity _id)
```

There are **no cross-store foreign keys** — the link is by email + Sanity `_id` strings, joined in application code. The `SPONSOR_BY_EMAIL_QUERY` is the canonical lookup for portal authentication.

## TypeScript-derived types from Sanity

Auto-generation chain:

```
schemaTypes/*.ts  ── sanity schema extract ──►  studio/schema.json
                                                      │
                                                      ▼
                                          sanity typegen generate
                                                      │
                                                      ▼
                                          studio/sanity.types.ts
                                                      │
                                                      ▼
                                          astro-app/src/lib/types.ts  (extracts named exports)
                                                      │
                                                      ▼
                                          component props (e.g. HeroBannerProps = Extract<PageBlock, { _type: "heroBanner" }>)
```

- Query result types: auto-named `<QUERY_NAME>_RESULT`. Wrap with `NonNullable<>` when the query may return `null` (single-document fetches).
- Block extraction: `PageBlocks = Page['pageBuilder']` → `PageBlock = PageBlocks[number]` → `Extract<PageBlock, { _type: 'blockName' }>`.
- Loose `any` types are forbidden for Sanity content. Always derive from TypeGen.

## Cache + freshness

- **Module-level caches** (`_sponsorsCache`, `_siteSettingsCache` in `lib/sanity.ts`) bypass when `visualEditingEnabled === true`.
- **Live preview** subscriptions in `lib/sanity-live.ts` use exponential backoff (max 5 reconnect attempts).
- **CDN reads**: `useCdn: true` on production (published-only); preview Workers force `useCdn: false` and drafts perspective.
- **Server Islands**: preview-mode `SanityPageContent server:defer` sets `Cache-Control: no-cache, no-store, must-revalidate`.

## Key risks

1. **Single shared D1 between two Workers**. Migrations apply to both — treat as a coupled deploy.
2. **Legacy `0000_init` tables** still exist in production. Document any usage before removing.
3. **Cross-store integrity** is application-enforced. A renamed sponsor email that isn't propagated to `allowedEmails` will block portal access. A deleted Sanity event with un-purged `sent_reminders` rows will leave dangling D1 data.
4. **Migration coordination**: deploys to `astro-app` and `event-reminders-worker` should happen together when migrations affect tables both Workers read (`subscribers`, `sent_reminders`).
5. **Sanity `49nk9b0w` is one project, two datasets** (`production` for capstone, `rwc` for both RWC sites). A schema change deploys to all three workspaces simultaneously via `npm run schema:deploy -w studio`.
