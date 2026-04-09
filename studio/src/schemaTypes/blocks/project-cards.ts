import {defineField} from 'sanity'
import {ProjectsIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'
import {displayModeBlock} from '../helpers/commonFields'

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
    ...displayModeBlock({
      referenceType: 'project',
      arrayFieldName: 'projects',
      arrayFieldTitle: 'Projects',
    }),
  ],
})
