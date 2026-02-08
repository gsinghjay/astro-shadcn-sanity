import SectionStory from './SectionStory.astro'

export default {
  title: 'UI/Section',
  component: SectionStory,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    layout: { control: 'select', options: ['content', 'grid', 'split', 'prose'] },
    variant: { control: 'select', options: ['default', 'floating'] },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
  },
}

export const Content = {
  args: {
    layout: 'content',
    variant: 'default',
    size: 'default',
  },
}

export const Grid = {
  args: {
    layout: 'grid',
    variant: 'default',
    size: 'default',
  },
}

export const Split = {
  args: {
    layout: 'split',
    variant: 'default',
    size: 'default',
  },
}

export const Prose = {
  args: {
    layout: 'prose',
    variant: 'default',
    size: 'default',
  },
}

export const SmallSize = {
  args: {
    layout: 'content',
    variant: 'default',
    size: 'sm',
  },
}
