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
      validation: (Rule) => Rule.required().max(500),
    }),
    defineField({
      name: 'attribution',
      title: 'Attribution',
      type: 'string',
      validation: (Rule) => Rule.max(150),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'Role or title of the person being quoted',
      validation: (Rule) => Rule.max(100),
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
          description: 'Describe the image for screen readers',
        }),
      ],
    }),
  ],
})
