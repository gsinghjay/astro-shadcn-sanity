import {defineType, defineField} from 'sanity'
import type {ComponentType} from 'react'
import {blockBaseFields} from '../objects/block-base'

interface DefineBlockConfig {
  name: string
  title: string
  fields: ReturnType<typeof defineField>[]
  preview?: {select: Record<string, string>}
  icon?: ComponentType
}

export function defineBlock(config: DefineBlockConfig) {
  return defineType({
    name: config.name,
    title: config.title,
    type: 'object',
    fields: [...blockBaseFields, ...config.fields],
    preview: config.preview,
    icon: config.icon,
  })
}
