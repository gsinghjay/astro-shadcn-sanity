import {defineField, defineArrayMember} from 'sanity'
import {CommentIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const testimonials = defineBlock({
  name: 'testimonials',
  title: 'Testimonials',
  icon: CommentIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'grid', title: 'Grid (responsive grid of testimonial cards)'},
    {name: 'masonry', title: 'Masonry (Pinterest-style flowing grid)'},
    {name: 'split', title: 'Split (heading/buttons left, stacked reviews right)'},
    {name: 'carousel', title: 'Carousel (horizontal slider with nav arrows)'},
    {name: 'marquee', title: 'Marquee (auto-scrolling rows, opposite directions)'},
    {name: 'brutalist-quote', title: 'Brutalist Quote'},
    {name: 'spotlight', title: 'Spotlight'},
  ],
  hiddenByVariant: {
    testimonialSource: ['carousel', 'marquee'],
  },
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: 'testimonialSource',
      title: 'Testimonial Source',
      type: 'string',
      options: {
        list: [
          {title: 'All', value: 'all'},
          {title: 'Industry', value: 'industry'},
          {title: 'Student', value: 'student'},
          {title: 'By Project', value: 'byProject'},
          {title: 'Manual', value: 'manual'},
        ],
      },
      initialValue: 'all',
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      hidden: ({parent}) => parent?.testimonialSource !== 'manual',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'testimonial'}],
        }),
      ],
      validation: (Rule) =>
        Rule.custom((testimonials, context) => {
          const parent = context.parent as {testimonialSource?: string}
          if (parent?.testimonialSource === 'manual' && (!testimonials || testimonials.length === 0)) {
            return 'Add at least one testimonial in manual mode'
          }
          return true
        }),
    }),
  ],
})
