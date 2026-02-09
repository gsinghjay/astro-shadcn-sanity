# Story 1.5: Storybook Production Build Fix

Status: done

## Story

As a developer,
I want `storybook build` to produce a fully working static Storybook site,
So that stories can be deployed to GitHub Pages (or any static host) and viewed without a dev server.

## Problem Statement

`storybook-astro@0.1.0`'s preset works perfectly in dev mode (385+ stories render via WebSocket + Container API) but produces a broken production build:

- `iframe.html` is **not generated** at all
- Only 3 Vite modules transformed (should be 400+)
- Vite warns: `Generated an empty chunk: "iframe"` (1-byte file)
- The manager shell (sidebar, toolbar) loads fine — `index.json` contains all 385 stories
- The preview iframe shows 404 because there's nothing to load

**Root cause hypothesis**: The `storybook-astro` preset's `viteFinal` hook injects Astro Vite plugins that work in dev mode (where rendering happens server-side via WebSocket) but break Vite's production bundling of the preview entry point. The `VITEST=true` environment trick and/or the filtered Astro plugin set may behave differently in `build` vs `serve` mode.

## Reference Materials

- `docs/storybook-astro-github-context.md` — full upstream source (preset, renderer, vite-plugins)
- `docs/storybook-astro.md` — known issues documentation
- Upstream repo: [ThinkOodle/storybook-astro](https://github.com/ThinkOodle/storybook-astro)
- Storybook 10 Builder API docs confirm `iframe.html` is still expected in production builds

## Acceptance Criteria

1. `npm run build-storybook` in `astro-app/` produces a `storybook-static/` directory containing a valid `iframe.html`
2. Vite transforms 300+ modules during the build (not 3)
3. No `Generated an empty chunk: "iframe"` warning from Vite
4. Serving `storybook-static/` with `npx http-server storybook-static` renders stories in the browser
5. At least 3 representative stories render correctly in the static build (1 block, 1 UI component, 1 docs page)
6. `storybook dev` continues to work as before (no regressions)
7. `docs/storybook-astro.md` Known Issue #1 updated to reflect resolution

## Tasks / Subtasks

- [x] Task 1: Diagnose the production build failure (AC: understanding root cause)
  - [x] 1.1 Add `--debug` or verbose logging to `storybook build` to see what Vite is actually receiving as entry points
  - [x] 1.2 Inspect `storybook-astro`'s `viteFinal` hook — log the config it returns in build mode vs dev mode
  - [x] 1.3 Compare the Astro Vite plugins loaded in dev vs build (`extractAstroPlugins` in `vite-plugins.ts`)
  - [x] 1.4 Check if the `VITEST=true` env trick causes Astro's `astro:build` plugin to behave differently in production
  - [x] 1.5 Test with Astro plugins completely removed from `viteFinal` — does `iframe.html` get generated? (stories won't render, but it validates the entry point theory)
  - [x] 1.6 Check upstream issues at `ThinkOodle/storybook-astro` for reports of this problem
  - [x] 1.7 Document findings in dev notes below

- [x] Task 2: Implement the fix (AC: #1, #2, #3)
  - [x] 2.1 Implemented approach A+B (config fix + local patch):
    - **A) Config fix**: Filter `astro:html` plugin in `viteFinal` to unblock iframe.html generation
    - **B) Local patch**: Created `patched-entry-preview.ts` — production-compatible renderer using Astro runtime's `renderToString` directly in the browser (0 Node.js deps)
  - [x] 2.2 `storybook build` produces valid `iframe.html` and transforms 784+ modules
  - [x] 2.3 No empty chunk warning — build completes in ~27s

- [x] Task 3: Validate the static build (AC: #4, #5, #6)
  - [x] 3.1 Served `storybook-static/` with `npx http-server storybook-static -p 8888`
  - [x] 3.2 Sidebar loads with all stories (Blocks + UI categories)
  - [x] 3.3 Block story (HeroBanner) — renders correctly with headline, CTAs, layout
  - [x] 3.4 Block story (Article1) — renders correctly with title, description, avatar, image
  - [x] 3.5 Docs page (UI/Button) renders with heading, controls table (text/variant/size), and all story variants
  - [x] 3.6 `storybook dev` on port 6008 — HeroBanner renders via WebSocket, controls panel works, no regressions
  - [x] 3.7 Skipped (optional) — manual verification via Playwright MCP sufficient

- [x] Task 4: Update documentation (AC: #7)
  - [x] 4.1 Update `docs/storybook-astro.md` Known Issue #1 with resolution and fix applied
  - [x] 4.2 Update Known Issue #5 (CI build strategy) to reflect that CI can now build Storybook
  - [x] 4.3 Document the patching strategy and how to sync with upstream updates

### Review Follow-ups (AI)

- [x] [AI-Review][MEDIUM] Add build output validation to existing `1.4-INT-011` test — assert `storybook-static/iframe.html` exists and is > 1KB (not empty chunk). Currently only verifies build doesn't throw. [tests/integration/storybook-1-4.spec.ts:213]
- [x] [AI-Review][MEDIUM] Fix Known Issue #4 doc inconsistency — text claims "Storybook 10 no longer produces iframe.html" but this fix makes it produce iframe.html. Update to note iframe.html IS produced but Chromatic may still fail for other reasons (webpack4 misdetection). [docs/storybook-astro.md:395]
- [x] [AI-Review][MEDIUM] Update stale CI workflow comment — says "Once the upstream build issue is resolved..." but it IS resolved. Update comment or defer explicitly to Story 1.6. [.github/workflows/deploy-storybook.yml:25]
- [x] [AI-Review][LOW] Remove dead code — `config.plugins = config.plugins || []` on line 174 is unreachable since `config.plugins` is already used on lines 137-141 and 161. [astro-app/.storybook/main.ts:174]
- [x] [AI-Review][LOW] Add console.warn for silent empty render — if `renderToString` returns non-string, component silently renders empty HTML. Add `console.warn` fallback. [astro-app/.storybook/patched-entry-preview.ts:203]
- [x] [AI-Review][LOW] Document or tighten resolveId suffix match — `id.endsWith(...)` is a broad suffix match. The `id === originalEntry` check handles the resolved path; the suffix fallback could be documented or narrowed. [astro-app/.storybook/main.ts:169]

## Dev Notes

### Key Files in storybook-astro

| File | Purpose |
|------|---------|
| `src/preset.ts` | Storybook preset — `viteFinal` hook, `core.renderer`, `previewAnnotations` |
| `src/framework/vite-plugins.ts` | `createAstroVitePlugins()` — the likely culprit; sets `VITEST=true`, extracts Astro plugins |
| `src/renderer/render.ts` | Client-side renderer — uses WebSocket to request SSR from server |
| `src/renderer/entry-preview.ts` | Preview entry point — exports `render`, `renderToCanvas` |

### Architecture Understanding

**Dev mode flow**: Browser → WebSocket → Server → Astro Container API → SSR HTML → WebSocket → Browser renders HTML

**Production build flow (expected)**: Vite bundles story files + renderer into `iframe.html` → Browser loads static HTML

**The gap**: In dev mode, the renderer delegates to the server for SSR. In production, there IS no server — the renderer needs to work differently, or the build process needs to pre-render. This is the fundamental architectural mismatch in `storybook-astro@0.1.0`.

### Investigation Leads

1. The `astro:build` plugin in `extractAstroPlugins` may have a `configResolved` or `buildStart` hook that conflicts with Storybook's entry point resolution
2. `process.env.VITEST = 'true'` is set unconditionally — this may cause Astro to skip certain build steps
3. The `optimizeDeps.exclude: ['astro', 'astro/container']` may prevent Vite from bundling required dependencies
4. Storybook's builder expects the framework preset to not interfere with its own entry point generation — the Astro plugins may be overriding the Vite `build.rollupOptions.input`

### Constraints

- Do NOT break `storybook dev` — it works and is the primary development workflow
- Prefer minimal changes (config fix > local patch > fork)
- Keep `npm ci` as the install strategy (don't modify `package-lock.json` unnecessarily)
- The Vite peer dep mismatch (`^5 || ^6` vs actual `^7`) is a separate issue — don't try to fix that here

## Dev Agent Record

### Diagnosis Findings (Task 1)

#### Root Cause #1: `astro:html` plugin hijacks iframe.html (CONFIRMED)

The `storybook-astro` preset injects 15 Vite plugins, including `astro:html`. This plugin intercepts ALL HTML file processing during the build, preventing Vite's `vite:build-html` plugin from extracting the `<script>` imports from Storybook's `iframe.html` entry point.

**Evidence:**
- With all 15 Astro plugins: **3 modules transformed**, empty `iframe` chunk (0 bytes)
- With `astro:html` removed: **784 modules transformed**, valid `iframe.html` (18 KB), build succeeds
- With ALL Astro plugins removed: **168 modules transformed** but `.astro` files can't be parsed (expected — proves the build pipeline itself works)

**The 15 plugins injected by storybook-astro preset:**
1. `astro:build` — needed for `.astro` file compilation
2. `astro:build:normal` — needed for `.astro` file compilation
3. `astro:scripts` — has `config()` hook
4. `astro:markdown` — harmless
5. `astro:html` — **THE CULPRIT** — intercepts HTML processing
6. `astro:postprocess` — harmless
7. `astro:scripts:page-ssr` — SSR scripts
8. `astro:head-metadata` — head injection
9. `astro:assets` — has `config()` hook
10. `astro:assets:esm` — has `config()` hook
11. `astro:container` — Container API support
12-15. `storybook-astro:*` — storybook-astro's own plugins (needed)

**Fix:** Filter out `astro:html` in `viteFinal`. The `.astro` compilation plugins remain and work correctly.

#### Root Cause #2: Renderer requires WebSocket (CONFIRMED)

The `renderToCanvas` function in `storybook-astro/dist/renderer/entry-preview.js` depends on `import.meta.hot.send()` for WebSocket communication with the dev server's Container API. In production builds:
- `import.meta.hot` is `undefined`
- `sendRenderRequest()` rejects with: "HMR not available - cannot communicate with server"
- Stories show error: "Failed to render Astro component"

**Fix approach:** Create a patched `entry-preview.ts` that renders Astro components directly using `renderToString` from `astro/runtime/server/render/astro/render.js` with a minimal SSRResult mock. The Astro runtime server functions have **zero Node.js dependencies** — they're pure JavaScript string manipulation and can run in the browser.

#### Additional Fix: Invalid glob patterns

Two components use `import.meta.glob("src/...")` which is invalid for Vite's `vite:import-glob` plugin (must start with `./` or `/`). These work in Astro dev mode because Astro handles glob resolution differently.
- `src/components/blocks/skeletons-1.astro` — fixed to `"../skeletons/**/*.astro"`
- `src/components/blocks/blocks-1.astro` — fixed to `"./**/*.astro"`

#### Upstream Status

- **0 issues filed** on ThinkOodle/storybook-astro
- **Only version: 0.1.0** (published 2025-12-26)
- **3 commits total** — early-stage/experimental project
- No other users have reported the production build issue

### Implementation Progress (Task 2 — COMPLETE)

#### Fix 1: astro:html removal — DONE, WORKING

Added to `.storybook/main.ts` `viteFinal`:
```typescript
if (config.plugins) {
  config.plugins = config.plugins.flat().filter((p: any) => {
    const name = p?.name || ''
    return name !== 'astro:html'
  })
}
```

**Result:** Build succeeds with 784 modules transformed, valid iframe.html (78 KB chunk), sidebar loads with all stories, controls panel works.

#### Fix 2: Patched renderer — DONE, WORKING

Created `.storybook/patched-entry-preview.ts` — a production-only replacement for `storybook-astro/dist/renderer/entry-preview.js` that renders Astro components directly in the browser using the Astro runtime.

**Key architectural insight:** The Astro runtime's render functions (`renderToString`, `renderSlotToString`, `renderChild`, etc.) are **pure JavaScript with zero Node.js dependencies**. They can run in the browser. The only requirements are:
1. A properly mocked `SSRResult` object with `createAstro()`, `_metadata`, `renderers`, `clientDirectives`, etc.
2. The `Astro.slots.render()` method must use `renderSlotToString()` + `chunkToString()` from the Astro runtime (not just return raw values — compiled templates call `.trim()` on slot render output)

**Wiring mechanism:** A Vite `resolveId` plugin in `main.ts` redirects imports of the original `entry-preview.js` to the patched version. The plugin uses `configResolved` to only activate in build mode — dev mode uses the original WebSocket renderer untouched.

```typescript
let isBuild = false
config.plugins.push({
  name: 'storybook-patch-renderer',
  enforce: 'pre',
  configResolved(resolved) { isBuild = resolved.command === 'build' },
  resolveId(id) {
    if (!isBuild) return
    if (id === originalEntry || id.endsWith('storybook-astro/dist/renderer/entry-preview.js')) {
      return patchedEntry
    }
  },
})
```

#### Root Cause #3: Astro.slots.render() must return strings (DISCOVERED & FIXED)

Compiled `.astro` components call `Astro.slots.render("default")` and then call `.trim()` on the result (e.g., `p?.trim().length > 0`). The real Astro runtime's `Slots.render()` uses `renderSlotToString()` to convert slot content (functions returning `RenderTemplateResult` objects) into HTML strings.

The initial SSRResult mock returned raw slot values (functions/objects), causing `TypeError: p?.trim is not a function`. Fixed by importing `renderSlotToString` and `chunkToString` from the Astro runtime and using them in the `createAstro` mock:

```typescript
import { renderSlotToString } from 'astro/runtime/server/render/slot.js'
import { chunkToString } from 'astro/runtime/server/render/common.js'

// In createAstro mock:
render: async (name) => {
  if (!slotValues?.[name]) return undefined
  const content = await renderSlotToString(result, slotValues[name])
  return chunkToString(result, content)
}
```

### Debug Log

| Step | Action | Result |
|------|--------|--------|
| 1.1 | Ran `storybook build` | 3 modules, empty iframe, "Generated an empty chunk: iframe" |
| 1.3 | Listed injected plugins | 15 plugins total (11 Astro + 4 storybook-astro) |
| 1.5a | Removed `astro:build*` only | Still 3 modules — not the sole culprit |
| 1.5b | Removed ALL `astro:*` plugins | 168 modules — build works but .astro parsing fails |
| 1.5c | Diagnosed with configResolved hook | `build.rollupOptions.input` is correct (iframe.html from builder-vite) |
| 1.5d | Logged transforms | Only iframe.html transformed — astro:html intercepts HTML processing |
| 1.5e | Removed `astro:html` only | **784 modules, valid iframe.html (18 KB)** — SUCCESS |
| 1.6 | Checked upstream | 0 issues, 0 PRs, only v0.1.0 exists |
| 2.1a | Served static build | Sidebar loads, all stories listed, controls panel works |
| 2.1b | Tested story rendering | "Failed to render Astro component - HMR not available" |
| 2.1c | Created patched-entry-preview.ts | Minimal SSRResult + direct renderToString |
| 2.1d | Tried resolve.alias | Didn't intercept previewAnnotations path |
| 2.1e | Tried resolveId plugin (always-on) | Build OK but broke dev mode (HMR context lost) |
| 2.1f | Added configResolved guard | resolveId only in build mode — dev mode fixed |
| 2.1g | Tested static build | "p?.trim is not a function" — slots returned raw objects |
| 2.1h | Traced error to compiled section.astro | `p = await Astro.slots.render("default"); p?.trim()` |
| 2.1i | Analyzed Astro Slots class | Uses renderSlotToString → chunkToString → HTML string |
| 2.1j | Fixed slots.render() in SSRResult mock | Import renderSlotToString + chunkToString from Astro runtime |
| 2.1k | Rebuilt + served static build | **Article1 + HeroBanner render correctly** — SUCCESS |

### Completion Notes

All 4 tasks complete. Production build fix verified end-to-end:
- **Build**: 784+ modules, valid iframe.html, 27s build time, no empty chunk warnings
- **Static serve**: Sidebar loads all stories, HeroBanner + Article1 render correctly
- **Docs pages**: Button autodocs renders with controls table and all story variants
- **Dev mode**: No regressions — HeroBanner renders via WebSocket on port 6008
- **Documentation**: Known Issues #1 (resolved), #5 (updated), #6 (new — patch sync strategy)

Review follow-ups (6/6 resolved):
- Resolved review finding [MEDIUM]: Added iframe.html validation to 1.4-INT-011 — asserts file exists and > 1KB
- Resolved review finding [MEDIUM]: Fixed Known Issue #4 — corrected stale claim that iframe.html isn't produced
- Resolved review finding [MEDIUM]: Updated CI workflow comment — references Story 1.6 (hook auto-upgraded to fresh build)
- Resolved review finding [LOW]: Removed dead `config.plugins = config.plugins || []` line
- Resolved review finding [LOW]: Added console.warn when renderToString returns non-string
- Resolved review finding [LOW]: Documented resolveId suffix match fallback with inline comment

## File List

- `astro-app/.storybook/main.ts` — added astro:html filter + renderer redirect plugin; removed dead code; documented resolveId fallback
- `astro-app/.storybook/patched-entry-preview.ts` — NEW: production-compatible renderer; added console.warn for non-string render output
- `astro-app/src/components/blocks/skeletons-1.astro` — fixed invalid glob pattern
- `astro-app/src/components/blocks/blocks-1.astro` — fixed invalid glob pattern
- `docs/storybook-astro.md` — updated Known Issues #1 (resolved), #4 (iframe.html correction), #5 (CI builds), #6 (new: patch sync)
- `.github/workflows/deploy-storybook.yml` — updated stale comment to reference Story 1.6 (hook upgraded to fresh CI build)
- `tests/integration/storybook-1-4.spec.ts` — added iframe.html existence + size assertions to 1.4-INT-011
- `.gitignore` — added `astro-app/storybook-static` to ignore build output

## Change Log

- 2026-02-08: Task 1 complete — diagnosed both root causes (astro:html hijack + WebSocket renderer)
- 2026-02-08: Fix 1 implemented — astro:html removal gives working build (784 modules, valid iframe.html)
- 2026-02-08: Fix 2 in progress — patched renderer created, wiring mechanism needs debugging
- 2026-02-09: Fix 2 completed — resolveId wiring works (build-only via configResolved guard)
- 2026-02-09: Root Cause #3 discovered — Astro.slots.render() must use renderSlotToString, not raw values
- 2026-02-09: Task 2 complete — static build renders Article1 + HeroBanner correctly
- 2026-02-09: Task 3 partially validated — sidebar, block stories confirmed working in static build
- 2026-02-09: Task 3 fully validated — docs page renders, storybook dev works, no regressions
- 2026-02-09: Task 4 complete — documentation updated (Known Issues #1, #5, #6)
- 2026-02-08: Code review — 3 MEDIUM + 3 LOW findings. 6 action items created. Status → in-progress
- 2026-02-08: Addressed code review findings — 6 items resolved (3 MEDIUM, 3 LOW). All 175 integration tests pass. Status → review
- 2026-02-09: Second code review — all fixes verified, .gitignore added to File List. Status → done
