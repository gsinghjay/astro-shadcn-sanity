---
title: 'Add All fulldotdev/ui Block Variants'
slug: 'add-all-fulldevui-blocks'
created: '2026-02-07'
status: 'implementation-complete'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['astro-5.17', 'storybook-astro-0.1', 'tailwind-v4.1', 'fulldotdev-ui-via-shadcn', 'vite-7.3', 'typescript-5.9']
files_to_modify: ['astro-app/src/components/BlockRenderer.astro', 'astro-app/src/components/blocks/* (96 new .astro + 96 new .stories.ts)', 'astro-app/package.json (auto-form dep)']
code_patterns: ['flat-props-plus-slot-pattern', 'section-tile-item-compound-composition', 'storybook-csf3-block-stories', 'object-map-block-registry']
test_patterns: ['storybook-visual', 'build-regression']
---

# Tech-Spec: Add All fulldotdev/ui Block Variants

**Created:** 2026-02-07

## Overview

### Problem Statement

The project has 12 custom blocks but is missing 13 fulldotdev/ui block categories (96 total block variants) that provide ready-made, polished content sections for marketing pages, portfolios, SaaS sites, and more.

### Solution

Port all 96 fulldotdev/ui block components into `astro-app/src/components/blocks/` with colocated Storybook stories. Frontend-only — no Sanity schema, GROQ, or TypeScript type integration. Blocks are added alongside existing custom blocks (no replacement).

### Scope

**In Scope:**
- All 96 fulldotdev/ui block variants as Astro components
- Colocated `.stories.ts` files for each block
- Any missing UI components needed by the blocks
- BlockRenderer registration for all new blocks

**Out of Scope:**
- Sanity schema definitions (`defineBlock`, `defineField`)
- GROQ query projections in `src/lib/sanity.ts`
- TypeScript block interfaces in `src/lib/types.ts`
- Replacing or modifying existing 12 custom blocks
- Sanity document type registration

## Context for Development

### Codebase Patterns

- Blocks live in `astro-app/src/components/blocks/` as PascalCase `.astro` files
- Stories colocated next to blocks as `.stories.ts` (CSF3 format)
- fulldotdev/ui blocks compose from `@/components/ui/` compound components (Section, Tile, Item, etc.)
- BlockRenderer currently dispatches via switch on `block._type` — needs refactor to object-map for 100+ blocks
- **fulldotdev/ui blocks use flat props + `<slot/>`** — NOT the `block` prop wrapper pattern used by existing custom blocks
- Storybook uses `storybook-astro` framework — native `.astro` rendering
- `astro-icon` and `astro:assets` are stubbed in Storybook via virtual module plugins in `.storybook/main.ts`
- `lucide-static` SVGs are stubbed via `lucideStaticSvgStub()` plugin in `.storybook/main.ts`

### UI Component Availability (38 families installed)

All 17 UI modules used by fulldotdev/ui blocks are already installed:
- **Core three** (90%+ of blocks): `Icon`, `Button`, `Image`
- **High frequency** (20-50%): `Avatar/AvatarImage`, `Rating`, `List/ListItem`
- **Medium frequency** (5-10%): `Logo`, `Tile` (compound), `Video`, `Price` (compound), `Section` (compound), `Marquee`
- **Low frequency** (<5%): `Badge`, `Sheet`, `Header`, `ThemeToggle`
- **MISSING: `auto-form`** — used by contact-1/2/3. Needs: `npx shadcn@latest add @fulldev/auto-form`

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `astro-app/src/components/BlockRenderer.astro` | Block dispatch — refactor to object-map pattern |
| `astro-app/.storybook/main.ts` | Storybook config with Vite plugins, virtual module stubs |
| `astro-app/.storybook/preview.ts` | Global CSS, layout parameters |
| `docs/storybook-constitution.md` | Story writing conventions |
| `docs/project-context.md` | 78 project rules — naming, anti-patterns, accessibility |
| `astro-app/src/components/blocks/*.astro` | Existing 12 block components |
| `astro-app/src/components/ui/` | 38 UI primitive families (all needed modules present) |
| fulldotdev/ui repo `src/components/blocks/` | Source blocks to port (GitHub: fulldotdev/ui) |

### Technical Decisions

