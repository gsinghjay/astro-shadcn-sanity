import {defineField, defineArrayMember} from 'sanity'
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
        defineArrayMember({
          type: 'reference',
          to: [{type: 'sponsor'}],
        }),
      ],
      validation: (Rule) =>
        Rule.custom((sponsors, context) => {
          const parent = context.parent as {autoPopulate?: boolean}
          if (parent?.autoPopulate === false && (!sponsors || sponsors.length === 0)) {
            return 'Add at least one sponsor when auto-populate is off'
          }
          return true
        }),
    }),
  ],
})
