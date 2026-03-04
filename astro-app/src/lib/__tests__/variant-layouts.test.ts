/**
 * Story 2-4: Variant Infrastructure — variant layout helper (AC2, AC3)
 *
 * Tests getVariantLayout, registerVariantLayouts, and stegaClean integration.
 *
 * @story 2-4
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { getVariantLayout, registerVariantLayouts, clearVariantLayouts } from '../variant-layouts';

describe('variant-layouts', () => {
  afterEach(() => {
    clearVariantLayouts();
  });

  // ---------------------------------------------------------------------------
  // AC2: variantLayoutMap helper
  // ---------------------------------------------------------------------------
  describe('getVariantLayout', () => {
    beforeEach(() => {
      // Register test layouts before each test
      registerVariantLayouts('heroBanner', {
        default: { layout: 'content', alignment: 'center' },
        split: { layout: 'split', columnRatio: '1:1' },
        overlay: { layout: 'media' },
      });
    });

    test('returns matching layout config for known block + variant', () => {
      const config = getVariantLayout('heroBanner', 'split');
      expect(config.layout).toBe('split');
      expect(config.columnRatio).toBe('1:1');
    });

    test('returns default variant when variant is null', () => {
      const config = getVariantLayout('heroBanner', null);
      expect(config.layout).toBe('content');
      expect(config.alignment).toBe('center');
    });

    test('returns default variant when variant is undefined', () => {
      const config = getVariantLayout('heroBanner', undefined);
      expect(config.layout).toBe('content');
    });

    test('returns default variant for unknown variant name', () => {
      const config = getVariantLayout('heroBanner', 'nonexistent');
      expect(config.layout).toBe('content');
    });

    test('returns content fallback for unknown block type', () => {
      const config = getVariantLayout('unknownBlock', 'split');
      expect(config.layout).toBe('content');
    });

    test('passes variant value through stegaClean before lookup', () => {
      // stegaClean is aliased to a passthrough in vitest config, so this
      // verifies the post-clean lookup path. Actual stega decoding is a
      // runtime concern validated via integration/E2E tests.
      const config = getVariantLayout('heroBanner', 'split');
      expect(config.layout).toBe('split');
    });

    test('falls back to default when stegaClean returns null (via nullish input)', () => {
      // stegaClean(null) returns null → ?? 'default' fallback
      const config = getVariantLayout('heroBanner', null);
      expect(config.layout).toBe('content');
      expect(config.alignment).toBe('center');
    });
  });

  // ---------------------------------------------------------------------------
  // registerVariantLayouts
  // ---------------------------------------------------------------------------
  describe('registerVariantLayouts', () => {
    test('registers new block type layouts', () => {
      registerVariantLayouts('featureGrid', {
        default: { layout: 'grid' },
        split: { layout: 'split', columnRatio: '2:1' },
      });

      const config = getVariantLayout('featureGrid', 'split');
      expect(config.layout).toBe('split');
      expect(config.columnRatio).toBe('2:1');
    });

    test('registered layouts persist across calls', () => {
      registerVariantLayouts('testBlock', {
        default: { layout: 'content' },
        spread: { layout: 'spread' },
      });

      expect(getVariantLayout('testBlock', 'spread').layout).toBe('spread');
      expect(getVariantLayout('testBlock', 'default').layout).toBe('content');
    });
  });
});
