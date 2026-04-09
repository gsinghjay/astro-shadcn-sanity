import {defineType, defineField, defineArrayMember} from 'sanity'

export const teamMember = defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'Job title or role',
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Required for accessibility',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      description: 'Social media or portfolio links',
      of: [defineArrayMember({type: 'link'})],
      validation: (Rule) => Rule.max(5),
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'role'},
  },
})
