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
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'address', title: 'Address', type: 'text'}),
    defineField({
      name: 'coordinates',
      title: 'Coordinates',
      type: 'object',
      fields: [
        defineField({name: 'lat', title: 'Latitude', type: 'number'}),
        defineField({name: 'lng', title: 'Longitude', type: 'number'}),
      ],
    }),
    defineField({
      name: 'zoom',
      title: 'Zoom',
      type: 'number',
      initialValue: 15,
    }),
    defineField({name: 'caption', title: 'Caption', type: 'string'}),
    defineField({
      name: 'contactInfo',
      title: 'Contact Info',
      type: 'object',
      fields: [
        defineField({name: 'phone', title: 'Phone', type: 'string'}),
        defineField({name: 'email', title: 'Email', type: 'string'}),
        defineField({name: 'hours', title: 'Hours', type: 'string'}),
      ],
    }),
  ],
})
