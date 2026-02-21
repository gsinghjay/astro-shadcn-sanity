import {defineType, defineField, defineArrayMember} from 'sanity'
import {ProjectsIcon} from '@sanity/icons'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: ProjectsIcon,
  groups: [
    {name: 'main', title: 'Main', default: true},
    {name: 'content', title: 'Content'},
    {name: 'team', title: 'Team'},
    {name: 'tags', title: 'Tags'},
  ],
  preview: {
    select: {title: 'title', subtitle: 'semester', media: 'sponsor.logo'},
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'main',
      options: {source: 'title'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sponsor',
      title: 'Sponsor',
      type: 'reference',
      group: 'main',
      to: [{type: 'sponsor'}],
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'main',
      options: {
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Completed', value: 'completed'},
          {title: 'Archived', value: 'archived'},
        ],
      },
      initialValue: 'active',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'semester',
      title: 'Semester',
      type: 'string',
      group: 'main',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'portableText',
      group: 'content',
    }),
    defineField({
      name: 'outcome',
      title: 'Outcome & Impact',
      type: 'text',
      group: 'content',
    }),
    defineField({
      name: 'team',
      title: 'Team Members',
      type: 'array',
      group: 'team',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'role',
              title: 'Role',
              type: 'string',
            }),
          ],
          preview: {select: {title: 'name', subtitle: 'role'}},
        }),
      ],
    }),
    defineField({
      name: 'mentor',
      title: 'Mentor',
      type: 'string',
      group: 'team',
    }),
    defineField({
      name: 'technologyTags',
      title: 'Technologies',
      type: 'array',
      group: 'tags',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
  ],
})
