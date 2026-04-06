import {defineField} from 'sanity'
import {EnvelopeIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const newsletter = defineBlock({
  name: 'newsletter',
  title: 'Newsletter',
  icon: EnvelopeIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'inline', title: 'Inline'},
    {name: 'banner', title: 'Banner'},
    {name: 'split', title: 'Split'},
    {name: 'brutalist', title: 'Brutalist'},
  ],
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required().max(150)}),
    defineField({name: 'description', title: 'Description', type: 'text', description: 'Brief description of the newsletter signup (max 500 characters)', validation: (Rule) => Rule.max(500)}),
    defineField({
      name: 'placeholderText',
      title: 'Placeholder Text',
      type: 'string',
      description: 'Placeholder text for the email input field',
      initialValue: 'Enter your email',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'buttonText',
      title: 'Button Text',
      type: 'string',
      description: 'Text on the subscribe button',
      initialValue: 'Subscribe',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({name: 'disclaimer', title: 'Disclaimer', type: 'string', description: 'Privacy disclaimer text shown below the form', validation: (Rule) => Rule.max(200)}),
  ],
})
