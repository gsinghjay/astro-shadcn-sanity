import {defineField, defineArrayMember} from 'sanity'
import {CreditCardIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const sponsorshipTiers = defineBlock({
  name: 'sponsorshipTiers',
  title: 'Sponsorship Tiers',
  icon: CreditCardIcon,
  variants: [
    {name: 'default', title: 'Default'},
    {name: 'brutalist', title: 'Brutalist'},
  ],
  preview: {
    select: {title: 'heading', tiers: 'tiers'},
    prepare({title, tiers}) {
      return {
        title: title || 'Untitled',
        subtitle: `${tiers?.length ?? 0} tier${tiers?.length === 1 ? '' : 's'}`,
      }
    },
  },
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: 'tiers',
      title: 'Tiers',
      type: 'array',
      description: 'Sponsorship tier definitions with pricing and benefits',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Tier Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'price',
              title: 'Price',
              type: 'string',
              description: 'e.g. "$0", "$5,000/year", "Custom"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'benefits',
              title: 'Benefits',
              type: 'array',
              of: [defineArrayMember({type: 'string'})],
              validation: (Rule) => [Rule.min(1).error('Add at least one benefit'), Rule.max(15)],
            }),
            defineField({
              name: 'highlighted',
              title: 'Highlighted (Recommended)',
              type: 'boolean',
              description: 'Mark this tier as the recommended option',
              initialValue: false,
            }),
            defineField({
              name: 'ctaButton',
              title: 'CTA Button',
              type: 'button',
            }),
          ],
          preview: {
            select: {title: 'name', subtitle: 'price'},
          },
        }),
      ],
      validation: (Rule) =>
        Rule.min(1)
          .error('Add at least one tier')
          .max(5)
          .warning('More than 5 tiers may overwhelm readers'),
    }),
  ],
})
