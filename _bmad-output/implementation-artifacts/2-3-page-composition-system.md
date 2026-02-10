# Story 2.3: Page Composition System

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a content editor,
I want to create pages by selecting, arranging, and reordering blocks from the block library in Sanity Studio,
So that I can build new pages without developer assistance.

## Acceptance Criteria

1. Content editors can add blocks to a page from a list of all registered block types in Sanity Studio (FR1)
2. Content editors can reorder blocks via drag-and-drop in Sanity Studio (FR2)
3. Content editors can remove blocks from a page in Sanity Studio (FR2)
4. Each block in the `blocks[]` array inherits base fields (backgroundVariant, spacing, maxWidth) from `defineBlock` and editors can configure them from constrained presets (FR3)
5. Content editors can use Sanity Studio's built-in preview to review page content before publishing (FR4)
6. Content editors can publish page changes in Sanity Studio, making them available for the next site build (FR5)
7. `BlockRenderer.astro` dispatches each block by `_type` to the correct Astro component — verified working end-to-end with Sanity data for all block types that have GROQ projections
8. `astro-app/src/pages/[...slug].astro` dynamic catch-all route fetches pages by slug from Sanity and renders through Layout + BlockRenderer (already implemented, needs verification with all block types)
9. Unrecognized block types render a visible placeholder in development and nothing in production
10. All static pages (about, contact, projects, sponsors) are migrated from placeholder data to Sanity queries
11. `astro-app/src/lib/data/` placeholder data directory is removed after all pages use Sanity
12. `pageBySlugQuery` includes type-conditional projections for ALL block types registered in the page schema (currently missing: richText, faqSection, contactForm, sponsorCards, timeline, teamGrid)
13. Seed content is created in Sanity for about, contact, projects, and sponsors pages (minimum: each page with 2+ blocks)
14. All pages render correctly from Sanity content with no regressions

## Tasks / Subtasks

