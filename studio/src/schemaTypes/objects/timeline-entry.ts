import {defineType, defineField} from 'sanity'

export const timelineEntry = defineType({
  name: 'timelineEntry',
  title: 'Timeline Entry',
  type: 'object',
  fields: [
    defineField({
      name: 'date',
      title: 'Date',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'date'},
  },
})
