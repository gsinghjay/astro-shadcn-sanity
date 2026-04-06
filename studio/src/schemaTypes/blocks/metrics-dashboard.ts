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
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required().max(150)}),
    defineField({name: 'description', title: 'Description', type: 'text', validation: (Rule) => Rule.max(500)}),
    defineField({
      name: 'metrics',
      title: 'Metrics',
      type: 'array',
      description: 'Key metrics to display in the dashboard',
      of: [defineArrayMember({type: 'metricItem'})],
      validation: (Rule) => Rule.min(1).max(20),
    }),
  ],
})
