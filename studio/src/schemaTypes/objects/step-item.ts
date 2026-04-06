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
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: 'list',
      title: 'Bullet Points',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (Rule) => Rule.max(10),
    }),
  ],
  preview: {
    select: {title: 'title'},
  },
})
