import type { RichTextBlock } from '@/lib/types';

export const richTextFull: RichTextBlock = {
  _type: 'richText',
  _key: 'test-rt-1',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  content: [
    {
      _type: 'block',
      _key: 'b1',
      style: 'h2',
      children: [{ _type: 'span', _key: 'sp1', text: 'About Our Mission', marks: [] }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'b2',
      style: 'normal',
      children: [{ _type: 'span', _key: 'sp2', text: 'We empower women in technology.', marks: [] }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'b3',
      style: 'h3',
      children: [{ _type: 'span', _key: 'sp3', text: 'Our Values', marks: [] }],
      markDefs: [],
    },
  ],
};

export const richTextWithMarks: RichTextBlock = {
  _type: 'richText',
  _key: 'test-rt-3',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  content: [
    {
      _type: 'block',
      _key: 'b1',
      style: 'normal',
      children: [
        { _type: 'span', _key: 'sp1', text: 'Click ', marks: [] },
        { _type: 'span', _key: 'sp2', text: 'here', marks: ['strong'] },
        { _type: 'span', _key: 'sp3', text: ' for more.', marks: [] },
      ],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'b2',
      style: 'normal',
      children: [
        { _type: 'span', _key: 'sp4', text: 'Visit ', marks: [] },
        { _type: 'span', _key: 'sp5', text: 'our site', marks: ['link1'] },
        { _type: 'span', _key: 'sp6', text: ' today.', marks: [] },
      ],
      markDefs: [{ _type: 'link', _key: 'link1', href: 'https://example.com' }],
    },
  ],
};

export const richTextMinimal: RichTextBlock = {
  _type: 'richText',
  _key: 'test-rt-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  content: null,
};
