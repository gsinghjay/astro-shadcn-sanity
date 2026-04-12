/**
 * Story 21-9: Block Variant Audit — schema↔component alignment
 *
 * Programmatically verifies that every variant defined in a block's schema
 * has a corresponding rendering branch in its Astro component, and vice versa.
 *
 * @story 21-9
 * @phase RED → GREEN
 */
import { describe, test, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const SCHEMA_DIR = join(__dirname, '../../../studio/src/schemaTypes/blocks')
const COMPONENT_DIR = join(__dirname, '../../../astro-app/src/components/blocks/custom')

/** Extract variant names from a schema file's defineBlock({ variants: [...] }) */
function extractSchemaVariants(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf8')
  const variantsMatch = content.match(/variants:\s*\[([\s\S]*?)\]/)
  if (!variantsMatch) return []
  return [...variantsMatch[1].matchAll(/name:\s*'([^']+)'/g)].map(m => m[1]).sort()
}

/** Extract variant branches from a component file's conditional rendering */
function extractComponentVariants(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf8')
  // Match explicit variant checks: cleanVariant === 'xxx', variant === 'xxx', etc.
  const variantChecks = [
    ...content.matchAll(
      /(?:clean(?:ed)?[Vv]ariant|rawCleaned|cleanVariant|layoutVariant|variant)\s*===\s*'([^']+)'/g,
    ),
  ].map(m => m[1])
  // Match default values: stegaClean(variant ?? 'xxx')
  const defaults = [
    ...content.matchAll(/stegaClean\((?:raw)?[Vv]ariant\s*\?\?\s*'([^']+)'\)/g),
  ].map(m => m[1])
  return [...new Set([...defaults, ...variantChecks])].sort()
}

/**
 * Check if a component file has a ternary else-fallback branch
 * (the final `: (` in a ternary chain that handles the remaining variant)
 */
function hasElseFallback(filePath: string): boolean {
  const content = readFileSync(filePath, 'utf8')
  // Ternary chains end with ) : ( for the else branch
  // Or it could be } : cleanVariant === ... pattern ending with ) : (
  return /\)\s*:\s*\(/.test(content) || /\)\s*:\s*\n\s*\(/.test(content)
}

/** Convert kebab-case to PascalCase */
function kebabToPascal(s: string): string {
  return s
    .split('-')
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join('')
}

// Build maps of schema variants and component variants
const schemaFiles = readdirSync(SCHEMA_DIR)
  .filter(f => f.endsWith('.ts'))
  .sort()
const componentFiles = readdirSync(COMPONENT_DIR)
  .filter(f => f.endsWith('.astro'))
  .sort()

const schemaMap: Record<string, string[]> = {}
for (const f of schemaFiles) {
  schemaMap[f.replace('.ts', '')] = extractSchemaVariants(join(SCHEMA_DIR, f))
}

const componentMap: Record<string, string[]> = {}
for (const f of componentFiles) {
  componentMap[f.replace('.astro', '')] = extractComponentVariants(join(COMPONENT_DIR, f))
}

