import FeatureGrid from './FeatureGrid.astro'

export default {
  title: 'Components/FeatureGrid',
  component: FeatureGrid,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Grid of feature tiles with numbered icons, headings, and descriptions. Supports grid, centered, horizontal-cards, sidebar-grid, and stacked variants.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['grid', 'grid-centered', 'horizontal-cards', 'sidebar-grid', 'stacked', 'numbered-brutalist'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    columns: { control: { type: 'number', min: 1, max: 4 }, description: 'Number of grid columns' },
    backgroundVariant: {
      control: { type: 'select' },
      options: ['white', 'light', 'dark', 'primary', 'hatched', 'hatched-light', 'blueprint', 'mono', 'stripe'],
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

export const TwoColumn = {
  args: {
    _type: 'featureGrid',
    _key: 'story-features-2col',
    heading: 'Lorem Ipsum Dolor Sit',
    columns: 2,
    items: [
      { _key: 'f1', title: 'Consectetur Adipiscing', description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.' },
      { _key: 'f2', title: 'Elit Sed Do', description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.' },
    ],
  },
}

export const ThreeColumn = {
  args: {
    _type: 'featureGrid',
    _key: 'story-features-3col',
    heading: 'Lorem Ipsum Features',
    columns: 3,
    items: [
      { _key: 'f1', title: 'Consectetur Adipiscing', description: 'Duis aute irure dolor in reprehenderit' },
      { _key: 'f2', title: 'Elit Sed Do', description: 'Ut enim ad minim veniam quis nostrud' },
      { _key: 'f3', title: 'Eiusmod Tempor', description: 'Excepteur sint occaecat cupidatat non' },
    ],
  },
}

export const HatchedDark = {
  args: {
    _type: 'featureGrid',
    _key: 'story-features-hatched',
    heading: 'Technical Capabilities',
    backgroundVariant: 'hatched',
    columns: 3,
    items: [
      { _key: 'f1', title: 'Consectetur Adipiscing', description: 'Duis aute irure dolor in reprehenderit' },
      { _key: 'f2', title: 'Elit Sed Do', description: 'Ut enim ad minim veniam quis nostrud' },
      { _key: 'f3', title: 'Eiusmod Tempor', description: 'Excepteur sint occaecat cupidatat non' },
    ],
  },
}

export const HatchedLight = {
  args: {
    _type: 'featureGrid',
    _key: 'story-features-hatched-light',
    heading: 'Platform Features',
    backgroundVariant: 'hatched-light',
    columns: 3,
    items: [
      { _key: 'f1', title: 'Consectetur Adipiscing', description: 'Duis aute irure dolor in reprehenderit' },
      { _key: 'f2', title: 'Elit Sed Do', description: 'Ut enim ad minim veniam quis nostrud' },
      { _key: 'f3', title: 'Eiusmod Tempor', description: 'Excepteur sint occaecat cupidatat non' },
    ],
  },
}

export const FourColumn = {
  args: {
    _type: 'featureGrid',
    _key: 'story-features-4col',
    heading: 'Lorem Highlights',
    columns: 4,
    items: [
      { _key: 'f1', title: 'Lorem Ipsum', description: 'Sed do eiusmod tempor incididunt ut labore.' },
      { _key: 'f2', title: 'Dolor Sit', description: 'Ut enim ad minim veniam quis nostrud exercitation.' },
      { _key: 'f3', title: 'Amet Consectetur', description: 'Duis aute irure dolor in reprehenderit in voluptate.' },
      { _key: 'f4', title: 'Adipiscing Elit', description: 'Excepteur sint occaecat cupidatat non proident sunt.' },
    ],
  },
}

export const Mono = {
  args: {
    _type: 'featureGrid',
    _key: 'story-features-mono',
    heading: 'Terminal Capabilities',
    backgroundVariant: 'mono',
    columns: 3,
    items: [
      { _key: 'f1', title: 'Consectetur Adipiscing', description: 'Duis aute irure dolor in reprehenderit' },
      { _key: 'f2', title: 'Elit Sed Do', description: 'Ut enim ad minim veniam quis nostrud' },
      { _key: 'f3', title: 'Eiusmod Tempor', description: 'Excepteur sint occaecat cupidatat non' },
    ],
  },
}

export const Stripe = {
  args: {
    _type: 'featureGrid',
    _key: 'story-features-stripe',
    heading: 'Ruled Paper Features',
    backgroundVariant: 'stripe',
    columns: 3,
    items: [
      { _key: 'f1', title: 'Consectetur Adipiscing', description: 'Duis aute irure dolor in reprehenderit' },
      { _key: 'f2', title: 'Elit Sed Do', description: 'Ut enim ad minim veniam quis nostrud' },
      { _key: 'f3', title: 'Eiusmod Tempor', description: 'Excepteur sint occaecat cupidatat non' },
    ],
  },
}

export const NumberedBrutalist = {
  args: {
    _type: 'featureGrid',
    _key: 'story-feat-numbered-brutalist',
    variant: 'numbered-brutalist',
    heading: 'Why Partner with NJIT',
    description: 'Six reasons Fortune 500 companies choose our capstone program.',
    columns: 3,
    backgroundVariant: 'hatched-light',
    items: [
      { _key: 'nb1', title: 'Talent Pipeline', description: 'Direct access to top STEM graduates trained on real-world projects.', icon: '🎓' },
      { _key: 'nb2', title: 'Innovation Lab', description: 'Your R&D challenges solved by multidisciplinary student teams.', icon: '🔬' },
      { _key: 'nb3', title: 'Production Code', description: 'Students ship deployment-ready code, not academic prototypes.', icon: '⚡' },
      { _key: 'nb4', title: 'Cost Efficiency', description: 'Enterprise-quality output at a fraction of consulting rates.', icon: '📊' },
      { _key: 'nb5', title: 'Brand Visibility', description: 'Prominent placement across showcase events and digital channels.', icon: '🏛️' },
      { _key: 'nb6', title: 'Research Access', description: 'Collaboration with NJIT faculty on cutting-edge technology domains.', icon: '🧪' },
    ],
  },
}
