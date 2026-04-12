import {defineType, defineField} from 'sanity'
import {ChevronDownIcon} from '@sanity/icons'

export const accordionItem = defineType({
  name: 'accordionItem',
  title: 'Accordion Item',
  type: 'object',
  icon: ChevronDownIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      validation: (Rule) => Rule.required().max(2000),
    }),
  ],
  preview: {
    select: {title: 'title'},
  },
})
