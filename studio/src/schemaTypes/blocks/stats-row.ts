import {defineField, defineArrayMember} from 'sanity'
import {BarChartIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const statsRow = defineBlock({
  name: 'statsRow',
  title: 'Stats Row',
  icon: BarChartIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'grid', title: 'Grid (responsive grid of stat tiles)'},
    {name: 'split', title: 'Split (heading/buttons left, vertical stat stack right)'},
    {name: 'spread', title: 'Spread (centered heading above, icon-based stats spread)'},
    {name: 'brutalist', title: 'Brutalist'},
    {name: 'ticker', title: 'Ticker'},
  ],
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.max(150),
    }),
    defineField({
      name: 'stats',
      title: 'Stats',
      type: 'array',
      of: [defineArrayMember({type: 'statItem'})],
      validation: (Rule) => [Rule.min(1).error('Add at least one stat'), Rule.max(10)],
    }),
  ],
})
