import {defineType, defineField} from 'sanity'
import {TrendUpwardIcon} from '@sanity/icons'

export const metricItem = defineType({
  name: 'metricItem',
  title: 'Metric Item',
  type: 'object',
  icon: TrendUpwardIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Value',
      type: 'string',
      description: 'Display value',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'change',
      title: 'Change',
      type: 'string',
      description: 'e.g. "+12%", "-3%"',
    }),
    defineField({
      name: 'trend',
      title: 'Trend',
      type: 'string',
      options: {
        list: [
          {title: 'Up', value: 'up'},
          {title: 'Down', value: 'down'},
          {title: 'Neutral', value: 'neutral'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Lucide icon name',
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'value'},
  },
})
