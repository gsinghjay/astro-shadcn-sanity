import {defineType, defineField, defineArrayMember} from 'sanity'

export const sponsorshipTierItem = defineType({
  name: 'sponsorshipTierItem',
  title: 'Sponsorship Tier',
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
})
