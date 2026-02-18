/**
 * Type adapter — re-exports generated types from Sanity TypeGen.
 * Regenerate with: npm run typegen
 */
import type {
  PAGE_BY_SLUG_QUERY_RESULT,
  SITE_SETTINGS_QUERY_RESULT,
} from '@/sanity.types';

// ---------------------------------------------------------------------------
// Query result types
// ---------------------------------------------------------------------------

export type Page = NonNullable<PAGE_BY_SLUG_QUERY_RESULT>;
export type SiteSettings = NonNullable<SITE_SETTINGS_QUERY_RESULT>;

// ---------------------------------------------------------------------------
// Block types — extracted from GROQ query result union
// ---------------------------------------------------------------------------

type PageBlocks = NonNullable<Page['blocks']>;
export type PageBlock = PageBlocks[number];

export type HeroBannerBlock = Extract<PageBlock, { _type: 'heroBanner' }>;
export type FeatureGridBlock = Extract<PageBlock, { _type: 'featureGrid' }>;
export type CtaBannerBlock = Extract<PageBlock, { _type: 'ctaBanner' }>;
export type StatsRowBlock = Extract<PageBlock, { _type: 'statsRow' }>;
export type TextWithImageBlock = Extract<PageBlock, { _type: 'textWithImage' }>;
export type LogoCloudBlock = Extract<PageBlock, { _type: 'logoCloud' }>;
export type SponsorStepsBlock = Extract<PageBlock, { _type: 'sponsorSteps' }>;
export type RichTextBlock = Extract<PageBlock, { _type: 'richText' }>;
export type FaqSectionBlock = Extract<PageBlock, { _type: 'faqSection' }>;
export type ContactFormBlock = Extract<PageBlock, { _type: 'contactForm' }>;
export type SponsorCardsBlock = Extract<PageBlock, { _type: 'sponsorCards' }>;
export type TestimonialsBlock = Extract<PageBlock, { _type: 'testimonials' }>;

