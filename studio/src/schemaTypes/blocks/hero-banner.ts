import {defineField, defineArrayMember} from 'sanity'
import {RocketIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const heroBanner = defineBlock({
  name: 'heroBanner',
  title: 'Hero Banner',
  icon: RocketIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'centered', title: 'Centered'},
    {name: 'split', title: 'Split'},
    {name: 'split-asymmetric', title: 'Split Asymmetric'},
    {name: 'overlay', title: 'Overlay'},
    {name: 'spread', title: 'Spread'},
    {name: 'split-bleed', title: 'Split Bleed'},
    {name: 'brutalist', title: 'Brutalist'},
  ],
  hiddenByVariant: {
    alignment: ['split', 'split-asymmetric', 'split-bleed', 'spread'],
    backgroundImages: ['brutalist'],
  },
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.max(150),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
      description: 'Supporting text below the main heading',
      validation: (Rule) => Rule.max(200),
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
      validation: (Rule) => Rule.max(5),
    }),
    defineField({
      name: 'ctaButtons',
      title: 'CTA Buttons',
      type: 'array',
      of: [defineArrayMember({type: 'button'})],
      validation: (Rule) => Rule.max(5),
    }),
    // alignment is now a block-base field; hiddenByVariant still controls visibility
  ],
})
