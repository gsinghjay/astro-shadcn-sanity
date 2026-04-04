import TeamGrid from './TeamGrid.astro'

const sharedImage = {
  _type: 'image' as const,
  asset: {
    _ref: 'image-117be8afe69ff441c417bb9de6e457e82848aaf4-5712x4284-jpg',
    _type: 'reference' as const,
  },
  alt: 'Team member portrait',
}

const teamMembers = [
  { _key: 'tm-1', name: 'Alice Chen', role: 'Lead Developer', image: sharedImage, links: [{ _key: 'l1', label: 'GitHub', href: 'https://github.com' }] },
  { _key: 'tm-2', name: 'Bob Martinez', role: 'UX Designer', image: sharedImage, links: [{ _key: 'l2', label: 'LinkedIn', href: 'https://linkedin.com' }] },
  { _key: 'tm-3', name: 'Carol Johnson', role: 'Project Manager', image: sharedImage, links: [] },
  { _key: 'tm-4', name: 'David Park', role: 'Backend Engineer', image: sharedImage, links: [{ _key: 'l3', label: 'Website', href: 'https://example.com' }] },
  { _key: 'tm-5', name: 'Eva Schmidt', role: 'Data Scientist', image: sharedImage, links: [] },
  { _key: 'tm-6', name: 'Frank Liu', role: 'DevOps Engineer', image: sharedImage, links: [{ _key: 'l4', label: 'GitHub', href: 'https://github.com' }] },
]

export default {
  title: 'Components/TeamGrid',
  component: TeamGrid,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Team member grid with photos, names, and roles. Supports grid, compact, and split variants.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['grid', 'grid-compact', 'split'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
  },
}

export const Grid = {
  args: {
    _type: 'teamGrid',
    _key: 'story-tg-grid',
    variant: 'grid',
    heading: 'Meet Our Team',
    description: 'The people behind the project — engineers, designers, and strategists working together.',
    items: teamMembers,
  },
}

export const GridCompact = {
  args: {
    _type: 'teamGrid',
    _key: 'story-tg-compact',
    variant: 'grid-compact',
    heading: 'Our Team',
    items: teamMembers,
  },
}

export const Split = {
  args: {
    _type: 'teamGrid',
    _key: 'story-tg-split',
    variant: 'split',
    heading: 'Who We Are',
    description: 'A cross-functional team with expertise across the full stack.',
    items: teamMembers.slice(0, 4),
  },
}

export const Minimal = {
  args: {
    _type: 'teamGrid',
    _key: 'story-tg-minimal',
    variant: 'grid',
    heading: 'Team',
    items: teamMembers.slice(0, 2),
  },
}
