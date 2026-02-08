---
title: 'Replace Timeline with SponsorSteps Block'
slug: 'replace-timeline-with-sponsor-steps'
created: '2026-02-08'
status: 'implementation-complete'
stepsCompleted: [1, 2, 3, 4]
tech_stack: [Astro, TypeScript]
files_to_modify: [astro-app/src/lib/types.ts, astro-app/src/components/blocks/custom/SponsorSteps.astro, astro-app/src/components/BlockRenderer.astro, astro-app/src/lib/data/home-page.ts]
code_patterns: [custom-block-prop-pattern, steps-1-markup-copy]
test_patterns: [e2e-smoke-test]
---

# Tech-Spec: Replace Timeline with SponsorSteps Block

**Created:** 2026-02-08

## Overview

### Problem Statement

The home page has a custom `timeline` block with lorem ipsum content. The reference site (ywcccapstone1.com) doesn't have a timeline on the homepage. Instead, the Sponsor Guide page has a "How to Become a Sponsor" 4-step process that should be surfaced on the homepage.

### Solution

Create a new `SponsorSteps` custom block component by copying `steps-1.astro` markup and adapting it to the custom block `block` prop pattern. Replace the `timeline` data entry in `home-page.ts` with a `sponsorSteps` block containing the real sponsorship application steps from the reference site. Timeline component remains untouched.

### Scope

**In Scope:**
- New `SponsorStepsBlock` type in `types.ts`
- New `SponsorSteps.astro` custom block component (copied from `steps-1.astro` markup, adapted to `block` prop)
- New `sponsorSteps` case in BlockRenderer switch
- Replace `timeline` data entry in `home-page.ts` with `sponsorSteps` block using real content

**Out of Scope:**
- Removing or modifying the Timeline custom component, types, or Sanity schema
- Modifying `steps-1.astro` itself
- Changes to other pages

## Context for Development

### Codebase Patterns

- **Custom blocks** use the `block` prop pattern via switch/case in BlockRenderer: `<Component block={block} />`
- Custom block components live in `astro-app/src/components/blocks/custom/`
- Custom block types are defined in `astro-app/src/lib/types.ts` and included in the `PageBlock` union
- `steps-1.astro` markup uses UI primitives: `Section`, `SectionContent`, `SectionProse`, `SectionActions`, `SectionSplit`, `Tile`, `TileContent`, `TileDescription`, `TileMedia`, `TileTitle`, `Button`, `Icon`, `List`, `ListItem`
- `steps-1.astro` renders headline content via `<slot />` — the new custom block will render `block.headline` and `block.subtitle` directly instead

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `astro-app/src/components/blocks/steps-1.astro` | Source markup to copy and adapt |
| `astro-app/src/components/blocks/custom/Timeline.astro` | Example of custom block pattern (block prop, Section usage) |
| `astro-app/src/components/BlockRenderer.astro` | Add new `sponsorSteps` switch case |
| `astro-app/src/lib/data/home-page.ts` | Replace `timeline` data with `sponsorSteps` data |
| `astro-app/src/lib/types.ts` | Add `SponsorStepsBlock` type and update `PageBlock` union |

### Technical Decisions

- Name: `SponsorSteps` (component), `sponsorSteps` (_type), `SponsorStepsBlock` (TypeScript type)
- Copy `steps-1.astro` markup rather than wrapping it — avoids slot/routing complexity
- Render headline/subtitle directly from `block` prop instead of using slot
- Follow existing custom block patterns exactly (import type, destructure block, render)
- Timeline component, type, and data remain available for other pages

## Implementation Plan

### Tasks

- [x] Task 1: Add `SponsorStepsBlock` type to `types.ts`
  - File: `astro-app/src/lib/types.ts`
  - Action: Add interface after `TimelineBlock` (around line 107):
    ```typescript
    export interface SponsorStepsItem {
      _key: string;
      title: string;
      description: string;
      list?: string[];
    }

    export interface SponsorStepsBlock {
      _type: 'sponsorSteps';
      _key: string;
      headline?: string;
      subtitle?: string;
      items: SponsorStepsItem[];
      links?: Array<{ icon?: string; text?: string; href?: string; target?: string }>;
    }
    ```
  - Action: Add `SponsorStepsBlock` to the `PageBlock` union type

