import {defineField, defineArrayMember} from 'sanity'
import {InlineIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const tabsBlock = defineBlock({
  name: 'tabsBlock',
  title: 'Tabs Block',
  icon: InlineIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'default', title: 'Default'},
    {name: 'pills', title: 'Pills'},
    {name: 'underline', title: 'Underline'},
    {name: 'brutalist', title: 'Brutalist'},
  ],
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({
      name: 'tabs',
      title: 'Tabs',
      type: 'array',
      of: [defineArrayMember({type: 'tabItem'})],
      validation: (Rule) => Rule.min(1),
    }),
  ],
})
