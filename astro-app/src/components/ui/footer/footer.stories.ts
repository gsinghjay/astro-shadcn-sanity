import FooterStory from './FooterStory.astro'

export default {
  title: 'UI/Footer',
  component: FooterStory,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'floating'] },
  },
}

export const Default = {
  args: {
    variant: 'default',
  },
}

export const Floating = {
  args: {
    variant: 'floating',
  },
}
