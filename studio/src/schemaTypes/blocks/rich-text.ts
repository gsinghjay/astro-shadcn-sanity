import {defineField} from 'sanity'
import {BlockContentIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const richText = defineBlock({
  name: 'richText',
  title: 'Rich Text',
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'portableText',
    }),
  ],
})
