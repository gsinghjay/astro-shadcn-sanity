# Story 15.4: Per-Site Theming with CSS Custom Properties

Status: review

## Story

As a site visitor,
I want each site (Capstone, RWC US, RWC International) to have a distinct primary color theme,
so that each site has a unique visual identity while sharing the same component library and layout.

## Acceptance Criteria

1. **AC1: `PUBLIC_SITE_THEME` Environment Variable**
   - New env var `PUBLIC_SITE_THEME` with values `red` | `blue` | `green`
   - Added to `astro-app/.env` (default: `red`) and `.env.example` with documentation
   - Added to `vite.define` in `astro.config.mjs` (same pattern as `PUBLIC_SANITY_DATASET` and `PUBLIC_SITE_ID` from 15-3)
   - Env var contract matches the table established in Story 15-3:

     | Site | `PUBLIC_SITE_THEME` |
     |---|---|
     | Capstone | `red` |
     | RWC US | `blue` |
     | RWC International | `green` |

2. **AC2: `data-site-theme` Attribute on `<html>`**
   - `Layout.astro` reads `PUBLIC_SITE_THEME` (default: `red`) and sets `data-site-theme` on `<html>`
   - Result: `<html lang="en" data-site-theme="red">` (or `blue` / `green`)
   - Attribute is build-time static (each CF Pages build = one site = one theme)
   - Orthogonal to existing `data-theme` (light/dark) — both attributes coexist independently

3. **AC3: CSS Custom Property Overrides in `global.css`**
   - `[data-site-theme="red"]` (or `:root` default) = current Swiss Red palette (no visual change for Capstone)
   - `[data-site-theme="blue"]` overrides `--primary`, `--ring`, `--destructive`, `--chart-1`, `--sidebar-primary`, `--sidebar-ring`, and `::selection` to a blue palette
   - `[data-site-theme="green"]` overrides same tokens to a green palette
   - Dark mode overrides (`.dark[data-site-theme="blue"]`, `.dark[data-site-theme="green"]`) set the same primary/ring/destructive values (matching current pattern where `--primary` is identical in light and dark)
   - All components using `bg-primary`, `text-primary`, `border-primary`, `ring-primary` etc. automatically render the correct site color with zero component changes

4. **AC4: `::selection` Uses `--primary` Token**
   - Update `::selection` in `global.css` from `var(--color-swiss-red)` to `var(--primary)` so text selection color follows the site theme

5. **AC5: Testing**
   - All existing tests pass (542+ tests, 0 regressions)
   - Build succeeds with each theme value (`red`, `blue`, `green`)
   - New unit tests verify theme resolution logic (reading env var, default fallback)

## Tasks / Subtasks

