# Story 5.5: Cloudflare Native Preview Deployments

Status: in-progress

## Story

As a developer,
I want the deployment pipeline migrated from GitHub Actions direct upload with a dedicated `preview` branch to Cloudflare Pages git integration with native preview deployments,
So that preview and production environments are managed by Cloudflare's built-in branch deployment system, eliminating the `preview` branch, `sync-main.yml`, double builds, and the `.env` writing hack.

## Acceptance Criteria

1. **AC1 — Git integration active:** The Cloudflare Pages project is connected to the GitHub repository via Cloudflare's git integration (not direct upload via `wrangler pages deploy`).
2. **AC2 — Production deploys on main:** Pushing to `main` triggers an automatic Cloudflare Pages production build with `output: "static"` and Visual Editing disabled.
3. **AC3 — Preview deploys on PRs/branches:** Pushing to any non-`main` branch or opening a PR automatically creates a Cloudflare Pages preview deployment with `output: "server"` and Visual Editing enabled, accessible at `<branch>.ywcc-capstone.pages.dev`.
4. **AC4 — Environment separation:** Production and Preview environment variables are configured in the Cloudflare Pages dashboard (not written via `.env` hack in CI). `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` is empty/unset in Production and `"true"` in Preview.
5. **AC5 — No preview branch:** The permanent `preview` branch is deleted. Development uses feature branches merged to `main` via PRs.
6. **AC6 — No sync workflow:** `.github/workflows/sync-main.yml` is deleted.
7. **AC7 — Deploy workflow converted to CI-only:** `.github/workflows/deploy.yml` is replaced with a `.github/workflows/ci.yml` that runs tests and linting on PRs only — it does NOT deploy. Cloudflare handles all deployments.
8. **AC8 — Sanity webhook functional:** The Sanity webhook → Cloudflare deploy hook for production rebuilds on content publish still works (reconfigured for new project if needed).
9. **AC9 — Studio Presentation tool works:** The Sanity Studio Presentation tool can iframe a preview deployment URL and Visual Editing overlays function correctly (click-to-edit, stega encoding, live draft content).
10. **AC10 — Build succeeds:** `npm run build` in `astro-app/` completes without errors for both static (production) and SSR (preview) configurations via Cloudflare's build system.
11. **AC11 — Monorepo build works:** Cloudflare Pages correctly builds the `astro-app/` workspace in the monorepo, resolving all workspace dependencies.
12. **AC12 — Single build per commit:** Each push triggers exactly one Cloudflare build (not two like the current architecture).

## Current State Analysis

### Architecture: What Exists Today

```
Push to preview branch
  ├─→ deploy.yml → SSR build → wrangler pages deploy --branch=preview
  │     (Preview deployment at preview.ywcc-capstone.pages.dev)
  │
  └─→ sync-main.yml → fast-forward main to same commit
        └─→ deploy.yml fires AGAIN → static build → wrangler pages deploy (production)
              (Production deployment at ywcc-capstone.pages.dev)
```

**Problems:**
- 2 builds per commit (consumes 2 of 500 free monthly builds)
- `preview` branch code is always identical to `main` — only env vars differ
- `sync-main.yml` fast-forward is fragile (fails if `main` diverges)
- `.env` file written in CI is a hack to work around Vite's `loadEnv()` not reading `process.env`
- No PR-based preview deployments — only the single `preview` branch gets one

### Target Architecture

```
Push to main (merge PR)
  └─→ Cloudflare Pages Build (Production environment)
        ENV: PUBLIC_SANITY_VISUAL_EDITING_ENABLED = (unset)
        output: "static"
        → ywcc-capstone.pages.dev

Push to any branch / open PR
  └─→ Cloudflare Pages Build (Preview environment)
        ENV: PUBLIC_SANITY_VISUAL_EDITING_ENABLED = "true"
        output: "server"
        → <branch>.ywcc-capstone.pages.dev
```

### Files to REMOVE

| File | Reason |
|------|--------|
| `.github/workflows/sync-main.yml` | Branch sync no longer needed |
| `.github/workflows/deploy.yml` | Replace with `ci.yml` (tests/lint only, no deploy) |

### Files to MODIFY

