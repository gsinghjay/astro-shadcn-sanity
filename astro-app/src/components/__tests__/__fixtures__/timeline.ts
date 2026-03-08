import type { TimelineBlock } from '@/lib/types';

export const timelineFull: TimelineBlock = {
  _type: 'timeline',
  _key: 'test-tl-1',
  backgroundVariant: 'white',
  spacing: 'default',
  maxWidth: 'default',
  variant: 'vertical',
  heading: 'Our Journey',
  description: 'Key milestones in our history.',
  items: [
    {
      _key: 'e1',
      date: '2020',
      title: 'Founded',
      description: 'We started with a small team.',
      image: null,
    },
    {
      _key: 'e2',
      date: 'March 2022',
      title: 'Series A',
      description: 'Raised our first round of funding.',
      image: null,
    },
    {
      _key: 'e3',
      date: 'Q1 2024',
      title: 'Global Expansion',
      description: null,
      image: null,
    },
  ],
  links: [
    { _key: 'l1', text: 'Learn More', url: '/about', variant: null },
  ],
};

export const timelineSplit: TimelineBlock = {
  ...timelineFull,
  _key: 'test-tl-2',
  variant: 'split',
};

export const timelineHorizontal: TimelineBlock = {
  ...timelineFull,
  _key: 'test-tl-3',
  variant: 'horizontal',
  description: null,
};

export const timelineMinimal: TimelineBlock = {
  _type: 'timeline',
  _key: 'test-tl-4',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  variant: null,
  heading: null,
  description: null,
  items: [
    { _key: 'e1', date: '2024', title: 'Event', description: null, image: null },
  ],
  links: null,
};
