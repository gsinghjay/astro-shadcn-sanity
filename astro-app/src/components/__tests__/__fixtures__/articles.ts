export const articleFull = {
  _id: 'art-1',
  title: 'Getting Started with Astro',
  slug: 'getting-started-with-astro',
  excerpt: 'Learn how to build lightning-fast websites with Astro framework.',
  featuredImage: {
    asset: {
      _id: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg',
      url: 'https://cdn.sanity.io/images/test/test/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg',
      metadata: {
        lqip: 'data:image/jpeg;base64,/9j/4AAQ',
        dimensions: { width: 2000, height: 3000, aspectRatio: 0.6667 },
      },
    },
    alt: 'Astro framework logo',
  },
  author: {
    name: 'Jane Doe',
    slug: 'jane-doe',
  },
  publishedAt: '2026-04-10T12:00:00Z',
  category: {
    title: 'Tutorials',
    slug: 'tutorials',
  },
} as any;

export const articleMinimal = {
  _id: 'art-2',
  title: 'Minimal Article',
  slug: 'minimal-article',
  excerpt: null,
  featuredImage: null,
  author: null,
  publishedAt: null,
  category: null,
} as any;

export const articleNoAuthorSlug = {
  _id: 'art-3',
  title: 'Article Without Author Slug',
  slug: 'article-without-author-slug',
  excerpt: 'This article has an author name but no slug.',
  featuredImage: null,
  author: {
    name: 'Anonymous Writer',
    slug: null,
  },
  publishedAt: '2026-03-15T10:00:00Z',
  category: {
    title: 'News',
    slug: 'news',
  },
} as any;