- [ ] Task 1: Add missing GROQ projections to `pageBySlugQuery` (AC: #12)
  - [ ] 1.1 Add `richText` projection: `content[]{...}` (portable text passthrough)
  - [ ] 1.2 Add `faqSection` projection: `heading`, `items[]{ _key, question, answer }`
  - [ ] 1.3 Add `contactForm` projection: `heading`, `description`, `successMessage`, `formsiteUrl`
  - [ ] 1.4 Add `sponsorCards` projection: `heading`, `displayMode`, `sponsors[]->{ _id, name, "slug": slug.current, logo{ asset->{ _id, url }, alt }, website, tier, featured, description }`
  - [ ] 1.5 Add `timeline` projection: `heading`, `autoPopulate`, events resolution (if event document type exists, use refs; else stub with empty array)
  - [ ] 1.6 Add `teamGrid` projection: `heading`, `useDocumentRefs`, teams/members resolution (if team document type exists, use refs; else stub with inline members)
  - [ ] 1.7 Verify all 13 custom block types have matching projections (7 existing + 6 new)
  - [ ] 1.8 Run `npm run dev` — verify GROQ query compiles without errors

- [ ] Task 2: Migrate static pages to Sanity (AC: #10, #14)
  - [ ] 2.1 Update `about.astro`: replace `import { aboutPage }` with `getPage('about')`, pass `page.blocks` to BlockRenderer, add 404 fallback
  - [ ] 2.2 Update `contact.astro`: replace `import { contactPage }` with `getPage('contact')`, pass `page.blocks` to BlockRenderer, add 404 fallback
  - [ ] 2.3 Update `projects.astro`: replace `import { projectsPage }` with `getPage('projects')`, pass `page.blocks` to BlockRenderer, add 404 fallback
  - [ ] 2.4 Update `sponsors.astro`: replace `import { sponsorsPage }` with `getPage('sponsors')`, pass `page.blocks` to BlockRenderer, add 404 fallback
  - [ ] 2.5 Each page: add `prerender` conditional on visual editing (match `index.astro` and `[...slug].astro` pattern)
  - [ ] 2.6 Each page: select template from `page.template` using `stegaClean()` + template map (match `[...slug].astro` pattern)

- [ ] Task 3: Create seed content in Sanity for all pages (AC: #13)
  - [ ] 3.1 Create `about` page document with blocks: heroBanner, textWithImage, featureGrid, faqSection, ctaBanner
  - [ ] 3.2 Create `contact` page document with blocks: heroBanner, contactForm, ctaBanner
  - [ ] 3.3 Create `projects` page document with blocks: heroBanner, featureGrid (project showcase placeholder), ctaBanner
  - [ ] 3.4 Create `sponsors` page document with blocks: heroBanner, sponsorCards, ctaBanner
  - [ ] 3.5 Publish all 4 page documents
  - [ ] 3.6 Verify `allPageSlugsQuery` returns all 5 page slugs (home, about, contact, projects, sponsors)

- [ ] Task 4: Clean up placeholder data (AC: #11)
  - [ ] 4.1 Verify no files import from `astro-app/src/lib/data/`
  - [ ] 4.2 Delete `astro-app/src/lib/data/` directory entirely
  - [ ] 4.3 Remove any unused imports from `types.ts` referencing placeholder data structures

- [ ] Task 5: Add dev/production block fallback (AC: #9)
  - [ ] 5.1 In `BlockRenderer.astro`, add a visible "Unknown block: {_type}" placeholder that renders only in `import.meta.env.DEV` mode
  - [ ] 5.2 In production, unknown block types render nothing (current behavior — verify null return)

- [ ] Task 6: End-to-end verification (AC: #7, #8, #14)
  - [ ] 6.1 Run `npm run dev` — verify all 5 pages render from Sanity data
  - [ ] 6.2 In Sanity Studio: add a new block to a page, reorder blocks, remove a block, configure base fields (background, spacing, maxWidth) — verify all editorial operations work (AC #1-#4)
  - [ ] 6.3 In Sanity Studio: publish a page change, rebuild, verify change appears (AC #5, #6)
  - [ ] 6.4 Verify `[...slug].astro` catch-all works for any new page created in Sanity
  - [ ] 6.5 Run `npm run build` from root — verify full build succeeds with all pages
  - [ ] 6.6 Run existing integration tests — verify no regressions

## Dev Notes

### Current State Summary

The page composition system is **80% built**. Here's what exists and what's missing:

**Already Working:**
- `[...slug].astro` catch-all route with template selection, static paths, and Sanity data fetching
- `index.astro` homepage wired to Sanity via `getPage('home')`
- `BlockRenderer.astro` dispatches 13 custom block types + 113 fulldotdev/ui block types
- `pageBySlugQuery` has projections for 7 of 13 custom block types (heroBanner, featureGrid, ctaBanner, statsRow, textWithImage, logoCloud, sponsorSteps)
- Page schema (`page.ts`) has 11 block types registered in `blocks[]` array with insert menu grouping and template-block compatibility warnings
- Site settings fully wired from Sanity (Header, Footer, Layout)
- Visual editing / Presentation tool working for homepage and dynamic pages

**Missing (this story's scope):**
- GROQ projections for 6 block types: `richText`, `faqSection`, `contactForm`, `sponsorCards`, `timeline`, `teamGrid`
- Static pages (about, contact, projects, sponsors) still use placeholder data from `lib/data/`
- Seed content in Sanity for non-homepage pages
- Dev-mode unknown block placeholder in BlockRenderer
- Removal of `lib/data/` directory

### CRITICAL: Block Types in Page Schema vs GROQ Projections

**Page schema `blocks[]` (11 types):** heroBanner, featureGrid, sponsorCards, richText, ctaBanner, faqSection, contactForm, logoCloud, statsRow, sponsorSteps, textWithImage

**`pageBySlugQuery` has projections for (7 types):** heroBanner, featureGrid, ctaBanner, statsRow, textWithImage, logoCloud, sponsorSteps

**MISSING projections (6 types):** richText, faqSection, contactForm, sponsorCards, timeline, teamGrid

Note: `timeline` and `teamGrid` were removed from the page schema in Story 2.2 (Task 7.9) because they reference unbuilt `event`/`team` document types. They may need to be re-added to the page schema if they were restored in Story 2.1b. Check `page.ts` `blocks[]` array before adding projections.

### Static Page Migration Pattern

Follow the exact pattern from `index.astro` and `[...slug].astro`:

```astro
---
import Layout from '@/layouts/Layout.astro';
import BlockRenderer from '@/components/BlockRenderer.astro';
import { getPage } from '@/lib/sanity';
import { stegaClean } from '@sanity/client/stega';
// Import template components...

export const prerender = import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED !== "true";

const page = await getPage('about');  // use the page slug

if (!page) {
  return Astro.redirect('/404');
}

const template = stegaClean(page.template) as keyof typeof templates;
const TemplateComponent = templates[template] ?? DefaultTemplate;
---

<Layout title={page.title} description={page.description}>
  <TemplateComponent>
    <BlockRenderer blocks={page.blocks ?? []} />
  </TemplateComponent>
</Layout>
```

### GROQ Projection Patterns for Missing Blocks

Follow existing patterns in `pageBySlugQuery`. Every projection must include the type-conditional operator `_type == "blockName" => { ... }` inside the `blocks[]{}` array.

**richText** — simplest projection (portable text passthrough):
```groq
_type == "richText" => {
  content[]{...}
}
```

**faqSection** — items array with question/answer:
```groq
_type == "faqSection" => {
  heading,
  items[]{ _key, question, answer }
}
```

**contactForm** — form config fields:
```groq
_type == "contactForm" => {
  heading,
  description,
  successMessage,
  formsiteUrl
}
```

**sponsorCards** — reference resolution with display mode:
```groq
_type == "sponsorCards" => {
  heading,
  displayMode,
  "sponsors": select(
    displayMode == "all" => *[_type == "sponsor"]{ _id, name, "slug": slug.current, logo{ asset->{ _id, url }, alt }, website, tier, featured, description },
    displayMode == "featured" => *[_type == "sponsor" && featured == true]{ _id, name, "slug": slug.current, logo{ asset->{ _id, url }, alt }, website, tier, featured, description },
    sponsors[]->{ _id, name, "slug": slug.current, logo{ asset->{ _id, url }, alt }, website, tier, featured, description }
  )
}
```

**timeline** — event refs (may not exist yet):
```groq
_type == "timeline" => {
  heading,
  events[]->{ _id, title, date, endDate, location, description, eventType }
}
```

**teamGrid** — team/member refs (may not exist yet):
```groq
_type == "teamGrid" => {
  heading,
  useDocumentRefs,
  teams[]->{ _id, name, members[]{ _key, name, role, photo{ asset->{ _id, url }, alt }, linkedIn } },
  members[]{ _key, name, role, photo{ asset->{ _id, url }, alt }, linkedIn }
}
```

### Important: Document Type Dependencies

- `sponsorCards` references the `sponsor` document type which **DOES exist** (created in Story 3.1 scope, but may not have seed data — check if sponsors exist in Sanity)
- `timeline` references the `event` document type which **DOES NOT exist yet** (Epic 4, Story 4.2) — projection should be added but events will be empty
- `teamGrid` references the `team` document type which **DOES NOT exist yet** (Epic 4, Story 4.1) — projection should be added but teams will be empty
- For blocks referencing nonexistent document types: add the projection anyway so they work as soon as the document types are created. Empty arrays are fine.

### Existing File Locations (Critical — Do NOT Create Wrong Paths)

```
astro-app/src/
├── pages/
│   ├── index.astro               ← ALREADY USES SANITY (getPage('home'))
│   ├── [...slug].astro            ← ALREADY USES SANITY (getPage(slug))
│   ├── about.astro                ← USES PLACEHOLDER DATA — MIGRATE
│   ├── contact.astro              ← USES PLACEHOLDER DATA — MIGRATE
│   ├── projects.astro             ← USES PLACEHOLDER DATA — MIGRATE
│   ├── sponsors.astro             ← USES PLACEHOLDER DATA — MIGRATE
│   └── 404.astro
├── lib/
│   ├── sanity.ts                  ← MODIFY (add 6 missing GROQ projections)
│   ├── types.ts                   ← VERIFY (block types should already exist)
│   ├── image.ts
│   └── data/                      ← DELETE (after all pages migrated)
│       ├── index.ts
│       ├── home-page.ts
│       ├── about-page.ts
│       ├── contact-page.ts
│       ├── projects-page.ts
│       ├── sponsors-page.ts
│       └── site-settings.ts
├── components/
│   ├── BlockRenderer.astro        ← MODIFY (add dev-mode fallback for unknown types)
│   ├── blocks/
│   │   └── custom/                ← Custom block components (already exist)
│   └── ...
└── layouts/
    ├── Layout.astro
    └── templates/
        ├── DefaultTemplate.astro
        ├── FullWidthTemplate.astro
        ├── LandingTemplate.astro
        ├── SidebarTemplate.astro
        └── TwoColumnTemplate.astro
```

### Existing Custom Block Components (already exist in `blocks/custom/`)

All 13 custom block `.astro` components already exist. Do NOT recreate them:
- HeroBanner, FeatureGrid, CtaBanner, StatsRow, TextWithImage, LogoCloud, SponsorSteps (already wired to Sanity)
- FaqSection, ContactForm, SponsorCards, Timeline, TeamGrid, RichText (exist but may still use placeholder data props — verify and update if needed)

### Anti-Patterns to Avoid

| Rule | What NOT to Do |
|---|---|
| No inline GROQ in pages | All queries go in `lib/sanity.ts` |
| No new page files for existing routes | about.astro, contact.astro etc. already exist — modify them |
| No hardcoded content in components | All text comes from Sanity data |
| No manual type definitions for blocks | Types in `types.ts` should already cover all block types |
| No arbitrary Tailwind values | Use design tokens from global.css |
| No React/JSX in astro-app | `.astro` files only |
| No runtime API calls | All data fetched at build time via `sanity.fetch()` |
| Do not delete data/ until ALL pages are confirmed working from Sanity | Migrate first, then clean up |
| Do not modify `[...slug].astro` catch-all | It already works — only add projections and seed content |

### Previous Story Learnings (from Stories 2.2 and 2.3a)

1. **Module-level caching**: `getSiteSettings()` uses module-level memoization. Consider the same pattern if any new shared queries are added.
2. **Visual editing conditional**: All pages need `export const prerender = import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED !== "true"` for SSR/visual editing compatibility.
3. **stegaClean for logic values**: When using Sanity field values for template selection, display mode switches, or conditional rendering, wrap with `stegaClean()` — stega encoding embeds invisible characters that break string comparisons.
4. **loadQuery wrapper**: Always use `loadQuery()` (not raw `sanityClient.fetch()`) for visual editing compatibility — it handles stega, perspective, and token injection.
5. **Sanity schema deploy**: Any schema changes need `deploy_schema` before MCP content tools work. But this story should NOT require schema changes — block schemas already exist.
6. **Portable text**: Use `astro-portabletext` package's `<PortableText value={block.content} />` for rendering rich text fields (already used in TextWithImage).
7. **Image handling**: Always project `asset->{ _id, url }` for images, use `urlFor()` helper for responsive images.
8. **getStaticPaths**: The `[...slug].astro` route's `getStaticPaths()` already queries all page slugs. Adding new pages in Sanity automatically generates their static paths on the next build.

### Git Context (Recent Commits)

Most recent work was on preview/publish architecture (Story 5.4):
- SSR cache fix, deprecated perspective fix in preview mode
- Auto-sync workflow for preview branch
- All commits on `preview` branch

### Project Structure Notes

- Block components are in `blocks/custom/` subdirectory (NOT `blocks/` root) — this is an important path distinction from the architecture document
- fulldotdev/ui blocks are in `blocks/` root (separate from custom blocks)
- Templates are in `layouts/templates/` (5 template types)
- All GROQ queries centralized in `lib/sanity.ts` — no inline queries anywhere

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 2.3 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — BlockRenderer pattern, GROQ query pattern, page composition requirements]
- [Source: astro-app/src/lib/sanity.ts — Current GROQ queries, loadQuery wrapper, getPage function]
- [Source: astro-app/src/pages/[...slug].astro — Dynamic catch-all route with template selection]
- [Source: astro-app/src/pages/index.astro — Homepage Sanity wiring pattern to follow]
- [Source: astro-app/src/components/BlockRenderer.astro — Block dispatch logic]
- [Source: studio/src/schemaTypes/documents/page.ts — Page schema with blocks[] array and insert menu]
- [Source: _bmad-output/implementation-artifacts/2-2-homepage-data-fetching.md — Previous story patterns and learnings]
- [Source: _bmad-output/implementation-artifacts/2-3-site-settings-wiring.md — Site settings wiring patterns and code review fixes]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
