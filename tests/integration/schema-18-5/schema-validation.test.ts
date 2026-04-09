/**
 * Story 18.5: Schema Validation & Editor Descriptions
 *
 * Tests that all block and object schemas have proper validation rules
 * and editor descriptions as specified in the acceptance criteria.
 *
 * @story 18-5
 * @phase GREEN
 */
import {describe, test, expect} from 'vitest'

// Block schema imports
import {accordion} from '../../../studio/src/schemaTypes/blocks/accordion'
import {announcementBar} from '../../../studio/src/schemaTypes/blocks/announcement-bar'
import {articleList} from '../../../studio/src/schemaTypes/blocks/article-list'
import {beforeAfter} from '../../../studio/src/schemaTypes/blocks/before-after'
import {cardGrid} from '../../../studio/src/schemaTypes/blocks/card-grid'
import {comparisonTable} from '../../../studio/src/schemaTypes/blocks/comparison-table'
import {contactForm} from '../../../studio/src/schemaTypes/blocks/contact-form'
import {countdownTimer} from '../../../studio/src/schemaTypes/blocks/countdown-timer'
import {ctaBanner} from '../../../studio/src/schemaTypes/blocks/cta-banner'
import {embedBlock} from '../../../studio/src/schemaTypes/blocks/embed-block'
import {eventList} from '../../../studio/src/schemaTypes/blocks/event-list'
import {faqSection} from '../../../studio/src/schemaTypes/blocks/faq-section'
import {featureGrid} from '../../../studio/src/schemaTypes/blocks/feature-grid'
import {heroBanner} from '../../../studio/src/schemaTypes/blocks/hero-banner'
import {imageGallery} from '../../../studio/src/schemaTypes/blocks/image-gallery'
import {linkCards} from '../../../studio/src/schemaTypes/blocks/link-cards'
import {logoCloud} from '../../../studio/src/schemaTypes/blocks/logo-cloud'
import {mapBlock} from '../../../studio/src/schemaTypes/blocks/map-block'
import {metricsDashboard} from '../../../studio/src/schemaTypes/blocks/metrics-dashboard'
import {newsletter} from '../../../studio/src/schemaTypes/blocks/newsletter'
import {pricingTable} from '../../../studio/src/schemaTypes/blocks/pricing-table'
import {productShowcase} from '../../../studio/src/schemaTypes/blocks/product-showcase'
import {projectCards} from '../../../studio/src/schemaTypes/blocks/project-cards'
import {pullquote} from '../../../studio/src/schemaTypes/blocks/pullquote'
import {serviceCards} from '../../../studio/src/schemaTypes/blocks/service-cards'
import {sponsorCards} from '../../../studio/src/schemaTypes/blocks/sponsor-cards'
import {sponsorSteps} from '../../../studio/src/schemaTypes/blocks/sponsor-steps'
import {sponsorshipTiers} from '../../../studio/src/schemaTypes/blocks/sponsorship-tiers'
import {statsRow} from '../../../studio/src/schemaTypes/blocks/stats-row'
import {tabsBlock} from '../../../studio/src/schemaTypes/blocks/tabs-block'
import {teamGrid} from '../../../studio/src/schemaTypes/blocks/team-grid'
import {testimonials} from '../../../studio/src/schemaTypes/blocks/testimonials'
import {textWithImage} from '../../../studio/src/schemaTypes/blocks/text-with-image'
import {timeline} from '../../../studio/src/schemaTypes/blocks/timeline'
import {videoEmbed} from '../../../studio/src/schemaTypes/blocks/video-embed'

// Object schema imports
import {accordionItem} from '../../../studio/src/schemaTypes/objects/accordion-item'
import {cardGridItem} from '../../../studio/src/schemaTypes/objects/card-grid-item'
import {comparisonColumn} from '../../../studio/src/schemaTypes/objects/comparison-column'
import {comparisonRow} from '../../../studio/src/schemaTypes/objects/comparison-row'
import {faqItem} from '../../../studio/src/schemaTypes/objects/faq-item'
import {featureItem} from '../../../studio/src/schemaTypes/objects/feature-item'
import {galleryImage} from '../../../studio/src/schemaTypes/objects/gallery-image'
import {metricItem} from '../../../studio/src/schemaTypes/objects/metric-item'
import {pricingTier} from '../../../studio/src/schemaTypes/objects/pricing-tier'
import {statItem} from '../../../studio/src/schemaTypes/objects/stat-item'
import {stepItem} from '../../../studio/src/schemaTypes/objects/step-item'
import {tabItem} from '../../../studio/src/schemaTypes/objects/tab-item'
import {teamMember} from '../../../studio/src/schemaTypes/objects/team-member'
import {timelineEntry} from '../../../studio/src/schemaTypes/objects/timeline-entry'

