// All blocks — auto-discovered via import.meta.glob
// Custom blocks: PascalCase filename → camelCase _type (e.g. HeroBanner.astro → heroBanner)
// UI blocks: kebab-case filename used directly as _type (e.g. hero-1.astro → hero-1)
import type { AstroComponentFactory } from 'astro/runtime/server/render/astro/factory';

const allBlocks: Record<string, AstroComponentFactory> = {};

const customModules = import.meta.glob('./blocks/custom/*.astro', { eager: true });
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

export { allBlocks };
