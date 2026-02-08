---
title: 'Move Custom Blocks to Subdirectory'
slug: 'move-custom-blocks-to-subdirectory'
created: '2026-02-07'
status: 'completed'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Astro 5', 'Storybook (storybook-astro)', 'TypeScript']
files_to_modify: ['astro-app/src/components/BlockRenderer.astro']
files_to_move: ['HeroBanner', 'StatsRow', 'FeatureGrid', 'FaqSection', 'CtaBanner', 'SponsorCards', 'Timeline', 'TeamGrid', 'LogoCloud', 'TextWithImage', 'ContactForm', 'RichText']
code_patterns: ['PascalCase custom blocks vs kebab-case fulldotdev/ui blocks', 'Stories co-located with components', 'Relative imports in stories (./X.astro)']
test_patterns: ['Storybook stories as visual tests', 'glob: ../src/**/*.stories.@(js|jsx|ts|tsx)']
---

# Tech-Spec: Move Custom Blocks to Subdirectory

**Created:** 2026-02-07

## Overview

### Problem Statement

12 custom project-specific blocks (PascalCase `.astro` + `.stories.ts`) are mixed directly alongside ~100+ vendored fulldotdev/ui blocks (kebab-case) in `astro-app/src/components/blocks/`. This makes it difficult to distinguish project-specific code from third-party components.

### Solution

Move all 12 custom block components and their stories into the existing `blocks/custom/` subdirectory, then update all import paths that reference them.

### Scope

**In Scope:**
- Move 12 `.astro` components to `blocks/custom/`
- Move 12 `.stories.ts` files to `blocks/custom/`
- Update `BlockRenderer.astro` imports (`./blocks/X` → `./blocks/custom/X`)

**Out of Scope:**
- No changes to `lib/types.ts` (no path dependencies)
- No renaming of components or schema types
- No changes to fulldotdev/ui blocks
- No changes to Storybook config (`**` glob already covers subdirectories)
- No changes to story file imports (relative `./X.astro` stays valid after co-located move)

## Context for Development

### Codebase Patterns

- Custom blocks use PascalCase naming (e.g., `HeroBanner.astro`)
- fulldotdev/ui blocks use kebab-case naming (e.g., `hero-1.astro`)
- `BlockRenderer.astro` is the **sole consumer** of custom block imports — verified via grep
- Each custom block has a co-located `.stories.ts` file using relative `./X.astro` imports
- Storybook `main.ts` uses `../src/**/*.stories.@(js|jsx|ts|tsx)` glob — covers subdirectories
- An empty `blocks/custom/` directory already exists
- `lib/types.ts` defines `PageBlock` union type — pure type definitions with no file path dependencies

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `astro-app/src/components/BlockRenderer.astro` | Imports all 12 custom blocks — 12 import paths need updating |
| `astro-app/src/components/blocks/*.astro` (PascalCase) | 12 custom block components to move |
| `astro-app/src/components/blocks/*.stories.ts` | 12 story files to move (co-located with blocks) |
| `astro-app/src/lib/types.ts` | Block type interfaces — NO changes needed |
| `astro-app/.storybook/main.ts` | Story glob pattern — NO changes needed (`**` covers subdirs) |

### Technical Decisions

- Target directory is `blocks/custom/` (already exists, empty)
- Stories move alongside their components to maintain co-location pattern
- Story relative imports (`./X.astro`) remain valid because stories and components move together
- Storybook story discovery glob already covers nested directories — no config changes

## Implementation Plan

### Tasks

- [x] Task 1: Move all 12 custom `.astro` block components to `blocks/custom/`
  - Files: `astro-app/src/components/blocks/{HeroBanner,StatsRow,FeatureGrid,FaqSection,CtaBanner,SponsorCards,Timeline,TeamGrid,LogoCloud,TextWithImage,ContactForm,RichText}.astro`
  - Action: `git mv` each file from `blocks/` to `blocks/custom/`
  - Notes: Use `git mv` to preserve git history

- [x] Task 2: Move all 12 co-located `.stories.ts` files to `blocks/custom/`
  - Files: `astro-app/src/components/blocks/{HeroBanner,StatsRow,FeatureGrid,FaqSection,CtaBanner,SponsorCards,Timeline,TeamGrid,LogoCloud,TextWithImage,ContactForm,RichText}.stories.ts`
  - Action: `git mv` each file from `blocks/` to `blocks/custom/`
  - Notes: Use `git mv` to preserve git history. Relative imports inside stories (`./X.astro`) remain valid since stories and components move together.

- [x] Task 3: Update `BlockRenderer.astro` import paths
  - File: `astro-app/src/components/BlockRenderer.astro`
  - Action: Change all 12 imports from `'./blocks/X.astro'` to `'./blocks/custom/X.astro'`
  - Notes: This is the only file that needs editing. All 12 imports follow the same pattern.
  - Before: `import HeroBanner from './blocks/HeroBanner.astro';`
  - After: `import HeroBanner from './blocks/custom/HeroBanner.astro';`

- [x] Task 4: Verify build and Storybook
  - Action: Run `npm run build` in `astro-app/` to confirm Astro resolves all imports
  - Action: Run `npm run storybook` to confirm stories are discovered and render correctly
  - Notes: Both should work without changes — Astro follows the new paths, Storybook `**` glob covers subdirs
  - Result: Build passes for all custom block imports. 3 pre-existing errors in untracked vendored blocks (blocks-2/3/4.astro) are unrelated.

### Acceptance Criteria

- [x] AC 1: Given the 12 custom `.astro` files existed in `blocks/`, when the move is complete, then all 12 exist in `blocks/custom/` and none remain in `blocks/` (only kebab-case fulldotdev/ui files remain)
- [x] AC 2: Given the 12 `.stories.ts` files existed in `blocks/`, when the move is complete, then all 12 exist in `blocks/custom/` and none remain in `blocks/`
- [x] AC 3: Given `BlockRenderer.astro` imported from `./blocks/X`, when the imports are updated, then all 12 imports reference `./blocks/custom/X`
- [x] AC 4: Given the files have been moved and imports updated, when `npm run build` is executed in `astro-app/`, then the build succeeds with no import resolution errors
- [x] AC 5: Given the stories have been moved to `blocks/custom/`, when Storybook is launched, then all 12 block stories appear and render correctly

## Additional Context

### Dependencies

None — this is a pure file reorganization with no new packages, schema changes, or external dependencies.

### Testing Strategy

- **Build verification**: `npm run build` in `astro-app/` confirms all import paths resolve
- **Storybook verification**: `npm run storybook` confirms story discovery and rendering
- **No unit tests needed**: This is a file move + import path update with no logic changes

### Notes

- **Low risk**: No logic changes, no renaming, no API changes. Pure file reorganization.
- **Git history**: Using `git mv` preserves file history across the move.
- The 12 custom blocks to move (each has `.astro` + `.stories.ts`):
  1. HeroBanner
  2. StatsRow
  3. FeatureGrid
  4. FaqSection
  5. CtaBanner
  6. SponsorCards
  7. Timeline
  8. TeamGrid
  9. LogoCloud
  10. TextWithImage
  11. ContactForm
  12. RichText
