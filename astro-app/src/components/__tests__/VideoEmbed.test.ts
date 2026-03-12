import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import VideoEmbed from '../VideoEmbed.astro';
import BlockVideoEmbed from '../blocks/custom/VideoEmbed.astro';

describe('VideoEmbed (shared component)', () => {
  test('renders iframe with correct YouTube embed URL', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VideoEmbed, {
      props: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    });

    expect(html).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"');
    expect(html).toContain('<iframe');
    expect(html).toContain('aspect-video');
  });

  test('does not render when URL is invalid', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VideoEmbed, {
      props: { url: 'https://example.com/video' },
    });

    expect(html).not.toContain('<iframe');
    expect(html).not.toContain('aspect-video');
  });

  test('sets custom title attribute', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VideoEmbed, {
      props: { url: 'https://youtu.be/abc123', title: 'My Custom Video' },
    });

    expect(html).toContain('title="My Custom Video"');
  });

  test('defaults title to "Video" when not provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VideoEmbed, {
      props: { url: 'https://youtu.be/abc123' },
    });

    expect(html).toContain('title="Video"');
  });

  test('has loading="lazy" attribute', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VideoEmbed, {
      props: { url: 'https://youtu.be/abc123' },
    });

    expect(html).toContain('loading="lazy"');
  });

  test('has correct allow attribute', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VideoEmbed, {
      props: { url: 'https://youtu.be/abc123' },
    });

    expect(html).toContain('allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"');
  });

  test('has allowfullscreen attribute', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VideoEmbed, {
      props: { url: 'https://youtu.be/abc123' },
    });

    expect(html).toContain('allowfullscreen');
  });

  test('applies custom class to wrapper div', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VideoEmbed, {
      props: { url: 'https://youtu.be/abc123', class: 'my-custom-class' },
    });

    expect(html).toContain('my-custom-class');
    expect(html).toContain('aspect-video');
  });
});

describe('VideoEmbed (block component)', () => {
  test('renders caption when provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockVideoEmbed, {
      props: {
        _type: 'videoEmbed' as const,
        _key: 'test-key',
        videoUrl: 'https://youtu.be/abc123',
        caption: 'This is a test caption',
      },
    });

    expect(html).toContain('This is a test caption');
    expect(html).toContain('text-muted-foreground');
  });

  test('does not render caption when not provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockVideoEmbed, {
      props: {
        _type: 'videoEmbed' as const,
        _key: 'test-key',
        videoUrl: 'https://youtu.be/abc123',
      },
    });

    expect(html).toContain('<iframe');
    expect(html).not.toContain('text-muted-foreground');
  });

  test('renders video via shared VideoEmbed component', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockVideoEmbed, {
      props: {
        _type: 'videoEmbed' as const,
        _key: 'test-key',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'My Video Title',
      },
    });

    expect(html).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"');
    expect(html).toContain('title="My Video Title"');
  });
});
