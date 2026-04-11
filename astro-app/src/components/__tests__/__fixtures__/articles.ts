import type {
  ARTICLE_BY_SLUG_QUERY_RESULT,
  SITE_SETTINGS_QUERY_RESULT,
} from '@/sanity.types';

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

/* ------------------------------------------------------------------ */
/*  Story 19.6 — Article JSON-LD fixtures                             */
/* ------------------------------------------------------------------ */

// Fully-populated article matching the ARTICLE_BY_SLUG_QUERY shape.
// category.slug 'blog' drives the default Article branch.
//
// Typed via `satisfies NonNullable<ARTICLE_BY_SLUG_QUERY_RESULT>` so any future
// TypeGen drift (new/removed/renamed fields) breaks compilation and forces
// reconciliation. The `body` field's complex union is narrowed via an explicit
// element-type cast on an empty array (the only field whose full union we'd
// otherwise have to reproduce exhaustively).
export const articleDetailFull = {
  _id: 'art-detail-1',
  title: 'Deep Dive: Astro Server Islands',
  slug: 'deep-dive-astro-server-islands',
  excerpt:
    'How Astro 5 server islands unlock dynamic content inside static pages.',
  featuredImage: {
    asset: {
      _id: 'image-A1b2c3D4e5f6G7h8i9J0-1600x900-jpg',
      url: 'https://cdn.sanity.io/images/test/test/A1b2c3D4e5f6G7h8i9J0-1600x900.jpg',
      metadata: {
        lqip: 'data:image/jpeg;base64,mockLqip',
        dimensions: {
          _type: 'sanity.imageDimensions' as const,
          width: 1600,
          height: 900,
          aspectRatio: 1.7778,
        },
      },
    },
    alt: 'Astro server islands diagram',
  },
  body: [] as NonNullable<ARTICLE_BY_SLUG_QUERY_RESULT>['body'],
  author: {
    name: 'Alex Singh',
    slug: 'alex-singh',
    role: 'Senior Developer',
    image: null,
    sameAs: ['https://github.com/alexsingh', 'https://twitter.com/alexsingh'],
  },
  publishedAt: '2026-04-11T09:00:00.000Z',
  updatedAt: '2026-04-11T15:30:00.000Z',
  category: { title: 'Blog', slug: 'blog' },
  tags: ['astro', 'server-islands'],
  relatedArticles: null,
  seo: null,
} satisfies NonNullable<ARTICLE_BY_SLUG_QUERY_RESULT>;

// News-category variant — drives the NewsArticle branch.
export const articleDetailNews = {
  ...articleDetailFull,
  _id: 'art-detail-2',
  title: 'Program Wins 2026 Award',
  slug: 'program-wins-2026-award',
  category: { title: 'News', slug: 'news' },
} satisfies NonNullable<ARTICLE_BY_SLUG_QUERY_RESULT>;

/**
 * Minimal but valid SITE_SETTINGS_QUERY_RESULT. Every field from the query is
 * present (or null where the type allows).
 */
export const siteSettingsFull = {
  siteName: 'Test Org',
  siteDescription: 'Test description',
  logo: {
    asset: {
      _id: 'image-Log0000Log0000Log0000Log00-600x60-png',
      url: 'https://cdn.sanity.io/images/test/test/Log0000Log0000Log0000Log00-600x60.png',
      metadata: {
        lqip: null,
        dimensions: {
          _type: 'sanity.imageDimensions' as const,
          width: 600,
          height: 60,
          aspectRatio: 10,
        },
      },
    },
    alt: 'Test Org logo',
  },
  logoLight: null,
  navigationItems: null,
  ctaButton: null,
  footerContent: null,
  socialLinks: null,
  contactInfo: null,
  footerLinks: null,
  resourceLinks: null,
  programLinks: null,
  currentSemester: null,
  aiSearch: null,
} satisfies NonNullable<SITE_SETTINGS_QUERY_RESULT>;

/**
 * No-logo variant — drives the `publisher.logo` omission branch.
 */
export const siteSettingsNoLogo = {
  ...siteSettingsFull,
  logo: null,
} satisfies NonNullable<SITE_SETTINGS_QUERY_RESULT>;