- **Frontend-only**: No schema/GROQ/types integration — blocks are presentational components only for now
- **Add alongside**: Existing 12 custom blocks are untouched — fulldotdev variants coexist
- **Naming**: fulldotdev blocks keep their original naming converted to PascalCase (e.g., `hero-1` → `Hero1.astro`, `articles-2` → `Articles2.astro`)
- **Props pattern**: fulldotdev blocks use flat props + slots, NOT the `block` prop wrapper pattern
- **BlockRenderer refactor**: Switch statement → object-map lookup. Existing 12 blocks migrated to map pattern too.
- **Meta blocks**: `blocks-1` through `blocks-4` and `skeletons-1` use `import.meta.glob` — adapt glob paths for project structure
- **Install `auto-form`**: Only missing UI dependency. All other 16 UI modules already present.

### Block Porting Process (per block)

Every block follows this exact process:

1. **Fetch source** from `gh api repos/fulldotdev/ui/contents/src/components/blocks/{name}.astro --jq '.content' | base64 -d`
2. **Save as** `astro-app/src/components/blocks/{PascalName}.astro` — the source uses `@/components/ui/` imports which already resolve correctly in this project
3. **Verify imports** — all `@/components/ui/*` imports must match installed UI families. If any import fails, check for compound sub-component name mismatches.
4. **Create story** as `astro-app/src/components/blocks/{PascalName}.stories.ts` — CSF3 format with representative args matching the component's destructured props
5. **Register in BlockRenderer** — add to the component map

### Story Writing Pattern for fulldotdev/ui Blocks

fulldotdev/ui blocks destructure props like `{ title, description, items, links, image, ...rest }` and use `<slot/>` for prose body content. Stories pass props via `args` — slot content is optional and blocks render fine without it.

```typescript
// Example: Hero1.stories.ts
import Hero1 from './Hero1.astro'

export default {
  title: 'Blocks/Hero/Hero1',
  component: Hero1,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    title: 'Build Something Amazing',
    description: 'A short description of what this product does.',
    links: [
      { text: 'Get Started', href: '#' },
      { text: 'Learn More', href: '#' },
    ],
    image: { src: 'https://placehold.co/800x400', alt: 'Hero image' },
  },
}
```

**Story title hierarchy**: `Blocks/{Category}/{ComponentName}` (e.g., `Blocks/Hero/Hero1`, `Blocks/CTA/Cta3`, `Blocks/Articles/Articles2`)

## Implementation Plan

### Tasks

- [ ] **Task 0: Install `auto-form` UI component** (prerequisite)
  - File: `astro-app/` (working directory)
  - Action: Run `npx shadcn@latest add @fulldev/auto-form` with `--legacy-peer-deps` if needed
  - Verify: `astro-app/src/components/ui/auto-form/` exists with `index.ts` barrel export
  - Notes: Only missing UI dependency. Used by contact-1/2/3 blocks.

- [ ] **Task 1: Refactor BlockRenderer to object-map pattern**
  - File: `astro-app/src/components/BlockRenderer.astro`
  - Action: Replace switch statement with component map object. Migrate existing 12 custom blocks to map. Leave slots for new blocks.
  - Pattern:
    ```astro
    ---
    import HeroBanner from './blocks/HeroBanner.astro'
    import FeatureGrid from './blocks/FeatureGrid.astro'
    // ... all imports ...

    const blockComponents: Record<string, any> = {
      heroBanner: HeroBanner,
      featureGrid: FeatureGrid,
      // ... existing 12 ...
      // fulldotdev/ui blocks:
      'hero-1': Hero1,
      'articles-1': Articles1,
      // ... 96 more ...
    }

    interface Props { blocks: any[] }
    const { blocks } = Astro.props
    ---

    {blocks.map((block) => {
      const Component = blockComponents[block._type]
      return Component ? <Component {...block} /> : null
    })}
    ```
  - Notes: Existing custom blocks pass `block={block}` prop. fulldotdev blocks spread `{...block}`. The map dispatches with spread for all — existing blocks will need to also accept spread props OR we maintain two maps (one for `block` prop, one for spread). **Decision: use spread for all. Existing blocks still work because `block` is a key in the spread.**
  - **CORRECTION**: Existing blocks expect `{ block }` not spread. Two options: (a) wrap existing blocks to accept spread, or (b) keep two dispatch styles. **Recommended: keep the existing switch for 12 custom blocks, add the map for fulldotdev blocks only.** This avoids touching working custom blocks.

