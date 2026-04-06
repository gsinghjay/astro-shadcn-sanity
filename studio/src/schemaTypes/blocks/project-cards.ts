import {defineField, defineArrayMember} from 'sanity'
import {ProjectsIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const projectCards = defineBlock({
  name: 'projectCards',
  title: 'Project Cards',
  icon: ProjectsIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'default', title: 'Default'},
    {name: 'case-study', title: 'Case Study'},
    {name: 'blueprint', title: 'Blueprint'},
  ],
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: 'displayMode',
      title: 'Display Mode',
      type: 'string',
      options: {
        list: [
          {title: 'All', value: 'all'},
          {title: 'Featured', value: 'featured'},
          {title: 'Manual', value: 'manual'},
        ],
      },
      initialValue: 'all',
    }),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      hidden: ({parent}) => parent?.displayMode !== 'manual',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'project'}],
        }),
      ],
      validation: (Rule) =>
        Rule.custom((projects, context) => {
          const parent = context.parent as {displayMode?: string}
          if (parent?.displayMode === 'manual' && (!projects || projects.length === 0)) {
            return 'Add at least one project in manual mode'
          }
          return true
        }),
    }),
  ],
})
