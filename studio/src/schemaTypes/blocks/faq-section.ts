import {defineField, defineArrayMember} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const faqSection = defineBlock({
  name: 'faqSection',
  title: 'FAQ Section',
  icon: HelpCircleIcon,
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
      of: [defineArrayMember({type: 'faqItem'})],
      validation: (Rule) => Rule.min(1).error('Add at least one FAQ'),
    }),
  ],
})
