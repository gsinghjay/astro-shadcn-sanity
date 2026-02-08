# Story 1.3: Schema Infrastructure

Status: done

## Story

As a developer,
I want the core schema helpers, shared objects, and foundational document schemas in place,
So that all future block and document schemas follow a consistent, type-safe pattern.

## Acceptance Criteria

1. `studio/src/schemaTypes/helpers/defineBlock.ts` exports a `defineBlock` function that wraps `defineType` and merges shared base fields (backgroundVariant, spacing, maxWidth) into every block schema
2. `studio/src/schemaTypes/objects/block-base.ts` defines the shared base fields with constrained presets (backgroundVariant: white/light/dark/primary; spacing: none/small/default/large; maxWidth: narrow/default/full)
3. `studio/src/schemaTypes/objects/seo.ts` defines an SEO object with metaTitle (string), metaDescription (text), and ogImage (image) fields
4. `studio/src/schemaTypes/objects/button.ts` defines a reusable button object with text (string), url (url), and variant (string) fields
5. `studio/src/schemaTypes/objects/portable-text.ts` defines the rich text configuration
6. `studio/src/schemaTypes/documents/page.ts` defines a page document with title, slug, seo (reference to seo object), and blocks[] array accepting all 12 P0 block types (heroBanner, featureGrid, sponsorCards, richText, ctaBanner, faqSection, contactForm, timeline, logoCloud, statsRow, teamGrid, textWithImage)
7. `studio/src/schemaTypes/documents/site-settings.ts` defines a singleton document with siteName, logo, navigation items, footer content, social links, and currentSemester fields (FR40)
8. All schemas are registered in `studio/src/schemaTypes/index.ts`
9. All schemas use `defineType`/`defineField` with TypeScript and include appropriate validation rules
10. Sanity Studio starts without schema errors

## Tasks / Subtasks

- [x] Task 1: Create directory structure (AC: all)
  - [x] 1.1 Create `studio/src/schemaTypes/helpers/`
  - [x] 1.2 Create `studio/src/schemaTypes/objects/`
  - [x] 1.3 Create `studio/src/schemaTypes/documents/`
  - [x] 1.4 Create `studio/src/schemaTypes/blocks/` (empty — blocks created in Story 2.1, but dir needed now)

