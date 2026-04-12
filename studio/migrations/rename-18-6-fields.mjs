/**
 * Migration: Rename fields from Story 18.6 Schema DRY Refactoring.
 *
 * For each renamed field, copies the old value to the new field name
 * and unsets the old field. Only patches documents where the old field
 * exists and the new field does not.
 *
 * Handles both:
 * - Top-level page blocks (page.blocks[])
 * - videoEmbed blocks nested inside Portable Text fields
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

/**
 * Apply renames to a single block object. Returns true if modified.
 */
function renameBlockFields(block, docId) {
  const renames = RENAMES[block._type]
  if (!renames) return false

  let modified = false
  for (const {old: oldName, new: newName} of renames) {
    if (block[oldName] !== undefined && block[newName] === undefined) {
      block[newName] = block[oldName]
      delete block[oldName]
      modified = true
      console.log(`  ${docId} → ${block._type}.${oldName} → ${newName}`)
    }
  }
  return modified
}

/**
 * Walk a Portable Text array and rename fields on embedded blocks (e.g. videoEmbed).
 */
function walkPortableText(ptBlocks, docId) {
  if (!Array.isArray(ptBlocks)) return false
  let modified = false
  for (const node of ptBlocks) {
    if (node._type && RENAMES[node._type]) {
      if (renameBlockFields(node, docId)) modified = true
    }
  }
  return modified
}

async function migrate() {
  // Phase 1: Top-level page blocks
  const pages = await client.fetch(
    `*[_type == "page" && defined(blocks)]{_id, _rev, blocks}`,
  )

  console.log(`Found ${pages.length} page documents to check`)
  if (DRY_RUN) console.log('DRY RUN — no changes will be written\n')

  let totalPatched = 0
  let totalFailed = 0

  for (const page of pages) {
    let modified = false
    const blocks = page.blocks.map((block) => {
      const updated = {...block}
      if (renameBlockFields(updated, page._id)) modified = true

      // Walk Portable Text fields inside blocks for nested videoEmbed
      for (const [, value] of Object.entries(updated)) {
        if (Array.isArray(value) && value.some((v) => v?._type)) {
          if (walkPortableText(value, page._id)) modified = true
        }
      }

      return updated
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

  // Phase 2: Any document with Portable Text that may contain videoEmbed
  const ptDocsAlt = await client.fetch(
    `*[defined(body) || defined(content)]{_id, _rev, body, content}`,
  )

  const seenIds = new Set(pages.map((p) => p._id))

  for (const doc of ptDocsAlt) {
    if (seenIds.has(doc._id)) continue
    seenIds.add(doc._id)

    let modified = false
    const patch = {}

    for (const fieldName of ['body', 'content']) {
      const ptArray = doc[fieldName]
      if (!Array.isArray(ptArray)) continue
      const cloned = ptArray.map((node) => ({...node}))
      if (walkPortableText(cloned, doc._id)) {
        modified = true
        patch[fieldName] = cloned
      }
    }

    if (modified) {
      try {
        if (!DRY_RUN) {
          await client
            .patch(doc._id)
            .ifRevisionId(doc._rev)
            .set(patch)
            .commit({autoGenerateArrayKeys: false})
        }
        totalPatched++
        if (!DRY_RUN) console.log(`  ✓ Patched ${doc._id}`)
      } catch (err) {
        totalFailed++
        console.error(`  ✗ Failed ${doc._id}: ${err.message}`)
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
