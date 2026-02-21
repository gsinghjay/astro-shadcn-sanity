/**
 * Story 7-12: Schema Validation, Preview & Resolver Polish
 *
 * Tests defineBlock preview, array validations, conditional validations,
 * document field validations, document previews, Presentation Tool resolvers,
 * internalLink expansion, fieldset assignments, and list option standardization.
 *
 * @story 7-12
 * @phase GREEN
 */
import { describe, test, expect } from 'vitest'

// Helpers
import { defineBlock } from '../../../studio/src/schemaTypes/helpers/defineBlock'

// Block schemas
import { featureGrid } from '../../../studio/src/schemaTypes/blocks/feature-grid'
import { statsRow } from '../../../studio/src/schemaTypes/blocks/stats-row'
import { sponsorSteps } from '../../../studio/src/schemaTypes/blocks/sponsor-steps'
import { faqSection } from '../../../studio/src/schemaTypes/blocks/faq-section'
import { ctaBanner } from '../../../studio/src/schemaTypes/blocks/cta-banner'
import { logoCloud } from '../../../studio/src/schemaTypes/blocks/logo-cloud'
import { sponsorCards } from '../../../studio/src/schemaTypes/blocks/sponsor-cards'
import { testimonials } from '../../../studio/src/schemaTypes/blocks/testimonials'
import { heroBanner } from '../../../studio/src/schemaTypes/blocks/hero-banner'
import { textWithImage } from '../../../studio/src/schemaTypes/blocks/text-with-image'
import { richText } from '../../../studio/src/schemaTypes/blocks/rich-text'

// Document schemas
import { siteSettings } from '../../../studio/src/schemaTypes/documents/site-settings'
import { submission } from '../../../studio/src/schemaTypes/documents/submission'
import { project } from '../../../studio/src/schemaTypes/documents/project'
import { sponsor } from '../../../studio/src/schemaTypes/documents/sponsor'
import { page } from '../../../studio/src/schemaTypes/documents/page'
import { testimonial } from '../../../studio/src/schemaTypes/documents/testimonial'

// Objects
import { portableText } from '../../../studio/src/schemaTypes/objects/portable-text'
import { blockBaseFields } from '../../../studio/src/schemaTypes/objects/block-base'
import { button } from '../../../studio/src/schemaTypes/objects/button'

// Presentation
import { resolve } from '../../../studio/src/presentation/resolve'

// Helper to get fields from a schema
function getFields(schema: any): any[] {
  return schema.fields || []
}

function getField(schema: any, name: string): any {
  return getFields(schema).find((f: any) => f.name === name)
}

