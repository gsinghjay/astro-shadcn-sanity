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
export type EventListBlock = Extract<PageBlock, { _type: 'eventList' }>;
export type ProjectCardsBlock = Extract<PageBlock, { _type: 'projectCards' }>;
export type TeamGridBlock = Extract<PageBlock, { _type: 'teamGrid' }>;
export type ImageGalleryBlock = Extract<PageBlock, { _type: 'imageGallery' }>;
export type ArticleListBlock = Extract<PageBlock, { _type: 'articleList' }>;
export type ComparisonTableBlock = Extract<PageBlock, { _type: 'comparisonTable' }>;
export type TimelineBlock = Extract<PageBlock, { _type: 'timeline' }>;
export type PullquoteBlock = Extract<PageBlock, { _type: 'pullquote' }>;
export type DividerBlock = Extract<PageBlock, { _type: 'divider' }>;
export type AnnouncementBarBlock = Extract<PageBlock, { _type: 'announcementBar' }>;
export type SponsorshipTiersBlock = Extract<PageBlock, { _type: 'sponsorshipTiers' }>;
export type VideoEmbedBlock = Extract<PageBlock, { _type: 'videoEmbed' }>;
// Essential blocks (Story 17.20)
export type PricingTableBlock = Extract<PageBlock, { _type: 'pricingTable' }>;
export type ServiceCardsBlock = Extract<PageBlock, { _type: 'serviceCards' }>;
export type ProductShowcaseBlock = Extract<PageBlock, { _type: 'productShowcase' }>;
export type LinkCardsBlock = Extract<PageBlock, { _type: 'linkCards' }>;
export type NewsletterBlock = Extract<PageBlock, { _type: 'newsletter' }>;
export type AccordionBlock = Extract<PageBlock, { _type: 'accordion' }>;
export type TabsBlockBlock = Extract<PageBlock, { _type: 'tabsBlock' }>;
export type EmbedBlockBlock = Extract<PageBlock, { _type: 'embedBlock' }>;
export type MapBlockBlock = Extract<PageBlock, { _type: 'mapBlock' }>;
export type CountdownTimerBlock = Extract<PageBlock, { _type: 'countdownTimer' }>;
export type MetricsDashboardBlock = Extract<PageBlock, { _type: 'metricsDashboard' }>;
export type CardGridBlock = Extract<PageBlock, { _type: 'cardGrid' }>;
export type BeforeAfterBlock = Extract<PageBlock, { _type: 'beforeAfter' }>;
// Layout blocks (Story 21.10)
export type ColumnsBlockBlock = Extract<PageBlock, { _type: 'columnsBlock' }>;

// Inner block type — the narrower union used by columnsBlock sub-arrays.
// Excludes columnsBlock itself (prevents infinite nesting).
type InnerPageBlocks = NonNullable<ColumnsBlockBlock['leftBlocks']>;
export type InnerPageBlock = InnerPageBlocks[number];

// ---------------------------------------------------------------------------
// Layout types — shared across Layout, SidebarLayout, PortalLayout
// ---------------------------------------------------------------------------

export interface SeoProps {
  metaTitle?: string | null;
  metaDescription?: string | null;
  noIndex?: boolean | null;
  ogImage?: {
    asset?: {
      _id: string;
      url?: string | null;
      metadata?: { lqip?: string | null; dimensions?: unknown } | null;
    } | null;
    alt?: string | null;
  } | null;
}

