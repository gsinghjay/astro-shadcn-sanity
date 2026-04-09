import {defineField, defineArrayMember} from 'sanity'
import {ChevronDownIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'
import {headerFields} from '../helpers/commonFields'

export const accordion = defineBlock({
  name: 'accordion',
  title: 'Accordion',
  icon: ChevronDownIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'default', title: 'Default'},
    {name: 'bordered', title: 'Bordered'},
    {name: 'separated', title: 'Separated'},
    {name: 'technical', title: 'Technical'},
  ],
  fields: [
    ...headerFields(),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [defineArrayMember({type: 'accordionItem'})],
      validation: (Rule) => Rule.min(1).max(20),
    }),
  ],
})
