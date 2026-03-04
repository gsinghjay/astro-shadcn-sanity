/**
 * Story 2-4: Variant Infrastructure — VariantLayout component (AC3, AC4)
 *
 * Tests that VariantLayout renders the correct Section primitive
 * based on the variant → layout config mapping.
 *
 * @story 2-4
 */
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import VariantLayout from '../VariantLayout.astro';
import { registerVariantLayouts, clearVariantLayouts } from '@/lib/variant-layouts';

describe('VariantLayout', () => {
  beforeEach(() => {
    registerVariantLayouts('testBlock', {
      default: { layout: 'content', alignment: 'center' },
      split: { layout: 'split', columnRatio: '1:1' },
      spread: { layout: 'spread' },
      grid: { layout: 'grid' },
      masonry: { layout: 'masonry' },
      overlay: { layout: 'media' },
    });
  });

  afterEach(() => {
    clearVariantLayouts();
  });

  test('renders SectionContent for default/content layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VariantLayout, {
      props: { blockType: 'testBlock', variant: 'default' },
      slots: { content: '<h1>Hello</h1>' },
    });

    expect(html).toContain('<h1>Hello</h1>');
    // SectionContent renders with flex flex-col
    expect(html).toContain('flex-col');
  });

  test('renders SectionSplit for split layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VariantLayout, {
      props: { blockType: 'testBlock', variant: 'split' },
      slots: {
        content: '<h1>Text</h1>',
        media: '<img src="test.jpg" alt="test" />',
      },
    });

    expect(html).toContain('data-slot="section-split"');
    expect(html).toContain('<h1>Text</h1>');
    expect(html).toContain('test.jpg');
  });

  test('renders SectionSpread for spread layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VariantLayout, {
      props: { blockType: 'testBlock', variant: 'spread' },
      slots: { content: '<p>Spread content</p>' },
    });

    // SectionSpread uses justify-between
    expect(html).toContain('justify-between');
    expect(html).toContain('<p>Spread content</p>');
  });

  test('renders SectionGrid for grid layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VariantLayout, {
      props: { blockType: 'testBlock', variant: 'grid' },
      slots: { content: '<div>Grid item</div>' },
    });

    // SectionGrid renders with "grid w-full gap-6" classes
    expect(html).toMatch(/class="[^"]*grid w-full gap-6[^"]*"/);
    expect(html).toContain('<div>Grid item</div>');
  });

  test('renders SectionMasonry for masonry layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VariantLayout, {
      props: { blockType: 'testBlock', variant: 'masonry' },
      slots: { content: '<div>Masonry item</div>' },
    });

    // SectionMasonry renders with "columns-" classes
    expect(html).toMatch(/class="[^"]*columns-/);
    expect(html).toContain('<div>Masonry item</div>');
  });

  test('renders media layout with data-slot="variant-media"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VariantLayout, {
      props: { blockType: 'testBlock', variant: 'overlay' },
      slots: {
        content: '<h1>Overlay</h1>',
        media: '<img src="bg.jpg" alt="bg" />',
      },
    });

    expect(html).toContain('data-slot="variant-media"');
    expect(html).toContain('<h1>Overlay</h1>');
    expect(html).toContain('bg.jpg');
    // Contrast overlay for accessibility
    expect(html).toContain('bg-black/40');
  });

  test('falls back to content layout for unknown block type (AC4)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VariantLayout, {
      props: { blockType: 'unknownBlock', variant: 'default' },
      slots: { content: '<p>Fallback</p>' },
    });

    expect(html).toContain('flex-col');
    expect(html).toContain('<p>Fallback</p>');
  });

  test('falls back to content layout for null variant (AC4)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VariantLayout, {
      props: { blockType: 'testBlock', variant: null },
      slots: { content: '<p>Default</p>' },
    });

    expect(html).toContain('flex-col');
    expect(html).toContain('<p>Default</p>');
  });

  test('renders multiple named slots', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VariantLayout, {
      props: { blockType: 'testBlock', variant: 'split' },
      slots: {
        content: '<h1>Heading</h1>',
        media: '<img src="photo.jpg" alt="photo" />',
        actions: '<a href="/go">Go</a>',
        supplementary: '<p>Extra info</p>',
      },
    });

    expect(html).toContain('<h1>Heading</h1>');
    expect(html).toContain('photo.jpg');
    expect(html).toContain('/go');
    expect(html).toContain('Extra info');
  });
});
