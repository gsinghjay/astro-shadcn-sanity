import {defineField, defineArrayMember} from 'sanity'
import {CreditCardIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'
import {headerFields} from '../helpers/commonFields'

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
    ...headerFields(),
    defineField({
      name: 'tiers',
      title: 'Tiers',
      type: 'array',
      description: 'Sponsorship tier definitions with pricing and benefits',
      of: [defineArrayMember({type: 'sponsorshipTierItem'})],
      validation: (Rule) =>
        Rule.min(1)
          .error('Add at least one tier')
          .max(5)
          .warning('More than 5 tiers may overwhelm readers'),
    }),
  ],
})
