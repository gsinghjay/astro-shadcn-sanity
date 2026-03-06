import HeroBanner from './HeroBanner.astro'

const sharedImages = [
  { _key: 'img-1', asset: { url: 'https://placehold.co/1920x1080/1a1a2e/ffffff?text=Slide+1' }, alt: 'Placeholder slide 1' },
  { _key: 'img-2', asset: { url: 'https://placehold.co/1920x1080/2a2a3e/ffffff?text=Slide+2' }, alt: 'Placeholder slide 2' },
]

const sharedButtons = [
  { _key: 'btn-1', text: 'Get Started', url: '/about' },
  { _key: 'btn-2', text: 'Contact Us', url: '/contact', variant: 'outline' },
]

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
    variant: 'centered',
    heading: 'Lorem Ipsum Dolor Sit',
    subheading: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
    alignment: 'center',
    ctaButtons: sharedButtons,
  },
}

export const Centered = {
  args: {
    _type: 'heroBanner',
    _key: 'story-hero-centered',
    variant: 'centered',
    heading: 'Centered Hero with Carousel',
    subheading: 'Glass card content over background carousel — the default layout',
    alignment: 'center',
    ctaButtons: sharedButtons,
    backgroundImages: sharedImages,
  },
}

export const Overlay = {
  args: {
    _type: 'heroBanner',
    _key: 'story-hero-overlay',
    variant: 'overlay',
    heading: 'Overlay Hero',
    subheading: 'Text directly over darkened background — no glass card',
    alignment: 'center',
    ctaButtons: sharedButtons,
    backgroundImages: sharedImages,
  },
}

export const Split = {
  args: {
    _type: 'heroBanner',
    _key: 'story-hero-split',
    variant: 'split',
    heading: 'Split Hero Layout',
    subheading: 'Text and buttons on the left, single image on the right',
    ctaButtons: sharedButtons,
    backgroundImages: sharedImages,
  },
}

export const SplitAsymmetric = {
  args: {
    _type: 'heroBanner',
    _key: 'story-hero-split-asym',
    variant: 'split-asymmetric',
    heading: 'Asymmetric Split',
    subheading: 'Smaller text column, larger image column (2fr:3fr)',
    ctaButtons: sharedButtons,
    backgroundImages: sharedImages,
  },
}

export const Spread = {
  args: {
    _type: 'heroBanner',
    _key: 'story-hero-spread',
    variant: 'spread',
    heading: 'Spread Hero Layout',
    subheading: 'Content spread with background image',
    ctaButtons: sharedButtons,
    backgroundImages: sharedImages,
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
