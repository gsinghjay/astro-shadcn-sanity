import type { PullquoteBlock } from '@/lib/types';

export const pullquoteFull: PullquoteBlock = {
  _type: 'pullquote',
  _key: 'test-pq-1',
  backgroundVariant: 'white',
  spacing: 'default',
  maxWidth: 'default',
  variant: 'centered',
  quote: 'Design is not just what it looks like and feels like. Design is how it works.',
  attribution: 'Steve Jobs',
  role: 'Co-founder, Apple',
  image: null,
};

export const pullquoteSplit: PullquoteBlock = {
  ...pullquoteFull,
  _key: 'test-pq-2',
  variant: 'split',
};

export const pullquoteSidebar: PullquoteBlock = {
  ...pullquoteFull,
  _key: 'test-pq-3',
  variant: 'sidebar',
};

export const pullquoteMinimal: PullquoteBlock = {
  _type: 'pullquote',
  _key: 'test-pq-4',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  variant: null,
  quote: 'Less is more.',
  attribution: null,
  role: null,
  image: null,
};
