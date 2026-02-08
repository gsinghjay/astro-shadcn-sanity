import HeroBanner from './HeroBanner.astro'

export default {
  title: 'Blocks/HeroBanner',
  component: HeroBanner,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    block: {
      _type: 'heroBanner',
      _key: 'story-hero-1',
      headline: 'Welcome to YWCC Capstone',
      subheadline: 'Building real-world solutions with industry partners',
      layout: 'centered',
      ctaText: 'Learn More',
      ctaUrl: '/about',
      secondaryCtaText: 'Contact Us',
      secondaryCtaUrl: '/contact',
    },
  },
}

export const WithBackgroundImages = {
  args: {
    block: {
      _type: 'heroBanner',
      _key: 'story-hero-2',
      headline: 'Innovation Starts Here',
      subheadline: 'Connecting students with real-world challenges',
      layout: 'centered',
      ctaText: 'Get Started',
      ctaUrl: '/apply',
      backgroundImages: [
        { url: 'https://placehold.co/1920x1080/1a1a2e/ffffff?text=Slide+1', alt: 'Campus view' },
        { url: 'https://placehold.co/1920x1080/2a2a3e/ffffff?text=Slide+2', alt: 'Students working' },
      ],
    },
  },
}

export const Minimal = {
  args: {
    block: {
      _type: 'heroBanner',
      _key: 'story-hero-3',
      headline: 'Capstone Projects',
      layout: 'full',
    },
  },
}
