import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import FeatureGrid from '../blocks/custom/FeatureGrid.astro';
import { featureGridFull, featureGridMinimal } from './__fixtures__/feature-grid';

describe('FeatureGrid', () => {
  test('renders heading and feature items', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FeatureGrid, {
      props: featureGridFull,
    });

    expect(html).toContain('What We Offer');
    expect(html).toContain('Web Development');
    expect(html).toContain('Learn modern web technologies');
    expect(html).toContain('Community');
  });

  test('renders icons when provided, numbers as fallback', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FeatureGrid, {
      props: featureGridFull,
    });

    // Items with icons should render SVG, not numbered boxes
    expect(html).toContain('<svg');
    expect(html).not.toContain('>01<');
  });

  test('renders numbered items when icons are null', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FeatureGrid, {
      props: {
        ...featureGridFull,
        items: featureGridFull.items?.map(item => ({ ...item, icon: null })) ?? [],
      },
    });

    expect(html).toContain('01');
    expect(html).toContain('02');
  });

  test('numbered icon boxes use 1px border (border, not border-2)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FeatureGrid, {
      props: featureGridFull,
    });

    expect(html).toContain('border border-foreground');
    expect(html).not.toContain('border-2');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FeatureGrid, {
      props: featureGridMinimal,
    });
    expect(html).toBeDefined();
  });

  test('hatched variant applies bg-hatched on Section', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FeatureGrid, {
      props: { ...featureGridFull, backgroundVariant: 'hatched' },
    });

    expect(html).toContain('bg-hatched');
    expect(html).toContain('text-background');
  });

  test('hatched-light variant applies bg-hatched-light on Section', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FeatureGrid, {
      props: { ...featureGridFull, backgroundVariant: 'hatched-light' },
    });

    expect(html).toContain('bg-hatched-light');
    expect(html).toContain('text-foreground');
  });
});
