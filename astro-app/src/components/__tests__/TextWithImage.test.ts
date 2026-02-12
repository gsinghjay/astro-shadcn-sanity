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

  test('renders image with alt text', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TextWithImage, {
      props: textWithImageFull,
    });

    expect(html).toContain('Team photo');
    expect(html).toContain('https://cdn.sanity.io/test/story.jpg');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TextWithImage, {
      props: textWithImageMinimal,
    });
    expect(html).toBeDefined();
  });
});
