import {defineField} from 'sanity'
import {BlockquoteIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const pullquote = defineBlock({
  name: 'pullquote',
  title: 'Pullquote',
  icon: BlockquoteIcon,
  variants: [
    {name: 'centered', title: 'Centered'},
    {name: 'split', title: 'Split'},
    {name: 'sidebar', title: 'Sidebar'},
    {name: 'brutalist', title: 'Brutalist'},
  ],
  hiddenByVariant: {
    image: ['sidebar'],
  },
  preview: {
    select: {title: 'quote', subtitle: 'attribution'},
  },
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'attribution',
      title: 'Attribution',
      type: 'string',
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
  ],
})
