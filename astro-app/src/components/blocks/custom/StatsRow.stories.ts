import StatsRow from './StatsRow.astro'

export default {
  title: 'Blocks/StatsRow',
  component: StatsRow,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
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
