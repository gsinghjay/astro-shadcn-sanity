import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import SanityImage from '../ui/sanity-image.astro';
import { imageWithLqip, imageWithoutLqip, imageNullMetadata } from './__fixtures__/sanity-image';

describe('SanityImage', () => {
  test('renders img with optimized URL containing auto=format and dimensions', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SanityImage, {
      props: { image: imageWithLqip, width: 800, height: 600 },
    });

    expect(html).toContain('auto=format');
    expect(html).toContain('w=800');
    expect(html).toContain('h=600');
    expect(html).toContain('alt="A test image with LQIP"');
  });

  test('renders LQIP blur placeholder when metadata.lqip is present', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SanityImage, {
      props: { image: imageWithLqip, width: 800, height: 600 },
    });

    expect(html).toContain('data:image/jpeg;base64,/9j/2wBDAAYEBQY');
    expect(html).toContain('background-image');
    expect(html).toContain('background-size: cover');
  });

  test('renders without LQIP wrapper when lqip is null', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SanityImage, {
      props: { image: imageWithoutLqip, width: 400, height: 300 },
    });

    expect(html).not.toContain('background-image');
    expect(html).toContain('alt="Image without LQIP"');
    expect(html).toContain('auto=format');
  });

  test('falls back gracefully when metadata is null', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SanityImage, {
      props: { image: imageNullMetadata, width: 200, height: 200 },
    });

    expect(html).not.toContain('background-image');
    expect(html).toContain('auto=format');
    // Astro renders empty alt as `alt` (boolean-style) rather than `alt=""`
    expect(html).toContain(' alt');
    expect(html).not.toContain('alt="Image');
  });

  test('defaults to loading="lazy" and decoding="async"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SanityImage, {
      props: { image: imageWithLqip, width: 800, height: 600 },
    });

    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
  });

  test('allows overriding loading and fetchpriority', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SanityImage, {
      props: {
        image: imageWithLqip,
        width: 1920,
        height: 1080,
        loading: 'eager',
        fetchpriority: 'high',
      },
    });

    expect(html).toContain('loading="eager"');
    expect(html).toContain('fetchpriority="high"');
  });

  test('passes through class attribute', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SanityImage, {
      props: {
        image: imageWithLqip,
        width: 800,
        height: 600,
        class: 'w-full h-full object-cover',
      },
    });

    expect(html).toContain('w-full h-full object-cover');
  });
});
