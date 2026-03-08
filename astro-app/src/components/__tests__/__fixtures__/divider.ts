import type { DividerBlock } from '@/lib/types';

export const dividerLine: DividerBlock = {
  _type: 'divider',
  _key: 'test-divider-1',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  variant: 'line',
  label: null,
};

export const dividerShort: DividerBlock = {
  _type: 'divider',
  _key: 'test-divider-2',
  backgroundVariant: null,
  spacing: 'small',
  maxWidth: 'default',
  variant: 'short',
  label: null,
};

export const dividerLabeled: DividerBlock = {
  _type: 'divider',
  _key: 'test-divider-3',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  variant: 'labeled',
  label: 'Section 1',
};

export const dividerMinimal: DividerBlock = {
  _type: 'divider',
  _key: 'test-divider-4',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  variant: null,
  label: null,
};
