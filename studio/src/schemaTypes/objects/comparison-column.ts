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
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'highlighted',
      title: 'Highlighted',
      type: 'boolean',
      description: 'Highlight this column as the recommended option',
    }),
  ],
  preview: {
    select: {title: 'title'},
  },
})
