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
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: 'values',
      title: 'Values',
      type: 'array',
      description: 'Values for each column (match column order)',
      of: [defineArrayMember({type: 'string'})],
      validation: (Rule) => Rule.max(10),
    }),
    defineField({
      name: 'isHeader',
      title: 'Is Header Row',
      type: 'boolean',
      description: 'Mark this row as a section header in the table',
    }),
  ],
  preview: {
    select: {title: 'feature'},
  },
})
