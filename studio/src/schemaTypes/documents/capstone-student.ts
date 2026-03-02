import {defineType, defineField} from 'sanity'
import {UserIcon} from '@sanity/icons'

export const capstoneStudent = defineType({
  name: 'capstoneStudent',
  title: 'Capstone Student',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email (@njit.edu)',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'semester',
      title: 'Semester',
      type: 'string',
      options: {
        list: ['Spring 2026', 'Fall 2026'],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'githubUsername',
      title: 'GitHub Username',
      type: 'string',
    }),
    defineField({
      name: 'discordUsername',
      title: 'Discord Username',
      type: 'string',
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'email'},
  },
})
