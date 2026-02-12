import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import RichText from '../blocks/custom/RichText.astro';
import { richTextFull, richTextMinimal } from './__fixtures__/rich-text';

describe('RichText', () => {
  test('renders h2 blocks', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(RichText, {
      props: richTextFull,
    });

    // Astro adds data-astro-source-* attributes, so match content not exact tags
    expect(html).toMatch(/<h2[^>]*>About Our Mission<\/h2>/);
  });

  test('renders h3 blocks', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(RichText, {
      props: richTextFull,
    });

    expect(html).toMatch(/<h3[^>]*>Our Values<\/h3>/);
  });

  test('renders normal paragraphs', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(RichText, {
      props: richTextFull,
    });

    expect(html).toContain('We empower women in technology.');
  });

  test('handles null content without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(RichText, {
      props: richTextMinimal,
    });
    expect(html).toBeDefined();
  });
});
