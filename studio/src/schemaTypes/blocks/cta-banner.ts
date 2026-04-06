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
    {name: 'brutalist', title: 'Brutalist'},
    {name: 'data-cta', title: 'Data CTA'},
  ],
  hiddenByVariant: {
    backgroundImages: ['centered', 'spread', 'brutalist', 'data-cta'],
  },
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: 'backgroundImages',
      title: 'Background Images',
      type: 'array',
      description: 'Background images for the banner',
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
      validation: (Rule) => Rule.max(5),
    }),
    defineField({
      name: 'ctaButtons',
      title: 'CTA Buttons',
      type: 'array',
      description: 'Call-to-action buttons (max 5)',
      of: [defineArrayMember({type: 'button'})],
      validation: (Rule) => Rule.min(1).max(5).error('Add at least one button'),
    }),
  ],
})
