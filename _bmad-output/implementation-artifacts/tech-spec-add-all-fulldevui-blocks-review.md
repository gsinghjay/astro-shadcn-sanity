# Adversarial Review: Add All fulldotdev/ui Block Variants

**Spec:** `tech-spec-add-all-fulldevui-blocks.md`
**Reviewed:** 2026-02-08 (implementation review)
**Baseline Commit:** `895b3b5f`
**Findings:** 16

---

## Findings

| ID | Severity | Validity | Description |
|----|----------|----------|-------------|
| F1 | Critical | Real | `auto-form.astro` hardcodes `data-netlify="true"` — project uses GitHub Pages / future Cloudflare Pages, not Netlify |
| F2 | Critical | Real | `blocks-2.astro` uses `fs.readFileSync` to embed raw source code into HTML output — docs-site component, not appropriate for this project |
| F3 | Critical | Real | `blocks-1.astro` recursively glob-imports ALL blocks including itself — circular/recursive imports from docs-site showcase |
| F4 | High | Real | 89 of 102 blocks use `<slot />` for title/body but stories don't provide slot content — stories render partially empty |
| F5 | High | Real | BlockRenderer has 114 static imports parsed unconditionally + three dispatch mechanisms (switch, map, glob) |
| F6 | High | Real | `fulldotdevBlocks` typed as `Record<string, any>` — destroys type safety in strict mode project |
| F7 | High | Real | `schema-infrastructure.spec.ts` deleted — unrelated to this feature's scope |
| F8 | High | Real | Custom blocks moved to `blocks/custom/` — breaks documented flat `blocks/` structure |
| F9 | Medium | Real | `type Field` shadows imported `Field` component in `auto-form.astro` |
| F10 | Medium | Real | `blocks-2.astro` uses `classList.add("copied")` — violates project anti-pattern (use `data-*` instead) |
| F11 | Medium | Real | `auto-form.astro` renders `<FieldDescription>` twice in radio-group case |
| F12 | Medium | Real | `NativeSelectOption` sets disabled placeholder `value` to placeholder text instead of empty string |
| F13 | Medium | Real | E2E test changed from `networkidle` to `domcontentloaded` — weakens console-error test |
| F14 | Medium | Undecided | `block.astro` uses `path.includes()` — potentially ambiguous matching (though slash prefix mitigates) |
| F15 | Low | Noise | Inconsistent semicolons/quote styles between custom and fulldotdev imports in BlockRenderer |
| F16 | Low | Undecided | `skeletons-1.astro` references non-existent `src/components/skeletons/` directory — renders nothing |

---

## Triage Notes

### Not caused by this workflow (pre-existing changes)

- **F7** — test file deletion was in git status before workflow started
- **F8** — custom blocks moved to `blocks/custom/` was a pre-existing change (linter/hook)
- **F13** — E2E test change was pre-existing

### Upstream auto-form issues (copied verbatim from fulldotdev registry)

- **F1** — `data-netlify="true"` on form element
- **F9** — `type Field` name collision with `Field` component
- **F11** — duplicate `<FieldDescription>` in radio-group case
- **F12** — placeholder option value set to placeholder text

### Meta/showcase blocks (documentation-only, not content blocks)

- **F2** — `blocks-2.astro` uses `fs.readFileSync`
- **F3** — `blocks-1.astro` recursive glob imports
- **F10** — `classList.add` anti-pattern in `blocks-2.astro`
- **F16** — `skeletons-1.astro` references missing directory

### Architecture tradeoffs

- **F4** — Stories missing slot content (titles/body text render empty)
- **F5** — 114 static imports in BlockRenderer
- **F6** — `Record<string, any>` type erasure

### Minimal concern

- **F14** — `path.includes()` matching (slash prefix mitigates false matches)
- **F15** — Formatting inconsistency (noise)

---

## Resolution

**Status:** Pending user decision — [W] Walk through / [F] Fix automatically / [S] Skip
