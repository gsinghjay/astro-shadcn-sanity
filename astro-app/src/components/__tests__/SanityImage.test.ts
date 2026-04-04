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

  // ─── srcset generation ──────────────────────────────────────────────
  test('generates srcset with default widths (640, 960, 1280, 1920)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SanityImage, {
      props: { image: imageWithLqip, width: 1920, height: 1080 },
    });

    expect(html).toContain('srcset="');
    expect(html).toContain('640w');
    expect(html).toContain('960w');
    expect(html).toContain('1280w');
    expect(html).toContain('1920w');
  });

  test('srcset URLs contain auto=format and correct width params', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SanityImage, {
      props: { image: imageWithLqip, width: 1920, height: 1080 },
    });

    // Each srcset entry should use Sanity CDN URLs with auto=format
    expect(html).toContain('w=640');
    expect(html).toContain('w=960');
    expect(html).toContain('w=1280');
    expect(html).toContain('w=1920');
    // Height should be proportional: 640 * 1080/1920 = 360
    expect(html).toContain('h=360');
  });

  test('accepts custom srcsetWidths prop', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SanityImage, {
      props: {
        image: imageWithLqip,
        width: 960,
        height: 1080,
        srcsetWidths: [480, 640, 960],
      },
    });

    expect(html).toContain('480w');
    expect(html).toContain('640w');
    expect(html).toContain('960w');
    expect(html).not.toContain('1280w');
    expect(html).not.toContain('1920w');
  });

  test('defaults sizes to 100vw when not provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SanityImage, {
      props: { image: imageWithLqip, width: 800, height: 600 },
    });

    expect(html).toContain('sizes="100vw"');
  });

  test('allows overriding sizes prop', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SanityImage, {
      props: {
        image: imageWithLqip,
        width: 800,
        height: 600,
        sizes: '(max-width: 768px) 100vw, 50vw',
      },
    });

    expect(html).toContain('sizes="(max-width: 768px) 100vw, 50vw"');
  });
});
