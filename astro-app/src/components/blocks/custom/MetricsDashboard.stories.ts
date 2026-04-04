import MetricsDashboard from './MetricsDashboard.astro'

const sharedMetrics = [
  {
    _key: 'metric-1',
    label: 'Total Revenue',
    value: '$1.2M',
    change: '+12.5%',
    trend: 'up' as const,
    icon: '💰',
  },
  {
    _key: 'metric-2',
    label: 'Active Users',
    value: '48,291',
    change: '+8.2%',
    trend: 'up' as const,
    icon: '👥',
  },
  {
    _key: 'metric-3',
    label: 'Conversion Rate',
    value: '3.4%',
    change: '-0.8%',
    trend: 'down' as const,
    icon: '📈',
  },
  {
    _key: 'metric-4',
    label: 'Avg Response Time',
    value: '142ms',
    change: '0%',
    trend: 'neutral' as const,
    icon: '⚡',
  },
  {
    _key: 'metric-5',
    label: 'Uptime',
    value: '99.98%',
    change: '+0.02%',
    trend: 'up' as const,
    icon: '🟢',
  },
  {
    _key: 'metric-6',
    label: 'Support Tickets',
    value: '23',
    change: '-15%',
    trend: 'up' as const,
    icon: '🎫',
  },
]

export default {
  title: 'Components/MetricsDashboard',
  component: MetricsDashboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Metrics dashboard block with trend indicators and change percentages. Distinct from StatsRow — adds richer card layouts and directional trends.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['grid', 'row', 'card'],
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
    _type: 'metricsDashboard',
    _key: 'story-metrics-grid',
    variant: 'grid',
    heading: 'Key Metrics',
    description: 'Performance snapshot from the past 30 days.',
    metrics: sharedMetrics,
  },
}

export const Row = {
  args: {
    _type: 'metricsDashboard',
    _key: 'story-metrics-row',
    variant: 'row',
    heading: 'By the Numbers',
    metrics: sharedMetrics.slice(0, 4),
  },
}

export const Card = {
  args: {
    _type: 'metricsDashboard',
    _key: 'story-metrics-card',
    variant: 'card',
    heading: 'Dashboard Overview',
    description: 'Real-time metrics at a glance.',
    metrics: sharedMetrics,
  },
}
