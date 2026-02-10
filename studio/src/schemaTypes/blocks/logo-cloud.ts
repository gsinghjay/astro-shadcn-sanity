import {defineField} from 'sanity'
import {ImagesIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const logoCloud = defineBlock({
  name: 'logoCloud',
  title: 'Logo Cloud',
  icon: ImagesIcon,
  preview: {select: {title: 'heading'}},
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'autoPopulate',
      title: 'Auto-Populate',
      type: 'boolean',
      initialValue: true,
      description: 'Automatically pull all sponsor logos',
    }),
    defineField({
      name: 'sponsors',
      title: 'Sponsors',
      type: 'array',
      hidden: ({parent}) => parent?.autoPopulate !== false,
      of: [
        {
          type: 'reference',
          to: [{type: 'sponsor'}],
        },
      ],
    }),
  ],
})