| File | Change |
|------|--------|
| `astro-app/astro.config.mjs` | Add `process.env` fallback for env var reading |
| `astro-app/package.json` | Update/add build command wrapper if needed |
| `astro-app/wrangler.jsonc` | Verify compatibility with git integration builds |

### Files NOT to touch

- `astro-app/src/lib/sanity.ts` — uses `import.meta.env` which Vite inlines at build time (works regardless of how env vars are provided)
- `astro-app/src/layouts/Layout.astro` — no changes needed
- `studio/` — no Studio changes
- `astro-app/src/components/` — no component changes

### Environment Variables Inventory

**Currently in GitHub Actions Secrets:**
- `CLOUDFLARE_API_TOKEN` → No longer needed in GitHub (Cloudflare builds internally)
- `CLOUDFLARE_ACCOUNT_ID` → No longer needed in GitHub
- `SANITY_API_READ_TOKEN` → Move to Cloudflare Pages dashboard (both environments)

**Currently in GitHub Actions Variables:**
- `PUBLIC_SANITY_STUDIO_PROJECT_ID` → Move to Cloudflare Pages dashboard (both environments)
- `PUBLIC_SANITY_STUDIO_DATASET` → Move to Cloudflare Pages dashboard (both environments)
- `PUBLIC_GA_MEASUREMENT_ID` → Move to Cloudflare Pages dashboard (both environments)
- `PUBLIC_SITE_URL` → Move to Cloudflare Pages dashboard (both environments)

**Not currently in GitHub (set dynamically):**
- `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` → Set to `"true"` in Preview, unset in Production (Cloudflare dashboard)

## Tasks / Subtasks

