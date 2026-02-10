import {defineField} from 'sanity'
import {StarIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const sponsorCards = defineBlock({
  name: 'sponsorCards',
  title: 'Sponsor Cards',
  icon: StarIcon,
  preview: {select: {title: 'heading'}},
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'displayMode',
      title: 'Display Mode',
      type: 'string',
      options: {
        list: ['all', 'featured', 'manual'],
      },
      initialValue: 'all',
    }),
    defineField({
      name: 'sponsors',
      title: 'Sponsors',
      type: 'array',
      hidden: ({parent}) => parent?.displayMode !== 'manual',
      of: [
        {
          type: 'reference',
          to: [{type: 'sponsor'}],
        },
      ],
    }),
  ],
})
