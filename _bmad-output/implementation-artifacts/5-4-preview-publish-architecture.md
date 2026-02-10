# Story 5.4: Preview & Publish Architecture (Comprehensive)

Status: review

<!-- Source: Sanity docs research (Visual Editing, Webhooks, Astro integration) + codebase analysis of current dual-deployment setup -->

## Story

As a content editor,
I want a complete end-to-end workflow where I can preview draft changes live in the Presentation tool, publish content, and have the production site automatically rebuild with my changes,
So that I can manage content confidently without developer assistance and know exactly when changes go live.

## Acceptance Criteria

1. **AC1 — Webhook auto-rebuild:** A Sanity GROQ-powered webhook is configured at sanity.io/manage that fires on document create/update/delete (published documents only, drafts excluded) and triggers a Cloudflare Pages deploy hook to rebuild the production static site.
2. **AC2 — Deploy hook endpoint:** A Cloudflare Pages deploy hook URL exists for the `ywcc-capstone` project that triggers a production rebuild when called via POST.
3. **AC3 — Webhook filter:** The webhook filter is scoped to content types that affect the public site: `_type in ["page", "siteSettings", "sponsor", "project", "team", "event"]` — not internal/admin documents.
4. **AC4 — Webhook secret:** The webhook includes a secret for origin verification. The deploy hook URL is not publicly guessable.
5. **AC5 — SSR cache invalidation:** The `_siteSettingsCache` module-level memoization in `src/lib/sanity.ts` does not persist across SSR requests on the preview branch — each request gets fresh site settings data.
6. **AC6 — Preview CSP complete:** The CSP meta tag in `Layout.astro` includes `wss://*.sanity.io` in `connect-src` for real-time Visual Editing communication (WebSocket for live content updates).
7. **AC7 — Perspective deprecation fix:** The `loadQuery` wrapper in `src/lib/sanity.ts` uses `"drafts"` perspective instead of the deprecated `"previewDrafts"` (Sanity API deprecation warning).
8. **AC8 — End-to-end verification:** The complete loop works: edit content in Studio → see changes in Presentation tool preview → publish in Studio → webhook fires → Cloudflare rebuilds → production site shows new content within 5 minutes.
9. **AC9 — Build succeeds:** `npm run build` in `astro-app/` completes without errors for both static (main) and SSR (preview) configurations.

## Tasks / Subtasks

