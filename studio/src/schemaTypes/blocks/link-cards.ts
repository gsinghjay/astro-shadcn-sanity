import {defineField, defineArrayMember} from 'sanity'
import {LinkIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'
import {headerFields} from '../helpers/commonFields'

export const linkCards = defineBlock({
  name: 'linkCards',
  title: 'Link Cards',
  icon: LinkIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'grid', title: 'Grid'},
    {name: 'list', title: 'List'},
    {name: 'icon-list', title: 'Icon List'},
  ],
  fields: [
    ...headerFields(),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [defineArrayMember({type: 'linkCardItem'})],
      validation: (Rule) => Rule.min(1).max(20),
    }),
  ],
})
