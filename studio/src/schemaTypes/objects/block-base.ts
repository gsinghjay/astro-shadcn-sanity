import {defineField} from 'sanity'

export const blockBaseFields = [
  defineField({
    name: 'backgroundVariant',
    title: 'Background Variant',
    type: 'string',
    fieldset: 'layout',
    options: {
      list: [
        {title: 'White', value: 'white'},
        {title: 'Light', value: 'light'},
        {title: 'Dark', value: 'dark'},
        {title: 'Primary', value: 'primary'},
      ],
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
      list: [
        {title: 'None', value: 'none'},
        {title: 'Small', value: 'small'},
        {title: 'Default', value: 'default'},
        {title: 'Large', value: 'large'},
      ],
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
      list: [
        {title: 'Narrow', value: 'narrow'},
        {title: 'Default', value: 'default'},
        {title: 'Full', value: 'full'},
      ],
      layout: 'radio',
    },
    initialValue: 'default',
  }),
]
