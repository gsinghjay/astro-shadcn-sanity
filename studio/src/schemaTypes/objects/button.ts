import {defineType, defineField} from 'sanity'
import {LinkIcon} from '@sanity/icons'

export const buttonFields = [
  defineField({
    name: 'text',
    title: 'Text',
    type: 'string',
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: 'url',
    title: 'URL',
    type: 'string',
    validation: (Rule) =>
      Rule.required().custom((value) => {
        if (!value) return true
        if (value.startsWith('/') || /^https?:\/\//.test(value) || /^(mailto|tel):/.test(value))
          return true
        return 'Must be a relative path starting with "/" or a full URL (http/https/mailto/tel)'
      }),
  }),
  defineField({
    name: 'variant',
    title: 'Variant',
    type: 'string',
    options: {
      list: ['default', 'secondary', 'outline', 'ghost'],
    },
  }),
]

export const button = defineType({
  name: 'button',
  title: 'Button',
  type: 'object',
  icon: LinkIcon,
  fields: [...buttonFields],
})
