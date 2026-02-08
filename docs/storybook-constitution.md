# Storybook Constitution

Best practices, hard-won lessons, and rules for working with Storybook in this Astro + Tailwind v4 monorepo. Follow these or suffer.

## The Golden Rules

1. **Never modify existing `.astro` components to make them work with Storybook.** Stories are additive. If a component doesn't work with CSF3 args, create a `*Story.astro` wrapper — never change the source component.

2. **Always read the component source before writing a story.** The type definitions in `types.ts` are approximate. The actual component may destructure props differently, use slots instead of props, or have conditional rendering guards.

3. **Block components work directly. Slot-based UI components need wrappers.** Block components accept a `block` prop object and render from it — no slots. UI primitives (Button, Badge, Avatar, Accordion) use `<slot />` for content, which CSF3 args can't provide. Bridge with `*Story.astro` wrappers.

## Architecture

### `.storybook/main.ts` — The Control Center

The `viteFinal` hook is where all the Astro↔Storybook compatibility lives:

| Concern | Solution |
|---|---|
| **`@/` path alias** | `resolve.alias` mapping `@` → `../src` |
| **Tailwind v4 CSS** | `@tailwindcss/vite` plugin — without this, no utility classes render |
| **`astro:assets` Image** | `astroAssetsStub()` plugin (`enforce: 'pre'`) intercepts `astro:assets` before Astro's Vite plugin and provides a plain `<img>` component — no image service needed |
| **Astro virtual modules** | `astroVirtualModuleStubs()` plugin stubs `virtual:astro-icon` (with real icon data), `virtual:astro:assets/fonts/runtime`, and `virtual:astro:assets/fonts/internal` |
| **`lucide-static` SVGs** | `lucideStaticSvgStub()` plugin intercepts `.svg` imports and renders inline, bypassing `createSvgComponent` which crashes in SSR |
| **CJS/ESM interop** | `debug` in `optimizeDeps.include` — `astro-icon` depends on it |

If you add a new Vite plugin or Astro integration to `astro.config.mjs`, check whether Storybook also needs it in `viteFinal`.

### Story File Patterns

**UI component stories** — colocated with wrapper:
```
src/components/ui/button/
├── button.astro          # Source component (DO NOT MODIFY)
├── ButtonStory.astro     # Wrapper: accepts props, passes as slots
├── button.stories.ts     # CSF3 stories importing the wrapper
└── index.ts              # Barrel export (DO NOT MODIFY)
```

**Block component stories** — no wrapper needed:
```
src/components/blocks/
├── HeroBanner.astro       # Source component
└── HeroBanner.stories.ts  # CSF3 stories, args = { block: {...} }
```

## DO

- **DO** use `argTypes` with `control: 'select'` for enum props (variant, size) — gives users dropdowns instead of free text
- **DO** use `tags: ['autodocs']` on every story default export — generates documentation pages automatically
- **DO** pass realistic placeholder data in block stories — match the actual `types.ts` interfaces
- **DO** add `@tailwindcss/vite` to `viteFinal` — Tailwind v4 is plugin-based, not PostCSS
- **DO** stub any new Astro virtual modules that appear when adding integrations
- **DO** test `npm run build` after any Storybook config changes — ensure no regression
- **DO** run `npm run build-storybook` to verify static export works
- **DO** use `parameters: { layout: 'fullscreen' }` for full-width block stories (heroes, banners)

## DON'T

- **DON'T** use `@storybook/react`, `@storybook/html`, or any React wrappers — this project uses `storybook-astro` for native Astro rendering
- **DON'T** install a separate `vite` version — Storybook uses the project's `vite@7.x` via `@storybook/builder-vite`
- **DON'T** use `.stories.tsx` files — no JSX. Use `.stories.ts` with CSF3 `args` objects
- **DON'T** import `astro-icon` `Icon` component in `*Story.astro` wrappers — use inline SVGs instead. Block components that use `Icon` internally work fine because the stub loads real icon data from `@iconify-json/lucide` and `@iconify-json/simple-icons`
- **DON'T** worry about `astro:assets` `Image` — the `astroAssetsStub()` plugin handles it. Components using `Image`, `AvatarImage`, and `LogoImage` work directly in Storybook
- **DON'T** use `// @ts-ignore` on `.astro` imports in story files — the TS errors are expected and harmless
- **DON'T** add stories to the `stories/` glob that import components with deep Astro integration dependencies (Sanity client, `astro:content`, etc.) without first stubbing those modules
- **DON'T** forget `--legacy-peer-deps` when installing — `storybook-astro` declares `vite: ^5 || ^6` but we use vite 7

## The Slot Problem (Why Wrappers Exist)

