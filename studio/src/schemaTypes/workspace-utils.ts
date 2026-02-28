import type {SchemaTypeDefinition} from 'sanity'

import {schemaTypes} from './index'

/**
 * Returns schema types with siteField.hidden set for the target dataset.
 * - production: site field hidden (capstone editors never see it)
 * - rwc: site field visible (editors must select a site)
 */
export function createSchemaTypesForWorkspace(
  targetDataset: string,
): SchemaTypeDefinition[] {
  const shouldHide = targetDataset === 'production'

  return schemaTypes.map((type) => {
    if (!('fields' in type) || !type.fields) return type
    const siteFieldIndex = type.fields.findIndex(
      (f: any) => f.name === 'site',
    )
    if (siteFieldIndex === -1) return type

    // Clone the fields array and override the site field's hidden property.
    // Shallow spread preserves extra properties like `group` from
    // `{...siteField, group: 'layout'}` spread in document schemas.
    const fields = [...type.fields]
    fields[siteFieldIndex] = {
      ...fields[siteFieldIndex],
      hidden: shouldHide,
    }
    return {...type, fields}
  })
}
