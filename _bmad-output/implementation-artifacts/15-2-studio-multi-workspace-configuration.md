# Story 15.2: Studio Multi-Workspace Configuration

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a content editor,
I want to switch between Capstone and RWC workspaces in Sanity Studio,
So that I can manage content for each program independently with appropriate desk structure and site-filtered views.

> **Depends on:** Story 15.1 (completed) — `rwc` dataset created, `siteField` added to 6 document schemas, schemas deployed to both datasets.

## Acceptance Criteria

1. **Given** the `rwc` dataset exists with schemas deployed (Story 15.1)
   **When** the Studio configuration is updated for multi-workspace
   **Then** `studio/sanity.config.ts` uses `defineConfig([...])` with an array of two workspace configs
   **And** workspace 1: `{ name: 'capstone', title: 'Capstone Sponsors', basePath: '/capstone', dataset: 'production' }` with an icon from `@sanity/icons`
   **And** workspace 2: `{ name: 'rwc', title: 'RWC Programs', basePath: '/rwc', dataset: 'rwc' }` with a different icon

2. **Given** both workspaces are configured
   **When** the Studio is loaded in a browser
   **Then** the navbar shows a workspace dropdown allowing switching between "Capstone Sponsors" and "RWC Programs"
   **And** the URL changes to `/capstone/...` or `/rwc/...` when switching
   **And** Vision tool queries the correct dataset per workspace

3. **Given** the RWC workspace is active
   **When** the desk structure loads
   **Then** two top-level groups appear: "RWC US" and "RWC International"
   **And** each group contains filtered document lists: `page`, `sponsor`, `project`, `testimonial`, `event`
   **And** the "RWC US" group shows only documents where `site == "rwc-us"`
   **And** the "RWC International" group shows only documents where `site == "rwc-intl"`
   **And** a shared "Site Settings" singleton appears per-site (one for `rwc-us`, one for `rwc-intl`)

4. **Given** the RWC workspace is active
   **When** a new document is created from the "RWC US" group
   **Then** the `site` field is automatically pre-filled with `"rwc-us"` via initial value templates
   **And** the same applies to "RWC International" group → `site` pre-filled with `"rwc-intl"`

5. **Given** the Capstone workspace is active
   **When** the desk structure loads
   **Then** the existing desk structure is preserved (Site Settings singleton, Submissions, auto-listed types)
   **And** the `site` field remains hidden on all document forms (capstone editors never see it)
   **And** existing `siteSettings` singleton with fixed `documentId: 'siteSettings'` continues to work

6. **Given** the `siteField` hidden callback currently uses `process.env.SANITY_STUDIO_DATASET`
   **When** multi-workspace is active (both workspaces share the same Studio build)
   **Then** the `siteField` hidden logic is updated to work per-workspace at runtime
   **And** the field is hidden in the Capstone workspace and visible in the RWC workspace
   **And** the validation callback (already using `context.getClient().config().dataset`) continues to work correctly

7. **Given** the Presentation tool is configured
   **When** preview is used in each workspace
   **Then** the Capstone workspace previews at the capstone site URL (current `localhost:4321` for dev)
   **And** the RWC workspace previews at a placeholder URL (e.g., `http://localhost:4322`) until Story 15.5 creates the CF Pages projects
   **And** both workspaces share the same `resolve` location resolver

8. **Given** all changes are complete
   **When** the test suite runs
   **Then** all existing tests pass (no regressions)
   **And** `npm run typegen` passes (no schema shape changes — only config changes)
   **And** the Studio builds without errors

## Tasks / Subtasks