- [x] **Task 1: Add `PUBLIC_SITE_THEME` env var** (AC: #1)
  - [x] 1.1 Add `PUBLIC_SITE_THEME=red` to `astro-app/.env`
  - [x] 1.2 Add `PUBLIC_SITE_THEME` documentation to `astro-app/.env.example`
  - [x] 1.3 Add `PUBLIC_SITE_THEME` to `vite.define` in `astro-app/astro.config.mjs`:
    ```javascript
    "import.meta.env.PUBLIC_SITE_THEME": JSON.stringify(siteTheme),
    ```
    where `siteTheme` is read from `loadEnv` / `process.env` with default `'red'`

- [x] **Task 2: Set `data-site-theme` on `<html>` in Layout.astro** (AC: #2)
  - [x] 2.1 Read `PUBLIC_SITE_THEME` in Layout.astro frontmatter:
    ```typescript
    const siteTheme = import.meta.env.PUBLIC_SITE_THEME || 'red';
    ```
  - [x] 2.2 Set attribute on `<html>`:
    ```astro
    <html lang="en" data-site-theme={siteTheme}>
    ```
  - [x] 2.3 Verify `data-site-theme` does NOT conflict with existing `data-theme` (light/dark) set by ThemeToggle — they are separate attributes on the same element

- [x] **Task 3: Add CSS theme overrides in `global.css`** (AC: #3, #4)
  - [x] 3.1 Update `::selection` to use `var(--primary)` instead of `var(--color-swiss-red)`
  - [x] 3.2 Add `[data-site-theme="blue"]` block overriding these tokens:
    ```css
    [data-site-theme="blue"] {
      --primary: #2563eb;
      --ring: #2563eb;
      --destructive: #1e40af;
      --chart-1: #2563eb;
      --sidebar-primary: #2563eb;
      --sidebar-ring: #2563eb;
    }
    ```
  - [x] 3.3 Add `[data-site-theme="green"]` block:
    ```css
    [data-site-theme="green"] {
      --primary: #059669;
      --ring: #059669;
      --destructive: #047857;
      --chart-1: #059669;
      --sidebar-primary: #059669;
      --sidebar-ring: #059669;
    }
    ```
  - [x] 3.4 Add dark mode combined selectors (matching current pattern where `--primary` stays identical):
    ```css
    .dark[data-site-theme="blue"] {
      --primary: #2563eb;
      --ring: #2563eb;
      --destructive: #1e40af;
    }
    .dark[data-site-theme="green"] {
      --primary: #059669;
      --ring: #059669;
      --destructive: #047857;
    }
    ```
  - [x] 3.5 **No `[data-site-theme="red"]` block needed** — `:root` already contains the red/Swiss Red values. Red is the implicit default.

- [x] **Task 4: Testing** (AC: #5)
  - [x] 4.1 Run `npm run test:unit` — all existing tests pass (548 tests, 545 passed, 3 skipped)
  - [x] 4.2 Verify build succeeds with `PUBLIC_SITE_THEME=red` (default)
  - [x] 4.3 Verify build succeeds with `PUBLIC_SITE_THEME=blue`
  - [x] 4.4 Verify build succeeds with `PUBLIC_SITE_THEME=green`
  - [x] 4.5 Add unit test for theme env var resolution and default fallback

## Dev Notes

### Architecture Decision: Build-Time Static Theme via CSS Attribute Selectors

Each CF Pages build is isolated — one build = one site = one theme. The `data-site-theme` attribute is set at build time in Layout.astro from `PUBLIC_SITE_THEME`. This means:

- The CSS for ALL three themes ships in every build (a few hundred bytes of overrides — negligible)
- Only one `[data-site-theme]` selector is active per build
- No runtime JavaScript for theme switching
- No Sanity schema changes needed — theme is an env var, not content
- Fully orthogonal to light/dark mode (existing `data-theme` / `.dark` class)

### Why CSS Attribute Selectors (Not Inline Styles or JS)

1. **Declarative** — all theme tokens in one place (`global.css`)
2. **CSS specificity works naturally** — `[data-site-theme="blue"]` overrides `:root` values, `.dark[data-site-theme="blue"]` overrides `.dark` values
3. **Zero component changes** — every component already uses `bg-primary`, `text-primary`, etc. via Tailwind utility classes
4. **Testable** — can inspect `data-site-theme` attribute in E2E tests
5. **Matches project patterns** — `data-*` attributes are the established state mechanism (per project-context.md)

### Color Palette Choices

| Token | Red (Capstone) | Blue (RWC US) | Green (RWC Intl) |
|---|---|---|---|
| `--primary` | `#E30613` (Swiss Red) | `#2563EB` (Blue 600) | `#059669` (Emerald 600) |
| `--ring` | `#E30613` | `#2563EB` | `#059669` |
| `--destructive` | `#B00510` (Swiss Red Dark) | `#1E40AF` (Blue 800) | `#047857` (Emerald 700) |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` |

These colors provide:
- WCAG AA contrast ratio against white backgrounds (text) and as button backgrounds (white text)
- Visually distinct identities for each site
- Professional, production-quality tones (not garish)
- Consistent darkness/saturation level across themes

**Note:** Color values are provisional. Jay can adjust exact hex values before or after implementation. The mechanism (CSS overrides) works regardless of specific colors chosen.

### Tokens That Change Per Theme

Only tokens currently set to Swiss Red (`#E30613`) or Swiss Red Dark (`#B00510`) need per-theme overrides:

| Token | Current Value | Why It Changes |
|---|---|---|
| `--primary` | `#E30613` | Main accent — buttons, links, CTAs |
| `--ring` | `#E30613` | Focus rings on interactive elements |
| `--destructive` | `#B00510` | Error/danger states (darker variant of primary) |
| `--chart-1` | `#E30613` | First chart color (matches primary) |
| `--sidebar-primary` | `#E30613` | Sidebar accent color |
| `--sidebar-ring` | `#E30613` | Sidebar focus ring |

Tokens that **DO NOT change** per theme:
- `--background`, `--foreground`, `--card`, `--muted`, `--accent`, `--border`, `--input` — these are neutral/grayscale
- `--secondary`, `--secondary-foreground` — neutral grays
- `--chart-2` through `--chart-5` — remain NJIT Navy, Gold, etc.
- `--primary-foreground` — remains `#FFFFFF` (white text on all three primary colors)

### CSS Specificity Chain

```
:root                           → base light mode values (red theme defaults)
[data-site-theme="blue"]        → blue overrides (overrides :root primary/ring/etc.)
[data-site-theme="green"]       → green overrides
.dark                           → dark mode overrides (background, card, muted, etc.)
.dark[data-site-theme="blue"]   → dark mode + blue primary
.dark[data-site-theme="green"]  → dark mode + green primary
```

`[data-site-theme="red"]` is NOT needed because `:root` already contains red values. Adding an explicit red selector would be dead code.

### `::selection` Fix

Current `global.css` line 69-72:
```css
::selection {
  background-color: var(--color-swiss-red);
  color: var(--color-swiss-white);
}
```

This hardcodes Swiss Red for text selection on ALL sites. Change to:
```css
::selection {
  background-color: var(--primary);
  color: var(--primary-foreground);
}
```

Now text selection follows the site theme automatically.

### `astro.config.mjs` Changes

Add `PUBLIC_SITE_THEME` to the existing env var resolution block. Follow the exact same pattern as `PUBLIC_SANITY_DATASET` and `PUBLIC_SITE_ID` from Story 15-3:

```javascript
const siteTheme = env.PUBLIC_SITE_THEME || process.env.PUBLIC_SITE_THEME || 'red';

// In vite.define:
"import.meta.env.PUBLIC_SITE_THEME": JSON.stringify(siteTheme),
```

### Interaction with ThemeToggle (Light/Dark)

The existing ThemeToggle component (`src/components/ui/theme-toggle/`) sets:
- `.dark` class on `<html>` (for Tailwind dark mode)
- `data-theme="light|dark"` attribute on `<html>` (for CSS hooks)

The new `data-site-theme="red|blue|green"` is a **separate attribute** on the same `<html>` element. They don't interfere:
- `data-theme` = light/dark mode (user preference, runtime toggle)
- `data-site-theme` = site brand color (build-time, static)

Both CSS selectors stack naturally:
```html
<html lang="en" data-site-theme="blue" data-theme="dark" class="dark">
```

### Files to Modify

| File | Changes |
|---|---|
| `astro-app/.env` | Add `PUBLIC_SITE_THEME=red` |
| `astro-app/.env.example` | Add `PUBLIC_SITE_THEME` documentation |
| `astro-app/astro.config.mjs` | Read `PUBLIC_SITE_THEME`, add to `vite.define` |
| `astro-app/src/layouts/Layout.astro` | Read theme env var, set `data-site-theme` on `<html>` |
| `astro-app/src/styles/global.css` | Add `[data-site-theme]` CSS overrides, fix `::selection` |
| `astro-app/src/lib/__tests__/sanity.test.ts` | Optional: add theme resolution tests if logic lives in sanity.ts |

### Files NOT to Modify

- `studio/` — No Studio changes. Theming is a frontend concern.
- `astro-app/src/lib/sanity.ts` — Theme is not a data-fetching concern. It's purely CSS.
- `astro-app/src/components/` — Zero component changes. All components already use semantic Tailwind tokens.
- `astro-app/src/components/ui/theme-toggle/` — Light/dark mode is orthogonal. No changes needed.
- Sanity schemas — No `theme` field in siteSettings. Theme is controlled by env var per CF Pages project.

### Previous Story Learnings (15-3)

**From 15-3 (Multi-Site Data Fetching):**
- `vite.define` pattern is established: `PUBLIC_SANITY_DATASET` and `PUBLIC_SITE_ID` are already injected. Follow the same pattern for `PUBLIC_SITE_THEME`.
- `astro.config.mjs` has a specific env var reading pattern with `loadEnv()` + `process.env` fallback for CF Pages. Replicate this.
- 542 tests passing after 15-3 — baseline for regression testing.
- Code review caught missing `vite.define` for env vars in 15-3 (issue H1). Do NOT forget to add `PUBLIC_SITE_THEME` to `vite.define`.

**From 15-3 Code Review (critical learning):**
- Story 15-3 had a HIGH severity finding: env vars were used in code but not added to `vite.define` in `astro.config.mjs`. On CF Pages (where no `.env` file exists), this would cause silent failure. The same mistake must be avoided here — `PUBLIC_SITE_THEME` MUST be in `vite.define`.

### Anti-Pattern Warnings

- **NEVER** use arbitrary Tailwind values (`bg-[#2563eb]`) — always use semantic tokens (`bg-primary`)
- **NEVER** add per-site color logic in component files — all theme tokens live in `global.css`
- **NEVER** use `classList.add/remove` for site theme — use `data-site-theme` attribute (project convention)
- **NEVER** hardcode color hex values in components — use CSS custom properties via Tailwind classes
- **NEVER** create a `ThemeContext` or JavaScript-based theme provider for site themes — this is a build-time CSS concern, not a runtime one
- **NEVER** modify the `@theme` block brand colors (`--color-swiss-red`, etc.) — those are fixed brand tokens. Per-site theming overrides the semantic tokens (`--primary`, `--ring`, etc.)

### Sanity Best Practices Applied

Per the loaded `/sanity-best-practices` skill:
- **No schema changes needed** — theming is env-var-driven, not content-driven
- **No GROQ query changes** — theme is purely frontend CSS
- **Shared block library pattern preserved** — same components render different themes via CSS custom properties

### Project Structure Notes

- `global.css` is the single source of truth for all design tokens (per project-context.md)
- `@theme` block contains Tailwind v4 theme tokens (brand colors, fonts)
- `:root` / `.dark` contain shadcn semantic tokens (`--primary`, `--background`, etc.)
- New `[data-site-theme]` selectors go **after** `:root` and `.dark` for proper specificity
- Layout.astro is the single entry point for `<html>` attributes

### References

- [Source: _bmad-output/implementation-artifacts/15-3-astro-multi-site-data-fetching.md — Env Variable Contract table]
- [Source: _bmad-output/project-context.md#Tailwind v4 CSS-First Configuration]
- [Source: _bmad-output/project-context.md#Naming Conventions — CSS custom properties]
- [Source: _bmad-output/project-context.md#Anti-Patterns — arbitrary Tailwind values]
- [Source: astro-app/src/styles/global.css — current token definitions]
- [Source: astro-app/src/layouts/Layout.astro — HTML root element]
- [Source: astro-app/src/components/ui/theme-toggle/ — existing light/dark infrastructure]
- [Source: /sanity-best-practices — schema design, no schema changes needed]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Color System, Color Rules]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

No issues encountered. All tasks completed in a single pass.

### Completion Notes List

- AC1: Added `PUBLIC_SITE_THEME` env var to `.env` (default: `red`), `.env.example` (with per-site documentation table), and `vite.define` in `astro.config.mjs` following the established `loadEnv` + `process.env` fallback pattern from Story 15-3.
- AC2: Layout.astro reads `PUBLIC_SITE_THEME` (default: `red`) and sets `data-site-theme` attribute on `<html>`. Confirmed orthogonal to existing `data-theme` (light/dark).
- AC3: Added `[data-site-theme="blue"]` and `[data-site-theme="green"]` CSS overrides for `--primary`, `--ring`, `--destructive`, `--chart-1`, `--sidebar-primary`, `--sidebar-ring`. Added `.dark[data-site-theme="blue"]` and `.dark[data-site-theme="green"]` dark mode overrides. No `[data-site-theme="red"]` needed — `:root` already contains red values.
- AC4: Updated `::selection` from `var(--color-swiss-red)` / `var(--color-swiss-white)` to `var(--primary)` / `var(--primary-foreground)`.
- AC5: All 548 tests pass (545 passed, 3 skipped, 0 regressions). Build succeeds with all three theme values. 5 new unit tests for theme env var resolution added.
- Docker: Added `astro-rwc-us` (port 4322, blue theme) and `astro-rwc-intl` (port 4323, green theme) services behind `rwc` profile. Start with `docker compose --profile rwc up`.

### Change Log

- 2026-02-28: Implemented per-site theming with CSS custom properties (Story 15-4). Added PUBLIC_SITE_THEME env var, data-site-theme HTML attribute, blue/green CSS overrides, and ::selection fix.

### File List

- `astro-app/.env` — Added `PUBLIC_SITE_THEME="red"`
- `astro-app/.env.example` — Added `PUBLIC_SITE_THEME` with per-site documentation
- `astro-app/astro.config.mjs` — Added `siteTheme` resolution and `vite.define` entry
- `astro-app/src/layouts/Layout.astro` — Added `siteTheme` const and `data-site-theme` attribute on `<html>`
- `astro-app/src/styles/global.css` — Updated `::selection`, added `[data-site-theme="blue"]`, `[data-site-theme="green"]`, `.dark[data-site-theme="blue"]`, `.dark[data-site-theme="green"]` overrides
- `astro-app/src/lib/__tests__/site-theme.test.ts` — New: 5 unit tests for theme env var resolution
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Updated story status
- `docker-compose.yml` — Added `astro-rwc-us` and `astro-rwc-intl` services with `rwc` profile
- `_bmad-output/implementation-artifacts/15-4-per-site-theming-css-custom-properties.md` — Updated story status, tasks, dev agent record
