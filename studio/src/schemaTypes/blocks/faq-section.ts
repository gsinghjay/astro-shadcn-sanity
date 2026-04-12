import {defineField, defineArrayMember} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const faqSection = defineBlock({
  name: 'faqSection',
  title: 'FAQ Section',
  icon: HelpCircleIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'split', title: 'Split (sticky heading left, accordion right)'},
    {name: 'stacked', title: 'Stacked (centered heading, full-width accordion below)'},
    {name: 'spread-header', title: 'Spread Header (heading left, buttons right, accordion below)'},
    {name: 'narrow', title: 'Narrow (672px centered column)'},
    {name: 'technical', title: 'Technical'},
  ],
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.max(150),
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [defineArrayMember({type: 'faqItem'})],
      validation: (Rule) => [Rule.min(1).error('Add at least one FAQ'), Rule.max(20)],
    }),
  ],
})
