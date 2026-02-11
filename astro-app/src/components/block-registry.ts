// Custom blocks — auto-discovered from blocks/custom/
// Filename convention: PascalCase (e.g. HeroBanner.astro) → camelCase _type (heroBanner)
const customModules = import.meta.glob('./blocks/custom/*.astro', { eager: true });
const customBlocks: Record<string, any> = {};
for (const [path, mod] of Object.entries(customModules)) {
  const filename = path.split('/').pop()!.replace('.astro', '');
  const typeName = filename[0].toLowerCase() + filename.slice(1);
  customBlocks[typeName] = (mod as any).default;
}

// fulldotdev/ui blocks — auto-discovered from blocks/
const uiModules = import.meta.glob('./blocks/*.astro', { eager: true });
const uiBlocks: Record<string, any> = {};
for (const [path, mod] of Object.entries(uiModules)) {
  const name = path.split('/').pop()!.replace('.astro', '');
  uiBlocks[name] = (mod as any).default;
}

export { customBlocks, uiBlocks };
