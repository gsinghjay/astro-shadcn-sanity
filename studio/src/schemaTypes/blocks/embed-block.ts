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
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({
      name: 'embedUrl',
      title: 'Embed URL',
      type: 'url',
      validation: (Rule) => Rule.required().uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'aspectRatio',
      title: 'Aspect Ratio',
      type: 'string',
      initialValue: '16/9',
    }),
    defineField({name: 'caption', title: 'Caption', type: 'string'}),
  ],
})
