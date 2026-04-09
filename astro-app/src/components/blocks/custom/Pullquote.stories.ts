import Pullquote from './Pullquote.astro'

const authorImage = {
  _type: 'image' as const,
  asset: {
    _ref: 'image-117be8afe69ff441c417bb9de6e457e82848aaf4-5712x4284-jpg',
    _type: 'reference' as const,
  },
  alt: 'Author portrait',
}

export default {
  title: 'Components/Pullquote',
  component: Pullquote,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Decorative blockquote with large serif quotation mark. Supports centered, split, and sidebar variants.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['centered', 'split', 'sidebar', 'brutalist'],
      description: 'Layout variant',
    },
    quote: { control: 'text', description: 'Quote text' },
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

export const Centered = {
  args: {
    _type: 'pullquote',
    _key: 'story-pq-centered',
    backgroundVariant: 'white',
    spacing: 'default',
    maxWidth: 'default',
    variant: 'centered',
    quote: 'Design is not just what it looks like and feels like. Design is how it works.',
    attribution: 'Steve Jobs',
    role: 'Co-founder, Apple',
    image: authorImage,
  },
}

export const CenteredNoImage = {
  args: {
    _type: 'pullquote',
    _key: 'story-pq-centered-noimg',
    backgroundVariant: 'white',
    spacing: 'default',
    maxWidth: 'default',
    variant: 'centered',
    quote: 'The grid system is an aid, not a guarantee. It permits a number of possible uses and each designer can look for a solution appropriate to his personal style.',
    attribution: 'Josef Müller-Brockmann',
    role: 'Swiss Graphic Designer',
  },
}

export const SplitVariant = {
  args: {
    _type: 'pullquote',
    _key: 'story-pq-split',
    backgroundVariant: 'white',
    spacing: 'default',
    maxWidth: 'default',
    variant: 'split',
    quote: 'Content precedes design. Design in the absence of content is not design, it is decoration.',
    attribution: 'Jeffrey Zeldman',
    role: 'Web Standards Advocate',
    image: authorImage,
  },
}

export const Sidebar = {
  args: {
    _type: 'pullquote',
    _key: 'story-pq-sidebar',
    backgroundVariant: 'white',
    spacing: 'default',
    maxWidth: 'default',
    variant: 'sidebar',
    quote: 'Less, but better.',
    attribution: 'Dieter Rams',
    role: 'Industrial Designer',
  },
}

export const QuoteOnly = {
  args: {
    _type: 'pullquote',
    _key: 'story-pq-minimal',
    backgroundVariant: 'white',
    spacing: 'default',
    maxWidth: 'default',
    variant: 'centered',
    quote: 'Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.',
  },
}

export const Brutalist = {
  args: {
    _type: 'pullquote',
    _key: 'story-pullquote-brutalist',
    variant: 'brutalist',
    quote: 'NJIT students shipped production code in Week 3. That kind of readiness is exactly what we need.',
    attribution: 'Sarah Chen',
    role: 'VP of Engineering, Cisco',
    backgroundVariant: 'hatched',
  },
}
