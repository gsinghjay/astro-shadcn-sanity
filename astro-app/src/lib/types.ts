/**
 * Type adapter — re-exports generated types from Sanity TypeGen.
 * Regenerate with: npm run typegen
 *
 * Manual types at the bottom are for blocks without schemas (Epic 4 dependency).
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
export type PageBlock = PageBlocks[number] | TimelineBlock | TeamGridBlock;

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

// ---------------------------------------------------------------------------
// Manual types — no schema exists yet (Epic 4 dependency)
// TODO: Replace with generated types when event/team schemas are registered
// ---------------------------------------------------------------------------

export interface TimelineEvent {
  _key: string;
  date: string;
  title: string;
  description?: string;
}

export interface TimelineBlock {
  _type: 'timeline';
  _key: string;
  label?: string;
  headline?: string;
  events: TimelineEvent[];
}

export interface TeamMember {
  _key: string;
  name: string;
  role?: string;
  major?: string;
  linkedIn?: string;
  image?: { asset: { _id: string; url: string }; alt?: string };
  imageUrl?: string;
}

export interface TeamGroup {
  _key: string;
  teamName: string;
  project?: string;
  sponsor?: string;
  members: TeamMember[];
}

export interface TeamGridBlock {
  _type: 'teamGrid';
  _key: string;
  label?: string;
  headline?: string;
  subtitle?: string;
  teams: TeamGroup[];
}
