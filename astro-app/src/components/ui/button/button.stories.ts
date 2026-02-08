import ButtonStory from './ButtonStory.astro'

export default {
  title: 'UI/Button',
  component: ButtonStory,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'],
    },
    text: { control: 'text' },
  },
}

export const Default = {
  args: {
    text: 'Button',
    variant: 'default',
    size: 'default',
  },
}

export const Secondary = {
  args: {
    text: 'Secondary',
    variant: 'secondary',
    size: 'default',
  },
}

export const Outline = {
  args: {
    text: 'Outline',
    variant: 'outline',
    size: 'default',
  },
}

export const Ghost = {
  args: {
    text: 'Ghost',
    variant: 'ghost',
    size: 'default',
  },
}