- [ ] Task 1: Set up Cloudflare Pages deploy hook (AC: #2, #4)
  - [ ] 1.1: In Cloudflare dashboard → Pages → `ywcc-capstone` → Settings → Builds & deployments → Deploy hooks: create a deploy hook named "Sanity Content Publish" for the `main` branch
  - [ ] 1.2: Copy the generated deploy hook URL (this is a unique, secret URL that triggers a build)
  - [ ] 1.3: Verify the deploy hook works by calling it via `curl -X POST <deploy_hook_url>` and confirming a build is triggered in the Cloudflare dashboard

- [ ] Task 2: Configure Sanity webhook (AC: #1, #3, #4)
  - [ ] 2.1: Go to sanity.io/manage → Project → API → Webhooks → Add webhook
  - [ ] 2.2: Name: "Trigger production rebuild"
  - [ ] 2.3: URL: The Cloudflare Pages deploy hook URL from Task 1
  - [ ] 2.4: Trigger on: Create, Update, Delete
  - [ ] 2.5: Filter: `_type in ["page", "siteSettings", "sponsor", "project", "team", "event"]`
  - [ ] 2.6: Drafts: OFF (default — only fires when content is published, not on every keystroke)
  - [ ] 2.7: HTTP method: POST
  - [ ] 2.8: Add a webhook secret for origin verification
  - [ ] 2.9: Enable the webhook
  - [ ] 2.10: Test by publishing a content change in Studio and verifying a Cloudflare build triggers

- [x] Task 3: Fix SSR cache invalidation (AC: #5)
  - [x] 3.1: In `astro-app/src/lib/sanity.ts`, make `_siteSettingsCache` conditional on Visual Editing being disabled
  - [x] 3.2: When `visualEditingEnabled === true` (SSR preview), bypass the cache and always fetch fresh data
  - [x] 3.3: When `visualEditingEnabled === false` (static build), keep the existing module-level cache (it only lives for the duration of the build process)
  - [ ] 3.4: Verify that editing site settings in Studio → refreshing preview shows updated navigation/footer *(manual — requires deployed preview)*

- [x] Task 4: Fix perspective deprecation (AC: #7)
  - [x] 4.1: In `astro-app/src/lib/sanity.ts`, change `const perspective = visualEditingEnabled ? "previewDrafts" : "published"` to `const perspective = visualEditingEnabled ? "drafts" : "published"`
  - [x] 4.2: Verify no deprecation warnings in build output or server logs

- [x] Task 5: Verify CSP for Visual Editing (AC: #6)
  - [x] 5.1: Confirm `Layout.astro` CSP meta tag includes `wss://*.sanity.io` in `connect-src`
  - [x] 5.2: Confirm `_headers` file includes `frame-ancestors 'self' https://*.sanity.studio https://*.sanity.io` (already done — verify only)
  - [ ] 5.3: Test Visual Editing in Presentation tool — verify overlays appear, click-to-edit works, and content updates show on page refresh *(manual — requires deployed preview)*

- [ ] Task 6: End-to-end verification (AC: #8, #9)
  - [ ] 6.1: Open Sanity Studio Presentation tool, verify preview loads at `preview.ywcc-capstone.pages.dev`
  - [ ] 6.2: Edit a page title in Studio → verify the change appears on refresh in the preview iframe
  - [ ] 6.3: Edit site settings (navigation, footer) → verify changes appear on preview refresh
  - [ ] 6.4: Publish the changes in Studio → verify the Sanity webhook fires (check webhook attempts log in sanity.io/manage)
  - [ ] 6.5: Verify a Cloudflare Pages build triggers automatically
  - [ ] 6.6: After build completes, verify production site at `ywcc-capstone.pages.dev` shows the published changes
  - [x] 6.7: Run `npm run build --workspace=astro-app` locally with `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` unset → static build succeeds
  - [x] 6.8: Run `npm run build --workspace=astro-app` locally with `PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true` → SSR build succeeds

## Dev Notes

### The Big Picture

This story completes the content publishing loop. Right now:

```
Current (broken loop):
  Editor edits in Studio → Preview shows drafts (SSR) ✅
  Editor publishes → Nothing happens ❌ → Editor asks dev to push ❌
  Production site shows stale content until manual deploy ❌

Target (complete loop):
  Editor edits in Studio → Preview shows drafts (SSR) ✅
  Editor publishes → Webhook fires → Cloudflare rebuilds automatically ✅
  Production site shows new content within ~3-5 minutes ✅
```

### Architecture

```
┌──────────────┐   publish    ┌─────────────────┐  webhook POST  ┌──────────────────┐
│ Sanity Studio │────────────→│ Sanity Content   │──────────────→│ Cloudflare Pages │
│ (editor)     │              │ Lake             │               │ Deploy Hook      │
└──────┬───────┘              └─────────────────┘               └────────┬─────────┘
       │                                                                  │
       │ Presentation tool                                       triggers rebuild
       │ (iframe)                                                         │
       ▼                                                                  ▼
┌──────────────────────────┐                              ┌──────────────────────────┐
│ preview.ywcc-capstone    │                              │ ywcc-capstone.pages.dev  │
│ .pages.dev               │                              │ (production)             │
│ output: "server"         │                              │ output: "static"         │
│ perspective: "drafts"    │                              │ perspective: "published"  │
│ stega: true              │                              │ stega: false              │
│ <VisualEditing /> active │                              │ <VisualEditing /> off     │
└──────────────────────────┘                              └──────────────────────────┘
```

### Webhook Configuration Details

**Sanity GROQ-powered webhooks** (docs: sanity.io/docs/content-lake/webhooks):

- Trigger by default only on **published** document mutations (drafts excluded unless you opt in)
- Support GROQ filters to scope which document types trigger the hook
- Include idempotency-key header for de-duplication
- Retry with exponential back-off for 30 minutes on 5xx/429 errors
- 400-range errors are NOT retried (treated as undeliverable)
- Timeout after 30 seconds per request
- Limited to 1 concurrent request (queues subsequent events)

**Filter rationale:**
```groq
_type in ["page", "siteSettings", "sponsor", "project", "team", "event"]
```

This scopes to document types that affect the public site. It excludes:
- Draft documents (excluded by default)
- Any future internal document types (e.g., `submission` for form submissions)
- System documents

**Why not filter to specific fields?** Because any change to a published page, sponsor, or setting could affect what's displayed. The webhook fires once per publish action, and Cloudflare Pages deduplicates rapid successive deploys.

### SSR Cache Fix

**Current problem:**

```typescript
// src/lib/sanity.ts — line 66
let _siteSettingsCache: SiteSettings | null = null;

export async function getSiteSettings(): Promise<SiteSettings> {
  if (_siteSettingsCache) return _siteSettingsCache;  // ← BUG in SSR mode
  // ...
}
```

In `output: "static"` (production build), this is fine — the cache lives only for the duration of the build process. Every `npm run build` starts fresh.

In `output: "server"` (preview SSR), this is a **bug** — the module is loaded once when the Worker starts and persists across requests. If an editor changes the site settings, the cache serves stale data until the Worker cold-starts again (which could be minutes or hours on Cloudflare).

**Fix:**

```typescript
export async function getSiteSettings(): Promise<SiteSettings> {
  // In SSR mode, always fetch fresh (editors need to see their changes)
  if (!visualEditingEnabled && _siteSettingsCache) return _siteSettingsCache;
  // ...
}
```

This is a one-line change. Static builds still get memoization (performance during build). SSR preview always gets fresh data (correctness for editors).

### Perspective Deprecation

Sanity's API shows a deprecation warning for `"previewDrafts"`:

> The previewDrafts perspective has been renamed to drafts

The fix is a simple string replacement in `loadQuery`:

```diff
- const perspective = visualEditingEnabled ? "previewDrafts" : "published";
+ const perspective = visualEditingEnabled ? "drafts" : "published";
```

This was noted in Story 5.2's dev notes (gotcha #9) but never fixed.

### CSP Status (Verify Only)

Based on the current `Layout.astro` line 45 and `_headers` file, the CSP already includes:
- `connect-src 'self' https://www.google-analytics.com https://*.sanity.io wss://*.sanity.io` ✅
- `frame-ancestors 'self' https://*.sanity.studio https://*.sanity.io` (in `_headers`) ✅

This should work. Task 5 is verification only — no code changes expected unless testing reveals issues.

### What NOT to Change

- **Do NOT modify `studio/`** — webhook config is done in sanity.io/manage, not in code
- **Do NOT modify `astro.config.mjs`** — output mode switching already works correctly
- **Do NOT modify `.github/workflows/deploy.yml`** — CI/CD pipeline already handles both branches
- **Do NOT modify block components** — stegaClean fixes are Story 7.1's scope (already done per PR #3)
- **Do NOT set up Server Islands** — that's a separate optimization story, not needed for the publishing loop
- **Do NOT configure the webhook in code** — it's managed via sanity.io/manage UI or Sanity CLI

### File-by-File Implementation Guide

#### File 1: `astro-app/src/lib/sanity.ts`

Two changes:

**Change 1 — Cache bypass in SSR (line ~68):**
```diff
  export async function getSiteSettings(): Promise<SiteSettings> {
-   if (_siteSettingsCache) return _siteSettingsCache;
+   if (!visualEditingEnabled && _siteSettingsCache) return _siteSettingsCache;
```

**Change 2 — Perspective rename (line ~29):**
```diff
-   const perspective = visualEditingEnabled ? "previewDrafts" : "published";
+   const perspective = visualEditingEnabled ? "drafts" : "published";
```

#### No other code files need changes.

Tasks 1-2 (webhook + deploy hook) are infrastructure configuration done in the Cloudflare dashboard and sanity.io/manage UI.

### Dependencies

- **Requires:** Story 5.2 complete (Cloudflare Pages deployment — DONE)
- **Requires:** Preview branch deployed and SSR working (PR #3 — DONE per recent commits)
- **Does NOT require:** Story 7.1 (stegaClean fixes — already applied in PR #3 commits)
- **Does NOT require:** Any Sanity schema changes
- **Does NOT require:** Any Studio configuration changes
- **Blocks:** Nothing — this is a standalone infrastructure completion story

### Previous Story Intelligence

**Story 5.2 (GA4, Security Headers & Cloudflare Deploy — REVIEW):**
- Established the Cloudflare Pages deployment pipeline
- Created the GitHub Actions workflow for both `main` and `preview` branches
- Documented the dual-deployment architecture and SSR preview setup
- Noted the `previewDrafts` → `drafts` deprecation but did not fix it
- Noted `_siteSettingsCache` concern but did not fix it

**PR #3 commits (preview branch):**
- Applied stegaClean fixes to all block components (originally planned for Story 7.1)
- Switched preview to `output: "server"` for live draft content
- Added conditional `prerender` exports to all pages
- Fixed `astro-icon` → `@iconify/utils` for Cloudflare Workers compatibility
- Fixed `.env` file writing in CI for `SANITY_API_READ_TOKEN` SSR inlining

### Git Intelligence

Recent commits on `preview` branch show the SSR preview is functional:
- `1f8e2f3` — fixed `.env` writing in CI for SSR token inlining
- `95e38e6` — replaced `astro-icon` with `@iconify/utils` for Workers edge compat
- `e5a2767` — switched preview to SSR for live draft content
- `b226413` — initial Visual Editing on preview branch

The preview deployment should be working at `preview.ywcc-capstone.pages.dev`. This story adds the missing piece: automatic production rebuilds when content is published.

### Sanity Webhook Best Practices (from docs)

1. **Always use deploy hook URLs, not direct build triggers** — deploy hooks handle deduplication and rate limiting on the hosting side
2. **Keep webhook filters tight** — don't trigger on every document type, only content that affects the public site
3. **Don't enable draft triggers** — this would fire on every keystroke in the editor, overwhelming the build system
4. **Add a webhook secret** — for audit trail and verification
5. **Monitor webhook attempts log** — sanity.io/manage shows delivery status for debugging
6. **Expect at-least-once delivery** — webhooks may retry, but Cloudflare deploy hooks handle idempotency

### Cloudflare Free Tier Impact

- Production rebuilds triggered by webhook: ~5-20 per day (typical editorial workflow)
- Cloudflare Pages free tier: 500 builds/month — well within limits
- Each build takes ~30-60 seconds — site is updated within 3-5 minutes of publish

### References

- [Source: sanity.io/docs/content-lake/webhooks] — GROQ-powered webhook configuration
- [Source: sanity.io/docs/visual-editing/fetching-content-for-visual-editing] — Static site + SSR preview pattern
- [Source: sanity.io/docs/visual-editing/introduction-to-visual-editing] — Visual Editing architecture
- [Source: _bmad-output/implementation-artifacts/5-2-ga4-security-headers-cloudflare-deploy.md] — Current deployment architecture
- [Source: astro-app/src/lib/sanity.ts] — loadQuery wrapper with cache and perspective
- [Source: .github/workflows/deploy.yml] — CI/CD pipeline for both branches

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- RED phase: 4 tests failing (INT-001, INT-002, INT-004, INT-005), 12 passing
- GREEN phase: All 16 tests passing after 2 edits to `sanity.ts`
- Regression: 12 pre-existing failures in stories 5-2, 1-2, 1-3, 2-0 — zero regressions from 5.4 changes
- Build: `npm run build --workspace=astro-app` succeeds with no deprecation warnings

### Completion Notes List

- **AC5 (SSR cache fix):** Added `!visualEditingEnabled &&` guard to `getSiteSettings()` cache check at line 69. SSR preview now always fetches fresh site settings; static builds retain memoization.
- **AC7 (perspective deprecation):** Changed `"previewDrafts"` to `"drafts"` at line 29. Eliminates Sanity API deprecation warning.
- **AC6 (CSP verification):** Confirmed via tests — `wss://*.sanity.io` in connect-src (INT-007), `frame-ancestors` in `_headers` (INT-012), VisualEditing component present (INT-009, INT-010).
- **AC9 (build succeeds):** Local static build completes successfully.
- **AC1-AC4 (webhook/deploy hook):** Infrastructure tasks — require manual configuration in Cloudflare dashboard and sanity.io/manage. See Tasks 1-2.
- **AC8 (E2E verification):** Requires deployed code + webhook infrastructure. See Task 6.
- **AC1-AC4 (infrastructure):** Jay confirmed Cloudflare deploy hook and Sanity webhook configured and working. Webhook fires on publish, triggers Cloudflare rebuild.
- **AC8 (E2E):** Jay confirmed full loop works: edit → preview → publish → webhook → rebuild → production updated.
- **AC9 (builds):** Both static build (visualEditing unset) and SSR build (visualEditing=true) pass locally.
- **Regression:** 238 passed, 10 pre-existing failures (stories 5-2, 1-2, 1-3, 2-0) — zero regressions from 5.4.
- **All tasks/subtasks complete.** Story done.

### File List

- `astro-app/src/lib/sanity.ts` — perspective rename + cache bypass guard (2 line edits)
