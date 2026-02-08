# Storybook on GitHub Pages

Our component library (Storybook) is published to GitHub Pages so anyone on the team can browse it in a browser — no local setup required.

**Live URL:** https://gsinghjay.github.io/astro-shadcn-sanity/

## How It Works

We use **GitHub Actions** to build and deploy Storybook. Here's the flow:

```
Someone clicks "Run workflow"
        ↓
GitHub spins up a fresh Linux server
        ↓
Installs Node.js and our dependencies
        ↓
Builds Storybook into static HTML/CSS/JS
        ↓
Uploads the files to GitHub Pages
        ↓
Site is live at the URL above
```

This is a **manual** process — the site only updates when someone triggers the workflow. It does not auto-deploy on every push.

## Triggering a Deploy

### Step 1: Go to the Actions tab

Open the repository on GitHub and click the **Actions** tab at the top.

### Step 2: Select the workflow

In the left sidebar, click **"Deploy Storybook to GitHub Pages"**.

### Step 3: Run it

Click the **"Run workflow"** button on the right side, select the `main` branch, and click the green **"Run workflow"** button in the dropdown.

### Step 4: Wait

The workflow takes about 1–2 minutes. You can watch the progress by clicking on the running workflow. When all steps show green checkmarks, the deploy is complete.

### Step 5: View the site

Go to https://gsinghjay.github.io/astro-shadcn-sanity/ — you should see the updated Storybook.

## One-Time Setup (Already Done)

This section documents what was configured so you understand the full picture. You don't need to do any of this — it's already set up.

### 1. Repository Settings

In the repo's **Settings > Pages** section, the "Build and deployment" source was changed from the default ("Deploy from a branch") to **"GitHub Actions"**. This tells GitHub to use our custom workflow instead of trying to build the site with Jekyll.

### 2. Workflow File

The workflow lives at `.github/workflows/deploy-storybook.yml` in the repo. Here's what each part does:

| Section | What it does |
|---|---|
| `on: workflow_dispatch` | Makes the workflow manual-only (no automatic triggers) |
| `permissions` | Grants the workflow permission to read code and write to GitHub Pages |
| `concurrency` | Prevents two deploys from running at the same time |
| `actions/checkout` | Downloads our code onto the build server |
| `actions/setup-node` | Installs Node.js 22 and caches npm packages for speed |
| `npm ci` | Installs all project dependencies from the lockfile |
| `npm run build-storybook` | Compiles Storybook into static files in `astro-app/storybook-static/` |
| `STORYBOOK_BASE_PATH` | Sets the base path so assets load correctly under `/astro-shadcn-sanity/` |
| `actions/configure-pages` | Prepares the GitHub Pages environment |
| `actions/upload-pages-artifact` | Packages the static files for deployment |
| `actions/deploy-pages` | Publishes the files to GitHub Pages |

## Troubleshooting

### Stories load but show 404 for assets

GitHub Pages serves the site from a subdirectory (`/astro-shadcn-sanity/`), not the root. The workflow sets `STORYBOOK_BASE_PATH=/astro-shadcn-sanity/` so Vite prefixes all asset URLs correctly. If you see broken assets, check that this env var is present in the workflow file.

### The site shows a 404

- Confirm that **Settings > Pages > Source** is set to "GitHub Actions" (not "Deploy from a branch")
- Check that the workflow completed successfully in the Actions tab

### The workflow failed

- Click on the failed workflow run in the Actions tab
- Click on the failed job to expand the logs
- Look for red error text — common causes:
  - **npm ci failed**: A dependency issue. Try re-running the workflow.
  - **build-storybook failed**: A component has a build error. This needs a code fix on `main`.

### The site is outdated

The site only updates when someone manually triggers the workflow. If you've merged new component changes to `main`, you need to run the workflow again.

## FAQ

**Q: Is the site public?**
Yes. Anyone with the URL can view it. The repository can be private, but GitHub Pages sites on the free plan are always public.

**Q: Can I break the main site by running this?**
No. This workflow only affects the GitHub Pages deployment. It has no impact on the main application, the Sanity studio, or any other part of the project.

**Q: Who can trigger the workflow?**
Anyone with write access to the repository.

**Q: Can we make it auto-deploy on every push?**
Yes — by changing `on: workflow_dispatch` to `on: push: branches: [main]` in the workflow file. We keep it manual for now to control when the site updates.
