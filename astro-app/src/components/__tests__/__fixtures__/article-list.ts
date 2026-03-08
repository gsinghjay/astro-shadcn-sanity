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
  source: 'all',
  limit: 6,
  links: [
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
  source: 'blog',
  limit: 4,
  links: null,
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
  source: 'news',
  limit: 10,
  links: [
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
  source: null,
  limit: null,
  links: null,
};
