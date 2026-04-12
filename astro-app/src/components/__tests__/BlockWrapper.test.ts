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

  test('maps spacing "large" to --block-section-py override', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { spacing: 'large' },
      slots: { default: '<p>content</p>' },
    });
    expect(html).toContain('--block-section-py');
    expect(html).toContain('calc(var(--spacing) * 20)');
  });

  test('maps spacing "small" to --block-section-py override', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { spacing: 'small' },
      slots: { default: '<p>content</p>' },
    });
    expect(html).toContain('--block-section-py');
    expect(html).toContain('calc(var(--spacing) * 6)');
  });

  test('maps spacing "none" to --block-section-py: 0px', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { spacing: 'none' },
      slots: { default: '<p>content</p>' },
    });
    expect(html).toContain('--block-section-py: 0px');
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

  test('maps backgroundVariant "hatched" to bg-hatched text-background', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { backgroundVariant: 'hatched' },
      slots: { default: '<p>content</p>' },
    });
    expect(html).toContain('bg-hatched');
    expect(html).toContain('text-background');
  });

  test('sets data-bg-theme="dark" for dark background variants', async () => {
    const container = await AstroContainer.create();
    for (const bg of ['dark', 'hatched', 'primary', 'blueprint', 'mono']) {
      const html = await container.renderToString(BlockWrapper, {
        props: { backgroundVariant: bg },
        slots: { default: '<p>content</p>' },
      });
      expect(html, `${bg} should have data-bg-theme="dark"`).toContain('data-bg-theme="dark"');
    }
  });

  test('does not set data-bg-theme for light background variants', async () => {
    const container = await AstroContainer.create();
    for (const bg of ['white', 'light', 'hatched-light', 'stripe']) {
      const html = await container.renderToString(BlockWrapper, {
        props: { backgroundVariant: bg },
        slots: { default: '<p>content</p>' },
      });
      expect(html, `${bg} should NOT have data-bg-theme`).not.toContain('data-bg-theme');
    }
  });

  test('maps backgroundVariant "hatched-light" to bg-hatched-light', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { backgroundVariant: 'hatched-light' },
      slots: { default: '<p>content</p>' },
    });
    expect(html).toContain('bg-hatched-light');
  });

  test('maps alignment "center" to text-center and data-align', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { alignment: 'center' },
      slots: { default: '<p>content</p>' },
    });
    expect(html).toContain('text-center');
    expect(html).toContain('data-align="center"');
  });

  test('maps alignment "right" to text-end and data-align', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { alignment: 'right' },
      slots: { default: '<p>content</p>' },
    });
    expect(html).toContain('text-end');
    expect(html).toContain('data-align="right"');
  });

  test('alignment "left" adds no class or data-align', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { alignment: 'left' },
      slots: { default: '<p>content</p>' },
    });
    expect(html).not.toContain('text-center');
    expect(html).not.toContain('text-end');
    expect(html).not.toContain('data-align');
  });

  test('null alignment defaults to left (no class)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockWrapper, {
      props: { alignment: null },
      slots: { default: '<p>content</p>' },
    });
    expect(html).not.toContain('text-center');
    expect(html).not.toContain('data-align');
  });
});
