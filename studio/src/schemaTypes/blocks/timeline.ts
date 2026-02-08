import {defineField} from 'sanity'
import {defineBlock} from '../helpers/defineBlock'

export const timeline = defineBlock({
  name: 'timeline',
  title: 'Timeline',
  preview: {select: {title: 'heading'}},
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'autoPopulate',
      title: 'Auto Populate',
      type: 'boolean',
      initialValue: true,
      description: 'Automatically pull all events',
    }),
    defineField({
      name: 'events',
      title: 'Events',
      type: 'array',
      hidden: ({parent}) => parent?.autoPopulate !== false,
      of: [
        {
          type: 'reference',
          to: [{type: 'event'}],
        },
      ],
    }),
  ],
})
