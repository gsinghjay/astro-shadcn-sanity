import Divider from './Divider.astro'

export default {
  title: 'Components/Divider',
  component: Divider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Visual separator between content sections. Supports line, short, labeled, and space-only variants.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['line', 'short', 'labeled', 'space'],
      description: 'Layout variant',
    },
    label: { control: 'text', description: 'Label text (labeled variant only)' },
    backgroundVariant: {
      control: { type: 'select' },
      options: ['white', 'light', 'dark', 'primary'],
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

export const Line = {
  args: {
    _type: 'divider',
    _key: 'story-div-line',
    variant: 'line',
    spacing: 'default',
    maxWidth: 'default',
  },
}

export const Short = {
  args: {
    _type: 'divider',
    _key: 'story-div-short',
    variant: 'short',
    spacing: 'default',
    maxWidth: 'default',
  },
}

export const Labeled = {
  args: {
    _type: 'divider',
    _key: 'story-div-labeled',
    variant: 'labeled',
    label: 'Section 02',
    spacing: 'default',
    maxWidth: 'default',
  },
}

export const LabeledChapter = {
  args: {
    _type: 'divider',
    _key: 'story-div-labeled2',
    variant: 'labeled',
    label: 'Next Chapter',
    spacing: 'large',
    maxWidth: 'default',
  },
}
