import {defineType, defineField, defineArrayMember} from 'sanity'
import {UsersIcon} from '@sanity/icons'

export const team = defineType({
  name: 'team',
  title: 'Capstone Team',
  type: 'document',
  icon: UsersIcon,
  groups: [
    {name: 'main', title: 'Main', default: true},
    {name: 'team', title: 'Team'},
    {name: 'links', title: 'Links & Resources'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Team Name',
      type: 'string',
      group: 'main',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'semester',
      title: 'Semester',
      type: 'string',
      group: 'main',
      validation: (rule) => rule.required(),
      options: {
        list: ['Spring 2026', 'Fall 2026'],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'project',
      title: 'Assigned Project',
      type: 'reference',
      group: 'main',
      to: [{type: 'project'}],
    }),
    defineField({
      name: 'maxMembers',
      title: 'Max Team Size',
      type: 'number',
      group: 'main',
      initialValue: 5,
      validation: (rule) => rule.required().min(2).max(12),
    }),
    defineField({
      name: 'pm',
      title: 'Project Manager (PM)',
      type: 'reference',
      group: 'team',
      to: [{type: 'capstoneStudent'}],
      validation: (rule) => rule.required(),
      description: 'Designated student PM — must also be in Members',
    }),
    defineField({
      name: 'assistantPm',
      title: 'Assistant PM',
      type: 'reference',
      group: 'team',
      to: [{type: 'capstoneStudent'}],
      description: 'Available when team has more than 5 members',
      hidden: ({document}) => {
        const members = (document?.members as unknown[]) ?? []
        return members.length <= 5
      },
    }),
    defineField({
      name: 'members',
      title: 'Team Members',
      type: 'array',
      group: 'team',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'capstoneStudent'}],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'githubRepoUrl',
      title: 'GitHub Repository URL',
      type: 'url',
      group: 'links',
    }),
    defineField({
      name: 'discordChannelUrl',
      title: 'Team Discord Channel',
      type: 'url',
      group: 'links',
    }),
    defineField({
      name: 'teamResources',
      title: 'Team Resources & Links',
      type: 'array',
      group: 'links',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              options: {
                list: ['communication', 'development', 'documents', 'general'],
              },
              initialValue: 'general',
            }),
          ],
          preview: {
            select: {title: 'label', subtitle: 'url'},
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'semester', pm: 'pm.name'},
    prepare({title, subtitle, pm}) {
      return {
        title: title ?? 'Unnamed Team',
        subtitle: `${subtitle ?? ''} — PM: ${pm ?? 'Unassigned'}`,
      }
    },
  },
})
