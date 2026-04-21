import type { ImageGalleryBlock } from '@/lib/types';

const testImage = {
  _type: 'image' as const,
  asset: {
    _id: 'image-abc123gallery-800x600-jpg',
    url: 'https://cdn.sanity.io/images/test/test/abc123gallery-800x600.jpg',
    metadata: {
      lqip: 'data:image/jpeg;base64,/9j/2wBDAAYEBQY',
      dimensions: { _type: 'sanity.imageDimensions' as const, width: 800, height: 600, aspectRatio: 1.333 },
    },
  },
  alt: 'Gallery photo',
  hotspot: { _type: 'sanity.imageHotspot' as const, x: 0.5, y: 0.5, width: 1, height: 1 },
  crop: { _type: 'sanity.imageCrop' as const, top: 0, bottom: 0, left: 0, right: 0 },
};

const testImageLarge = {
  ...testImage,
  _type: 'image' as const,
  asset: {
    ...testImage.asset,
    _id: 'image-abc123large-1600x900-jpg',
    metadata: {
      lqip: 'data:image/jpeg;base64,/9j/2wBDAAYEBQY',
      dimensions: { _type: 'sanity.imageDimensions' as const, width: 1600, height: 900, aspectRatio: 1.778 },
    },
  },
};

export const imageGalleryFull: ImageGalleryBlock = {
  _type: 'imageGallery',
  _key: 'test-ig-1',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  variant: 'grid',
  heading: 'Photo Gallery',
  description: 'A collection of our best work',
  images: [
    { _key: 'gi-1', image: testImage, caption: 'Project Alpha', featured: false, year: 2025, category: 'web-apps' },
    { _key: 'gi-2', image: testImage, caption: 'Project Beta', featured: false, year: 2025, category: 'mobile' },
    { _key: 'gi-3', image: testImage, caption: null, featured: null, year: null, category: null },
  ],
};

export const imageGalleryWithFeatured: ImageGalleryBlock = {
  _type: 'imageGallery',
  _key: 'test-ig-featured',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  variant: 'grid',
  heading: 'Featured Gallery',
  description: 'Gallery with featured images',
  images: [
    { _key: 'gi-f1', image: testImageLarge, caption: 'Featured Project A', featured: true, year: 2026, category: 'ai-ml' },
    { _key: 'gi-f2', image: testImageLarge, caption: 'Featured Project B', featured: true, year: 2025, category: 'web-apps' },
    { _key: 'gi-r1', image: testImage, caption: 'Regular Project C', featured: false, year: 2026, category: 'mobile' },
    { _key: 'gi-r2', image: testImage, caption: 'Regular Project D', featured: false, year: 2025, category: 'data-viz' },
    { _key: 'gi-r3', image: testImage, caption: 'Regular Project E', featured: null, year: 2026, category: 'ai-ml' },
    { _key: 'gi-r4', image: testImage, caption: 'Regular Project F', featured: false, year: 2024, category: 'iot' },
  ],
};

export const imageGalleryMasonry: ImageGalleryBlock = {
  _type: 'imageGallery',
  _key: 'test-ig-2',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  variant: 'masonry',
  heading: 'Masonry Gallery',
  description: 'Photography at natural aspect ratios',
  images: [
    { _key: 'gi-4', image: testImage, caption: 'Landscape shot', featured: false, year: 2025, category: 'other' },
    { _key: 'gi-5', image: testImage, caption: null, featured: null, year: null, category: null },
  ],
};

export const imageGallerySingle: ImageGalleryBlock = {
  _type: 'imageGallery',
  _key: 'test-ig-3',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  variant: 'single',
  heading: 'Featured Image',
  description: null,
  images: [
    { _key: 'gi-6', image: testImage, caption: 'Hero photograph', featured: false, year: 2026, category: 'web-apps' },
  ],
};

export const imageGalleryMinimal: ImageGalleryBlock = {
  _type: 'imageGallery',
  _key: 'test-ig-4',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  variant: null,
  heading: null,
  description: null,
  images: null,
};
