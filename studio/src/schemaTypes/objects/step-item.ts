import {defineType, defineField, defineArrayMember} from 'sanity'
import {ClipboardIcon} from '@sanity/icons'

export const stepItem = defineType({
  name: 'stepItem',
  title: 'Step Item',
  type: 'object',
  icon: ClipboardIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'list',
      title: 'Bullet Points',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
  ],
  preview: {
    select: {title: 'title'},
  },
})
