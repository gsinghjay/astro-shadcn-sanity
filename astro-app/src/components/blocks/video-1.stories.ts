import Video1 from './video-1.astro'

export default {
  title: 'Blocks/Video/Video1',
  component: Video1,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    links: [
      { text: 'Get Started', href: '#' },
      { text: 'Learn More', href: '#' },
    ],
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    list: ['First benefit of this product', 'Second benefit with details', 'Third key advantage'],
    item: {
      avatars: [
        { src: 'https://placehold.co/40x40', alt: 'User 1' },
        { src: 'https://placehold.co/40x40', alt: 'User 2' },
        { src: 'https://placehold.co/40x40', alt: 'User 3' },
      ],
      rating: 5,
      description: 'Loved by creators worldwide',
    },
  },
}
