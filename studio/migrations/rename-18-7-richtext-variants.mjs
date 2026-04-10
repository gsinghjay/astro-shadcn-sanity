/**
 * Migration: Rename rich-text variant values from Story 18.7.
 *
 * Renames: narrow → standard, wide → highlighted
 * Only patches documents where richText blocks use the old variant names.
 *
 * Run: node studio/migrations/rename-18-7-richtext-variants.mjs [--dry-run]
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

const VARIANT_MAP = {
  narrow: 'standard',
  wide: 'highlighted',
}

async function migrate() {
  const pages = await client.fetch(
    `*[_type == "page" && defined(blocks[_type == "richText"])]{
      _id, _rev,
      blocks
    }`,
  )

  console.log(`Found ${pages.length} pages with richText blocks`)
  if (DRY_RUN) console.log('DRY RUN — no changes will be written\n')

  let totalPatched = 0
  let totalFailed = 0

  for (const page of pages) {
    let modified = false
    const blocks = page.blocks.map((block) => {
      if (block._type !== 'richText') return block

      const oldVariant = block.variant
      const newVariant = VARIANT_MAP[oldVariant]
      if (newVariant) {
        modified = true
        console.log(`  ${page._id} → richText.variant: ${oldVariant} → ${newVariant}`)
        return {...block, variant: newVariant}
      }
      return block
    })

    if (modified) {
      try {
        if (!DRY_RUN) {
          await client
            .patch(page._id)
            .ifRevisionId(page._rev)
            .set({blocks})
            .commit({autoGenerateArrayKeys: false})
        }
        totalPatched++
        if (!DRY_RUN) console.log(`  ✓ Patched ${page._id}`)
      } catch (err) {
        totalFailed++
        console.error(`  ✗ Failed ${page._id}: ${err.message}`)
      }
    }
  }

  console.log(
    `\n${DRY_RUN ? 'Would patch' : 'Patched'} ${totalPatched} documents` +
      (totalFailed > 0 ? `, ${totalFailed} failed` : ''),
  )
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
