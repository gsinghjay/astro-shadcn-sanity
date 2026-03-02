# Story 15.3: Astro Multi-Site Data Fetching

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want all GROQ queries parameterized by site context derived from environment variables,
so that the same Astro codebase renders correct content for each site at build time.

## Acceptance Criteria

1. **AC1: Environment Variables Integration**
   - `astro-app/src/lib/sanity.ts` reads `PUBLIC_SANITY_DATASET` and `PUBLIC_SITE_ID` from `import.meta.env`
   - Sanity client configuration in `astro-app/astro.config.mjs` uses `PUBLIC_SANITY_DATASET` for the `dataset` option
   - Defaults: `PUBLIC_SANITY_DATASET=production`, `PUBLIC_SITE_ID=capstone` for backwards compatibility

2. **AC2: Conditional Site Filtering**
   - For the `rwc` dataset: all list queries include `&& site == $site` filter with `params: { site: PUBLIC_SITE_ID }`
   - For the `production` dataset: queries remain unchanged (no `site` filter needed)
   - Create utility `getSiteFilter()` that returns `&& site == $site` when `PUBLIC_SANITY_DATASET === 'rwc'` and empty string (no-op) when `production`

3. **AC3: SiteSettings Per-Site Handling**
   - `getSiteSettings()` queries `*[_type == "siteSettings" && _id == $siteSettingsId][0]` on `rwc` dataset (where `siteSettingsId` = `siteSettings-${PUBLIC_SITE_ID}`)
   - Or `*[_type == "siteSettings"][0]` on `production` dataset (existing behavior)

4. **AC4: Memoization & TypeGen**
   - Module-level memoization continues to work (each build is single-site, so cache is correct per build)
   - `defineQuery` queries updated to accept site parameter where needed
   - `npm run typegen` passes after query changes

5. **AC5: Local Development Backwards Compatibility**
   - Local dev works by setting `PUBLIC_SANITY_DATASET` and `PUBLIC_SITE_ID` in `astro-app/.env`
   - Defaults to `production` / `capstone` when env vars not set — existing single-site behavior preserved
   - All existing tests continue to pass without modification (or with minimal fixture updates)

## Tasks / Subtasks

