import TextWithImage from './TextWithImage.astro'

export default {
  title: 'Blocks/TextWithImage',
  component: TextWithImage,
  tags: ['autodocs'],
}

export const ImageRight = {
  args: {
    block: {
      _type: 'textWithImage',
      _key: 'story-twi-1',
      heading: 'Lorem Ipsum Dolor Sit Amet Elit',
      content: [
        { _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.' }] },
      ],
      image: { asset: { url: 'https://placehold.co/800x600/e2e8f0/475569?text=Placeholder' }, alt: 'Placeholder image' },
      imagePosition: 'right',
    },
  },
}

export const ImageLeft = {
  args: {
    block: {
      _type: 'textWithImage',
      _key: 'story-twi-2',
      heading: 'Consectetur Adipiscing Elit Sed Do',
      content: [
        { _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.' }] },
      ],
      image: { asset: { url: 'https://placehold.co/800x600/e2e8f0/475569?text=Placeholder' }, alt: 'Placeholder image' },
      imagePosition: 'left',
    },
  },
}

export const Minimal = {
  args: {
    block: {
      _type: 'textWithImage',
      _key: 'story-twi-3',
      heading: 'Eiusmod Tempor Incididunt',
      content: [
        { _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' }] },
      ],
      image: { asset: { url: 'https://placehold.co/800x600/e2e8f0/475569?text=Placeholder' }, alt: 'Placeholder image' },
    },
  },
}