- [x] Task 2: Create `SponsorSteps.astro` component
  - File: `astro-app/src/components/blocks/custom/SponsorSteps.astro` (new file)
  - Action: Copy the markup from `steps-1.astro` and adapt:
    - Import `SponsorStepsBlock` type instead of defining inline Props
    - Accept `block` prop: `interface Props { block: SponsorStepsBlock }`
    - Destructure: `const { block } = Astro.props`
    - Replace `<slot />` in `SectionProse` with direct rendering of `block.headline` (as `<h2>`) and `block.subtitle` (as `<p>`)
    - Conditionally render the `SectionProse` wrapper only if `block.headline` or `block.subtitle` exist
    - Map `block.items` instead of `items` prop
    - Map `block.links` instead of `links` prop
    - Keep all UI primitive imports (`Section`, `SectionContent`, `SectionProse`, `SectionActions`, `SectionSplit`, `Tile`, `TileContent`, `TileDescription`, `TileMedia`, `TileTitle`, `Button`, `Icon`, `List`, `ListItem`)
    - Keep lucide icon imports (`CircleCheck`, `X`)

- [x] Task 3: Register `SponsorSteps` in BlockRenderer
  - File: `astro-app/src/components/BlockRenderer.astro`
  - Action: Add import at top with other custom block imports:
    ```typescript
    import SponsorSteps from './blocks/custom/SponsorSteps.astro';
    ```
  - Action: Add case in the switch statement (after `timeline` case, around line 252):
    ```typescript
    case 'sponsorSteps':
      return <SponsorSteps block={block} />;
    ```

- [x] Task 4: Replace timeline data with sponsorSteps data in `home-page.ts`
  - File: `astro-app/src/lib/data/home-page.ts`
  - Action: Replace the entire `timeline` block object (lines 128-141) with:
    ```typescript
    {
      _type: 'sponsorSteps',
      _key: 'sponsor-steps-1',
      headline: 'How to Become a Sponsor',
      subtitle: 'Follow these steps to begin your sponsorship journey with YWCC Capstone.',
      items: [
        {
          _key: 'ss1',
          title: 'Initial Inquiry',
          description: 'Submit your interest through our sponsorship form or contact our program director.',
          list: [
            'Provide company information',
            'Indicate areas of interest',
            'Describe your technical challenges',
          ],
        },
        {
          _key: 'ss2',
          title: 'Consultation Meeting',
          description: 'Schedule a meeting with our sponsorship team to discuss:',
          list: [
            'Your technical challenges and goals',
            'Available student teams and expertise',
            'Timeline and expectations',
            'Sponsorship benefits and commitments',
          ],
        },
        {
          _key: 'ss3',
          title: 'Project Proposal',
          description: 'Work with our team to develop a project proposal including:',
          list: [
            'Clear problem statement',
            'Desired outcomes and deliverables',
            'Technical requirements',
            'Resource commitments',
          ],
        },
        {
          _key: 'ss4',
          title: 'Agreement Signing',
          description: 'Complete the sponsorship process:',
          list: [
            'Review and sign sponsorship agreement',
            'Complete NDA if required',
            'No monetary cost — sponsorship is free',
            'Receive sponsor portal access',
          ],
        },
      ],
    },
    ```

### Acceptance Criteria

- [ ] AC 1: Given the homepage loads, when the user scrolls to the steps section, then they see a heading "How to Become a Sponsor" with subtitle text
- [ ] AC 2: Given the homepage loads, when the user views the steps section, then 4 numbered steps are displayed (Initial Inquiry, Consultation Meeting, Project Proposal, Agreement Signing)
- [ ] AC 3: Given the homepage loads, when the user views any step, then each step shows a title, description, and a checklist of items
- [ ] AC 4: Given the homepage loads, when the steps section renders, then numbered tiles (1-4) are connected by a vertical/horizontal line
- [ ] AC 5: Given the Timeline component exists, when any page references `_type: 'timeline'`, then it still renders correctly (no regression)
- [ ] AC 6: Given the homepage loads, when the page finishes rendering, then no console errors are present

## Additional Context

### Dependencies

None — all UI primitives used by `steps-1.astro` are already available in the project.

### Testing Strategy

- **Visual verification:** Homepage renders 4 numbered steps with headline, descriptions, and checklists
- **E2E smoke test:** Existing `tests/e2e/smoke.spec.ts` should pass (homepage loads without errors)
- **No new tests required:** This is a data swap and component addition with no new logic

### Notes

- The `steps-1` component's first item gets `X` icons while remaining items get `CircleCheck` icons — this is baked into the markup logic (`i === 0` check). For SponsorSteps, consider whether all items should use `CircleCheck` instead, since these are all positive steps (not a "before/after" comparison). Adjust the icon logic if needed during implementation.
- The `links` prop is optional and not used in the initial data — no CTA buttons below the headline. Can be added later if needed.
