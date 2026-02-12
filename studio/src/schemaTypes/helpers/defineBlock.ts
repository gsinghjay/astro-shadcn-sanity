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
  return defineType({
    name: config.name,
    title: config.title,
    type: 'object',
    fieldsets: [
      {name: 'layout', title: 'Layout Options', options: {collapsible: true, collapsed: true}},
      ...(config.fieldsets ?? []),
    ],
    fields: [...blockBaseFields, ...config.fields],
    preview: config.preview,
    icon: config.icon,
  })
}
