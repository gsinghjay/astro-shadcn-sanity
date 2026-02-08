# Story 2.0: Template Layout System

Status: done

## Story

As a content editor,
I want to choose a template layout when creating or editing a page,
So that I can control the overall page structure (full-width, sidebar, two-column, etc.) while composing blocks within that layout.

## Acceptance Criteria

1. The `page` document schema in `studio/src/schemaTypes/documents/page.ts` includes a `template` string field with constrained layout options
2. Available templates are: `default`, `fullWidth`, `landing`, `sidebar`, `twoColumn`
3. The `template` field uses radio layout for clear selection and defaults to `default`
4. Insert menu groups organize the existing block library into logical categories (Heroes, Content, Media, Social Proof, CTAs, Forms) with search/filter enabled
5. Template selection is visually prominent in Studio (placed before blocks, within a "Layout" fieldset or group)
6. The Astro frontend reads the `template` field and wraps `BlockRenderer` output in the corresponding layout shell component
7. Layout shell components exist in `astro-app/src/layouts/templates/` for each template
8. The `[...slug].astro` catch-all route passes the template value to the layout system
9. Template-specific validation warns editors when incompatible blocks are used (e.g., full-width hero in sidebar layout)
10. Sanity Studio starts without errors and editors can select templates for new and existing pages

## Tasks / Subtasks

- [x] Task 1: Add `template` field and insert menu groups to page schema
  - Add `template` string field with radio layout and `default` initial value
  - Add `options.insertMenu` with `filter: true` and categorized `groups` to the `blocks` array field
  - Add `insertMenu.views` with list and grid options (grid with `previewImageUrl` for future thumbnails)
  - Place `template` field prominently before `blocks` (consider fieldset/group)
- [x] Task 2: Create layout template shell components
  - `astro-app/src/layouts/templates/DefaultTemplate.astro` — standard max-width centered layout
  - `astro-app/src/layouts/templates/FullWidthTemplate.astro` — edge-to-edge, no max-width constraint
  - `astro-app/src/layouts/templates/LandingTemplate.astro` — no header/footer nav distractions, conversion-focused
  - `astro-app/src/layouts/templates/SidebarTemplate.astro` — main content + sidebar column
  - `astro-app/src/layouts/templates/TwoColumnTemplate.astro` — equal or weighted two-column grid
  - Each template wraps a `<slot />` for BlockRenderer output
- [x] Task 3: Update `[...slug].astro` and BlockRenderer integration
  - Read `template` field from GROQ page query
  - Map template value to the correct layout shell component
  - Pass blocks to BlockRenderer inside the template shell
  - Fallback to `DefaultTemplate` for pages with no template set (backward compat)
- [x] Task 4: Add template-aware validation to page schema
  - Warn (not error) when `fullWidth`-only blocks appear in `sidebar` or `twoColumn` templates
  - Validation should be advisory — editors can override
- [x] Task 5: Verify Studio UX and end-to-end rendering
  - Confirm template radio selector appears and persists
  - Confirm insert menu groups categorize blocks correctly
  - Confirm each template renders differently on the frontend
  - Confirm existing pages without a `template` value fall back to `default`

## Dev Notes

### Scope Note

This story introduces the **template layout system** as a foundation for page composition. It does NOT add new block types — it enhances the existing page schema and frontend rendering pipeline. The 12 P0 block types from Stories 2.1/2.1b are composed _within_ whichever template the editor selects.

This story is independent of Stories 2.1–2.3 and can be developed in parallel, but the full editor experience requires blocks to exist (2.1/2.1b) and GROQ queries to be wired (2.2).

### Architecture Patterns — MUST FOLLOW

#### Template Field Pattern
```typescript
// In page.ts
defineField({
  name: 'template',
  title: 'Page Template',
  type: 'string',
  initialValue: 'default',
  options: {
    list: [
      { title: 'Default', value: 'default' },
      { title: 'Full Width', value: 'fullWidth' },
      { title: 'Landing Page', value: 'landing' },
      { title: 'Sidebar', value: 'sidebar' },
      { title: 'Two Column', value: 'twoColumn' },
    ],
    layout: 'radio',
  },
  group: 'layout',  // or fieldset
})
```

