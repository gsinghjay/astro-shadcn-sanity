import {defineField} from 'sanity'

export const blockBaseFields = [
  defineField({
    name: 'backgroundVariant',
    title: 'Background Variant',
    type: 'string',
    options: {
      list: ['white', 'light', 'dark', 'primary'],
      layout: 'radio',
    },
    initialValue: 'white',
  }),
  defineField({
    name: 'spacing',
    title: 'Spacing',
    type: 'string',
    options: {
      list: ['none', 'small', 'default', 'large'],
      layout: 'radio',
    },
    initialValue: 'default',
  }),
  defineField({
    name: 'maxWidth',
    title: 'Max Width',
    type: 'string',
    options: {
      list: ['narrow', 'default', 'full'],
      layout: 'radio',
    },
    initialValue: 'default',
  }),
]
