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
      options: ['grid', 'row', 'card', 'terminal', 'brutalist-grid'],
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

export const Terminal = {
  args: {
    _type: 'metricsDashboard',
    _key: 'story-metrics-terminal',
    variant: 'terminal',
    heading: 'System Status',
    description: 'Real-time program metrics.',
    backgroundVariant: 'dark',
    metrics: [
      { _key: 'tm1', label: 'Placement Rate', value: '94.2%', change: '+2.1%', trend: 'up' as const, icon: '📈' },
      { _key: 'tm2', label: 'Active Projects', value: '12', change: '+3', trend: 'up' as const, icon: '⚙️' },
      { _key: 'tm3', label: 'Sponsor Partners', value: '10', change: '+2', trend: 'up' as const, icon: '🤝' },
      { _key: 'tm4', label: 'Avg Response Time', value: '< 48h', change: '-12h', trend: 'up' as const, icon: '⏱️' },
      { _key: 'tm5', label: 'Student Satisfaction', value: '4.8/5', change: '+0.2', trend: 'up' as const, icon: '⭐' },
      { _key: 'tm6', label: 'Code Commits', value: '12,847', change: '+1,204', trend: 'up' as const, icon: '💻' },
    ],
  },
}

export const BrutalistGrid = {
  args: {
    _type: 'metricsDashboard',
    _key: 'story-metrics-brutalist-grid',
    variant: 'brutalist-grid',
    heading: 'Program Impact',
    backgroundVariant: 'hatched-light',
    metrics: [
      { _key: 'bg1', label: 'Research Funding', value: '$2.4M', change: '+18%', trend: 'up' as const, icon: '💰' },
      { _key: 'bg2', label: 'Students Placed', value: '500+', change: '+94', trend: 'up' as const, icon: '👥' },
      { _key: 'bg3', label: 'Projects Delivered', value: '40+', change: '+8', trend: 'up' as const, icon: '📦' },
      { _key: 'bg4', label: 'Industry Partners', value: '10', change: '+2', trend: 'up' as const, icon: '🏢' },
    ],
  },
}
