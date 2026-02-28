import type {SchemaTypeDefinition} from 'sanity'

import {schemaTypes} from './index'

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

    const fields = type.fields as SchemaField[]
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
    return {...type, fields: updatedFields}
  })
}
