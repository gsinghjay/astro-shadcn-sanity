import {defineField} from 'sanity'

/**
 * Slug uniqueness scoped to the same site.
 * In the `rwc` dataset, two different sites can share the same slug.
 * In `production`, site is empty so this degrades to a global check.
 */
export async function siteScopedIsUnique(
  slug: string,
  context: {
    document?: {_id: string; _type?: string; [key: string]: unknown}
    getClient: (options: {apiVersion: string}) => {
      fetch: <T>(query: string, params: Record<string, unknown>) => Promise<T>
    }
    type?: {name?: string}
  },
): Promise<boolean> {
  const {document, getClient, type} = context
  const client = getClient({apiVersion: '2024-01-01'})
  const id = document?._id.replace(/^drafts\./, '')
  const site = (document as {site?: string})?.site || ''
  const docType = type?.name || document?._type
  const count = await client.fetch<number>(
    `count(*[_type == $type && slug.current == $slug && site == $site && !(_id in [$id, $draftId])])`,
    {type: docType, slug, site, id, draftId: `drafts.${id}`},
  )
  return count === 0
}

/**
 * Reusable site field for multi-site content filtering.
 * Hidden on `production` dataset (capstone editors never see it).
 * Required on `rwc` dataset via validation callback.
 */
export const siteField = defineField({
  name: 'site',
  title: 'Site',
  type: 'string',
  description: 'Which RWC site this content belongs to',
  options: {
    list: [
      {title: 'RWC US', value: 'rwc-us'},
      {title: 'RWC International', value: 'rwc-intl'},
    ],
    layout: 'radio',
  },
  // Default: hidden. Overridden per workspace via createSchemaTypesForWorkspace().
  hidden: true,
  validation: (Rule) =>
    Rule.custom((value, context) => {
      const {dataset} = context.getClient({apiVersion: '2024-01-01'}).config()
      if (dataset === 'rwc' && !value) {
        return 'Site is required for RWC content'
      }
      return true
    }),
})
