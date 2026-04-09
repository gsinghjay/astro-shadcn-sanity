import ArticleList from './ArticleList.astro'

const sharedButtons = [
  { _key: 'btn-1', text: 'View All Articles', url: '/articles', variant: 'outline' },
]

export default {
  title: 'Components/ArticleList',
  component: ArticleList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Article listing in grid, split-featured, or list layouts with placeholder cards.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['grid', 'split-featured', 'list'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    backgroundVariant: {
      control: { type: 'select' },
      options: ['white', 'light', 'dark', 'primary'],
      description: 'Background color theme',
    },
    spacing: {
      control: { type: 'select' },
      options: ['none', 'small', 'default', 'large'],
      description: 'Vertical padding',
    },
    maxWidth: {
      control: { type: 'select' },
      options: ['narrow', 'default', 'full'],
      description: 'Maximum content width',
    },
  },
}

export const Grid = {
  args: {
    _type: 'articleList',
    _key: 'story-al-grid',
    variant: 'grid',
    heading: 'Latest Articles',
    description: 'News and insights from our team on technology, design, and community.',
    contentType: 'all',
    limit: 6,
    ctaButtons: sharedButtons,
  },
}

export const SplitFeatured = {
  args: {
    _type: 'articleList',
    _key: 'story-al-split',
    variant: 'split-featured',
    heading: 'From the Blog',
    description: 'Featured stories and recent posts.',
    contentType: 'blog',
    limit: 4,
    ctaButtons: sharedButtons,
  },
}

export const List = {
  args: {
    _type: 'articleList',
    _key: 'story-al-list',
    variant: 'list',
    heading: 'Archive',
    contentType: 'all',
    limit: 10,
    ctaButtons: sharedButtons,
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
