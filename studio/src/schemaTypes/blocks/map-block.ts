import {defineField} from 'sanity'
import {PinIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const mapBlock = defineBlock({
  name: 'mapBlock',
  title: 'Map Block',
  icon: PinIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'default', title: 'Default'},
    {name: 'split', title: 'Split'},
    {name: 'full-width', title: 'Full Width'},
  ],
  hiddenByVariant: {
    contactInfo: ['default', 'full-width'],
  },
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.max(150)}),
    defineField({name: 'address', title: 'Address', type: 'text', validation: (Rule) => Rule.max(500)}),
    defineField({
      name: 'coordinates',
      title: 'Coordinates',
      type: 'object',
      fields: [
        defineField({name: 'lat', title: 'Latitude', type: 'number', description: 'Latitude (-90 to 90)', validation: (Rule) => Rule.required().min(-90).max(90)}),
        defineField({name: 'lng', title: 'Longitude', type: 'number', description: 'Longitude (-180 to 180)', validation: (Rule) => Rule.required().min(-180).max(180)}),
      ],
    }),
    defineField({
      name: 'zoom',
      title: 'Zoom',
      type: 'number',
      description: 'Map zoom level (1-20, default 15)',
      initialValue: 15,
      validation: (Rule) => Rule.min(1).max(20),
    }),
    defineField({name: 'caption', title: 'Caption', type: 'string', validation: (Rule) => Rule.max(200)}),
    defineField({
      name: 'contactInfo',
      title: 'Contact Info',
      type: 'object',
      description: 'Contact details shown alongside the map (split variant only)',
      fields: [
        defineField({name: 'phone', title: 'Phone', type: 'string', validation: (Rule) => Rule.max(100)}),
        defineField({name: 'email', title: 'Email', type: 'string', validation: (Rule) => Rule.max(100)}),
        defineField({name: 'hours', title: 'Hours', type: 'string', validation: (Rule) => Rule.max(100)}),
      ],
    }),
  ],
})
