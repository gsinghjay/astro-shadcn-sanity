/**
 * Story 1-3: Schema Infrastructure — ATDD Integration Tests (RED PHASE)
 *
 * These tests validate the Sanity schema infrastructure defined in Story 1-3.
 * All tests use test.skip() because the schema files do not exist yet (TDD red phase).
 *
 * To enter GREEN phase:
 * 1. Implement the schema files per Story 1-3 acceptance criteria
 * 2. Remove test.skip() from each test
 * 3. Run: npx playwright test tests/integration/schema-infrastructure.spec.ts
 * 4. All tests should pass
 *
 * @story 1-3
 * @phase RED
 */
import { test, expect } from '@playwright/test'
import { execSync } from 'child_process'
import * as path from 'path'

const STUDIO_ROOT = path.resolve(__dirname, '../../studio')

test.describe('Story 1-3: Schema Infrastructure (ATDD)', () => {
  // ---------------------------------------------------------------------------
  // AC1: defineBlock helper
  // ---------------------------------------------------------------------------
  test.describe('AC1: defineBlock Helper', () => {
    test.skip('[P0] 1.3-INT-001 — defineBlock exports a function', async () => {
      const mod = await import('../../studio/src/schemaTypes/helpers/defineBlock')
      expect(typeof mod.defineBlock).toBe('function')
    })

    test.skip('[P0] 1.3-INT-002 — defineBlock merges base fields into block schema', async () => {
      const { defineBlock } = await import('../../studio/src/schemaTypes/helpers/defineBlock')

      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        fields: [],
      })

      expect(result.name).toBe('testBlock')
      expect(result.type).toBe('object')

      const fieldNames = (result as any).fields.map((f: any) => f.name)
      expect(fieldNames).toContain('backgroundVariant')
      expect(fieldNames).toContain('spacing')
      expect(fieldNames).toContain('maxWidth')
    })

    test.skip('[P0] 1.3-INT-003 — defineBlock places base fields before block-specific fields', async () => {
      const { defineBlock } = await import('../../studio/src/schemaTypes/helpers/defineBlock')
      const { defineField } = await import('sanity')

      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        fields: [
          defineField({ name: 'heading', title: 'Heading', type: 'string' }),
        ],
      })

      const fieldNames = (result as any).fields.map((f: any) => f.name)
      expect(fieldNames).toContain('heading')

      // Base fields come first, then block-specific
      const headingIdx = fieldNames.indexOf('heading')
      const bgIdx = fieldNames.indexOf('backgroundVariant')
      expect(headingIdx).toBeGreaterThan(bgIdx)
    })
  })

  // ---------------------------------------------------------------------------
  // AC2: block-base shared fields
  // ---------------------------------------------------------------------------
  test.describe('AC2: Block Base Fields', () => {
    test.skip('[P0] 1.3-INT-004 — blockBaseFields contains backgroundVariant with constrained presets', async () => {
      const { blockBaseFields } = await import('../../studio/src/schemaTypes/objects/block-base')

      const bgField = blockBaseFields.find((f: any) => f.name === 'backgroundVariant')
      expect(bgField).toBeDefined()
      expect(bgField!.type).toBe('string')

      const options = (bgField as any).options?.list
      expect(options).toEqual(expect.arrayContaining(['white', 'light', 'dark', 'primary']))
      expect(options).toHaveLength(4)
    })

    test.skip('[P0] 1.3-INT-005 — blockBaseFields contains spacing with constrained presets', async () => {
      const { blockBaseFields } = await import('../../studio/src/schemaTypes/objects/block-base')

      const spacingField = blockBaseFields.find((f: any) => f.name === 'spacing')
      expect(spacingField).toBeDefined()
      expect(spacingField!.type).toBe('string')

      const options = (spacingField as any).options?.list
      expect(options).toEqual(expect.arrayContaining(['none', 'small', 'default', 'large']))
      expect(options).toHaveLength(4)
    })

    test.skip('[P0] 1.3-INT-006 — blockBaseFields contains maxWidth with constrained presets', async () => {
      const { blockBaseFields } = await import('../../studio/src/schemaTypes/objects/block-base')

      const maxWidthField = blockBaseFields.find((f: any) => f.name === 'maxWidth')
      expect(maxWidthField).toBeDefined()
      expect(maxWidthField!.type).toBe('string')

      const options = (maxWidthField as any).options?.list
      expect(options).toEqual(expect.arrayContaining(['narrow', 'default', 'full']))
      expect(options).toHaveLength(3)
    })
  })

  // ---------------------------------------------------------------------------
  // AC3: SEO object schema
  // ---------------------------------------------------------------------------
  test.describe('AC3: SEO Object Schema', () => {
    test.skip('[P1] 1.3-INT-007 — seo schema has metaTitle, metaDescription, ogImage fields', async () => {
      const { seo } = await import('../../studio/src/schemaTypes/objects/seo')

      expect(seo.name).toBe('seo')
      expect(seo.type).toBe('object')

      const fieldNames = (seo as any).fields.map((f: any) => f.name)
      expect(fieldNames).toContain('metaTitle')
      expect(fieldNames).toContain('metaDescription')
      expect(fieldNames).toContain('ogImage')
    })

    test.skip('[P1] 1.3-INT-008 — seo metaTitle has max length validation', async () => {
      const { seo } = await import('../../studio/src/schemaTypes/objects/seo')

      const metaTitle = (seo as any).fields.find((f: any) => f.name === 'metaTitle')
      expect(metaTitle).toBeDefined()
      expect(metaTitle.type).toBe('string')
      expect(metaTitle.validation).toBeDefined()
    })

    test.skip('[P1] 1.3-INT-009 — seo metaDescription is text type with max length validation', async () => {
      const { seo } = await import('../../studio/src/schemaTypes/objects/seo')

      const metaDesc = (seo as any).fields.find((f: any) => f.name === 'metaDescription')
      expect(metaDesc).toBeDefined()
      expect(metaDesc.type).toBe('text')
      expect(metaDesc.validation).toBeDefined()
    })

    test.skip('[P1] 1.3-INT-010 — seo ogImage has alt text field', async () => {
      const { seo } = await import('../../studio/src/schemaTypes/objects/seo')

      const ogImage = (seo as any).fields.find((f: any) => f.name === 'ogImage')
      expect(ogImage).toBeDefined()
      expect(ogImage.type).toBe('image')

      const altField = ogImage.fields?.find((f: any) => f.name === 'alt')
      expect(altField).toBeDefined()
      expect(altField.type).toBe('string')
    })
  })

  // ---------------------------------------------------------------------------
  // AC4: Button object schema
  // ---------------------------------------------------------------------------
  test.describe('AC4: Button Object Schema', () => {
    test.skip('[P1] 1.3-INT-011 — button schema has text, url, variant fields', async () => {
      const { button } = await import('../../studio/src/schemaTypes/objects/button')

      expect(button.name).toBe('button')
      expect(button.type).toBe('object')

      const fieldNames = (button as any).fields.map((f: any) => f.name)
      expect(fieldNames).toContain('text')
      expect(fieldNames).toContain('url')
      expect(fieldNames).toContain('variant')
    })

    test.skip('[P1] 1.3-INT-012 — button text is required string', async () => {
      const { button } = await import('../../studio/src/schemaTypes/objects/button')

      const textField = (button as any).fields.find((f: any) => f.name === 'text')
      expect(textField).toBeDefined()
      expect(textField.type).toBe('string')
      expect(textField.validation).toBeDefined()
    })

    test.skip('[P1] 1.3-INT-013 — button url is required url type', async () => {
      const { button } = await import('../../studio/src/schemaTypes/objects/button')

      const urlField = (button as any).fields.find((f: any) => f.name === 'url')
      expect(urlField).toBeDefined()
      expect(urlField.type).toBe('url')
      expect(urlField.validation).toBeDefined()
    })

    test.skip('[P1] 1.3-INT-014 — button variant has constrained options', async () => {
      const { button } = await import('../../studio/src/schemaTypes/objects/button')

      const variantField = (button as any).fields.find((f: any) => f.name === 'variant')
      expect(variantField).toBeDefined()
      expect(variantField.type).toBe('string')

      const options = variantField.options?.list
      expect(options).toEqual(
        expect.arrayContaining(['default', 'secondary', 'outline', 'ghost']),
      )
    })
  })

  // ---------------------------------------------------------------------------
  // AC5: Portable Text schema
  // ---------------------------------------------------------------------------
  test.describe('AC5: Portable Text Schema', () => {
    test.skip('[P1] 1.3-INT-015 — portableText is array type with block, image, callout members', async () => {
      const { portableText } = await import('../../studio/src/schemaTypes/objects/portable-text')

      expect(portableText.name).toBe('portableText')
      expect(portableText.type).toBe('array')

      const members = (portableText as any).of
      const memberTypes = members.map((m: any) => m.type || m.name)
      expect(memberTypes).toContain('block')
      expect(memberTypes).toContain('image')

      // Callout is a named object type within the array
      const hasCallout = members.some((m: any) => m.name === 'callout' || m.type === 'callout')
      expect(hasCallout).toBe(true)
    })

    test.skip('[P1] 1.3-INT-016 — portableText block has expected styles', async () => {
      const { portableText } = await import('../../studio/src/schemaTypes/objects/portable-text')

      const blockMember = (portableText as any).of.find((m: any) => m.type === 'block')
      expect(blockMember).toBeDefined()

      const styleValues = blockMember.styles.map((s: any) => s.value)
      expect(styleValues).toContain('normal')
      expect(styleValues).toContain('h2')
      expect(styleValues).toContain('h3')
      expect(styleValues).toContain('h4')
      expect(styleValues).toContain('blockquote')
    })

    test.skip('[P1] 1.3-INT-017 — portableText block has strong, em, code, underline decorators', async () => {
      const { portableText } = await import('../../studio/src/schemaTypes/objects/portable-text')

      const blockMember = (portableText as any).of.find((m: any) => m.type === 'block')
      const decorators = blockMember.marks.decorators.map((d: any) => d.value)
      expect(decorators).toContain('strong')
      expect(decorators).toContain('em')
      expect(decorators).toContain('code')
      expect(decorators).toContain('underline')
    })

    test.skip('[P1] 1.3-INT-018 — portableText block has link and internalLink annotations', async () => {
      const { portableText } = await import('../../studio/src/schemaTypes/objects/portable-text')

      const blockMember = (portableText as any).of.find((m: any) => m.type === 'block')
      const annotationNames = blockMember.marks.annotations.map((a: any) => a.name)
      expect(annotationNames).toContain('link')
      expect(annotationNames).toContain('internalLink')
    })

    test.skip('[P1] 1.3-INT-019 — portableText image member has required alt text (NFR16)', async () => {
      const { portableText } = await import('../../studio/src/schemaTypes/objects/portable-text')

      const imageMember = (portableText as any).of.find((m: any) => m.type === 'image')
      expect(imageMember).toBeDefined()

      const altField = imageMember.fields?.find((f: any) => f.name === 'alt')
      expect(altField).toBeDefined()
      expect(altField.validation).toBeDefined()
    })
  })

  // ---------------------------------------------------------------------------
  // AC6: Page document schema
  // ---------------------------------------------------------------------------
  test.describe('AC6: Page Document Schema', () => {
    test.skip('[P0] 1.3-INT-020 — page schema has title, slug, seo, blocks fields', async () => {
      const { page: pageSchema } = await import('../../studio/src/schemaTypes/documents/page')

      expect(pageSchema.name).toBe('page')
      expect(pageSchema.type).toBe('document')

      const fieldNames = (pageSchema as any).fields.map((f: any) => f.name)
      expect(fieldNames).toContain('title')
      expect(fieldNames).toContain('slug')
      expect(fieldNames).toContain('seo')
      expect(fieldNames).toContain('blocks')
    })

    test.skip('[P0] 1.3-INT-021 — page blocks array accepts all 12 P0 block types', async () => {
      const { page: pageSchema } = await import('../../studio/src/schemaTypes/documents/page')

      const blocksField = (pageSchema as any).fields.find((f: any) => f.name === 'blocks')
      expect(blocksField).toBeDefined()
      expect(blocksField.type).toBe('array')

      const blockTypeNames = blocksField.of.map((b: any) => b.type)
      const expectedTypes = [
        'heroBanner', 'featureGrid', 'sponsorCards', 'richText',
        'ctaBanner', 'faqSection', 'contactForm', 'timeline',
        'logoCloud', 'statsRow', 'teamGrid', 'textWithImage',
      ]

      for (const type of expectedTypes) {
        expect(blockTypeNames, `Missing block type: ${type}`).toContain(type)
      }
      expect(blockTypeNames).toHaveLength(12)
    })

    test.skip('[P0] 1.3-INT-022 — page title is required string', async () => {
      const { page: pageSchema } = await import('../../studio/src/schemaTypes/documents/page')

      const titleField = (pageSchema as any).fields.find((f: any) => f.name === 'title')
      expect(titleField).toBeDefined()
      expect(titleField.type).toBe('string')
      expect(titleField.validation).toBeDefined()
    })

    test.skip('[P0] 1.3-INT-023 — page slug is required and sourced from title', async () => {
      const { page: pageSchema } = await import('../../studio/src/schemaTypes/documents/page')

      const slugField = (pageSchema as any).fields.find((f: any) => f.name === 'slug')
      expect(slugField).toBeDefined()
      expect(slugField.type).toBe('slug')
      expect(slugField.options?.source).toBe('title')
      expect(slugField.validation).toBeDefined()
    })
  })

  // ---------------------------------------------------------------------------
  // AC7: Site Settings document schema
  // ---------------------------------------------------------------------------
  test.describe('AC7: Site Settings Document Schema', () => {
    test.skip('[P0] 1.3-INT-024 — siteSettings schema has all required fields', async () => {
      const { siteSettings } = await import('../../studio/src/schemaTypes/documents/site-settings')

      expect(siteSettings.name).toBe('siteSettings')
      expect(siteSettings.type).toBe('document')

      const fieldNames = (siteSettings as any).fields.map((f: any) => f.name)
      expect(fieldNames).toContain('siteName')
      expect(fieldNames).toContain('logo')
      expect(fieldNames).toContain('navigationItems')
      expect(fieldNames).toContain('footerContent')
      expect(fieldNames).toContain('socialLinks')
      expect(fieldNames).toContain('currentSemester')
    })

    test.skip('[P0] 1.3-INT-025 — siteSettings siteName is required', async () => {
      const { siteSettings } = await import('../../studio/src/schemaTypes/documents/site-settings')

      const siteNameField = (siteSettings as any).fields.find((f: any) => f.name === 'siteName')
      expect(siteNameField).toBeDefined()
      expect(siteNameField.type).toBe('string')
      expect(siteNameField.validation).toBeDefined()
    })

    test.skip('[P0] 1.3-INT-026 — siteSettings logo has alt text field', async () => {
      const { siteSettings } = await import('../../studio/src/schemaTypes/documents/site-settings')

      const logoField = (siteSettings as any).fields.find((f: any) => f.name === 'logo')
      expect(logoField).toBeDefined()
      expect(logoField.type).toBe('image')

      const altField = logoField.fields?.find((f: any) => f.name === 'alt')
      expect(altField).toBeDefined()
    })

    test.skip('[P1] 1.3-INT-027 — siteSettings navigationItems supports one level of nesting', async () => {
      const { siteSettings } = await import('../../studio/src/schemaTypes/documents/site-settings')

      const navField = (siteSettings as any).fields.find((f: any) => f.name === 'navigationItems')
      expect(navField).toBeDefined()
      expect(navField.type).toBe('array')

      // Each nav item should have label, href, and optional children
      const navItemFields = navField.of?.[0]?.fields
      expect(navItemFields).toBeDefined()

      const navItemFieldNames = navItemFields.map((f: any) => f.name)
      expect(navItemFieldNames).toContain('label')
      expect(navItemFieldNames).toContain('href')
      expect(navItemFieldNames).toContain('children')
    })

    test.skip('[P1] 1.3-INT-028 — siteSettings socialLinks has platform options', async () => {
      const { siteSettings } = await import('../../studio/src/schemaTypes/documents/site-settings')

      const socialField = (siteSettings as any).fields.find((f: any) => f.name === 'socialLinks')
      expect(socialField).toBeDefined()
      expect(socialField.type).toBe('array')

      // Each social link should have platform and url
      const socialItemFields = socialField.of?.[0]?.fields
      expect(socialItemFields).toBeDefined()

      const platformField = socialItemFields.find((f: any) => f.name === 'platform')
      expect(platformField).toBeDefined()

      const platformOptions = platformField.options?.list
      expect(platformOptions).toEqual(
        expect.arrayContaining(['github', 'linkedin', 'twitter', 'instagram', 'youtube']),
      )
    })

    test.skip('[P1] 1.3-INT-029 — siteSettings currentSemester is a string field', async () => {
      const { siteSettings } = await import('../../studio/src/schemaTypes/documents/site-settings')

      const semesterField = (siteSettings as any).fields.find(
        (f: any) => f.name === 'currentSemester',
      )
      expect(semesterField).toBeDefined()
      expect(semesterField.type).toBe('string')
    })
  })

  // ---------------------------------------------------------------------------
  // AC8: Schema Registration
  // ---------------------------------------------------------------------------
  test.describe('AC8: Schema Registration', () => {
    test.skip('[P0] 1.3-INT-030 — schemaTypes array contains all registered schemas', async () => {
      const { schemaTypes } = await import('../../studio/src/schemaTypes/index')

      const typeNames = schemaTypes.map((s: any) => s.name)

      // Object schemas
      expect(typeNames).toContain('seo')
      expect(typeNames).toContain('button')
      expect(typeNames).toContain('portableText')

      // Document schemas
      expect(typeNames).toContain('page')
      expect(typeNames).toContain('siteSettings')

      // At minimum 5 schemas registered (objects + documents, no blocks yet)
      expect(schemaTypes.length).toBeGreaterThanOrEqual(5)
    })

    test.skip('[P0] 1.3-INT-031 — blockBaseFields is NOT registered as a standalone schema', async () => {
      const { schemaTypes } = await import('../../studio/src/schemaTypes/index')

      const typeNames = schemaTypes.map((s: any) => s.name)
      expect(typeNames).not.toContain('blockBase')
      expect(typeNames).not.toContain('block-base')
    })
  })

  // ---------------------------------------------------------------------------
  // AC9: Schema Quality (defineType/defineField usage)
  // ---------------------------------------------------------------------------
  test.describe('AC9: Schema Quality', () => {
    test.skip('[P1] 1.3-INT-032 — all schemas have a name property', async () => {
      const { schemaTypes } = await import('../../studio/src/schemaTypes/index')

      for (const schema of schemaTypes) {
        expect(schema, `Schema missing name`).toHaveProperty('name')
        expect(typeof (schema as any).name).toBe('string')
        expect((schema as any).name.length).toBeGreaterThan(0)
      }
    })

    test.skip('[P1] 1.3-INT-033 — all schemas have typed fields', async () => {
      const { schemaTypes } = await import('../../studio/src/schemaTypes/index')

      for (const schema of schemaTypes) {
        const s = schema as any
        if (s.fields) {
          for (const field of s.fields) {
            expect(field, `Field in ${s.name} missing name`).toHaveProperty('name')
            expect(field, `Field ${field.name} in ${s.name} missing type`).toHaveProperty('type')
          }
        }
      }
    })
  })

  // ---------------------------------------------------------------------------
  // AC10: Studio Build Verification
  // ---------------------------------------------------------------------------
  test.describe('AC10: Studio Build Verification', () => {
    test.skip('[P0] 1.3-INT-034 — studio builds without schema errors', async () => {
      // This test verifies that `sanity build` succeeds with the schema infrastructure.
      // It is the ultimate integration test: if schemas are malformed, this fails.
      const result = execSync('npm run build', {
        cwd: STUDIO_ROOT,
        encoding: 'utf-8',
        timeout: 120_000,
        env: {
          ...process.env,
          SANITY_STUDIO_PROJECT_ID:
            process.env.SANITY_STUDIO_PROJECT_ID || 'placeholder',
          SANITY_STUDIO_DATASET:
            process.env.SANITY_STUDIO_DATASET || 'production',
        },
      })

      // execSync throws on non-zero exit code, so reaching here means success
      expect(result).toBeDefined()
    })
  })
})
