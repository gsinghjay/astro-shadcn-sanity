import {defineType, defineField, defineArrayMember} from 'sanity'
import {CreditCardIcon} from '@sanity/icons'

export const pricingTier = defineType({
  name: 'pricingTier',
  title: 'Pricing Tier',
  type: 'object',
  icon: CreditCardIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'string',
      description: 'Display price, e.g. "$29", "Free"',
      validation: (Rule) => Rule.required().max(50),
    }),
    defineField({
      name: 'interval',
      title: 'Interval',
      type: 'string',
      description: 'Billing interval, e.g. "month", "year"',
      validation: (Rule) => Rule.max(50),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'string',
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (Rule) => Rule.max(15),
    }),
    defineField({
      name: 'highlighted',
      title: 'Highlighted',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Text',
      type: 'string',
      description: 'Text for the call-to-action button (requires CTA URL)',
      validation: (Rule) =>
        Rule.max(100).custom((value, context) => {
          const parent = context.parent as {ctaUrl?: string} | undefined
          if (value && !parent?.ctaUrl) return 'CTA URL is required when CTA Text is set'
          return true
        }),
    }),
    defineField({
      name: 'ctaUrl',
      title: 'CTA URL',
      type: 'url',
      validation: (Rule) =>
        Rule.uri({allowRelative: true, scheme: ['http', 'https']}).custom((value, context) => {
          const parent = context.parent as {ctaText?: string} | undefined
          if (value && !parent?.ctaText) return 'CTA Text is required when CTA URL is set'
          return true
        }),
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'price'},
  },
})
