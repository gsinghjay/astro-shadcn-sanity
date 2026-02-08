# Story 1.4: Storybook Setup

Status: done

## Story

As a developer,
I want Storybook configured for native Astro component development and documentation,
So that UI components and blocks can be developed, tested, and showcased in isolation.

## Acceptance Criteria

1. `storybook-astro`, `storybook`, `@storybook/addon-docs`, and `@storybook/builder-vite` are installed as devDependencies in `astro-app/`
2. `astro-app/.storybook/main.ts` configures the `storybook-astro` framework with stories glob pattern matching `src/**/*.stories.{ts,astro}`
3. `astro-app/.storybook/preview.ts` imports `../src/styles/global.css` for consistent theming
4. Initial stories are created for key UI components: Button, Badge, Avatar, Accordion
5. Initial stories are created for all 12 block components: HeroBanner, CtaBanner, FeatureGrid, TextWithImage, RichText, FaqSection, LogoCloud, StatsRow, Timeline, TeamGrid, SponsorCards, ContactForm
6. `astro-app/package.json` includes `"storybook": "storybook dev -p 6006"` and `"build-storybook": "storybook build"` scripts
7. Root `package.json` dev script is updated to optionally run Storybook concurrently
8. `npm run storybook` launches Storybook on port 6006 without errors
9. Components render correctly in Storybook with working controls panel

## Tasks / Subtasks

