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
      options: ['grid', 'grid-centered', 'horizontal-cards', 'sidebar-grid', 'stacked'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    columns: { control: { type: 'number', min: 1, max: 4 }, description: 'Number of grid columns' },
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