- [ ] **Task 2: Hero blocks** (14 blocks)
  - Files: `Hero1.astro` through `Hero14.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/hero-{1..14}.astro`
  - Stories: `title: 'Blocks/Hero/Hero{N}'`, `parameters: { layout: 'fullscreen' }`
  - Common props: `title`, `description`, `links[]`, `image`, `list[]`, `video`
  - Notes: hero-1 uses Badge. hero-5/6/7 use Rating + Avatar (social proof). hero-8/9/10/11 use Video. hero-12/13/14 use List.

- [ ] **Task 3: CTA blocks** (8 blocks)
  - Files: `Cta1.astro` through `Cta8.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/cta-{1..8}.astro`
  - Stories: `title: 'Blocks/CTA/Cta{N}'`, `parameters: { layout: 'fullscreen' }`
  - Common props: `title`, `description`, `links[]`, `image`
  - Notes: cta-3/4/5/6 use Rating + Avatar (social proof). cta-7/8 use List.

- [ ] **Task 4: Features blocks** (6 blocks)
  - Files: `Features1.astro` through `Features6.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/features-{1..6}.astro`
  - Stories: `title: 'Blocks/Features/Features{N}'`
  - Common props: `title`, `description`, `items[]` (each with `icon`, `title`, `description`), `links[]`

- [ ] **Task 5: Services blocks** (7 blocks)
  - Files: `Services1.astro` through `Services7.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/services-{1..7}.astro`
  - Stories: `title: 'Blocks/Services/Services{N}'`
  - Common props: `title`, `description`, `items[]` (each with `tagline`, `title`, `description`, `image`, `links[]`), `links[]`

- [ ] **Task 6: Content blocks** (6 blocks)
  - Files: `Content1.astro` through `Content6.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/content-{1..6}.astro`
  - Stories: `title: 'Blocks/Content/Content{N}'`
  - Common props: `list[]`, `links[]`, `image`
  - Notes: Content blocks use `<slot/>` for prose body content. Stories may need wrapper `.astro` files if slot content is required for visual completeness.

- [ ] **Task 7: Reviews blocks** (5 blocks)
  - Files: `Reviews1.astro` through `Reviews5.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/reviews-{1..5}.astro`
  - Stories: `title: 'Blocks/Reviews/Reviews{N}'`
  - Common props: `title`, `description`, `items[]` (each with `title`, `description`, `rating`, `item: {title, description, image}`), `links[]`
  - Notes: Uses Rating, Avatar, SectionMasonry (reviews-1), Marquee (reviews-4/5), Tile.

- [ ] **Task 8: Products blocks** (5 blocks + 1 product detail)
  - Files: `Product1.astro`, `Products1.astro` through `Products5.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/product{s}-{N}.astro`
  - Stories: `title: 'Blocks/Products/Product{s}{N}'`
  - Common props: `items[]` (each with `title`, `description`, `image`, `price`, `unit`), `links[]`
  - Notes: product-1 uses NativeCarousel. products-1/2/5 use Price.

- [ ] **Task 9: Articles blocks** (4 listing + 2 detail)
  - Files: `Article1.astro`, `Article2.astro`, `Articles1.astro` through `Articles4.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/article{s}-{N}.astro`
  - Stories: `title: 'Blocks/Articles/Article{s}{N}'`
  - Common props: `title`, `description`, `items[]` (each with `href`, `title`, `description`, `image`, `item: {image, title, description}`), `links[]`
  - Notes: Uses Avatar, Image, Tile. article-1/2 are single-detail blocks with `<slot/>`.

- [ ] **Task 10: FAQs blocks** (4 blocks)
  - Files: `Faqs1.astro` through `Faqs4.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/faqs-{1..4}.astro`
  - Stories: `title: 'Blocks/FAQs/Faqs{N}'`
  - Common props: `title`, `description`, `items[]` (each with `title`, `description`), `links[]`

- [ ] **Task 11: Pricings blocks** (3 blocks)
  - Files: `Pricings1.astro` through `Pricings3.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/pricings-{1..3}.astro`
  - Stories: `title: 'Blocks/Pricings/Pricings{N}'`
  - Common props: `items[]` (each with `title`, `description`, `icon`, `list[]`, `links[]`, `price`, `unit`)
  - Notes: Uses Price, List, Tile.

