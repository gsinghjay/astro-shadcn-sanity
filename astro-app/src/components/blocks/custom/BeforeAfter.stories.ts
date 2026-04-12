import BeforeAfter from './BeforeAfter.astro'

const sharedBeforeImage = {
  url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=500&fit=crop',
  alt: 'Before renovation',
}

const sharedAfterImage = {
  url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop',
  alt: 'After renovation',
}

export default {
  title: 'Components/BeforeAfter',
  component: BeforeAfter,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Before/after image comparison block with side-by-side, stacked, and toggle layouts. Interactive slider is a future JS enhancement.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['side-by-side', 'stacked', 'toggle'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    beforeLabel: { control: 'text', description: 'Label for the before image' },
    afterLabel: { control: 'text', description: 'Label for the after image' },
    caption: { control: 'text', description: 'Caption text below images' },
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

export const SideBySide = {
  args: {
    _type: 'beforeAfter',
    _key: 'story-beforeafter-side',
    variant: 'side-by-side',
    heading: 'The Transformation',
    beforeImage: sharedBeforeImage,
    afterImage: sharedAfterImage,
    caption: 'A complete renovation of the main living space.',
  },
}

export const Stacked = {
  args: {
    _type: 'beforeAfter',
    _key: 'story-beforeafter-stacked',
    variant: 'stacked',
    heading: 'Project Results',
    beforeImage: sharedBeforeImage,
    afterImage: sharedAfterImage,
    beforeLabel: 'Original',
    afterLabel: 'Updated',
    caption: 'Scroll down to compare the original and updated designs.',
  },
}

export const Toggle = {
  args: {
    _type: 'beforeAfter',
    _key: 'story-beforeafter-toggle',
    variant: 'toggle',
    heading: 'Compare Versions',
    beforeImage: sharedBeforeImage,
    afterImage: sharedAfterImage,
    beforeLabel: 'Version 1',
    afterLabel: 'Version 2',
  },
}
