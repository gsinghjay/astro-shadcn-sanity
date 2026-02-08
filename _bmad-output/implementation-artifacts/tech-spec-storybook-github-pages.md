# Tech Spec: Deploy Storybook to GitHub Pages

## Overview

Manually-triggered GitHub Actions workflow that builds Storybook and deploys it to GitHub Pages.

## Trigger

- `workflow_dispatch` (manual) from the Actions tab
- No automatic triggers

## Workflow Steps

1. **Checkout** repo
2. **Setup Node** (v22, npm cache)
3. **Install** dependencies (`npm ci`)
4. **Build Storybook** (`npm run build-storybook --workspace=astro-app`)
5. **Upload** `astro-app/storybook-static/` as GitHub Pages artifact
6. **Deploy** to GitHub Pages

## Configuration

### Repository Settings

- Settings > Pages > Source: **GitHub Actions**

### Workflow File

- `.github/workflows/deploy-storybook.yml`

### Permissions

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### Environment

- Uses `github-pages` environment with `url` output from deploy step

## Result

Published at: `https://gsinghjay.github.io/astro-shadcn-sanity/`
