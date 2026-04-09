import {defineField} from 'sanity'
import {SplitHorizontalIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const beforeAfter = defineBlock({
  name: 'beforeAfter',
  title: 'Before & After',
  icon: SplitHorizontalIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'side-by-side', title: 'Side by Side'},
    {name: 'stacked', title: 'Stacked'},
    {name: 'toggle', title: 'Toggle'},
  ],
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required().max(150)}),
    defineField({
      name: 'beforeImage',
      title: 'Before Image',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({name: 'alt', title: 'Alt text', type: 'string'}),
      ],
    }),
    defineField({
      name: 'afterImage',
      title: 'After Image',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({name: 'alt', title: 'Alt text', type: 'string'}),
      ],
    }),
    defineField({
      name: 'beforeLabel',
      title: 'Before Label',
      type: 'string',
      description: 'Label shown on the before image overlay',
      initialValue: 'Before',
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: 'afterLabel',
      title: 'After Label',
      type: 'string',
      description: 'Label shown on the after image overlay',
      initialValue: 'After',
      validation: (Rule) => Rule.max(100),
    }),
    defineField({name: 'caption', title: 'Caption', type: 'string', validation: (Rule) => Rule.max(200)}),
  ],
})