- [x] Task 2: Create `defineBlock` helper (AC: #1)
  - [x] 2.1 Create `studio/src/schemaTypes/helpers/defineBlock.ts`
  - [x] 2.2 Import `defineType`, `defineField` from `'sanity'`
  - [x] 2.3 Implement `defineBlock` function that accepts a config object (`name`, `title`, `fields`, optional `preview`, `icon`) and returns `defineType(...)` with `type: 'object'`, merging base fields BEFORE block-specific fields
  - [x] 2.4 Base fields to merge: `backgroundVariant`, `spacing`, `maxWidth` (imported from `block-base.ts` or defined inline as field definitions)
  - [x] 2.5 Export the function as named export

- [x] Task 3: Create shared object schemas (AC: #2, #3, #4, #5)
  - [x] 3.1 Create `studio/src/schemaTypes/objects/block-base.ts` — define the three base fields as an exportable array of `defineField` results:
    - `backgroundVariant`: string, options list `['white', 'light', 'dark', 'primary']`, default `'white'`
    - `spacing`: string, options list `['none', 'small', 'default', 'large']`, default `'default'`
    - `maxWidth`: string, options list `['narrow', 'default', 'full']`, default `'default'`
  - [x] 3.2 Create `studio/src/schemaTypes/objects/seo.ts` — object type `seo`:
    - `metaTitle`: string, max 60 chars validation
    - `metaDescription`: text, max 160 chars validation
    - `ogImage`: image with alt text field, description "1200x630 recommended"
  - [x] 3.3 Create `studio/src/schemaTypes/objects/button.ts` — object type `button`:
    - `text`: string, required
    - `url`: url, required, validation for http/https/mailto/tel schemes
    - `variant`: string, options list `['default', 'secondary', 'outline', 'ghost']`
  - [x] 3.4 Create `studio/src/schemaTypes/objects/portable-text.ts` — object type `portableText`:
    - Array of `block` type with decorators (strong, em, code, underline)
    - Annotations: external link (href url), internal link (reference to page)
    - Styles: normal, h2, h3, h4, blockquote
    - Lists: bullet, number
    - Inline image type with required alt text field (NFR16)
    - Callout box type (object with `tone`: info/warning/success, `text`: text)

- [x] Task 4: Create foundational document schemas (AC: #6, #7)
  - [x] 4.1 Create `studio/src/schemaTypes/documents/page.ts` — document type `page`:
    - `title`: string, required
    - `slug`: slug, required, sourced from title, unique
    - `seo`: object of type `seo`
    - `blocks`: array accepting all 12 P0 block types by name (heroBanner, featureGrid, sponsorCards, richText, ctaBanner, faqSection, contactForm, timeline, logoCloud, statsRow, teamGrid, textWithImage)
    - **IMPORTANT:** The blocks array references block type names that DON'T EXIST YET (created in Story 2.1). Use string type names in the `of` array. Studio will show warnings for unregistered types, which is expected and acceptable — they resolve when Story 2.1 adds the block schemas.
  - [x] 4.2 Create `studio/src/schemaTypes/documents/site-settings.ts` — singleton document type `siteSettings`:
    - `siteName`: string, required
    - `logo`: image with alt text
    - `navigationItems`: array of objects with `label` (string, required), `href` (string, required), `children` (array of same shape — one level of nesting)
    - `footerContent`: object with `text` (text), `copyrightText` (string)
    - `socialLinks`: array of objects with `platform` (string, options: github/linkedin/twitter/instagram/youtube), `url` (url, required)
    - `currentSemester`: string (e.g., "Fall 2026")
    - Use Sanity singleton pattern: add `__experimental_actions` or use `structureTool` desk structure to limit to single document

- [x] Task 5: Register all schemas in index.ts (AC: #8)
  - [x] 5.1 Import all object schemas (seo, button, portableText) and document schemas (page, siteSettings)
  - [x] 5.2 Export them in the `schemaTypes` array
  - [x] 5.3 Do NOT import block schemas yet (they don't exist) — leave comment indicating where block imports go
  - [x] 5.4 Do NOT import `blockBase` as a standalone schema — its fields are consumed by `defineBlock` helper, not registered independently

- [x] Task 6: Verify Studio starts (AC: #10)
  - [x] 6.1 Run `npm run dev` from the studio workspace
  - [x] 6.2 Verify Studio loads without schema errors in console
  - [x] 6.3 Verify page document type appears in Studio with title, slug, seo, and blocks fields
  - [x] 6.4 Verify siteSettings document type appears in Studio
  - [x] 6.5 Verify blocks[] array field is present on page type (it will show "Unknown type" for unregistered block types — this is expected)
  - [x] 6.6 Run `npm run build` from root — verify build succeeds

## Dev Notes

### Architecture Patterns — MUST FOLLOW

**Schema naming (kebab-case files, camelCase types):**
- File: `hero-banner.ts` → Type name: `heroBanner`
- File: `site-settings.ts` → Type name: `siteSettings`
- File: `block-base.ts` → Not registered as a type; exports field definitions consumed by `defineBlock`

**defineBlock pattern (from architecture):**
```typescript
// studio/src/schemaTypes/helpers/defineBlock.ts
import { defineType, defineField } from 'sanity'
import { blockBaseFields } from '../objects/block-base'

interface DefineBlockConfig {
  name: string
  title: string
  fields: ReturnType<typeof defineField>[]
  preview?: any
  icon?: any
}

export function defineBlock(config: DefineBlockConfig) {
  return defineType({
    name: config.name,
    title: config.title,
    type: 'object',
    fields: [...blockBaseFields, ...config.fields],
    preview: config.preview,
    icon: config.icon,
  })
}
```

**Block schema pattern (for Story 2.1 — included for context):**
```typescript
// studio/src/schemaTypes/blocks/hero-banner.ts
import { defineField } from 'sanity'
import { defineBlock } from '../helpers/defineBlock'

export const heroBanner = defineBlock({
  name: 'heroBanner',
  title: 'Hero Banner',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required() }),
    // ... block-specific fields only — base fields added by defineBlock
  ],
})
```

**Sanity helpers — ALWAYS use these:**
- `defineType` for all schema types
- `defineField` for all fields
- `defineArrayMember` for array `of` items
- Import from `'sanity'` (NOT `'@sanity/types'`)

**Validation patterns:**
```typescript
validation: (Rule) => Rule.required()                       // required field
validation: (Rule) => Rule.max(60)                          // max length
validation: (Rule) => Rule.required().max(160)              // required + max
validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }) // URL validation
```

**Slug field pattern:**
```typescript
defineField({
  name: 'slug',
  title: 'Slug',
  type: 'slug',
  options: { source: 'title', maxLength: 96 },
  validation: (Rule) => Rule.required(),
})
```

**Image with alt text pattern (NFR16 — enforced alt text):**
```typescript
defineField({
  name: 'image',
  title: 'Image',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative Text',
      type: 'string',
      description: 'Required for accessibility',
      validation: (Rule) => Rule.required(),
    }),
  ],
})
```

### Portable Text Configuration

The `portableText` object type should be defined as a reusable named type so block schemas (Story 2.1) can reference it via `type: 'portableText'`. Structure:

```typescript
// studio/src/schemaTypes/objects/portable-text.ts
import { defineType, defineField, defineArrayMember } from 'sanity'

export const portableText = defineType({
  name: 'portableText',
  title: 'Rich Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
          { title: 'Code', value: 'code' },
          { title: 'Underline', value: 'underline' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'External Link',
            fields: [
              defineField({
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: (Rule) =>
                  Rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
              }),
            ],
          },
          {
            name: 'internalLink',
            type: 'object',
            title: 'Internal Link',
            fields: [
              defineField({
                name: 'reference',
                type: 'reference',
                title: 'Reference',
                to: [{ type: 'page' }],
              }),
            ],
          },
        ],
      },
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
    }),
    // Inline images with required alt text
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Required for accessibility (NFR16)',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'caption',
          type: 'string',
          title: 'Caption',
        }),
      ],
    }),
    // Callout box
    defineArrayMember({
      name: 'callout',
      type: 'object',
      title: 'Callout Box',
      fields: [
        defineField({
          name: 'tone',
          type: 'string',
          title: 'Tone',
          options: { list: ['info', 'warning', 'success'] },
          initialValue: 'info',
        }),
        defineField({
          name: 'text',
          type: 'text',
          title: 'Text',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
  ],
})
```

### Site Settings Singleton Pattern

Sanity doesn't have a built-in singleton type. The recommended approach for `siteSettings` is:

1. Define as a regular document type with `__experimental_actions: ['update', 'publish']` (prevents creating more than one via Studio actions)
2. OR use desk structure in `sanity.config.ts` to hardcode a single document ID

The simpler approach for now: define the schema normally, and the desk structure can be refined later. Use `initialValue` on fields where sensible. Add a comment noting the singleton intent.

### Page Schema — blocks[] Array

The page schema's `blocks[]` array must reference all 12 P0 block type names. Since block schemas don't exist yet (Story 2.1), the `of` array will reference unregistered type names. Sanity Studio will show warnings in the blocks field but won't crash. This is intentional — the types become valid when block schemas are registered in Story 2.1.

```typescript
defineField({
  name: 'blocks',
  title: 'Page Blocks',
  type: 'array',
  of: [
    { type: 'heroBanner' },
    { type: 'featureGrid' },
    { type: 'sponsorCards' },
    { type: 'richText' },
    { type: 'ctaBanner' },
    { type: 'faqSection' },
    { type: 'contactForm' },
    { type: 'timeline' },
    { type: 'logoCloud' },
    { type: 'statsRow' },
    { type: 'teamGrid' },
    { type: 'textWithImage' },
  ],
})
```

**CRITICAL:** If unregistered types in the `of` array cause Studio to crash (rather than just warn), then either:
- Comment out the block type references and add a TODO for Story 2.1
- OR create minimal stub schemas for each block type (empty `defineBlock` calls) just to satisfy the registry

Test this during Task 6 and adjust.

### Previous Story Intelligence (1-2: Migrate Reference Project)

**Key learnings from Story 1.2:**
- Import alias conflicts: `Header.astro` and `Footer.astro` component names conflicted with UI primitive imports — used `HeaderUI`, `FooterUI` aliases. Watch for similar naming conflicts with schema types.
- CSS migration adopted shadcn hex tokens with `@import "shadcn/tailwind.css"` and `@theme inline` — the global.css was fully replaced.
- `@sanity/astro` requires `projectId` — a fallback `"placeholder"` was added in `astro.config.mjs`. Studio has its own `.env` handling.
- Build verified: 5 pages, 0 errors, 0 warnings.
- All 12 block components now exist in `astro-app/src/components/blocks/` with architecture camelCase names.
- Types defined in `astro-app/src/lib/types.ts` — these are the FRONTEND types (placeholder data shapes). They should NOT be conflated with Sanity schema types. The Sanity schemas define the SOURCE OF TRUTH; the frontend types will be updated to match in Story 2.2 when GROQ queries replace placeholder data.

**Files from 1-2 that this story builds on:**
- `astro-app/src/lib/types.ts` — current frontend types (reference, not source of truth for schemas)
- `astro-app/src/components/blocks/*.astro` — 12 block components that will consume the data shaped by these schemas

### Existing Studio State

- `studio/src/schemaTypes/index.ts` — exists, exports empty `schemaTypes[]` array
- `studio/sanity.config.ts` — configured with `structureTool()`, `visionTool()`, references `schemaTypes`
- `studio/package.json` — `sanity@^4.11.0`, `react@^19.2.1`, TypeScript 5.x
- No subdirectories under `schemaTypes/` yet — all must be created

### Library/Framework Requirements

| Library | Version | Import Pattern |
|---|---|---|
| `sanity` | ^4.11.0 | `import { defineType, defineField, defineArrayMember } from 'sanity'` |
| TypeScript | ^5.1.6 | All schemas must be `.ts` files with proper typing |

**No new dependencies needed.** All required APIs (`defineType`, `defineField`, `defineArrayMember`) are provided by the already-installed `sanity` package.

### File Structure (Files to Create)

```
studio/src/schemaTypes/
├── helpers/
│   └── defineBlock.ts          ← NEW (Task 2)
├── objects/
│   ├── block-base.ts           ← NEW (Task 3.1)
│   ├── seo.ts                  ← NEW (Task 3.2)
│   ├── button.ts               ← NEW (Task 3.3)
│   └── portable-text.ts        ← NEW (Task 3.4)
├── documents/
│   ├── page.ts                 ← NEW (Task 4.1)
│   └── site-settings.ts        ← NEW (Task 4.2)
├── blocks/                     ← NEW directory (empty — populated in Story 2.1)
└── index.ts                    ← MODIFY (Task 5)
```

### Testing Requirements

- **Sanity Studio loads:** `npm run dev` in studio workspace starts without schema registration errors
- **Page document visible:** Studio shows `page` document type with all fields
- **Site Settings visible:** Studio shows `siteSettings` document type with all fields
- **Object types work:** Can create a page and see seo fields, can add navigation items to site settings
- **Build passes:** `npm run build` from root completes successfully
- **No warnings for registered types:** Only expect warnings for unregistered block types in blocks[] array

### Anti-Patterns to Avoid

| Rule | What NOT to Do |
|---|---|
| No raw `defineType` for blocks | Always use `defineBlock` helper for block schemas |
| No duplicate base fields | Block-specific schemas must NOT redefine backgroundVariant/spacing/maxWidth |
| No inline GROQ in schemas | Schemas define structure only — queries go in `astro-app/src/lib/sanity.ts` |
| No React imports in schemas | Schema files are pure TypeScript — no JSX/React (React is only for Studio rendering, handled by Sanity internals) |
| No `tailwind.config.mjs` references | CSS/Tailwind config is in `astro-app/` only — schemas don't touch CSS |

### Project Structure Notes

- Alignment with architecture: exact directory structure from architecture doc Section "Sanity Studio (`studio/`)"
- `block-base.ts` is NOT registered as a standalone schema type — it exports field definitions consumed by `defineBlock`. Do not add it to the `schemaTypes[]` array.
- The `defineBlock` helper is a utility, not a schema — it goes in `helpers/` and is not registered.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Schema patterns, defineBlock, naming conventions, anti-patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md — Project Structure section for studio/ directory layout]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.3 acceptance criteria, FR40 (site settings)]
- [Source: _bmad-output/planning-artifacts/architecture.md — Data Architecture table: 7 document types + 17 block types]
- [Source: _bmad-output/implementation-artifacts/1-2-migrate-reference-project.md — Previous story debug log, file list, learnings]
- [Source: astro-app/src/lib/types.ts — Current frontend type interfaces (reference for field shapes)]
- [Source: studio/sanity.config.ts — Schema registration pattern via schemaTypes import]
- [Source: Context7 /websites/sanity_io — defineType/defineField patterns, validation rules, portable text configuration]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Playwright integration tests required separate config (`playwright.integration.config.ts`) — main config has `webServer` block that triggers full astro-app build + server startup, causing hangs for schema-only tests
- Dynamic `await import()` in tests failed with `SyntaxError: Cannot use import statement outside a module` — Playwright's TS transformer only handles static imports in test files, not dynamically imported `.ts` modules
- Fixed by switching tests to static `import` statements and adding `"type": "module"` to `studio/package.json`
- ~~Added `tsx` as devDependency~~ — removed during code review (unused, dead weight)

### Completion Notes List

- All 34 ATDD tests pass (34/34 green)
- `sanity build` succeeds with all schemas registered
- `astro-app` build passes (5 pages, 0 errors)
- All schemas follow `defineType`/`defineField`/`defineArrayMember` patterns from `'sanity'`
- `defineBlock` helper merges `blockBaseFields` before block-specific fields
- `blockBaseFields` is NOT registered as a standalone schema type
- Page schema references all 12 P0 block type names (unregistered — expected until Story 2.1)
- Site settings includes all FR40 fields: siteName, logo, nav, footer, social, currentSemester
- Portable text includes block styles, decorators, annotations, inline image (NFR16 alt text), callout box
- Test infrastructure: added `playwright.integration.config.ts` for schema tests, `test:integration` npm script

### File List

- `studio/src/schemaTypes/helpers/defineBlock.ts` — NEW
- `studio/src/schemaTypes/objects/block-base.ts` — NEW
- `studio/src/schemaTypes/objects/seo.ts` — NEW
- `studio/src/schemaTypes/objects/button.ts` — NEW
- `studio/src/schemaTypes/objects/portable-text.ts` — NEW
- `studio/src/schemaTypes/documents/page.ts` — NEW
- `studio/src/schemaTypes/documents/site-settings.ts` — NEW
- `studio/src/schemaTypes/blocks/` — NEW (empty directory)
- `studio/src/schemaTypes/index.ts` — MODIFIED (registered all schemas)
- `studio/package.json` — MODIFIED (added `"type": "module"`)
- `tests/integration/schema-infrastructure.spec.ts` — MODIFIED (unskipped all tests, switched to static imports, ESM fix)
- `playwright.integration.config.ts` — NEW (integration test config without webServer)
- `package.json` — MODIFIED (added `test:integration` script; `tsx` removed during review)
- `studio/sanity.config.ts` — MODIFIED (singleton pattern for siteSettings via structure builder)

### Senior Developer Review (AI)

**Reviewer:** Jay (via Claude Opus 4.6)
**Date:** 2026-02-07
**Outcome:** Approved with fixes applied

**Findings (7 total: 1 High, 3 Medium, 3 Low):**

**Fixed (4):**
- [H1] Removed dead `tsx` devDependency — never used in any script
- [M1] Replaced `any` types in `DefineBlockConfig` with Sanity-derived types (`SchemaDefinition['preview']`, `SchemaDefinition['icon']`)
- [M2] Implemented siteSettings singleton pattern — customized `structureTool` with fixed document ID and filtered `newDocumentOptions` in `sanity.config.ts`
- [M3] Added custom validation on `navigationItems` href fields — accepts relative paths (`/about`) and full URLs (`https://...`), rejects garbage input

**Accepted as-is (3 Low):**
- [L1] Sanity version mismatch warning (`^4.11.0` installed vs `4.22.0` runtime) — non-blocking, can be updated separately
- [L2] Portable text annotations use raw object literals instead of `defineArrayMember` — matches the story spec's own code example; Sanity handles annotations separately from array `of` members
- [L3] Completion notes claim astro-app build passes — misleading since Story 1.3 doesn't modify astro-app, but harmless

**All ACs verified implemented. 34/34 integration tests pass. Studio builds successfully.**

### Change Log

- 2026-02-07: Story created and implemented (Claude Opus 4.6)
- 2026-02-07: Code review — 4 fixes applied (H1, M1, M2, M3), status → done
