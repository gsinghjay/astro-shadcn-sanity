import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import VideoEmbed from '../VideoEmbed.astro';
import BlockVideoEmbed from '../blocks/custom/VideoEmbed.astro';

describe('VideoEmbed (shared component) — facade pattern', () => {
  test('renders facade with thumbnail instead of iframe', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VideoEmbed, {
      props: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    });

    // No iframe in initial HTML
    expect(html).not.toContain('<iframe');
    // Facade elements present
    expect(html).toContain('data-youtube-facade="dQw4w9WgXcQ"');
    expect(html).toContain('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    expect(html).toContain('<button');
    expect(html).toContain('aspect-video');
  });

  test('does not render when URL is invalid', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VideoEmbed, {
      props: { url: 'https://example.com/video' },
    });

    expect(html).not.toContain('<iframe');
    expect(html).not.toContain('data-youtube-facade');
  });

  test('sets aria-label with custom title', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VideoEmbed, {
      props: { url: 'https://youtu.be/abc123', title: 'My Custom Video' },
    });

    expect(html).toContain('aria-label="Play video: My Custom Video"');
    expect(html).toContain('alt="Video thumbnail: My Custom Video"');
  });

  test('defaults title to "Video" in aria-label when not provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VideoEmbed, {
      props: { url: 'https://youtu.be/abc123' },
    });

    expect(html).toContain('aria-label="Play video: Video"');
  });

  test('thumbnail has loading="lazy" attribute', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VideoEmbed, {
      props: { url: 'https://youtu.be/abc123' },
    });

    expect(html).toContain('loading="lazy"');
  });

  test('includes script for click-to-play behavior', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VideoEmbed, {
      props: { url: 'https://youtu.be/abc123' },
    });

    // Astro transforms inline scripts into module references at build time
    expect(html).toContain('<script');
    expect(html).toContain('VideoEmbed.astro');
  });

  test('applies custom class to wrapper div', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VideoEmbed, {
      props: { url: 'https://youtu.be/abc123', class: 'my-custom-class' },
    });

    expect(html).toContain('my-custom-class');
    expect(html).toContain('aspect-video');
  });

  test('extracts video ID from youtube.com/embed/ URL', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VideoEmbed, {
      props: { url: 'https://www.youtube.com/embed/xyz789' },
    });

    expect(html).toContain('data-youtube-facade="xyz789"');
    expect(html).toContain('https://i.ytimg.com/vi/xyz789/hqdefault.jpg');
  });
});

describe('VideoEmbed (block component)', () => {
  test('renders heading and description when provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockVideoEmbed, {
      props: {
        _type: 'videoEmbed' as const,
        _key: 'test-key',
        videoUrl: 'https://youtu.be/abc123',
        heading: 'Test Video Heading',
        description: 'This is a test description',
      },
    });

    expect(html).toContain('Test Video Heading');
    expect(html).toContain('This is a test description');
    expect(html).toContain('text-muted-foreground');
  });

  test('renders video without heading or description', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockVideoEmbed, {
      props: {
        _type: 'videoEmbed' as const,
        _key: 'test-key',
        videoUrl: 'https://youtu.be/abc123',
      },
    });

    expect(html).toContain('data-youtube-facade');
  });

  test('renders facade via shared VideoEmbed component', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockVideoEmbed, {
      props: {
        _type: 'videoEmbed' as const,
        _key: 'test-key',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        heading: 'My Video Title',
      },
    });

    expect(html).toContain('data-youtube-facade="dQw4w9WgXcQ"');
    expect(html).not.toContain('<iframe');
  });

  test('renders split variant with SectionSplit layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockVideoEmbed, {
      props: {
        _type: 'videoEmbed' as const,
        _key: 'test-key',
        videoUrl: 'https://youtu.be/abc123',
        heading: 'Split Video',
        variant: 'split',
      },
    });

    expect(html).toContain('Split Video');
    expect(html).toContain('data-youtube-facade');
  });

  test('defaults to full-width variant for unknown values', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockVideoEmbed, {
      props: {
        _type: 'videoEmbed' as const,
        _key: 'test-key',
        videoUrl: 'https://youtu.be/abc123',
        heading: 'Default Variant',
        variant: 'unknown-value',
      },
    });

    expect(html).toContain('Default Variant');
    expect(html).toContain('data-youtube-facade');
  });
});
