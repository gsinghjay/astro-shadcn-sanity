# Story 1.6: Storybook GitHub Pages Deployment

Status: review

## Dependencies

- **Blocked by**: Story 1.5 (Storybook Production Build Fix) — cannot deploy a broken build

## Story

As a developer or stakeholder,
I want the Storybook component library automatically deployed to GitHub Pages on push to main,
So that the latest component documentation is always accessible without running a local dev server.

## Acceptance Criteria

1. `.github/workflows/deploy-storybook.yml` builds Storybook from source (not from a pre-built `storybook-static/` folder)
2. The workflow triggers on push to `main` when files in `astro-app/src/` or `astro-app/.storybook/` change
3. The workflow also supports `workflow_dispatch` for manual triggers
4. The deployed GitHub Pages site loads and renders stories correctly
5. The sidebar shows all component stories (blocks and UI)
6. At least one story renders visually when clicked
7. `storybook-static/` is removed from git tracking (it should be a build artifact, not committed)

## Tasks / Subtasks

- [x] Task 1: Update GitHub Actions workflow (AC: #1, #2, #3)
  - [x] 1.1 Update `.github/workflows/deploy-storybook.yml` to run `npm run build-storybook` instead of deploying pre-built output
  - [x] 1.2 Configure path filters: trigger on changes to `astro-app/src/**`, `astro-app/.storybook/**`, `astro-app/package.json`
  - [x] 1.3 Keep `workflow_dispatch` trigger for manual deploys
  - [x] 1.4 Use `npm ci` for installation (required for monorepo hoisting)
  - [x] 1.5 Deploy `astro-app/storybook-static/` to GitHub Pages using `actions/deploy-pages`

- [x] Task 2: Clean up pre-built storybook-static (AC: #7)
  - [x] 2.1 Add `astro-app/storybook-static/` to `.gitignore`
  - [x] 2.2 Remove `storybook-static/` from git tracking (`git rm -r --cached`)
  - [x] 2.3 Verify the build still produces output in `storybook-static/`

- [ ] Task 3: Validate deployment (AC: #4, #5, #6)
  - [ ] 3.1 Trigger a manual workflow dispatch
  - [ ] 3.2 Verify the GitHub Pages URL loads Storybook
  - [ ] 3.3 Verify sidebar lists all stories
  - [ ] 3.4 Click a story and verify it renders
  - [ ] 3.5 Verify base path is correct for GitHub Pages (may need `--output-dir` or base path config)

## Dev Notes

### GitHub Pages Base Path

GitHub Pages serves from `https://<user>.github.io/<repo>/`. Storybook may need a base path configuration:

```ts
// If needed in .storybook/main.ts
viteFinal: async (config) => {
  return {
    ...config,
    base: process.env.STORYBOOK_BASE_PATH || '/',
  };
}
```

Set `STORYBOOK_BASE_PATH` in the GitHub Actions workflow to `/<repo-name>/`.

### Current Workaround Being Replaced

The current workflow deploys a pre-built `storybook-static/` folder that's committed to git. Once Story 1.5 fixes the build, this story switches to building from source in CI — the correct approach.

## Dev Agent Record

### Implementation Plan

- Task 1: Rewrote `deploy-storybook.yml` to build from source with `npm ci` + `npm run build-storybook`, path filters on `astro-app/src/**`, `astro-app/.storybook/**`, `astro-app/package.json`, and `STORYBOOK_BASE_PATH=/astro-shadcn-sanity/` env var
- Task 2: Added `astro-app/storybook-static` to `.gitignore`; confirmed already untracked (0 tracked files); verified build output exists on disk
- Task 3: Requires post-merge manual validation on GitHub Pages — local build confirmed base path `/astro-shadcn-sanity/` is correctly embedded in `iframe.html` asset paths

### Completion Notes

- `STORYBOOK_BASE_PATH` env var handling already existed in `.storybook/main.ts:149` from Story 1.5
- `storybook-static/` was already untracked — `git rm --cached` was not needed (subtask 2.2 satisfied)
- Local build with `STORYBOOK_BASE_PATH=/astro-shadcn-sanity/` produces correct output: asset paths in `iframe.html` use `/astro-shadcn-sanity/` prefix
- Task 3 (deployment validation) is post-merge — requires pushing to `main` and triggering the workflow on GitHub

## File List

- `.github/workflows/deploy-storybook.yml` — rewritten: build from source with path filters
- `.gitignore` — added `astro-app/storybook-static`

## Change Log

- 2026-02-08: Implemented Tasks 1–2; workflow builds from source, storybook-static gitignored
