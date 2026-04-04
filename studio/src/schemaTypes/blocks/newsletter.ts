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
  ],
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'description', title: 'Description', type: 'text'}),
    defineField({
      name: 'placeholderText',
      title: 'Placeholder Text',
      type: 'string',
      initialValue: 'Enter your email',
    }),
    defineField({
      name: 'buttonText',
      title: 'Button Text',
      type: 'string',
      initialValue: 'Subscribe',
    }),
    defineField({name: 'disclaimer', title: 'Disclaimer', type: 'string'}),
  ],
})
