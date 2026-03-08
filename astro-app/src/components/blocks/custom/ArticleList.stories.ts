import ArticleList from './ArticleList.astro'

const sharedButtons = [
  { _key: 'btn-1', text: 'View All Articles', url: '/articles', variant: 'outline' },
]

export default {
  title: 'Blocks/ArticleList',
  component: ArticleList,
  tags: ['autodocs'],
}

export const Grid = {
  args: {
    _type: 'articleList',
    _key: 'story-al-grid',
    variant: 'grid',
    heading: 'Latest Articles',
    description: 'News and insights from our team on technology, design, and community.',
    source: 'all',
    limit: 6,
    links: sharedButtons,
  },
}

export const SplitFeatured = {
  args: {
    _type: 'articleList',
    _key: 'story-al-split',
    variant: 'split-featured',
    heading: 'From the Blog',
    description: 'Featured stories and recent posts.',
    source: 'blog',
    limit: 4,
    links: sharedButtons,
  },
}

export const List = {
  args: {
    _type: 'articleList',
    _key: 'story-al-list',
    variant: 'list',
    heading: 'Archive',
    source: 'all',
    limit: 10,
    links: sharedButtons,
  },
}

export const Minimal = {
  args: {
    _type: 'articleList',
    _key: 'story-al-minimal',
    variant: 'grid',
    heading: 'Articles',
  },
}
