import {defineType, defineField} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'

export const sponsorAgreement = defineType({
  name: 'sponsorAgreement',
  title: 'Sponsor Agreement',
  type: 'document',
  icon: DocumentTextIcon,
  preview: {
    select: {title: 'title', media: 'pdfFile'},
    prepare({title}) {
      return {
        title: title || 'Sponsor Agreement',
        subtitle: 'Singleton — agreement PDF',
      }
    },
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Heading shown in the acceptance modal and on the sponsorship page.',
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Short intro shown above the PDF in the acceptance modal.',
    }),
    defineField({
      name: 'pdfFile',
      title: 'Agreement PDF',
      type: 'file',
      options: {accept: 'application/pdf'},
      description: 'Uploaded agreement rendered via pdfjs-dist in the modal and sponsorship page.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'checkboxLabel',
      title: 'Checkbox Label',
      type: 'string',
      description: 'Label next to the acceptance checkbox.',
      initialValue: 'I have read and accept the sponsor agreement',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'acceptButtonText',
      title: 'Accept Button Text',
      type: 'string',
      description: 'Text for the accept button in the modal.',
      initialValue: 'Accept & Continue',
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'bodyContent',
      title: 'Body Content',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Rich text shown on the My Sponsorship page above the embedded PDF.',
    }),
  ],
})