- [x] **Task 1: Add environment variable reads and site context utility** (AC: #1, #2)
  - [x] 1.1 Add `PUBLIC_SITE_ID` to `astro-app/.env` and `.env.example` (default: `capstone`)
  - [x] 1.2 Update `astro-app/astro.config.mjs` dataset resolution to prefer `PUBLIC_SANITY_DATASET` with existing fallback chain
  - [x] 1.3 Create site context constants in `astro-app/src/lib/sanity.ts`: read `PUBLIC_SANITY_DATASET` and `PUBLIC_SITE_ID` from `import.meta.env` with defaults
  - [x] 1.4 Create `getSiteFilter()` utility function that returns conditional GROQ fragment
  - [x] 1.5 Create `getSiteParams()` utility that returns `{ site: PUBLIC_SITE_ID }` for rwc or `{}` for production

- [x] **Task 2: Parameterize list queries with site filter** (AC: #2)
  - [x] 2.1 Update `ALL_SPONSORS_QUERY` — inject site filter for rwc dataset
  - [x] 2.2 Update `ALL_SPONSOR_SLUGS_QUERY` — inject site filter
  - [x] 2.3 Update `ALL_PROJECTS_QUERY` — inject site filter
  - [x] 2.4 Update `ALL_PROJECT_SLUGS_QUERY` — inject site filter
  - [x] 2.5 Update `ALL_TESTIMONIALS_QUERY` — inject site filter
  - [x] 2.6 Update `ALL_EVENTS_QUERY` — inject site filter
  - [x] 2.7 Update `ALL_EVENT_SLUGS_QUERY` — inject site filter
  - [x] 2.8 Update `ALL_PAGE_SLUGS_QUERY` — inject site filter
  - [x] 2.9 Update `EVENTS_BY_MONTH_QUERY` — inject site filter

- [x] **Task 3: Parameterize detail queries AND their nested sub-queries** (AC: #2)
  - [x] 3.1 Update `SPONSOR_BY_SLUG_QUERY` — add site filter to main filter AND to nested `*[_type == "project" && references(^._id)]` sub-query
  - [x] 3.2 Update `PROJECT_BY_SLUG_QUERY` — add site filter to main filter AND to nested `*[_type == "testimonial" && references(^._id)]` sub-query
  - [x] 3.3 Update `EVENT_BY_SLUG_QUERY` — add site filter
  - [x] 3.4 Update `PAGE_BY_SLUG_QUERY` — add site filter

- [x] **Task 4: Update SiteSettings for multi-site** (AC: #3)
  - [x] 4.1 Update `SITE_SETTINGS_QUERY` to use conditional `_id` filter for rwc dataset
  - [x] 4.2 Update `getSiteSettings()` to pass site-specific params

- [x] **Task 5: Update all fetch helper functions** (AC: #2, #4)
  - [x] 5.1 Update `getAllSponsors()` — pass site params to `loadQuery`
  - [x] 5.2 Update `getSponsorBySlug()` — pass site params
  - [x] 5.3 Update `getAllProjects()` — pass site params
  - [x] 5.4 Update `getProjectBySlug()` — pass site params
  - [x] 5.5 Update `getAllTestimonials()` — pass site params
  - [x] 5.6 Update `getAllEvents()` — pass site params
  - [x] 5.7 Update `getEventBySlug()` — pass site params
  - [x] 5.8 Update `getPage()` / `prefetchPages()` — pass site params
  - [x] 5.9 Update `getStaticPaths` in all page routes — these use `sanityClient.fetch()` directly (not `loadQuery`), so pass `getSiteParams()` explicitly:
    - `astro-app/src/pages/[...slug].astro`: `sanityClient.fetch(ALL_PAGE_SLUGS_QUERY, getSiteParams())`
    - `astro-app/src/pages/sponsors/[slug].astro`: `sanityClient.fetch(ALL_SPONSOR_SLUGS_QUERY, getSiteParams())`
    - `astro-app/src/pages/projects/[slug].astro`: `sanityClient.fetch(ALL_PROJECT_SLUGS_QUERY, getSiteParams())`
    - `astro-app/src/pages/events/[slug].astro`: `sanityClient.fetch(ALL_EVENT_SLUGS_QUERY, getSiteParams())`

- [x] **Task 6: Run TypeGen and fix types** (AC: #4)
  - [x] 6.1 Run `npm run typegen` — expect new query parameter types
  - [x] 6.2 Fix any type errors in components/fixtures from query signature changes
  - [x] 6.3 Verify all 14 queries still generate correct result types

- [x] **Task 7: Testing** (AC: #5)
  - [x] 7.1 Run `npm run test:unit` — all existing tests pass
  - [x] 7.2 Verify build succeeds with default env vars (production/capstone)
  - [x] 7.3 Verify build succeeds with rwc env vars (manual test with `PUBLIC_SANITY_DATASET=rwc PUBLIC_SITE_ID=rwc-us`)
  - [x] 7.4 Add unit tests for `getSiteFilter()` and `getSiteParams()` utilities

## Dev Notes

### Architecture Decision: String Interpolation vs. Runtime Branching

**Chosen approach: GROQ string interpolation with `getSiteFilter()`**

Since `import.meta.env` values are **statically replaced at build time** by Astro/Vite, the site filter can be baked directly into GROQ query strings at module evaluation time. This means:

- Queries for `production` dataset will have NO site filter (empty string interpolated)
- Queries for `rwc` dataset will have `&& site == $site` baked in
- Each CF Pages build is isolated — one build = one site = one set of queries
- No runtime branching needed inside query strings

```typescript
// Pattern: Module-level constants resolved at build time
const DATASET = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
const SITE_ID = import.meta.env.PUBLIC_SITE_ID || 'capstone';
const isMultiSite = DATASET === 'rwc';

// Returns "&& site == $site" for rwc, "" for production
function getSiteFilter(): string {
  return isMultiSite ? '&& site == $site' : '';
}

// Returns { site: "rwc-us" } for rwc, {} for production
function getSiteParams(): Record<string, string> {
  return isMultiSite ? { site: SITE_ID } : {};
}
```

### Query Parameterization Pattern

Every list query gets the site filter appended. Every fetch helper merges site params:

```typescript
// BEFORE (single-site)
const ALL_SPONSORS_QUERY = defineQuery(
  groq`*[_type == "sponsor"] | order(name asc) { ... }`
);

// AFTER (multi-site aware)
const ALL_SPONSORS_QUERY = defineQuery(
  groq`*[_type == "sponsor" ${getSiteFilter()}] | order(name asc) { ... }`
);

// Fetch helper merges site params
export async function getAllSponsors() {
  if (!_sponsorsCache || visualEditingEnabled) {
    const { result } = await loadQuery<ALL_SPONSORS_QUERY_RESULT>({
      query: ALL_SPONSORS_QUERY,
      params: { ...getSiteParams() },
    });
    _sponsorsCache = result;
  }
  return _sponsorsCache;
}
```

### Reverse-Reference Sub-Queries Must Also Be Site-Filtered

Detail queries contain **nested GROQ sub-queries** for related content. These MUST also include the site filter to prevent cross-site data leakage on the `rwc` dataset:

```typescript
// SPONSOR_BY_SLUG_QUERY — nested project lookup
// BEFORE: shows ALL projects referencing this sponsor (including other site's projects)
"projects": *[_type == "project" && references(^._id)]{ title, slug }

// AFTER: only shows projects from the same site
"projects": *[_type == "project" && references(^._id) ${getSiteFilter()}]{ title, slug }

// PROJECT_BY_SLUG_QUERY — nested testimonial lookup
// BEFORE: shows ALL testimonials referencing this project
"testimonials": *[_type == "testimonial" && references(^._id)]{ ... }

// AFTER: only shows testimonials from the same site
"testimonials": *[_type == "testimonial" && references(^._id) ${getSiteFilter()}]{ ... }
```

The `$site` param is passed at the top-level `loadQuery` call and propagates to nested sub-queries automatically — GROQ params are available to all sub-queries within the same fetch.

### SiteSettings Multi-Site Pattern

The `rwc` dataset has per-site siteSettings singletons with IDs `siteSettings-rwc-us` and `siteSettings-rwc-intl` (established in Story 15.2). The `production` dataset uses the default `siteSettings` singleton.

```typescript
// Site settings ID resolution
function getSiteSettingsId(): string {
  return isMultiSite ? `siteSettings-${SITE_ID}` : 'siteSettings';
}

// Query uses _id filter for deterministic lookup
const SITE_SETTINGS_QUERY = defineQuery(
  groq`*[_type == "siteSettings" && _id == $siteSettingsId][0] { ... }`
);
```

### Environment Variable Contract (from Epic 15)

| Site | `PUBLIC_SANITY_DATASET` | `PUBLIC_SITE_ID` | `PUBLIC_SITE_THEME` |
|---|---|---|---|
| Capstone | `production` | `capstone` | `red` |
| RWC US | `rwc` | `rwc-us` | `blue` |
| RWC International | `rwc` | `rwc-intl` | `green` |

### Sanity Best Practices Applied

Per the Sanity GROQ rules loaded via MCP:

1. **Optimizable filters first**: `_type == "sponsor"` is optimizable (uses index). The `site == $site` filter stacks on top, narrowing results from the indexed set. This is the correct GROQ performance pattern — stack optimizable filters before non-optimizable ones.

2. **Use `$params` not string interpolation for values**: Site ID is passed as `$site` param, never interpolated into the query string. This enables GROQ query caching and prevents injection.

3. **`defineQuery` for all queries**: All modified queries remain wrapped in `defineQuery()` for TypeGen support. The `getSiteFilter()` string interpolation happens at the GROQ template level, not inside `defineQuery`'s type inference — TypeGen will see the final query string.

4. **TypeGen after changes**: `npm run typegen` must run after all query modifications. New `$site` parameter will appear in generated types. The `sanity-typegen.json` config already handles the monorepo path (`../studio/schema.json`).

5. **Project specific fields in all queries**: No `{ ... }` (select-all) patterns. All existing queries already project specific fields — maintain this.

### Critical: `defineQuery` with String Interpolation — TypeGen Compatibility

`defineQuery` wraps a template literal. The `getSiteFilter()` call is **evaluated at module load time** (build time in Astro), so `defineQuery` receives a fully resolved string. TypeGen runs at development time with `production` defaults, so it will see queries **without** the site filter — this is correct because:

- TypeGen extracts schema types, not runtime query behavior
- The `$site` param is optional (only present in rwc builds)
- Result types are identical regardless of site filter (same document types)

**TypeGen Risk:** TypeGen's `sanity typegen generate` **statically parses** source files for `defineQuery()` calls. If the parser cannot resolve `${getSiteFilter()}` as a static string (it's a function call in a template literal), TypeGen may fail or produce incomplete types.

**Fallback strategy if TypeGen fails with function interpolation:** Switch to an always-present filter pattern that keeps query strings fully static:

```typescript
// Always-present filter — TypeGen sees a complete static GROQ string
const ALL_SPONSORS_QUERY = defineQuery(
  groq`*[_type == "sponsor" && ($site == "" || site == $site)] | order(name asc) { ... }`
);

// Production: pass { site: "" } → ($site == "") is true → short-circuits, no filtering
// RWC: pass { site: "rwc-us" } → ($site == "") is false → site == "rwc-us" filters
```

This approach:
- Produces identical static GROQ for TypeGen to parse
- Works correctly on `production` (where documents lack a `site` field) because the `$site == ""` branch short-circuits
- Works correctly on `rwc` because `site == $site` filters as expected
- `$site` param always present in generated types (consistent API)

**Test the primary approach first (Task 6.1).** Only fall back to always-present filter if TypeGen errors.

### `astro.config.mjs` Dataset Resolution

Current fallback chain (from codebase analysis):
```javascript
const dataset = env.PUBLIC_SANITY_STUDIO_DATASET
  || process.env.PUBLIC_SANITY_STUDIO_DATASET
  || env.PUBLIC_SANITY_DATASET
  || process.env.PUBLIC_SANITY_DATASET
  || "production";
```

This already supports `PUBLIC_SANITY_DATASET` as a fallback. For multi-site, we need `PUBLIC_SANITY_DATASET` to be the **primary** source (it's site-specific), while `PUBLIC_SANITY_STUDIO_DATASET` remains for Studio. Consider reordering to:

```javascript
const dataset = env.PUBLIC_SANITY_DATASET
  || process.env.PUBLIC_SANITY_DATASET
  || env.PUBLIC_SANITY_STUDIO_DATASET
  || process.env.PUBLIC_SANITY_STUDIO_DATASET
  || "production";
```

Or simply ensure `PUBLIC_SANITY_DATASET` is set in CF Pages env vars for each project (Story 15.5 handles this).

### Module-Level Memoization Safety

Each CF Pages build is an **isolated process** with its own `import.meta.env` values. Module-level caches (`_sponsorsCache`, `_projectsCache`, etc.) are populated once per build and never mixed between sites. This is safe because:

- Astro SSG runs all pages in a single Node.js process per build
- CF Pages triggers separate builds per project (capstone-site, rwc-us-site, rwc-intl-site)
- No shared memory between builds

### Files to Modify

| File | Changes |
|---|---|
| `astro-app/.env` | Add `PUBLIC_SITE_ID=capstone` |
| `astro-app/.env.example` | Add `PUBLIC_SITE_ID` and `PUBLIC_SANITY_DATASET` documentation |
| `astro-app/astro.config.mjs` | Potentially reorder dataset fallback chain |
| `astro-app/src/lib/sanity.ts` | **Primary file** — site context constants, `getSiteFilter()`, `getSiteParams()`, all 14 query updates, all fetch helper updates |
| `astro-app/src/lib/__tests__/sanity.test.ts` | Add tests for `getSiteFilter()`, `getSiteParams()` |
| `astro-app/src/pages/[...slug].astro` | Pass site params to slug queries in `getStaticPaths` |
| `astro-app/src/pages/sponsors/[slug].astro` | Pass site params to slug queries |
| `astro-app/src/pages/projects/[slug].astro` | Pass site params to slug queries |
| `astro-app/src/pages/events/[slug].astro` | Pass site params to slug queries |
| `astro-app/src/pages/index.astro` | No changes needed (uses `getPage('home')` which inherits site params) |
| `astro-app/src/sanity.types.ts` | Regenerated by `npm run typegen` |

### Files NOT to Modify

- `studio/` — No Studio changes. Schema and workspace configs from 15.1/15.2 are complete.
- `astro-app/src/lib/image.ts` — Image URL builder uses `sanity:client` which auto-configures from integration.
- `astro-app/src/lib/types.ts` — Type aliases derive from generated types; no manual changes needed.
- `astro-app/src/components/` — Block components receive data as props; no awareness of site context.

### Visual Editing / Server Island Awareness

The `SanityPageContent` server island component fetches data independently during Visual Editing (when `PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true`). Since it calls the same `loadQuery()` and fetch helper functions from `sanity.ts`, it will automatically pick up site params after this story's changes. No separate Visual Editing modifications needed — the site context is module-level and applies to all callers.

The `sanity:client` virtual module auto-configures its dataset from the `sanity()` integration in `astro.config.mjs`. Since that config reads `PUBLIC_SANITY_DATASET`, Visual Editing will query the correct dataset per build.

### Anti-Pattern Warnings

- **NEVER** hardcode dataset names (`'production'`, `'rwc'`) in GROQ query strings — always use `getSiteFilter()` / `getSiteParams()`
- **NEVER** use `sanityClient.config().dataset` for branching in Astro — that's a Studio pattern. Use `import.meta.env.PUBLIC_SANITY_DATASET` instead
- **NEVER** add site filtering to `submission` type queries — `submission` is capstone-only (no `site` field in schema)
- **NEVER** import site context from `studio/src/constants.ts` into `astro-app/` — the workspaces are independent npm packages. Duplicate the constants if needed
- **NEVER** pass `site` as a URL param or query string — it's a build-time environment variable, not a runtime value

### Project Structure Notes

- All GROQ queries are centralized in `astro-app/src/lib/sanity.ts` (per project convention)
- No queries exist in components or pages — data flows via props
- `sanity:client` virtual module auto-configures from `astro.config.mjs` — changing `dataset` there propagates to all `sanityClient.fetch()` calls
- The `loadQuery<T>()` wrapper handles Visual Editing perspective + stega — no changes needed there
- `getStaticPaths` in page routes uses `sanityClient.fetch()` directly (not `loadQuery`) — these calls must pass `getSiteParams()` explicitly as the second argument

### Previous Story Learnings (15.1 + 15.2)

**From 15.1 (Dataset & Schema):**
- The `site` field exists on 6 document types: `page`, `sponsor`, `project`, `testimonial`, `event`, `siteSettings`
- `submission` type deliberately excluded (capstone-only)
- Schema changes are backwards-compatible — `site` field is optional on production dataset

**From 15.2 (Studio Multi-Workspace):**
- `createSchemaTypesForWorkspace()` pattern solved runtime dataset detection for Studio — but Astro uses static `import.meta.env` replacement, which is simpler
- Constants in `studio/src/constants.ts`: `SITE_AWARE_TYPES`, `RWC_SITES`, `RWC_SINGLETON_IDS` — reference these for site-aware type list
- RWC siteSettings use document IDs `siteSettings-rwc-us` and `siteSettings-rwc-intl` — the SITE_SETTINGS_QUERY must filter by `_id` on rwc dataset
- 531 tests passing after 15.2 — baseline for regression testing

**Key gotcha from 15.1:** The `hidden` callback does NOT have `context.getClient()`. This is a Studio concern (solved in 15.2) and does not affect Astro queries. But be aware that schema field visibility is workspace-specific.

### Git Intelligence

Recent commits (last 3 on this branch):
- `3b15d81` fix: address second code review findings for multi-workspace config
- `80b626c` fix: address code review findings for multi-workspace config
- `70d5f22` feat: add multi-workspace Studio configuration for Capstone and RWC

These are all 15.2 commits. Story 15.3 starts fresh from this base.

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-15-multi-site-infrastructure.md#Story 15.3]
- [Source: _bmad-output/planning-artifacts/architecture.md — Multi-Site Architecture section]
- [Source: _bmad-output/project-context.md#Data Fetching Patterns]
- [Source: _bmad-output/project-context.md#GROQ Query Rules]
- [Source: _bmad-output/implementation-artifacts/15-1-create-rwc-dataset-deploy-schemas.md]
- [Source: _bmad-output/implementation-artifacts/15-2-studio-multi-workspace-configuration.md]
- [Source: Sanity MCP Rules — sanity-groq, sanity-astro, sanity-typegen]
- [Source: /sanity-best-practices — GROQ Performance, Schema Design, TypeGen rules]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- TypeGen failed with `getSiteFilter()` function interpolation in template literals (predicted in Dev Notes). Error: "Unsupported expression type: BlockStatement". Switched to always-present filter pattern per fallback strategy.

### Completion Notes List

- **Task 1:** Added `PUBLIC_SANITY_DATASET` and `PUBLIC_SITE_ID` env vars to `.env` and `.env.example`. Created `DATASET`, `SITE_ID`, `isMultiSite` module-level constants, `getSiteFilter()`, `getSiteParams()`, and `getSiteSettingsId()` utilities in `sanity.ts`. Reordered `astro.config.mjs` dataset fallback chain to prefer `PUBLIC_SANITY_DATASET`.
- **Task 2-3:** Parameterized all 13 list/detail queries with the always-present site filter: `&& ($site == "" || site == $site)`. Nested sub-queries in `SPONSOR_BY_SLUG_QUERY` (projects) and `PROJECT_BY_SLUG_QUERY` (testimonials) also site-filtered to prevent cross-site data leakage.
- **Task 4:** Updated `SITE_SETTINGS_QUERY` to use `_id == $siteSettingsId` for deterministic per-site singleton lookup. `getSiteSettings()` now passes `siteSettingsId` param.
- **Task 5:** All fetch helpers (`getAllSponsors`, `getSponsorBySlug`, `getAllProjects`, `getProjectBySlug`, `getAllTestimonials`, `getAllEvents`, `getEventBySlug`, `prefetchPages`, `getPage`) now merge `getSiteParams()`. All `getStaticPaths` in page routes pass `getSiteParams()` to `sanityClient.fetch()`.
- **Task 6:** TypeGen initially failed with function interpolation (as predicted). Switched to always-present filter pattern. TypeGen now succeeds: 14 queries, 49 schema types. `getSiteParams()` updated to always return `{ site: "" }` for production (required by always-present filter).
- **Task 7:** All 542 tests pass (47 test files, 0 failures). 11 new tests added for `getSiteFilter()`, `getSiteParams()` (production + rwc variants), `SITE_SETTINGS_QUERY _id` filter, always-present site filter on all 13 list/detail queries, and nested sub-query site filtering. Build succeeds with default env vars.

### Change Log

- 2026-02-28: Story 15.3 implemented — multi-site data fetching with always-present GROQ filter pattern
- 2026-02-28: Code review fixes — 6 issues resolved (1 HIGH, 2 MEDIUM, 3 LOW)

### Code Review Record

**Reviewer:** Amelia (Dev Agent — Code Review mode)
**Date:** 2026-02-28
**Outcome:** Approved after fixes

| ID | Severity | Description | Resolution |
|---|---|---|---|
| H1 | HIGH | Missing `vite.define` for `PUBLIC_SANITY_DATASET` and `PUBLIC_SITE_ID` — would cause silent data isolation failure on CF Pages for RWC sites | Fixed: added both vars to `vite.define` in `astro.config.mjs` |
| M1 | MEDIUM | 4 unrelated files committed with story (`docs/cloudflare-guide.md`, `docs/vps-migration-plan.md`, `package-lock.json`, `studio/package.json`) | Acknowledged — cannot fix without git history rewrite; documented here |
| M2 | MEDIUM | Dead export `getSiteFilter()` — never called outside tests after TypeGen fallback switch | Fixed: removed function and its tests |
| L1 | LOW | Unnecessary `{ ...getSiteParams() }` spread in 4 single-param fetch helpers | Fixed: simplified to `getSiteParams()` |
| L2 | LOW | Story File List claimed `.env` modified but unverifiable via git | Fixed: updated File List to note gitignored status |
| L3 | LOW | `getSiteSettings()` test didn't verify `siteSettingsId` param was passed | Fixed: added `toHaveBeenCalledWith` assertion |

### File List

| File | Action |
|---|---|
| `astro-app/.env` | Modified — added `PUBLIC_SANITY_DATASET` and `PUBLIC_SITE_ID` (gitignored, not in git diff) |
| `astro-app/.env.example` | Modified — added multi-site env var documentation |
| `astro-app/astro.config.mjs` | Modified — reordered dataset fallback, added `PUBLIC_SANITY_DATASET` and `PUBLIC_SITE_ID` to `vite.define` |
| `astro-app/src/lib/sanity.ts` | Modified — site context constants, `getSiteParams()`, `getSiteSettingsId()`, all 14 queries parameterized with always-present filter, all fetch helpers pass site params |
| `astro-app/src/lib/__tests__/sanity.test.ts` | Modified — fixed 2 existing test expectations for new `site` param, added 9 new tests for multi-site utilities and query patterns, added `siteSettingsId` param assertion |
| `astro-app/src/pages/[...slug].astro` | Modified — import `getSiteParams`, pass to `sanityClient.fetch()` in `getStaticPaths` |
| `astro-app/src/pages/sponsors/[slug].astro` | Modified — import `getSiteParams`, pass to `sanityClient.fetch()` in `getStaticPaths` |
| `astro-app/src/pages/projects/[slug].astro` | Modified — import `getSiteParams`, pass to `sanityClient.fetch()` in `getStaticPaths` |
| `astro-app/src/pages/events/[slug].astro` | Modified — import `getSiteParams`, pass to `sanityClient.fetch()` in `getStaticPaths` |
| `astro-app/src/sanity.types.ts` | Regenerated — by `npm run typegen` after query changes |
| `_bmad-output/implementation-artifacts/sprint-status.yaml` | Modified — story status: ready-for-dev → in-progress → review → done |
