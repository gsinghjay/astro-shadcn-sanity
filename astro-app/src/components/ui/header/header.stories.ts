import HeaderStory from './HeaderStory.astro'

export default {
  title: 'UI/Header',
  component: HeaderStory,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'floating'] },
  },
}

export const Default = {
  args: {
    variant: 'default',
    siteName: 'YWCC Capstone',
  },
}

export const Floating = {
  args: {
    variant: 'floating',
    siteName: 'YWCC Capstone',
  },
}

export const CustomBrand = {
  args: {
    variant: 'default',
    siteName: 'My Project',
  },
}
