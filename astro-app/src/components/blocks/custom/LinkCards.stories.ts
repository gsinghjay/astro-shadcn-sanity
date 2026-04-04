import LinkCards from './LinkCards.astro'

const sharedLinks = [
  {
    _key: 'link-1',
    title: 'Documentation',
    description: 'Comprehensive guides and API references to get started quickly.',
    icon: '📖',
    url: '/docs',
  },
  {
    _key: 'link-2',
    title: 'Tutorials',
    description: 'Step-by-step walkthroughs for common use cases and integrations.',
    icon: '🎓',
    url: '/tutorials',
  },
  {
    _key: 'link-3',
    title: 'Blog',
    description: 'Latest updates, best practices, and community stories.',
    icon: '✍️',
    url: '/blog',
  },
  {
    _key: 'link-4',
    title: 'Community',
    description: 'Join the conversation on Discord and GitHub discussions.',
    icon: '💬',
    url: '/community',
  },
  {
    _key: 'link-5',
    title: 'Changelog',
    description: 'Track new features, improvements, and bug fixes.',
    icon: '📋',
    url: '/changelog',
  },
  {
    _key: 'link-6',
    title: 'Support',
    description: 'Get help from our team and community experts.',
    icon: '🆘',
    url: '/support',
  },
]

export default {
  title: 'Components/LinkCards',
  component: LinkCards,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Navigation link cards for resource pages, documentation hubs, or site directories.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['grid', 'list', 'icon-list'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    description: { control: 'text', description: 'Section description' },
    backgroundVariant: {
      control: { type: 'select' },
      options: ['white', 'light', 'dark', 'primary', 'hatched', 'hatched-light'],
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
    _type: 'linkCards',
    _key: 'story-links-grid',
    variant: 'grid',
    heading: 'Resources',
    description: 'Everything you need to build, learn, and connect.',
    links: sharedLinks,
  },
}

export const List = {
  args: {
    _type: 'linkCards',
    _key: 'story-links-list',
    variant: 'list',
    heading: 'Quick Links',
    description: 'Jump to the section you need.',
    links: sharedLinks,
  },
}

export const IconList = {
  args: {
    _type: 'linkCards',
    _key: 'story-links-icon-list',
    variant: 'icon-list',
    heading: 'Explore',
    description: 'Find what you need at a glance.',
    links: sharedLinks,
  },
}
