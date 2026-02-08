import NativeCarouselStory from './NativeCarouselStory.astro'

export default {
  title: 'UI/NativeCarousel',
  component: NativeCarouselStory,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    slides: ['Slide 1', 'Slide 2', 'Slide 3', 'Slide 4'],
  },
}

export const TwoSlides = {
  args: {
    slides: ['Before', 'After'],
  },
}
