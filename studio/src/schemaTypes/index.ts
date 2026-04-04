import type {SchemaTypeDefinition} from 'sanity'

// Object schemas
import {seo} from './objects/seo'
import {button} from './objects/button'
import {link} from './objects/link'
import {portableText} from './objects/portable-text'
import {faqItem} from './objects/faq-item'
import {featureItem} from './objects/feature-item'
import {statItem} from './objects/stat-item'
import {stepItem} from './objects/step-item'
// Object schemas — essential blocks (Story 17.20)
import {pricingTier} from './objects/pricing-tier'
import {serviceItem} from './objects/service-item'
import {productItem} from './objects/product-item'
import {linkCardItem} from './objects/link-card-item'
import {accordionItem} from './objects/accordion-item'
import {tabItem} from './objects/tab-item'
import {metricItem} from './objects/metric-item'
import {cardGridItem} from './objects/card-grid-item'

// Document schemas
import {page} from './documents/page'
import {siteSettings} from './documents/site-settings'
import {sponsor} from './documents/sponsor'
import {project} from './documents/project'
import {testimonial} from './documents/testimonial'
import {event} from './documents/event'
import {submission} from './documents/submission'

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
import {testimonials} from './blocks/testimonials'
import {eventList} from './blocks/event-list'
import {projectCards} from './blocks/project-cards'
// Block schemas — content display (Story 2.9)
import {teamGrid} from './blocks/team-grid'
import {imageGallery} from './blocks/image-gallery'
import {articleList} from './blocks/article-list'
// Object schemas — content display (Story 2.9)
import {teamMember} from './objects/team-member'
import {galleryImage} from './objects/gallery-image'
// Object schemas — data/editorial (Story 2.10)
import {comparisonColumn} from './objects/comparison-column'
import {comparisonRow} from './objects/comparison-row'
import {timelineEntry} from './objects/timeline-entry'
// Block schemas — data/editorial (Story 2.10)
import {comparisonTable} from './blocks/comparison-table'
import {timeline} from './blocks/timeline'
import {pullquote} from './blocks/pullquote'
// Block schemas — utility (Story 2.11)
import {divider} from './blocks/divider'
import {announcementBar} from './blocks/announcement-bar'
import {sponsorshipTiers} from './blocks/sponsorship-tiers'
// Block schemas — media (Story 2.21)
import {videoEmbed} from './blocks/video-embed'
// Block schemas — essential blocks (Story 17.20)
import {pricingTable} from './blocks/pricing-table'
import {serviceCards} from './blocks/service-cards'
import {productShowcase} from './blocks/product-showcase'
import {linkCards} from './blocks/link-cards'
import {newsletter} from './blocks/newsletter'
import {accordion} from './blocks/accordion'
import {tabsBlock} from './blocks/tabs-block'
import {embedBlock} from './blocks/embed-block'
import {mapBlock} from './blocks/map-block'
import {countdownTimer} from './blocks/countdown-timer'
import {metricsDashboard} from './blocks/metrics-dashboard'
import {cardGrid} from './blocks/card-grid'
import {beforeAfter} from './blocks/before-after'


export const schemaTypes: SchemaTypeDefinition[] = [
  // Objects
  seo,
  button,
  link,
  portableText,
  faqItem,
  featureItem,
  statItem,
  stepItem,
  teamMember,
  galleryImage,
  // Documents
  page,
  siteSettings,
  sponsor,
  project,
  testimonial,
  event,
  submission,
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
  testimonials,
  eventList,
  projectCards,
  // Blocks — content display
  teamGrid,
  imageGallery,
  articleList,
  // Objects — data/editorial
  comparisonColumn,
  comparisonRow,
  timelineEntry,
  // Blocks — data/editorial
  comparisonTable,
  timeline,
  pullquote,
  // Blocks — utility
  divider,
  announcementBar,
  // Blocks — social proof (Story 2.17)
  sponsorshipTiers,
  // Blocks — media (Story 2.21)
  videoEmbed,
  // Objects — essential blocks (Story 17.20)
  pricingTier,
  serviceItem,
  productItem,
  linkCardItem,
  accordionItem,
  tabItem,
  metricItem,
  cardGridItem,
  // Blocks — essential blocks (Story 17.20)
  pricingTable,
  serviceCards,
  productShowcase,
  linkCards,
  newsletter,
  accordion,
  tabsBlock,
  embedBlock,
  mapBlock,
  countdownTimer,
  metricsDashboard,
  cardGrid,
  beforeAfter,
]
