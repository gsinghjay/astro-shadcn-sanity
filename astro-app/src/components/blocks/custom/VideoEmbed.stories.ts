import VideoEmbed from './VideoEmbed.astro'

export default {
  title: 'Components/VideoEmbed',
  component: VideoEmbed,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Embeds a YouTube video with optional heading and description. Supports 3 layout variants: full-width, split (text + video side by side), and split-asymmetric (narrow sticky text with large video).',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['full-width', 'split', 'split-asymmetric'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Heading above the video' },
    description: { control: 'text', description: 'Description text' },
    youtubeUrl: { control: 'text', description: 'YouTube video URL' },
    backgroundVariant: {
      control: { type: 'select' },
      options: ['white', 'light', 'dark', 'primary', 'hatched', 'hatched-light'],
      description: 'Background color theme',
    },
    spacing: {
      control: { type: 'select' },
      options: ['none', 'small', 'default', 'large'],
      description: 'Vertical padding',
    },
    maxWidth: {
      control: { type: 'select' },
      options: ['narrow', 'default', 'full'],
      description: 'Maximum content width',
    },
  },
}

export const FullWidth = {
  args: {
    _type: 'videoEmbed',
    _key: 'story-video-1',
    variant: 'full-width',
    heading: 'Watch Our Latest Presentation',
    description: 'Learn about our capstone program and how students collaborate with industry sponsors on real-world projects.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
}

export const FullWidthNoText = {
  args: {
    _type: 'videoEmbed',
    _key: 'story-video-2',
    variant: 'full-width',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
}

export const Split = {
  args: {
    _type: 'videoEmbed',
    _key: 'story-video-3',
    variant: 'split',
    heading: 'Project Showcase',
    description: 'See how our teams delivered innovative solutions for their sponsors in the Spring 2026 semester.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
}

export const SplitAsymmetric = {
  args: {
    _type: 'videoEmbed',
    _key: 'story-video-4',
    variant: 'split-asymmetric',
    heading: 'Behind the Scenes',
    description: 'A day in the life of a capstone team — from stand-ups to sponsor demos.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
}
