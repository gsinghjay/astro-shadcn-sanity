import type { ComparisonTableBlock } from '@/lib/types';

export const comparisonTableFull: ComparisonTableBlock = {
  _type: 'comparisonTable',
  _key: 'test-ct-1',
  backgroundVariant: 'white',
  spacing: 'default',
  maxWidth: 'default',
  variant: 'table',
  heading: 'Plan Comparison',
  description: 'Compare our plans side by side.',
  columns: [
    { _key: 'c1', title: 'Free', highlighted: null },
    { _key: 'c2', title: 'Pro', highlighted: true },
    { _key: 'c3', title: 'Enterprise', highlighted: null },
  ],
  rows: [
    { _key: 'r0', feature: 'Storage', values: ['5 GB', '50 GB', 'Unlimited'], isHeader: null },
    { _key: 'r1', feature: 'Advanced Features', values: null, isHeader: true },
    { _key: 'r2', feature: 'API Calls', values: ['1,000', '100,000', 'Unlimited'], isHeader: null },
  ],
  links: [
    { _key: 'l1', text: 'Get Started', url: '/signup', variant: null },
  ],
};

export const comparisonTableStacked: ComparisonTableBlock = {
  ...comparisonTableFull,
  _key: 'test-ct-2',
  variant: 'stacked',
};

export const comparisonTableMinimal: ComparisonTableBlock = {
  _type: 'comparisonTable',
  _key: 'test-ct-3',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  variant: null,
  heading: null,
  description: null,
  columns: [
    { _key: 'c1', title: 'A', highlighted: null },
    { _key: 'c2', title: 'B', highlighted: null },
  ],
  rows: [
    { _key: 'r1', feature: 'Item', values: ['Yes', 'No'], isHeader: null },
  ],
  links: null,
};
