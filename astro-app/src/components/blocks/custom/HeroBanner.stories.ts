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
      headline: 'Lorem Ipsum Dolor Sit',
      subheadline: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
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
      headline: 'Consectetur Adipiscing Elit',
      subheadline: 'Ut enim ad minim veniam quis nostrud exercitation ullamco',
      layout: 'centered',
      ctaText: 'Get Started',
      ctaUrl: '/apply',
      backgroundImages: [
        { url: 'https://placehold.co/1920x1080/1a1a2e/ffffff?text=Slide+1', alt: 'Placeholder slide 1' },
        { url: 'https://placehold.co/1920x1080/2a2a3e/ffffff?text=Slide+2', alt: 'Placeholder slide 2' },
      ],
    },
  },
}

export const Minimal = {
  args: {
    block: {
      _type: 'heroBanner',
      _key: 'story-hero-3',
      headline: 'Amet Consectetur',
      layout: 'full',
    },
  },
}
