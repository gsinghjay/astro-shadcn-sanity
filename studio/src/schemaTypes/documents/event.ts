import {defineType, defineField} from 'sanity'
import {CalendarIcon, SearchIcon} from '@sanity/icons'

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  icon: CalendarIcon,
  groups: [
    {name: 'main', title: 'Main', default: true},
    {name: 'seo', title: 'SEO', icon: SearchIcon},
  ],
  orderings: [
    {title: 'Date (newest)', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]},
    {title: 'Date (oldest)', name: 'dateAsc', by: [{field: 'date', direction: 'asc'}]},
    {title: 'Title', name: 'titleAsc', by: [{field: 'title', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', subtitle: 'date'},
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'main',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Start Date',
      type: 'datetime',
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      group: 'main',
      validation: (Rule) =>
        Rule.custom((endDate, context) => {
          const startDate = (context.document as Record<string, unknown>)?.date as
            | string
            | undefined
          if (startDate && endDate && new Date(endDate as string) < new Date(startDate)) {
            return 'End date must be after start date'
          }
          return true
        }),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      group: 'main',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      group: 'main',
    }),
    defineField({
      name: 'isAllDay',
      title: 'All-Day Event',
      type: 'boolean',
      group: 'main',
      initialValue: false,
    }),
    defineField({
      name: 'color',
      title: 'Calendar Color',
      type: 'string',
      group: 'main',
      description: 'Optional calendar color override. Falls back to event type color if not set.',
      options: {
        list: [
          {title: 'Red', value: 'red'},
          {title: 'Blue', value: 'blue'},
          {title: 'Green', value: 'green'},
          {title: 'Orange', value: 'orange'},
          {title: 'Purple', value: 'purple'},
        ],
      },
    }),
    defineField({
      name: 'eventType',
      title: 'Event Type',
      type: 'string',
      group: 'main',
      options: {
        list: [
          {title: 'Showcase', value: 'showcase'},
          {title: 'Networking', value: 'networking'},
          {title: 'Workshop', value: 'workshop'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'main',
      options: {
        list: [
          {title: 'Upcoming', value: 'upcoming'},
          {title: 'Past', value: 'past'},
        ],
        layout: 'radio',
      },
      initialValue: 'upcoming',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
})
