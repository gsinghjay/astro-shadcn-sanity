import {defineField, defineArrayMember} from 'sanity'
import {BoltIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const ctaBanner = defineBlock({
  name: 'ctaBanner',
  title: 'CTA Banner',
  icon: BoltIcon,
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
      of: [defineArrayMember({type: 'button'})],
    }),
  ],
})
