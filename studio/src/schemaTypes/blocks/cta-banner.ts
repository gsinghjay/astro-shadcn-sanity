import {defineField} from 'sanity'
import {defineBlock} from '../helpers/defineBlock'

export const ctaBanner = defineBlock({
  name: 'ctaBanner',
  title: 'CTA Banner',
  preview: {select: {title: 'heading'}},
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'ctaButtons',
      title: 'CTA Buttons',
      type: 'array',
      of: [{type: 'button'}],
    }),
  ],
})
