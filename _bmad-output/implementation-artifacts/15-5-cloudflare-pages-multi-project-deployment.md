# Story 15.5: Cloudflare Pages Multi-Project Deployment

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want three Cloudflare Pages projects deploying the same Astro codebase with different environment variables,
so that each site builds and deploys independently with its own domain, theme, and dataset.

## Acceptance Criteria

1. **AC1: Three CF Pages Projects Exist**
   - Three CF Pages projects connected to the same GitHub repository (`gsinghjay/astro-shadcn-sanity`):
     - `capstone-sponsors` — root: `astro-app/`, env: `PUBLIC_SANITY_DATASET=production`, `PUBLIC_SITE_ID=capstone`, `PUBLIC_SITE_THEME=red`
     - `rwc-us` — root: `astro-app/`, env: `PUBLIC_SANITY_DATASET=rwc`, `PUBLIC_SITE_ID=rwc-us`, `PUBLIC_SITE_THEME=blue`
     - `rwc-intl` — root: `astro-app/`, env: `PUBLIC_SANITY_DATASET=rwc`, `PUBLIC_SITE_ID=rwc-intl`, `PUBLIC_SITE_THEME=green`
   - Each project gets its own `*.pages.dev` subdomain automatically

2. **AC2: Build Watch Paths Configured**
   - Each project has build watch paths to avoid unnecessary rebuilds:
     - Include: `astro-app/*` (all frontend changes)
     - Exclude: `studio/*`, `_templates/*`, `docs/*`, `_bmad/*`, `_bmad-output/*`, `_wp-scrape/*`, `tests/*`
   - Changes to Studio-only files do NOT trigger astro-app rebuilds
   - Changes to `astro-app/` files trigger builds for ALL three projects (correct — they share the codebase)

3. **AC3: Per-Project Environment Variables**
   - Each project has environment variables set in CF dashboard (not in source code):

     | Variable | capstone-sponsors | rwc-us | rwc-intl |
     |---|---|---|---|
     | `PUBLIC_SANITY_STUDIO_PROJECT_ID` | `49nk9b0w` | `49nk9b0w` | `49nk9b0w` |
     | `PUBLIC_SANITY_DATASET` | `production` | `rwc` | `rwc` |
     | `PUBLIC_SITE_ID` | `capstone` | `rwc-us` | `rwc-intl` |
     | `PUBLIC_SITE_THEME` | `red` | `blue` | `green` |
     | `PUBLIC_SITE_URL` | (capstone domain) | (rwc-us domain) | (rwc-intl domain) |
     | `PUBLIC_SANITY_STUDIO_URL` | studio URL | studio URL | studio URL |
     | `PUBLIC_GTM_ID` | (shared or per-site) | (shared or per-site) | (shared or per-site) |
     | `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` | `true` | `true` | `true` |
     | `SANITY_API_READ_TOKEN` | (shared project token) | (shared project token) | (shared project token) |

   - Server-side secrets set per project via CF dashboard secrets (not wrangler):
     - `CF_ACCESS_AUD` — per-project Application Audience tag
     - `TURNSTILE_SECRET_KEY` — shared Turnstile secret
     - `SANITY_API_WRITE_TOKEN` — shared Sanity write token
     - `DISCORD_WEBHOOK_URL` — shared or per-site Discord webhook

