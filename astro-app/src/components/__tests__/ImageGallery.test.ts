import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import ImageGallery from '../blocks/custom/ImageGallery.astro';
import {
  imageGalleryFull,
  imageGalleryWithFeatured,
  imageGalleryMasonry,
  imageGallerySingle,
  imageGalleryMinimal,
} from './__fixtures__/image-gallery';

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

  test('renders featured hero row when featured images exist', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ImageGallery, { props: imageGalleryWithFeatured });

    expect(html).toContain('gallery-featured');
    expect(html).toContain('Featured Project A');
    expect(html).toContain('Featured Project B');
    expect(html).toContain('@3xl:grid-cols-2');
  });

  test('does not render featured row when no featured images', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ImageGallery, { props: imageGalleryFull });

    expect(html).not.toContain('gallery-featured');
  });

  test('renders year filter pills for available years', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ImageGallery, { props: imageGalleryWithFeatured });

    expect(html).toContain('All Years');
    expect(html).toContain('data-filter-type="year"');
    expect(html).toContain('data-filter-value="2024"');
    expect(html).toContain('data-filter-value="2025"');
    expect(html).toContain('data-filter-value="2026"');
  });

  test('renders category filter pills for available categories', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ImageGallery, { props: imageGalleryWithFeatured });

    expect(html).toContain('All Categories');
    expect(html).toContain('data-filter-type="category"');
    expect(html).toContain('AI/ML');
    expect(html).toContain('Web Apps');
    expect(html).toContain('Mobile');
  });

  test('does not render filter pills when no year/category data', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ImageGallery, { props: imageGalleryMinimal });

    expect(html).not.toContain('gallery-filter-pill');
  });

  test('renders data-pswp-width and data-pswp-height on anchor tags', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ImageGallery, { props: imageGalleryFull });

    expect(html).toContain('data-pswp-width="800"');
    expect(html).toContain('data-pswp-height="600"');
  });

  test('renders srcset attribute on thumbnail images', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ImageGallery, { props: imageGalleryFull });

    expect(html).toContain('srcset=');
    expect(html).toContain('400w');
    expect(html).toContain('600w');
    expect(html).toContain('800w');
  });

  test('renders hover classes on anchor wrappers', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ImageGallery, { props: imageGalleryFull });

    expect(html).toContain('hover:scale-[1.02]');
    expect(html).toContain('hover:shadow-lg');
    expect(html).toContain('cursor-zoom-in');
  });

  test('renders data-year and data-category attributes on figures', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ImageGallery, { props: imageGalleryWithFeatured });

    expect(html).toContain('data-year="2026"');
    expect(html).toContain('data-year="2025"');
    expect(html).toContain('data-category="ai-ml"');
    expect(html).toContain('data-category="web-apps"');
  });

  test('renders JSON-LD with width, height, and thumbnailUrl', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ImageGallery, { props: imageGalleryFull });

    const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    expect(jsonLdMatch).not.toBeNull();

    const jsonLd = JSON.parse(jsonLdMatch![1]);
    expect(jsonLd['@type']).toBe('ImageGallery');
    expect(jsonLd.name).toBe('Photo Gallery');
    expect(jsonLd.image).toHaveLength(3);
    expect(jsonLd.image[0].width).toBe(800);
    expect(jsonLd.image[0].height).toBe(600);
    expect(jsonLd.image[0].thumbnailUrl).toBeDefined();
    expect(jsonLd.image[0].thumbnailUrl).toContain('w=400');
  });

  test('renders JSON-LD with dateCreated from earliest year', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ImageGallery, { props: imageGalleryWithFeatured });

    const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    expect(jsonLdMatch).not.toBeNull();

    const jsonLd = JSON.parse(jsonLdMatch![1]);
    expect(jsonLd.dateCreated).toContain('2024');
  });

  test('uses lqipStyle helper for blur placeholders', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ImageGallery, { props: imageGalleryFull });

    expect(html).toContain('background-image: url(data:image/jpeg;base64');
    expect(html).toContain('background-size: cover');
  });
});
