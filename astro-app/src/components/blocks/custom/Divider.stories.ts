import Divider from './Divider.astro'

export default {
  title: 'Blocks/Divider',
  component: Divider,
  tags: ['autodocs'],
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
