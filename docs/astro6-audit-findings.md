# Astro 6 + @astrojs/cloudflare v13 Alignment — Audit Findings

Audit run 2026-04-30 by team `astro6-audit` (config-build, runtime-routes, components-islands, data-tests). 20 raw findings condensed into the prioritized top 10 below.

**Constraint:** at most 2 P0s.

**Status legend:** [x] landed · [~] partial · [ ] open · [!] blocked

---

## P0 — Blockers

### [~] 1. Complete the `astro:env` migration — declare secrets, drop `import.meta.env` for runtime config
**EFFORT:** M

`validateSecrets: true` is set, but 8 production secrets (`BETTER_AUTH_SECRET`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `SANITY_API_WRITE_TOKEN`, `DISCORD_WEBHOOK_URL`) are read via `env.X` / `runtimeEnv.X` without being declared in the schema. Separately, `PUBLIC_SANITY_STUDIO_PROJECT_ID` and `..._DATASET` ARE in the schema as `context: server` but are read via `import.meta.env.X` — server-context vars are not exposed there in strict mode; today it only works because astro.config.mjs:42-46 mirrors wrangler vars into `process.env` at build time.

**WHERE:** astro-app/astro.config.mjs:65-138; astro-app/src/lib/auth-config.ts:22-30,52-53; astro-app/src/middleware.ts:155-162; astro-app/src/actions/index.ts:25,40-41,64-65; astro-app/src/pages/api/auth/[...all].ts.

**FIX:** Add `envField.string({ context: "server", access: "secret" })` for the 8 secrets (`DISCORD_WEBHOOK_URL` optional). Migrate every `env.X` / `runtimeEnv.X` to named imports from `astro:env/server`. Replace `import.meta.env.PUBLIC_SANITY_STUDIO_*` with `astro:env/server` imports. For rwc-us / rwc-intl, decide between `optional: true` or per-env schema variants.

