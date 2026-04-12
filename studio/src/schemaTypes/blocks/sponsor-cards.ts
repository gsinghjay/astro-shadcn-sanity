import {defineField} from 'sanity'
import {StarIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'
import {displayModeBlock} from '../helpers/commonFields'

export const sponsorCards = defineBlock({
  name: 'sponsorCards',
  title: 'Sponsor Cards',
  icon: StarIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'default', title: 'Default'},
    {name: 'showcase', title: 'Showcase'},
    {name: 'brutalist-tier', title: 'Brutalist Tier'},
  ],
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.max(150),
    }),
    ...displayModeBlock({
      referenceType: 'sponsor',
      arrayFieldName: 'sponsors',
      arrayFieldTitle: 'Sponsors',
    }),
  ],
})