- [ ] **Task 12: Stats blocks** (3 blocks)
  - Files: `Stats1.astro` through `Stats3.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/stats-{1..3}.astro`
  - Stories: `title: 'Blocks/Stats/Stats{N}'`
  - Common props: `items[]` (each with `title`, `description`)

- [ ] **Task 13: Steps blocks** (3 blocks)
  - Files: `Steps1.astro` through `Steps3.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/steps-{1..3}.astro`
  - Stories: `title: 'Blocks/Steps/Steps{N}'`
  - Common props: `items[]` (each with `title`, `description`, `list[]`), `links[]`
  - Notes: steps-1 imports lucide-static SVGs directly — needs verification that `lucideStaticSvgStub()` handles this.

- [ ] **Task 14: Logos blocks** (3 blocks)
  - Files: `Logos1.astro` through `Logos3.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/logos-{1..3}.astro`
  - Stories: `title: 'Blocks/Logos/Logos{N}'`
  - Common props: `items[]` (each with `title`, `image`)
  - Notes: Uses Logo/LogoImage/LogoText, Marquee (logos-2), Section compound.

- [ ] **Task 15: Contact blocks** (3 blocks)
  - Files: `Contact1.astro` through `Contact3.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/contact-{1..3}.astro`
  - Stories: `title: 'Blocks/Contact/Contact{N}'`
  - Common props: `title`, `description`
  - Notes: **Depends on Task 0** (auto-form installation). All three import AutoForm.

- [ ] **Task 16: Header blocks** (3 blocks)
  - Files: `Header1.astro` through `Header3.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/header-{1..3}.astro`
  - Stories: `title: 'Blocks/Header/Header{N}'`, `parameters: { layout: 'fullscreen' }`
  - Common props: `links[]`, `buttons[]`
  - Notes: Uses Header, HeaderActions, Logo, Sheet, ThemeToggle, NavigationMenu. These are page-level layout blocks, not content blocks.

- [ ] **Task 17: Footer blocks** (3 blocks)
  - Files: `Footer1.astro` through `Footer3.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/footer-{1..3}.astro`
  - Stories: `title: 'Blocks/Footer/Footer{N}'`, `parameters: { layout: 'fullscreen' }`
  - Common props: `links[]` (nested), `title`, `description`
  - Notes: Uses Footer compound (FooterContent, FooterGrid, FooterGroup, etc.), Logo, ThemeToggle.

- [ ] **Task 18: Video blocks** (3 single + 4 gallery)
  - Files: `Video1.astro` through `Video3.astro`, `Videos1.astro` through `Videos4.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/video{s}-{N}.astro`
  - Stories: `title: 'Blocks/Video/Video{s}{N}'`
  - Common props: `video` (string URL), `title`, `description`, `items[]` (for galleries)
  - Notes: video-1 uses Avatar + Rating (social proof). videos-1/2/3/4 use Tile + Video.

- [ ] **Task 19: Banner blocks** (2 blocks)
  - Files: `Banner1.astro`, `Banner2.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/banner-{1..2}.astro`
  - Stories: `title: 'Blocks/Banner/Banner{N}'`
  - Common props: `icon`, `title`, `description`
  - Notes: Uses Banner compound (BannerContent, BannerTitle, BannerDescription).

- [ ] **Task 20: Images blocks** (2 blocks)
  - Files: `Images1.astro`, `Images2.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/images-{1..2}.astro`
  - Stories: `title: 'Blocks/Images/Images{N}'`
  - Common props: `items[]` (each with `href`, `title`, `image`), `links[]`
  - Notes: Uses Tile with hover effect (image scale + title overlay).

- [ ] **Task 21: Links blocks** (2 blocks)
  - Files: `Links1.astro`, `Links2.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/links-{1..2}.astro`
  - Stories: `title: 'Blocks/Links/Links{N}'`
  - Common props: `links[]` (each with `icon`, `text`, `href`, `target`)

