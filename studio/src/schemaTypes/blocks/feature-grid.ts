import {defineField, defineArrayMember} from 'sanity'
import {ThLargeIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const featureGrid = defineBlock({
  name: 'featureGrid',
  title: 'Feature Grid',
  icon: ThLargeIcon,
  preview: {select: {title: 'heading'}},
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [defineArrayMember({type: 'featureItem'})],
      validation: (Rule) => Rule.min(1).error('Add at least one feature'),
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'number',
      fieldset: 'layout',
      options: {
        list: [2, 3, 4],
      },
      initialValue: 3,
    }),
  ],
})
