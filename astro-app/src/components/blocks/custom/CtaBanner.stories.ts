import CtaBanner from './CtaBanner.astro'

export default {
  title: 'Blocks/CtaBanner',
  component: CtaBanner,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    block: {
      _type: 'ctaBanner',
      _key: 'story-cta-1',
      heading: 'Lorem Ipsum Dolor Sit Amet?',
      description: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam.',
      backgroundVariant: 'dark',
      ctaButtons: [
        { _key: 'btn-1', text: 'Get Started', url: '/sponsors' },
        { _key: 'btn-2', text: 'Learn More', url: '/about', variant: 'outline' },
      ],
    },
  },
}

export const Minimal = {
  args: {
    block: {
      _type: 'ctaBanner',
      _key: 'story-cta-2',
      heading: 'Consectetur Adipiscing',
      backgroundVariant: 'light',
      ctaButtons: [
        { _key: 'btn-1', text: 'Contact Us', url: '/contact' },
      ],
    },
  },
}
