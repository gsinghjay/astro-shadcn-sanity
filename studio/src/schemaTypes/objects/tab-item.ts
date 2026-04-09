import {defineType, defineField} from 'sanity'
import {InlineIcon} from '@sanity/icons'

export const tabItem = defineType({
  name: 'tabItem',
  title: 'Tab Item',
  type: 'object',
  icon: InlineIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'label'},
  },
})
