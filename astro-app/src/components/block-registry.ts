// All blocks — auto-discovered via import.meta.glob
// Custom blocks: PascalCase filename → camelCase _type (e.g. HeroBanner.astro → heroBanner)
// UI blocks: kebab-case filename used directly as _type (e.g. hero-1.astro → hero-1)
//
// AstroComponentFactory's internal import path moved between Astro 5 → 6; we no longer
// import the type — the registry only needs the default export's runtime shape.
type AstroComponentFactory = (...args: unknown[]) => unknown;

const allBlocks: Record<string, AstroComponentFactory> = {};

// Exclude ColumnsBlock from eager glob to avoid circular dependency:
// ColumnsBlock → BlockRenderer → block-registry → (glob) → ColumnsBlock
const customModules = import.meta.glob(
  ['./blocks/custom/*.astro', '!./blocks/custom/ColumnsBlock.astro'],
  { eager: true },
);
for (const [path, mod] of Object.entries(customModules)) {
  const filename = path.split('/').pop()!.replace('.astro', '');
  const typeName = filename[0].toLowerCase() + filename.slice(1);
  allBlocks[typeName] = (mod as { default: AstroComponentFactory }).default;
}

const uiModules = import.meta.glob('./blocks/*.astro', { eager: true });
for (const [path, mod] of Object.entries(uiModules)) {
  const name = path.split('/').pop()!.replace('.astro', '');
  allBlocks[name] = (mod as { default: AstroComponentFactory }).default;
}

// ColumnsBlock loaded lazily — resolved by BlockRenderer before first render.
// By that time all static imports are cached, so the dynamic import completes instantly.
const containerBlockLoaders = import.meta.glob('./blocks/custom/ColumnsBlock.astro');
let _resolvePromise: Promise<void> | null = null;

export function resolveContainerBlocks(): Promise<void> {
  return (_resolvePromise ??= (async () => {
    for (const [path, loader] of Object.entries(containerBlockLoaders)) {
      const mod = (await loader()) as { default: AstroComponentFactory };
      const filename = path.split('/').pop()!.replace('.astro', '');
      const typeName = filename[0].toLowerCase() + filename.slice(1);
      allBlocks[typeName] = mod.default;
    }
  })());
}

export { allBlocks };