#### Insert Menu Groups Pattern
```typescript
// In page.ts blocks field
defineField({
  name: 'blocks',
  type: 'array',
  of: [/* existing 12 block types */],
  options: {
    insertMenu: {
      filter: true,
      groups: [
        { name: 'heroes', title: 'Heroes', of: ['heroBanner'] },
        { name: 'content', title: 'Content', of: ['richText', 'textWithImage', 'faqSection', 'timeline'] },
        { name: 'media', title: 'Media & Stats', of: ['statsRow', 'featureGrid', 'teamGrid'] },
        { name: 'social', title: 'Social Proof', of: ['sponsorCards', 'logoCloud'] },
        { name: 'cta', title: 'Calls to Action', of: ['ctaBanner', 'contactForm'] },
      ],
      views: [
        { name: 'list' },
        { name: 'grid', previewImageUrl: (type) => `/static/block-previews/${type}.png` },
      ],
    },
  },
})
```

#### Frontend Template Dispatch Pattern
```astro
---
// [...slug].astro
import DefaultTemplate from '@/layouts/templates/DefaultTemplate.astro'
import FullWidthTemplate from '@/layouts/templates/FullWidthTemplate.astro'
import LandingTemplate from '@/layouts/templates/LandingTemplate.astro'
import SidebarTemplate from '@/layouts/templates/SidebarTemplate.astro'
import TwoColumnTemplate from '@/layouts/templates/TwoColumnTemplate.astro'

const templates = {
  default: DefaultTemplate,
  fullWidth: FullWidthTemplate,
  landing: LandingTemplate,
  sidebar: SidebarTemplate,
  twoColumn: TwoColumnTemplate,
}
const TemplateComponent = templates[page.template] ?? DefaultTemplate
---
<TemplateComponent>
  <BlockRenderer blocks={page.blocks} />
</TemplateComponent>
```

### Template Definitions

| Template | Description | Use Case |
|---|---|---|
| `default` | Centered max-width container, standard header/footer | General pages, about, contact |
| `fullWidth` | Edge-to-edge blocks, no container constraint | Image-heavy showcases, portfolios |
| `landing` | Minimal nav, conversion-focused, full-width blocks | Marketing campaigns, event pages |
| `sidebar` | Main content (2/3) + sidebar column (1/3) | Blog-style, documentation, filtered listings |
| `twoColumn` | Equal or weighted two-column grid | Comparison pages, dual-content layouts |

### Block Compatibility Matrix (Advisory)

| Block | default | fullWidth | landing | sidebar | twoColumn |
|---|---|---|---|---|---|
| heroBanner | yes | yes | yes | warn | warn |
| featureGrid | yes | yes | yes | yes | yes |
| richText | yes | yes | yes | yes | yes |
| ctaBanner | yes | yes | yes | yes | yes |
| statsRow | yes | yes | yes | warn | yes |
| textWithImage | yes | yes | yes | yes | yes |
| logoCloud | yes | yes | yes | warn | yes |
| sponsorCards | yes | yes | yes | warn | yes |
| faqSection | yes | yes | yes | yes | yes |
| contactForm | yes | yes | yes | yes | yes |
| timeline | yes | yes | yes | warn | warn |
| teamGrid | yes | yes | yes | warn | yes |

"warn" = validation warning, not a hard block. Wide components may not render well in constrained columns.

### Backward Compatibility

- Existing pages have no `template` field set → `initialValue: 'default'` ensures new pages get it; the frontend falls back to `DefaultTemplate` for pages without a value
- No migration script needed — the field is optional with a safe fallback
- GROQ queries should include `template` in projections; missing field returns `null` which triggers fallback

### GROQ Query Addition
```groq
*[_type == "page" && slug.current == $slug][0]{
  title,
  slug,
  template,  // ← ADD THIS
  blocks[]{ ... }
}
```

### File Structure

```
studio/src/schemaTypes/
└── documents/
    └── page.ts                              ← MODIFY (add template field, insert menu groups)

astro-app/src/
├── layouts/
│   └── templates/
│       ├── DefaultTemplate.astro            ← NEW
│       ├── FullWidthTemplate.astro          ← NEW
│       ├── LandingTemplate.astro            ← NEW
│       ├── SidebarTemplate.astro            ← NEW
│       └── TwoColumnTemplate.astro          ← NEW
├── pages/
│   └── [...slug].astro                      ← MODIFY (template dispatch)
└── lib/
    └── sanity.ts                            ← MODIFY (add template to GROQ query)
```

### Anti-Patterns

- Do NOT store CSS classes or style values in the schema — templates are semantic names, not presentation
- Do NOT create separate document types per template — one `page` type with a `template` field is simpler and more flexible
- Do NOT hard-block any block from any template — use advisory warnings only, editors know best
- Do NOT couple template rendering to specific block types — templates define the outer shell, blocks fill the content area
- Do NOT store heading levels (h1/h2) in schema — determine them dynamically in frontend based on block position

