import StatsRow from './StatsRow.astro'

export default {
  title: 'Blocks/StatsRow',
  component: StatsRow,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Light = {
  args: {
    block: {
      _type: 'statsRow',
      _key: 'story-stats-1',
      variant: 'light',
      stats: [
        { _key: 's1', value: '50+', label: 'Projects Delivered' },
        { _key: 's2', value: '200+', label: 'Students Placed' },
        { _key: 's3', value: '30+', label: 'Industry Partners' },
        { _key: 's4', value: '95%', label: 'Satisfaction Rate' },
      ],
    },
  },
}

export const Dark = {
  args: {
    block: {
      _type: 'statsRow',
      _key: 'story-stats-2',
      variant: 'dark',
      stats: [
        { _key: 's1', value: '50+', label: 'Projects Delivered' },
        { _key: 's2', value: '200+', label: 'Students Placed' },
        { _key: 's3', value: '30+', label: 'Industry Partners' },
        { _key: 's4', value: '95%', label: 'Satisfaction Rate' },
      ],
    },
  },
}

export const TwoStats = {
  args: {
    block: {
      _type: 'statsRow',
      _key: 'story-stats-3',
      variant: 'light',
      stats: [
        { _key: 's1', value: '10', label: 'Teams Per Semester' },
        { _key: 's2', value: '15 Weeks', label: 'Program Duration' },
      ],
    },
  },
}
