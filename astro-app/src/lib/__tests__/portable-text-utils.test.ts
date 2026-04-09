import { describe, test, expect } from 'vitest';
import { portableTextToPlainText, portableTextToHtml } from '../portable-text-utils';
import type { PortableTextBlock } from '@portabletext/types';

const mockBlocks: PortableTextBlock[] = [
  {
    _type: 'block',
    _key: 'k1',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: 's1', text: 'Hello world', marks: [] }],
  },
  {
    _type: 'block',
    _key: 'k2',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: 's2', text: 'Second paragraph', marks: [] }],
  },
];

describe('portableTextToPlainText', () => {
  test('converts blocks to plain text', () => {
    const result = portableTextToPlainText(mockBlocks);
    expect(result).toBe('Hello world\nSecond paragraph');
  });

  test('returns empty string for empty array', () => {
    expect(portableTextToPlainText([])).toBe('');
  });
});

describe('portableTextToHtml', () => {
  test('converts blocks to HTML', () => {
    const result = portableTextToHtml(mockBlocks);
    expect(result).toContain('Hello world');
    expect(result).toContain('<p>');
  });
});
