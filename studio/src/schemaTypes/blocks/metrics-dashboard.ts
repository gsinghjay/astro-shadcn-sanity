import {defineField, defineArrayMember} from 'sanity'
import {TrendUpwardIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'
import {headerFields} from '../helpers/commonFields'

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
    ...headerFields(),
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
