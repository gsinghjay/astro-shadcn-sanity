import {defineField} from 'sanity'
import {defineBlock} from '../helpers/defineBlock'

export const teamGrid = defineBlock({
  name: 'teamGrid',
  title: 'Team Grid',
  preview: {select: {title: 'heading'}},
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'useDocumentRefs',
      title: 'Use Document References',
      type: 'boolean',
      initialValue: false,
      description: 'Use team document references instead of inline members',
    }),
    defineField({
      name: 'teams',
      title: 'Teams',
      type: 'array',
      hidden: ({parent}) => parent?.useDocumentRefs !== true,
      of: [
        {
          type: 'reference',
          to: [{type: 'team'}],
        },
      ],
    }),
    defineField({
      name: 'members',
      title: 'Members',
      type: 'array',
      hidden: ({parent}) => parent?.useDocumentRefs === true,
      of: [
        {
          type: 'object',
          preview: {select: {title: 'name', subtitle: 'role'}},
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
            defineField({
              name: 'photo',
              title: 'Photo',
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
              name: 'linkedIn',
              title: 'LinkedIn',
              type: 'url',
            }),
          ],
        },
      ],
    }),
  ],
})
