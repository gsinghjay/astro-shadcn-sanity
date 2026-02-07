# Sprint Change Proposal - Reference Project Migration & Storybook Addition

**Date:** 2026-02-07
**Prepared for:** Jay
**Change Scope:** Moderate
**Status:** APPROVED
**Approved by:** Jay
**Approved on:** 2026-02-07

---

## Section 1: Issue Summary

### Problem Statement

A near-complete reference implementation (`reference-project/`) has been identified that covers approximately 80% of the planned frontend work across Epics 1-4. Continuing to build from scratch per the original story-by-story plan would duplicate significant effort. Additionally, a new requirement for **Astro Storybook** (`storybook-astro`) has been identified for component development and documentation.

### Discovery Context

During preparation for Story 1.2 (Schema Infrastructure), the reference project was evaluated and found to contain:
- **12 page builder blocks** (all P0 blocks plus Stats, TextWithImage, TeamRoster)
- **30+ fulldev/ui components** (Button, Accordion, Sheet, Avatar, Badge, Section, Header, Footer, etc.)
- **5 fully assembled pages** (Home, About, Projects, Sponsors, Contact)
- **Complete TypeScript type system** for all blocks and data structures
- **Client-side interactivity** (hero carousel, scroll animations, contact form UX)
- **Swiss design system** with NJIT branding

### Evidence

The reference project uses **placeholder/hardcoded data** and has no Sanity schema layer. The Sanity Studio workspace, document schemas, block schemas, GROQ queries, and CMS integration remain outstanding work.

---

## Section 2: Impact Analysis

### Epic Impact

| Epic | Original Plan | Impact | New Focus |
|------|--------------|--------|-----------|
| **Epic 1** (Foundation) | 4 stories: starter, schemas, layout, mobile nav | Stories 1.3 + 1.4 substantially complete in reference | Migration + Schema + Storybook |
| **Epic 2** (Core Blocks) | 4 stories: page system, hero+CTA, richtext+grid, FAQ+logo | All P0 block components exist in reference | Sanity block schemas + integration |
| **Epic 3** (Sponsors) | 3 stories: schema, cards+listing, detail pages | Sponsor cards block exists; needs schema + queries | Schema + GROQ queries only |
| **Epic 4** (Projects/Teams) | 3 stories: schemas, timeline block, project listing | Team roster + timeline blocks exist; needs schemas | Schema + GROQ queries only |
| **Epic 5** (SEO/Launch) | 2 stories | No change | No change |
| **Epic 6** (Inquiry - Deferred) | 2 stories | Contact form block exists in reference | Reduced scope |

### Artifact Conflicts

#### Architecture Naming Conflicts

| Reference Name | Architecture Name | Resolution |
|---------------|-------------------|------------|
| `hero` | `heroBanner` | **Rename to `heroBanner`** |
| `cta` | `ctaBanner` | **Rename to `ctaBanner`** |
| `faq` | `faqSection` | **Rename to `faqSection`** |
| `logoBar` | `logoCloud` | **Rename to `logoCloud`** |
| `stats` | `statsRow` | **Rename to `statsRow`** |
| `teamRoster` | `teamGrid` | **Rename to `teamGrid`** |

**Rationale:** The architecture's longer camelCase names are more descriptive and already established in planning artifacts. During migration, rename reference block `_type` values, component filenames, and type definitions to match the architecture spec.

#### Dependency Conflicts to Resolve During Migration

| Issue | Reference Has | Architecture Requires | Resolution |
|-------|-------------|----------------------|------------|
| React icons | `lucide-react` | Zero-runtime | Replace with `lucide-static` or inline SVGs |
| UI library | `radix-ui` listed | `fulldev/ui` only | Remove `radix-ui` if unused (fulldev/ui already installed) |
| Portable text | `@portabletext/to-html` | `astro-portabletext` | Keep `astro-portabletext` (already in astro-app) |
| Sanity integration | `@sanity/client` (manual) | `@sanity/astro` (integration) | Keep `@sanity/astro` (already in astro-app) |
| Image handling | Manual URL parsing | `@sanity/image-url` | Keep `@sanity/image-url` (already in astro-app) |
| components.json | `tsx: true` | `tsx: false` | Set to `false` (Astro-only project) |

#### New Artifact: Storybook Configuration

- `.storybook/main.ts` - Framework config using `storybook-astro`
- `.storybook/preview.ts` - Global styles import
- Story files for key UI components and blocks
- Updated `package.json` scripts for concurrent dev

### Technical Impact

