import type { ArticleListBlock } from '@/lib/types';

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
  contentType: 'blog',
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
  contentType: 'news',
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
  limit: null,
  ctaButtons: null,
};
