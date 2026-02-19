import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import BlockWrapper from '../BlockWrapper.astro';

describe('BlockWrapper', () => {
  test('renders slot content', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { backgroundVariant: 'white', spacing: 'default', maxWidth: 'default' },
      slots: { default: '<p>Hello</p>' },
    });
    expect(html).toContain('<p>Hello</p>');
  });

  test('maps backgroundVariant "dark" to bg-foreground', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { backgroundVariant: 'dark' },
      slots: { default: '<p>content</p>' },
    });
    expect(html).toContain('bg-foreground');
    expect(html).toContain('text-background');
  });

  test('maps backgroundVariant "primary" to bg-primary', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { backgroundVariant: 'primary' },
      slots: { default: '<p>content</p>' },
    });
    expect(html).toContain('bg-primary');
    expect(html).toContain('text-primary-foreground');
  });

  test('maps backgroundVariant "light" to bg-muted', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { backgroundVariant: 'light' },
      slots: { default: '<p>content</p>' },
    });
    expect(html).toContain('bg-muted');
  });

  test('backgroundVariant "white" adds no bg class', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { backgroundVariant: 'white' },
      slots: { default: '<p>content</p>' },
    });
    expect(html).not.toContain('bg-');
  });

  test('null backgroundVariant defaults to "white" (no bg class)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { backgroundVariant: null },
      slots: { default: '<p>content</p>' },
    });
    expect(html).not.toContain('bg-');
  });

  test('maps spacing "large" to py-20 md:py-24', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { spacing: 'large' },
      slots: { default: '<p>content</p>' },
    });
    expect(html).toContain('py-20');
    expect(html).toContain('md:py-24');
  });

  test('maps spacing "small" to py-6 md:py-8', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { spacing: 'small' },
      slots: { default: '<p>content</p>' },
    });
    expect(html).toContain('py-6');
    expect(html).toContain('md:py-8');
  });

  test('maps spacing "none" to py-0', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { spacing: 'none' },
      slots: { default: '<p>content</p>' },
    });
    expect(html).toContain('py-0');
  });

  test('maps maxWidth "narrow" to max-w-4xl', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { maxWidth: 'narrow' },
      slots: { default: '<p>content</p>' },
    });
    expect(html).toContain('max-w-4xl');
    expect(html).toContain('mx-auto');
  });

  test('maps maxWidth "full" to max-w-none', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { maxWidth: 'full' },
      slots: { default: '<p>content</p>' },
    });
    expect(html).toContain('max-w-none');
  });

  test('all props null defaults gracefully', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { backgroundVariant: null, spacing: null, maxWidth: null },
      slots: { default: '<p>content</p>' },
    });
    expect(html).toContain('<p>content</p>');
    // defaults: white (no bg), default spacing (no extra padding), default maxWidth (no constraint)
    expect(html).not.toContain('bg-');
    expect(html).not.toContain('py-');
    expect(html).not.toContain('max-w-');
  });

  test('renders data-gtm-section with blockType', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { blockType: 'heroBanner' },
      slots: { default: '<p>content</p>' },
    });
    expect(html).toContain('data-gtm-section="heroBanner"');
  });

  test('omits data-gtm-section when blockType not provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: {},
      slots: { default: '<p>content</p>' },
    });
    expect(html).not.toContain('data-gtm-section');
  });
});
