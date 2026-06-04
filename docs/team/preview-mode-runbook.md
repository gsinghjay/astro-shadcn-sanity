# Preview Mode Runbook

Editors review **unpublished draft content** in Sanity Studio's **Presentation**
tool. Presentation iframes a **separate, content-only preview Worker**
(`ywcc-capstone-preview`) that always renders the **drafts** perspective with
**stega** (click-to-edit) overlays. No code deploy is required to see new or
edited draft content — the preview Worker reads live drafts from Sanity on
every request.

This document is the team runbook. For the architecture rationale (Story 26.12
hybrid restore), see `docs/architecture.md`.

## TL;DR

| Thing | Value |
| :-- | :-- |
| Preview origin | `https://ywcc-capstone-preview.js426.workers.dev` |
| What it serves | Drafts perspective + stega, **always SSR** (14 content routes) |
| Bindings | **None** — content-only. No D1, no KV, no Durable Objects. |
| Secret it needs | **`SANITY_API_READ_TOKEN` only** (runtime secret **and** Workers Builds build variable) |
| How to open it | Sanity Studio → **Presentation** → **capstone** workspace |
| How it deploys | Cloudflare **Workers Builds** on push to the `preview` branch |
| New draft content | Visible **instantly** on refresh — no rebuild needed |

## How preview works now

- The preview Worker is **content-only**. It carries no portal bindings (D1,
  KV, Durable Objects) and does not run auth/portal routes. It is **not** a
  full staging environment.
- It is built with `CLOUDFLARE_ENV=capstone_preview` and
  `PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true`. That build flag flips the 14
  content routes from prerendered to **SSR**, which selects the **drafts**
  perspective and emits stega metadata for the click-to-edit overlay.
- Because the content routes are SSR, **new and edited drafts appear on the
  next iframe refresh** — there is no rebuild step for content.
- The only secret it needs is `SANITY_API_READ_TOKEN`. It does **not** need the
  portal secret set (`BETTER_AUTH_SECRET`, `GITHUB_CLIENT_SECRET`,
  `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`,
  `TURNSTILE_SECRET_KEY`, `SANITY_API_WRITE_TOKEN`) — those are optional for
  `capstone_preview`.

## How an editor uses it

1. Open **Sanity Studio**.
2. Switch to the **capstone** workspace.
3. Open the **Presentation** tool (sidebar icon).
4. Presentation loads `https://ywcc-capstone-preview.js426.workers.dev` in the
   preview iframe at the **canonical** route (no `/preview` prefix — preview
   uses the same paths as the public site).
5. Edit a document; the preview refreshes to show the **draft**. Use the
   click-to-edit (stega) overlay to jump from a rendered element back to its
   field.

## How it deploys

The preview Worker deploys through **Cloudflare Workers Builds** (native
GitHub CI/CD) — **not** GitHub Actions.

- **Automatic:** push/merge to the **`preview`** branch triggers a Workers
  Build that deploys `ywcc-capstone-preview`.
- **Workers Builds config:**
  - Build command: *(empty — Workers Builds auto-installs deps)*
  - Deploy command: `npm run deploy:capstone-preview -w astro-app`
  - Build variable: `SANITY_API_READ_TOKEN`
- **Manual fallback** (local, if Workers Builds is unavailable):

  ```bash
  npm run deploy:capstone-preview -w astro-app
  ```

> Production (`ywcc-capstone`) deploys the same way: Workers Builds on push to
> the `main` branch.

## Publish → production flow

Production content routes stay **prerendered** (for LCP and the `.md`/llms
twins), so a published change reaches production via a rebuild:

1. Editor **publishes** a document in Studio.
2. A Sanity **webhook** (publish-only) calls a Cloudflare **deploy hook**.
3. The deploy hook triggers a **production Workers Build** (~1–2 min rebuild).
4. The published content appears on `ywcccapstone1.com` after that rebuild.

Drafts and unpublished edits never hit production — they only show in the
preview Worker described above.

## Troubleshooting

| Symptom | Likely cause / fix |
| :-- | :-- |
| Workers Build fails on `rss.xml` (or the `.ics` endpoint) | Missing `SANITY_API_READ_TOKEN` **build variable**. The build prerenders those endpoints under Visual Editing (drafts perspective), which requires the read token. Add it to the Workers Builds config. |
| Click-to-edit overlay won't connect / drafts not showing | Confirm you're on the **preview** Worker (`ywcc-capstone-preview.js426.workers.dev`), that it's the **content-only** build, and that it was built with `PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true`. Production runs the flag `false` and serves prerendered published content — it will never show drafts. |
| New draft not appearing | Refresh the Presentation iframe. SSR drafts are live per-request; if still stale, redeploy via the manual fallback. |
| Published change not on production | Wait ~1–2 min for the publish webhook → deploy hook → production Workers Build to finish. If it never fires, check the Sanity webhook and Cloudflare deploy hook. |

## Related files (for engineers)

- `astro-app/astro.config.mjs` — `previewSsrIntegration`; secret schema
  (only `CLOUDFLARE_ENV === "capstone"` keeps portal secrets strict;
  `capstone_preview` and the RWC envs are in the optional branch;
  `SANITY_API_READ_TOKEN` is optional globally).
- `astro-app/src/middleware.ts` — seeds `previewMode` from the build-time
  `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` flag.
- `studio/sanity.config.ts` — `previewOrigin` for the capstone workspace.
- `studio/src/presentation/resolve.ts` — maps capstone docs to **canonical**
  routes (no `/preview` prefix).
- `astro-app/package.json` — `deploy:capstone-preview` script.

> The Story 26.1 cookie model (`__Secure-sanity-preview` cookie,
> `lib/preview-mode.ts` AsyncLocalStorage, `/api/draft-mode/{enable,disable}`)
> is **abandoned/dormant** — it still exists in middleware as a fallback but is
> inert on production. The 26.12 spike's dedicated `/preview/[...path]` route
> was removed. A follow-up cleanup will delete the dormant cookie code.