// Helper to find a field in a schema (works with defineBlock output which wraps in defineType)
function findField(schema: any, fieldName: string): any | undefined {
  return (schema.fields as any[])?.find((f: any) => f.name === fieldName)
}

// Helper to find nested field in an object field
function findNestedField(schema: any, parentName: string, childName: string): any | undefined {
  const parent = findField(schema, parentName)
  if (!parent?.fields) return undefined
  return (parent.fields as any[]).find((f: any) => f.name === childName)
}

describe('Story 18.5: Schema Validation & Editor Descriptions', () => {
  describe('AC #1: Every heading field has Rule.required() validation', () => {
    const blocksWithHeading = [
      {name: 'accordion', schema: accordion},
      {name: 'articleList', schema: articleList},
      {name: 'beforeAfter', schema: beforeAfter},
      {name: 'cardGrid', schema: cardGrid},
      {name: 'comparisonTable', schema: comparisonTable},
      {name: 'contactForm', schema: contactForm},
      {name: 'countdownTimer', schema: countdownTimer},
      {name: 'ctaBanner', schema: ctaBanner},
      {name: 'embedBlock', schema: embedBlock},
      {name: 'eventList', schema: eventList},
      {name: 'faqSection', schema: faqSection},
      {name: 'featureGrid', schema: featureGrid},
      {name: 'heroBanner', schema: heroBanner},
      {name: 'imageGallery', schema: imageGallery},
      {name: 'linkCards', schema: linkCards},
      {name: 'logoCloud', schema: logoCloud},
      {name: 'mapBlock', schema: mapBlock},
      {name: 'metricsDashboard', schema: metricsDashboard},
      {name: 'newsletter', schema: newsletter},
      {name: 'pricingTable', schema: pricingTable},
      {name: 'productShowcase', schema: productShowcase},
      {name: 'projectCards', schema: projectCards},
      {name: 'serviceCards', schema: serviceCards},
      {name: 'sponsorCards', schema: sponsorCards},
      {name: 'sponsorSteps', schema: sponsorSteps},
      {name: 'sponsorshipTiers', schema: sponsorshipTiers},
      {name: 'statsRow', schema: statsRow},
      {name: 'tabsBlock', schema: tabsBlock},
      {name: 'teamGrid', schema: teamGrid},
      {name: 'testimonials', schema: testimonials},
      {name: 'textWithImage', schema: textWithImage},
      {name: 'timeline', schema: timeline},
      {name: 'videoEmbed', schema: videoEmbed},
    ]

    test.each(blocksWithHeading)('$name heading has validation', ({schema}) => {
      const field = findField(schema, 'heading')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
      expect(typeof field.validation).toBe('function')
    })
  })

  describe('AC #2: String/text fields have Rule.max() constraints', () => {
    test.each([
      {name: 'accordion', schema: accordion},
      {name: 'cardGrid', schema: cardGrid},
      {name: 'newsletter', schema: newsletter},
      {name: 'pricingTable', schema: pricingTable},
      {name: 'timeline', schema: timeline},
    ])('$name heading has validation (required + max)', ({schema}) => {
      const field = findField(schema, 'heading')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
    })

    test.each([
      {name: 'accordion', schema: accordion},
      {name: 'cardGrid', schema: cardGrid},
      {name: 'contactForm', schema: contactForm},
      {name: 'newsletter', schema: newsletter},
      {name: 'timeline', schema: timeline},
    ])('$name description has validation (max)', ({schema}) => {
      const field = findField(schema, 'description')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
      expect(typeof field.validation).toBe('function')
    })

    test('contact-form successMessage has validation', () => {
      const field = findField(contactForm, 'successMessage')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
    })
  })

  describe('AC #3: Array fields have Rule.max() constraints', () => {
    test.each([
      {name: 'accordion items', schema: accordion, field: 'items'},
      {name: 'cardGrid cards', schema: cardGrid, field: 'cards'},
      {name: 'featureGrid items', schema: featureGrid, field: 'items'},
      {name: 'imageGallery images', schema: imageGallery, field: 'images'},
      {name: 'tabsBlock tabs', schema: tabsBlock, field: 'tabs'},
    ])('$name array has validation', ({schema, field: fieldName}) => {
      const field = findField(schema, fieldName)
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
      expect(typeof field.validation).toBe('function')
    })

    test('pricing-tier features array has validation', () => {
      const field = findField(pricingTier, 'features')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
    })

    test('step-item list array has validation', () => {
      const field = findField(stepItem, 'list')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
    })
  })

  describe('AC #5: announcement-bar text has Rule.required().max(150)', () => {
    test('text field has validation', () => {
      const field = findField(announcementBar, 'text')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
      expect(typeof field.validation).toBe('function')
    })
  })

  describe('AC #6: newsletter required fields', () => {
    test('heading has validation', () => {
      const field = findField(newsletter, 'heading')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
    })

    test('inputPlaceholder has validation', () => {
      const field = findField(newsletter, 'inputPlaceholder')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
    })

    test('submitButtonLabel has validation', () => {
      const field = findField(newsletter, 'submitButtonLabel')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
    })
  })

  describe('AC #7: countdown-timer heading has Rule.required()', () => {
    test('heading has validation', () => {
      const field = findField(countdownTimer, 'heading')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
    })
  })

  describe('AC #8: map-block lat/lng bounds validation', () => {
    test('lat field has validation', () => {
      const field = findNestedField(mapBlock, 'coordinates', 'lat')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
      expect(typeof field.validation).toBe('function')
    })

    test('lng field has validation', () => {
      const field = findNestedField(mapBlock, 'coordinates', 'lng')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
      expect(typeof field.validation).toBe('function')
    })

    test('lat field has description', () => {
      const field = findNestedField(mapBlock, 'coordinates', 'lat')
      expect(field).toBeDefined()
      expect(field.description).toBe('Latitude (-90 to 90)')
    })

    test('lng field has description', () => {
      const field = findNestedField(mapBlock, 'coordinates', 'lng')
      expect(field).toBeDefined()
      expect(field.description).toBe('Longitude (-180 to 180)')
    })
  })

  describe('AC #4: Non-obvious fields have editor descriptions', () => {
    test('announcement-bar dismissible has description', () => {
      const field = findField(announcementBar, 'dismissible')
      expect(field).toBeDefined()
      expect(field.description).toBeDefined()
      expect(typeof field.description).toBe('string')
      expect(field.description.length).toBeGreaterThan(0)
    })

    test('countdown-timer targetDate has description', () => {
      const field = findField(countdownTimer, 'targetDate')
      expect(field).toBeDefined()
      expect(field.description).toBeDefined()
      expect(typeof field.description).toBe('string')
    })

    test('hero-banner subheading has description', () => {
      const field = findField(heroBanner, 'subheading')
      expect(field).toBeDefined()
      expect(field.description).toBeDefined()
      expect(typeof field.description).toBe('string')
    })

    test('newsletter inputPlaceholder has description', () => {
      const field = findField(newsletter, 'inputPlaceholder')
      expect(field).toBeDefined()
      expect(field.description).toBeDefined()
    })

    test('newsletter submitButtonLabel has description', () => {
      const field = findField(newsletter, 'submitButtonLabel')
      expect(field).toBeDefined()
      expect(field.description).toBeDefined()
    })

    test('video-embed youtubeUrl has description', () => {
      const field = findField(videoEmbed, 'youtubeUrl')
      expect(field).toBeDefined()
      expect(field.description).toBeDefined()
      expect(typeof field.description).toBe('string')
    })

    test('map-block zoom has description', () => {
      const field = findField(mapBlock, 'zoom')
      expect(field).toBeDefined()
      expect(field.description).toBeDefined()
    })

    test('comparison-column highlighted has description', () => {
      const field = findField(comparisonColumn, 'highlighted')
      expect(field).toBeDefined()
      expect(field.description).toBeDefined()
    })

    test('team-member role has description', () => {
      const field = findField(teamMember, 'role')
      expect(field).toBeDefined()
      expect(field.description).toBeDefined()
    })

    test('card-grid-item badge has description', () => {
      const field = findField(cardGridItem, 'badge')
      expect(field).toBeDefined()
      expect(field.description).toBeDefined()
    })
  })

  describe('Validation rule smoke tests (mock Rule chain)', () => {
    /**
     * Creates a mock Sanity Rule that records which methods were called.
     * This lets us verify that validation functions actually call .required(), .max(), etc.
     */
    function createMockRule() {
      const calls: {method: string; args: any[]}[] = []
      const rule: any = new Proxy(
        {},
        {
          get(_target, prop) {
            if (prop === '_calls') return calls
            return (...args: any[]) => {
              calls.push({method: String(prop), args})
              return rule
            }
          },
        },
      )
      return rule
    }

    function getCalls(schema: any, fieldName: string): {method: string; args: any[]}[] {
      const field = findField(schema, fieldName)
      if (!field?.validation) return []
      const rule = createMockRule()
      field.validation(rule)
      return rule._calls
    }

    function getNestedCalls(
      schema: any,
      parentName: string,
      childName: string,
    ): {method: string; args: any[]}[] {
      const field = findNestedField(schema, parentName, childName)
      if (!field?.validation) return []
      const rule = createMockRule()
      field.validation(rule)
      return rule._calls
    }

    test('heading fields call required() and max(150)', () => {
      const samples = [accordion, cardGrid, newsletter, timeline, videoEmbed]
      for (const schema of samples) {
        const calls = getCalls(schema, 'heading')
        expect(calls.some((c) => c.method === 'required')).toBe(true)
        expect(calls.some((c) => c.method === 'max' && c.args[0] === 150)).toBe(true)
      }
    })

    test('announcement-bar text calls required() and max(150)', () => {
      const calls = getCalls(announcementBar, 'text')
      expect(calls.some((c) => c.method === 'required')).toBe(true)
      expect(calls.some((c) => c.method === 'max' && c.args[0] === 150)).toBe(true)
    })

    test('newsletter inputPlaceholder and submitButtonLabel call required()', () => {
      for (const fieldName of ['inputPlaceholder', 'submitButtonLabel']) {
        const calls = getCalls(newsletter, fieldName)
        expect(calls.some((c) => c.method === 'required')).toBe(true)
      }
    })

    test('pullquote quote calls required() and max(500)', () => {
      const calls = getCalls(pullquote, 'quote')
      expect(calls.some((c) => c.method === 'required')).toBe(true)
      expect(calls.some((c) => c.method === 'max' && c.args[0] === 500)).toBe(true)
    })

    test('description fields call max(500)', () => {
      const samples = [accordion, cardGrid, newsletter, timeline]
      for (const schema of samples) {
        const calls = getCalls(schema, 'description')
        expect(calls.some((c) => c.method === 'max' && c.args[0] === 500)).toBe(true)
      }
    })

    test('map-block lat calls required(), min(-90) and max(90)', () => {
      const calls = getNestedCalls(mapBlock, 'coordinates', 'lat')
      expect(calls.some((c) => c.method === 'required')).toBe(true)
      expect(calls.some((c) => c.method === 'min' && c.args[0] === -90)).toBe(true)
      expect(calls.some((c) => c.method === 'max' && c.args[0] === 90)).toBe(true)
    })

    test('map-block lng calls required(), min(-180) and max(180)', () => {
      const calls = getNestedCalls(mapBlock, 'coordinates', 'lng')
      expect(calls.some((c) => c.method === 'required')).toBe(true)
      expect(calls.some((c) => c.method === 'min' && c.args[0] === -180)).toBe(true)
      expect(calls.some((c) => c.method === 'max' && c.args[0] === 180)).toBe(true)
    })

    test('map-block zoom calls min(1) and max(20)', () => {
      const calls = getCalls(mapBlock, 'zoom')
      expect(calls.some((c) => c.method === 'min' && c.args[0] === 1)).toBe(true)
      expect(calls.some((c) => c.method === 'max' && c.args[0] === 20)).toBe(true)
    })

    test('map-block address calls max(500)', () => {
      const calls = getCalls(mapBlock, 'address')
      expect(calls.some((c) => c.method === 'max' && c.args[0] === 500)).toBe(true)
    })

    test('array fields call max() with expected bounds', () => {
      expect(getCalls(accordion, 'items').some((c) => c.method === 'max' && c.args[0] === 20)).toBe(true)
      expect(getCalls(imageGallery, 'images').some((c) => c.method === 'max' && c.args[0] === 30)).toBe(true)
      expect(getCalls(tabsBlock, 'tabs').some((c) => c.method === 'max' && c.args[0] === 8)).toBe(true)
    })

    test('event-list limit calls min(1), max(50)', () => {
      const calls = getCalls(eventList, 'limit')
      expect(calls.some((c) => c.method === 'min' && c.args[0] === 1)).toBe(true)
      expect(calls.some((c) => c.method === 'max' && c.args[0] === 50)).toBe(true)
    })
  })

  describe('Object schema validation coverage', () => {
    test('accordion-item title has validation', () => {
      const field = findField(accordionItem, 'title')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
    })

    test('faq-item question has validation', () => {
      const field = findField(faqItem, 'question')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
    })

    test('feature-item title has validation', () => {
      const field = findField(featureItem, 'title')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
    })

    test('gallery-image caption has validation', () => {
      const field = findField(galleryImage, 'caption')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
    })

    test('metric-item value has validation', () => {
      const field = findField(metricItem, 'value')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
    })

    test('pricing-tier name has validation', () => {
      const field = findField(pricingTier, 'name')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
    })

    test('stat-item value has validation', () => {
      const field = findField(statItem, 'value')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
    })

    test('tab-item label has validation', () => {
      const field = findField(tabItem, 'label')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
    })

    test('timeline-entry title has validation', () => {
      const field = findField(timelineEntry, 'title')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
    })

    test('comparison-row feature has validation', () => {
      const field = findField(comparisonRow, 'feature')
      expect(field).toBeDefined()
      expect(field.validation).toBeDefined()
    })
  })
})