describe('Story 21-9: Block Variant Audit', () => {
  describe('Part 1: Schema↔Component Variant Alignment', () => {
    const blocksWithVariants = Object.entries(schemaMap).filter(([, variants]) => variants.length > 0)

    test('21.9-INT-001 — all 37 blocks have schema files', () => {
      expect(schemaFiles.length).toBe(37)
    })

    test('21.9-INT-002 — all 37 blocks have component files', () => {
      expect(componentFiles.length).toBe(37)
    })

    test('21.9-INT-003 — every schema file has a matching component file', () => {
      for (const schemaName of Object.keys(schemaMap)) {
        const componentName = kebabToPascal(schemaName)
        expect(componentMap[componentName], `Missing component for schema ${schemaName}`).toBeDefined()
      }
    })

    test('21.9-INT-004 — all 37 blocks define variants', () => {
      const blocksWithoutVariants = Object.entries(schemaMap)
        .filter(([, variants]) => variants.length === 0)
        .map(([name]) => name)
      expect(blocksWithoutVariants).toEqual([])
    })

    // Per-block alignment checks
    for (const [schemaName, schemaVariants] of blocksWithVariants) {
      const compName = kebabToPascal(schemaName)
      const compVariants = componentMap[compName] ?? []

      test(`21.9-INT-BLOCK — ${schemaName}: all schema variants covered by component`, () => {
        const missingInComponent = schemaVariants.filter(v => !compVariants.includes(v))

        if (missingInComponent.length === 1) {
          // One variant can be the else-fallback branch (not explicitly checked)
          const compFile = join(COMPONENT_DIR, `${compName}.astro`)
          const hasFallback = hasElseFallback(compFile)
          expect(
            hasFallback,
            `${schemaName}: variant '${missingInComponent[0]}' not explicitly checked and no else-fallback found`,
          ).toBe(true)
        } else {
          expect(
            missingInComponent,
            `${schemaName}: schema variants missing in component: ${missingInComponent.join(', ')}`,
          ).toEqual([])
        }
      })

      test(`21.9-INT-BLOCK — ${schemaName}: no orphaned component branches`, () => {
        const orphaned = compVariants.filter(v => !schemaVariants.includes(v))
        expect(
          orphaned,
          `${schemaName}: orphaned component branches: ${orphaned.join(', ')}`,
        ).toEqual([])
      })
    }
  })

  describe('Part 2: EventList has variants', () => {
    test('21.9-INT-005 — EventList schema defines grid, list, timeline variants', () => {
      const eventListVariants = schemaMap['event-list']
      expect(eventListVariants).toContain('grid')
      expect(eventListVariants).toContain('list')
      expect(eventListVariants).toContain('timeline')
    })

    test('21.9-INT-006 — EventList component implements all three variants', () => {
      const eventListCompVariants = componentMap['EventList'] ?? []
      expect(eventListCompVariants).toContain('grid')
      expect(eventListCompVariants).toContain('list')
      expect(eventListCompVariants).toContain('timeline')
    })
  })

  describe('Part 4: BlockWrapper dark bg CSS variable override', () => {
    test('21.9-INT-008 — global.css has [data-bg-theme="dark"] override', () => {
      const css = readFileSync(
        join(__dirname, '../../../astro-app/src/styles/global.css'),
        'utf8',
      )
      expect(css).toContain('[data-bg-theme="dark"]')
      expect(css).toMatch(/--muted-foreground:\s*#a3a3a3/)
      expect(css).toMatch(/--border:\s*rgba\(255/)
      expect(css).toMatch(/--card-foreground:\s*#f7f7f7/)
    })

    test('21.9-INT-009 — BlockWrapper sets data-bg-theme for dark variants', () => {
      const wrapper = readFileSync(
        join(__dirname, '../../../astro-app/src/components/BlockWrapper.astro'),
        'utf8',
      )
      expect(wrapper).toContain("data-bg-theme={isDarkBg ? 'dark' : undefined}")
      expect(wrapper).toContain("isDarkBg = ['dark', 'hatched', 'primary', 'blueprint', 'mono']")
    })

    test('21.9-INT-010 — no blocks use per-block isDarkBg text ternaries', () => {
      // isDarkBg/isDark ternaries for text-muted-foreground are now handled globally.
      // Only HeroBanner may keep isDarkHero for button styling (design choice).
      for (const f of componentFiles) {
        if (f === 'HeroBanner.astro') continue
        const content = readFileSync(join(COMPONENT_DIR, f), 'utf8')
        const hasDarkTextTernary =
          /isDark(?:Bg)?\s*\?\s*'text-background/.test(content)
        expect(
          hasDarkTextTernary,
          `${f}: still has isDarkBg text ternary — should use text-muted-foreground`,
        ).toBe(false)
      }
    })
  })

  describe('Part 5: BlockWrapper spacing override', () => {
    test('21.9-INT-011 — BlockWrapper uses --block-section-py override instead of py-* classes', () => {
      const wrapper = readFileSync(
        join(__dirname, '../../../astro-app/src/components/BlockWrapper.astro'),
        'utf8',
      )
      // Should set --block-section-py via inline style, not use py-* utility classes
      expect(wrapper).toContain('--block-section-py')
      expect(wrapper).not.toMatch(/py-6|py-8|py-20|py-24|py-0/)
    })
  })

  describe('Part 6: Block-base alignment field', () => {
    test('21.9-INT-012 — block-base includes alignment field', () => {
      const content = readFileSync(
        join(SCHEMA_DIR, '../objects/block-base.ts'),
        'utf8',
      )
      expect(content).toContain("name: 'alignment'")
      expect(content).toContain("{title: 'Left', value: 'left'}")
      expect(content).toContain("{title: 'Center', value: 'center'}")
      expect(content).toContain("{title: 'Right', value: 'right'}")
    })

    test('21.9-INT-013 — HeroBanner no longer has its own alignment field', () => {
      const content = readFileSync(join(SCHEMA_DIR, 'hero-banner.ts'), 'utf8')
      // Should not define its own alignment field — it gets it from block-base
      const fieldMatches = [...content.matchAll(/defineField\(\{[\s\S]*?name:\s*'alignment'/g)]
      expect(fieldMatches.length).toBe(0)
    })
  })

  describe('Part 7: Layout options use dropdowns (no radio)', () => {
    test('21.9-INT-014 — block-base fields do not use radio layout', () => {
      const content = readFileSync(
        join(SCHEMA_DIR, '../objects/block-base.ts'),
        'utf8',
      )
      expect(content).not.toContain("layout: 'radio'")
    })

    test('21.9-INT-015 — variant field does not use radio layout', () => {
      const content = readFileSync(
        join(SCHEMA_DIR, '../helpers/defineBlock.ts'),
        'utf8',
      )
      // The variant field options should not have layout: 'radio'
      expect(content).not.toContain("layout: 'radio'")
    })

    test('21.9-INT-016 — variant field is titled "Block Variant"', () => {
      const content = readFileSync(
        join(SCHEMA_DIR, '../helpers/defineBlock.ts'),
        'utf8',
      )
      expect(content).toContain("title: 'Block Variant'")
    })
  })

  describe('Part 3: Layout fieldset discoverability', () => {
    test('21.9-INT-007 — layout fieldset has description', () => {
      // Read defineBlock source and check fieldset config
      const content = readFileSync(join(SCHEMA_DIR, '../helpers/defineBlock.ts'), 'utf8')
      // The layout fieldset should have a description property
      expect(content).toMatch(/name:\s*'layout'[\s\S]*?description:/)
    })
  })
})
