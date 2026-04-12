import {defineField} from 'sanity'
import {BlockContentIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const richText = defineBlock({
  name: 'richText',
  title: 'Rich Text',
  icon: BlockContentIcon,
  variants: [
    {name: 'prose', title: 'Prose (Default)'},
    {name: 'standard', title: 'Standard'},
    {name: 'highlighted', title: 'Highlighted'},
    {name: 'sidebar', title: 'Sidebar'},
  ],
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'portableText',
      description: 'Rich text content using Portable Text',
    }),
  ],
})
