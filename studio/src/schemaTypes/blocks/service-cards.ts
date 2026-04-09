import {defineField, defineArrayMember} from 'sanity'
import {BulbOutlineIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'
import {headerFields} from '../helpers/commonFields'

export const serviceCards = defineBlock({
  name: 'serviceCards',
  title: 'Service Cards',
  icon: BulbOutlineIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'grid', title: 'Grid'},
    {name: 'list', title: 'List'},
    {name: 'alternating', title: 'Alternating'},
    {name: 'icon-grid', title: 'Icon Grid'},
    {name: 'specification', title: 'Specification'},
  ],
  fields: [
    ...headerFields(),
    defineField({
      name: 'services',
      title: 'Services',
      type: 'array',
      of: [defineArrayMember({type: 'serviceItem'})],
      validation: (Rule) => Rule.min(1).max(20),
    }),
  ],
})
