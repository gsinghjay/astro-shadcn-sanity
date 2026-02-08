import {defineType, defineField} from 'sanity'
import {blockBaseFields} from '../objects/block-base'

type SchemaDefinition = Parameters<typeof defineType>[0]

interface DefineBlockConfig {
  name: string
  title: string
  fields: ReturnType<typeof defineField>[]
  preview?: SchemaDefinition['preview']
  icon?: SchemaDefinition['icon']
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
