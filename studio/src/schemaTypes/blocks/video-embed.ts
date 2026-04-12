import {defineField} from 'sanity'
import {PlayIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'
import {YouTubePreview} from './YouTubePreview'

export const videoEmbed = defineBlock({
  name: 'videoEmbed',
  title: 'Video Embed',
  icon: PlayIcon,
  components: {preview: YouTubePreview},
  preview: {
    select: {title: 'title', subtitle: 'videoUrl'},
  },
  fields: [
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      validation: (Rule) =>
        Rule.required()
          .uri({scheme: ['https']})
          .custom((url) => {
            if (!url) return true
            const isYouTube =
              /youtube\.com\/watch\?v=/.test(url) ||
              /youtu\.be\//.test(url) ||
              /youtube\.com\/embed\//.test(url) ||
              /youtube\.com\/shorts\//.test(url)
            return isYouTube || 'Only YouTube URLs are supported'
          }),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Accessible title for the video player',
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'text',
      description: 'Optional caption displayed below the video',
    }),
  ],
})
