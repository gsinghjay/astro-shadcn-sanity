import {defineField} from 'sanity'

export const blockBaseFields = [
  defineField({
    name: 'backgroundVariant',
    title: 'Background Variant',
    type: 'string',
    fieldset: 'layout',
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
    fieldset: 'layout',
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
    fieldset: 'layout',
    options: {
      list: ['narrow', 'default', 'full'],
      layout: 'radio',
    },
    initialValue: 'default',
  }),
]
