import {defineField, defineArrayMember} from 'sanity'
import {EnvelopeIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const contactForm = defineBlock({
  name: 'contactForm',
  title: 'Contact Form',
  icon: EnvelopeIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'stacked', title: 'Stacked'},
    {name: 'split', title: 'Split'},
    {name: 'split-image', title: 'Split with Image'},
  ],
  hiddenByVariant: {
    backgroundImages: ['stacked', 'split'],
  },
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'successMessage',
      title: 'Success Message',
      type: 'string',
      description: 'Shown after successful form submission',
    }),
    defineField({
      name: 'form',
      title: 'Form',
      type: 'reference',
      to: [{type: 'form'}],
      description: 'Select the form to display. Create forms in the "Forms" section.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'backgroundImages',
      title: 'Background Images',
      type: 'array',
      description: 'Image displayed alongside the form (used in split-image variant)',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }),
          ],
        }),
      ],
    }),
  ],
})
