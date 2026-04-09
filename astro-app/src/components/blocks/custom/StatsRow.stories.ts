import StatsRow from './StatsRow.astro'

export default {
  title: 'Components/StatsRow',
  component: StatsRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Horizontal row of numeric statistics with labels. Supports grid, split, and spread layouts with optional dark theme.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['grid', 'split', 'spread', 'brutalist', 'ticker'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
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

export const Light = {
  args: {
    _type: 'statsRow',
    _key: 'story-stats-1',
    heading: 'By the Numbers',
    backgroundVariant: 'light',
    stats: [
      { _key: 's1', value: '100+', label: 'Lorem Ipsum' },
      { _key: 's2', value: '200+', label: 'Dolor Sit' },
      { _key: 's3', value: '50+', label: 'Amet Consectetur' },
      { _key: 's4', value: '99%', label: 'Adipiscing Elit' },
    ],
  },
}

export const Dark = {
  args: {
    _type: 'statsRow',
    _key: 'story-stats-2',
    backgroundVariant: 'dark',
    stats: [
      { _key: 's1', value: '100+', label: 'Lorem Ipsum' },
      { _key: 's2', value: '200+', label: 'Dolor Sit' },
      { _key: 's3', value: '50+', label: 'Amet Consectetur' },
      { _key: 's4', value: '99%', label: 'Adipiscing Elit' },
    ],
  },
}

export const HatchedDark = {
  args: {
    _type: 'statsRow',
    _key: 'story-stats-hatched-dark',
    heading: 'Engineering Metrics',
    backgroundVariant: 'hatched',
    stats: [
      { _key: 's1', value: '100+', label: 'Lorem Ipsum' },
      { _key: 's2', value: '200+', label: 'Dolor Sit' },
      { _key: 's3', value: '50+', label: 'Amet Consectetur' },
      { _key: 's4', value: '99%', label: 'Adipiscing Elit' },
    ],
  },
}

export const HatchedLight = {
  args: {
    _type: 'statsRow',
    _key: 'story-stats-hatched-light',
    heading: 'Program Impact',
    backgroundVariant: 'hatched-light',
    stats: [
      { _key: 's1', value: '100+', label: 'Lorem Ipsum' },
      { _key: 's2', value: '200+', label: 'Dolor Sit' },
      { _key: 's3', value: '50+', label: 'Amet Consectetur' },
      { _key: 's4', value: '99%', label: 'Adipiscing Elit' },
    ],
  },
}

export const TwoStats = {
  args: {
    _type: 'statsRow',
    _key: 'story-stats-3',
    backgroundVariant: 'light',
    stats: [
      { _key: 's1', value: '10', label: 'Lorem Ipsum' },
      { _key: 's2', value: '15', label: 'Dolor Sit' },
    ],
  },
}

export const Brutalist = {
  args: {
    _type: 'statsRow',
    _key: 'story-stats-brutalist',
    variant: 'brutalist',
    backgroundVariant: 'dark',
    stats: [
      { _key: 'sb1', value: '94%', label: 'Placement Rate' },
      { _key: 'sb2', value: '500+', label: 'Students Graduated' },
      { _key: 'sb3', value: '$2.4M', label: 'Research Funding' },
      { _key: 'sb4', value: '10', label: 'Fortune 500 Partners' },
    ],
  },
}

export const Blueprint = {
  args: {
    _type: 'statsRow',
    _key: 'story-stats-blueprint',
    heading: 'Engineering Blueprint',
    backgroundVariant: 'blueprint',
    stats: [
      { _key: 's1', value: '100+', label: 'Lorem Ipsum' },
      { _key: 's2', value: '200+', label: 'Dolor Sit' },
      { _key: 's3', value: '50+', label: 'Amet Consectetur' },
      { _key: 's4', value: '99%', label: 'Adipiscing Elit' },
    ],
  },
}

export const Ticker = {
  args: {
    _type: 'statsRow',
    _key: 'story-stats-ticker',
    variant: 'ticker',
    backgroundVariant: 'dark',
    stats: [
      { _key: 'st1', value: '94%', label: 'Placement Rate' },
      { _key: 'st2', value: '500+', label: 'Graduates' },
      { _key: 'st3', value: '$2.4M', label: 'Funding' },
      { _key: 'st4', value: '10', label: 'Fortune 500 Partners' },
      { _key: 'st5', value: '40+', label: 'Projects Completed' },
      { _key: 'st6', value: 'Top 40', label: 'Public University' },
    ],
  },
}
