/**
 * Story 1-2: Migrate Reference Project — Architecture & Layout (AC4,5,10,11)
 *
 * Validates anti-patterns, layout components, and icon integration.
 *
 * @story 1-2
 */
import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ASTRO_APP = path.resolve(__dirname, '../../../astro-app')

test.describe('Story 1-2: Migrate Reference Project', () => {
  // ---------------------------------------------------------------------------
  // Architecture Anti-patterns
  // ---------------------------------------------------------------------------
  test.describe('Architecture Anti-patterns', () => {
    test('[P0] 1.2-INT-010 — No lucide-react imports in production code', async () => {
      const dirsToScan = [
        path.join(ASTRO_APP, 'src/components/blocks'),
        path.join(ASTRO_APP, 'src/pages'),
        path.join(ASTRO_APP, 'src/layouts'),
        path.join(ASTRO_APP, 'src/lib'),
      ]

      const violations: string[] = []

      function scanDir(dir: string) {
        if (!fs.existsSync(dir)) return
        const entries = fs.readdirSync(dir, { withFileTypes: true })

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)

          if (entry.isDirectory()) {
            if (entry.name === '.storybook' || entry.name === 'stories') continue
            scanDir(fullPath)
            continue
          }

          if (
            !(entry.name.endsWith('.astro') || entry.name.endsWith('.ts')) ||
            entry.name.endsWith('.stories.ts')
          ) {
            continue
          }

          const content = fs.readFileSync(fullPath, 'utf-8')
          if (content.includes('lucide-react')) {
            violations.push(fullPath.replace(ASTRO_APP + '/', ''))
          }
        }
      }

      for (const dir of dirsToScan) {
        scanDir(dir)
      }

      expect(
        violations,
        `Found lucide-react imports in: ${violations.join(', ')}`,
      ).toHaveLength(0)
    })

    test('[P1] 1.2-INT-011 — components.json has tsx: false', async () => {
      const configPath = path.join(ASTRO_APP, 'components.json')
      expect(fs.existsSync(configPath), 'components.json missing').toBe(true)

      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      expect(config.tsx).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // AC4,5: Layout Components
  // ---------------------------------------------------------------------------
  test.describe('AC4,5: Layout Components', () => {
    test('[P1] 1.2-INT-012 — Header.astro, Footer.astro, and Layout.astro exist', async () => {
      const componentsDir = path.join(ASTRO_APP, 'src/components')
      const layoutsDir = path.join(ASTRO_APP, 'src/layouts')

      expect(
        fs.existsSync(path.join(componentsDir, 'Header.astro')),
        'Header.astro missing',
      ).toBe(true)
      expect(
        fs.existsSync(path.join(componentsDir, 'Footer.astro')),
        'Footer.astro missing',
      ).toBe(true)
      expect(
        fs.existsSync(path.join(layoutsDir, 'Layout.astro')),
        'Layout.astro missing',
      ).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // AC6: Pages
  // ---------------------------------------------------------------------------
  test.describe('AC6: Pages', () => {
    test('[P1] 1.2-INT-007 — All 5 page files exist', async () => {
      const pagesDir = path.join(ASTRO_APP, 'src/pages')
      const expectedPages = [
        'index.astro',
        'about.astro',
        'projects.astro',
        'sponsors.astro',
        'contact.astro',
      ]

      for (const page of expectedPages) {
        const filePath = path.join(pagesDir, page)
        expect(
          fs.existsSync(filePath),
          `Missing page file: ${page}`,
        ).toBe(true)
      }
    })
  })

  // ---------------------------------------------------------------------------
  // AC11: Icon Integration
  // ---------------------------------------------------------------------------
  test.describe('AC11: Icon Integration', () => {
    test('[P1] 1.2-INT-013 — astro.config.mjs imports and uses astro-icon integration', async () => {
      const configPath = path.join(ASTRO_APP, 'astro.config.mjs')
      expect(fs.existsSync(configPath), 'astro.config.mjs missing').toBe(true)

      const content = fs.readFileSync(configPath, 'utf-8')

      expect(
        /import\s+icon\s+from\s+['"]astro-icon['"]/.test(content),
        'astro.config.mjs missing astro-icon import',
      ).toBe(true)

      expect(
        content.includes('icon()'),
        'astro.config.mjs missing icon() in integrations',
      ).toBe(true)
    })
  })
})
