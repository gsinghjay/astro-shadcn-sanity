import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import TextWithImage from '../blocks/custom/TextWithImage.astro';
import { textWithImageFull, textWithImageFloating, textWithImageBrutalist, textWithImageMinimal } from './__fixtures__/text-with-image';

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

  test('floating variant uses shadow-sm not shadow-lg', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TextWithImage, {
      props: textWithImageFloating,
    });

    expect(html).toContain('shadow-sm');
    expect(html).not.toContain('shadow-lg');
  });

  test('floating variant has no rounded-lg', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TextWithImage, {
      props: textWithImageFloating,
    });

    expect(html).not.toContain('rounded-lg');
  });

  test('floating variant images have no rounded class', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TextWithImage, {
      props: textWithImageFloating,
    });

    // Images should not have standalone "rounded" class
    expect(html).not.toMatch(/class="[^"]*\brounded\b[^"]*"/);
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TextWithImage, {
      props: textWithImageMinimal,
    });
    expect(html).toBeDefined();
  });

  test('brutalist variant renders thick border frame on image', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TextWithImage, {
      props: textWithImageBrutalist,
    });

    expect(html).toContain('border-2');
    expect(html).toContain('border-border');
  });

  test('brutalist variant renders monospace caption from alt text', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TextWithImage, {
      props: textWithImageBrutalist,
    });

    expect(html).toContain('font-mono');
    expect(html).toContain('Students presenting capstone project');
  });

  test('brutalist variant renders vertical rule on text column', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TextWithImage, {
      props: textWithImageBrutalist,
    });

    expect(html).toContain('border-l-4');
    expect(html).toContain('pl-8');
  });

  test('brutalist variant renders heading and content', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TextWithImage, {
      props: textWithImageBrutalist,
    });

    expect(html).toContain('Where Industry Meets Academia');
    expect(html).toContain('Bridging theory and practice.');
  });
});