Astro components receive children via `<slot />`. Storybook CSF3 passes `args` as component props. There is no CSF3 mechanism to pass slot content.

Many UI components in this project guard rendering with:
```javascript
const slot = await Astro.slots.render("default")
// Component only renders if slot has content:
{ slot?.trim().length > 0 && (<Component>...</Component>) }
```

Without slot content → empty render → blank story.

**The fix:** `*Story.astro` wrappers accept a prop (like `text` or `items`), then pass it as a child to the real component:
```astro
---
import Button from './button.astro'
const { text = 'Button', ...rest } = Astro.props
---
<Button {...rest}>{text}</Button>
```

## The Virtual Module Problem

Astro integrations (`astro-icon`, `astro:assets`) register Vite virtual modules during Astro's build pipeline. Storybook's Vite instance doesn't run Astro integrations, so these modules don't exist.

**Symptoms:** `Failed to resolve import "virtual:astro-icon"` or `"virtual:astro:assets/fonts/runtime"` or `"virtual:astro:assets/fonts/internal"`

**Fix:** The `astroVirtualModuleStubs()` plugin in `main.ts` handles all known virtual modules:

| Virtual Module | Stub Strategy |
|---|---|
| `virtual:astro-icon` | **Real data** — reads `@iconify-json/lucide` and `@iconify-json/simple-icons` JSON at build time. Icons render correctly in Storybook. |
| `virtual:astro:assets/fonts/runtime` | Empty export — font optimization not available outside Astro |
| `virtual:astro:assets/fonts/internal` | Empty export — used by Astro's `Font.astro` component |

**When you hit a new `virtual:` import error:** Add the module ID to the `virtualModules` map in `astroVirtualModuleStubs()` with an appropriate empty export (`export {};`). If the module provides data a component needs at runtime (like icon sets), load real data instead of an empty stub.

**If a new `@iconify-json/*` icon set is added to the project:** Add the set name to the `iconSets` array in `astroVirtualModuleStubs()` so it gets loaded into the `virtual:astro-icon` stub.

## The `lucide-static` SVG Problem

Some fulldev/ui components (banner, collapsible, native-carousel, navigation-menu, rating) import SVG icons directly from `lucide-static/icons/*.svg`. Astro processes these through `createSvgComponent` in `astro/dist/assets/runtime.js`, which reads `import.meta.env.DEV`.

In Storybook's SSR context, `import.meta.env` is undefined, causing: `Cannot read properties of undefined (reading 'DEV')`.

**Why `config.define` does NOT work:** Vite's `define` applies source-code text replacements at compile time, but `astro/dist/assets/runtime.js` is a pre-compiled module in `node_modules` that gets evaluated by the SSR module runner without those transforms.

**Fix:** The `lucideStaticSvgStub()` Vite plugin in `main.ts` intercepts `lucide-static/icons/*.svg` imports with `enforce: 'pre'` (before Astro's SVG plugin), reads the actual SVG file content, and returns an Astro component that renders the SVG inline using `createComponent` + `render` + `spreadAttributes` + `unescapeHTML` — completely bypassing `createSvgComponent`.

**Note:** `lucide-static` is a different package from `astro-icon` + `@iconify-json/lucide`. Both are used in the project:
- `astro-icon` — renders icons via `<Icon name="lucide:..." />` using Iconify data (handled by `astroVirtualModuleStubs`)
- `lucide-static` — direct `.svg` file imports processed by Astro's SVG pipeline (handled by `lucideStaticSvgStub`)

## Installing New fulldev/ui Components

The `shadcn` CLI (v3.8.4) fails with `.astro` file parsing errors. Use the registry fetch script instead:

1. Fetch the registry JSON: `https://ui.full.dev/r/{component-name}.json`
2. Write each file from the response's `files` array to the correct path under `astro-app/`
3. Check if the component imports from `lucide-static` — the `lucideStaticSvgStub()` plugin handles it automatically
4. Create a story (with wrapper if slot-based)
5. Verify with `npm run storybook` and `npm run build`

## Adding a New Story Checklist

1. Read the component source — identify props vs slots
2. If slot-based → create `ComponentNameStory.astro` wrapper
3. Check for `astro-icon`, `lucide-static`, or other virtual module imports in the dependency chain
4. If virtual module dependency → use alternatives in the wrapper (inline SVG for `astro-icon` in wrappers). `astro:assets` and `lucide-static` are already stubbed and work directly
5. Components using `lucide-static` work directly — the `lucideStaticSvgStub()` plugin handles SVG processing
6. Create `.stories.ts` with CSF3 format, `argTypes` for enum controls
7. Verify with `npm run storybook`
8. Run `npm run build` to check for regressions
