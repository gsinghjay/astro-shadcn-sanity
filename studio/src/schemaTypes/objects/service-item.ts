import {defineType, defineField} from 'sanity'
import {BulbOutlineIcon} from '@sanity/icons'
import {LUCIDE_ICON_OPTIONS} from '../helpers/commonFields'

export const serviceItem = defineType({
  name: 'serviceItem',
  title: 'Service Item',
  type: 'object',
  icon: BulbOutlineIcon,
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
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({name: 'alt', title: 'Alt text', type: 'string'}),
      ],
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'object',
      fields: [
        defineField({name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.max(100)}),
        defineField({
          name: 'href',
          title: 'URL',
          type: 'url',
          validation: (Rule) => Rule.uri({allowRelative: true, scheme: ['http', 'https']}),
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'description'},
  },
})
