import {defineType, defineField} from 'sanity'
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'string',
      description: 'Display price, e.g. "$29", "Free"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'interval',
      title: 'Interval',
      type: 'string',
      description: 'Billing interval, e.g. "month", "year"',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'string',
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{type: 'string'}],
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
    }),
    defineField({
      name: 'ctaUrl',
      title: 'CTA URL',
      type: 'string',
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'price'},
  },
})
