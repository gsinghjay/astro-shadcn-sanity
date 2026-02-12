import HeroBanner from './HeroBanner.astro'

export default {
  title: 'Blocks/HeroBanner',
  component: HeroBanner,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    _type: 'heroBanner',
    _key: 'story-hero-1',
    heading: 'Lorem Ipsum Dolor Sit',
    subheading: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
    alignment: 'center',
    ctaButtons: [
      { _key: 'btn-1', text: 'Learn More', url: '/about' },
      { _key: 'btn-2', text: 'Contact Us', url: '/contact', variant: 'outline' },
    ],
  },
}

export const WithBackgroundImages = {
  args: {
    _type: 'heroBanner',
    _key: 'story-hero-2',
    heading: 'Consectetur Adipiscing Elit',
    subheading: 'Ut enim ad minim veniam quis nostrud exercitation ullamco',
    alignment: 'center',
    ctaButtons: [
      { _key: 'btn-1', text: 'Get Started', url: '/apply' },
    ],
    backgroundImages: [
      { _key: 'img-1', asset: { url: 'https://placehold.co/1920x1080/1a1a2e/ffffff?text=Slide+1' }, alt: 'Placeholder slide 1' },
      { _key: 'img-2', asset: { url: 'https://placehold.co/1920x1080/2a2a3e/ffffff?text=Slide+2' }, alt: 'Placeholder slide 2' },
    ],
  },
}

export const Minimal = {
  args: {
    _type: 'heroBanner',
    _key: 'story-hero-3',
    heading: 'Amet Consectetur',
    alignment: 'full',
  },
}
