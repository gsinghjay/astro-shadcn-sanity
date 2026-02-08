/**
 * Story 1-4: Storybook Setup — Integration Tests
 * Validates Storybook configuration, story files, and scripts.
 * @story 1-4
 */
import { test, expect } from '@playwright/test'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

import { BLOCK_NAMES, BUILD_TIMEOUT_MS } from '../support/constants'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ASTRO_APP = path.resolve(__dirname, '../../astro-app')

const BLOCK_STORY_FILES = BLOCK_NAMES.map(name => `${name}.stories.ts`)

test.describe('Story 1-4: Storybook Setup', () => {
  // ---------------------------------------------------------------------------
  // AC2,3: Storybook Config
  // ---------------------------------------------------------------------------
  test.describe('AC2,3: Storybook Config', () => {
    test('[P0] 1.4-INT-001 — .storybook/main.ts configures storybook-astro framework', async () => {
      const mainPath = path.join(ASTRO_APP, '.storybook/main.ts')
      expect(fs.existsSync(mainPath), '.storybook/main.ts missing').toBe(true)

      const content = fs.readFileSync(mainPath, 'utf-8')

      expect(
        content.includes('storybook-astro'),
        'main.ts missing storybook-astro framework',
      ).toBe(true)

      expect(
        content.includes('stories'),
        'main.ts missing stories glob pattern',
      ).toBe(true)
    })

    test('[P0] 1.4-INT-002 — .storybook/preview.ts imports global.css', async () => {
      const previewPath = path.join(ASTRO_APP, '.storybook/preview.ts')
      expect(fs.existsSync(previewPath), '.storybook/preview.ts missing').toBe(true)

      const content = fs.readFileSync(previewPath, 'utf-8')

      expect(
        content.includes("'../src/styles/global.css'") ||
          content.includes('"../src/styles/global.css"'),
        'preview.ts missing global.css import',
      ).toBe(true)
    })

    test('[P0] 1.4-INT-003 — .storybook/main.ts includes Tailwind vite plugin and virtual module stubs', async () => {
      const mainPath = path.join(ASTRO_APP, '.storybook/main.ts')
      const content = fs.readFileSync(mainPath, 'utf-8')

      expect(
        content.includes('tailwindcss()'),
        'main.ts missing tailwindcss() vite plugin',
      ).toBe(true)

      expect(
        content.includes('astroVirtualModuleStubs()'),
        'main.ts missing astroVirtualModuleStubs()',
      ).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // AC5: Block Stories
  // ---------------------------------------------------------------------------
  test.describe('AC5: Block Stories', () => {
    test('[P0] 1.4-INT-004 — All 13 block story files exist', async () => {
      const blocksDir = path.join(ASTRO_APP, 'src/components/blocks/custom')

      for (const storyFile of BLOCK_STORY_FILES) {
        const filePath = path.join(blocksDir, storyFile)
        expect(
          fs.existsSync(filePath),
          `Missing block story file: ${storyFile}`,
        ).toBe(true)
      }
    })

    test('[P1] 1.4-INT-005 — Each block story exports meta with title/component and at least one named story', async () => {
      const blocksDir = path.join(ASTRO_APP, 'src/components/blocks/custom')

      for (const storyFile of BLOCK_STORY_FILES) {
        const filePath = path.join(blocksDir, storyFile)
        const content = fs.readFileSync(filePath, 'utf-8')

        const hasDefaultExport = /export\s+default\b/.test(content)
        expect(hasDefaultExport, `${storyFile} missing default export`).toBe(true)

        expect(
          content.includes('title:') || content.includes('title :'),
          `${storyFile} meta missing title field`,
        ).toBe(true)

        expect(
          content.includes('component:') || content.includes('component :'),
          `${storyFile} meta missing component field`,
        ).toBe(true)

        const hasNamedExport = /export\s+const\s+\w+/.test(content)
        expect(hasNamedExport, `${storyFile} missing named story export`).toBe(true)
      }
    })
  })

  // ---------------------------------------------------------------------------
  // AC4: UI Stories
  // ---------------------------------------------------------------------------
  test.describe('AC4: UI Stories', () => {
    test('[P1] 1.4-INT-006 — Original 4 UI story files exist', async () => {
      const uiDir = path.join(ASTRO_APP, 'src/components/ui')
      const expectedStories = [
        'button/button.stories.ts',
        'badge/badge.stories.ts',
        'avatar/avatar.stories.ts',
        'accordion/accordion.stories.ts',
      ]

      for (const storyPath of expectedStories) {
        const filePath = path.join(uiDir, storyPath)
        expect(
          fs.existsSync(filePath),
          `Missing UI story file: ${storyPath}`,
        ).toBe(true)
      }
    })

    test('[P1] 1.4-INT-007 — Slot-based UI components have *Story.astro wrapper files', async () => {
      const uiDir = path.join(ASTRO_APP, 'src/components/ui')
      const expectedWrappers = [
        'button/ButtonStory.astro',
        'badge/BadgeStory.astro',
        'avatar/AvatarStory.astro',
        'accordion/AccordionStory.astro',
      ]

      for (const wrapperPath of expectedWrappers) {
        const filePath = path.join(uiDir, wrapperPath)
        expect(
          fs.existsSync(filePath),
          `Missing Story wrapper: ${wrapperPath}`,
        ).toBe(true)
      }
    })
  })

  // ---------------------------------------------------------------------------
  // AC6,7: npm Scripts
  // ---------------------------------------------------------------------------
  test.describe('AC6,7: npm Scripts', () => {
    test('[P0] 1.4-INT-008 — astro-app/package.json has storybook and build-storybook scripts', async () => {
      const pkgPath = path.join(ASTRO_APP, 'package.json')
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))

      expect(pkg.scripts).toBeDefined()
      expect(
        pkg.scripts.storybook,
        'Missing storybook script in astro-app/package.json',
      ).toBeDefined()
      expect(
        pkg.scripts['build-storybook'],
        'Missing build-storybook script in astro-app/package.json',
      ).toBeDefined()
    })

    test('[P1] 1.4-INT-009 — Root package.json has storybook script', async () => {
      const rootPkgPath = path.resolve(ASTRO_APP, '../package.json')
      const pkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf-8'))

      expect(pkg.scripts).toBeDefined()
      expect(
        pkg.scripts.storybook,
        'Missing storybook script in root package.json',
      ).toBeDefined()
    })
  })

  // ---------------------------------------------------------------------------
  // AC1: Dependencies
  // ---------------------------------------------------------------------------
  test.describe('AC1: Dependencies', () => {
    test('[P0] 1.4-INT-010 — Storybook devDependencies installed', async () => {
      const pkgPath = path.join(ASTRO_APP, 'package.json')
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))

      const requiredDeps = [
        'storybook',
        'storybook-astro',
        '@storybook/addon-docs',
        '@storybook/builder-vite',
      ]

      for (const dep of requiredDeps) {
        expect(
          pkg.devDependencies?.[dep],
          `Missing devDependency: ${dep}`,
        ).toBeDefined()
      }
    })
  })

  // ---------------------------------------------------------------------------
  // AC8: Build Verification
  // ---------------------------------------------------------------------------
  test.describe('AC8: Build Verification', () => {
    test('[P0] 1.4-INT-011 — storybook build succeeds without errors', async () => {
      let result: string

      try {
        result = execSync('npm run build-storybook', {
          cwd: ASTRO_APP,
          encoding: 'utf-8',
          timeout: BUILD_TIMEOUT_MS,
          env: {
            ...process.env,
            CI: 'true',
          },
        })
      } catch (error: any) {
        const stderr = error.stderr || ''
        const stdout = error.stdout || ''
        throw new Error(
          `Storybook build failed.\nSTDERR: ${stderr}\nSTDOUT: ${stdout}`,
        )
      }

      expect(result).toBeDefined()
    })
  })
})
