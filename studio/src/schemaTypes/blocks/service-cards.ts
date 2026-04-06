import {defineField, defineArrayMember} from 'sanity'
import {BulbOutlineIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const serviceCards = defineBlock({
  name: 'serviceCards',
  title: 'Service Cards',
  icon: BulbOutlineIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'grid', title: 'Grid'},
    {name: 'list', title: 'List'},
    {name: 'alternating', title: 'Alternating'},
    {name: 'icon-grid', title: 'Icon Grid'},
    {name: 'specification', title: 'Specification'},
  ],
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required().max(150)}),
    defineField({name: 'description', title: 'Description', type: 'text', description: 'Supporting text below the heading (max 500 characters)', validation: (Rule) => Rule.max(500)}),
    defineField({
      name: 'services',
      title: 'Services',
      type: 'array',
      of: [defineArrayMember({type: 'serviceItem'})],
      validation: (Rule) => Rule.min(1).max(20),
    }),
  ],
})