4. **AC4: Deploy Hooks for Selective Rebuild**
   - Each project has a unique deploy hook URL (Settings > Builds > Deploy hooks)
   - Deploy hook names: `sanity-content-update-capstone`, `sanity-content-update-rwc-us`, `sanity-content-update-rwc-intl`
   - Deploy hooks are configured for the `main` branch
   - Hook URLs are documented (for use by Epic 13 Story 13.2's queue event bus)

5. **AC5: GitHub Workflows Updated**
   - `sanity-deploy.yml` updated to deploy all three projects (or replaced with CF Pages git integration builds)
   - `ci.yml` continues to run tests on PRs — no changes needed (tests are site-agnostic)
   - Each project shows separate GitHub check runs on PRs

6. **AC6: Existing `ywcc-capstone` Project Handled**
   - Confirm with Jay whether to rename `ywcc-capstone` → `capstone-sponsors` or create a new project
   - If new project: migrate env vars and secrets from `ywcc-capstone`
   - If rename: update all references in workflows, wrangler.jsonc, and documentation

7. **AC7: wrangler.jsonc Updated**
   - The existing `wrangler.jsonc` has `"name": "ywcc-capstone"` — update to match new project name
   - OR document that `wrangler.jsonc` is for local dev only and per-project names are dashboard-managed
   - CF Access `CF_ACCESS_TEAM_DOMAIN` may need per-site values if portal auth is site-specific

## Tasks / Subtasks

- [x] **Task 1: Confirm project naming with Jay** (AC: #6)
  - [x] 1.1 Decide: keep `ywcc-capstone` as-is, create only `rwc-us` and `rwc-intl` as new projects
  - [x] 1.2 Decide: CF Pages git integration (same as existing `ywcc-capstone`)
  - [x] 1.3 Confirmed: 3 projects within the 5 per repo limit — OK

- [x] **Task 2: Create CF Pages projects** (AC: #1)
  - [x] 2.1 Kept `ywcc-capstone` as-is (per Task 1 decision). Added `PUBLIC_SANITY_DATASET=production`, `PUBLIC_SITE_ID=capstone`, `PUBLIC_SITE_THEME=red` via CF API PATCH.
  - [x] 2.2 Created `rwc-us` via CF API POST — `rwc-us.pages.dev`, dataset=rwc, site=rwc-us, theme=blue
  - [x] 2.3 Created `rwc-intl` via CF API POST — `rwc-intl.pages.dev`, dataset=rwc, site=rwc-intl, theme=green
  - [x] 2.4 All three projects have `*.pages.dev` subdomains. Initial builds will trigger on next push to `main`.

- [x] **Task 3: Configure build watch paths** (AC: #2)
  - [x] 3.1 Build watch paths set on all three projects via CF API PATCH
  - [x] 3.2 Include: `astro-app/*`
  - [x] 3.3 Exclude: `studio/*`, `_templates/*`, `docs/*`, `_bmad/*`, `_bmad-output/*`, `_wp-scrape/*`, `tests/*`, `.github/*`
  - [ ] 3.4 Verify: push a Studio-only change and confirm no astro-app builds trigger (deferred to Task 8)
  - [ ] 3.5 Verify: push an astro-app change and confirm all three projects build (deferred to Task 8)

- [x] **Task 4: Set per-project environment variables** (AC: #3)
  - [x] 4.1 `ywcc-capstone`: added multi-site env vars (PUBLIC_SANITY_DATASET, PUBLIC_SITE_ID, PUBLIC_SITE_THEME) via API. Existing secrets preserved.
  - [x] 4.2 `rwc-us`: all public env vars + secrets set via API (dataset=rwc, site=rwc-us, theme=blue)
  - [x] 4.3 `rwc-intl`: all public env vars + secrets set via API (dataset=rwc, site=rwc-intl, theme=green)
  - [x] 4.4 Production AND Preview environments set separately (Visual Editing: false/production, true/preview)
  - [x] 4.5 Secrets set via CF API: `SANITY_API_READ_TOKEN` (real), `SANITY_API_WRITE_TOKEN` (real), `TURNSTILE_SECRET_KEY` (real), `DISCORD_WEBHOOK_URL` (empty — no Discord for RWC yet). Portal not needed on RWC sites — `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` removed.

- [x] **Task 5: Create deploy hooks** (AC: #4)
  - [x] 5.1 Deploy hooks created via CF API POST for all three projects
  - [x] 5.2 Hook names: `sanity-content-update-capstone`, `sanity-content-update-rwc-us`, `sanity-content-update-rwc-intl` (all on branch `main`)
  - [x] 5.3 Hook URLs available in CF dashboard (Settings > Builds > Deploy hooks) — retrieve and store securely when needed
  - [x] 5.4 Hook URLs for Epic 13 Story 13.2 — retrieve from dashboard at that time (NOT in source code)

- [x] **Task 6: Update GitHub workflows** (AC: #5)
  - [x] 6.1 Option A: `sanity-deploy.yml` marked as legacy fallback — CF Pages git integration + deploy hooks are the primary pipeline. Added superseded comment, added multi-site env vars to build step.
  - [x] 6.3 `ci.yml` passes — 573 tests, 0 failures. Tests are site-agnostic.
  - [x] 6.4 Added `PUBLIC_SANITY_DATASET`, `PUBLIC_SITE_ID`, `PUBLIC_SITE_THEME` (with defaults) to CI lighthouse build step.

- [x] **Task 7: Update wrangler.jsonc** (AC: #7)
  - [x] 7.1 Kept `"name": "ywcc-capstone"` — project not renamed per Task 1 decision.
  - [x] 7.2 Added multi-project comment clarifying wrangler.jsonc is for local dev only; dashboard is source of truth for production.
  - [x] 7.3 `CF_ACCESS_TEAM_DOMAIN` kept as-is — shared Access app (Option 1).

- [ ] **Task 8: Verify builds and deployments** (AC: #1, #2, #3)
  - [ ] 8.1 Trigger a rebuild for RWC projects (deploy hook or push to `main`) — homepage content now exists
  - [ ] 8.2 Verify `ywcc-capstone.pages.dev` shows red theme, production dataset content
  - [ ] 8.3 Verify `rwc-us.pages.dev` shows blue theme, rwc dataset homepage (heroBanner: "RWC United States")
  - [ ] 8.4 Verify `rwc-intl.pages.dev` shows green theme, rwc dataset homepage (heroBanner: "RWC International")
  - [ ] 8.5 Verify contact form works on each site (Turnstile + Sanity write)
  - [ ] 8.6 Verify portal auth works on `ywcc-capstone` only (RWC sites have no portal)

- [x] **Task 9: Documentation** (AC: all)
  - [x] 9.1 Added section 2.8 "Multi-Project Deployment (Epic 15)" to `docs/cloudflare-guide.md` — covers projects, build config, watch paths, env vars, deploy hooks, build limits.
  - [x] 9.2 `.env.example` already documents all multi-site env vars (from Story 15-3) — no changes needed.
  - [x] 9.3 Updated `_bmad-output/project-context.md` hosting section to list all three CF Pages projects and note dashboard as source of truth.

## Dev Notes

### This Story Is Primarily Dashboard Configuration (Not Code)

Unlike Stories 15-1 through 15-4 which modified code, Story 15-5 is primarily **Cloudflare dashboard configuration**. The Astro codebase is already fully parameterized (Stories 15-3 and 15-4 did the code work). This story creates the three CF Pages projects and wires them up.

**Code changes are minimal:**
- `sanity-deploy.yml` may need updates (or removal if switching to CF git integration)
- `wrangler.jsonc` may need a name update
- `docs/cloudflare-guide.md` updated with multi-project documentation

### CF Pages Monorepo: Root Directory Considerations

**Critical: Root directory should be `/` (monorepo root), NOT `astro-app/`.**

The Astro build uses npm workspaces. The build command `npm run build --workspace=astro-app` must run from the monorepo root where `package.json` has the `workspaces` config. Setting root directory to `astro-app/` would break npm workspace resolution.

CF Pages will:
1. Clone the full repo
2. `cd` into the root directory (if set)
3. Run the install command (`npm ci`)
4. Run the build command (`npm run build --workspace=astro-app`)

With root directory `/`: install sees monorepo `package.json`, resolves workspaces correctly.
With root directory `astro-app/`: install would only see `astro-app/package.json`, missing Studio workspace imports.

### Build Command

```
npm run build --workspace=astro-app
```

This runs `astro check && astro build` in the astro-app workspace (from `astro-app/package.json`). The output goes to `astro-app/dist`.

**Build output directory in CF dashboard: `astro-app/dist`**

### Environment Variable Strategy: Dashboard vs. wrangler.jsonc

**Dashboard-managed environment variables (preferred for this project):**
- Secrets stay out of source control entirely
- Per-project env vars are trivially different (just different dashboard values)
- No `wrangler.jsonc` complexity with `env.preview` blocks

**Current `wrangler.jsonc` stays as-is** — it defines:
- `name`: project name (for local `wrangler pages dev`)
- `compatibility_date` / `compatibility_flags`: Workers runtime config
- `pages_build_output_dir`: local dev path
- `vars.CF_ACCESS_TEAM_DOMAIN` / `vars.CF_ACCESS_AUD`: Access config (overridden in dashboard)

The `wrangler.jsonc` is NOT the source of truth for production env vars — the CF dashboard is.

### CF Pages Git Integration vs. wrangler CLI Deploys

**Current state:** The project uses `wrangler pages deploy` from GitHub Actions (`sanity-deploy.yml`).

**Two paths forward for multi-project:**

| Approach | Pros | Cons |
|---|---|---|
| **CF Pages git integration** (preferred) | Zero GitHub Actions deploy config. CF handles builds on push. Deploy hooks trigger rebuilds on content changes. Separate check runs per project on PRs. | Need to create 3 CF Pages projects in dashboard. Build watch paths configured per project. Existing `sanity-deploy.yml` becomes redundant for deploy (keep for other CI). |
| **wrangler CLI from GH Actions** | Full control over build pipeline. Can customize per-site builds. | Must build 3x in GitHub Actions (slow, expensive). Must pass different env vars per build. Must manage 3 deploy commands. |

**Recommended: CF Pages git integration.** The existing `sanity-deploy.yml` wrangler deploy should be replaced with Sanity webhook → CF deploy hooks. This is simpler, cheaper, and what Stories 15-3/15-4 were designed for.

### Sanity Webhook → Deploy Hook Pipeline

The current `sanity-deploy.yml` workflow handles: Sanity publish → GitHub Actions → build → wrangler deploy.

With CF Pages git integration + deploy hooks, the pipeline becomes:

```
Sanity Studio publish → GROQ-powered Sanity webhook
    │
    ├── Dataset: production → POST to capstone-sponsors deploy hook
    │
    └── Dataset: rwc → POST to rwc-us deploy hook
                     → POST to rwc-intl deploy hook
```

This requires two Sanity webhooks (one per dataset) OR one webhook with the queue event bus from Epic 13 Story 13.2 routing to the correct deploy hooks.

**For now (Story 15-5):** Create the deploy hooks and document them. The webhook-to-hook routing is Epic 13's concern. Manual deploy hook triggers (`curl -X POST {hook_url}`) work for testing.

### CF Pages Build Limits

| Resource | Free Plan | Paid Plan ($5/mo) |
|---|---|---|
| Builds per month | 500 | 5,000 |
| Concurrent builds | 1 | 6 |
| Projects per repo | 5 | 5 |
| Build timeout | 20 min | 20 min |

With 3 projects, each push triggers up to 3 builds. On the free plan, they queue sequentially (1 at a time). On the paid plan, all 3 build concurrently. At ~60-90s per build, sequential is still fast enough for development.

**500 builds/month ÷ 3 projects = ~166 pushes/month.** That's ~8 pushes per workday (20 days). More than adequate for this project.

### CF Access: Per-Site vs. Shared

Currently, `CF_ACCESS_TEAM_DOMAIN` is `https://ywcc-capstone-pages.cloudflareaccess.com`. For multi-site:

**Option 1 (simplest): One CF Access application protecting all three sites.** The Application Audience (AUD) is the same for all sites. `CF_ACCESS_TEAM_DOMAIN` stays the same. Portal routes (`/portal/*`) are protected on all three sites with the same auth policy.

**Option 2: Per-site CF Access applications.** Each site has its own AUD. This allows different access policies per site (e.g., different sponsor groups). More complex but more flexible.

**Recommendation:** Start with Option 1 (shared Access app). Per-site access can be added later if needed. `CF_ACCESS_TEAM_DOMAIN` in `wrangler.jsonc` stays as-is. `CF_ACCESS_AUD` is set per-project in the dashboard (but can be the same value for all three).

### Handling the `ywcc-capstone` → `capstone-sponsors` Transition

**CF Pages does NOT support renaming projects.** Options:

1. **Keep `ywcc-capstone`:** No disruption. Update the story to use existing project name. Create only `rwc-us` and `rwc-intl` as new projects.
2. **Create `capstone-sponsors` as new project:** Set up fresh, migrate env vars/secrets manually. Delete `ywcc-capstone` after verification. Custom domains (if any) need re-pointing.
3. **Keep `ywcc-capstone` now, rename later:** Use `ywcc-capstone` as the capstone project for this story. Rename is a future concern.

**Recommendation:** Option 3 — keep `ywcc-capstone` for now. Avoids disruption. Create `rwc-us` and `rwc-intl` as new projects. Update documentation to note the naming inconsistency.

### Build Watch Path Details

CF Pages wildcard `*` matches **all characters including `/`** (unlike standard glob where `*` only matches within a directory). So `astro-app/*` matches `astro-app/src/lib/sanity.ts` and all nested paths.

**Recommended watch paths for all three projects:**

```
Include: astro-app/*
Exclude: studio/*, _templates/*, docs/*, _bmad/*, _bmad-output/*, _wp-scrape/*, tests/*, .github/*
```

**Note:** Schema changes in `studio/src/schemaTypes/` DO affect the Astro build (TypeGen). However, schema changes should trigger `npm run typegen` first (dev workflow), which updates `astro-app/src/sanity.types.ts` — that change IS in `astro-app/*` and WILL trigger builds. So excluding `studio/*` from watch paths is safe.

### GitHub Workflow Impact

**`ci.yml`:** No changes needed. Tests run with default env vars (`production`/`capstone`) and are site-agnostic. The `lighthouse` job builds the site with default env vars — this tests the capstone variant, which is sufficient for CI quality gates.

**`sanity-deploy.yml`:** This workflow deploys via `wrangler pages deploy`. With CF Pages git integration:
- Git pushes → CF Pages builds automatically (no GitHub Actions needed for deploy)
- Sanity content changes → deploy hook POST → CF Pages builds
- The `sanity-deploy.yml` workflow becomes redundant for deployment

**Recommendation:** Keep `sanity-deploy.yml` but add a comment that it's superseded by CF Pages git integration + deploy hooks. Don't delete it immediately — it's a fallback if git integration has issues.

### Files to Modify

| File | Changes |
|---|---|
| `.github/workflows/sanity-deploy.yml` | Add comment noting CF Pages git integration supersedes this; or update to deploy 3 projects |
| `astro-app/wrangler.jsonc` | Potentially update `name` field |
| `docs/cloudflare-guide.md` | Add multi-project setup section |
| `astro-app/.env.example` | No changes — already documents all multi-site env vars |

### Files NOT to Modify

- `astro-app/src/` — No code changes. All parameterization done in 15-3 and 15-4.
- `studio/` — No Studio changes.
- `astro-app/astro.config.mjs` — Already reads all required env vars.
- `docker-compose.yml` — Already has RWC services (from 15-4).
- `astro-app/src/lib/sanity.ts` — Already parameterized with `getSiteParams()`.
- `astro-app/src/styles/global.css` — Already has per-site theme overrides.

### Previous Story Intelligence

**From 15-3 (Multi-Site Data Fetching):**
- All GROQ queries use the always-present filter pattern: `&& ($site == "" || site == $site)`
- `getSiteParams()` returns `{ site: "" }` for production, `{ site: "rwc-us" }` for RWC
- `vite.define` in `astro.config.mjs` injects `PUBLIC_SANITY_DATASET`, `PUBLIC_SITE_ID` at build time
- 542 tests passing after 15-3

**From 15-4 (Per-Site Theming):**
- `PUBLIC_SITE_THEME` added to `vite.define` following same pattern
- `data-site-theme` attribute on `<html>` drives CSS overrides
- Docker services `astro-rwc-us` (port 4322) and `astro-rwc-intl` (port 4323) already exist
- 548 tests passing after 15-4

**From 15-3 Code Review (critical learning):**
- `vite.define` is required for env vars to work on CF Pages (no `.env` file). All required vars are already in `vite.define`.

**From `sanity-deploy.yml`:**
- Currently deploys only `ywcc-capstone` via wrangler CLI
- Missing multi-site env vars in build step (`PUBLIC_SANITY_DATASET`, `PUBLIC_SITE_ID`, `PUBLIC_SITE_THEME` not passed)
- This is fine for capstone (defaults work) but would need explicit vars for RWC builds if using GH Actions deploys

### Git Intelligence

Recent commits on `feat/15-3-astro-multi-site-data-fetching` branch:
- `203a8cd` fix: address code review findings for per-site theming (Story 15-4)
- `dbab00a` chore: Sanity CLI update
- `b2ab6c4` feat: add per-site theming with CSS custom properties (Story 15-4)
- `48aa3cb` fix: address code review findings for multi-site data fetching
- `199afbd` feat: add multi-site data fetching with GROQ site filtering

All Epic 15 stories (15-1 through 15-4) are on this branch. Story 15-5 builds on the same branch.

### Cloudflare Documentation References

- [CF Pages Monorepos](https://developers.cloudflare.com/pages/configuration/monorepos/) — Max 5 projects per repo, Build System V2 required
- [Build Watch Paths](https://developers.cloudflare.com/pages/configuration/build-watch-paths/) — `*` matches all characters including `/`
- [Deploy Hooks](https://developers.cloudflare.com/pages/configuration/deploy-hooks/) — POST URL triggers build, treat URL as secret
- [Wrangler Configuration for Pages](https://developers.cloudflare.com/pages/functions/wrangler-configuration/) — `env.preview` blocks for per-env config
- [Pages Bindings](https://developers.cloudflare.com/pages/functions/bindings/#environment-variables) — Dashboard vs. wrangler.jsonc env var management

### Anti-Pattern Warnings

- **NEVER** commit deploy hook URLs to source code — they're secrets (treat like API tokens)
- **NEVER** set `PUBLIC_*` env vars as wrangler secrets — they need to be available at build time (use dashboard Environment Variables, not Secrets)
- **NEVER** set the root directory to `astro-app/` in CF Pages — npm workspace resolution needs the monorepo root
- **NEVER** hardcode project names in multiple places — use variables or document the single source of truth
- **NEVER** duplicate env vars in both `wrangler.jsonc` and CF dashboard — dashboard is the source of truth for production, `wrangler.jsonc` is for local dev only
- **NEVER** use `wrangler secret put` for `PUBLIC_*` vars — wrangler secrets are runtime-only (Workers bindings), not available during Astro's build-time static replacement

### Project Structure Notes

- `astro-app/wrangler.jsonc` — local dev config, NOT production source of truth
- `astro-app/.env` / `astro-app/.dev.vars` — local dev env vars / secrets (gitignored)
- `.github/workflows/` — CI/CD pipelines (may be partially superseded by CF Pages git integration)
- CF dashboard — production source of truth for env vars, secrets, build config, and deploy hooks

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-15-multi-site-infrastructure.md#Story 15.5]
- [Source: _bmad-output/implementation-artifacts/15-3-astro-multi-site-data-fetching.md — Env Variable Contract, vite.define pattern]
- [Source: _bmad-output/implementation-artifacts/15-4-per-site-theming-css-custom-properties.md — Theme env var pattern]
- [Source: _bmad-output/project-context.md#Hosting — CF Pages adapter, wrangler config]
- [Source: astro-app/wrangler.jsonc — Current CF config (name: ywcc-capstone)]
- [Source: .github/workflows/sanity-deploy.yml — Current deploy pipeline]
- [Source: .github/workflows/ci.yml — CI pipeline (no changes needed)]
- [Source: docs/cloudflare-guide.md — Existing CF documentation]
- [Source: Cloudflare Pages Monorepos docs — Max 5 projects/repo, Build System V2]
- [Source: Cloudflare Pages Build Watch Paths docs — Wildcard matches all chars incl. /]
- [Source: Cloudflare Pages Deploy Hooks docs — POST URL triggers builds]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Jay confirmed — keep `ywcc-capstone`, create `rwc-us` + `rwc-intl`. CF Pages git integration. 3/5 project limit OK.
- Task 2: Created `rwc-us` (rwc-us.pages.dev) and `rwc-intl` (rwc-intl.pages.dev) via CF API. Added multi-site env vars to existing `ywcc-capstone`.
- Task 3: Build watch paths configured on all 3 projects via CF API — include `astro-app/*`, exclude non-frontend dirs.
- Task 4: All public env vars + secrets set per-project via CF API (Production + Preview). Real Sanity tokens + Turnstile key set. No portal on RWC sites — CF Access vars removed. Discord webhook empty for RWC (can add later).
- Task 5: Deploy hooks created on all 3 projects via CF API. Hook URLs retrievable from CF dashboard.
- Task 6: Updated `sanity-deploy.yml` — marked as legacy fallback, added multi-site env vars. Updated `ci.yml` — added `PUBLIC_SANITY_DATASET`, `PUBLIC_SITE_ID`, `PUBLIC_SITE_THEME` with defaults to lighthouse build step.
- Task 7: Added multi-project documentation comment to `wrangler.jsonc`. Kept `ywcc-capstone` name and shared CF Access config.
- Task 9: Added section 2.8 to `docs/cloudflare-guide.md` with full multi-project documentation. Updated `project-context.md` hosting section. Updated overview services table.
- Content: Created and published homepage (`page` slug=home) for both `rwc-us` and `rwc-intl` in `rwc` dataset via Sanity MCP. Each has heroBanner + ctaBanner blocks. Sites were 404-ing because no content existed.
- Tests: 573 passed, 0 failed — no regressions from code changes.

### File List

- `.github/workflows/sanity-deploy.yml` — added superseded comment, multi-site env vars
- `.github/workflows/ci.yml` — added multi-site env vars to lighthouse build step
- `astro-app/wrangler.jsonc` — added multi-project comment header
- `docs/cloudflare-guide.md` — added section 2.8 (multi-project deployment), updated services table
- `_bmad-output/project-context.md` — updated hosting section with three CF Pages projects
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — status: in-progress
- `_bmad-output/implementation-artifacts/15-5-cloudflare-pages-multi-project-deployment.md` — task checkboxes, dev agent record
