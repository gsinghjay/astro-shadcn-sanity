import {defineType, defineField} from 'sanity'
import type {ComponentType} from 'react'
import {blockBaseFields} from '../objects/block-base'

interface DefineBlockConfig {
  name: string
  title: string
  fields: ReturnType<typeof defineField>[]
  fieldsets?: Array<{name: string; title: string; options?: Record<string, unknown>}>
  preview?: {select: Record<string, string>}
  icon?: ComponentType
}

export function defineBlock(config: DefineBlockConfig) {
  const selectFields: Record<string, string> = {
    heading: 'heading',
    ...(config.preview?.select ?? {}),
  }

  return defineType({
    name: config.name,
    title: config.title,
    type: 'object',
    fieldsets: [
      {name: 'layout', title: 'Layout Options', options: {collapsible: true, collapsed: true}},
      ...(config.fieldsets ?? []),
    ],
    fields: [...blockBaseFields, ...config.fields],
    preview: {
      select: selectFields,
      prepare(selection) {
        return {
          title: (selection.heading as string) || config.title,
          subtitle: config.title,
          media: config.icon,
        }
      },
    },
    icon: config.icon,
  })
}
