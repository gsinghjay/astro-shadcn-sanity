import Newsletter from './Newsletter.astro'

export default {
  title: 'Components/Newsletter',
  component: Newsletter,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Email newsletter signup block with inline, banner, and split layouts. Form is presentational only.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['inline', 'banner', 'split', 'brutalist'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    description: { control: 'text', description: 'Section description' },
    placeholderText: { control: 'text', description: 'Email input placeholder text' },
    buttonText: { control: 'text', description: 'Submit button text' },
    disclaimer: { control: 'text', description: 'Privacy disclaimer text' },
    backgroundVariant: {
      control: { type: 'select' },
      options: ['white', 'light', 'dark', 'primary', 'hatched', 'hatched-light'],
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

export const Inline = {
  args: {
    _type: 'newsletter',
    _key: 'story-newsletter-inline',
    variant: 'inline',
    heading: 'Stay in the Loop',
    description: 'Get the latest updates, tips, and resources delivered straight to your inbox.',
    placeholderText: 'Enter your email',
    buttonText: 'Subscribe',
    disclaimer: 'We respect your privacy. Unsubscribe at any time.',
  },
}

export const Banner = {
  args: {
    _type: 'newsletter',
    _key: 'story-newsletter-banner',
    variant: 'banner',
    heading: 'Subscribe to Our Newsletter',
    description: 'Weekly insights and curated resources.',
    placeholderText: 'you@example.com',
    buttonText: 'Join Now',
    backgroundVariant: 'light',
  },
}

export const Split = {
  args: {
    _type: 'newsletter',
    _key: 'story-newsletter-split',
    variant: 'split',
    heading: 'Join Our Community',
    description: 'Be the first to know about new features, events, and exclusive content. No spam, ever.',
    placeholderText: 'Enter your email address',
    buttonText: 'Get Started',
    disclaimer: 'By subscribing, you agree to our Privacy Policy.',
    backgroundVariant: 'dark',
  },
}

export const Brutalist = {
  args: {
    _type: 'newsletter',
    _key: 'story-newsletter-brutalist',
    variant: 'brutalist',
    heading: 'Stay Connected',
    description: 'Program updates, showcase dates, and partnership opportunities.',
    placeholderText: 'you@company.com',
    buttonText: 'Subscribe',
    disclaimer: 'No spam. Unsubscribe anytime.',
    backgroundVariant: 'dark',
  },
}
