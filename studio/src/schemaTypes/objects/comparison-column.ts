import {defineType, defineField} from 'sanity'

export const comparisonColumn = defineType({
  name: 'comparisonColumn',
  title: 'Comparison Column',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'highlighted',
      title: 'Highlighted',
      type: 'boolean',
    }),
  ],
  preview: {
    select: {title: 'title'},
  },
})
