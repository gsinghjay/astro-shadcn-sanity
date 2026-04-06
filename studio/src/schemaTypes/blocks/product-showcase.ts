import {defineField, defineArrayMember} from 'sanity'
import {PackageIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const productShowcase = defineBlock({
  name: 'productShowcase',
  title: 'Product Showcase',
  icon: PackageIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'grid', title: 'Grid'},
    {name: 'featured', title: 'Featured'},
    {name: 'detail', title: 'Detail'},
  ],
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required().max(150)}),
    defineField({name: 'description', title: 'Description', type: 'text', validation: (Rule) => Rule.max(500)}),
    defineField({
      name: 'products',
      title: 'Products',
      type: 'array',
      of: [defineArrayMember({type: 'productItem'})],
      validation: (Rule) => Rule.min(1).max(20),
    }),
  ],
})
