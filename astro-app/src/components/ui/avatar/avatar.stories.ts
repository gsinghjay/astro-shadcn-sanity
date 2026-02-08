import AvatarStory from './AvatarStory.astro'

export default {
  title: 'UI/Avatar',
  component: AvatarStory,
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text' },
    alt: { control: 'text' },
    fallback: { control: 'text' },
  },
}

export const WithImage = {
  args: {
    src: 'https://placehold.co/88x88/1a1a2e/ffffff?text=JD',
    alt: 'John Doe',
  },
}

export const WithFallback = {
  args: {
    fallback: 'JD',
  },
}
