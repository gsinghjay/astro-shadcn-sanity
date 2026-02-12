import {defineField, defineArrayMember} from 'sanity'
import {BarChartIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const statsRow = defineBlock({
  name: 'statsRow',
  title: 'Stats Row',
  icon: BarChartIcon,
  preview: {select: {title: 'heading'}},
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'stats',
      title: 'Stats',
      type: 'array',
      of: [defineArrayMember({type: 'statItem'})],
    }),
  ],
})
