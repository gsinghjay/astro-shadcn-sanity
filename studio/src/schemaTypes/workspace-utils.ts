import type {SchemaTypeDefinition} from 'sanity'

import {schemaTypes} from './index'
import {siteField} from './fields/site-field'

/**
 * Minimal field shape for type-safe field lookups.
 * Sanity's SchemaTypeDefinition union makes exact field typing impractical,
 * but all field definitions have at least `name` and optional `hidden`.
 */
interface SchemaField {
  name: string
  hidden?: unknown
  [key: string]: unknown
}

/**
 * Returns schema types with siteField.hidden set for the target dataset.
 * - production: site field hidden (capstone editors never see it)
 * - rwc: site field visible (editors must select a site)
 * - any other dataset: site field visible (safe default for new workspaces)
 */
export function createSchemaTypesForWorkspace(
  targetDataset: string,
): SchemaTypeDefinition[] {
  const shouldHide = targetDataset === 'production'

  return schemaTypes.map((type) => {
    if (!('fields' in type) || !type.fields) return type

    const fields = type.fields as unknown as SchemaField[]
    const siteFieldIndex = fields.findIndex((f) => f.name === 'site')
    if (siteFieldIndex === -1) return type

    // Clone the fields array and override the site field's hidden property.
    // Shallow spread preserves extra properties like `group` from
    // `{...siteField, group: 'layout'}` spread in document schemas.
    const updatedFields = [...fields]
    updatedFields[siteFieldIndex] = {
      ...updatedFields[siteFieldIndex],
      hidden: shouldHide,
    }
    return {...type, fields: updatedFields} as unknown as SchemaTypeDefinition
  })
}

/**
 * Workspace schema types reducer that:
 * 1. Injects the siteField into the plugin-registered `form` type so forms
 *    can be scoped per site (the @sanity/form-toolkit form schema has no
 *    site field by default).
 * 2. Appends our own schema types with siteField visibility resolved per
 *    dataset (via createSchemaTypesForWorkspace).
 *
 * Pass as `schema.types` to each workspace: `types: createWorkspaceSchemaTypes('rwc')`.
 */
export function createWorkspaceSchemaTypes(targetDataset: string) {
  return (prev: SchemaTypeDefinition[]): SchemaTypeDefinition[] => {
    const shouldHide = targetDataset === 'production'
    const transformedPrev = prev.map((type) => {
      if (type.name !== 'form') return type
      if (!('fields' in type) || !Array.isArray(type.fields)) return type
      const existing = type.fields as unknown as SchemaField[]
      const hasSite = existing.some((f) => f.name === 'site')
      if (hasSite) {
        const idx = existing.findIndex((f) => f.name === 'site')
        const updated = [...existing]
        updated[idx] = {...updated[idx], hidden: shouldHide}
        return {...type, fields: updated} as unknown as SchemaTypeDefinition
      }
      return {
        ...type,
        fields: [...existing, {...siteField, hidden: shouldHide}],
      } as unknown as SchemaTypeDefinition
    })
    return [...transformedPrev, ...createSchemaTypesForWorkspace(targetDataset)]
  }
}
