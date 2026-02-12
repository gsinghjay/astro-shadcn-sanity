import {defineType, defineField} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons'

export const faqItem = defineType({
  name: 'faqItem',
  title: 'FAQ Item',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'portableText',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'question'},
  },
})
