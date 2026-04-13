import {defineField} from 'sanity'
import {CalendarIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const eventList = defineBlock({
  name: 'eventList',
  title: 'Event List',
  icon: CalendarIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'grid', title: 'Grid'},
    {name: 'list', title: 'List'},
    {name: 'timeline', title: 'Timeline'},
  ],
  hiddenByVariant: {
    limit: ['timeline'],
  },
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.max(150),
    }),
    defineField({
      name: 'eventStatus',
      title: 'Event Status',
      type: 'string',
      description: 'Filter events by status (upcoming, past, all)',
      options: {
        list: [
          {title: 'All', value: 'all'},
          {title: 'Upcoming', value: 'upcoming'},
          {title: 'Past', value: 'past'},
        ],
      },
      initialValue: 'upcoming',
    }),
    defineField({
      name: 'limit',
      title: 'Max Events to Display',
      type: 'number',
      initialValue: 10,
      validation: (Rule) => Rule.min(1).max(50),
    }),
  ],
})
