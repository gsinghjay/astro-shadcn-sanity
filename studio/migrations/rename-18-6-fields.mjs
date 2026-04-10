/**
 * Migration: Rename fields from Story 18.6 Schema DRY Refactoring.
 *
 * For each renamed field, copies the old value to the new field name
 * and unsets the old field. Only patches documents where the old field
 * exists and the new field does not.
 *
 * Run: node studio/migrations/rename-18-6-fields.mjs [--dry-run]
 * Requires: SANITY_AUTH_TOKEN, SANITY_STUDIO_PROJECT_ID env vars
 */
import {createClient} from '@sanity/client'
import {config} from 'dotenv'
import {fileURLToPath} from 'node:url'
import {dirname, resolve} from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({path: resolve(__dirname, '..', '.env')})

const DRY_RUN = process.argv.includes('--dry-run')

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: '2026-04-01',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
})

/**
 * Field rename map: blockType -> [{old, new}]
 * All fields live inside page.blocks[] array items.
 */
const RENAMES = {
  testimonials: [{old: 'displayMode', new: 'testimonialSource'}],
  eventList: [{old: 'filterBy', new: 'eventStatus'}],
  articleList: [
    {old: 'source', new: 'contentType'},
    {old: 'links', new: 'ctaButtons'},
  ],
  videoEmbed: [{old: 'videoUrl', new: 'youtubeUrl'}],
  newsletter: [
    {old: 'placeholderText', new: 'inputPlaceholder'},
    {old: 'buttonText', new: 'submitButtonLabel'},
    {old: 'disclaimer', new: 'privacyDisclaimerText'},
  ],
  comparisonTable: [
    {old: 'columns', new: 'options'},
    {old: 'rows', new: 'criteria'},
  ],
}

async function migrate() {
  const pages = await client.fetch(
    `*[_type == "page" && defined(blocks)]{_id, _rev, blocks}`,
  )

  console.log(`Found ${pages.length} page documents to check`)
  if (DRY_RUN) console.log('DRY RUN — no changes will be written\n')

  let totalPatched = 0

  for (const page of pages) {
    let modified = false
    const blocks = page.blocks.map((block) => {
      const renames = RENAMES[block._type]
      if (!renames) return block

      let updated = {...block}
      for (const {old: oldName, new: newName} of renames) {
        if (updated[oldName] !== undefined && updated[newName] === undefined) {
          updated[newName] = updated[oldName]
          delete updated[oldName]
          modified = true
          console.log(
            `  ${page._id} → ${block._type}.${oldName} → ${newName}`,
          )
        }
      }
      return updated
    })

    if (modified) {
      totalPatched++
      if (!DRY_RUN) {
        await client
          .patch(page._id)
          .set({blocks})
          .commit({autoGenerateArrayKeys: false})
        console.log(`  ✓ Patched ${page._id}`)
      }
    }
  }

  console.log(
    `\n${DRY_RUN ? 'Would patch' : 'Patched'} ${totalPatched} of ${pages.length} documents`,
  )
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