- [ ] **Task 22: Table block** (1 block)
  - Files: `Table1.astro` + `.stories.ts`
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/table-1.astro`
  - Stories: `title: 'Blocks/Table/Table1'`
  - Common props: `list[]`, `links[]`, `items[]` (table rows)
  - Notes: Uses Table compound, List, SectionSplit with sticky sidebar.

- [ ] **Task 23: Meta/showcase blocks** (5 blocks)
  - Files: `Blocks1.astro` through `Blocks4.astro`, `Skeletons1.astro` + `.stories.ts` each
  - Source: `gh api repos/fulldotdev/ui/contents/src/components/blocks/blocks-{1..4}.astro` and `skeletons-1.astro`
  - Stories: `title: 'Blocks/Meta/Blocks{N}'` and `title: 'Blocks/Meta/Skeletons1'`
  - Notes: These use `import.meta.glob('../blocks/*.astro')` to discover all blocks. The glob path needs to be correct for the project structure. They render all blocks at 50% scale in a showcase grid. **These are documentation blocks, not content blocks.** The glob will pick up ALL blocks including the 12 custom ones — which is actually useful for a style guide.

- [ ] **Task 24: Register all new blocks in BlockRenderer**
  - File: `astro-app/src/components/BlockRenderer.astro`
  - Action: Add all 96 imports and map entries. Keep existing 12 custom blocks in their switch statement. Add a second dispatch path for fulldotdev blocks using the map.
  - Pattern:
    ```astro
    ---
    // Existing custom block imports (keep as-is)
    import HeroBanner from './blocks/HeroBanner.astro'
    // ... 12 total ...

    // fulldotdev/ui block imports
    import Hero1 from './blocks/Hero1.astro'
    import Hero2 from './blocks/Hero2.astro'
    // ... 96 total ...

    const fulldotdevBlocks: Record<string, any> = {
      'hero-1': Hero1,
      'hero-2': Hero2,
      // ... 96 entries ...
    }

    interface Props { blocks: any[] }
    const { blocks } = Astro.props
    ---

    {blocks.map((block) => {
      // Custom blocks (use block prop pattern)
      switch (block._type) {
        case 'heroBanner': return <HeroBanner block={block} />;
        // ... existing 12 ...
      }
      // fulldotdev/ui blocks (use spread pattern)
      const FdComponent = fulldotdevBlocks[block._type]
      return FdComponent ? <FdComponent {...block} /> : null
    })}
    ```

- [ ] **Task 25: Verification**
  - Action: Run all verification checks
  - Steps:
    1. `npm run build` from root — verify no regression (0 errors)
    2. `npm run storybook` from `astro-app/` — verify launches on port 6006
    3. Navigate to each new block story category in Storybook sidebar
    4. Verify at least one story per block renders without errors
    5. `npm run build-storybook` from `astro-app/` — verify static export builds
  - Notes: Some blocks may have runtime issues due to `import.meta.glob` (meta blocks), missing slot content, or lucide-static imports. Debug and fix inline.

### Acceptance Criteria

- [ ] **AC 1**: Given all 96 fulldotdev/ui block source files exist in the repo, when I run `ls astro-app/src/components/blocks/*.astro | wc -l`, then the count is at least 108 (12 existing + 96 new).

- [ ] **AC 2**: Given all 96 story files are created, when I run `ls astro-app/src/components/blocks/*.stories.ts | wc -l`, then the count is at least 108 (12 existing + 96 new).

- [ ] **AC 3**: Given the `auto-form` UI component is installed, when I check `astro-app/src/components/ui/auto-form/index.ts`, then it exists and exports `AutoForm`.

- [ ] **AC 4**: Given all blocks are registered in BlockRenderer, when a page passes `{ _type: 'hero-1', title: 'Test' }` in the blocks array, then the `Hero1` component renders.

- [ ] **AC 5**: Given Storybook is running, when I navigate to `Blocks/Hero/Hero1` in the sidebar, then the component renders with the story's args data.

- [ ] **AC 6**: Given all new stories are loaded, when I browse every category in Storybook's sidebar (`Blocks/Hero/*`, `Blocks/CTA/*`, etc.), then at least one story per block renders without console errors.

- [ ] **AC 7**: Given the project builds successfully, when I run `npm run build` from the root, then it completes with 0 errors and the existing 5 pages still generate correctly.

- [ ] **AC 8**: Given the Storybook static build works, when I run `npm run build-storybook` from `astro-app/`, then it completes without errors.

- [ ] **AC 9**: Given existing 12 custom blocks are untouched, when I run `git diff astro-app/src/components/blocks/HeroBanner.astro`, then there are no changes to any existing block component files.

- [ ] **AC 10**: Given the story title hierarchy is consistent, when I view the Storybook sidebar, then all new blocks are organized under `Blocks/{Category}/{ComponentName}` (e.g., `Blocks/Hero/Hero1`, `Blocks/CTA/Cta3`).

## Additional Context

### Dependencies

- **`auto-form` UI component**: Not installed. Used by contact-1/2/3 blocks. Install: `npx shadcn@latest add @fulldev/auto-form`
- **All other UI modules present**: 38 families already in `src/components/ui/`, covering all 17 modules imported by fulldotdev/ui blocks
- **No new npm packages needed** beyond auto-form (which is a shadcn-installed component, not an npm dep)
- **GitHub API access**: Required to fetch source blocks from `fulldotdev/ui` repo. The `gh` CLI must be authenticated.
- **Task 15 (Contact blocks) depends on Task 0 (auto-form installation)**

### Testing Strategy

- **Storybook visual**: Each block gets a colocated `.stories.ts` with at least one story showing representative data
- **Build regression**: `npm run build` from root must still succeed with 0 errors
- **Static export**: `npm run build-storybook` from `astro-app/` must produce a working static build
- **No unit tests**: Blocks are presentational only — visual verification via Storybook is sufficient
- **Manual spot-check**: Navigate Storybook sidebar, verify each category has stories rendering

### Notes

**Risk: `import.meta.glob` in meta blocks (blocks-1 through blocks-4, skeletons-1)**
These blocks use `import.meta.glob('../blocks/*.astro')` to auto-discover all block files. In this project, the glob will pick up ALL blocks (12 custom + 96 fulldotdev). This is actually desirable for a style guide. However, the rendering loop may fail if any block requires mandatory props — the meta blocks render blocks without props. Mitigation: these blocks are documentation-only and errors are acceptable in their stories.

**Risk: lucide-static imports in steps blocks**
steps-1 imports directly from `lucide-static/icons/*.svg`. The existing `lucideStaticSvgStub()` plugin in `.storybook/main.ts` handles this for Storybook. Verify it works for the specific icons used.

**Risk: `<slot/>` content in stories**
Many fulldotdev blocks use `<slot/>` for prose body content. Without slot content, some sections may render empty. This is acceptable — the structured props (title, items, links) still demonstrate the block's layout. If a block looks incomplete without slot content, create a `*Story.astro` wrapper that provides static slot content.

**Parallelization opportunity**: Tasks 2-23 (category block porting) are fully independent and can be executed in parallel. Only Task 0 (auto-form), Task 1 (BlockRenderer), and Task 24 (registration) have ordering constraints.

**fulldotdev/ui block inventory (96 blocks across 23 categories):**

| Category | Count | Variants | Task |
|----------|-------|----------|------|
| hero | 14 | hero-1 through hero-14 | Task 2 |
| cta | 8 | cta-1 through cta-8 | Task 3 |
| features | 6 | features-1 through features-6 | Task 4 |
| services | 7 | services-1 through services-7 | Task 5 |
| content | 6 | content-1 through content-6 | Task 6 |
| reviews | 5 | reviews-1 through reviews-5 | Task 7 |
| products | 6 | product-1, products-1 through products-5 | Task 8 |
| articles | 6 | article-1/2, articles-1 through articles-4 | Task 9 |
| faqs | 4 | faqs-1 through faqs-4 | Task 10 |
| pricings | 3 | pricings-1 through pricings-3 | Task 11 |
| stats | 3 | stats-1 through stats-3 | Task 12 |
| steps | 3 | steps-1 through steps-3 | Task 13 |
| logos | 3 | logos-1 through logos-3 | Task 14 |
| contact | 3 | contact-1 through contact-3 | Task 15 |
| header | 3 | header-1 through header-3 | Task 16 |
| footer | 3 | footer-1 through footer-3 | Task 17 |
| video/videos | 7 | video-1/2/3, videos-1/2/3/4 | Task 18 |
| banner | 2 | banner-1/2 | Task 19 |
| images | 2 | images-1/2 | Task 20 |
| links | 2 | links-1/2 | Task 21 |
| table | 1 | table-1 | Task 22 |
| blocks/skeletons | 5 | blocks-1/2/3/4, skeletons-1 | Task 23 |
