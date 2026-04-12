import {defineType, defineField} from 'sanity'
import {PackageIcon} from '@sanity/icons'

export const productItem = defineType({
  name: 'productItem',
  title: 'Product Item',
  type: 'object',
  icon: PackageIcon,
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
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({name: 'alt', title: 'Alt text', type: 'string'}),
      ],
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'string',
      description: 'Display price',
      validation: (Rule) => Rule.max(50),
    }),
    defineField({
      name: 'badge',
      title: 'Badge',
      type: 'string',
      description: 'e.g. "New", "Sale"',
      validation: (Rule) => Rule.max(50),
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
    select: {title: 'title', subtitle: 'price'},
  },
})
