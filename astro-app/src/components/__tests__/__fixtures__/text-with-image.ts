import type { TextWithImageBlock } from '@/lib/types';

export const textWithImageFull: TextWithImageBlock = {
  _type: 'textWithImage',
  _key: 'test-twi-1',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  heading: 'Our Story',
  content: [
    {
      _type: 'block',
      _key: 'b1',
      style: 'normal',
      children: [{ _type: 'span', _key: 'sp1', text: 'Founded in 2020, we have grown rapidly.', marks: [] }],
      markDefs: [],
    },
  ],
  image: {
    asset: { _id: 'img-twi', url: 'https://cdn.sanity.io/test/story.jpg', metadata: null },
    alt: 'Team photo',
  },
  imagePosition: 'right',
};

export const textWithImageMinimal: TextWithImageBlock = {
  _type: 'textWithImage',
  _key: 'test-twi-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  heading: null,
  content: null,
  image: null,
  imagePosition: null,
};
