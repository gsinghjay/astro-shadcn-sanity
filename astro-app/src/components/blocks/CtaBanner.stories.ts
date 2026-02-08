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
      headline: 'Ready to Partner With Us?',
      body: 'Join our sponsor program and connect with emerging talent while solving real business challenges.',
      ctaText: 'Become a Sponsor',
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
      headline: 'Get In Touch',
      ctaText: 'Contact Us',
      ctaUrl: '/contact',
      variant: 'light',
    },
  },
}
