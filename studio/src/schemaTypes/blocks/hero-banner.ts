import {defineField, defineArrayMember} from 'sanity'
import {RocketIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const heroBanner = defineBlock({
  name: 'heroBanner',
  title: 'Hero Banner',
  icon: RocketIcon,
  preview: {select: {title: 'heading'}},
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
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
    }),
    defineField({
      name: 'alignment',
      title: 'Alignment',
      type: 'string',
      fieldset: 'layout',
      options: {
        list: ['left', 'center', 'right'],
        layout: 'radio',
      },
      initialValue: 'center',
    }),
  ],
})
