/**
 * Migration: Add _type fields to array items after extracting named object types.
 * Story 7.10: featureGrid items → featureItem, statsRow stats → statItem, sponsorSteps items → stepItem
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-01-01'})

const TYPE_MAP = {
  featureGrid: {field: 'items', itemType: 'featureItem'},
  statsRow: {field: 'stats', itemType: 'statItem'},
  sponsorSteps: {field: 'items', itemType: 'stepItem'},
}

async function migrate() {
  const pages = await client.fetch(
    `*[_type == "page" && defined(blocks)]{_id, _rev, blocks}`,
  )

  console.log(`Found ${pages.length} page documents to check`)

  for (const page of pages) {
    let modified = false
    const blocks = page.blocks.map((block) => {
      const mapping = TYPE_MAP[block._type]
      if (!mapping) return block

      const items = block[mapping.field]
      if (!items || !Array.isArray(items)) return block

      const updatedItems = items.map((item) => {
        if (item._type === mapping.itemType) return item
        modified = true
        return {...item, _type: mapping.itemType}
      })

      return {...block, [mapping.field]: updatedItems}
    })

    if (modified) {
      console.log(`Patching ${page._id}...`)
      await client
        .patch(page._id)
        .set({blocks})
        .commit({autoGenerateArrayKeys: false})
      console.log(`  ✓ Done`)
    } else {
      console.log(`Skipping ${page._id} (no changes needed)`)
    }
  }

  console.log('Migration complete')
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
