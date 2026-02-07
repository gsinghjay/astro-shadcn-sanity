# Story 1.1: Reconfigure Starter & Set Up Design System

Status: done

## Story

As a developer,
I want the starter template reconfigured with Tailwind v4, fulldev/ui component library, and the target directory structure,
So that all future blocks and components build on a consistent, performant foundation.

## Acceptance Criteria

1. `@astrojs/react`, `react`, `react-dom`, `@types/react`, and `@types/react-dom` are removed from `astro-app/` dependencies
2. `@astrojs/vercel` adapter is removed and `output` is set to `'static'` in `astro.config.mjs`
3. Tailwind CSS v4 is installed via `@tailwindcss/vite` plugin in `astro.config.mjs` (NOT the legacy `@astrojs/tailwind`)
4. `global.css` contains `@import "tailwindcss"` (NOT `@tailwind` directives) and shadcn CSS custom properties (`--background`, `--foreground`, `--primary`, `--muted`, etc.) via Tailwind v4 CSS-first configuration
5. NJIT brand color tokens are defined via CSS custom properties in `global.css` (no `tailwind.config.mjs`)
6. shadcn CLI is initialized (`npx shadcn@latest init`) and `components.json` includes the fulldev/ui registry: `{ "registries": { "@fulldev": "https://ui.full.dev/r/{name}.json" } }`
7. Base fulldev/ui primitives are installed (e.g., `npx shadcn@latest add @fulldev/button`) into `src/components/ui/`
8. The `astro-app/src/` directory structure matches Architecture spec: `components/ui/`, `components/blocks/`, `lib/`, `layouts/`, `pages/`, `styles/`
9. The `studio/src/schemaTypes/` directory structure matches Architecture spec: `blocks/`, `documents/`, `objects/`, `helpers/`
10. Sample schemas (`post`, `blockContent`) from the starter are removed
11. `npm run dev` starts both workspaces without errors
12. `npm run build` produces a static build with zero errors

## Tasks / Subtasks

