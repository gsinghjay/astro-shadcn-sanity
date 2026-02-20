import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import TextWithImage from '../blocks/custom/TextWithImage.astro';
import { textWithImageFull, textWithImageMinimal } from './__fixtures__/text-with-image';

describe('TextWithImage', () => {
  test('renders heading and content', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TextWithImage, {
      props: textWithImageFull,
    });

    expect(html).toContain('Our Story');
  });

  test('renders image with alt text and optimized URL', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TextWithImage, {
      props: textWithImageFull,
    });

    expect(html).toContain('Team photo');
    expect(html).toContain('auto=format');
    expect(html).toContain('w=800');
    expect(html).toContain('h=600');
  });

  test('renders LQIP blur placeholder on image', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TextWithImage, {
      props: textWithImageFull,
    });

    expect(html).toContain('data:image/jpeg;base64,/9j/2wBDAAkGBw');
    expect(html).toContain('background-image');
    expect(html).toContain('background-size: cover');
  });

  test('image has loading="lazy"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TextWithImage, {
      props: textWithImageFull,
    });

    expect(html).toContain('loading="lazy"');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TextWithImage, {
      props: textWithImageMinimal,
    });
    expect(html).toBeDefined();
  });
});
