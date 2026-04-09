import {defineField, defineArrayMember} from 'sanity'
import {UsersIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'
import {headerFields} from '../helpers/commonFields'

export const teamGrid = defineBlock({
  name: 'teamGrid',
  title: 'Team Grid',
  icon: UsersIcon,
  variants: [
    {name: 'grid', title: 'Grid'},
    {name: 'grid-compact', title: 'Grid Compact'},
    {name: 'split', title: 'Split'},
  ],
  hiddenByVariant: {
    description: ['grid-compact'],
  },
  fields: [
    ...headerFields(),
    defineField({
      name: 'items',
      title: 'Team Members',
      type: 'array',
      of: [defineArrayMember({type: 'teamMember'})],
      validation: (Rule) => Rule.required().min(1).max(30),
    }),
  ],
})