- [x] Task 1: Remove React and Vercel dependencies from astro-app (AC: #1, #2)
  - [x] 1.1: Uninstall `@astrojs/react`, `react`, `react-dom`, `@types/react`, `@types/react-dom` from `astro-app/`
  - [x] 1.2: Remove `@astrojs/vercel` from `astro-app/`
  - [x] 1.3: Remove `autoprefixer` (superseded by Tailwind v4's built-in handling)
  - [x] 1.4: Update `astro.config.mjs`: remove `react()` integration, remove `vercel()` adapter import, remove `output: 'hybrid'`, set `output: 'static'`
  - [x] 1.5: Remove `postcss.config.cjs` (Tailwind v4 via Vite plugin does not use PostCSS)
  - [x] 1.6: Remove `.vercel` from `tsconfig.json` exclude list if present

- [x] Task 2: Upgrade Astro to v5.x (AC: #2)
  - [x] 2.1: Update `astro` package to latest v5.x (`npm install astro@latest` in `astro-app/`)
  - [x] 2.2: Update `@astrojs/check` to latest compatible version
  - [x] 2.3: Update `@sanity/astro` to latest v3.x (confirm React is NOT required in `astro-app/` — it is only needed in `studio/`)
  - [x] 2.4: Verify `astro.config.mjs` uses `output: 'static'` (Astro 5 merged hybrid into static — any page can opt out with `export const prerender = false`)

- [x] Task 3: Install and configure Tailwind CSS v4 (AC: #3, #4, #5)
  - [x] 3.1: Install `tailwindcss` and `@tailwindcss/vite` in `astro-app/`: `npm install tailwindcss @tailwindcss/vite`
  - [x] 3.2: Add `@tailwindcss/vite` plugin to `astro.config.mjs` Vite config (see Dev Notes for exact syntax)
  - [x] 3.3: Create `astro-app/src/styles/global.css` with `@import "tailwindcss"` and `@theme` block containing shadcn CSS custom properties and NJIT brand tokens
  - [x] 3.4: Import `global.css` in `Layout.astro` (replace the existing inline styles)
  - [x] 3.5: Delete the old CSS custom properties and Google Fonts imports from current `Layout.astro`

- [x] Task 4: Initialize shadcn CLI and fulldev/ui registry (AC: #6, #7)
  - [x] 4.1: Configure `tsconfig.json` with path aliases: `"baseUrl": "."` and `"paths": { "@/*": ["./src/*"] }`
  - [x] 4.2: Run `npx shadcn@latest init` in `astro-app/` (creates `components.json`)
  - [x] 4.3: Edit `components.json` to add the fulldev/ui registry: `{ "registries": { "@fulldev": "https://ui.full.dev/r/{name}.json" } }`
  - [x] 4.4: Install base primitives: `npx shadcn@latest add @fulldev/button`
  - [x] 4.5: Verify installed components land in `src/components/ui/` as `.astro` files (NOT `.tsx`)

- [x] Task 5: Create target directory structure (AC: #8, #9)
  - [x] 5.1: Create `astro-app/src/components/blocks/` directory
  - [x] 5.2: Create `astro-app/src/lib/` directory (move `utils/sanity.ts` → `lib/sanity.ts`, `utils/image.ts` → `lib/image.ts`)
  - [x] 5.3: Remove `astro-app/src/utils/` directory after migration (includes `utils/index.ts` which re-exports — update imports accordingly)
  - [x] 5.4: Ensure `astro-app/src/styles/` directory exists (created in Task 3)
  - [x] 5.5: Create `studio/src/schemaTypes/blocks/` directory
  - [x] 5.6: Create `studio/src/schemaTypes/helpers/` directory
  - [x] 5.7: Verify `studio/src/schemaTypes/documents/` and `studio/src/schemaTypes/objects/` directories exist (they do from starter)

- [x] Task 6: Clean up starter sample content (AC: #10)
  - [x] 6.1: Delete `studio/src/schemaTypes/documents/post.ts`
  - [x] 6.2: Delete `studio/src/schemaTypes/objects/blockContent.tsx`
  - [x] 6.3: Update `studio/src/schemaTypes/index.ts` to export an empty `schemaTypes` array (remove post and blockContent references)
  - [x] 6.4: Delete `astro-app/src/pages/post/[slug].astro`
  - [x] 6.5: Clean up `astro-app/src/pages/index.astro` — remove post-listing content, replace with minimal placeholder
  - [x] 6.6: Delete `astro-app/src/components/Card.astro` and `astro-app/src/components/Welcome.astro` (starter samples)
  - [x] 6.7: Clean up `Layout.astro` — remove old starter styles, ensure it imports `global.css` and renders a clean HTML shell

- [x] Task 7: Validate build and dev server (AC: #11, #12)
  - [x] 7.1: Run `npm run dev` from project root — both workspaces must start without errors
  - [x] 7.2: Run `npm run build` from `astro-app/` — must produce static output in `dist/` with zero errors
  - [x] 7.3: Verify Sanity Studio still starts without schema errors (empty schema is fine)
  - [x] 7.4: Verify no React imports remain anywhere in `astro-app/src/`

## Dev Notes

### Current Project State (Critical Context)

The project is initialized from `sanity-template-astro-clean`. Current state:

**astro-app/ has these problems to fix:**
- Astro v4.11.3 (needs upgrade to v5.x)
- `@astrojs/react` + `react` + `react-dom` installed (must remove)
- `@astrojs/vercel` adapter with `output: 'hybrid'` (must remove/change)
- No Tailwind CSS installed
- No shadcn/fulldev/ui installed
- Uses custom CSS with Google Fonts (Inter, PT Serif, IBM Plex Mono) — replace with Tailwind
- `postcss.config.cjs` only has autoprefixer — will be replaced by Tailwind v4 Vite plugin
- Utility files in `src/utils/` (must move to `src/lib/`)
- Sample components: `Card.astro`, `Welcome.astro` (must remove)
- Sample page: `post/[slug].astro` (must remove)

**studio/ has these problems to fix:**
- Sample schemas: `documents/post.ts`, `objects/blockContent.tsx` (must remove)
- Missing directories: `blocks/`, `helpers/`

### astro.config.mjs — Target State

```javascript
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import sanity from "@sanity/astro";
import tailwindcss from "@tailwindcss/vite";

const {
  PUBLIC_SANITY_STUDIO_PROJECT_ID,
  PUBLIC_SANITY_STUDIO_DATASET,
  PUBLIC_SANITY_PROJECT_ID,
  PUBLIC_SANITY_DATASET,
} = loadEnv(import.meta.env.MODE, process.cwd(), "");

const projectId = PUBLIC_SANITY_STUDIO_PROJECT_ID || PUBLIC_SANITY_PROJECT_ID;
const dataset = PUBLIC_SANITY_STUDIO_DATASET || PUBLIC_SANITY_DATASET;

export default defineConfig({
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sanity({
      projectId,
      dataset,
      useCdn: false,
      apiVersion: "2024-12-08",
    }),
  ],
});
```

**Key changes from current:**
- Removed: `import react from "@astrojs/react"`
- Removed: `import vercel from "@astrojs/vercel/serverless"`
- Removed: `adapter: vercel(...)`
- Changed: `output: "hybrid"` → `output: "static"`
- Added: `import tailwindcss from "@tailwindcss/vite"` + `vite.plugins`
- Removed: `react()` from integrations array

### global.css — Target State

```css
@import "tailwindcss";

@theme {
  /* shadcn CSS variable system */
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  /* shadcn base tokens (light mode) */
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;
  --destructive: 0 84.2% 60.2%;
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 0 0% 3.9%;
  --radius: 0.5rem;

  /* NJIT Brand Colors */
  /* Primary: NJIT Red */
  --njit-red: 0 100% 40%;
  /* Secondary: NJIT Dark Blue / Navy */
  --njit-navy: 220 60% 20%;
  /* Accent */
  --njit-gold: 45 100% 50%;
  /* Neutrals — use shadcn defaults above */
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**IMPORTANT:** The exact NJIT brand hex values are not yet confirmed. The HSL values above are placeholders. Confirm exact values during implementation by checking the reference site (ywcccapstone1.com) or NJIT brand guidelines. Map confirmed values to the `--njit-*` custom properties and optionally override `--primary` to use NJIT Red.

### tsconfig.json — Required Changes

Add to `compilerOptions`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Remove from `exclude`: `".vercel"` (no longer using Vercel).

### components.json — Target State

After `npx shadcn@latest init`, edit to include:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": false,
  "tailwind": {
    "config": "",
    "css": "src/styles/global.css",
    "baseColor": "neutral"
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  },
  "registries": {
    "@fulldev": "https://ui.full.dev/r/{name}.json"
  }
}
```

**Key points:**
- `rsc: false` — not using React Server Components
- `tsx: false` — using `.astro` files, not `.tsx`
- `tailwind.config` is empty string — Tailwind v4 CSS-first, no config file
- The shadcn init wizard may ask questions — choose: New York style, Neutral base color, CSS variables enabled

### File Migration Map

| Current Location | Target Location | Action |
|---|---|---|
| `src/utils/sanity.ts` | `src/lib/sanity.ts` | Move |
| `src/utils/image.ts` | `src/lib/image.ts` | Move |
| `src/utils/index.ts` | (delete) | Remove re-export barrel |
| `src/components/Card.astro` | (delete) | Starter sample |
| `src/components/Welcome.astro` | (delete) | Starter sample |
| `src/pages/post/[slug].astro` | (delete) | Starter sample |
| `src/layouts/Layout.astro` | `src/layouts/Layout.astro` | Rewrite (clean shell) |
| `src/pages/index.astro` | `src/pages/index.astro` | Rewrite (minimal placeholder) |

### Studio Schema Cleanup

| File | Action |
|---|---|
| `studio/src/schemaTypes/documents/post.ts` | Delete |
| `studio/src/schemaTypes/objects/blockContent.tsx` | Delete |
| `studio/src/schemaTypes/index.ts` | Rewrite to export empty array |

Target `studio/src/schemaTypes/index.ts`:
```typescript
import type { SchemaTypeDefinition } from 'sanity'

export const schemaTypes: SchemaTypeDefinition[] = []
```

### Project Structure Notes

Target `astro-app/src/` structure after this story:
```
src/
├── components/
│   ├── ui/          # fulldev/ui primitives (installed via shadcn CLI)
│   │   └── button.astro   # At minimum — more added as needed
│   └── blocks/      # Empty — populated in future stories
├── layouts/
│   └── Layout.astro  # Clean HTML shell importing global.css
├── lib/
│   ├── sanity.ts     # Moved from utils/
│   └── image.ts      # Moved from utils/
├── pages/
│   └── index.astro   # Minimal placeholder
├── styles/
│   └── global.css    # Tailwind v4 + shadcn tokens + NJIT brand
└── env.d.ts
```

Target `studio/src/schemaTypes/` structure after this story:
```
schemaTypes/
├── blocks/        # Empty — populated in Story 1.2
├── documents/     # Empty — populated in Story 1.2
├── objects/       # Empty — populated in Story 1.2
├── helpers/       # Empty — populated in Story 1.2
└── index.ts       # Exports empty schemaTypes array
```

### Architecture Compliance

**Anti-patterns to avoid:**
- Do NOT install `@astrojs/tailwind` — that is Tailwind v3. Use `@tailwindcss/vite` for v4.
- Do NOT create `tailwind.config.mjs` — Tailwind v4 uses CSS-first configuration via `@theme` in `global.css`
- Do NOT use `@tailwind base; @tailwind components; @tailwind utilities;` — Tailwind v4 uses `@import "tailwindcss"`
- Do NOT keep any React imports in `astro-app/` — React stays only in `studio/`
- Do NOT use arbitrary Tailwind values like `bg-[#cc0000]` — use design tokens
- Do NOT add `postcss.config.cjs` — `@tailwindcss/vite` handles everything

**Patterns to follow:**
- All CSS theme configuration via `@theme` block in `global.css`
- Import components with `@/` path alias (e.g., `import { Button } from "@/components/ui/button"`)
- fulldev/ui components are vanilla `.astro` files — zero framework runtime
- Keep `@sanity/astro` integration — it works without React in the frontend

### Library & Framework Requirements

| Package | Version | Purpose | Workspace |
|---|---|---|---|
| `astro` | ^5.x (latest) | SSG framework | astro-app |
| `tailwindcss` | ^4.x (latest) | CSS utility framework | astro-app |
| `@tailwindcss/vite` | ^4.x (latest) | Vite plugin for Tailwind v4 | astro-app |
| `@sanity/astro` | ^3.x (latest) | Sanity CMS integration | astro-app |
| `@sanity/image-url` | ^1.x | Image URL builder | astro-app |
| `groq` | ^3.x | GROQ query builder | astro-app |
| `astro-portabletext` | ^0.10.x | Portable Text renderer | astro-app |
| `sanity` | ^4.x | Sanity Studio | studio |

**Packages to REMOVE from astro-app:**
- `@astrojs/react`
- `@astrojs/vercel`
- `react`
- `react-dom`
- `@types/react`
- `@types/react-dom`
- `autoprefixer`

### Testing Requirements

- `npm run dev` in project root starts both workspaces with zero errors
- `npm run build` in `astro-app/` produces `dist/` directory with static HTML
- No React-related imports exist in any `astro-app/src/` file
- Tailwind classes render correctly (test by adding a `class="text-primary bg-background"` to placeholder page)
- Sanity Studio starts without schema errors at `localhost:3333`
- fulldev/ui button component exists at `src/components/ui/button.astro` and is a valid `.astro` file

### Astro 5.x Migration Notes

- `output: 'hybrid'` no longer exists — it's now `output: 'static'` which includes hybrid behavior
- Any page can opt out of prerendering with `export const prerender = false`
- The `@astrojs/vercel` adapter is only needed for server-rendered routes — remove entirely for pure static
- `@astrojs/check` may need updating to match Astro 5.x

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation — Required Modifications to Starter]
- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions — Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries — Complete Project Directory Structure]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1: Reconfigure Starter & Set Up Design System]
- [Source: _bmad-output/planning-artifacts/prd.md#Non-Functional Requirements — Performance, Maintainability]
- [Source: Astro v5 Upgrade Guide — output: 'hybrid' removed, merged into 'static']
- [Source: Tailwind CSS v4 docs — @tailwindcss/vite installation, @import "tailwindcss" syntax]
- [Source: fulldev/ui docs (ui.full.dev/docs/installation) — shadcn CLI init, @fulldev registry, .astro components]
- [Source: shadcn/ui docs — components.json registries namespace configuration]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- `@tailwindcss/vite` build failed with `D.createIdResolver is not a function` due to Vite 5.x in devDependencies conflicting with Astro 5's internal Vite 6. Fixed by upgrading `vite` devDependency to latest.
- `tsc --noEmit` fails on `.astro` module imports from `.ts` files. Removed redundant `tsc --noEmit` from build script since `astro check` already handles type checking.
- `npx shadcn@latest add @fulldev/button` failed with ESM parse error. Manually fetched component from fulldev/ui registry endpoint and created files directly.

### Completion Notes List

- AC#1: Removed @astrojs/react, react, react-dom, @types/react, @types/react-dom from astro-app
- AC#2: Removed @astrojs/vercel, set output: 'static'. Upgraded Astro to v5.17.1
- AC#3: Installed tailwindcss@4.1.18 + @tailwindcss/vite@4.1.18 via Vite plugin in astro.config.mjs
- AC#4: global.css contains @import "tailwindcss" with @theme block and shadcn CSS custom properties
- AC#5: NJIT brand tokens (--njit-red, --njit-navy, --njit-gold) defined as CSS custom properties in global.css
- AC#6: components.json created with fulldev/ui registry configured
- AC#7: fulldev/ui button primitive installed at src/components/ui/button/button.astro
- AC#8: astro-app/src/ structure matches spec: components/ui/, components/blocks/, lib/, layouts/, pages/, styles/
- AC#9: studio/src/schemaTypes/ structure matches spec: blocks/, documents/, objects/, helpers/
- AC#10: Sample schemas (post, blockContent) and sample pages/components removed
- AC#11: npm run dev starts both workspaces (Astro at :4321, Studio at :3333) without errors
- AC#12: npm run build produces static output in dist/ with zero errors
- Additional: lib/utils.ts created with cn() helper (required by fulldev/ui components). lib/sanity.ts cleaned of post-specific code. Vite upgraded to latest for @tailwindcss/vite compatibility. Added class-variance-authority, clsx, tailwind-merge dependencies.

### File List

**New files:**
- astro-app/src/styles/global.css
- astro-app/src/lib/utils.ts
- astro-app/src/components/ui/button/button.astro
- astro-app/src/components/ui/button/index.ts
- astro-app/components.json
- astro-app/src/components/blocks/ (empty directory)
- studio/src/schemaTypes/blocks/ (empty directory)
- studio/src/schemaTypes/helpers/ (empty directory)

**Modified files:**
- README.md (rewritten: comprehensive project documentation)
- astro-app/package.json (removed deps, added tailwind/shadcn deps, updated build script)
- astro-app/astro.config.mjs (removed react/vercel, added tailwindcss/vite, set output: static)
- astro-app/tsconfig.json (added baseUrl/paths, removed .vercel from exclude, trimmed to extend Astro strict preset)
- astro-app/src/layouts/Layout.astro (rewritten: clean HTML shell, imports global.css)
- astro-app/src/pages/index.astro (rewritten: minimal placeholder with Tailwind classes)
- astro-app/src/lib/sanity.ts (moved from utils/, cleaned post-specific code)
- astro-app/src/lib/image.ts (moved from utils/)
- studio/src/schemaTypes/index.ts (rewritten: empty schemaTypes array)
- package-lock.json

**Deleted files:**
- astro-app/postcss.config.cjs
- astro-app/src/utils/sanity.ts (moved to lib/)
- astro-app/src/utils/image.ts (moved to lib/)
- astro-app/src/utils/index.ts
- astro-app/src/components/Card.astro
- astro-app/src/components/Welcome.astro
- astro-app/src/pages/post/[slug].astro
- studio/src/schemaTypes/documents/post.ts
- studio/src/schemaTypes/objects/blockContent.tsx

## Senior Developer Review (AI)

**Reviewer:** Jay (Code Review Workflow)
**Date:** 2026-02-07
**Outcome:** Changes Requested → Fixed

### Findings (9 total: 3 HIGH, 4 MEDIUM, 2 LOW)

**Fixed (HIGH):**
1. `tsconfig.json` had `"includes"` (typo) instead of `"include"` — TypeScript silently ignores the misspelled key. Fixed.
2. `sanity` full Studio package (~30MB) was listed as a production dependency of `astro-app/` — violates workspace boundary. Removed.
3. `"jsx": "preserve"` left in `tsconfig.json` as React artifact — removed along with all redundant compiler options already provided by `astro/tsconfigs/strict`.

**Fixed (MEDIUM):**
4. `README.md` was modified but not documented in File List. Added.
5. `@astrojs/check` version `^0.9.6` — verified this IS the latest stable version. No action needed (finding withdrawn).
6. Button component installed as `ui/button/button.astro` + barrel `index.ts` instead of flat `ui/button.astro`. Accepted as fulldev/ui default pattern — noted for consistency in future stories.
7. `tsconfig.json` had 14 redundant compiler options duplicating `astro/tsconfigs/strict`. Trimmed to only `baseUrl` and `paths`.

**Acknowledged (LOW):**
8. `_bmad-output/planning-artifacts/architecture.md` modified but not in File List — planning artifact, outside story scope.
9. Button component renders nothing when no slot content provided — fulldev/ui default behavior, not a bug.

### Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-07 | Code Review (AI) | Fixed tsconfig.json: renamed `includes` to `include`, removed `jsx: preserve`, trimmed redundant options, changed `*.tsx` to `*.astro` in include |
| 2026-02-07 | Code Review (AI) | Removed `sanity` package from astro-app/package.json dependencies |
| 2026-02-07 | Code Review (AI) | Added README.md to story File List |