- [x] Task 1: Create new Cloudflare Pages project with git integration (AC: #1, #11)
  - [x] 1.1: In Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git
  - [x] 1.2: Select the `gsinghjay/astro-shadcn-sanity` GitHub repository
  - [x] 1.3: Configure build settings:
    - Production branch: `main`
    - Build command: see Dev Notes "Build Command" section
    - Build output directory: `astro-app/dist` (or `dist` if root dir is `astro-app`)
    - Root directory: see Dev Notes "Monorepo Configuration" section
  - [x] 1.4: Set project name to `ywcc-capstone` (delete old project first if name collision — see Dev Notes)
  - [x] 1.5: Verify initial build triggers and completes successfully

- [x] Task 2: Configure environment variables in Cloudflare dashboard (AC: #4)
  - [x] 2.1: Navigate to project → Settings → Environment Variables
  - [x] 2.2: Add Production environment variables:
    - `PUBLIC_SANITY_STUDIO_PROJECT_ID` = `49nk9b0w`
    - `PUBLIC_SANITY_STUDIO_DATASET` = `production`
    - `PUBLIC_GA_MEASUREMENT_ID` = (GA4 measurement ID)
    - `PUBLIC_SITE_URL` = `https://ywcc-capstone.pages.dev`
    - `SANITY_API_READ_TOKEN` = (encrypted, from existing secret)
    - `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` = (leave EMPTY or do not set)
  - [x] 2.3: Add Preview environment variables (same as Production except):
    - `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` = `true`
    - `PUBLIC_SITE_URL` = (can differ or use same)
  - [x] 2.4: Verify variables appear correctly in dashboard for both environments

- [x] Task 3: Fix env var reading in astro.config.mjs (AC: #10)
  - [x] 3.1: No code change needed — Vite's `loadEnv()` with `""` prefix reads `process.env` natively. Confirmed by build log showing `output: "server"` from dashboard env vars.
  - [x] 3.2: Local `.env` behavior preserved (no code changed)
  - [x] 3.3: CF Pages build confirmed working with dashboard env vars via `process.env`

- [x] Task 4: Handle build command for monorepo (AC: #10, #11)
  - [x] 4.1: Repo root selected as root directory (Option A from Dev Notes)
  - [x] 4.2: Build command = `npm run build --workspace=astro-app`, output dir = `astro-app/dist`
  - [x] 4.3: N/A (Option A chosen)
  - [x] 4.4: Build completed successfully in CF build environment (confirmed via build log)

- [ ] Task 5: Verify preview deployments (AC: #3, #9)
  - [ ] 5.1: Create a test branch, push it, verify Cloudflare creates a preview deployment
  - [ ] 5.2: Verify preview deployment URL is accessible at `<branch>.ywcc-capstone.pages.dev`
  - [ ] 5.3: Verify preview deployment uses SSR (`output: "server"`) with Visual Editing enabled
  - [ ] 5.4: Verify Sanity Studio Presentation tool can iframe the preview URL
  - [ ] 5.5: Verify click-to-edit overlays work, stega encoding functions correctly
  - [ ] 5.6: Update `studio/.env` `SANITY_STUDIO_PREVIEW_ORIGIN` if preview URL pattern changed

- [ ] Task 6: Verify production deployment (AC: #2)
  - [ ] 6.1: Merge a PR to `main`, verify Cloudflare triggers a production build
  - [ ] 6.2: Verify production build uses `output: "static"` with Visual Editing disabled
  - [ ] 6.3: Verify `ywcc-capstone.pages.dev` serves the static site with HTTPS
  - [ ] 6.4: Verify GA4 script present, CSP meta tag present, security headers present

- [ ] Task 7: Reconfigure Sanity webhook (AC: #8)
  - [ ] 7.1: In Cloudflare Pages → project → Settings → Builds & deployments → Deploy hooks
  - [ ] 7.2: Create a deploy hook named "Sanity Content Publish" for the `main` branch
  - [ ] 7.3: Copy the new deploy hook URL
  - [ ] 7.4: In sanity.io/manage → Project → API → Webhooks → update the existing webhook URL to the new deploy hook
  - [ ] 7.5: Test: publish content in Sanity Studio → verify webhook fires → verify Cloudflare build triggers
  - [ ] 7.6: Verify production site shows published content after rebuild

- [ ] Task 8: Remove old infrastructure (AC: #5, #6, #7)
  - [ ] 8.1: Delete `.github/workflows/sync-main.yml`
  - [ ] 8.2: Delete `.github/workflows/deploy.yml` and create `.github/workflows/ci.yml` (tests/lint on PRs only — see Dev Notes "CI Workflow" section)
  - [ ] 8.3: Delete the `preview` branch locally and remotely: `git push origin --delete preview`
  - [ ] 8.4: Change GitHub default branch to `main` if not already
  - [ ] 8.5: Remove GitHub Actions secrets/variables that are now in Cloudflare dashboard (optional cleanup)
  - [ ] 8.6: Delete the old Cloudflare Pages direct upload project (if new project uses a different name)

- [ ] Task 9: Verify single build per commit (AC: #12)
  - [ ] 9.1: Push a commit to a feature branch — verify exactly 1 Cloudflare build (preview)
  - [ ] 9.2: Merge PR to `main` — verify exactly 1 Cloudflare build (production)
  - [ ] 9.3: Confirm no double-build scenario exists

## Dev Notes

### Critical: Cannot Migrate Direct Upload to Git Integration

From Cloudflare's documentation:

> "If you choose Direct Upload, you cannot switch to Git integration later. You will have to create a new project with Git integration to use automatic deployments."

This means:
1. The existing `ywcc-capstone` project (direct upload) must be **deleted** before creating a new one with the same name, OR
2. Create the new project with a different name (e.g., `ywcc-capstone-v2`) and migrate later

**Recommended approach:**
1. Create new project with git integration using a temporary name
2. Test thoroughly on the new `.pages.dev` URL
3. Once verified, delete the old project
4. Rename or recreate with the original name (if custom domain is attached, handle carefully)

If no custom domain is in use (just `.pages.dev`), the simplest path:
1. Delete the old `ywcc-capstone` project
2. Immediately create new `ywcc-capstone` project with git integration
3. Brief downtime on the `.pages.dev` URL (acceptable for a dev/staging site)

### Monorepo Configuration

The project is a monorepo with npm workspaces:

```
/                          # repo root
├── package.json           # workspaces: ["astro-app", "studio"]
├── package-lock.json      # root lockfile
├── astro-app/             # Astro frontend
│   ├── package.json
│   ├── astro.config.mjs
│   └── dist/              # build output
└── studio/                # Sanity Studio (not deployed here)
```

**Option A — Root directory = repo root (Recommended):**
- Root directory: `/` (repo root, or leave blank)
- Build command: `npm run build --workspace=astro-app`
- Build output directory: `astro-app/dist`
- `npm ci` runs from repo root → resolves all workspaces correctly
- This is the safest option for workspace dependency resolution

**Option B — Root directory = `astro-app/`:**
- Root directory: `astro-app`
- Build command: `npm run build`
- Build output directory: `dist`
- Risk: `npm ci` runs from `astro-app/` which may not resolve workspace dependencies correctly
- Cloudflare's Build System V2 supports monorepos but behavior can be unpredictable

**Go with Option A** unless testing reveals issues.

### Build Command: The loadEnv Problem

**The Problem:**

`astro.config.mjs` reads env vars using Vite's `loadEnv()`:

```javascript
const {
  PUBLIC_SANITY_STUDIO_PROJECT_ID,
  PUBLIC_SANITY_STUDIO_DATASET,
  PUBLIC_SANITY_VISUAL_EDITING_ENABLED,
  // ...
} = loadEnv(import.meta.env.MODE, process.cwd(), "");
```

`loadEnv()` reads from `.env` files on disk. It does NOT read from `process.env`. Cloudflare Pages git integration injects environment variables as `process.env` — there is no `.env` file during the build.

**The Fix — Option 1 (Code change, cleaner):**

Update `astro.config.mjs` to fall back to `process.env`:

```javascript
const env = loadEnv(import.meta.env.MODE, process.cwd(), "");

const PUBLIC_SANITY_STUDIO_PROJECT_ID = env.PUBLIC_SANITY_STUDIO_PROJECT_ID || process.env.PUBLIC_SANITY_STUDIO_PROJECT_ID;
const PUBLIC_SANITY_STUDIO_DATASET = env.PUBLIC_SANITY_STUDIO_DATASET || process.env.PUBLIC_SANITY_STUDIO_DATASET;
const PUBLIC_SANITY_VISUAL_EDITING_ENABLED = env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED || process.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED;
const PUBLIC_SITE_URL = env.PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL;
```

This preserves local `.env` file reading AND adds Cloudflare Pages compatibility.

**The Fix — Option 2 (Build command wrapper, no code change):**

Use a build command that writes env vars to `.env` before building:

```
env | grep -E '^(PUBLIC_|SANITY_)' > astro-app/.env && npm run build --workspace=astro-app
```

This is essentially what the current GitHub Actions workflow does — but in the Cloudflare build command instead.

**Recommendation: Option 1** — it's a cleaner, more portable solution that doesn't depend on shell tricks in the build command. Option 2 is the fallback if Option 1 has unexpected issues.

### Sanity Runtime Env Vars (SSR)

For SSR preview deployments, `import.meta.env.SANITY_API_READ_TOKEN` needs to be available at **runtime** (not just build time). In the current GitHub Actions approach, the token is inlined into the SSR bundle at build time via the `.env` file → Vite inlining.

With Cloudflare Pages git integration:
- Public vars (`PUBLIC_*`) are inlined at build time by Vite → works the same
- Private vars (`SANITY_API_READ_TOKEN`) need to be inlined at build time too
- Cloudflare Pages makes dashboard env vars available as `process.env` during build → Vite should inline them IF they're in the build environment

**Verify:** After the first build, check that `SANITY_API_READ_TOKEN` is properly inlined in the SSR Worker bundle. If not, the build command wrapper (Option 2 above) is the fallback.

**Alternative for runtime vars:** Use Cloudflare Pages bindings (Secrets) which are available at runtime via `context.locals.runtime.env`. This is the "Cloudflare way" but requires code changes in `sanity.ts` to read from the runtime context. Only pursue this if build-time inlining doesn't work.

### CI Workflow (Replaces deploy.yml)

**Decision: Option B confirmed by Jay** — GitHub Actions handles CI (tests/lint), Cloudflare handles all deployments.

Delete `.github/workflows/deploy.yml` and create `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  pull_request:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - name: Build Astro site
        run: npm run build --workspace=astro-app
        env:
          PUBLIC_SANITY_STUDIO_PROJECT_ID: ${{ vars.PUBLIC_SANITY_STUDIO_PROJECT_ID }}
          PUBLIC_SANITY_STUDIO_DATASET: ${{ vars.PUBLIC_SANITY_STUDIO_DATASET }}
      - name: Run tests
        run: npm test --workspace=astro-app
```

Keep GitHub Actions variables for `PUBLIC_SANITY_STUDIO_PROJECT_ID` and `PUBLIC_SANITY_STUDIO_DATASET` so the CI build can succeed (it needs valid Sanity config to build). Other env vars can use placeholders since CI just validates the build, not the deployed content.

The existing `deploy-storybook.yml` workflow remains untouched (it deploys Storybook to GitHub Pages, unrelated to this story).

### Preview URL for Sanity Studio

The Sanity Studio Presentation tool needs to know the preview URL to iframe. Currently `studio/.env` has:

```
SANITY_STUDIO_PREVIEW_ORIGIN=https://preview.ywcc-capstone.pages.dev
```

With native preview deployments, every branch gets its own URL. Options:

1. **Use a designated branch name** for the "editorial preview" — e.g., always keep a `staging` or `editorial` branch that editors can use. The URL would be `staging.ywcc-capstone.pages.dev`.
2. **Use the latest PR deployment** — editors use whichever branch is currently active.
3. **Keep using `preview` as a branch name but without the sync workflow** — just push to it when you want an editorial preview. No sync, no permanent branch.

**Recommendation: Option 1** — create a lightweight `staging` branch (or keep using `preview` as a name). Editors always know the URL. Developers push to it when they want to give editors a preview. This is just a convention, not infrastructure — no sync workflow needed.

**Alternative:** If the Studio's `SANITY_STUDIO_PREVIEW_ORIGIN` supports wildcards or dynamic URLs, that's even better. Check `@sanity/astro` docs for this capability.

### CSP and Security Headers

No changes needed. The CSP meta tag in `Layout.astro` and the `_headers` file in `public/` are independent of the deployment method. Cloudflare Pages reads `_headers` from build output regardless of direct upload or git integration.

### Cloudflare Free Tier Impact

Current: ~2 builds per commit × N commits/day = up to 2N builds/day
After: ~1 build per commit × N commits/day = up to N builds/day

Cloudflare Pages free tier: 500 builds/month. This change halves build consumption.

### Previous Story Intelligence

**Story 5.2 (GA4, Security Headers & Cloudflare Deploy — review):**
- Established the `wrangler pages deploy` direct upload pattern
- Created the `.env` writing hack in CI to work around Vite's `loadEnv()`
- Fixed SSR issues: astro-icon → @iconify/utils, disable_nodejs_process_v2, .env inlining
- All SSR fixes remain relevant — the Cloudflare adapter and wrangler.jsonc flags are unchanged
- 43 integration tests exist in `tests/integration/deploy-5-2/` — some may need updates

**Story 5.4 (Preview & Publish Architecture — in-progress):**
- Fixed `previewDrafts` → `drafts` perspective
- Fixed SSR cache bypass for `getSiteSettings()`
- Configured Sanity webhook → Cloudflare deploy hook (will need reconfiguration)
- Jay confirmed full edit → preview → publish → rebuild loop working

**PR #3 (Preview Branch Setup):**
- Established the conditional `output: "server"` / `"static"` pattern in `astro.config.mjs`
- Applied stegaClean fixes to all block components
- Fixed `astro-icon` → `@iconify/utils` for Cloudflare Workers compatibility
- These fixes persist regardless of deployment approach

### Git Intelligence

Recent commits (on `preview` branch, which is identical to `main`):

```
a33b81f fix: use fast-forward merge in sync-main workflow to prevent drift
e63acda fix: replace sync-preview workflow with sync-main for new default branch
056fed9 Merge pull request #5 (defineQuery, SEO stega fix)
ee4d36b Merge pull request #4 (preview publish architecture)
f4ac5d8 Merge pull request #3 (preview branch setup)
```

Key patterns:
- PRs merged to `preview` (current default), then synced to `main`
- After this story, PRs will merge directly to `main`
- Environment variables use `PUBLIC_` prefix for client-accessible values
- `loadEnv()` pattern in `astro.config.mjs` must be preserved for local dev

### Anti-Patterns to Avoid

| Rule | What NOT to Do |
|------|----------------|
| No premature old project deletion | Do NOT delete the old CF Pages project until the new one is verified working |
| No hardcoded preview URLs | Do NOT hardcode a specific preview branch URL in Studio config — use a convention-based approach |
| No removing local .env support | Do NOT break local development with `.env` files while adding `process.env` fallback |
| No custom domain migration without testing | If a custom domain is attached, do NOT move it until the new project is fully verified |
| No removing wrangler.jsonc | Keep it — still needed for adapter config, compatibility flags, and local dev via `wrangler pages dev` |

### Testing Requirements

**Build Verification:**
- Cloudflare Pages production build succeeds with `output: "static"`
- Cloudflare Pages preview build succeeds with `output: "server"`
- Both builds complete under 3 minutes (NFR8)
- Build output contains all expected pages and `_headers` file

**Preview Deployment:**
- Preview URL accessible at `<branch>.ywcc-capstone.pages.dev`
- SSR pages render with fresh Sanity draft content
- Visual Editing overlays appear and function (click-to-edit)
- `X-Robots-Tag: noindex` header present on preview deployments (Cloudflare adds this automatically)

**Production Deployment:**
- `ywcc-capstone.pages.dev` serves static HTML
- GA4 script present, CSP meta tag present
- Security headers present in HTTP response
- No Visual Editing JS overhead in production

**Webhook Loop:**
- Publish content in Sanity Studio
- Webhook fires (check sanity.io/manage → webhook attempts log)
- Cloudflare production build triggers
- Production site shows updated content within 5 minutes

**Regression:**
- All existing pages render correctly
- Storybook build not affected
- Existing integration tests pass (update deploy-5-2 tests if needed)

### References

- [Source: developers.cloudflare.com/pages/configuration/preview-deployments] — Native preview deployment docs
- [Source: developers.cloudflare.com/pages/configuration/branch-build-controls] — Branch deployment controls
- [Source: developers.cloudflare.com/pages/configuration/build-configuration] — Build config + env vars
- [Source: developers.cloudflare.com/pages/get-started/git-integration] — Git integration setup
- [Source: developers.cloudflare.com/pages/configuration/monorepos] — Monorepo support
- [Source: developers.cloudflare.com/pages/configuration/deploy-hooks] — Deploy hooks (for Sanity webhook)
- [Source: _bmad-output/implementation-artifacts/5-2-ga4-security-headers-cloudflare-deploy.md] — Current deployment architecture
- [Source: _bmad-output/implementation-artifacts/5-4-preview-publish-architecture.md] — Webhook + preview architecture
- [Source: .github/workflows/deploy.yml] — Current CI/CD workflow (to be removed/simplified)
- [Source: .github/workflows/sync-main.yml] — Current sync workflow (to be deleted)
- [Source: astro-app/astro.config.mjs] — Current build config with loadEnv()

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Build log: `docs/ywcc-capstone.efd35307-9be2-40fa-a39e-77cca548f067.log`

### Completion Notes List

- Task 1: CF Pages project `ywcc-capstone` created with git integration. Old direct-upload project deleted first. Build settings: root=`/`, build command=`npm run build --workspace=astro-app`, output dir=`astro-app/dist`, framework preset=Astro. Initial build succeeded as SSR but returned 500 due to missing compatibility flags (`nodejs_compat`, `disable_nodejs_process_v2`). Fixed via CF dashboard Settings → Functions → Compatibility flags. CF build system does NOT read `astro-app/wrangler.jsonc` (only checks for `wrangler.toml` at root).
- Task 2: Env vars configured in CF dashboard. Initially `PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true` was set for both environments causing production to build as SSR. Fixed by setting it only for Preview environment. Key finding: Vite's `loadEnv()` with `""` prefix DOES read from `process.env`, so the `.env` hack workaround and Task 3 code change may be unnecessary.
- Task 3: No code change needed. `loadEnv(mode, cwd, "")` merges `process.env` — confirmed by build log.
- Task 4: Monorepo Option A confirmed working. Root dir=`/`, build=`npm run build --workspace=astro-app`, output=`astro-app/dist`.

### File List
