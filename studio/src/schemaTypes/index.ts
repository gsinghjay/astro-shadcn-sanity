import type {SchemaTypeDefinition} from 'sanity'

// Object schemas
import {seo} from './objects/seo'
import {button} from './objects/button'
import {portableText} from './objects/portable-text'

// Document schemas
import {page} from './documents/page'
import {siteSettings} from './documents/site-settings'
import {sponsor} from './documents/sponsor'

// Block schemas — homepage (Story 2.1)
import {heroBanner} from './blocks/hero-banner'
import {featureGrid} from './blocks/feature-grid'
import {ctaBanner} from './blocks/cta-banner'
import {statsRow} from './blocks/stats-row'
import {textWithImage} from './blocks/text-with-image'
import {logoCloud} from './blocks/logo-cloud'
import {sponsorSteps} from './blocks/sponsor-steps'
// Block schemas — remaining (Story 2.1b)
import {richText} from './blocks/rich-text'
import {faqSection} from './blocks/faq-section'
import {contactForm} from './blocks/contact-form'
import {sponsorCards} from './blocks/sponsor-cards'
// timeline and teamGrid removed — depend on event/team document types (Story 2.1b)

export const schemaTypes: SchemaTypeDefinition[] = [
  // Objects
  seo,
  button,
  portableText,
  // Documents
  page,
  siteSettings,
  sponsor,
  // Blocks — homepage
  heroBanner,
  featureGrid,
  ctaBanner,
  statsRow,
  textWithImage,
  logoCloud,
  sponsorSteps,
  // Blocks — remaining
  richText,
  faqSection,
  contactForm,
  sponsorCards,
]