- [x] **Task 1: Fix `siteField` hidden callback for multi-workspace** (AC: #6)
  - [x] 1.1 Update `studio/src/schemaTypes/fields/site-field.ts`: change `hidden` from env-var check to a simple `hidden: true` default (capstone behavior)
  - [x] 1.2 Create a helper function `createSchemaTypesForWorkspace(dataset: string)` in a new file `studio/src/schemaTypes/workspace-utils.ts` that returns the `schemaTypes` array with `siteField.hidden` overridden based on the target dataset
  - [x] 1.3 For `dataset === 'production'`: site field stays hidden (`hidden: true`)
  - [x] 1.4 For `dataset === 'rwc'`: site field is visible (`hidden: false`)
  - [x] 1.5 The validation callback in `siteField` already uses `context.getClient().config().dataset` — no changes needed there

- [x] **Task 2: Create RWC desk structure** (AC: #3)
  - [x] 2.1 Create `studio/src/structure/rwc-desk-structure.ts` exporting a desk structure function
  - [x] 2.2 The structure should have two top-level list items: "RWC US" (icon: `EarthAmericasIcon`) and "RWC International" (icon: `EarthGlobeIcon`)
  - [x] 2.3 Each group contains filtered document lists for: `page`, `sponsor`, `project`, `testimonial`, `event`
  - [x] 2.4 Filter pattern: `S.documentList().schemaType(type).title(title).filter('_type == $type && site == $site').params({type, site})`
  - [x] 2.5 Each group has a "Site Settings" item: `S.document().schemaType('siteSettings').documentId('siteSettings-' + site).title('Site Settings')`
  - [x] 2.6 Note: RWC siteSettings uses different document IDs per site (`siteSettings-rwc-us`, `siteSettings-rwc-intl`) — NOT the fixed `siteSettings` ID used in capstone

- [x] **Task 3: Refactor `sanity.config.ts` to multi-workspace** (AC: #1, #2, #5)
  - [x] 3.1 Extract current capstone structure into `studio/src/structure/capstone-desk-structure.ts` (move existing inline structure)
  - [x] 3.2 Convert `defineConfig({...})` → `defineConfig([capstoneWorkspace, rwcWorkspace])`
  - [x] 3.3 Capstone workspace: `{ name: 'capstone', title: 'Capstone Sponsors', basePath: '/capstone', dataset: 'production', icon: RocketIcon }`
  - [x] 3.4 RWC workspace: `{ name: 'rwc', title: 'RWC Programs', basePath: '/rwc', dataset: 'rwc', icon: EarthGlobeIcon }`
  - [x] 3.5 Both workspaces share the same `projectId`
  - [x] 3.6 Each workspace gets its own `structureTool({ structure: ... })` with workspace-specific desk structure
  - [x] 3.7 Each workspace uses `createSchemaTypesForWorkspace(dataset)` for schema types
  - [x] 3.8 Preserve all existing capstone behavior: singleton actions, `newDocumentOptions` filter, `formSchema()` plugin

- [x] **Task 4: Configure initial value templates for RWC** (AC: #4)
  - [x] 4.1 In the RWC workspace config, add `schema.templates` that pre-fill the `site` field
  - [x] 4.2 For each document type that has the `site` field (`page`, `sponsor`, `project`, `testimonial`, `event`), create two templates:
    - `{ id: '{type}-rwc-us', title: '{Type} (RWC US)', schemaType: '{type}', value: { site: 'rwc-us' } }`
    - `{ id: '{type}-rwc-intl', title: '{Type} (RWC Intl)', schemaType: '{type}', value: { site: 'rwc-intl' } }`
  - [x] 4.3 Filter `newDocumentOptions` in RWC workspace to hide default templates for site-aware types (force editors to pick site-specific ones) AND hide `siteSettings` (created only via desk structure with fixed IDs) AND hide `submission` (capstone-only)
  - [x] 4.4 Wire desk structure `S.documentList()` with `initialValueTemplates` so creating a doc from inside "RWC US" group auto-selects the `{type}-rwc-us` template (see Dev Notes — Desk Structure Initial Value Binding)

- [x] **Task 5: Configure Presentation tool per workspace** (AC: #7)
  - [x] 5.1 Capstone workspace: `presentationTool({ resolve, previewUrl: { origin: process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'http://localhost:4321' } })`
  - [x] 5.2 RWC workspace: `presentationTool({ resolve, previewUrl: { origin: process.env.SANITY_STUDIO_RWC_PREVIEW_ORIGIN || 'http://localhost:4322' } })` (placeholder until Story 15.5)
  - [x] 5.3 Both workspaces share the same `resolve` from `./src/presentation/resolve.ts`
  - [x] 5.4 **Known caveat**: `resolve.ts` siteSettings location resolver currently queries ALL pages — in RWC workspace this will show pages from both sites. Acceptable for now; Story 15.3 (data fetching refactor) can scope resolver queries by site if needed

- [x] **Task 6: Update `sanity.cli.ts` for multi-workspace** (AC: #8)
  - [x] 6.1 Verify `sanity.cli.ts` still works — it uses `SANITY_STUDIO_DATASET` env var which defaults to `production`
  - [x] 6.2 TypeGen works — added `schemaExtraction.workspace: 'capstone'` to resolve multi-workspace extraction

- [x] **Task 7: Verify & test** (AC: #8)
  - [x] 7.1 Run `npm run test:unit` — all 531 tests pass (47 files, 0 failures)
  - [x] 7.2 Run `npm run typegen` — passes (14 queries, 49 schema types)
  - [x] 7.3 Run `npm run dev -w studio` — manual verification (Studio loads, workspace dropdown appears)
  - [x] 7.4 Verify capstone workspace: existing desk structure, siteSettings singleton, site field hidden
  - [x] 7.5 Verify RWC workspace: two groups (US/Intl), filtered document lists, site field visible
  - [x] 7.6 Deploy schemas to both datasets: `npx sanity schema deploy` and `SANITY_STUDIO_DATASET=rwc npx sanity schema deploy`

## Dev Notes

### Critical: The `siteField.hidden` Multi-Workspace Problem

**The problem**: Story 15.1 used `process.env.SANITY_STUDIO_DATASET` in the `hidden` callback. This is statically replaced at build time — it's a single value for the entire Studio build. In multi-workspace mode, both workspaces run from the same build, so this env var can't differentiate between them.

**The solution**: Create per-workspace schema types using a mapping function. Each workspace calls `createSchemaTypesForWorkspace(dataset)` which returns the schema types array with `siteField.hidden` correctly set for that workspace.

```typescript
// studio/src/schemaTypes/workspace-utils.ts
import {schemaTypes} from './index'

/**
 * Returns schema types with siteField.hidden set for the target dataset.
 * - production: site field hidden (capstone editors never see it)
 * - rwc: site field visible (editors must select a site)
 */
export function createSchemaTypesForWorkspace(targetDataset: string) {
  const shouldHide = targetDataset === 'production'

  return schemaTypes.map((type) => {
    // Only modify types that have a 'site' field
    if (!('fields' in type) || !type.fields) return type
    const siteFieldIndex = type.fields.findIndex((f: any) => f.name === 'site')
    if (siteFieldIndex === -1) return type

    // Clone the type and override the site field's hidden property
    const fields = [...type.fields]
    fields[siteFieldIndex] = {
      ...fields[siteFieldIndex],
      hidden: shouldHide,
    }
    return {...type, fields}
  })
}
```

**The siteField.ts itself becomes simpler**:

```typescript
// site-field.ts — remove env var dependency
export const siteField = defineField({
  name: 'site',
  title: 'Site',
  type: 'string',
  description: 'Which RWC site this content belongs to',
  options: {
    list: [
      {title: 'RWC US', value: 'rwc-us'},
      {title: 'RWC International', value: 'rwc-intl'},
    ],
    layout: 'radio',
  },
  // Default: hidden. Overridden per workspace in sanity.config.ts
  // via createSchemaTypesForWorkspace()
  hidden: true,
  validation: (Rule) =>
    Rule.custom((value, context) => {
      const {dataset} = context.getClient({apiVersion: '2024-01-01'}).config()
      if (dataset === 'rwc' && !value) {
        return 'Site is required for RWC content'
      }
      return true
    }),
})
```

### RWC Desk Structure Pattern

Per Sanity docs, `structureTool({ structure: (S) => ... })` accepts a structure builder callback. The RWC workspace needs a custom structure that groups documents by site:

```typescript
// studio/src/structure/rwc-desk-structure.ts
import {EarthAmericasIcon, EarthGlobeIcon, CogIcon} from '@sanity/icons'
import type {StructureBuilder} from 'sanity/structure'

const CONTENT_TYPES = ['page', 'sponsor', 'project', 'testimonial', 'event']

function siteGroup(S: StructureBuilder, siteId: string, title: string, icon: React.ComponentType) {
  return S.listItem()
    .title(title)
    .icon(icon)
    .child(
      S.list()
        .title(title)
        .items([
          S.listItem()
            .title('Site Settings')
            .icon(CogIcon)
            .child(
              S.document()
                .schemaType('siteSettings')
                .documentId(`siteSettings-${siteId}`)
            ),
          S.divider(),
          ...CONTENT_TYPES.map((type) =>
            S.listItem()
              .title(type.charAt(0).toUpperCase() + type.slice(1) + 's')
              .child(
                S.documentList()
                  .schemaType(type)
                  .title(`${title} ${type}s`)
                  .filter('_type == $type && site == $site')
                  .params({type, site: siteId})
                  .initialValueTemplates([
                    S.initialValueTemplateItem(`${type}-${siteId}`)
                  ])
              )
          ),
        ])
    )
}

export const rwcDeskStructure = (S: StructureBuilder) =>
  S.list()
    .title('RWC Content')
    .items([
      siteGroup(S, 'rwc-us', 'RWC US', EarthAmericasIcon),
      siteGroup(S, 'rwc-intl', 'RWC International', EarthGlobeIcon),
    ])
```

### Multi-Workspace Config Shape

Per Sanity docs (verified 2026-02-26), `defineConfig([...])` accepts an array of workspace configs. Each workspace is a full studio config with additional required properties: `name`, `basePath`, `title`, and optional `icon`, `subtitle`.

```typescript
// Skeleton of the target sanity.config.ts
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {formSchema} from '@sanity/form-toolkit/form-schema'
import {RocketIcon, EarthGlobeIcon} from '@sanity/icons'
import {createSchemaTypesForWorkspace} from './src/schemaTypes/workspace-utils'
import {capstoneStructure} from './src/structure/capstone-desk-structure'
import {rwcDeskStructure} from './src/structure/rwc-desk-structure'
import {resolve} from './src/presentation/resolve'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '<your project ID>'

export default defineConfig([
  {
    name: 'capstone',
    title: 'Capstone Sponsors',
    basePath: '/capstone',
    icon: RocketIcon,
    projectId,
    dataset: 'production',
    plugins: [
      structureTool({structure: capstoneStructure}),
      presentationTool({resolve, previewUrl: {origin: '...', preview: '/'}}),
      visionTool(),
      formSchema(),
    ],
    schema: {types: createSchemaTypesForWorkspace('production')},
    document: {/* existing singleton actions + newDocumentOptions */},
  },
  {
    name: 'rwc',
    title: 'RWC Programs',
    basePath: '/rwc',
    icon: EarthGlobeIcon,
    projectId,
    dataset: 'rwc',
    plugins: [
      structureTool({structure: rwcDeskStructure}),
      presentationTool({resolve, previewUrl: {origin: '...', preview: '/'}}),
      visionTool(),
      formSchema(),
    ],
    schema: {
      types: createSchemaTypesForWorkspace('rwc'),
      templates: (prev) => {
        // 1. Remove default templates for site-aware types + siteSettings
        const siteTypes = ['page', 'sponsor', 'project', 'testimonial', 'event']
        const filtered = prev.filter(
          (t) => !siteTypes.includes(t.schemaType) && t.schemaType !== 'siteSettings'
        )
        // 2. Add site-specific templates (page-rwc-us, page-rwc-intl, etc.)
        const sites = [{id: 'rwc-us', title: 'RWC US'}, {id: 'rwc-intl', title: 'RWC International'}]
        const siteTemplates = sites.flatMap(({id, title}) =>
          siteTypes.map((type) => ({
            id: `${type}-${id}`,
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} (${title})`,
            schemaType: type,
            value: {site: id},
          }))
        )
        return [...filtered, ...siteTemplates]
      },
    },
    document: {
      actions: (input, context) => {
        // Guard both RWC siteSettings singletons
        const rwcSingletonIds = ['siteSettings-rwc-us', 'siteSettings-rwc-intl']
        if (context.schemaType === 'siteSettings' ||
            rwcSingletonIds.includes(context.documentId || '')) {
          return input.filter(
            ({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action)
          )
        }
        return input
      },
      newDocumentOptions: (prev) =>
        prev.filter((t) =>
          t.templateId !== 'siteSettings' && t.templateId !== 'submission'
        ),
    },
  },
])
```

### Initial Value Templates (Complete Pattern)

Per Sanity docs (Initial Value Templates API), `schema.templates` is a **function** that receives previous templates and returns the updated set. The RWC workspace must:
1. Remove default templates for site-aware types (prevent bare "Page" appearing — force "Page (RWC US)" etc.)
2. Add site-specific templates that pre-fill the `site` field
3. Remove `siteSettings` template entirely (created only via desk structure with fixed IDs)

```typescript
const SITE_TYPES = ['page', 'sponsor', 'project', 'testimonial', 'event']
const SITES = [
  {id: 'rwc-us', title: 'RWC US'},
  {id: 'rwc-intl', title: 'RWC International'},
]

