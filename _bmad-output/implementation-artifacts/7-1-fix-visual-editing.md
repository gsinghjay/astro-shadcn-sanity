# Story 7.1: Fix Visual Editing (Critical)

Status: ready-for-dev

<!-- Source: Sanity Code Review (docs/code-review/sanity-code-review_20260209_130832.md) — Issues #10 (Critical), #11 (Medium) -->

## Story

As a content editor,
I want visual editing (click-to-edit, live preview) to work correctly on all pages,
So that I can use Sanity Studio's Presentation tool to navigate and edit content in context.

## Acceptance Criteria

1. **AC1 — stegaClean on template lookup:** `stegaClean` from `@sanity/client/stega` is used on `page.template` in `[...slug].astro` for the template lookup and the `=== 'landing'` comparison (Review Issue #10).
2. **AC2 — stegaClean on block string conditionals:** `stegaClean` is applied to block-level string values used in conditionals: `alignment` in HeroBanner, `backgroundVariant` in CtaBanner and StatsRow, `imagePosition` in TextWithImage, `tier` in SponsorCards (Review Issue #10).
3. **AC3 — loadQuery on catch-all route:** `[...slug].astro` uses the `loadQuery` helper (or `getPage()`) instead of direct `sanityClient.fetch`, so stega encoding, perspective switching, and token injection work on all dynamic pages (Review Issue #11).
4. **AC4 — Visual editing overlays on all pages:** Click-to-edit overlays appear on all pages (homepage, dynamic slug pages), not just the homepage.
5. **AC5 — Template selection works during visual editing:** Template lookup resolves correctly when stega-encoded strings are present (no fallback to DefaultTemplate).
6. **AC6 — Build succeeds:** `npm run build` in `astro-app/` completes without errors after all changes.

## Tasks / Subtasks

- [ ] Task 1: Add `stegaClean` to `[...slug].astro` (AC: #1, #3, #5)
  - [ ] 1.1: Import `stegaClean` from `@sanity/client/stega`
  - [ ] 1.2: Replace `sanityClient.fetch(pageBySlugQuery, { slug })` with `getPage(slug)` to use `loadQuery` wrapper
  - [ ] 1.3: Apply `stegaClean(page.template)` before template lookup and `=== 'landing'` check
  - [ ] 1.4: Verify `getStaticPaths` can remain using `sanityClient.fetch` (it runs at build time only, never during visual editing — stega not needed)
- [ ] Task 2: Add `stegaClean` to HeroBanner.astro (AC: #2)
  - [ ] 2.1: Import `stegaClean` from `@sanity/client/stega`
  - [ ] 2.2: Clean `block.alignment` before the `=== 'center'` comparison on line 11
- [ ] Task 3: Add `stegaClean` to CtaBanner.astro (AC: #2)
  - [ ] 3.1: Import `stegaClean` from `@sanity/client/stega`
  - [ ] 3.2: Clean `block.backgroundVariant` before the map lookup on line 33
- [ ] Task 4: Add `stegaClean` to StatsRow.astro (AC: #2)
  - [ ] 4.1: Import `stegaClean` from `@sanity/client/stega`
  - [ ] 4.2: Clean `block.backgroundVariant` before the `=== 'dark'` comparison on line 10
- [ ] Task 5: Add `stegaClean` to TextWithImage.astro (AC: #2)
  - [ ] 5.1: Import `stegaClean` from `@sanity/client/stega`
  - [ ] 5.2: Clean `block.imagePosition` before the `!== 'left'` comparison on line 11
- [ ] Task 6: Add `stegaClean` to SponsorCards.astro (AC: #2)
  - [ ] 6.1: Import `stegaClean` from `@sanity/client/stega`
  - [ ] 6.2: Clean `sponsor.tier` before the `tierStyles[]` map lookup on line 35
- [ ] Task 7: Verify build and visual editing (AC: #4, #5, #6)
  - [ ] 7.1: Run `cd astro-app && npm run build` — zero errors
  - [ ] 7.2: Verify TypeScript strict mode passes (`astro check`)

## Dev Notes

### The Problem

When Sanity Visual Editing (Presentation tool) is active, string field values contain invisible stega characters for click-to-edit overlays. Any string comparison (`===`, `!==`) or object key lookup (`map[value]`) using a stega-encoded string **silently fails** — the value looks identical visually but has hidden Unicode characters.

**Impact right now:**
- `[...slug].astro` uses `sanityClient.fetch` directly → bypasses stega encoding, perspective switching, and token injection → **visual editing is completely broken on all dynamic pages** (only homepage works via `getPage()`)
- When visual editing IS eventually enabled on dynamic pages, `page.template` lookup will fail → **every page falls back to DefaultTemplate**
- Block components using string conditionals will produce wrong CSS classes during preview

### The Fix Pattern

```typescript
// Import once per file
import { stegaClean } from '@sanity/client/stega';

// Clean any string used in logic (comparisons, map lookups, conditionals)
const cleanValue = stegaClean(dirtyValue);
```

`stegaClean` is safe to call on non-stega strings — it returns the original value unchanged. There is no performance penalty. It's a pure string operation.

### Architecture Compliance

- **All changes are in `astro-app/` workspace only** — no studio changes
- **No new dependencies** — `@sanity/client` is already installed (provides `@sanity/client/stega`)
- **Pattern follows existing codebase** — `loadQuery` and `getPage()` already exist and work on the homepage
- **No GROQ query changes** — queries stay in `src/lib/sanity.ts` as-is
- **No type changes** — `stegaClean` returns the same type it receives

### File-by-File Implementation Guide

#### File 1: `astro-app/src/pages/[...slug].astro`

**Current (broken):**
```astro
---
import { sanityClient, allPageSlugsQuery, pageBySlugQuery } from '@/lib/sanity';
// ...
const page = await sanityClient.fetch(pageBySlugQuery, { slug });
const TemplateComponent = templates[page.template as keyof typeof templates] ?? DefaultTemplate;
---
<Layout title={page.title} description={page.description} hideNav={page.template === 'landing'}>
```

**Target (fixed):**
```astro
---
import { stegaClean } from '@sanity/client/stega';
import { sanityClient, allPageSlugsQuery, getPage } from '@/lib/sanity';
// ...
const page = await getPage(slug!);
// Clean stega from template string before logic operations
const template = stegaClean(page.template);
const TemplateComponent = templates[template as keyof typeof templates] ?? DefaultTemplate;
---
<Layout title={page.title} description={page.description} hideNav={template === 'landing'}>
```

**Key decisions:**
- `getStaticPaths` keeps using `sanityClient.fetch(allPageSlugsQuery)` — it only runs at build time, stega is irrelevant, and it only fetches slug strings (not used in logic)
- Import `getPage` instead of `pageBySlugQuery` — use the existing wrapper
- `slug!` non-null assertion is safe — Astro guarantees it in dynamic routes

#### File 2: `astro-app/src/components/blocks/custom/HeroBanner.astro`

**Add to frontmatter:**
```typescript
import { stegaClean } from '@sanity/client/stega';
// Change line 11:
const isCentered = stegaClean(block.alignment) === 'center';
```

#### File 3: `astro-app/src/components/blocks/custom/CtaBanner.astro`

**Add to frontmatter:**
```typescript
import { stegaClean } from '@sanity/client/stega';
// Change line 33:
const variant = stegaClean(block.backgroundVariant) || 'dark';
```

#### File 4: `astro-app/src/components/blocks/custom/StatsRow.astro`

**Add to frontmatter:**
```typescript
import { stegaClean } from '@sanity/client/stega';
// Change line 10:
const isDark = stegaClean(block.backgroundVariant) === 'dark';
```

#### File 5: `astro-app/src/components/blocks/custom/TextWithImage.astro`

**Add to frontmatter:**
```typescript
import { stegaClean } from '@sanity/client/stega';
// Change line 11:
const isRight = stegaClean(block.imagePosition) !== 'left';
```

#### File 6: `astro-app/src/components/blocks/custom/SponsorCards.astro`

**Add to frontmatter:**
```typescript
import { stegaClean } from '@sanity/client/stega';
```

**Change the tier lookup inside the `.map()` (line 35):**
```typescript
const tier = tierStyles[stegaClean(sponsor.tier) || 'silver'];
```

### What NOT to Change

- **Do NOT modify `src/lib/sanity.ts`** — queries and `loadQuery` are correct as-is
- **Do NOT modify `src/pages/index.astro`** — already uses `getPage()`, works correctly
- **Do NOT modify any Sanity schemas** — this is frontend-only
- **Do NOT add stegaClean to string values used only for rendering** (headings, descriptions, labels) — stega is designed to render correctly in HTML, only clean for logic
- **Do NOT modify `getStaticPaths`** — runs at build time only, stega irrelevant
- **Do NOT modify `about.astro`, `projects.astro`, `sponsors.astro`, `contact.astro`** — these use placeholder data (not Sanity), they'll be addressed in Story 2.2b

### Project Structure Notes

All modified files are in `astro-app/src/`:
```
astro-app/src/
  pages/
    [...slug].astro          ← Task 1 (loadQuery + stegaClean)
  components/blocks/custom/
    HeroBanner.astro          ← Task 2 (stegaClean alignment)
    CtaBanner.astro           ← Task 3 (stegaClean backgroundVariant)
    StatsRow.astro            ← Task 4 (stegaClean backgroundVariant)
    TextWithImage.astro       ← Task 5 (stegaClean imagePosition)
    SponsorCards.astro        ← Task 6 (stegaClean tier)
```

No new files created. No files deleted. No new dependencies.

### Previous Story Intelligence

**Story 2.2 (Homepage Data Fetching — DONE)** established the pattern this story extends:
- `loadQuery<T>()` wrapper in `src/lib/sanity.ts` handles stega, perspective, token
- `getPage(slug)` uses `loadQuery` — this is the correct function to use
- Homepage (`index.astro`) already calls `getPage('home')` and visual editing works there
- The `[...slug].astro` route was left using raw `sanityClient.fetch` — this story fixes that gap

**Story 2.3a (Site Settings Wiring — DONE)** established:
- Module-level memoization pattern for `getSiteSettings()`
- Same `loadQuery` wrapper used for site settings queries
- Visual editing works on settings fields (navigation, footer, etc.)

### Git Intelligence

Recent commit `eec2329` (Story 2.2) wired the homepage with visual editing. The pattern to follow is already in the codebase — `getPage()` + `loadQuery`. This story applies the same pattern to `[...slug].astro` and adds the missing `stegaClean` calls.

### References

- [Source: docs/code-review/sanity-code-review_20260209_130832.md#Issue-10] — Critical: Missing stegaClean
- [Source: docs/code-review/sanity-code-review_20260209_130832.md#Issue-11] — Medium: [...slug].astro bypasses loadQuery
- [Source: astro-app/src/lib/sanity.ts] — loadQuery wrapper and getPage function
- [Source: astro-app/src/pages/index.astro] — Working pattern (uses getPage)
- [Source: docs/project-context.md#Data-Fetching-Patterns] — loadQuery architecture
- [Source: _bmad-output/planning-artifacts/architecture.md#API-Communication-Patterns] — Visual Editing via Sanity Presentation tool

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
