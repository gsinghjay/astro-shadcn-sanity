import {defineField, defineArrayMember} from 'sanity'
import {LinkIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

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
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required().max(150)}),
    defineField({name: 'description', title: 'Description', type: 'text', validation: (Rule) => Rule.max(500)}),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [defineArrayMember({type: 'linkCardItem'})],
      validation: (Rule) => Rule.min(1).max(20),
    }),
  ],
})
