import {defineField, defineArrayMember} from 'sanity'
import {TrendUpwardIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const metricsDashboard = defineBlock({
  name: 'metricsDashboard',
  title: 'Metrics Dashboard',
  icon: TrendUpwardIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'grid', title: 'Grid'},
    {name: 'row', title: 'Row'},
    {name: 'card', title: 'Card'},
    {name: 'terminal', title: 'Terminal'},
    {name: 'brutalist-grid', title: 'Brutalist Grid'},
  ],
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'description', title: 'Description', type: 'text'}),
    defineField({
      name: 'metrics',
      title: 'Metrics',
      type: 'array',
      of: [defineArrayMember({type: 'metricItem'})],
      validation: (Rule) => Rule.min(1),
    }),
  ],
})
