import type { ArticleListBlock } from '@/lib/types';
import type { Article } from '@/lib/sanity';

export const articleListFull: ArticleListBlock = {
  _type: 'articleList',
  _key: 'test-al-1',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  variant: 'grid',
  heading: 'Latest Articles',
  description: 'Stay up to date with our news',
  contentType: 'all',
  categories: null,
  limit: 6,
  ctaButtons: [
    { _key: 'btn-1', text: 'View All Articles', url: '/articles', variant: 'default' },
  ],
};

export const articleListSplitFeatured: ArticleListBlock = {
  _type: 'articleList',
  _key: 'test-al-2',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  variant: 'split-featured',
  heading: 'Featured Articles',
  description: 'Our top picks',
  contentType: 'by-category',
  categories: [{ _id: 'cat-featured' }],
  limit: 4,
  ctaButtons: null,
};

export const articleListVariantList: ArticleListBlock = {
  _type: 'articleList',
  _key: 'test-al-3',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  variant: 'list',
  heading: 'News',
  description: 'This should be hidden in list variant',
  contentType: 'all',
  categories: null,
  limit: 10,
  ctaButtons: [
    { _key: 'btn-2', text: 'More News', url: '/news', variant: 'outline' },
  ],
};

export const articleListMinimal: ArticleListBlock = {
  _type: 'articleList',
  _key: 'test-al-4',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  variant: null,
  heading: null,
  description: null,
  contentType: null,
  categories: null,
  limit: null,
  ctaButtons: null,
};

export const articleListBrutalist: ArticleListBlock = {
  _type: 'articleList',
  _key: 'test-al-5',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  variant: 'brutalist',
  heading: 'Dispatches',
  description: 'Field reports from the edge of the web.',
  contentType: 'all',
  categories: null,
  limit: 6,
  ctaButtons: [
    { _key: 'btn-brutal', text: 'Read the archive', url: '/articles', variant: 'default' },
  ],
};

export const articleListMagazine: ArticleListBlock = {
  _type: 'articleList',
  _key: 'test-al-6',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  variant: 'magazine',
  heading: 'The Long Read',
  description: 'Editor-picked features of the week.',
  contentType: 'all',
  categories: null,
  limit: 6,
  ctaButtons: [
    { _key: 'btn-mag', text: 'Browse all issues', url: '/articles', variant: 'outline' },
  ],
};

/**
 * Sample article fixtures for rendering tests.
 * Uses minimal image metadata (no real Sanity asset refs) so urlFor() will fail
 * gracefully via safeUrlFor() and return null — exercises the img-optional path.
 */
export const sampleArticles: Article[] = [
  {
    _id: 'article-1',
    title: 'Astro 5 Released',
    slug: 'astro-5-released',
    excerpt: 'The next major version of Astro is here with exciting new features.',
    featuredImage: null,
    author: { name: 'Jane Doe', slug: 'jane-doe' },
    publishedAt: '2026-04-01T12:00:00Z',
    category: { _id: 'cat-news', title: 'News', slug: 'news' },
  },
  {
    _id: 'article-2',
    title: 'Sanity Visual Editing Tips',
    slug: 'sanity-visual-editing-tips',
    excerpt: 'Get the most out of the Sanity Presentation tool with these tips.',
    featuredImage: null,
    author: { name: 'John Smith', slug: 'john-smith' },
    publishedAt: '2026-03-25T10:00:00Z',
    category: { _id: 'cat-blog', title: 'Blog', slug: 'blog' },
  },
  {
    _id: 'article-3',
    title: 'Why CSS Container Queries Matter',
    slug: 'css-container-queries',
    excerpt: 'Container queries finally unlock truly component-driven responsive design.',
    featuredImage: null,
    author: { name: 'Alex Kim', slug: 'alex-kim' },
    publishedAt: '2026-03-10T09:00:00Z',
    category: { _id: 'cat-blog', title: 'Blog', slug: 'blog' },
  },
] as unknown as Article[];

/**
 * Sample article fixtures WITH real Sanity asset refs so `safeUrlFor()` parses
 * successfully. Use these for tests that assert image markup
 * (width/height/loading/LQIP) across the grid and split-featured variants.
 */
export const sampleArticlesWithImages: Article[] = [
  {
    _id: 'article-img-1',
    title: 'Featured Article With Image',
    slug: 'featured-with-image',
    excerpt: 'This article has a featured image rendered at variant-specific dimensions.',
    featuredImage: {
      asset: {
        _id: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg',
        // Cosmetic: project/dataset in this URL matches the sanity-client mock
        // in src/lib/__tests__/__mocks__/sanity-client.ts (test-project/test-dataset).
        // The `urlFor()` builder derives the URL from asset._id + client config,
        // not from this field — kept in sync only to avoid reader confusion.
        url: 'https://cdn.sanity.io/images/test-project/test-dataset/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg',
        metadata: {
          lqip: 'data:image/jpeg;base64,/9j/4AAQFeatured',
          dimensions: { width: 2000, height: 3000, aspectRatio: 0.6667 },
        },
      },
      alt: 'Featured article illustration',
      hotspot: null,
      crop: null,
    },
    author: { name: 'Jane Doe', slug: 'jane-doe' },
    publishedAt: '2026-04-01T12:00:00Z',
    category: { _id: 'cat-news', title: 'News', slug: 'news' },
  },
  {
    _id: 'article-img-2',
    title: 'Second Article With Image',
    slug: 'second-with-image',
    excerpt: 'A second article so the split-featured variant has both featured + side cards.',
    featuredImage: {
      asset: {
        _id: 'image-Xk7mDaTH2sjqfOBf9pgYrQ-1600x900-jpg',
        url: 'https://cdn.sanity.io/images/test-project/test-dataset/Xk7mDaTH2sjqfOBf9pgYrQ-1600x900.jpg',
        metadata: {
          lqip: 'data:image/jpeg;base64,/9j/4AAQSide',
          dimensions: { width: 1600, height: 900, aspectRatio: 1.7778 },
        },
      },
      alt: 'Side card illustration',
      hotspot: null,
      crop: null,
    },
    author: { name: 'John Smith', slug: 'john-smith' },
    publishedAt: '2026-03-25T10:00:00Z',
    category: { _id: 'cat-blog', title: 'Blog', slug: 'blog' },
  },
] as unknown as Article[];
