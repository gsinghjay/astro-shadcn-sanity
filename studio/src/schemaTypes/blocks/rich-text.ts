import {defineField} from 'sanity'
import {defineBlock} from '../helpers/defineBlock'

export const richText = defineBlock({
  name: 'richText',
  title: 'Rich Text',
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'portableText',
    }),
  ],
})
