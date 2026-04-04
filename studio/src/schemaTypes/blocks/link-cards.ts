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
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'description', title: 'Description', type: 'text'}),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [defineArrayMember({type: 'linkCardItem'})],
      validation: (Rule) => Rule.min(1),
    }),
  ],
})
