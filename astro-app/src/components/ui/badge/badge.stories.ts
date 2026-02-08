import BadgeStory from './BadgeStory.astro'

export default {
  title: 'UI/Badge',
  component: BadgeStory,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
    text: { control: 'text' },
  },
}

export const Default = {
  args: {
    text: 'Badge',
    variant: 'default',
  },
}
