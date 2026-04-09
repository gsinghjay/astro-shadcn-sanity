import {defineType, defineField} from 'sanity'
import {BarChartIcon} from '@sanity/icons'

export const statItem = defineType({
  name: 'statItem',
  title: 'Stat Item',
  type: 'object',
  icon: BarChartIcon,
  fields: [
    defineField({
      name: 'value',
      title: 'Value',
      type: 'string',
      description: 'e.g., "50+", "$2M", "98%"',
      validation: (Rule) => Rule.required().max(50),
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'string',
      validation: (Rule) => Rule.max(500),
    }),
  ],
  preview: {
    select: {title: 'value', subtitle: 'label'},
  },
})
