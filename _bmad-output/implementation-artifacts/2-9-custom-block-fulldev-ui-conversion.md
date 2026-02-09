# Story 2.9: Custom Block fulldev/ui Format Conversion

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the 13 custom block components converted from the monolithic `block` prop pattern to the fulldev/ui spread-props pattern,
So that all blocks follow a single unified dispatch and prop convention, simplifying BlockRenderer and enabling a consistent developer experience across the entire block library.

## Acceptance Criteria

1. **Given** the 13 custom blocks currently use `interface Props { block: TypedBlock }` pattern
   **When** the conversion is complete
   **Then** all 13 custom blocks use flat destructured props matching the fulldev/ui pattern: `interface Props { class?: string; id?: string; [blockSpecificProps] }`

2. **Given** BlockRenderer currently has two dispatch modes (switch for custom, map for fulldev/ui)
   **When** the conversion is complete
   **Then** BlockRenderer uses a SINGLE dispatch mode — all blocks (custom + fulldev/ui) go through the `fulldotdevBlocks` record map with spread props `<Component {...block} />`

3. **Given** the custom blocks live in `src/components/blocks/custom/`
   **When** the conversion is complete
   **Then** the converted blocks remain in `src/components/blocks/custom/` (preserving the organizational separation for blocks with custom business logic)
   **And** they are registered in the `fulldotdevBlocks` map in BlockRenderer instead of the switch statement

4. **Given** each custom block has a corresponding Storybook story file (`.stories.ts`)
   **When** the conversion is complete
   **Then** all 13 story files are updated to pass props as flat spread objects instead of wrapped in a `block` prop

5. **Given** the TypeScript types in `src/lib/types.ts` define block interfaces extending `BlockBase`
   **When** the conversion is complete
   **Then** all block type interfaces retain their full type safety — no `any` casts needed at the component level
   **And** the `PageBlock` discriminated union type is preserved

6. **Given** the Sanity GROQ queries in `src/lib/sanity.ts` project block data
   **When** the conversion is complete
   **Then** GROQ queries require NO changes (the data shape from Sanity is unchanged — only how components receive it changes)

7. **Given** blocks receive base fields (`backgroundVariant`, `spacing`, `maxWidth`) via `BlockBase`
   **When** the conversion is complete
   **Then** base fields are destructured directly from props (e.g., `const { backgroundVariant = 'white', spacing = 'default' } = Astro.props`) instead of from `block.backgroundVariant`

8. **Given** the `npm run build` command must pass
   **When** the conversion is complete
   **Then** `astro check && astro build` passes with zero errors
   **And** all pages render identically to before the conversion (visual regression: zero differences)

## Tasks / Subtasks

