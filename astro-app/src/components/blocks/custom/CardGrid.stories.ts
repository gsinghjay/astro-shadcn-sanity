import CardGrid from './CardGrid.astro'

const sharedCards = [
  {
    _key: 'card-1',
    title: 'Getting Started Guide',
    description: 'Learn the fundamentals and set up your first project in under 10 minutes.',
    badge: 'Popular',
    link: '/guides/getting-started',
    image: { url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop', alt: 'Getting started' },
  },
  {
    _key: 'card-2',
    title: 'Advanced Workflows',
    description: 'Deep dive into automation, CI/CD pipelines, and team collaboration features.',
    link: '/guides/advanced',
    image: { url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', alt: 'Code editor' },
  },
  {
    _key: 'card-3',
    title: 'API Reference',
    description: 'Complete documentation for all endpoints, authentication, and webhooks.',
    link: '/docs/api',
  },
  {
    _key: 'card-4',
    title: 'Best Practices',
    description: 'Proven patterns and recommendations from the community and our engineering team.',
    badge: 'New',
    link: '/guides/best-practices',
    image: { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop', alt: 'Collaboration' },
  },
  {
    _key: 'card-5',
    title: 'Security Overview',
    description: 'How we protect your data with encryption, access controls, and compliance certifications.',
    link: '/security',
  },
  {
    _key: 'card-6',
    title: 'Release Notes',
    description: 'Stay up to date with the latest features, improvements, and bug fixes.',
    link: '/changelog',
    image: { url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop', alt: 'Dashboard' },
  },
]

export default {
  title: 'Components/CardGrid',
  component: CardGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Generic card grid block with 2, 3, 4-column and masonry layouts. Not tied to a specific content type.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['grid-2', 'grid-3', 'grid-4', 'masonry', 'brutalist'],
      description: 'Grid layout variant',
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

export const Grid2 = {
  args: {
    _type: 'cardGrid',
    _key: 'story-cardgrid-2',
    variant: 'grid-2',
    heading: 'Featured Resources',
    description: 'Curated content to help you succeed.',
    cards: sharedCards.slice(0, 4),
  },
}

export const Grid3 = {
  args: {
    _type: 'cardGrid',
    _key: 'story-cardgrid-3',
    variant: 'grid-3',
    heading: 'Resource Library',
    description: 'Everything you need in one place.',
    cards: sharedCards,
  },
}

export const Grid4 = {
  args: {
    _type: 'cardGrid',
    _key: 'story-cardgrid-4',
    variant: 'grid-4',
    heading: 'Browse Topics',
    cards: sharedCards,
  },
}

export const Masonry = {
  args: {
    _type: 'cardGrid',
    _key: 'story-cardgrid-masonry',
    variant: 'masonry',
    heading: 'Explore',
    description: 'A curated collection of guides and resources.',
    cards: sharedCards,
  },
}

export const Brutalist = {
  args: {
    _type: 'cardGrid',
    _key: 'story-cardgrid-brutalist',
    variant: 'brutalist',
    heading: 'Research Domains',
    description: 'Active capstone project categories.',
    backgroundVariant: 'hatched-light',
    cards: [
      { _key: 'cb1', title: 'Cybersecurity', description: 'Zero trust, microsegmentation, blockchain-secured DNS infrastructure.', badge: '3 Projects', link: { text: 'View Projects', url: '/projects' } },
      { _key: 'cb2', title: 'Machine Learning', description: 'Predictive models, NLP, sentiment analysis, and resource optimization.', badge: '4 Projects', link: { text: 'View Projects', url: '/projects' } },
      { _key: 'cb3', title: 'Cloud & DevOps', description: 'Azure ML pipelines, CI/CD automation, and scalable infrastructure.', badge: '2 Projects', link: { text: 'View Projects', url: '/projects' } },
      { _key: 'cb4', title: '5G & Healthcare', description: 'Alzheimer\'s care applications and telemedicine over 5G networks.', badge: '1 Project', link: { text: 'View Projects', url: '/projects' } },
      { _key: 'cb5', title: 'Web Platforms', description: 'Full-stack applications, CMS systems, and client portals.', badge: '3 Projects', link: { text: 'View Projects', url: '/projects' } },
      { _key: 'cb6', title: 'Sustainability', description: 'Green technology portals and environmental impact dashboards.', badge: '1 Project', link: { text: 'View Projects', url: '/projects' } },
    ],
  },
}
