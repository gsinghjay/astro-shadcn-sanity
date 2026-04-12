import {defineField} from 'sanity'
import {EnvelopeIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'
import {headerFields} from '../helpers/commonFields'

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
    ...headerFields(),
    defineField({
      name: 'inputPlaceholder',
      title: 'Input Placeholder',
      type: 'string',
      description: 'Placeholder text for the email input field',
      initialValue: 'Enter your email',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'submitButtonLabel',
      title: 'Submit Button Label',
      type: 'string',
      description: 'Text on the subscribe button',
      initialValue: 'Subscribe',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'privacyDisclaimerText',
      title: 'Privacy Disclaimer',
      type: 'string',
      description: 'Privacy disclaimer text shown below the form',
      validation: (Rule) => Rule.max(200),
    }),
  ],
})