- **No breaking changes** to completed Story 1.1 work
- astro-app `package.json` dependencies remain compatible
- Studio workspace unaffected (schemas still need building)
- Build pipeline needs Storybook build step added

---

## Section 3: Recommended Approach

### Selected Path: Direct Adjustment (Migrate + Refocus)

**Rationale:**
1. Reference code is high-quality and implements most P0 block requirements
2. Migration effort is low (~1 story) vs building from scratch (~8 stories)
3. Sanity integration layer was always needed regardless of frontend approach
4. Storybook adds value for component documentation without blocking other work
5. No rollback needed - Story 1.1 foundation work is preserved and compatible

**Effort Estimate:** Medium - 2-3 new/modified stories replace ~8 original stories
**Risk Level:** Low - Frontend code is proven; main risk is naming reconciliation
**Timeline Impact:** **Net acceleration** - saves approximately 4-6 stories of frontend build work

### Trade-offs

| Advantage | Trade-off |
|-----------|-----------|
| Skip building 12 blocks from scratch | Need to reconcile naming conventions |
| Skip building layout/header/footer | Need to audit and clean React dependencies |
| Proven UI components with interactivity | Placeholder data files need removal after Sanity integration |
| Complete design system already working | Minor style/pattern differences from architecture spec |

---

## Section 4: Detailed Change Proposals

### 4.1 Epic & Story Restructuring

#### Epic 1: Site Foundation & Navigation (MODIFIED)

**Story 1.1:** Reconfigure Starter & Set Up Design System
- **Status:** DONE (no change)

**Story 1.2:** Migrate Reference Project into astro-app (**NEW - replaces original 1.2**)
- Acceptance Criteria:
  - Copy `reference-project/src/components/blocks/*` to `astro-app/src/components/blocks/`
  - Copy `reference-project/src/components/ui/*` to `astro-app/src/components/ui/` (merge with existing)
  - Copy `reference-project/src/components/BlockRenderer.astro` to `astro-app/src/components/`
  - Copy `reference-project/src/components/Header.astro` and `Footer.astro`
  - Copy `reference-project/src/layouts/Layout.astro` (merge with existing)
  - Copy `reference-project/src/pages/*` to `astro-app/src/pages/`
  - Copy `reference-project/src/lib/types.ts` and `reference-project/src/lib/data/*` (temporary placeholder data)
  - Copy `reference-project/src/scripts/main.ts`
  - Copy `reference-project/src/styles/global.css` (merge with existing NJIT tokens)
  - Rename all block `_type` values to match architecture camelCase names: `hero`→`heroBanner`, `cta`→`ctaBanner`, `faq`→`faqSection`, `logoBar`→`logoCloud`, `stats`→`statsRow`, `teamRoster`→`teamGrid`
  - Rename block component files accordingly: `HeroBlock`→`HeroBanner`, `CtaBlock`→`CtaBanner`, `FaqBlock`→`FaqSection`, `LogoBarBlock`→`LogoCloud`, `StatsBlock`→`StatsRow`, `TeamRosterBlock`→`TeamGrid`
  - Update BlockRenderer.astro imports and switch cases to use new names
  - Update `types.ts` interfaces and `_type` string literals to match
  - Remove `lucide-react` and `radix-ui` from dependencies; replace icon usage with `lucide-static` or inline SVGs
  - Fix `components.json`: set `tsx: false`
  - Ensure `@sanity/astro`, `@sanity/image-url`, `astro-portabletext` remain as dependencies
  - Merge reference `package.json` dependencies into `astro-app/package.json` (add missing, keep existing)
  - `npm run dev` starts without errors
  - `npm run build` succeeds
  - All 5 pages render correctly with placeholder data
  - Delete `reference-project/` directory after successful migration
- **Tasks:** ~7 migration tasks + validation

**Story 1.3:** Schema Infrastructure (**RENUMBERED from original 1.2**)
- Acceptance Criteria: Same as original Story 1.2 (defineBlock helper, block-base, SEO, button, portable text, page, site-settings)
- **Updated:** Block schema names use architecture camelCase names (heroBanner, ctaBanner, faqSection, statsRow, etc.)
- **Status:** ready-for-dev (unchanged)

