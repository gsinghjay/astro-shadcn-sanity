import {defineField} from 'sanity'
import {EarthGlobeIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const embedBlock = defineBlock({
  name: 'embedBlock',
  title: 'Embed Block',
  icon: EarthGlobeIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'default', title: 'Default'},
    {name: 'contained', title: 'Contained'},
    {name: 'full-width', title: 'Full Width'},
  ],
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.max(150)}),
    defineField({
      name: 'embedUrl',
      title: 'Embed URL',
      type: 'url',
      description: 'URL for iframe-based embeds (e.g., YouTube, Vimeo, Google Maps). Use this OR Raw Embed Code — not both.',
      validation: (Rule) =>
        Rule.uri({scheme: ['http', 'https']}).custom((value, context) => {
          const parent = context.parent as {rawEmbedCode?: string} | undefined
          if (!value && !parent?.rawEmbedCode) {
            return 'Either Embed URL or Raw Embed Code is required'
          }
          return true
        }),
    }),
    defineField({
      name: 'rawEmbedCode',
      title: 'Raw Embed Code',
      type: 'text',
      rows: 8,
      description:
        'Paste raw HTML/script embed code (e.g., Formsite, Typeform). Use this OR Embed URL — not both. If both are set, this takes precedence. WARNING: Only paste embed codes from trusted sources.',
    }),
    defineField({name: 'caption', title: 'Caption', type: 'string', description: 'Caption displayed below the embed', validation: (Rule) => Rule.max(200)}),
  ],
})