describe('Story 7-12: Schema Validation, Preview & Resolver Polish', () => {
  // ---------------------------------------------------------------------------
  // AC1: defineBlock preview helper
  // ---------------------------------------------------------------------------
  describe('AC1: defineBlock preview helper', () => {
    test('7.12-INT-001 — defineBlock generates preview with prepare function', () => {
      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        fields: [],
      })
      expect((result as any).preview).toBeDefined()
      expect((result as any).preview.select).toBeDefined()
      expect((result as any).preview.prepare).toBeDefined()
      expect(typeof (result as any).preview.prepare).toBe('function')
    })

    test('7.12-INT-002 — preview prepare returns heading as title', () => {
      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        fields: [],
      })
      const prepared = (result as any).preview.prepare({ heading: 'My Heading' })
      expect(prepared.title).toBe('My Heading')
      expect(prepared.subtitle).toBe('Test Block')
    })

    test('7.12-INT-003 — preview prepare falls back to config.title when no heading', () => {
      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        fields: [],
      })
      const prepared = (result as any).preview.prepare({ heading: undefined })
      expect(prepared.title).toBe('Test Block')
      expect(prepared.subtitle).toBe('Test Block')
    })

    test('7.12-INT-004 — preview prepare includes icon as media', () => {
      const MockIcon = () => null
      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        icon: MockIcon,
        fields: [],
      })
      const prepared = (result as any).preview.prepare({ heading: 'Test' })
      expect(prepared.media).toBe(MockIcon)
    })

    test('7.12-INT-005 — preview merges custom select fields', () => {
      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        preview: { select: { title: 'heading' } },
        fields: [],
      })
      expect((result as any).preview.select.heading).toBe('heading')
      expect((result as any).preview.select.title).toBe('heading')
    })

    test('7.12-INT-006 — richText block gets preview via defineBlock', () => {
      // richText previously had no preview at all
      expect((richText as any).preview).toBeDefined()
      expect((richText as any).preview.prepare).toBeDefined()
      // Verify it shows "Rich Text" as subtitle since it has no heading field
      const prepared = (richText as any).preview.prepare({ heading: undefined })
      expect(prepared.title).toBe('Rich Text')
      expect(prepared.subtitle).toBe('Rich Text')
    })
  })

  // ---------------------------------------------------------------------------
  // AC2: Array min-length validations
  // ---------------------------------------------------------------------------
  describe('AC2: Array min-length validations', () => {
    test('7.12-INT-007 — featureGrid.items has validation', () => {
      const items = getField(featureGrid, 'items')
      expect(items.validation).toBeDefined()
    })

    test('7.12-INT-008 — statsRow.stats has validation', () => {
      const stats = getField(statsRow, 'stats')
      expect(stats.validation).toBeDefined()
    })

    test('7.12-INT-009 — sponsorSteps.items has validation', () => {
      const items = getField(sponsorSteps, 'items')
      expect(items.validation).toBeDefined()
    })

    test('7.12-INT-010 — faqSection.items has validation', () => {
      const items = getField(faqSection, 'items')
      expect(items.validation).toBeDefined()
    })

    test('7.12-INT-011 — ctaBanner.ctaButtons has validation', () => {
      const ctaButtons = getField(ctaBanner, 'ctaButtons')
      expect(ctaButtons.validation).toBeDefined()
    })
  })

  // ---------------------------------------------------------------------------
  // AC3: Conditional manual-mode validations
  // ---------------------------------------------------------------------------
  describe('AC3: Conditional manual-mode validations', () => {
    test('7.12-INT-012 — logoCloud.sponsors has custom validation', () => {
      const sponsors = getField(logoCloud, 'sponsors')
      expect(sponsors.validation).toBeDefined()
    })

    test('7.12-INT-013 — sponsorCards.sponsors has custom validation', () => {
      const sponsors = getField(sponsorCards, 'sponsors')
      expect(sponsors.validation).toBeDefined()
    })

    test('7.12-INT-014 — testimonials.testimonials has custom validation', () => {
      const testimonialsField = getField(testimonials, 'testimonials')
      expect(testimonialsField.validation).toBeDefined()
    })
  })

  // ---------------------------------------------------------------------------
  // AC4: Document field validations
  // ---------------------------------------------------------------------------
  describe('AC4: Document field validations', () => {
    test('7.12-INT-015 — siteSettings socialLinks.platform has validation', () => {
      const socialLinks = getField(siteSettings, 'socialLinks')
      const socialItem = (socialLinks as any).of[0]
      const platform = socialItem.fields.find((f: any) => f.name === 'platform')
      expect(platform.validation).toBeDefined()
    })

    test('7.12-INT-016 — siteSettings contactInfo.email has validation', () => {
      const contactInfo = getField(siteSettings, 'contactInfo')
      const email = contactInfo.fields.find((f: any) => f.name === 'email')
      expect(email.validation).toBeDefined()
    })

    test('7.12-INT-017 — submission.submittedAt has required validation', () => {
      const submittedAt = getField(submission, 'submittedAt')
      expect(submittedAt.validation).toBeDefined()
    })

    test('7.12-INT-018 — project.status has required validation', () => {
      const status = getField(project, 'status')
      expect(status.validation).toBeDefined()
    })
  })

  // ---------------------------------------------------------------------------
  // AC5: Document preview configs
  // ---------------------------------------------------------------------------
  describe('AC5: Document preview configs', () => {
    test('7.12-INT-019 — sponsor has preview with name, tier, logo', () => {
      expect((sponsor as any).preview).toBeDefined()
      expect((sponsor as any).preview.select.title).toBe('name')
      expect((sponsor as any).preview.select.subtitle).toBe('tier')
      expect((sponsor as any).preview.select.media).toBe('logo')
    })

    test('7.12-INT-020 — page has preview with title, slug', () => {
      expect((page as any).preview).toBeDefined()
      expect((page as any).preview.select.title).toBe('title')
      expect((page as any).preview.select.subtitle).toBe('slug.current')
    })

    test('7.12-INT-021 — testimonial preview includes media: photo', () => {
      expect((testimonial as any).preview).toBeDefined()
      expect((testimonial as any).preview.select.media).toBe('photo')
    })
  })

  // ---------------------------------------------------------------------------
  // AC6: Presentation Tool resolvers
  // ---------------------------------------------------------------------------
  describe('AC6: Presentation Tool resolvers', () => {
    test('7.12-INT-022 — resolve.locations is defined', () => {
      expect(resolve).toBeDefined()
      expect(resolve.locations).toBeDefined()
    })
  })

  // ---------------------------------------------------------------------------
  // AC7: Expand internalLink references
  // ---------------------------------------------------------------------------
  describe('AC7: Expand internalLink Portable Text references', () => {
    test('7.12-INT-023 — internalLink references page, sponsor, project, event', () => {
      const blockMember = (portableText as any).of.find((m: any) => m.type === 'block')
      const internalLink = blockMember.marks.annotations.find((a: any) => a.name === 'internalLink')
      const refField = internalLink.fields.find((f: any) => f.name === 'reference')
      const refTypes = refField.to.map((t: any) => t.type)

      expect(refTypes).toContain('page')
      expect(refTypes).toContain('sponsor')
      expect(refTypes).toContain('project')
      expect(refTypes).toContain('event')
      expect(refTypes).toHaveLength(4)
    })
  })

  // ---------------------------------------------------------------------------
  // AC8: Move presentation fields to layout fieldset
  // ---------------------------------------------------------------------------
  describe('AC8: Layout fieldset for presentation fields', () => {
    test('7.12-INT-024 — heroBanner.alignment in layout fieldset', () => {
      const alignment = getField(heroBanner, 'alignment')
      expect(alignment.fieldset).toBe('layout')
    })

    test('7.12-INT-025 — featureGrid.columns in layout fieldset', () => {
      const columns = getField(featureGrid, 'columns')
      expect(columns.fieldset).toBe('layout')
    })

    test('7.12-INT-026 — textWithImage.imagePosition in layout fieldset', () => {
      const imagePosition = getField(textWithImage, 'imagePosition')
      expect(imagePosition.fieldset).toBe('layout')
    })
  })

  // ---------------------------------------------------------------------------
  // AC9: Standardize list options to {title, value} format
  // ---------------------------------------------------------------------------
  describe('AC9: Standardized list options', () => {
    test('7.12-INT-027 — sponsor.tier uses {title, value} objects', () => {
      const tier = getField(sponsor, 'tier')
      const list = tier.options.list
      expect(list[0]).toEqual({ title: 'Platinum', value: 'platinum' })
      expect(list.every((item: any) => typeof item === 'object' && 'title' in item && 'value' in item)).toBe(true)
    })

    test('7.12-INT-028 — block-base backgroundVariant uses {title, value} objects', () => {
      const bgField = blockBaseFields.find((f: any) => f.name === 'backgroundVariant')
      const list = (bgField as any).options.list
      expect(list[0]).toEqual({ title: 'White', value: 'white' })
      expect(list.every((item: any) => typeof item === 'object' && 'title' in item && 'value' in item)).toBe(true)
    })

    test('7.12-INT-029 — block-base spacing uses {title, value} objects', () => {
      const spacingField = blockBaseFields.find((f: any) => f.name === 'spacing')
      const list = (spacingField as any).options.list
      expect(list[0]).toEqual({ title: 'None', value: 'none' })
      expect(list.every((item: any) => typeof item === 'object' && 'title' in item && 'value' in item)).toBe(true)
    })

    test('7.12-INT-030 — block-base maxWidth uses {title, value} objects', () => {
      const maxWidthField = blockBaseFields.find((f: any) => f.name === 'maxWidth')
      const list = (maxWidthField as any).options.list
      expect(list[0]).toEqual({ title: 'Narrow', value: 'narrow' })
      expect(list.every((item: any) => typeof item === 'object' && 'title' in item && 'value' in item)).toBe(true)
    })

    test('7.12-INT-031 — button.variant uses {title, value} objects', () => {
      const variant = getField(button, 'variant')
      const list = variant.options.list
      expect(list[0]).toEqual({ title: 'Default', value: 'default' })
      expect(list.every((item: any) => typeof item === 'object' && 'title' in item && 'value' in item)).toBe(true)
    })

    test('7.12-INT-032 — sponsorCards.displayMode uses {title, value} objects', () => {
      const displayMode = getField(sponsorCards, 'displayMode')
      const list = displayMode.options.list
      expect(list[0]).toEqual({ title: 'All', value: 'all' })
      expect(list.every((item: any) => typeof item === 'object' && 'title' in item && 'value' in item)).toBe(true)
    })
  })
})