**Status:**
- [x] `auth-config.ts` `import.meta.env.PUBLIC_SANITY_STUDIO_*` reads removed (via Finding #7's refactor)
- [ ] 8 secrets declared in schema
- [ ] Consumer migration to `astro:env/server` named imports

---

### [x] 2. Scrub `dist/server/wrangler.json` before each deploy — current artifact bakes `localhost:4321`
**EFFORT:** S

Pre-fix `astro-app/dist/server/wrangler.json` showed `BETTER_AUTH_URL: "http://localhost:4321"` and `PUBLIC_SITE_URL: "http://localhost:4321"`, plus a phantom `previews.kv_namespaces[0].binding="SESSION"` (no id). This is the artifact `wrangler deploy` reads — a deploy from this dist/ would push localhost URLs to production.

**WHERE:** astro-app/dist/server/wrangler.json:41-54,122-127.

**FIX:** Make `deploy:capstone` / `deploy:rwc-us` / `deploy:rwc-intl` scripts run `rimraf dist` before build. Add a CI guard: post-build, `jq '.vars.BETTER_AUTH_URL' dist/server/wrangler.json` must not contain `localhost`.

**Status:**
- [x] All six `deploy:*` scripts wired through `predeploy:assert-fresh` (rimraf) + `postbuild:assert-no-localhost` (node guard scanning every baked var for `localhost`)
- [x] Verified on a `CLOUDFLARE_ENV=capstone` build: compat_date 2026-04-01, no localhost vars, guard exits 0

---

## P1 — High

### [x] 3. Drop `disable_nodejs_process_v2` and bump `compatibility_date` past 2026-02-19
**EFFORT:** S

Transitional workaround for Astro #15434 / #14511, removable once `compatibility_date >= 2026-02-19` (when `fetch_iterable_type_support` lands). Pre-fix pin was `2025-12-01`. project-context.md:79,370 already called this out.

**WHERE:** astro-app/wrangler.jsonc:17-27.

**FIX:** Set `"compatibility_date": "2026-04-01"`, drop `"disable_nodejs_process_v2"` from `compatibility_flags`. Smoke-test SSR (original bug surfaced as `[object Object]` body).

**Status:**
- [x] `compatibility_date` → `2026-04-01`
- [x] `disable_nodejs_process_v2` removed from `compatibility_flags`
- [x] `npm run build` passes; baked wrangler.json reflects new flags
- [ ] Live SSR smoke-test on capstone preview Worker (not yet deployed)

---

### [ ] 4. Convert `GitHubDashboard` to `server:defer` with skeleton fallback
**EFFORT:** L

`/portal/progress` blocks SSR while it fetches D1 token + Sanity sponsor projects + a full GitHub API surface (issues, PRs, releases, commits, contributors, workflows, languages) before streaming a single byte. The dashboard is a 958-line React island below the fold. Astro 6 stabilizes server islands — perfect fit for slow third-party API aggregation.

**WHERE:** astro-app/src/pages/portal/progress.astro:82-104 (data fetch), :252 (`<GitHubDashboard client:load … />`).

**FIX:** Move GitHub API aggregation + dashboard render into `GitHubDashboardIsland.astro` and use `<GitHubDashboardIsland server:defer email={email}><Fragment slot="fallback"><PortalSkeleton /></Fragment></GitHubDashboardIsland>`. Keep `RepoLinker` as `client:load`.

**Status:** Not started.

---

### [x] 5. Admin-gate or strip `/portal/api/db-health` — currently leaks D1 schema to any sponsor
**EFFORT:** S

Endpoint returned the list of D1 table names with no admin gate. Any portal user (sponsor or above) could enumerate internal tables. The file even had a TODO acknowledging this.

**WHERE:** astro-app/src/pages/portal/api/db-health.ts:6-30.

**FIX:** Either gate behind a Studio-user identity check (mirror `astro-app/src/pages/api/portal/admin/acceptances.ts` — Sanity `/v1/users/me` introspection + `administrator` role check, post-Story 24.1) or restrict response to a non-disclosing payload.

**Status:**
- [x] Response trimmed to `{ ok, tableCount }` — confirms the D1 binding is wired without leaking schema
- [x] TODO comment removed; replaced with rationale

---

### [ ] 6. Drop sanity.ts module-level caches — they go stale across Worker isolates
**EFFORT:** M

Eleven `let _xxxCache: ... | null` at module scope assume a per-build SSG model. Under SSR on Workers, an isolate is reused across requests — these caches serve stale data after a Sanity publish until the isolate recycles. `getSponsorAgreement` (line 1107) explicitly cites this trap; the rest of the module hasn't followed suit.

**WHERE:** astro-app/src/lib/sanity.ts:422,465,569,627,668,789,898,982,1030,1061,1256.

**FIX:** Drop module-level caches; rely on `useCdn: true` (~60s edge cache, already adopted for sponsor agreements). For `prefetchPages` (line 1262), pass a per-request `Map` through `Astro.locals` instead.

**Status:** Not started.

---

### [x] 7. Replace whitelist raw fetch with `sanityClient.fetch(query, { email })`
**EFFORT:** S

`auth-config.ts:54` built the Sanity GROQ HTTP URL by hand and only encoded the inner email, leaking literal `"` chars and breaking on `+`/Unicode addresses. Because the function fails-closed, bad encoding silently demoted legitimate sponsors to `student` — exactly the regression a unit test should catch but didn't.

**WHERE:** astro-app/src/lib/auth-config.ts:50-67.

**FIX:** Use the already-initialized `sanityClient.fetch(SPONSOR_WHITELIST_QUERY, { email })`. Convert `SPONSOR_WHITELIST_QUERY` to `defineQuery` for typegen consistency. Add a vitest case covering `+` and Unicode emails.

**Status:**
- [x] `checkSponsorWhitelist` rewritten to use `sanityClient.fetch` + `defineQuery`
- [x] `import.meta.env.PUBLIC_SANITY_STUDIO_*` reads removed
- [x] Vitest cases added for `+` aliases and Unicode local-parts (26/26 pass)

---

### [ ] 8. Lazy-load `EventCalendarIsland` (schedule-x ~150KB gz behind a toggle)
**EFFORT:** M

`/events` always hydrates the calendar with `client:idle`, shipping schedule-x + temporal-polyfill to every visitor — but the calendar is hidden until they click `CalendarViewToggle`. Most never toggle. Cost paid on a high-traffic, prerendered route.

**WHERE:** astro-app/src/pages/events/index.astro:63; astro-app/src/components/react/EventCalendarIsland.tsx.

**FIX:** Either dynamic-`import()` the calendar from the toggle handler the first time it's enabled (keep the toggle `client:load`), or wrap the calendar in a `server:defer` Astro component with a skeleton fallback so the bundle isn't loaded until the user opts in.

**Status:** Not started.

---

### [ ] 9. Wire (or delete) the dead newsletter & contact-block forms
**EFFORT:** M

Three Sanity-driven block types render visually-complete but functionally-dead forms. `Newsletter.astro` (4 variants) and `ArticleNewsletterCta.astro` use `<form onsubmit="return false;">` with no fetch. `AutoForm` (used by `contact-1/2/3.astro`) renders `<form method="POST">` with no `action=` and no Astro Action binding — submits 405 against the same URL. A working pattern already exists at `ContactForm.astro:210,253` using `actions.submitForm`.

**WHERE:** astro-app/src/components/blocks/custom/Newsletter.astro:37,59,85,106; astro-app/src/components/ArticleNewsletterCta.astro:63,85; astro-app/src/components/ui/auto-form/auto-form.astro:51.

**FIX:** Wire each form to `actions.submitForm` (contact blocks) or `fetch('/api/subscribe', ...)` (newsletter blocks), mirroring `ContactForm.astro`. Or delete the components if they're placeholder.

**Status:** Not started.

---

## P2 — Medium

### [!] 10. Retire `optimize-cjs-for-workerd` Vite shim and flip `imageService` to `cloudflare-binding`
**EFFORT:** S

Two transitional v13 patterns piggyback in astro.config.mjs. (a) The custom plugin pre-bundles `picomatch` to satisfy `@astrojs/react`'s bare `require()` in workerd. (b) `imageService: 'compile'` pins the legacy build-time service when v13 default is `'cloudflare-binding'` (Images runtime binding, no cold-start, free tier).

**WHERE:** astro-app/astro.config.mjs:155,162-173.

**FIX:** Remove the `optimize-cjs-for-workerd` plugin block; verify no "Cannot use require in module scope" in workerd. Drop the `imageService: 'compile'` line to inherit `cloudflare-binding`.

**Status — BLOCKED:**
- [!] Tried both edits; either one tips `@astrojs/cloudflare` v13 into Workers test mode and vitest startup crashes with `ReferenceError: require is not defined` from `workers/runner-worker/index.js`. Both reverted.
- [x] Documented the pin reason in astro.config.mjs.
- [ ] Follow-up: migrate vitest to `@cloudflare/vitest-pool-workers`, then drop both. Tracked as a separate spike.

---

## Worth queuing (P2/P3 not in top 10)

- [ ] `ctx.waitUntil` wrapping for fire-and-forget KV/D1 writes in middleware (runtime-routes finding)
- [ ] `PortalCalendar` `client:load` → `client:idle` (one-line, lower INP)
- [ ] `prerender = true` on `robots.txt.ts`
- [ ] Regen + CI-pin `worker-configuration.d.ts` (currently embeds the staging GitHub OAuth client id)
- [ ] Vitest coverage for `actions/index.ts` (Turnstile + Sanity write + Discord webhook paths)
- [ ] Cross-collection blocks (`Testimonials`, `ArticleList`) as `server:defer` opt-ins
- [ ] rwc_us / rwc_intl env-block parity gaps (`BETTER_AUTH_URL`, `STUDIO_ORIGIN` absent — fine for content-only sites but undefined-vs-clean-503 distinction)

---

## Verification snapshot (this session's landed work)

- **Unit suite:** 1893 passed | 26 skipped (1919 total) — 0 failures across 119 files
- **Build:** `CLOUDFLARE_ENV=capstone npm run build -w astro-app` succeeds; `dist/server/wrangler.json` shows `compatibility_date: 2026-04-01`, no `disable_nodejs_process_v2`, `BETTER_AUTH_URL: https://www.ywcccapstone1.com`, zero localhost vars
- **Deploy guard:** `npm run postbuild:assert-no-localhost -w astro-app` exits 0 on a clean capstone build

## Files modified this session

- `astro-app/wrangler.jsonc`
- `astro-app/astro.config.mjs` (comment-only after revert of the imageService flip)
- `astro-app/src/pages/portal/api/db-health.ts`
- `astro-app/src/lib/auth-config.ts`
- `astro-app/src/lib/__tests__/auth-config.test.ts`
- `astro-app/package.json`
- `tests/integration/deploy-5-2/cloudflare-deploy.test.ts`