- [ ] Task 1: Update BlockRenderer.astro dispatch pattern (AC: #2, #3)
  - [ ] 1.1: Remove the explicit switch statement for custom blocks
  - [ ] 1.2: Add all 13 custom block imports to the `fulldotdevBlocks` record map using their `_type` names as keys
  - [ ] 1.3: Verify all blocks dispatch through the single `fulldotdevBlocks` map with `{...block}` spread

- [ ] Task 2: Convert each custom block component's props interface (AC: #1, #5, #7)
  - [ ] 2.1: HeroBanner.astro — Change from `{ block: HeroBannerBlock }` to flat props destructure
  - [ ] 2.2: FeatureGrid.astro — Change from `{ block: FeatureGridBlock }` to flat props destructure
  - [ ] 2.3: CtaBanner.astro — Change from `{ block: CtaBannerBlock }` to flat props destructure
  - [ ] 2.4: StatsRow.astro — Change from `{ block: StatsRowBlock }` to flat props destructure
  - [ ] 2.5: TextWithImage.astro — Change from `{ block: TextWithImageBlock }` to flat props destructure
  - [ ] 2.6: LogoCloud.astro — Change from `{ block: LogoCloudBlock }` to flat props destructure
  - [ ] 2.7: SponsorSteps.astro — Change from `{ block: SponsorStepsBlock }` to flat props destructure
  - [ ] 2.8: RichText.astro — Change from `{ block: RichTextBlock }` to flat props destructure
  - [ ] 2.9: FaqSection.astro — Change from `{ block: FaqSectionBlock }` to flat props destructure
  - [ ] 2.10: ContactForm.astro — Change from `{ block: ContactFormBlock }` to flat props destructure
  - [ ] 2.11: SponsorCards.astro — Change from `{ block: SponsorCardsBlock }` to flat props destructure
  - [ ] 2.12: TeamGrid.astro — Change from `{ block: TeamGridBlock }` to flat props destructure
  - [ ] 2.13: Timeline.astro — Change from `{ block: TimelineBlock }` to flat props destructure

- [ ] Task 3: Update all 13 Storybook story files (AC: #4)
  - [ ] 3.1: Update each `.stories.ts` file to pass flat props instead of `args: { block: { ... } }`

- [ ] Task 4: Verify build and visual parity (AC: #6, #8)
  - [ ] 4.1: Run `astro check` — zero TypeScript errors
  - [ ] 4.2: Run `astro build` — zero build errors
  - [ ] 4.3: Verify homepage renders identically (all wired blocks)
  - [ ] 4.4: Verify Storybook builds without errors

## Dev Notes

### Conversion Pattern (apply to every custom block)

**BEFORE (current custom block pattern):**
```astro
---
import type { HeroBannerBlock } from '@/lib/types';

interface Props {
  block: HeroBannerBlock;
}

const { block } = Astro.props;
// Access via: block.heading, block.subheading, block.ctaButtons
---
```

**AFTER (fulldev/ui pattern):**
```astro
---
import type { HeroBannerBlock } from '@/lib/types';

interface Props extends HeroBannerBlock {
  class?: string;
  id?: string;
}

const { class: className, id, heading, subheading, ctaButtons, backgroundVariant, spacing, maxWidth, backgroundImages, alignment, ...rest } = Astro.props;
---
```

**Key differences in template:**
- Replace all `block.heading` → `heading` (direct prop access)
- Replace all `block.ctaButtons` → `ctaButtons` (direct prop access)
- Replace all `block.backgroundVariant` → `backgroundVariant` (direct prop access)
- Add `class:list` support with `className` for custom class passthrough (matching fulldev/ui convention)

### BlockRenderer Conversion

**BEFORE:**
```astro
{blocks.map((block) => {
  switch (block._type) {
    case 'heroBanner':
      return <HeroBanner block={block} />;
    case 'statsRow':
      return <StatsRow block={block} />;
    // ... 11 more cases
    default: {
      const FdComponent = fulldotdevBlocks[(block as any)._type]
      return FdComponent ? <FdComponent {...(block as any)} /> : null
    }
  }
})}
```

**AFTER:**
```astro
{blocks.map((block) => {
  const Component = fulldotdevBlocks[(block as any)._type]
  return Component ? <Component {...(block as any)} /> : null
})}
```

The entire switch statement is eliminated. All blocks — custom and fulldev/ui — dispatch through the single map.

### Blocks to Convert (13 total)

| # | Component | _type | Key Conversion Notes |
|---|-----------|-------|---------------------|
| 1 | HeroBanner.astro | heroBanner | Has carousel logic, backgroundImages array, alignment |
| 2 | FeatureGrid.astro | featureGrid | Has columns prop, items array iteration |
| 3 | CtaBanner.astro | ctaBanner | Has bgMap/primaryBtnMap computed from backgroundVariant |
| 4 | StatsRow.astro | statsRow | Simple — heading + stats array |
| 5 | TextWithImage.astro | textWithImage | Has imagePosition, portable text content |
| 6 | LogoCloud.astro | logoCloud | Has sponsors array with images |
| 7 | SponsorSteps.astro | sponsorSteps | Has steps array with numbering |
| 8 | RichText.astro | richText | Has portable text content rendering |
| 9 | FaqSection.astro | faqSection | Has items array, accordion interactivity via script |
| 10 | ContactForm.astro | contactForm | Has form fields, client-side validation script |
| 11 | SponsorCards.astro | sponsorCards | Has displayMode, sponsors references |
| 12 | TeamGrid.astro | teamGrid | Has members array with photos |
| 13 | Timeline.astro | timeline | Has events array with date ordering |

### What Does NOT Change

- **Sanity schemas** — No changes needed. Schemas define data structure, not component props.
- **GROQ queries** — No changes needed. The data shape from Sanity is identical; only how the component receives it changes (spread vs. wrapped).
- **TypeScript interfaces** — Block type interfaces stay exactly the same. The Props interface changes from `{ block: X }` to `extends X`.
- **`src/lib/types.ts`** — The `PageBlock` union type and all block interfaces remain unchanged.
- **Visual output** — Zero visual differences. This is a pure refactoring of the prop-passing mechanism.
- **Block file locations** — Blocks stay in `blocks/custom/`. The `custom/` directory still serves as the organizational boundary for blocks with custom business logic vs. fulldev/ui template blocks.

### Critical Guardrails

1. **Do NOT introduce React** — All components remain `.astro` files. No JSX.
2. **Do NOT change Sanity schemas or GROQ queries** — This is a frontend-only refactoring.
3. **Do NOT use `any` in component props** — Maintain full type safety by extending the existing block interfaces.
4. **Do NOT break the `<script>` tags** — FaqSection, ContactForm, and HeroBanner have inline scripts. These are unaffected by prop changes (they use DOM queries, not Astro props).
5. **Do NOT remove the `custom/` directory** — Keep the organizational separation.
6. **Preserve the `_type` and `_key` fields** — These are critical for BlockRenderer dispatch and Visual Editing reconciliation.
7. **Test with Sanity data** — After conversion, verify the homepage renders correctly with live Sanity content, not just Storybook.

### Project Structure Notes

- All changes are in `astro-app/` workspace only
- Files touched:
  - `astro-app/src/components/BlockRenderer.astro` (dispatch refactor)
  - `astro-app/src/components/blocks/custom/*.astro` (13 component files)
  - `astro-app/src/components/blocks/custom/*.stories.ts` (13 story files)
- No changes to `studio/` workspace
- No changes to `src/lib/types.ts`, `src/lib/sanity.ts`, or `src/lib/image.ts`

### References

- [Source: docs/project-context.md#BlockRenderer Dual Dispatch Pattern] — Documents the current two-mode dispatch
- [Source: docs/project-context.md#Block Architecture] — 2-file block pattern + registration
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — BlockRenderer decision
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns] — Component format patterns
- [Source: _bmad-output/planning-artifacts/epics.md#Stories 2.4-2.8] — fulldev/ui block schema stories that benefit from unified dispatch

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
