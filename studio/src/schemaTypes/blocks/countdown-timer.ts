import {defineField} from 'sanity'
import {ClockIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const countdownTimer = defineBlock({
  name: 'countdownTimer',
  title: 'Countdown Timer',
  icon: ClockIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'inline', title: 'Inline'},
    {name: 'hero', title: 'Hero'},
    {name: 'banner', title: 'Banner'},
    {name: 'brutalist', title: 'Brutalist'},
  ],
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'description', title: 'Description', type: 'text'}),
    defineField({
      name: 'targetDate',
      title: 'Target Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'completedMessage',
      title: 'Completed Message',
      type: 'string',
      initialValue: 'Event has started!',
    }),
  ],
})
