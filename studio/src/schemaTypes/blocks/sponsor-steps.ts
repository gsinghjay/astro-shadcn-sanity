import {defineField} from 'sanity'
import {defineBlock} from '../helpers/defineBlock'

export const sponsorSteps = defineBlock({
  name: 'sponsorSteps',
  title: 'Sponsor Steps',
  preview: {select: {title: 'heading'}},
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
    }),
    defineField({
      name: 'items',
      title: 'Steps',
      type: 'array',
      of: [
        {
          type: 'object',
          preview: {select: {title: 'title'}},
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
            }),
            defineField({
              name: 'list',
              title: 'Bullet Points',
              type: 'array',
              of: [{type: 'string'}],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'ctaButtons',
      title: 'CTA Buttons',
      type: 'array',
      of: [{type: 'button'}],
    }),
  ],
})
