import {defineField, defineArrayMember} from 'sanity'
import {ChevronDownIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

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
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'description', title: 'Description', type: 'text'}),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [defineArrayMember({type: 'accordionItem'})],
      validation: (Rule) => Rule.min(1),
    }),
  ],
})
