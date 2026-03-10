import {defineField, defineArrayMember} from 'sanity'
import {BoltIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const ctaBanner = defineBlock({
  name: 'ctaBanner',
  title: 'CTA Banner',
  icon: BoltIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'centered', title: 'Centered'},
    {name: 'split', title: 'Split'},
    {name: 'spread', title: 'Spread'},
    {name: 'overlay', title: 'Overlay'},
  ],
  hiddenByVariant: {
    backgroundImages: ['centered', 'spread'],
  },
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
      name: 'backgroundImages',
      title: 'Background Images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'ctaButtons',
      title: 'CTA Buttons',
      type: 'array',
      of: [defineArrayMember({type: 'button'})],
      validation: (Rule) => Rule.min(1).error('Add at least one button'),
    }),
  ],
})
