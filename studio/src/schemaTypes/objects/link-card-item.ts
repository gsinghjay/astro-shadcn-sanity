import {defineType, defineField} from 'sanity'
import {LinkIcon} from '@sanity/icons'

export const linkCardItem = defineType({
  name: 'linkCardItem',
  title: 'Link Card Item',
  type: 'object',
  icon: LinkIcon,
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
      type: 'string',
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Lucide icon name',
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (Rule) => Rule.required().uri({allowRelative: true, scheme: ['http', 'https']}),
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'url'},
  },
})