- [x] Task 1: Install Storybook dependencies (AC: #1)
  - [x] 1.1 Install devDependencies in `astro-app/`: `storybook-astro`, `storybook@^10`, `@storybook/addon-docs@^10`, `@storybook/builder-vite@^10`
  - [x] 1.2 Use `--legacy-peer-deps` if npm warns about `storybook-astro`'s vite peer dep (it declares `vite: ^5 || ^6` but project uses vite 7 — `@storybook/builder-vite@10` supports vite 7, so this is safe)
  - [x] 1.3 Verify `package.json` devDependencies include all four packages

- [x] Task 2: Create `.storybook/main.ts` configuration (AC: #2)
  - [x] 2.1 Create `astro-app/.storybook/main.ts`
  - [x] 2.2 Configure framework as `storybook-astro`
  - [x] 2.3 Set stories glob to `['../src/**/*.stories.@(js|jsx|ts|tsx)']`
  - [x] 2.4 Add `@storybook/addon-docs` to addons array
  - [x] 2.5 Set core builder to `@storybook/builder-vite`

- [x] Task 3: Create `.storybook/preview.ts` configuration (AC: #3)
  - [x] 3.1 Create `astro-app/.storybook/preview.ts`
  - [x] 3.2 Import `../src/styles/global.css` for design system theming
  - [x] 3.3 Configure default layout parameter as `'padded'`
  - [x] 3.4 Add background options for light/dark modes matching project theme

- [x] Task 4: Add npm scripts (AC: #6, #7)
  - [x] 4.1 Add `"storybook": "storybook dev -p 6006"` script to `astro-app/package.json`
  - [x] 4.2 Add `"build-storybook": "storybook build"` script to `astro-app/package.json`
  - [x] 4.3 Add `"storybook"` script to root `package.json`: `"npm run storybook --workspace=astro-app"`

- [x] Task 5: Create UI component stories (AC: #4)
  - [x] 5.1 Create `astro-app/src/components/ui/button/button.stories.ts` — Default, Secondary, Outline, Ghost variants
  - [x] 5.2 Create `astro-app/src/components/ui/badge/badge.stories.ts` — Default variant
  - [x] 5.3 Create `astro-app/src/components/ui/avatar/avatar.stories.ts` — With image, with fallback
  - [x] 5.4 Create `astro-app/src/components/ui/accordion/accordion.stories.ts` — Single item, multiple items

- [x] Task 6: Create block component stories (AC: #5)
  - [x] 6.1 Create `astro-app/src/components/blocks/HeroBanner.stories.ts` — Default with heading, subheading, CTA buttons; with background image; minimal (heading only)
  - [x] 6.2 Create `astro-app/src/components/blocks/CtaBanner.stories.ts` — Default with heading, description, buttons; minimal
  - [x] 6.3 Create `astro-app/src/components/blocks/FeatureGrid.stories.ts` — 2-column, 3-column, 4-column with items
  - [x] 6.4 Create `astro-app/src/components/blocks/TextWithImage.stories.ts` — ImageRight, ImageLeft, Minimal
  - [x] 6.5 Create `astro-app/src/components/blocks/RichText.stories.ts` — Default (multi-heading), ShortContent
  - [x] 6.6 Create `astro-app/src/components/blocks/FaqSection.stories.ts` — Default (5 items), Minimal (2 items)
  - [x] 6.7 Create `astro-app/src/components/blocks/LogoCloud.stories.ts` — WithLogos (images), TextOnly (fallback names)
  - [x] 6.8 Create `astro-app/src/components/blocks/StatsRow.stories.ts` — Light, Dark, TwoStats
  - [x] 6.9 Create `astro-app/src/components/blocks/Timeline.stories.ts` — Default (6 events), ShortTimeline (3 events)
  - [x] 6.10 Create `astro-app/src/components/blocks/TeamGrid.stories.ts` — Default (2 teams), SingleTeam (with avatars)
  - [x] 6.11 Create `astro-app/src/components/blocks/SponsorCards.stories.ts` — Default (4 sponsors, mixed tiers), Minimal
  - [x] 6.12 Create `astro-app/src/components/blocks/ContactForm.stories.ts` — Default (built-in fields), WithCustomFields (select + placeholder)

- [x] Task 7: Verify Storybook launches and renders (AC: #8, #9)
  - [x] 7.1 Run `npm run storybook` from `astro-app/` — verify launches on port 6006
  - [x] 7.2 Navigate to each UI component story and verify rendering
  - [x] 7.3 Navigate to each block component story and verify rendering
  - [x] 7.4 Test controls panel — verify args update component rendering
  - [x] 7.5 Verify global CSS (Tailwind, brand tokens, shadcn variables) applied to all stories
  - [x] 7.6 Run `npm run build` from root — verify existing build is not broken
  - [x] 7.7 Run `npm run build-storybook` from `astro-app/` — verify Storybook builds for static export

## Dev Notes

### Architecture Patterns — MUST FOLLOW

**Storybook framework:** `storybook-astro` (NOT `@storybook/html` or React wrappers). This package renders native `.astro` components directly in Storybook.

**Package versions and compatibility:**

| Package | Version | Notes |
|---|---|---|
| `storybook-astro` | `0.1.0` | Only version available. Peer dep declares `vite: ^5 \|\| ^6` but project uses vite 7. Use `--legacy-peer-deps` to install. Safe because `@storybook/builder-vite@10` supports vite 7. |
| `storybook` | `^10.2.7` | Latest stable. Peer dep: `prettier: ^2 \|\| ^3` (already satisfied). |
| `@storybook/addon-docs` | `^10.2.7` | Same major as storybook. |
| `@storybook/builder-vite` | `^10.2.7` | Supports `vite: ^5 \|\| ^6 \|\| ^7`. This is the package that actually integrates with vite — and it does support vite 7. |
| `vite` | `7.3.1` (installed) | Already a devDependency — do NOT add a second version. |
| `astro` | `5.17.1` (installed) | Supported by `storybook-astro`'s `astro: ^4 \|\| ^5` peer dep. |

**Story file format (CSF3):**
```typescript
// *.stories.ts — Component Story Format 3
import MyComponent from './my-component.astro'

export default {
  title: 'Category/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],  // Generates documentation page
}

export const Default = {
  args: {
    propName: 'value',
  },
}

export const Variant = {
  args: {
    propName: 'other value',
    anotherProp: true,
  },
}
```

**Story file location pattern:**
- UI component stories: colocated next to component — `src/components/ui/{name}/{name}.stories.ts`
- Block component stories: colocated next to component — `src/components/blocks/{BlockName}.stories.ts`

**TypeScript note:** Story files importing `.astro` components will show TS module-not-found errors in the editor. This is expected — Storybook resolves them at runtime via the `storybook-astro` framework. Do NOT add `// @ts-ignore` — just let the editor show the squiggly. The stories will work.

### .storybook/main.ts Configuration

```typescript
const config = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: 'storybook-astro',
    options: {},
  },
  core: {
    builder: '@storybook/builder-vite',
  },
}
export default config
```

### .storybook/preview.ts Configuration

```typescript
import '../src/styles/global.css'

const preview = {
  parameters: {
    layout: 'padded',
    backgrounds: {
      options: {
        light: { name: 'Light', value: '#ffffff' },
        dark: { name: 'Dark', value: '#1a1a2e' },
      },
    },
  },
}
export default preview
```

### Block Story Data Patterns

Block stories use placeholder data matching the types from `astro-app/src/lib/types.ts`. Since blocks currently consume placeholder data (Sanity integration is Story 2.x), the story args should match the same shape.

**HeroBanner props shape** (from `types.ts`):
```typescript
{
  _type: 'heroBanner',
  _key: 'story-hero-1',
  heading: 'Welcome to YWCC Capstone',
  subheading: 'Building real-world solutions...',
  backgroundVariant: 'white',  // base field
  spacing: 'default',           // base field
  maxWidth: 'default',          // base field
  alignment: 'center',
  ctaButtons: [
    { text: 'Learn More', url: '/about', variant: 'default' },
    { text: 'Contact Us', url: '/contact', variant: 'outline' },
  ],
}
```

**CtaBanner props shape:**
```typescript
{
  _type: 'ctaBanner',
  _key: 'story-cta-1',
  heading: 'Ready to Partner?',
  description: 'Join our sponsor program...',
  backgroundVariant: 'primary',
  spacing: 'default',
  maxWidth: 'default',
  ctaButtons: [
    { text: 'Become a Sponsor', url: '/sponsors', variant: 'default' },
  ],
}
```

**FeatureGrid props shape:**
```typescript
{
  _type: 'featureGrid',
  _key: 'story-features-1',
  heading: 'Why Partner With Us',
  backgroundVariant: 'white',
  spacing: 'default',
  maxWidth: 'default',
  columns: 3,
  items: [
    { title: 'Real-World Projects', description: 'Students solve actual business problems', icon: 'lightbulb' },
    { title: 'Talent Pipeline', description: 'Connect with emerging developers', icon: 'users' },
    { title: 'Innovation', description: 'Fresh perspectives on your challenges', icon: 'sparkles' },
  ],
}
```

**CRITICAL:** Check the actual component props interface in each `.astro` file before writing stories. The shapes above are approximate — the actual component may destructure props differently. Read the component first.

### Previous Story Intelligence (1-3: Schema Infrastructure)

**Key learnings from Story 1.3:**
- Playwright integration tests use `playwright.integration.config.ts` (no webServer block) — existing test:integration script works for schema tests. Storybook does NOT need Playwright test integration.
- `studio/package.json` has `"type": "module"` — this is for the studio workspace only, not relevant to astro-app Storybook setup.
- All 12 block components exist in `astro-app/src/components/blocks/` with architecture camelCase PascalCase file names.
- Build verified: 5 pages, 0 errors — Storybook setup must NOT break this.

### Git Intelligence

Recent commits (most recent first):
1. `89ad966 feat: story 1-3` — Schema infrastructure (defineBlock, objects, documents)
2. `de36e53 feat: test scaffold` — Playwright test infrastructure
3. `a90a947 feat: story 1-2` — Reference project migration (all 12 blocks, 22 UI component sets, 5 pages)
4. `a4102f9 chore: BMAD` — Build management tooling
5. `a3b28bb refactor: scaffold from MyWebClass` — Initial project scaffold

**Patterns established:**
- All block components in `src/components/blocks/` as PascalCase `.astro` files
- All UI primitives in `src/components/ui/{name}/` with `index.ts` barrel exports
- `global.css` is the design system entry point (Tailwind v4 + shadcn variables + brand tokens)

### Existing Component Inventory

**12 Block components** (all in `astro-app/src/components/blocks/`):
HeroBanner, FeatureGrid, TextWithImage, RichText, FaqSection, CtaBanner, LogoCloud, StatsRow, Timeline, TeamGrid, SponsorCards, ContactForm

**22 UI component sets** (all in `astro-app/src/components/ui/`):
accordion, avatar, badge, button, field, footer, header, icon, image, input, item, label, list, logo, marquee, native-select, section, separator, sheet, spinner, textarea, tile

**Additional components:**
- `BlockRenderer.astro` — dispatches blocks by `_type`
- `Header.astro`, `Footer.astro` — layout components

### Anti-Patterns to Avoid

| Rule | What NOT to Do |
|---|---|
| No React-based Storybook | Do NOT use `@storybook/react` — use `storybook-astro` for native `.astro` rendering |
| No duplicate vite | Do NOT install a separate vite version — use the project's existing `vite@7.3.1` |
| No framework adapters | Do NOT add `@storybook/react-vite` or `@storybook/html-vite` — `storybook-astro` handles framework integration |
| No global side effects in stories | Stories should be self-contained data — `preview.ts` handles global CSS |
| No modifying existing components | Story files are additive — do NOT change any `.astro` component to make it work with Storybook |
| No React/JSX story files | Use `.stories.ts` NOT `.stories.tsx` — CSF3 format with `args` objects, no JSX templates |

### File Structure (Files to Create/Modify)

```
astro-app/
├── .storybook/
│   ├── main.ts                        ← NEW (Task 2)
│   └── preview.ts                     ← NEW (Task 3)
├── package.json                       ← MODIFY (Tasks 1, 4)
└── src/components/
    ├── ui/
    │   ├── button/button.stories.ts   ← NEW (Task 5.1)
    │   ├── badge/badge.stories.ts     ← NEW (Task 5.2)
    │   ├── avatar/avatar.stories.ts   ← NEW (Task 5.3)
    │   └── accordion/accordion.stories.ts ← NEW (Task 5.4)
    └── blocks/
        ├── HeroBanner.stories.ts      ← NEW (Task 6.1)
        ├── CtaBanner.stories.ts       ← NEW (Task 6.2)
        ├── FeatureGrid.stories.ts     ← NEW (Task 6.3)
        ├── TextWithImage.stories.ts   ← NEW (Task 6.4)
        ├── RichText.stories.ts        ← NEW (Task 6.5)
        ├── FaqSection.stories.ts      ← NEW (Task 6.6)
        ├── LogoCloud.stories.ts       ← NEW (Task 6.7)
        ├── StatsRow.stories.ts        ← NEW (Task 6.8)
        ├── Timeline.stories.ts        ← NEW (Task 6.9)
        ├── TeamGrid.stories.ts        ← NEW (Task 6.10)
        ├── SponsorCards.stories.ts     ← NEW (Task 6.11)
        └── ContactForm.stories.ts     ← NEW (Task 6.12)
package.json                           ← MODIFY (Task 4.3 — root)
```

### Testing Requirements

- `npm run storybook` (from `astro-app/`) starts dev server on port 6006
- All 7 UI component stories render without errors
- All 21 block stories (across 12 blocks) render without errors
- Controls panel updates component rendering in real time
- Global CSS (Tailwind, brand tokens) applied to story previews
- `npm run build` from root still succeeds (no regression)
- `npm run build-storybook` from `astro-app/` produces static Storybook build

### Project Structure Notes

- `.storybook/` directory goes inside `astro-app/` workspace (NOT at monorepo root)
- Story files are colocated with their components (NOT in a separate `stories/` directory)
- Storybook is a devDependency only — zero impact on production build or bundle size
- Architecture spec shows `.storybook/` in the `astro-app/` directory structure (confirmed)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Storybook integration section, devDependencies list, .storybook/ directory structure]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.4 acceptance criteria]
- [Source: _bmad-output/implementation-artifacts/1-3-schema-infrastructure.md — Previous story learnings, Playwright test infrastructure]
- [Source: _bmad-output/implementation-artifacts/1-2-migrate-reference-project.md — Component inventory, CSS migration details]
- [Source: https://github.com/ThinkOodle/storybook-astro — storybook-astro README: configuration, CSF format, preview setup, Astro dev toolbar integration]
- [Source: npm registry — storybook-astro@0.1.0 peer deps, @storybook/builder-vite@10 vite 7 support]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

**Tasks 1-6: COMPLETE. Task 7: partially verified (7.1, 7.6, 7.7 pass; 7.2-7.5 need manual user testing).**

**Key decisions and discoveries during implementation:**

1. **Wrapper components required for slot-based UI components.** Astro UI components (Button, Badge, Avatar, Accordion) guard rendering with `slot?.trim().length > 0` — they only render when slot content is provided. Storybook CSF3 passes `args` as props, not slot content. Solution: created `*Story.astro` wrapper components that accept props (`text`, `items`, etc.) and pass them as slot children to the real component. Block components work directly because they accept a `block` prop object (no slots needed).

2. **Tailwind v4 requires `@tailwindcss/vite` in Storybook's Vite config.** The `preview.ts` imports `global.css`, but without the Tailwind Vite plugin, CSS utility classes aren't processed. Added `tailwindcss()` plugin via `viteFinal`.

3. **`@/` path alias needs explicit Vite resolve.alias.** Astro's tsconfig defines `@/* -> ./src/*`, but Storybook's Vite doesn't inherit this. Added `resolve.alias` in `viteFinal`.

4. **Astro virtual modules need stubs.** Components that depend on `astro-icon` (`virtual:astro-icon`) and `astro:assets` (`virtual:astro:assets/fonts/runtime`, `virtual:astro:assets/fonts/internal`) fail in Storybook because these virtual modules are only available in Astro's build pipeline. Created a `astroVirtualModuleStubs()` Vite plugin. The `virtual:astro-icon` stub loads **real icon data** from `@iconify-json/lucide` and `@iconify-json/simple-icons` so that block components using `<Icon name="lucide:..." />` render correctly. The font stubs are empty exports. The AccordionStory still uses an inline SVG chevron because `*Story.astro` wrappers should avoid `astro-icon` imports.

5. **CJS/ESM interop for `debug` package.** The `astro-icon` package chain depends on `debug` (a CJS module). Added `debug` to `optimizeDeps.include` to pre-bundle it.

6. **Avatar story uses plain `<img>` instead of `AvatarImage`.** `AvatarImage` chains through the project's `Image` component which imports from `astro:assets` — not available in Storybook. The `AvatarStory.astro` wrapper uses a plain `<img>` tag for the image variant and `AvatarFallback` for the fallback variant.

**Task 7 verified by user manually — all stories rendering, controls working, CSS applied.**

7. **`virtual:astro-icon` stub upgraded to load real icon data.** The initial empty stub (`export default {}`) caused `Unable to locate the "lucide" icon set!` errors when rendering SponsorCards and ContactForm (which use `<Icon name="lucide:..." />`). Fixed by reading `@iconify-json/lucide` and `@iconify-json/simple-icons` JSON files at build time and exporting them as the icon sets. Both icon sets now render correctly in Storybook.

8. **`virtual:astro:assets/fonts/internal` stub added.** Astro's `Font.astro` component imports from this virtual module. Without the stub, Storybook threw `Failed to resolve import "virtual:astro:assets/fonts/internal"`. Added as an empty export alongside the existing `fonts/runtime` stub.

**Code Review Fixes (Opus 4.6):**

1. **H1 FIXED:** Added `storybook-static/` to `astro-app/.gitignore` — prevents 5MB build output from being committed
2. **H2 FIXED:** Deleted 3 debug screenshots from project root (`storybook-button-check.png`, `storybook-button-fixed.png`, `storybook-css-check.png`)
3. **M1 FIXED:** Added `dev:storybook` script to root `package.json` — runs astro-app + studio + storybook concurrently (AC #7)
4. **M2 FIXED:** Added `parameters: { layout: 'fullscreen' }` to HeroBanner and CtaBanner block stories
5. **M3 FIXED:** Updated File List with missing entries (`docs/storybook-constitution.md`, `docs/storybook-astro.md`, `astro-app/.gitignore`, `package-lock.json`)
6. **M4 FIXED:** Added `argTypes` definitions to accordion story (`items: object`, `openFirst: boolean`)

**Code Review #2 — Additional UI Stories (Opus 4.6):**

34 additional UI component stories were added beyond the original 4 (Button, Badge, Avatar, Accordion). This review covered all new stories and discovered a blocking runtime error.

1. **H1 FIXED:** `lucide-static` SVG imports crash Storybook SSR — 5 stories broken. `config.define` with `'import.meta.env.DEV': JSON.stringify(true)` does NOT work because Vite's `define` only transforms source code, not pre-compiled `node_modules` evaluated by the SSR module runner. **Fix:** Created `lucideStaticSvgStub()` Vite plugin (`enforce: 'pre'`) that intercepts `lucide-static/icons/*.svg` imports, reads actual SVG file content, and returns Astro components using `createComponent` + `render` + `spreadAttributes` + `unescapeHTML` — completely bypassing `createSvgComponent`. Affected: native-carousel, rating, collapsible, banner, navigation-menu stories.
2. **H1b FIXED:** Astro's image plugin intercepted the virtual module IDs because they ended in `.svg`. Fixed by stripping `.svg` extension from the virtual ID (`\0lucide-stub:` prefix) so Astro's `vite-plugin-assets` doesn't try to load it.
3. **M1 FIXED:** `rating.stories.ts` — `OneStars` renamed to `OneStar` (grammar fix).
4. **L1 FIXED:** `video.stories.ts` — replaced rickroll URL with `jNQXAC9IVRw`.
5. **FIXED:** `storybook-constitution.md` — updated lucide-static section to document actual `lucideStaticSvgStub` plugin approach; removed false claims about `config.define` fixing SSR.
6. **FIXED:** `NativeCarouselStory.astro` — added `mx-auto` to center carousel in story canvas.
7. **FIXED:** `SheetStory.astro` — removed nested button (was `<SheetTrigger><Button>` causing button-in-button); now passes `variant="outline"` directly to `<SheetTrigger>` with text content. Removed unused `Button` import. Added `px-4` to nav for consistent padding with `SheetHeader`.

### File List

**New files:**
- `astro-app/.storybook/main.ts` — Storybook config with framework, Vite alias, Tailwind plugin, virtual module stubs
- `astro-app/.storybook/preview.ts` — Global CSS import, layout/background parameters
- `astro-app/src/components/ui/button/ButtonStory.astro` — Wrapper: props→slot bridge for Button
- `astro-app/src/components/ui/button/button.stories.ts` — 4 stories: Default, Secondary, Outline, Ghost
- `astro-app/src/components/ui/badge/BadgeStory.astro` — Wrapper: props→slot bridge for Badge
- `astro-app/src/components/ui/badge/badge.stories.ts` — 1 story: Default
- `astro-app/src/components/ui/avatar/AvatarStory.astro` — Wrapper: Avatar + plain img/fallback
- `astro-app/src/components/ui/avatar/avatar.stories.ts` — 2 stories: WithImage, WithFallback
- `astro-app/src/components/ui/accordion/AccordionStory.astro` — Wrapper: Accordion composition with inline SVG chevron
- `astro-app/src/components/ui/accordion/accordion.stories.ts` — 2 stories: SingleItem, MultipleItems
- `astro-app/src/components/blocks/HeroBanner.stories.ts` — 3 stories: Default, WithBackgroundImages, Minimal
- `astro-app/src/components/blocks/CtaBanner.stories.ts` — 2 stories: Default, Minimal
- `astro-app/src/components/blocks/FeatureGrid.stories.ts` — 3 stories: TwoColumn, ThreeColumn, FourColumn
- `astro-app/src/components/blocks/TextWithImage.stories.ts` — 3 stories: ImageRight, ImageLeft, Minimal
- `astro-app/src/components/blocks/RichText.stories.ts` — 2 stories: Default, ShortContent
- `astro-app/src/components/blocks/FaqSection.stories.ts` — 2 stories: Default, Minimal
- `astro-app/src/components/blocks/LogoCloud.stories.ts` — 2 stories: WithLogos, TextOnly
- `astro-app/src/components/blocks/StatsRow.stories.ts` — 3 stories: Light, Dark, TwoStats
- `astro-app/src/components/blocks/Timeline.stories.ts` — 2 stories: Default, ShortTimeline
- `astro-app/src/components/blocks/TeamGrid.stories.ts` — 2 stories: Default, SingleTeam
- `astro-app/src/components/blocks/SponsorCards.stories.ts` — 2 stories: Default, Minimal
- `astro-app/src/components/blocks/ContactForm.stories.ts` — 2 stories: Default, WithCustomFields
- `docs/storybook-constitution.md` — Storybook best practices and patterns documentation
- `docs/storybook-astro.md` — storybook-astro package reference notes

**New files (Code Review #2 — additional UI stories):**
- `astro-app/src/components/ui/input/input.stories.ts` — 3 stories: Text, Email, Tel
- `astro-app/src/components/ui/textarea/textarea.stories.ts`
- `astro-app/src/components/ui/separator/separator.stories.ts` — 2 stories: Horizontal, Vertical
- `astro-app/src/components/ui/icon/icon.stories.ts` — 6 stories: lucide + simple-icons
- `astro-app/src/components/ui/spinner/spinner.stories.ts` — 2 stories: Default, Large
- `astro-app/src/components/ui/image/ImageStory.astro` — Wrapper: plain `<img>` (avoids `astro:assets`)
- `astro-app/src/components/ui/image/image.stories.ts`
- `astro-app/src/components/ui/label/LabelStory.astro`
- `astro-app/src/components/ui/label/label.stories.ts`
- `astro-app/src/components/ui/list/ListStory.astro`
- `astro-app/src/components/ui/list/list.stories.ts`
- `astro-app/src/components/ui/logo/LogoStory.astro`
- `astro-app/src/components/ui/logo/logo.stories.ts`
- `astro-app/src/components/ui/marquee/MarqueeStory.astro`
- `astro-app/src/components/ui/marquee/marquee.stories.ts`
- `astro-app/src/components/ui/native-select/NativeSelectStory.astro`
- `astro-app/src/components/ui/native-select/native-select.stories.ts`
- `astro-app/src/components/ui/field/FieldStory.astro`
- `astro-app/src/components/ui/field/field.stories.ts`
- `astro-app/src/components/ui/item/ItemStory.astro`
- `astro-app/src/components/ui/item/item.stories.ts`
- `astro-app/src/components/ui/tile/TileStory.astro`
- `astro-app/src/components/ui/tile/tile.stories.ts`
- `astro-app/src/components/ui/section/SectionStory.astro`
- `astro-app/src/components/ui/section/section.stories.ts`
- `astro-app/src/components/ui/header/HeaderStory.astro`
- `astro-app/src/components/ui/header/header.stories.ts` — 3 stories: Default, Floating, CustomBrand
- `astro-app/src/components/ui/footer/FooterStory.astro`
- `astro-app/src/components/ui/footer/footer.stories.ts` — 2 stories: Default, Floating
- `astro-app/src/components/ui/sheet/SheetStory.astro`
- `astro-app/src/components/ui/sheet/sheet.stories.ts` — 3 stories: Right, Left, Bottom
- `astro-app/src/components/ui/checkbox/checkbox.stories.ts` — 3 stories: Default, Checked, Disabled
- `astro-app/src/components/ui/skeleton/skeleton.stories.ts` — 3 stories: Default, Circle, Card
- `astro-app/src/components/ui/rating/rating.stories.ts` — 4 stories: FiveStars, FourStars, ThreeAndHalf, OneStar
- `astro-app/src/components/ui/video/video.stories.ts` — 1 story: YouTube
- `astro-app/src/components/ui/theme-toggle/theme-toggle.stories.ts`
- `astro-app/src/components/ui/alert/AlertStory.astro`
- `astro-app/src/components/ui/alert/alert.stories.ts` — 2 stories: Default, Destructive
- `astro-app/src/components/ui/banner/BannerStory.astro`
- `astro-app/src/components/ui/banner/banner.stories.ts` — 2 stories: Default, Floating
- `astro-app/src/components/ui/collapsible/CollapsibleStory.astro`
- `astro-app/src/components/ui/collapsible/collapsible.stories.ts` — 2 stories: Default, OpenByDefault
- `astro-app/src/components/ui/empty/EmptyStory.astro`
- `astro-app/src/components/ui/empty/empty.stories.ts` — 2 stories: Default, NotFound
- `astro-app/src/components/ui/native-carousel/NativeCarouselStory.astro`
- `astro-app/src/components/ui/native-carousel/native-carousel.stories.ts` — 2 stories: Default, TwoSlides
- `astro-app/src/components/ui/navigation-menu/NavigationMenuStory.astro`
- `astro-app/src/components/ui/navigation-menu/navigation-menu.stories.ts` — 2 stories: WithDropdown, LinksOnly
- `astro-app/src/components/ui/price/PriceStory.astro`
- `astro-app/src/components/ui/price/price.stories.ts` — 3 stories: Default, Sale, Yearly
- `astro-app/src/components/ui/radio-group/RadioGroupStory.astro`
- `astro-app/src/components/ui/radio-group/radio-group.stories.ts` — 2 stories: Default, ProjectTypes
- `astro-app/src/components/ui/sidebar/SidebarStory.astro`
- `astro-app/src/components/ui/sidebar/sidebar.stories.ts` — 2 stories: Default, FlatMenu
- `astro-app/src/components/ui/table/TableStory.astro`
- `astro-app/src/components/ui/table/table.stories.ts` — 2 stories: Default, WithCaption
- `astro-app/src/components/ui/tabs/TabsStory.astro`
- `astro-app/src/components/ui/tabs/tabs.stories.ts` — 2 stories: Default, TwoTabs

**Modified files (Code Review #2):**
- `astro-app/.storybook/main.ts` — Added `lucideStaticSvgStub()` plugin; removed broken `config.define` for `import.meta.env.DEV`
- `docs/storybook-constitution.md` — Updated lucide-static section, table row, checklist items

**Modified files:**
- `astro-app/package.json` — Added devDependencies + storybook/build-storybook scripts
- `astro-app/.gitignore` — Added `storybook-static/` entry
- `package.json` (root) — Added storybook + dev:storybook scripts
- `package-lock.json` — Updated from npm install
