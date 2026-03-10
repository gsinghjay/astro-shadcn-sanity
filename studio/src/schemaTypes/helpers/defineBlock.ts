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
  variants?: {name: string; title: string}[]
  hiddenByVariant?: Record<string, string[]>
}

export function defineBlock(config: DefineBlockConfig) {
  const selectFields: Record<string, string> = {
    heading: 'heading',
    ...(config.preview?.select ?? {}),
  }

  // Build variant field if variants are provided
  const variantFields: ReturnType<typeof defineField>[] = config.variants
    ? [
        defineField({
          name: 'variant',
          title: 'Variant',
          description: 'Choose a layout variant for this block',
          type: 'string',
          fieldset: 'layout',
          options: {
            list: config.variants.map((v) => ({title: v.title, value: v.name})),
            layout: 'radio',
          },
          initialValue: config.variants[0]?.name,
        }),
      ]
    : []

  // Apply hiddenByVariant to block-specific fields
  // Composes with any existing hidden function on the field instead of replacing it
  const blockFields = config.hiddenByVariant
    ? config.fields.map((field) => {
        const fieldName = (field as {name: string}).name
        const hiddenVariants = config.hiddenByVariant![fieldName]
        if (!hiddenVariants) return field
        const existingHidden = (field as {hidden?: (ctx: {parent?: {variant?: string}}) => boolean}).hidden
        return {
          ...field,
          hidden: ({parent}: {parent?: {variant?: string}}) =>
            (existingHidden ? existingHidden({parent}) : false) ||
            hiddenVariants.includes(parent?.variant ?? ''),
        }
      })
    : config.fields

  return defineType({
    name: config.name,
    title: config.title,
    type: 'object',
    fieldsets: [
      {name: 'layout', title: 'Layout Options', options: {collapsible: true, collapsed: true}},
      ...(config.fieldsets ?? []),
    ],
    fields: [...blockBaseFields, ...variantFields, ...blockFields],
    preview: {
      select: selectFields,
      prepare(selection) {
        return {
          title: (selection.heading as string) || (selection.title as string) || config.title,
          subtitle: (selection.subtitle as string) || config.title,
          media: config.icon,
        }
      },
    },
    icon: config.icon,
  })
}
