import CtaBanner from './CtaBanner.astro'

const sharedImage = {
  _key: 'img-1',
  _type: 'image',
  asset: {
    _id: 'image-placeholder-960x600-jpg',
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=960&h=600&fit=crop',
    metadata: {
      lqip: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQN',
      dimensions: { width: 960, height: 600, aspectRatio: 1.6 },
    },
  },
  alt: 'Team collaboration',
}

const sharedButtons = [
  { _key: 'btn-1', text: 'Get Started', url: '/sponsors' },
  { _key: 'btn-2', text: 'Learn More', url: '/about', variant: 'outline' },
]

export default {
  title: 'Blocks/CtaBanner',
  component: CtaBanner,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Centered = {
  args: {
    _type: 'ctaBanner',
    _key: 'story-cta-centered',
    variant: 'centered',
    heading: 'Lorem Ipsum Dolor Sit Amet?',
    description: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam.',
    backgroundVariant: 'dark',
    ctaButtons: sharedButtons,
  },
}

export const Split = {
  args: {
    _type: 'ctaBanner',
    _key: 'story-cta-split',
    variant: 'split',
    heading: 'Ready to Build Something Great?',
    description: 'Join thousands of developers already building with our platform.',
    backgroundVariant: 'primary',
    backgroundImages: [sharedImage],
    ctaButtons: sharedButtons,
  },
}

export const Spread = {
  args: {
    _type: 'ctaBanner',
    _key: 'story-cta-spread',
    variant: 'spread',
    heading: 'Transform Your Workflow Today',
    description: 'Streamline your processes and ship faster than ever before.',
    backgroundVariant: 'dark',
    ctaButtons: sharedButtons,
  },
}

export const Overlay = {
  args: {
    _type: 'ctaBanner',
    _key: 'story-cta-overlay',
    variant: 'overlay',
    heading: 'Start Your Journey',
    description: 'Everything you need to build, launch, and grow your project.',
    backgroundVariant: 'dark',
    backgroundImages: [sharedImage],
    ctaButtons: sharedButtons,
  },
}

export const Minimal = {
  args: {
    _type: 'ctaBanner',
    _key: 'story-cta-minimal',
    variant: 'centered',
    heading: 'Consectetur Adipiscing',
    backgroundVariant: 'light',
    ctaButtons: [
      { _key: 'btn-1', text: 'Contact Us', url: '/contact' },
    ],
  },
}
