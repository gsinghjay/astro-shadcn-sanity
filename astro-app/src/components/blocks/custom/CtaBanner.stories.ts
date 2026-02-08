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
      headline: 'Lorem Ipsum Dolor Sit Amet?',
      body: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam.',
      ctaText: 'Get Started',
      ctaUrl: '/sponsors',
      secondaryCtaText: 'Learn More',
      secondaryCtaUrl: '/about',
      variant: 'dark',
    },
  },
}

export const Minimal = {
  args: {
    block: {
      _type: 'ctaBanner',
      _key: 'story-cta-2',
      headline: 'Consectetur Adipiscing',
      ctaText: 'Contact Us',
      ctaUrl: '/contact',
      variant: 'light',
    },
  },
}
