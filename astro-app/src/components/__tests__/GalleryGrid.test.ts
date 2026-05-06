import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect, vi } from 'vitest';
import GalleryGrid from '../blocks/custom/_partials/GalleryGrid.astro';
import type { GalleryItem } from '@/lib/sanity';

vi.mock('@/lib/sanity', () => ({
  getSiteSettings: vi.fn().mockResolvedValue({
    siteName: 'YWCC Industry Capstone',
  }),
}));

const baseAsset = {
  _id: 'image-test-800x600-jpg',
  url: 'https://cdn.sanity.io/images/test/test/test-800x600.jpg',
  metadata: {
    lqip: 'data:image/jpeg;base64,/9j/2wBDAAYEBQY',
    dimensions: { width: 800, height: 600 },
  },
};

function makeItem(overrides: Partial<GalleryItem> = {}): GalleryItem {
  return {
    _key: 'gi-1',
    image: { asset: { ...baseAsset }, alt: 'Photo' },
    caption: null,
    featured: null,
    year: null,
    category: null,
    ...overrides,
  };
}

describe('GalleryGrid', () => {
  test('accepts GalleryItem[] directly and renders thumbnails', async () => {
    const container = await AstroContainer.create();
    const items: GalleryItem[] = [
      makeItem({ _key: 'a', caption: 'Cap A' }),
      makeItem({ _key: 'b', caption: 'Cap B' }),
    ];
    const html = await container.renderToString(GalleryGrid, {
      props: { items, variant: 'grid', heading: 'My Gallery', description: 'Desc', idSuffix: 'unit' },
    });
    expect(html).toContain('Cap A');
    expect(html).toContain('Cap B');
    expect(html).toContain('My Gallery');
    expect(html).toContain('id="gallery-unit"');
    // JSON-LD ImageGallery.creator is sourced from siteSettings.siteName (AC14).
    expect(html).toMatch(/"creator":\s*\{[^}]*"name":\s*"YWCC Industry Capstone"/);
  });

  test('empty items renders no JSON-LD and no figures', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(GalleryGrid, {
      props: { items: [], variant: 'grid', heading: 'Empty', description: null },
    });
    expect(html).not.toMatch(/<script type="application\/ld\+json">/);
    expect(html).not.toContain('<figure');
  });

  test('bare=true (grid) skips Section/SectionContent wrapper', async () => {
    const container = await AstroContainer.create();
    const items = [makeItem({ _key: 'a' })];
    const wrapped = await container.renderToString(GalleryGrid, {
      props: { items, variant: 'grid', heading: 'H', bare: false },
    });
    const bare = await container.renderToString(GalleryGrid, {
      props: { items, variant: 'grid', heading: 'H', bare: true },
    });
    // Section adds a <section> tag — bare mode shouldn't have one wrapping the gallery
    const wrappedSectionCount = (wrapped.match(/<section/g) || []).length;
    const bareSectionCount = (bare.match(/<section/g) || []).length;
    expect(wrappedSectionCount).toBeGreaterThan(bareSectionCount);
    // Both must still render the gallery container
    expect(bare).toContain('class="pswp-gallery"');
  });

  test('masonry variant renders SectionMasonry markup', async () => {
    const container = await AstroContainer.create();
    const items = [makeItem({ _key: 'a' })];
    const html = await container.renderToString(GalleryGrid, {
      props: { items, variant: 'masonry', heading: 'Masonry' },
    });
    // SectionMasonry uses the `pswp-gallery contents` class on the inner div
    expect(html).toContain('pswp-gallery contents');
  });

  test('single variant renders only the first item with 1200w/1600w srcset', async () => {
    const container = await AstroContainer.create();
    const items = [
      makeItem({ _key: 'a', caption: 'first' }),
      makeItem({ _key: 'b', caption: 'second' }),
    ];
    const html = await container.renderToString(GalleryGrid, {
      props: { items, variant: 'single', heading: 'Single' },
    });
    // Strip the JSON-LD payload (which includes every item) so we assert
    // against the rendered DOM only.
    const rendered = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
    expect(rendered).toContain('<figcaption');
    expect(rendered).toMatch(/<figcaption[^>]*>first<\/figcaption>/);
    expect(rendered).not.toMatch(/<figcaption[^>]*>second<\/figcaption>/);
    // Single variant always emits the wide srcset
    expect(rendered).toContain('1200w');
    expect(rendered).toContain('1600w');
  });

  test('renders data-year and data-category attributes from item metadata', async () => {
    const container = await AstroContainer.create();
    const items = [
      makeItem({ _key: 'a', year: 2026, category: 'web-apps' }),
      makeItem({ _key: 'b', year: 2025, category: 'mobile' }),
    ];
    const html = await container.renderToString(GalleryGrid, {
      props: { items, variant: 'grid', heading: null },
    });
    expect(html).toContain('data-year="2026"');
    expect(html).toContain('data-year="2025"');
    expect(html).toContain('data-category="web-apps"');
    expect(html).toContain('data-category="mobile"');
  });

  test('separates featured items into the gallery-featured row', async () => {
    const container = await AstroContainer.create();
    const items = [
      makeItem({ _key: 'f', caption: 'starred', featured: true }),
      makeItem({ _key: 'r', caption: 'regular', featured: false }),
    ];
    const html = await container.renderToString(GalleryGrid, {
      props: { items, variant: 'grid', heading: null },
    });
    expect(html).toContain('gallery-featured');
    expect(html).toContain('starred');
    expect(html).toContain('regular');
  });
});