**Story 1.4:** Storybook Setup (**NEW**)
- Acceptance Criteria:
  - Install `storybook-astro`, `storybook`, `@storybook/addon-docs`, `@storybook/builder-vite` as devDependencies
  - Create `.storybook/main.ts` with `storybook-astro` framework
  - Create `.storybook/preview.ts` importing `global.css`
  - Create initial stories for Button, Badge, Avatar, Accordion components
  - Create initial stories for HeroBlock, CtaBlock, FeatureGridBlock
  - Add `storybook` and `build-storybook` scripts to astro-app `package.json`
  - Update root `package.json` dev script to run Astro + Storybook concurrently
  - Optionally configure `storybookDevToolbar` in `astro.config.mjs`
  - `npm run storybook` launches Storybook on port 6006
  - Components render correctly with controls panel
- **Tasks:** ~5 setup tasks

**Stories 1.5 + 1.6:** Layout/Nav/Breadcrumbs (**REMOVED** - covered by migration)
- Original stories 1.3 and 1.4 are absorbed into Story 1.2 migration

#### Epic 2: Sanity Integration (**REFOCUSED** - was "Page Building with Core Blocks")

**Story 2.1:** Core Block Schemas (**REPLACES original 2.1-2.4**)
- Create Sanity schemas for all 12 migrated blocks using `defineBlock` pattern
- Block schemas: heroBanner, featureGrid, sponsorCards, richText, ctaBanner, faqSection, contactForm, timeline, logoCloud, statsRow, teamGrid, textWithImage
- Register all block schemas in page document's blocks array
- All blocks editable in Sanity Studio

**Story 2.2:** GROQ Queries & Page Data Fetching (**NEW**)
- Create typed GROQ queries in `src/lib/sanity.ts` for all page types
- Replace placeholder data imports with Sanity queries in all 5 pages
- Remove `src/lib/data/` directory (placeholder data)
- Verify all pages render from Sanity content
- Create seed content in Sanity Studio for development

**Story 2.3:** Page Composition System
- Page document's blocks array wired to BlockRenderer
- Dynamic `[...slug].astro` catch-all page route
- Content editors can create/reorder/configure blocks in Studio

#### Epics 3-4: Compressed (Schema + GROQ focus only)

**Epic 3** stories retain sponsor schema + detail page work but skip frontend block building (already migrated).

**Epic 4** stories retain project/team/event schemas + GROQ but skip timeline/roster block building (already migrated).

#### Epics 5-6: No change

### 4.2 Architecture Document Updates

```
Section: Block Naming Convention
NO CHANGE - architecture names retained (heroBanner, ctaBanner, faqSection, logoCloud, statsRow, teamGrid)
Reference code renamed during migration to match.

Section: Block Count
OLD: 9 P0 blocks, 5 P1 blocks, 3 P2 blocks
NEW: 12 P0 blocks (promotes statsRow, textWithImage, teamGrid from P1 to P0), remaining P1/P2 adjusted

Section: Additional Dependencies
ADD: storybook-astro, storybook, @storybook/addon-docs, @storybook/builder-vite (devDependencies)
REMOVE: lucide-react, radix-ui (if present)
```

### 4.3 PRD Updates

```
Section: Block Library P0
OLD: 9 P0 blocks
NEW: 12 P0 blocks (promote Stats, TextWithImage, TeamRoster from P1 to P0)

Section: Development Tooling (NEW)
ADD: "Storybook integration via storybook-astro for component development and documentation"
```

---

## Section 5: Implementation Handoff

### Change Scope Classification: **Moderate**

The changes involve backlog reorganization and story restructuring, but no fundamental architectural replan.

### Handoff Plan

| Role | Responsibility |
|------|---------------|
| **Development Team** | Execute Story 1.2 (migration), Story 1.4 (Storybook), then continue with Schema stories |
| **SM/PO (BMM workflow)** | Update sprint-status.yaml, create updated story files for 1.2 and 1.4 |
| **Architecture** | Update architecture.md with Storybook addition and promoted P0 blocks |

### Implementation Order

1. **Story 1.2** - Migrate Reference Project (prerequisite for everything)
2. **Story 1.3** - Schema Infrastructure (was 1.2, still needed)
3. **Story 1.4** - Storybook Setup (can parallel with 1.3)
4. **Story 2.1** - Block Schemas (depends on 1.3)
5. **Story 2.2** - GROQ Queries (depends on 2.1)
6. Continue with remaining epics...

### Success Criteria

- [ ] All reference project code successfully migrated to `astro-app/`
- [ ] `reference-project/` directory removed
- [ ] All 5 pages render correctly from `astro-app/`
- [ ] Storybook launches and renders components
- [ ] `npm run dev` and `npm run build` succeed
- [ ] All block types use architecture camelCase naming convention
- [ ] Sprint status reflects new story structure
- [ ] No React dependencies remain in production bundle
