import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import ImageGallery from '../blocks/custom/ImageGallery.astro';
import { imageGalleryFull, imageGalleryMasonry, imageGallerySingle, imageGalleryMinimal } from './__fixtures__/image-gallery';

describe('ImageGallery', () => {
  test('renders heading and captions in grid variant', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ImageGallery, { props: imageGalleryFull });

    expect(html).toContain('Photo Gallery');
    expect(html).toContain('A collection of our best work');
    expect(html).toContain('Project Alpha');
    expect(html).toContain('Project Beta');
  });

  test('renders correct column class for grid variant', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ImageGallery, { props: imageGalleryFull });

    expect(html).toContain('@5xl:grid-cols-3');
  });

  test('renders masonry variant with heading', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ImageGallery, { props: imageGalleryMasonry });

    expect(html).toContain('Masonry Gallery');
    expect(html).toContain('Photography at natural aspect ratios');
    expect(html).toContain('Landscape shot');
  });

  test('renders single variant with first image', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ImageGallery, { props: imageGallerySingle });

    expect(html).toContain('Featured Image');
    expect(html).toContain('Hero photograph');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ImageGallery, { props: imageGalleryMinimal });
    expect(html).toBeDefined();
  });
});
