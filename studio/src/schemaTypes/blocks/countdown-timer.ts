import {defineField} from 'sanity'
import {ClockIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'
import {headerFields} from '../helpers/commonFields'

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
    ...headerFields(),
    defineField({
      name: 'targetDate',
      title: 'Target Date',
      type: 'datetime',
      description: 'Date and time the countdown counts down to',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'completedMessage',
      title: 'Completed Message',
      type: 'string',
      description: 'Message displayed after the countdown reaches zero',
      initialValue: 'Event has started!',
      validation: (Rule) => Rule.max(150),
    }),
  ],
})
