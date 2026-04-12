import {defineType, defineField} from 'sanity'
import {LinkIcon} from '@sanity/icons'
import {LUCIDE_ICON_OPTIONS} from '../helpers/commonFields'

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
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'string',
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Optional icon from the Lucide icon set',
      options: {
        list: LUCIDE_ICON_OPTIONS,
        layout: 'dropdown',
      },
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
