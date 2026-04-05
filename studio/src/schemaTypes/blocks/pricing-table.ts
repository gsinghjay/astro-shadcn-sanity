import {defineField, defineArrayMember} from 'sanity'
import {CreditCardIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const pricingTable = defineBlock({
  name: 'pricingTable',
  title: 'Pricing Table',
  icon: CreditCardIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'simple', title: 'Simple'},
    {name: 'featured', title: 'Featured'},
    {name: 'comparison', title: 'Comparison'},
    {name: 'brutalist', title: 'Brutalist'},
  ],
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'description', title: 'Description', type: 'text'}),
    defineField({
      name: 'tiers',
      title: 'Pricing Tiers',
      type: 'array',
      of: [defineArrayMember({type: 'pricingTier'})],
      validation: (Rule) => Rule.min(1),
    }),
  ],
})
