import {defineField, defineArrayMember} from 'sanity'
import {ThLargeIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'
import {headerFields} from '../helpers/commonFields'

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
    ...headerFields(),
    defineField({
      name: 'options',
      title: 'Options',
      type: 'array',
      description: 'Column headers for comparison options',
      of: [defineArrayMember({type: 'comparisonColumn'})],
      validation: (Rule) =>
        Rule.required().min(2).max(5).error('Add between 2 and 5 options'),
    }),
    defineField({
      name: 'criteria',
      title: 'Criteria',
      type: 'array',
      description: 'Criteria rows comparing the options',
      of: [defineArrayMember({type: 'comparisonRow'})],
      validation: (Rule) =>
        Rule.required().min(1).error('Add at least one criterion'),
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [defineArrayMember({type: 'button'})],
    }),
  ],
})
