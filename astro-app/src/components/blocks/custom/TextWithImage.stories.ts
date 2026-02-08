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
      label: 'About Us',
      headline: 'Lorem Ipsum Dolor Sit Amet Elit',
      body: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.',
      imageUrl: 'https://placehold.co/800x600/e2e8f0/475569?text=Placeholder',
      imagePosition: 'right',
      ctaText: 'Learn More',
      ctaUrl: '/about',
    },
  },
}

export const ImageLeft = {
  args: {
    block: {
      _type: 'textWithImage',
      _key: 'story-twi-2',
      label: 'Our Impact',
      headline: 'Consectetur Adipiscing Elit Sed Do',
      body: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
      imageUrl: 'https://placehold.co/800x600/e2e8f0/475569?text=Placeholder',
      imagePosition: 'left',
      ctaText: 'View Projects',
      ctaUrl: '/projects',
    },
  },
}

export const Minimal = {
  args: {
    block: {
      _type: 'textWithImage',
      _key: 'story-twi-3',
      headline: 'Eiusmod Tempor Incididunt',
      body: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      imageUrl: 'https://placehold.co/800x600/e2e8f0/475569?text=Placeholder',
    },
  },
}
