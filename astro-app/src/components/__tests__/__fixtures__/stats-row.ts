import type { StatsRowBlock } from '@/lib/types';

export const statsFull: StatsRowBlock = {
  _type: 'statsRow',
  _key: 'test-stats-1',
  backgroundVariant: 'dark',
  spacing: 'default',
  maxWidth: 'default',
  heading: 'Our Impact',
  stats: [
    { _key: 's1', value: '500+', label: 'Members', description: null },
    { _key: 's2', value: '50', label: 'Events', description: null },
    { _key: 's3', value: '20', label: 'Projects', description: null },
    { _key: 's4', value: '10', label: 'Sponsors', description: null },
  ],
};

export const statsMinimal: StatsRowBlock = {
  _type: 'statsRow',
  _key: 'test-stats-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  heading: null,
  stats: null,
};
