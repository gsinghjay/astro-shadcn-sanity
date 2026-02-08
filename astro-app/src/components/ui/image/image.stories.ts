import ImageStory from './ImageStory.astro'

export default {
  title: 'UI/Image',
  component: ImageStory,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    src: 'https://placehold.co/800x400/e2e8f0/475569?text=Image+Component',
    alt: 'Placeholder image',
    width: 800,
    height: 400,
  },
}

export const Square = {
  args: {
    src: 'https://placehold.co/400x400/e2e8f0/475569?text=Square',
    alt: 'Square placeholder',
    width: 400,
    height: 400,
  },
}
