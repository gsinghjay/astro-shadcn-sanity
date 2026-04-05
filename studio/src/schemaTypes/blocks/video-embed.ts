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
    select: {title: 'heading', subtitle: 'videoUrl'},
  },
  variants: [
    {name: 'full-width', title: 'Full Width'},
    {name: 'split', title: 'Split'},
    {name: 'split-asymmetric', title: 'Split Asymmetric'},
  ],
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
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
      name: 'posterImage',
      title: 'Poster Image',
      type: 'image',
      description: 'Custom thumbnail (optional — falls back to YouTube thumbnail)',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
  ],
})
