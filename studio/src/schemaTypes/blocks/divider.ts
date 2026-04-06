import {defineField} from 'sanity'
import {RemoveIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const divider = defineBlock({
  name: 'divider',
  title: 'Divider',
  icon: RemoveIcon,
  preview: {select: {title: 'label'}},
  variants: [
    {name: 'line', title: 'Line'},
    {name: 'short', title: 'Short'},
    {name: 'labeled', title: 'Labeled'},
  ],
  hiddenByVariant: {
    label: ['line', 'short'],
  },
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Optional text label displayed on the divider',
      validation: (Rule) => Rule.max(100),
    }),
  ],
})
