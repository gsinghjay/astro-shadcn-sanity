import LogoStory from './LogoStory.astro'

export default {
  title: 'UI/Logo',
  component: LogoStory,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    text: 'YWCC Capstone',
  },
}

export const AsLink = {
  args: {
    text: 'YWCC Capstone',
    href: '/',
  },
}

export const CustomText = {
  args: {
    text: 'My Brand',
    href: '/',
  },
}
