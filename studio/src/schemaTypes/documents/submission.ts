import {defineField, defineType} from 'sanity'
import {EnvelopeIcon} from '@sanity/icons'

export const submission = defineType({
  name: 'submission',
  title: 'Submission',
  type: 'document',
  icon: EnvelopeIcon,
  readOnly: true,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'organization',
      title: 'Organization',
      type: 'string',
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'form',
      title: 'Form',
      type: 'reference',
      to: [{type: 'form'}],
      description: 'Which form generated this submission',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'email'},
  },
  orderings: [
    {
      title: 'Submitted (newest first)',
      name: 'submittedAtDesc',
      by: [{field: 'submittedAt', direction: 'desc'}],
    },
  ],
})
