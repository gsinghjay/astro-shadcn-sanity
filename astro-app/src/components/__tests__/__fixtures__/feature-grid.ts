import type { FeatureGridBlock } from '@/lib/types';

export const featureGridFull: FeatureGridBlock = {
  _type: 'featureGrid',
  _key: 'test-fg-1',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  heading: 'What We Offer',
  columns: 3,
  items: [
    {
      _key: 'feat-1',
      icon: 'lucide:code',
      title: 'Web Development',
      description: 'Learn modern web technologies',
      image: null,
    },
    {
      _key: 'feat-2',
      icon: 'lucide:users',
      title: 'Community',
      description: 'Join a supportive network',
      image: null,
    },
  ],
};

export const featureGridMinimal: FeatureGridBlock = {
  _type: 'featureGrid',
  _key: 'test-fg-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  heading: null,
  columns: null,
  items: null,
};
