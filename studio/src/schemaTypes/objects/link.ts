import {defineType, defineField} from 'sanity'
import {EarthGlobeIcon} from '@sanity/icons'

export const linkFields = [
  defineField({
    name: 'label',
    title: 'Label',
    type: 'string',
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: 'href',
    title: 'URL',
    type: 'string',
    description: 'Relative path, anchor fragment, or full URL (http/https/mailto/tel)',
    validation: (Rule) =>
      Rule.required().custom((value) => {
        if (!value) return true
        if (
          value.startsWith('/') ||
          value.startsWith('#') ||
          /^https?:\/\//.test(value) ||
          /^(mailto|tel):/.test(value)
        )
          return true
        return 'Must be a relative path (/about), anchor (#section), or full URL (http/https/mailto/tel)'
      }),
  }),
  defineField({
    name: 'external',
    title: 'External Link',
    type: 'boolean',
    initialValue: false,
  }),
]

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: EarthGlobeIcon,
  fields: [...linkFields],
})
