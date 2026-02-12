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
      of: [
        defineArrayMember({
          type: 'object',
          preview: {select: {title: 'question'}},
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
        }),
      ],
    }),
  ],
})
