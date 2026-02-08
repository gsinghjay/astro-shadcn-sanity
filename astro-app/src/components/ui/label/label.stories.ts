import LabelStory from './LabelStory.astro'

export default {
  title: 'UI/Label',
  component: LabelStory,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    text: 'Email Address',
  },
}

export const Required = {
  args: {
    text: 'Full Name *',
  },
}
