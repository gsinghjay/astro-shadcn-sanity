/**
 * Author fixtures for component and page tests (Story 20.2).
 * Shapes match the ALL_AUTHORS_QUERY_RESULT and AUTHOR_BY_SLUG_QUERY_RESULT projections.
 */

/** Full author for listing card tests */
export const authorFull = {
  _id: 'author-1',
  name: 'Jane Doe',
  slug: 'jane-doe',
  role: 'Senior Developer',
  bio: 'Jane is a senior developer with 10 years of experience in web technologies.',
  image: {
    asset: {
      _id: 'image-Auth0r1Auth0r1Auth0r1Auth00-400x400-jpg',
      url: 'https://cdn.sanity.io/images/test/test/Auth0r1Auth0r1Auth0r1Auth00-400x400.jpg',
      metadata: {
        lqip: 'data:image/jpeg;base64,/9j/4AAQ',
        dimensions: { width: 400, height: 400, aspectRatio: 1 },
      },
    },
    alt: 'Jane Doe headshot',
  },
} as any;

/** Minimal author — no image, no role, no bio */
export const authorMinimal = {
  _id: 'author-2',
  name: 'John Smith',
  slug: 'john-smith',
  role: null,
  bio: null,
  image: null,
} as any;

/** Full author detail — includes credentials, socialLinks, and articles */
export const authorDetailFull = {
  _id: 'author-1',
  name: 'Jane Doe',
  slug: 'jane-doe',
  role: 'Senior Developer',
  bio: 'Jane is a senior developer with 10 years of experience in web technologies.',
  credentials: ['PhD Computer Science', 'AWS Certified'],
  image: {
    asset: {
      _id: 'image-Auth0r1Auth0r1Auth0r1Auth00-400x400-jpg',
      url: 'https://cdn.sanity.io/images/test/test/Auth0r1Auth0r1Auth0r1Auth00-400x400.jpg',
      metadata: {
        lqip: 'data:image/jpeg;base64,/9j/4AAQ',
        dimensions: { width: 400, height: 400, aspectRatio: 1 },
      },
    },
    alt: 'Jane Doe headshot',
  },
  sameAs: ['https://github.com/janedoe', 'https://linkedin.com/in/janedoe'],
  socialLinks: [
    { _key: 'sl-1', platform: 'github', url: 'https://github.com/janedoe' },
    { _key: 'sl-2', platform: 'linkedin', url: 'https://linkedin.com/in/janedoe' },
    { _key: 'sl-3', platform: 'website', url: 'https://janedoe.dev' },
  ],
  articles: [
    {
      _id: 'art-1',
      title: 'Getting Started with Astro',
      slug: 'getting-started-with-astro',
      excerpt: 'Learn how to build fast websites with Astro.',
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
        hotspot: null,
        crop: null,
      },
      author: { name: 'Jane Doe', slug: 'jane-doe' },
      publishedAt: '2026-04-10T12:00:00Z',
      category: { _id: 'cat-1', title: 'Tutorials', slug: 'tutorials' },
    },
  ],
} as any;

/** Detail author with no articles, no credentials, no social links */
export const authorDetailMinimal = {
  _id: 'author-2',
  name: 'John Smith',
  slug: 'john-smith',
  role: 'Contributor',
  bio: null,
  credentials: null,
  image: null,
  sameAs: null,
  socialLinks: null,
  articles: [],
} as any;
