/**
 * Shared test constants — single source of truth for block names, types, and build config.
 * Used by integration tests across stories 1-2, 1-3, and 1-4.
 */

export const BLOCK_NAMES = [
  'HeroBanner',
  'FeatureGrid',
  'FaqSection',
  'CtaBanner',
  'SponsorCards',
  'Timeline',
  'StatsRow',
  'TeamGrid',
  'RichText',
  'ContactForm',
  'LogoCloud',
  'TextWithImage',
] as const

export const BLOCK_TYPES = [
  'heroBanner',
  'featureGrid',
  'faqSection',
  'ctaBanner',
  'sponsorCards',
  'timeline',
  'statsRow',
  'teamGrid',
  'richText',
  'contactForm',
  'logoCloud',
  'textWithImage',
] as const

export const BLOCK_TYPE_INTERFACES = [
  'HeroBannerBlock',
  'FeatureGridBlock',
  'FaqSectionBlock',
  'CtaBannerBlock',
  'SponsorCardsBlock',
  'TimelineBlock',
  'StatsRowBlock',
  'TeamGridBlock',
  'RichTextBlock',
  'ContactFormBlock',
  'LogoCloudBlock',
  'TextWithImageBlock',
] as const

export const BUILD_TIMEOUT_MS = 120_000
