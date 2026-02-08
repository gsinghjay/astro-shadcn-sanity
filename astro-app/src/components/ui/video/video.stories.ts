import Video from './video.astro'

export default {
  title: 'UI/Video',
  component: Video,
  tags: ['autodocs'],
}

export const YouTube = {
  args: {
    src: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
  },
}
