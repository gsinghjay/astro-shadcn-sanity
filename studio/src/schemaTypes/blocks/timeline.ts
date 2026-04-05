import {defineField, defineArrayMember} from 'sanity'
import {ClockIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const timeline = defineBlock({
  name: 'timeline',
  title: 'Timeline',
  icon: ClockIcon,
  variants: [
    {name: 'vertical', title: 'Vertical'},
    {name: 'split', title: 'Split'},
    {name: 'horizontal', title: 'Horizontal'},
    {name: 'engineering', title: 'Engineering'},
  ],
  hiddenByVariant: {
    description: ['horizontal'],
  },
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
      name: 'items',
      title: 'Timeline Entries',
      type: 'array',
      of: [defineArrayMember({type: 'timelineEntry'})],
      validation: (Rule) =>
        Rule.required().min(1).error('Add at least one timeline entry'),
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [defineArrayMember({type: 'button'})],
    }),
  ],
})
