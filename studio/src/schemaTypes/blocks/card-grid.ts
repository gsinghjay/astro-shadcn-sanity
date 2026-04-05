import {defineField, defineArrayMember} from 'sanity'
import {ThLargeIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const cardGrid = defineBlock({
  name: 'cardGrid',
  title: 'Card Grid',
  icon: ThLargeIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'grid-2', title: '2 Columns'},
    {name: 'grid-3', title: '3 Columns'},
    {name: 'grid-4', title: '4 Columns'},
    {name: 'masonry', title: 'Masonry'},
    {name: 'brutalist', title: 'Brutalist'},
  ],
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'description', title: 'Description', type: 'text'}),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [defineArrayMember({type: 'cardGridItem'})],
      validation: (Rule) => Rule.min(1),
    }),
  ],
})