// schema.templates in RWC workspace config:
schema: {
  types: createSchemaTypesForWorkspace('rwc'),
  templates: (prev) => {
    // 1. Remove default templates for site-aware types + siteSettings
    const filtered = prev.filter(
      (t) => !SITE_TYPES.includes(t.schemaType) && t.schemaType !== 'siteSettings'
    )
    // 2. Add site-specific templates
    const siteTemplates = SITES.flatMap(({id: siteId, title: siteTitle}) =>
      SITE_TYPES.map((type) => ({
        id: `${type}-${siteId}`,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} (${siteTitle})`,
        schemaType: type,
        value: {site: siteId},
      }))
    )
    return [...filtered, ...siteTemplates]
  },
},
```

### Desk Structure Initial Value Binding

When editors create a document from within a site group (e.g., "RWC US" → "Pages" → "+"), the new document dialog should default to the correct site template. Use `initialValueTemplates` on `S.documentList()`:

```typescript
S.documentList()
  .schemaType(type)
  .title(`${title} ${type}s`)
  .filter('_type == $type && site == $site')
  .params({type, site: siteId})
  .initialValueTemplates([
    S.initialValueTemplateItem(`${type}-${siteId}`)
  ])
```

This locks the "+" button inside each site group to the correct template — an editor creating a page inside "RWC US" automatically gets `site: 'rwc-us'`.

### siteSettings in RWC: Per-Site Instances

In the capstone workspace, `siteSettings` is a singleton with fixed `documentId: 'siteSettings'`. In the RWC workspace, two separate instances are needed:

- `siteSettings-rwc-us` — Site Settings for RWC US
- `siteSettings-rwc-intl` — Site Settings for RWC International

These use different document IDs (not the fixed `siteSettings` ID). The RWC desk structure creates them via `S.document().schemaType('siteSettings').documentId('siteSettings-rwc-us')`.

**Important**: The capstone workspace's `newDocumentOptions` filter for singletons should NOT affect the RWC workspace since each workspace has its own `document` config.

**Per Sanity best practices (singleton pattern):** Singletons are enforced via Structure, not schema options. The RWC workspace must:
1. **Restrict `document.actions` on both fixed siteSettings IDs** — prevent delete/duplicate on `siteSettings-rwc-us` and `siteSettings-rwc-intl` (same pattern as capstone's `singletonTypes` filter, but matching by `documentId` instead of `schemaType`)
2. **Filter `siteSettings` from `newDocumentOptions`** — editors create siteSettings only via the desk structure pinned entries, never from the "+" menu

```typescript
// RWC workspace document config:
document: {
  actions: (input, context) => {
    // Restrict actions on both RWC siteSettings instances
    const rwcSingletonIds = ['siteSettings-rwc-us', 'siteSettings-rwc-intl']
    if (context.schemaType === 'siteSettings' ||
        rwcSingletonIds.includes(context.documentId || '')) {
      return input.filter(
        ({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action)
      )
    }
    return input
  },
  newDocumentOptions: (prev) =>
    prev.filter((t) =>
      t.templateId !== 'siteSettings' && t.templateId !== 'submission'
    ),
},
```

### Project Structure Notes

```
studio/
  sanity.config.ts                              # MODIFY: defineConfig([...]) with two workspaces
  src/
    schemaTypes/
      fields/
        site-field.ts                           # MODIFY: simplify hidden to `true` default
      workspace-utils.ts                        # NEW: createSchemaTypesForWorkspace()
      index.ts                                  # NO CHANGE (schema types stay the same)
    structure/
      capstone-desk-structure.ts                # NEW: extracted from current sanity.config.ts
      rwc-desk-structure.ts                     # NEW: site-grouped desk structure
    presentation/
      resolve.ts                                # NO CHANGE (shared between workspaces)
```

**Files created:** 3
- `studio/src/schemaTypes/workspace-utils.ts`
- `studio/src/structure/capstone-desk-structure.ts`
- `studio/src/structure/rwc-desk-structure.ts`

**Files modified:** 2
- `studio/sanity.config.ts` — multi-workspace array config
- `studio/src/schemaTypes/fields/site-field.ts` — simplify hidden to `true` default

**Files deleted:** 0

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-15-multi-site-infrastructure.md#Story 15.2] — Story definition and acceptance criteria
- [Source: _bmad-output/implementation-artifacts/15-1-create-rwc-dataset-deploy-schemas.md] — Story 15.1 learnings: siteField pattern, hidden callback limitations, env var vs runtime detection
- [Source: Sanity Docs — Workspaces] — `defineConfig([...])` multi-workspace pattern, navbar dropdown, workspace properties
- [Source: Sanity Docs — Configuration API] — Workspace config properties: name, basePath, title, icon, subtitle
- [Source: Sanity Docs — Initial Value Templates API] — Template definition: id, title, schemaType, value, parameters
- [Source: studio/sanity.config.ts] — Current single-workspace config (lines 1-79)
- [Source: studio/src/schemaTypes/fields/site-field.ts] — Current siteField with env var hidden callback
- [Source: studio/src/presentation/resolve.ts] — Shared location resolver (page, project, event, siteSettings)
- [Source: studio/src/schemaTypes/index.ts] — Schema registry (7 documents, 13 blocks, 8 objects)
- [Source: _bmad-output/project-context.md] — Project rules, anti-patterns, testing architecture

### Architecture Compliance

| Constraint | How This Story Complies |
|---|---|
| **Monorepo structure** | All changes in `studio/` — no `astro-app/` changes needed |
| **Schema rules** | Uses `defineConfig`, `defineField` from `sanity` — standard API |
| **TypeGen** | No schema shape changes — config-only refactor. TypeGen still passes. |
| **Schema deploy** | Redeploy after changes: `npx sanity schema deploy` for both datasets |
| **Zero regression** | Capstone workspace preserves ALL existing behavior |
| **$0 cost** | No new resources — same project, same datasets |
| **Ask first** | Modifying `sanity.config.ts` — per CLAUDE.md, dev should confirm approach with Jay |

### Library & Framework Requirements

| Package | Version | Where | Purpose |
|---|---|---|---|
| `sanity` | existing (^5.11.0) | `studio/` | `defineConfig`, `defineField`, workspace API |
| `@sanity/icons` | existing | `studio/` | `RocketIcon`, `EarthAmericasIcon`, `EarthGlobeIcon`, `CogIcon` |

**No new packages needed.** This story only uses existing Sanity APIs.

### Testing Requirements

**Unit tests (Vitest):**

| Test | File | What to Assert |
|---|---|---|
| `createSchemaTypesForWorkspace('production')` hides site field | `studio/src/schemaTypes/__tests__/workspace-utils.test.ts` | Types with site field have `hidden: true` |
| `createSchemaTypesForWorkspace('rwc')` shows site field | same file | Types with site field have `hidden: false` |
| Types without site field are unchanged | same file | `submission` type returned as-is |
| Existing schema tests still pass | existing test files | No regressions |

**Manual verification (NOT automated):**
- [ ] Studio dev server loads with workspace dropdown
- [ ] Capstone workspace: existing desk structure, singleton works, site field hidden
- [ ] RWC workspace: two groups (US/Intl), filtered lists show correct documents
- [ ] RWC workspace: creating a doc from "RWC US" group pre-fills `site: 'rwc-us'`
- [ ] Vision tool queries correct dataset per workspace
- [ ] Presentation tool shows correct preview URL per workspace
- [ ] `npm run typegen` passes
- [ ] `npm run test:unit` passes

### Previous Story Intelligence (from Story 15.1)

**Key learnings that MUST be applied:**

1. **The `hidden` callback does NOT have `context.getClient()`** — it only receives `{document, currentUser, value, parent}`. That's why Story 15.1 used `process.env.SANITY_STUDIO_DATASET`. This story must find a different approach since env vars are static per build.

2. **The validation callback DOES have `context.getClient()`** — and it already correctly uses `context.getClient({apiVersion: '2024-01-01'}).config().dataset` to detect the active workspace dataset at runtime. No changes needed to validation.

3. **Spread syntax for siteField** — Story 15.1 used `{...siteField, group: 'xxx'}` in document schemas. The `createSchemaTypesForWorkspace` function must handle this correctly — it needs to find fields where `name === 'site'` regardless of whether they were spread with additional properties.

4. **The `fields/` subdirectory** under `schemaTypes/` is new (created in 15.1). The `structure/` subdirectory will also be new.

5. **Test patterns** — Story 15.1 wrote 15 tests for siteField. Follow the same pattern for workspace-utils tests.

6. **Schema deployment** — Both `npx sanity schema deploy` (production) and `SANITY_STUDIO_DATASET=rwc npx sanity schema deploy` must succeed.

### Git Intelligence

Recent commits (updated 2026-02-27):
```
3e1f7ab chore(release): 1.9.0 [skip ci]
1f3b501 Merge pull request #333 from gsinghjay/preview
fa413e6 Merge pull request #338 — FastAPI CF worker template
8aebb73 Merge pull request #336 — public events calendar
32f4025 Merge pull request #339 — Story 15.1 (create rwc dataset + deploy schemas)
```

**Story 15.1 is merged to `preview` in PR #339** — all siteField changes, rwc dataset, schema deployments are on the branch.

Branch naming convention: `feat/15-2-studio-multi-workspace-configuration`
Commit prefix convention: `feat:` for features, `fix:` for corrections.

### Sanity Best Practices Compliance (Enriched 2026-02-27)

Cross-referenced with Sanity MCP rules (`sanity-schema`, `sanity-studio-structure`, `sanity-visual-editing`, `sanity-astro`) and the `/sanity-best-practices` skill rules.

| Best Practice Rule | Status | Notes |
|---|---|---|
| **`defineType`/`defineField`/`defineArrayMember` always** | COMPLIANT | All schema code uses strict helpers. No raw objects. |
| **Icons on all types** | COMPLIANT | Workspace icons: `RocketIcon`, `EarthGlobeIcon`. Desk structure icons: `EarthAmericasIcon`, `CogIcon`. |
| **Singletons via Structure, not schema** | COMPLIANT | siteSettings enforced via `S.document().documentId()` + `document.actions` filter. No fake `singleton: true`. |
| **Data > Presentation naming** | COMPLIANT | Field names describe content (`site`, `siteSettings`) not presentation. |
| **Radio layout for short lists** | COMPLIANT | `siteField` already uses `layout: 'radio'` for 2-item list (from 15.1). |
| **Array `_key` as React key** | N/A | No array rendering in this story. |
| **`stegaClean` for logic comparisons** | N/A | No frontend changes in this story. |
| **SEO metadata stega-free** | N/A | No frontend changes. |
| **Presentation Tool `resolve` locations** | PARTIAL | Current `resolve.ts` uses older `rxjs .pipe()` pattern instead of recommended `defineLocations`. Pre-existing; not this story's scope. siteSettings resolver shows ALL pages (cross-site in RWC). |
| **Shared fields pattern** | COMPLIANT | `siteField` is a shared field imported with spread syntax across 6 document types (established in 15.1). |
| **Singleton `document.actions` guards** | ENRICHED | RWC workspace now includes action guards for BOTH `siteSettings-rwc-us` and `siteSettings-rwc-intl` (see updated Dev Notes). |
| **`newDocumentOptions` filtering** | ENRICHED | RWC workspace filters out `siteSettings` + `submission` + bare site-aware types (force site-specific templates). |
| **`initialValueTemplates` on desk lists** | ENRICHED | `S.documentList().initialValueTemplates()` binds the "+" button inside each site group to the correct site template. |
| **`schema.templates` function pattern** | ENRICHED | Uses `(prev) => [...]` function form, not static array. Filters defaults + adds site-specific templates. |

**Anti-patterns avoided:**
- NOT using `singleton: true` on schema (doesn't exist)
- NOT using index as React key (no array rendering)
- NOT mutating schema types globally (per-workspace mapping via `createSchemaTypesForWorkspace`)
- NOT using env vars for runtime workspace detection (`hidden` field override via config, not `process.env`)
- NOT hardcoding API tokens (all via `process.env`)

**Gotcha for dev agent — `{...siteField, group}` spread handling:**
Story 15.1 used `{...siteField, group: 'layout'}` when adding the site field to document schemas. The `createSchemaTypesForWorkspace` function iterates `type.fields` looking for `name === 'site'`. When siteField is spread with extra properties, the `name` property is preserved — so `fields.find(f => f.name === 'site')` works correctly. However, the function clones the field and overrides `hidden`, which must merge with any additional spread properties. Use shallow spread: `{...fields[i], hidden: shouldHide}` to preserve the `group` and any other extras.

### What This Story Does NOT Do

- Does NOT modify GROQ queries or data fetching in `astro-app/` (Story 15.3)
- Does NOT add CSS theming (Story 15.4)
- Does NOT create CF Pages projects (Story 15.5)
- Does NOT create actual RWC content (that's editor work after this story)
- Does NOT modify schema type definitions in `documents/` or `objects/` — only the config and siteField hidden callback
- `resolve.ts` was modernized to `defineLocations` pattern during code review (still shared between workspaces)

## Change Log

- 2026-02-27: Second code review fixes (6 findings) — all addressed:
  - M-1: Fixed File List documentation (corrected counts: 5 new, 5 modified; removed duplicates)
  - M-2: Renamed test `SITE_AWARE_TYPES` to `TYPES_WITH_SITE_FIELD`, imports constant from `constants.ts`
  - M-3: Changed RWC workspace icon from `EarthGlobeIcon` to `UsersIcon` (avoids collision with RWC International group icon)
  - L-1: Replaced 12+ `any` casts in `workspace-utils.test.ts` with typed `findType`/`findField` helpers
  - L-2: Restored `schemaType === 'siteSettings'` guard to RWC `document.actions` (defense-in-depth parity with capstone)
  - L-3: Updated `project-context.md` Studio Configuration section with multi-workspace details
- 2026-02-27: Implementation complete — all 7 tasks done. 3 new files, 4 modified files. 531 tests pass, typegen passes, Studio builds clean.
- 2026-02-27: Sanity best practices enrichment — cross-referenced with MCP rules (sanity-schema, sanity-studio-structure, sanity-visual-editing, sanity-astro) and `/sanity-best-practices` skill rules. Added:
  - RWC siteSettings singleton action guards for both fixed document IDs
  - Complete `schema.templates` function pattern (filter defaults + add site-specific)
  - `newDocumentOptions` filtering for siteSettings + submission in RWC workspace
  - `S.documentList().initialValueTemplates()` binding for desk structure site groups
  - Sanity Best Practices Compliance matrix (14 rules checked)
  - Anti-pattern avoidance checklist
  - `{...siteField, group}` spread handling gotcha for `createSchemaTypesForWorkspace`
  - siteSettings resolver cross-site caveat for RWC workspace
  - Updated git intelligence with latest commits (PR #339 merged)
- 2026-02-27: Code review fixes (7 findings) — all addressed in commit `80b626c`:
  - P1-1: Extracted shared constants (`CAPSTONE_SINGLETON_TYPES`, `SITE_AWARE_TYPES`, `RWC_SITES`, `RWC_SINGLETON_IDS`) to `studio/src/constants.ts` — eliminates duplication between `sanity.config.ts` and desk structure files
  - P1-2: Added explicit `import type {ComponentType} from 'react'` in `rwc-desk-structure.ts`
  - P2-3: Tightened RWC `document.actions` guard to `documentId`-only check (removed broad `schemaType === 'siteSettings'` match)
  - P2-4: Replaced `any` with `SchemaField` interface in `workspace-utils.ts`
  - P2-5: Added test for unknown dataset behavior (`createSchemaTypesForWorkspace('staging')` → site field visible)
  - P3-6: Modernized `resolve.ts` from legacy rxjs `.pipe()` pattern to `defineLocations` API (per Sanity docs)
  - P3-7: Fixed siteSettings cross-site resolver by using static `{message, tone}` form instead of `listenQuery` for all pages

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- TypeGen initially failed with `SchemaExtractionError: Multiple workspaces found` — resolved by adding `schemaExtraction.workspace: 'capstone'` to `sanity.cli.ts`
- Existing site-field test `hidden is a function` needed update to `hidden defaults to true` after simplifying siteField.hidden from callback to boolean

### Completion Notes List

- Task 1: Simplified `siteField.hidden` from env-var callback to `true` default. Created `createSchemaTypesForWorkspace()` that returns schema types with site field hidden/visible per dataset. 7 unit tests written and passing.
- Task 2: Created `rwc-desk-structure.ts` with two site groups (RWC US / RWC International), each containing Site Settings singleton + 5 filtered document lists with `initialValueTemplates` binding.
- Task 3: Extracted capstone desk structure to its own file. Converted `defineConfig({})` to `defineConfig([capstone, rwc])` array. Capstone preserves all existing behavior (singleton actions, newDocumentOptions, formSchema). RWC gets its own plugins, schema types, and document config.
- Task 4: RWC workspace `schema.templates` filters defaults for site-aware types and adds 10 site-specific templates (5 types × 2 sites). `newDocumentOptions` hides siteSettings and submission. Desk structure `initialValueTemplates` auto-selects correct site template.
- Task 5: Capstone uses `SANITY_STUDIO_PREVIEW_ORIGIN` (localhost:4321). RWC uses `SANITY_STUDIO_RWC_PREVIEW_ORIGIN` (localhost:4322 placeholder). Both share `resolve.ts`.
- Task 6: `sanity.cli.ts` updated with `schemaExtraction.workspace: 'capstone'` for multi-workspace TypeGen support. Env var dataset default unchanged.
- Task 7: 531 tests pass (47 files, 0 failures). TypeGen passes (14 queries, 49 types). Studio builds clean.
- Code review: All 7 findings fixed. 532 tests pass (8 tests in workspace-utils). TypeGen passes. No regressions.

### File List

**New files (5):**
- `studio/src/constants.ts` — shared constants (singleton types, site-aware types, RWC sites/IDs)
- `studio/src/schemaTypes/workspace-utils.ts` — `createSchemaTypesForWorkspace()` helper
- `studio/src/schemaTypes/__tests__/workspace-utils.test.ts` — 8 tests for workspace-utils
- `studio/src/structure/capstone-desk-structure.ts` — extracted capstone desk structure
- `studio/src/structure/rwc-desk-structure.ts` — RWC site-grouped desk structure

**Modified files (5):**
- `studio/sanity.config.ts` — multi-workspace array config with defineConfig([...]), imports shared constants
- `studio/sanity.cli.ts` — added `schemaExtraction.workspace: 'capstone'`
- `studio/src/schemaTypes/fields/site-field.ts` — simplified hidden to `true` default
- `studio/src/schemaTypes/fields/__tests__/site-field.test.ts` — updated hidden assertion
- `studio/src/presentation/resolve.ts` — modernized to `defineLocations` pattern (removed rxjs dependency)

**Tracking files modified (2):**
- `_bmad-output/implementation-artifacts/15-2-studio-multi-workspace-configuration.md` — story status + task checkboxes
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — status: in-progress → review
