import {defineField} from 'sanity'
import {PlayIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'
import {headerFields, validateYouTubeUrl} from '../helpers/commonFields'
import {YouTubePreview} from './YouTubePreview'

export const videoEmbed = defineBlock({
  name: 'videoEmbed',
  title: 'Video Embed',
  icon: PlayIcon,
  components: {preview: YouTubePreview},
  preview: {
    select: {title: 'heading', subtitle: 'youtubeUrl'},
  },
  variants: [
    {name: 'full-width', title: 'Full Width'},
    {name: 'split', title: 'Split'},
    {name: 'split-asymmetric', title: 'Split Asymmetric'},
  ],
  fields: [
    ...headerFields(),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      description: 'YouTube video URL (e.g., https://www.youtube.com/watch?v=...)',
      validation: (Rule) =>
        Rule.required()
          .uri({scheme: ['https']})
          .custom(validateYouTubeUrl),
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
          description: 'Describe the thumbnail for screen readers',
        }),
      ],
    }),
  ],
})
