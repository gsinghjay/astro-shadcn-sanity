/**
 * Fixtures for SanityImage component tests.
 * Shapes match GROQ query results where asset is dereferenced: asset->{ _id, url, metadata { lqip, dimensions } }
 */

export const imageWithLqip = {
  asset: {
    _id: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg',
    url: 'https://cdn.sanity.io/images/test/test/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg',
    metadata: {
      lqip: 'data:image/jpeg;base64,/9j/2wBDAAYEBQY',
      dimensions: { width: 2000, height: 3000, aspectRatio: 0.6667 },
    },
  },
  alt: 'A test image with LQIP',
};

export const imageWithoutLqip = {
  asset: {
    _id: 'image-abc123-800x600-png',
    url: 'https://cdn.sanity.io/images/test/test/abc123-800x600.png',
    metadata: {
      lqip: null,
      dimensions: { width: 800, height: 600, aspectRatio: 1.3333 },
    },
  },
  alt: 'Image without LQIP',
};

export const imageNullMetadata = {
  asset: {
    _id: 'image-xyz789-400x400-jpg',
    url: 'https://cdn.sanity.io/images/test/test/xyz789-400x400.jpg',
    metadata: null,
  },
  alt: null,
};
