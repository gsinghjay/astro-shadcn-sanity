import {defineField, defineArrayMember} from 'sanity'
import {ThLargeIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const comparisonTable = defineBlock({
  name: 'comparisonTable',
  title: 'Comparison Table',
  icon: ThLargeIcon,
  variants: [
    {name: 'table', title: 'Table'},
    {name: 'stacked', title: 'Stacked'},
    {name: 'specification', title: 'Specification'},
  ],
  preview: {select: {title: 'heading'}},
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
      name: 'columns',
      title: 'Columns',
      type: 'array',
      of: [defineArrayMember({type: 'comparisonColumn'})],
      validation: (Rule) =>
        Rule.required().min(2).max(5).error('Add between 2 and 5 columns'),
    }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [defineArrayMember({type: 'comparisonRow'})],
      validation: (Rule) =>
        Rule.required().min(1).error('Add at least one row'),
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [defineArrayMember({type: 'button'})],
    }),
  ],
})
