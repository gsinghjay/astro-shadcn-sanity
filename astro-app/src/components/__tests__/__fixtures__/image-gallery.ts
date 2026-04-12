import type { ImageGalleryBlock } from '@/lib/types';

const testImage = {
  _type: 'image' as const,
  asset: {
    _id: 'image-abc123gallery-800x600-jpg',
    url: 'https://cdn.sanity.io/images/test/test/abc123gallery-800x600.jpg',
    metadata: {
      lqip: 'data:image/jpeg;base64,/9j/2wBDAAYEBQY',
      dimensions: { width: 800, height: 600, aspectRatio: 1.333 },
    },
  },
  alt: 'Gallery photo',
  hotspot: { x: 0.5, y: 0.5, width: 1, height: 1 },
  crop: { top: 0, bottom: 0, left: 0, right: 0 },
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
    { _key: 'gi-1', image: testImage, caption: 'Project Alpha' },
    { _key: 'gi-2', image: testImage, caption: 'Project Beta' },
    { _key: 'gi-3', image: testImage, caption: null },
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
    { _key: 'gi-4', image: testImage, caption: 'Landscape shot' },
    { _key: 'gi-5', image: testImage, caption: null },
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
    { _key: 'gi-6', image: testImage, caption: 'Hero photograph' },
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
