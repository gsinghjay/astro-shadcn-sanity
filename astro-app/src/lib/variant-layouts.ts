import { stegaClean } from '@sanity/client/stega';

/**
 * Layout types that map to Section primitives.
 * - 'content': SectionContent (single-column centered/left)
 * - 'split': SectionSplit (two-column side-by-side)
 * - 'spread': SectionSpread (two-column space-between)
 * - 'grid': SectionGrid (multi-column responsive grid)
 * - 'media': SectionMedia (background/overlay media)
 */
export type SectionLayoutType = 'content' | 'split' | 'spread' | 'grid' | 'media' | 'masonry';

export type ColumnRatio = '1:1' | '1:2' | '2:1' | '2:3' | '3:2' | '1:3' | '3:1';

export interface VariantLayoutConfig {
  layout: SectionLayoutType;
  columnRatio?: ColumnRatio;
  alignment?: 'left' | 'center' | 'right';
  className?: string;
}

/**
 * Map of block types → variant name → layout config.
 * New block types register their variant layouts here.
 */
const variantLayoutMap: Record<string, Record<string, VariantLayoutConfig>> = {
  // Variant layouts will be registered here by subsequent stories (2.5–2.8)
};

/**
 * Get the layout config for a block type + variant combination.
 * CRITICAL: Calls stegaClean() on the variant value before lookup.
 * Visual Editing injects stega encoding that would break map lookups.
 *
 * Returns the default 'content' layout if no match is found.
 */
export function getVariantLayout(blockType: string, variant?: string | null): VariantLayoutConfig {
  const cleanBlockType = stegaClean(blockType) ?? blockType;
  const cleanVariant = stegaClean(variant) ?? 'default';
  const blockVariants = variantLayoutMap[cleanBlockType];
  if (!blockVariants) {
    return { layout: 'content' };
  }
  return blockVariants[cleanVariant] ?? blockVariants['default'] ?? { layout: 'content' };
}

/**
 * Register variant layouts for a block type.
 * Used by block-specific modules to declare their variant → layout mappings.
 */
export function registerVariantLayouts(
  blockType: string,
  layouts: Record<string, VariantLayoutConfig>,
): void {
  variantLayoutMap[blockType] = { ...variantLayoutMap[blockType], ...layouts };
}

/**
 * Remove all registered variant layouts.
 * For use in tests to ensure clean state between test runs.
 */
export function clearVariantLayouts(): void {
  for (const key of Object.keys(variantLayoutMap)) {
    delete variantLayoutMap[key];
  }
}
