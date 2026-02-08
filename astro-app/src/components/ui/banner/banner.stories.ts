import BannerStory from './BannerStory.astro'

export default {
  title: 'UI/Banner',
  component: BannerStory,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'floating'] },
  },
}

export const Default = {
  args: {
    title: 'Applications for Spring 2027 are now open!',
    variant: 'default',
  },
}

export const Floating = {
  args: {
    title: 'New: Dark mode is now available.',
    variant: 'floating',
  },
}