### Dependencies

- **Soft dependency on 2.1/2.1b**: Insert menu groups reference all 12 block types; groups still work if some blocks don't exist yet (Studio gracefully handles missing types in groups)
- **Soft dependency on 2.2**: GROQ query modification can be done here or deferred to 2.2
- **No hard blockers**: This story can begin immediately

### References

- Sanity Page Builder docs: https://www.sanity.io/docs/developer-guides/how-to-use-structured-content-for-page-building
- Sanity Array insertMenu API: https://www.sanity.io/docs/studio/array-type
- `sanity-page-builder` rule (loaded via `get_sanity_rules`)
- `sanity-schema` rule (loaded via `get_sanity_rules`)
- Existing page schema: `studio/src/schemaTypes/documents/page.ts`
- Existing architecture: `_bmad-output/planning-artifacts/architecture.md`

## Dev Agent Record

### Implementation Plan

- Task 1: Added `template` string field (radio layout, 5 options, `default` initial value) with page groups (`layout`, `content`, `seo`). Added `insertMenu` with filter, 5 categorized groups covering all 12 block types, and list/grid views.
- Task 2: Created 5 template shell components in `astro-app/src/layouts/templates/` — Default (max-width container), FullWidth (edge-to-edge), Landing (full-width + data-template attribute), Sidebar (2/3 + 1/3 grid), TwoColumn (equal two-column grid). Each wraps `<slot />`.
- Task 3: Created `[...slug].astro` catch-all route with `getStaticPaths` from Sanity, template dispatch map, and `DefaultTemplate` fallback. Added `pageBySlugQuery` and `allPageSlugsQuery` GROQ exports to `sanity.ts`.
- Task 4: Added advisory `warning`-level cross-field validation on blocks field using exported `wideBlockWarnings` matrix. Warns when wide blocks (heroBanner, statsRow, logoCloud, sponsorCards, timeline, teamGrid) are used in constrained templates (sidebar, twoColumn).
- Task 5: Comprehensive end-to-end integration tests verifying all 10 ACs.

### Completion Notes

- 61 integration tests across 5 test files, all passing (13 added during code review)
- 119 total integration tests pass, 0 failures
- No regressions introduced
- `@sanity/icons` `DocumentIcon` added to page schema for improved Studio UX
- GROQ queries are forward-compatible; block-specific projections deferred to Story 2.2

### Decisions

- Used `group` (not `fieldset`) for field organization — Studio groups render as tabs which is cleaner for template selection
- Made `layout` group the default (shown first) so template selection is immediately visible
- Exported `wideBlockWarnings` map and `validateBlockTemplateCompatibility` function for testability
- Created `[...slug].astro` with full Sanity GROQ integration even though data isn't wired yet — forward-compatible for Story 2.2

## File List

### New Files
- `astro-app/src/layouts/templates/DefaultTemplate.astro`
- `astro-app/src/layouts/templates/FullWidthTemplate.astro`
- `astro-app/src/layouts/templates/LandingTemplate.astro`
- `astro-app/src/layouts/templates/SidebarTemplate.astro`
- `astro-app/src/layouts/templates/TwoColumnTemplate.astro`
- `astro-app/src/pages/[...slug].astro`
- `tests/integration/template-2-0/page-template.spec.ts`
- `tests/integration/template-2-0/template-components.spec.ts`
- `tests/integration/template-2-0/slug-route.spec.ts`
- `tests/integration/template-2-0/template-validation.spec.ts`
- `tests/integration/template-2-0/end-to-end.spec.ts`

### Modified Files
- `studio/src/schemaTypes/documents/page.ts` — Added template field, groups, insertMenu, validation, exported `validateBlockTemplateCompatibility`
- `astro-app/src/lib/sanity.ts` — Added GROQ query exports
- `astro-app/src/layouts/Layout.astro` — Added `hideNav` prop, conditional Header/Footer rendering

## Change Log

- 2026-02-08: Story 2-0 implementation complete — template layout system with 5 templates, insert menu groups, catch-all route, and advisory validation
- 2026-02-08: Code review fixes — [H1] Landing template now suppresses header/footer via Layout `hideNav` prop; [H2] Extracted `validateBlockTemplateCompatibility` with 10 behavioral tests; [M1] TwoColumnTemplate blocks distribute as grid items; [M4] Typed template dispatch map with `keyof typeof`
