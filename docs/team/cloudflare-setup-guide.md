# Cloudflare Pages Setup & Testing Guide

Guide for deploying the Astro site to Cloudflare Pages with GA4 analytics, security headers, GitHub Actions CI/CD, and build caching.

---

## Prerequisites

- Cloudflare account ([sign up free](https://dash.cloudflare.com/sign-up))
- GitHub repository access with admin permissions (for secrets/variables)
- Node.js 22+ installed locally
- Optional: GA4 property for analytics tracking

---

## 1. Create Cloudflare Pages Project

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create**
2. Select **Pages** → **Connect to Git** (or skip git — we deploy via wrangler)
3. If using direct upload: **Create project** with name `ywcc-capstone`
4. If connecting GitHub: select the `astro-shadcn-sanity` repo, but **cancel the auto-build** — our GitHub Actions workflow handles this

> **Note:** You can skip this step entirely. The first `wrangler pages deploy` will auto-create the project.

---

## 2. Get Cloudflare Credentials

### Account ID

1. [dash.cloudflare.com](https://dash.cloudflare.com) → right sidebar → **Account ID**
2. Copy it — you'll need it for both local testing and GitHub

### API Token

1. Go to [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) → **Create Token**
2. You'll see a list of pre-built templates (Edit zone DNS, Edit Cloudflare Workers, etc.) — **ignore all of them**
3. At the top under **Custom token**, click the **"Get started"** button
4. Configure the token:
   - **Token name:** `ywcc-capstone-pages-deploy`
   - **Permissions** (three dropdowns in a row):
     - First dropdown: **Account**
     - Second dropdown: **Cloudflare Pages**
     - Third dropdown: **Edit**
   - **Account Resources:** Select **Include** → pick **your account** from the dropdown
   - Leave everything else as default (Zone Resources, Client IP filtering, TTL)
5. Click **Continue to summary** → review → **Create Token**
6. Copy the token value immediately — it is shown **only once**

> **Why not "Edit Cloudflare Workers"?** That template gives broader permissions than needed. A custom token scoped to just Cloudflare Pages Edit is the least-privilege approach.

---

## 3. Local Deploy Test (Before GitHub Actions)

Test the deployment from your local machine before setting up CI/CD.

```bash
# From repo root, set credentials
export CLOUDFLARE_API_TOKEN="your-token-here"
export CLOUDFLARE_ACCOUNT_ID="your-account-id-here"

# Build
npm run build --workspace=astro-app

# Deploy directly from local machine
cd astro-app
npx wrangler pages deploy dist/ --project-name=ywcc-capstone
cd ..
```

This deploys to `https://ywcc-capstone.pages.dev`. Verify:

- Site loads with HTTPS
- Pages render (homepage, about, sponsors, projects, contact)
- View page source → CSP meta tag is present
- Browser DevTools → Network → check response headers for `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`

---

## 4. Test with GA4 (Optional)

If you have a GA4 property:

1. Get your measurement ID from [analytics.google.com](https://analytics.google.com) → Admin → Data Streams → your stream → **Measurement ID** (format: `G-XXXXXXXXXX`)
2. Add to `astro-app/.env`:
   ```
   PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
   ```
3. Rebuild and redeploy:
   ```bash
   npm run build --workspace=astro-app
   cd astro-app && npx wrangler pages deploy dist/ --project-name=ywcc-capstone && cd ..
   ```
4. Visit the deployed site → View Source → confirm `gtag.js` script with your ID
5. Check GA4 Real-Time reports for page views

> If you don't have a GA4 property yet, skip this — the script is conditionally omitted when the ID is empty.

---

## 5. Local Wrangler Preview (Alternative to Deploy)

Preview the build locally using Cloudflare's miniflare runtime:

```bash
cd astro-app
npx wrangler pages dev dist/
```

This runs locally (usually on `http://localhost:8788`). Verify pages render. Press `Ctrl+C` to stop.

> **Note:** The `_headers` security response headers won't be applied in local preview — that's Cloudflare Pages infrastructure only.

---

## 6. Configure GitHub for Automated Deploys

### Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **Secrets** tab → **New repository secret**

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | The API token from step 2 |
| `CLOUDFLARE_ACCOUNT_ID` | Your account ID from step 2 |
| `SANITY_API_READ_TOKEN` | Sanity read token (same as your local `astro-app/.env`) |

### Variables

Go to **Settings** → **Secrets and variables** → **Actions** → **Variables** tab → **New repository variable**

| Variable | Value |
|---|---|
| `PUBLIC_SANITY_STUDIO_PROJECT_ID` | `49nk9b0w` |
| `PUBLIC_SANITY_STUDIO_DATASET` | `production` |
| `PUBLIC_GA_MEASUREMENT_ID` | Your GA4 ID (e.g., `G-XXXXXXXXXX`) or leave empty |
| `PUBLIC_SITE_URL` | `https://ywcc-capstone.pages.dev` |

---

## 7. Test GitHub Actions Pipeline

Once secrets and variables are configured:

1. Go to the **Actions** tab in GitHub
2. Select **Deploy to Cloudflare Pages** workflow
3. Click **Run workflow** (manual dispatch) to test without pushing code
4. Watch the workflow run — target is under 3 minutes
5. Verify the deployment URL in the workflow logs

The workflow also triggers automatically on any push to the `main` branch.

---

## 8. Post-Deploy Verification Checklist

Run through this checklist on the deployed `https://ywcc-capstone.pages.dev`:

- [ ] Site loads with HTTPS
- [ ] All 5 pages render: `/`, `/about`, `/sponsors`, `/projects`, `/contact`
- [ ] View Source: CSP `<meta>` tag present in `<head>`
- [ ] DevTools → Network → select any request → Response Headers show:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- [ ] If GA4 configured: `gtag.js` script in page source + GA4 real-time reports show visits
- [ ] Lighthouse scores 90+ across Performance, Accessibility, Best Practices, SEO

---

## 9. Lighthouse Audit

Run a Lighthouse audit on the deployed site:

1. Open the deployed site in Chrome
2. DevTools (`F12`) → **Lighthouse** tab
3. Check all categories (Performance, Accessibility, Best Practices, SEO)
4. Click **Analyze page load**

**Targets:**

| Category | Target |
|---|---|
| Performance | 90+ (target 95+) |
| Accessibility | 90+ |
| Best Practices | 90+ |
| SEO | 90+ |

> If SEO scores are below 90, it's likely due to missing canonical/OG tags — those are covered in Story 5.1 (SEO & Sitemap), not this deployment story.

---

## 10. Set Up Sanity Webhook (Auto-Rebuild on Publish)

When an editor publishes content in Sanity Studio, the production site should automatically rebuild. Cloudflare Pages only auto-builds on **code pushes** — it has no way to know when content changes in Sanity. A **Cloudflare deploy hook** bridges this gap: Sanity fires a webhook on publish, which hits the deploy hook URL, triggering a Cloudflare Pages build directly.

### Architecture

```mermaid
flowchart LR
    A[Editor publishes\nin Sanity Studio] --> B[Sanity Content Lake\nfires GROQ webhook]
    B --> C[POST to Cloudflare\nDeploy Hook URL]
    C --> D[Cloudflare Pages\nbuilds from git]
    D --> E[Production site\nupdated ~45-75s]

    style A fill:#f9f,stroke:#333
    style D fill:#ff9,stroke:#333
    style E fill:#9f9,stroke:#333
```

This is the simplest possible pipeline — no GitHub Actions in the loop, no PAT tokens to rotate, no intermediate `repository_dispatch`. Cloudflare builds internally using its own build system and build cache (Section 11).

> **Previously** this project used a longer path: Sanity webhook → GitHub `repository_dispatch` → GitHub Actions `npm ci` → build → `wrangler pages deploy`. That approach required a GitHub Fine-Grained PAT, a dedicated `sanity-deploy.yml` workflow, and took ~2-3 minutes. The deploy hook approach eliminates all of that.

```mermaid
flowchart TB
    subgraph old ["Legacy: GitHub Actions Pipeline (~2-3 min)"]
        direction LR
        O1[Sanity webhook] --> O2[GitHub API\nrepository_dispatch]
        O2 --> O3[GitHub Actions\nnpm ci + build]
        O3 --> O4[wrangler pages deploy]
        O4 --> O5[Cloudflare Pages]
    end

    subgraph new ["Current: Cloudflare Deploy Hook (~45-75s)"]
        direction LR
        N1[Sanity webhook] --> N2[Cloudflare\nDeploy Hook]
        N2 --> N3[Cloudflare Pages\nbuilds from git]
    end

    style old fill:#fee,stroke:#c33
    style new fill:#efe,stroke:#3c3
```

### 10a. Create the Cloudflare Deploy Hook

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → your `ywcc-capstone` Pages project
2. Navigate to **Settings** → **Builds & deployments** → **Deploy hooks**
3. Click **Add deploy hook**
4. Configure:
   - **Name:** `Sanity Content Publish`
   - **Branch:** `main`
5. Click **Save**
6. **Copy the generated URL** — it looks like `https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/...`

> **Important:** The deploy hook URL acts as the secret. Anyone with this URL can trigger a build. Do not commit it to the repository or share it publicly.

### 10b. Configure the Sanity Webhook

1. Go to [sanity.io/manage](https://sanity.io/manage) → your project → **API** → **Webhooks**
2. Edit the existing `Trigger production rebuild` webhook (or create a new one)
3. Fill in:

| Field | Value |
|---|---|
| **Name** | `Trigger production rebuild` |
| **URL** | The Cloudflare deploy hook URL from step 10a |
| **Trigger on** | Create, Update, Delete |
| **Filter** | `_type in ["page", "siteSettings", "sponsor", "project", "team", "event"]` |
| **Drafts** | OFF (only fire on publish, not every keystroke) |
| **HTTP method** | POST |
| **HTTP Headers** | _(none required — remove any existing Authorization/Accept headers)_ |
| **Projection** | _(leave empty — deploy hooks don't need a request body)_ |
| **Secret** | Optional — add a secret string for the audit trail |

4. Enable the webhook and save

> **If migrating from the old GitHub-based webhook:** Remove the `Authorization: token ...` and `Accept: application/vnd.github+json` headers, clear the projection field, and replace the URL. Everything else stays the same.

### 10c. Verify

1. Publish a content change in Sanity Studio
2. Check **sanity.io/manage** → Webhooks → your webhook → **Attempts** tab → should show `200 OK`
3. Check **Cloudflare Pages dashboard** → **Deployments** → a new production build should appear
4. Build should complete in ~45-75 seconds (with build cache enabled — see Section 11)
5. Verify the production site at `https://ywcc-capstone.pages.dev` shows the updated content

### 10d. Clean Up Legacy Workflow

Once the deploy hook is verified working:

1. **Delete** `.github/workflows/sanity-deploy.yml` — Cloudflare handles content rebuilds now
2. **Revoke** the GitHub Fine-Grained PAT (`Sanity Webhook`) at [github.com/settings/tokens](https://github.com/settings/tokens) — it's no longer needed
3. **Optionally remove** the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` GitHub Actions secrets if no other workflow uses them

### 10e. Troubleshooting

- **Webhook shows 403:** The deploy hook URL is wrong or the hook was deleted. Recreate it in the CF Pages dashboard and update the Sanity webhook URL.
- **Webhook shows 200 but no build appears:** Check that the deploy hook is configured for the `main` branch and that the CF Pages project has git integration active (not direct upload).
- **Build triggers but fails:** Check the Cloudflare Pages build log in the dashboard. Common issues: missing environment variables (Section 6), monorepo build command misconfigured.
- **Build succeeds but content is stale:** The build fetches content from the Sanity Content Lake at build time. If you just published, there may be a brief CDN propagation delay. Wait 30 seconds and hard-refresh.
- **Multiple builds triggered per publish:** The Sanity webhook filter should exclude drafts (`Drafts: OFF`). If multiple document types are published simultaneously, Sanity may fire multiple webhook events — Cloudflare deduplicates builds on the same branch within a short window.

### Build Pipeline Summary

```mermaid
flowchart TB
    subgraph triggers ["What triggers a build?"]
        T1[Push to main\nor merge PR] --> CF
        T2[Push to any\nother branch] --> CF
        T3[Sanity content\npublished] --> DH[Deploy Hook] --> CF
    end

    CF[Cloudflare Pages\nBuild System]
    CF --> |main branch| PROD[Production\nywcc-capstone.pages.dev]
    CF --> |other branch| PREV[Preview\nbranch.ywcc-capstone.pages.dev]

    subgraph cache ["Build Cache (Section 11)"]
        C1[npm cache .npm]
        C2[Astro cache node_modules/.astro]
    end

    CF -.-> cache

    style PROD fill:#9f9,stroke:#333
    style PREV fill:#ff9,stroke:#333
    style DH fill:#9df,stroke:#333
```

---

## 11. Enable Build Caching (Beta)

Cloudflare Pages has a native build cache that preserves dependencies and build outputs across deployments. This significantly reduces build times after the first cached build.

### How to Enable

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → your Pages project → **Settings** → **Build** → **Build cache**
2. Click **Enable**
3. The next build establishes the baseline cache. All subsequent builds restore from it automatically.

### What Gets Cached

| Cache | Directory | Effect |
|---|---|---|
| npm global cache | `.npm` | `npm ci` pulls packages from local cache instead of the network |
| Astro build cache | `node_modules/.astro` | Incremental builds — only reprocesses changed pages |

### Expected Impact

| Scenario | Build Time |
|---|---|
| No cache (cold start) | ~2 minutes |
| With build cache (warm) | ~45–75 seconds |
| Self-hosted runner on VPS (Story 5-9) | ~20–30 seconds |

The CF build cache helps all Cloudflare-triggered builds (production deploys on push to `main`, preview deploys on PR branches). For GitHub Actions-triggered builds (CI checks, Sanity webhook deploys), a self-hosted runner on the VPS provides additional speed gains — see Story 5-9.

### Constraints

- **10 GB** storage per project (more than sufficient for this project)
- Cache **expires after 7 days** without a build — if no deploy happens for a week, the next build is cold
- Requires Build System V2 or later (the default for new projects)
- Feature is in beta — behavior may change

### Clearing the Cache

If a build behaves unexpectedly after a dependency change, clear the cache:

1. Go to Pages project → **Settings** → **Build** → **Build cache**
2. Click **Clear Cache**
3. The next build will be a full cold start, re-establishing the cache

> **Reference:** [Cloudflare Pages Build Caching documentation](https://developers.cloudflare.com/pages/configuration/build-caching/)

---

## Quick Reference: One-Shot Local Test

```bash
# Set credentials
export CLOUDFLARE_API_TOKEN="..."
export CLOUDFLARE_ACCOUNT_ID="..."

# Build and deploy
npm run build --workspace=astro-app && cd astro-app && npx wrangler pages deploy dist/ --project-name=ywcc-capstone && cd ..

# Visit
echo "https://ywcc-capstone.pages.dev"
```

---

## Troubleshooting

### Build fails with "Invalid binding `SESSION`"

This is an informational warning from the Cloudflare adapter about KV sessions — it does not affect static builds. Safe to ignore.

### `_headers` not showing in response

- Verify `astro-app/public/_headers` exists (Astro copies it to `dist/` during build)
- Verify `dist/_headers` is present after build: `ls astro-app/dist/_headers`
- `_headers` only works on Cloudflare Pages, not in local dev or wrangler preview

### GA4 script not appearing in page source

- Confirm `PUBLIC_GA_MEASUREMENT_ID` is set in `.env` (not empty string)
- Rebuild after changing `.env` — env vars are baked in at build time

### GitHub Actions workflow fails

- Verify all 3 secrets are set: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `SANITY_API_READ_TOKEN`
- Verify all 4 variables are set: `PUBLIC_SANITY_STUDIO_PROJECT_ID`, `PUBLIC_SANITY_STUDIO_DATASET`, `PUBLIC_GA_MEASUREMENT_ID`, `PUBLIC_SITE_URL`
- Check the API token has `Cloudflare Pages: Edit` permission

### Wrangler local preview shows errors

- Make sure you built first: `npm run build --workspace=astro-app`
- Run from the `astro-app/` directory: `cd astro-app && npx wrangler pages dev dist/`
