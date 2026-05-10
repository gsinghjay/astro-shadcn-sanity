# Environment Variables

How env vars flow through Astro 6 + `@astrojs/cloudflare` v13 + Wrangler + Cloudflare Workers Builds, and what each one does. If you're confused why a secret isn't picked up, **see [Build-Time Baking Gotcha](#build-time-baking-gotcha) first** — it explains the recurring "I rotated the secret but prod still uses the old value" bug.

---

## TL;DR

A single env var can live in up to **four places** at once. The build-time bake means whatever is in the Builds env at build time gets compiled into the Worker bundle and served at runtime. Wrangler runtime secrets (`wrangler secret put`) **do not override** the baked value.

| Source | Set how | Used when | Persists? |
|---|---|---|---|
| `astro-app/.dev.vars` | Edit file | Local `npm run dev` + local `npm run build` | gitignored, machine-local |
| `astro-app/wrangler.jsonc` `vars: {}` | Edit JSON, redeploy | Build (compiled into bundle) + Runtime (CF binding) | Checked into git |
| Cloudflare Workers Builds env | Dashboard or PATCH `/builds/triggers/{uuid}/environment_variables` | CI build container running `astro build` | Per-trigger, per-worker |
| Cloudflare Worker runtime secret | `wrangler secret put X --name <worker>` | Runtime via `cloudflare:workers` env binding | Per-worker, separate from bundle |

`astro:env` schema in [`astro-app/astro.config.mjs:131`](../astro-app/astro.config.mjs) is the single source of truth for which vars exist, their types, and required/optional status.

---

## The Four Categories

`astro:env` partitions every var by `context` × `access`:

```
                 access: "public"            access: "secret"
context: "client"   PUBLIC_*                  (illegal — never use)
context: "server"   non-secret server vars     server-only secrets
```

### Client-public (`PUBLIC_*`)
Bundled into the JS shipped to browsers. Visible in DevTools → Sources. Live in `wrangler.jsonc` `vars: {}` per env.

| Var | Purpose |
|---|---|
| `PUBLIC_GTM_ID` | Google Tag Manager container ID. Empty = analytics disabled. |
| `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` | Toggles Sanity Presentation drafts perspective + stega. `true` only on `*-preview` Workers. |
| `PUBLIC_SANITY_LIVE_CONTENT_ENABLED` | Live Content API client subscription. |
| `PUBLIC_SITE_URL` | Canonical site URL for sitemap, OG tags, JSON-LD. |
| `PUBLIC_SANITY_STUDIO_URL` | "Edit in Studio" links. |
| `PUBLIC_SANITY_DATASET` / `PUBLIC_SANITY_STUDIO_DATASET` | Sanity dataset name (`production` or `rwc`). |
| `PUBLIC_SANITY_STUDIO_PROJECT_ID` | Required client public — fail-build if missing (no default). |
| `PUBLIC_SITE_ID` | Multi-site discriminator: `capstone` / `rwc-us` / `rwc-intl`. |
| `PUBLIC_SITE_THEME` | Enum: `red` / `blue` / `green`. Drives DESIGN.md theming. |
| `PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key. Pairs with `TURNSTILE_SECRET_KEY` (server). |
| `PUBLIC_PLATFORM_API_BASE_URL` | Optional bridge to platform-api (Story 12.8a). |

### Server-public
Imported as `import { X } from 'astro:env/server'`. Not bundled to browser. Live in `wrangler.jsonc` `vars: {}`.

| Var | Purpose | Optional? |
|---|---|---|
| `BETTER_AUTH_URL` | Origin for Better Auth callback URLs. Differs per env (`www.ywcccapstone1.com` vs `ywcc-capstone-preview.js426.workers.dev`). | optional (RWC envs lack it) |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID. | optional |
| `RESEND_FROM_EMAIL` | "From" address for transactional email. | optional |
| `STUDIO_ORIGIN` | Allowed origin for `/api/portal/admin/*` CORS check. | optional |

### Server-secret
Sensitive values. Set via Wrangler secrets (runtime) **and** Builds env (build-time). Required on capstone + capstone_preview, optional elsewhere — see schema gate in [`astro.config.mjs:258`](../astro-app/astro.config.mjs).

| Var | Purpose | Where created |
|---|---|---|
| `BETTER_AUTH_SECRET` | Session cookie HMAC signing key. Rotating invalidates all sessions. | Generate: `openssl rand -hex 32` |
| `GITHUB_CLIENT_SECRET` | Pairs with `GITHUB_CLIENT_ID`. | github.com/settings/developers |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth pair. | console.cloud.google.com → APIs & Services → Credentials |
| `RESEND_API_KEY` | Resend transactional email API key. | resend.com/api-keys |
| `TURNSTILE_SECRET_KEY` | Server-side Turnstile token verifier. ⚠️ `1x0000...000AA` is the **always-pass test key** — never deploy that to prod. | dash.cloudflare.com → Turnstile |
| `SANITY_API_READ_TOKEN` | Viewer-role Sanity token for SSR drafts. | manage.sanity.io → API → Tokens |
| `SANITY_API_WRITE_TOKEN` | Editor-role Sanity token for portal mutations. | same |
| `SANITY_PROJECT_READ_TOKEN` | Project-scoped Viewer token (for `/projects/<id>` members API). Used by `/api/portal/admin/acceptances` to verify Studio user membership. **Must be project-scoped, not just dataset-scoped.** | same — choose "Project" scope |
| `DISCORD_WEBHOOK_URL` | Optional form-submission notifier. | Discord channel → Integrations → Webhooks |

---

## Six-Worker Topology

Per [`astro-app/wrangler.jsonc`](../astro-app/wrangler.jsonc), each `[env.<name>]` produces a separate Worker with its own bundle, vars, and secrets:

| Worker (`name`) | Build env | Origin | Bindings | Notes |
|---|---|---|---|---|
| `ywcc-capstone` | `CLOUDFLARE_ENV=capstone` | ywcccapstone1.com | D1 + KV + DO | Production. All 8 secrets required. |
| `ywcc-capstone-preview` | `CLOUDFLARE_ENV=capstone_preview` | `*.workers.dev` | D1 (shared with prod) + isolated KV + DO | **Full staging.** All 8 secrets required. Drafts+stega on. |
| `rwc-us` / `rwc-intl` | `CLOUDFLARE_ENV=rwc_us` / `rwc_intl` | `*.workers.dev` | none | Content-only. Portal/auth routes 503. Secrets optional. |
| `rwc-us-preview` / `rwc-intl-preview` | `CLOUDFLARE_ENV=rwc_us_preview` / `rwc_intl_preview` | `*.workers.dev` | none | Content-only previews with drafts+stega. |

The schema in `astro.config.mjs` toggles required-vs-optional based on `CLOUDFLARE_ENV` — capstone + capstone_preview fail the build on missing secrets; everything else marks them optional so RWC bundles don't drag the unused portal imports into a 503 path.

---

## Build-Time Baking Gotcha

**Critical.** With `@astrojs/cloudflare` v13 + `astro:env`, server `secret` values are **read at build time and baked into the worker bundle.** This contradicts the Astro docs claim that `secret` is "runtime" — in practice for this adapter version, it isn't.

Concrete consequence: `wrangler secret put SANITY_PROJECT_READ_TOKEN` updates the runtime secret store, but the deployed Worker keeps using whatever value was baked at the last `astro build`. **You must redeploy** for a rotated secret to take effect at runtime.

Build pulls secrets from (in order of precedence at build time):

1. `astro-app/.dev.vars` — for local `npm run build`
2. `process.env` — for CI builds (CF Workers Builds injects from its env-var settings)

The build script in CF Workers Builds appends **all 8 required secrets** to `.dev.vars` immediately before `astro build` runs. Both `astro build` itself AND the post-build miniflare worker (used by `postbuild:agent-discovery` to crawl pages for the sitemap) read from `.dev.vars` — writing only one secret causes the static-build phase to pass and then miniflare to fail with `[EnvInvalidVariables]` mid-postbuild.

Current build command on both `ywcc-capstone` and `ywcc-capstone-preview` triggers:

```sh
npm install --prefer-offline --no-audit --no-fund && \
for v in SANITY_API_READ_TOKEN SANITY_API_WRITE_TOKEN BETTER_AUTH_SECRET GITHUB_CLIENT_SECRET GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET RESEND_API_KEY TURNSTILE_SECRET_KEY; do
  val=$(eval echo "\$$v")
  if [ -z "$val" ]; then echo "::error::$v is empty in CF Builds env" && exit 1; fi
  printf '%s=%s\n' "$v" "$val" >> astro-app/.dev.vars
done && \
CLOUDFLARE_ENV=<capstone|capstone_preview> npm run build --workspace=astro-app
```

### Symptoms and fixes

| Symptom | Cause | Fix |
|---|---|---|
| Local manual deploy works, but a later deploy reverts the change | CF Workers Builds auto-deployed stale branch over your manual deploy | Merge fix to the branch wired to Builds (`main` for prod, `preview` for staging) |
| `wrangler secret put` succeeded, but Worker still serves old value | Secret only updated at runtime layer; bundle has old baked value | `npm run deploy:<env>` to rebuild and rebake |
| `[EnvInvalidVariables] BETTER_AUTH_SECRET is missing` build failure | CF Builds env doesn't have the secret | Add via dashboard or `PATCH /builds/triggers/{uuid}/environment_variables` |
| Local `npm run build` errors on missing required secret | `.dev.vars` doesn't have it | Add to `.dev.vars` (template: `astro-app/.env.example`) |

---

## CF Workers Builds Wiring

Each Worker has its own build trigger. Get them via:

```bash
WORKER_ID=$(npx wrangler deployments list --env <env-name> 2>&1 | head)  # or look up via API
curl -s -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/builds/workers/$WORKER_ID/triggers"
```

Currently configured triggers (account `70bc6caa244ede05b7f964c0c2d533bb`):

| Worker | Trigger UUID | Branch | Build cmd reads |
|---|---|---|---|
| `ywcc-capstone` (`9f9250ef...`) | `33ddd1ad-3157-43c5-9457-fd0a130a0036` | `main` | All 8 secrets ✓ |
| `ywcc-capstone-preview` (`527d8087...`) | `965bd1f7-b553-490d-bcbb-3d881102a78b` | `preview` | All 8 secrets ✓ (added 2026-05-09) |

Update env vars on a trigger:

```bash
curl -X PATCH \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"NEW_SECRET":{"is_secret":true,"value":"..."}}' \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/builds/triggers/$TRIGGER_UUID/environment_variables"
```

Trigger a manual rebuild:

```bash
curl -X POST -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"branch":"preview"}' \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/builds/triggers/$TRIGGER_UUID/builds"
```

---

## Adding a new secret

1. **Schema first.** Add to `env.schema` in `astro-app/astro.config.mjs`. Mark required only on capstone + capstone_preview (use the existing conditional spread).
2. **Local.** Add to `astro-app/.dev.vars`.
3. **Wrangler runtime.** `printf '%s' "<value>" | npx wrangler secret put NEW_SECRET --env <env-name>` for each Worker that needs it.
4. **CF Builds env.** Add via dashboard (Worker → Settings → Build → Build variables) or PATCH endpoint above. Required for both `ywcc-capstone` and `ywcc-capstone-preview` triggers.
5. **Build script.** If the build needs to write the var to `.dev.vars` (it does for any required `astro:env` server secret), append a line to the build command in the trigger config.
6. **Deploy.** `npm run deploy:capstone -w astro-app` (or the preview flavor). Verify post-deploy.

---

## Rotating a secret

Order matters when a secret is in use across multiple workers:

1. **Mint new value** in the upstream provider (Sanity / GitHub / Resend / etc.). Don't revoke old yet.
2. **Update Wrangler runtime** on every Worker that uses it: `printf '%s' "<new>" | npx wrangler secret put X --env <env>`.
3. **Update CF Builds env** on every relevant trigger. (PATCH endpoint above, or dashboard.)
4. **Redeploy** every Worker via `npm run deploy:<env>` so the bundle picks up the new value (build-time bake — see gotcha above).
5. **Verify** all envs serve correctly with the new value.
6. **Revoke old value** in the upstream provider.

Skipping step 4 means the Worker keeps using the old secret regardless of step 2.

---

## Local dev quickstart

```bash
cp astro-app/.env.example astro-app/.dev.vars
# Fill in values. .dev.vars is gitignored.
npm run dev -w astro-app
```

For testing a build that mirrors CI:

```bash
CLOUDFLARE_ENV=capstone_preview npm run build -w astro-app
```

If you get `[EnvInvalidVariables]`, you're missing a required secret in `.dev.vars`. Compare against `astro-app/.env.example`.

---

## See also

- [`astro-app/astro.config.mjs:131`](../astro-app/astro.config.mjs) — `env.schema` source of truth
- [`astro-app/wrangler.jsonc`](../astro-app/wrangler.jsonc) — per-env vars and bindings
- [`astro-app/.env.example`](../astro-app/.env.example) — local dev template
- `CLAUDE.md` "Cloudflare Deployment Architecture" — multi-env layout
- `docs/cloudflare-infrastructure-guide.md` — broader infra notes
