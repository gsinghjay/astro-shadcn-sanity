import {defineField, defineArrayMember} from 'sanity'
import {CommentIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const testimonials = defineBlock({
  name: 'testimonials',
  title: 'Testimonials',
  icon: CommentIcon,
  preview: {select: {title: 'heading'}},
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'displayMode',
      title: 'Display Mode',
      type: 'string',
      options: {
        list: ['all', 'industry', 'student', 'byProject', 'manual'],
      },
      initialValue: 'all',
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      hidden: ({parent}) => parent?.displayMode !== 'manual',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'testimonial'}],
        }),
      ],
    }),
  ],
})
