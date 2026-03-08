import {defineType, defineField, defineArrayMember} from 'sanity'

export const comparisonRow = defineType({
  name: 'comparisonRow',
  title: 'Comparison Row',
  type: 'object',
  fields: [
    defineField({
      name: 'feature',
      title: 'Feature',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'values',
      title: 'Values',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'isHeader',
      title: 'Is Header Row',
      type: 'boolean',
    }),
  ],
  preview: {
    select: {title: 'feature'},
  },
})
