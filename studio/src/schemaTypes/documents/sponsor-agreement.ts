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
      description: 'Uploaded agreement rendered via pdfjs-dist in the modal and sponsorship page. Must be PDF, max 10 MB.',
      validation: (Rule) =>
        Rule.required().custom(async (value, context) => {
          if (!value?.asset?._ref) return true
          const ref = value.asset._ref as string
          const asset = await context
            .getClient({apiVersion: '2024-01-01'})
            .getDocument(ref)
          if (!asset) return true
          const mime = (asset as {mimeType?: string}).mimeType
          const size = (asset as {size?: number}).size
          if (mime && mime !== 'application/pdf') {
            return `File must be a PDF (got "${mime}"). The browser accept hint can be bypassed.`
          }
          if (size && size > 10 * 1024 * 1024) {
            return `PDF is ${(size / 1024 / 1024).toFixed(1)} MB; max 10 MB. Large PDFs slow the modal for every unaccepted sponsor.`
          }
          return true
        }),
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
