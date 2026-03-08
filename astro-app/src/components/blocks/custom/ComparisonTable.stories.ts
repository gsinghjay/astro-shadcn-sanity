import ComparisonTable from './ComparisonTable.astro'

const pricingColumns = [
  { _key: 'col-1', title: 'Free', highlighted: false },
  { _key: 'col-2', title: 'Pro', highlighted: true },
  { _key: 'col-3', title: 'Enterprise', highlighted: false },
]

const pricingRows = [
  { _key: 'row-h1', feature: 'Core Features', values: [], isHeader: true },
  { _key: 'row-1', feature: 'Storage', values: ['5 GB', '50 GB', 'Unlimited'], isHeader: false },
  { _key: 'row-2', feature: 'API Calls', values: ['1,000/mo', '50,000/mo', 'Unlimited'], isHeader: false },
  { _key: 'row-3', feature: 'Team Members', values: ['1', '10', 'Unlimited'], isHeader: false },
  { _key: 'row-h2', feature: 'Support', values: [], isHeader: true },
  { _key: 'row-4', feature: 'Email Support', values: ['✓', '✓', '✓'], isHeader: false },
  { _key: 'row-5', feature: 'Priority Support', values: ['—', '✓', '✓'], isHeader: false },
  { _key: 'row-6', feature: 'Dedicated Manager', values: ['—', '—', '✓'], isHeader: false },
]

const ctaButtons = [
  { _key: 'btn-1', text: 'Get Started Free', url: '/signup', variant: 'default' },
  { _key: 'btn-2', text: 'Contact Sales', url: '/contact', variant: 'outline' },
]

export default {
  title: 'Blocks/ComparisonTable',
  component: ComparisonTable,
  tags: ['autodocs'],
}

export const Table = {
  args: {
    _type: 'comparisonTable',
    _key: 'story-ct-table',
    backgroundVariant: 'white',
    spacing: 'default',
    maxWidth: 'default',
    variant: 'table',
    heading: 'Choose Your Plan',
    description: 'Simple, transparent pricing for teams of every size.',
    columns: pricingColumns,
    rows: pricingRows,
    links: ctaButtons,
  },
}

export const Stacked = {
  args: {
    _type: 'comparisonTable',
    _key: 'story-ct-stacked',
    backgroundVariant: 'white',
    spacing: 'default',
    maxWidth: 'default',
    variant: 'stacked',
    heading: 'Plan Comparison',
    description: 'Card view for easy mobile comparison.',
    columns: pricingColumns,
    rows: pricingRows,
    links: ctaButtons,
  },
}

export const TwoColumn = {
  args: {
    _type: 'comparisonTable',
    _key: 'story-ct-2col',
    backgroundVariant: 'white',
    spacing: 'default',
    maxWidth: 'default',
    variant: 'table',
    heading: 'Before & After',
    columns: [
      { _key: 'col-a', title: 'Traditional', highlighted: false },
      { _key: 'col-b', title: 'Modern', highlighted: true },
    ],
    rows: [
      { _key: 'r1', feature: 'Deployment', values: ['Manual FTP', 'CI/CD Pipeline'], isHeader: false },
      { _key: 'r2', feature: 'Testing', values: ['Manual QA', 'Automated Tests'], isHeader: false },
      { _key: 'r3', feature: 'Monitoring', values: ['Server logs', 'Real-time dashboard'], isHeader: false },
    ],
  },
}
