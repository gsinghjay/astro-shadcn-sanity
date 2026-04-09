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
  title: 'Components/CtaBanner',
  component: CtaBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Call-to-action banner with heading, body text, and action buttons. Supports centered, split, spread, and overlay layouts. Typically placed mid-page or before footer.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['centered', 'split', 'spread', 'overlay', 'brutalist', 'data-cta'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    description: { control: 'text', description: 'Body text' },
    backgroundVariant: {
      control: { type: 'select' },
      options: ['white', 'light', 'dark', 'primary', 'hatched', 'hatched-light', 'blueprint', 'mono', 'stripe'],
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

export const HatchedDark = {
  args: {
    _type: 'ctaBanner',
    _key: 'story-cta-hatched',
    variant: 'centered',
    heading: 'Engineering Excellence Starts Here',
    description: 'Join a community of innovators pushing the boundaries of technology and design.',
    backgroundVariant: 'hatched',
    ctaButtons: sharedButtons,
  },
}

export const HatchedLight = {
  args: {
    _type: 'ctaBanner',
    _key: 'story-cta-hatched-light',
    variant: 'centered',
    heading: 'Build With Confidence',
    description: 'Light hatched pattern for a softer technical aesthetic.',
    backgroundVariant: 'hatched-light',
    ctaButtons: sharedButtons,
  },
}

export const MonoDark = {
  args: {
    _type: 'ctaBanner',
    _key: 'story-cta-mono',
    variant: 'centered',
    heading: 'Terminal-Grade Infrastructure',
    description: 'Near-black mono background for a terminal aesthetic.',
    backgroundVariant: 'mono',
    ctaButtons: sharedButtons,
  },
}

export const StripePaper = {
  args: {
    _type: 'ctaBanner',
    _key: 'story-cta-stripe',
    variant: 'centered',
    heading: 'Document Your Progress',
    description: 'Ruled engineering paper background for a technical notebook feel.',
    backgroundVariant: 'stripe',
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

export const Brutalist = {
  args: {
    _type: 'ctaBanner',
    _key: 'story-cta-brutalist',
    variant: 'brutalist',
    heading: 'Partner with Top Engineering Talent',
    backgroundVariant: 'hatched',
    ctaButtons: [
      { _key: 'btn-1', text: 'Start a Partnership', url: '/contact' },
    ],
  },
}

export const DataCta = {
  args: {
    _type: 'ctaBanner',
    _key: 'story-cta-data',
    variant: 'data-cta',
    heading: 'The Numbers Speak',
    description: 'Real impact, measurable outcomes.',
    backgroundVariant: 'dark',
    stats: [
      { _key: 'ds1', value: '94%', label: 'Placement Rate' },
      { _key: 'ds2', value: '$2.4M', label: 'Research Funding' },
      { _key: 'ds3', value: '10+', label: 'Fortune 500 Partners' },
    ],
    ctaButtons: [{
      "_key": "btn-1",
      "text": "Become a Sponsor",
      "url": "/sponsors"
    }, {
      "_key": "btn-2",
      "text": "Become a Sponsor",
      "url": "/sponsors"
    }, {
      "_key": "btn-3",
      "text": "Become a Sponsor",
      "url": "/sponsors"
    }],
  },
}
