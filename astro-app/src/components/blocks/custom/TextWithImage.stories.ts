import TextWithImage from './TextWithImage.astro'

export default {
  title: 'Components/TextWithImage',
  component: TextWithImage,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Split-layout block pairing prose content with an image. Supports left/right positioning and asymmetric ratios.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['split', 'reversed', 'floating', 'split-asymmetric'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    imagePosition: {
      control: { type: 'select' },
      options: ['left', 'right'],
      description: 'Image placement relative to text',
    },
    backgroundVariant: {
      control: { type: 'select' },
      options: ['white', 'light', 'dark', 'primary'],
      description: 'Background color theme',
    },
    spacing: {
      control: { type: 'select' },
      options: ['none', 'small', 'default', 'large'],
      description: 'Vertical padding',
    },
    maxWidth: {
      control: { type: 'select' },
      options: ['narrow', 'default', 'full'],
      description: 'Maximum content width',
    },
  },
}

export const ImageRight = {
  args: {
    _type: 'textWithImage',
    _key: 'story-twi-1',
    heading: 'Lorem Ipsum Dolor Sit Amet Elit',
    content: [
      { _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.' }] },
    ],
    image: { asset: { url: 'https://placehold.co/800x600/e2e8f0/475569?text=Placeholder' }, alt: 'Placeholder image' },
    imagePosition: 'right',
  },
}

export const ImageLeft = {
  args: {
    _type: 'textWithImage',
    _key: 'story-twi-2',
    heading: 'Consectetur Adipiscing Elit Sed Do',
    content: [
      { _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.' }] },
    ],
    image: { asset: { url: 'https://placehold.co/800x600/e2e8f0/475569?text=Placeholder' }, alt: 'Placeholder image' },
    imagePosition: 'left',
  },
}

export const Minimal = {
  args: {
    _type: 'textWithImage',
    _key: 'story-twi-3',
    heading: 'Eiusmod Tempor Incididunt',
    content: [
      { _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' }] },
    ],
    image: { asset: { url: 'https://placehold.co/800x600/e2e8f0/475569?text=Placeholder' }, alt: 'Placeholder image' },
  },
}
