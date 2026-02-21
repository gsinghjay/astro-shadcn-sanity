import {defineField, defineArrayMember} from 'sanity'
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
        list: [
          {title: 'All', value: 'all'},
          {title: 'Featured', value: 'featured'},
          {title: 'Manual', value: 'manual'},
        ],
      },
      initialValue: 'all',
    }),
    defineField({
      name: 'sponsors',
      title: 'Sponsors',
      type: 'array',
      hidden: ({parent}) => parent?.displayMode !== 'manual',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'sponsor'}],
        }),
      ],
      validation: (Rule) =>
        Rule.custom((sponsors, context) => {
          const parent = context.parent as {displayMode?: string}
          if (parent?.displayMode === 'manual' && (!sponsors || sponsors.length === 0)) {
            return 'Add at least one sponsor in manual mode'
          }
          return true
        }),
    }),
  ],
})
