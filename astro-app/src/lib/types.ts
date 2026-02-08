export interface SanityImage {
  _type: 'image';
  asset: { _ref: string };
  alt?: string;
}

export interface PortableTextBlock {
  _type: 'block';
  _key: string;
  children: Array<{ _type: 'span'; text: string; marks?: string[] }>;
  style?: string;
  markDefs?: Array<{ _key: string; _type: string; href?: string }>;
}

export interface HeroBannerBlock {
  _type: 'heroBanner';
  _key: string;
  headline: string;
  subheadline?: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  backgroundImage?: SanityImage;
  backgroundImages?: Array<{ url: string; alt?: string }>;
  layout?: 'full' | 'split' | 'centered';
}

export interface FeatureItem {
  _key: string;
  title: string;
  description: string;
  icon?: string;
  stat?: string;
}

export interface FeatureGridBlock {
  _type: 'featureGrid';
  _key: string;
  label?: string;
  headline?: string;
  subtitle?: string;
  features: FeatureItem[];
  columns?: 2 | 3 | 4;
}

export interface FaqItem {
  _key: string;
  question: string;
  answer: string;
}

export interface FaqSectionBlock {
  _type: 'faqSection';
  _key: string;
  label?: string;
  headline?: string;
  items: FaqItem[];
}

export interface CtaBannerBlock {
  _type: 'ctaBanner';
  _key: string;
  headline: string;
  body?: string;
  ctaText: string;
  ctaUrl: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  variant?: 'light' | 'dark' | 'red';
}

export interface Sponsor {
  _key?: string;
  name: string;
  slug?: string;
  logo?: SanityImage;
  logoUrl?: string;
  description?: string;
  website?: string;
  tier?: 'platinum' | 'gold' | 'silver';
  projectThemes?: string[];
  yearJoined?: number;
}

export interface SponsorCardsBlock {
  _type: 'sponsorCards';
  _key: string;
  label?: string;
  headline?: string;
  sponsors: Sponsor[];
}

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

export interface SponsorStepsItem {
  _key: string;
  title: string;
  description: string;
  list?: string[];
}

export interface SponsorStepsBlock {
  _type: 'sponsorSteps';
  _key: string;
  headline?: string;
  subtitle?: string;
  items: SponsorStepsItem[];
  links?: Array<{ icon?: string; text?: string; href?: string; target?: string }>;
}

export interface StatItem {
  _key: string;
  value: string;
  label: string;
}

export interface StatsRowBlock {
  _type: 'statsRow';
  _key: string;
  stats: StatItem[];
  variant?: 'light' | 'dark';
}

export interface TeamMember {
  _key: string;
  name: string;
  role?: string;
  major?: string;
  linkedIn?: string;
  image?: SanityImage;
  imageUrl?: string;
}

export interface TeamGridBlock {
  _type: 'teamGrid';
  _key: string;
  label?: string;
  headline?: string;
  subtitle?: string;
  teams: TeamGroup[];
}

export interface TeamGroup {
  _key: string;
  teamName: string;
  project?: string;
  sponsor?: string;
  members: TeamMember[];
}

export interface RichTextBlock {
  _type: 'richText';
  _key: string;
  content: PortableTextBlock[];
}

export interface ContactFormBlock {
  _type: 'contactForm';
  _key: string;
  headline?: string;
  subtitle?: string;
  formEndpoint?: string;
  fields?: FormField[];
}

export interface FormField {
  _key: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface LogoCloudBlock {
  _type: 'logoCloud';
  _key: string;
  label?: string;
  logos: Array<{ _key: string; name: string; logoUrl?: string; logo?: SanityImage; website?: string }>;
}

export interface TextWithImageBlock {
  _type: 'textWithImage';
  _key: string;
  label?: string;
  headline?: string;
  body?: string;
  image?: SanityImage;
  imageUrl?: string;
  imagePosition?: 'left' | 'right';
  ctaText?: string;
  ctaUrl?: string;
}

export type PageBlock =
  | HeroBannerBlock
  | FeatureGridBlock
  | FaqSectionBlock
  | CtaBannerBlock
  | SponsorCardsBlock
  | TimelineBlock
  | SponsorStepsBlock
  | StatsRowBlock
  | TeamGridBlock
  | RichTextBlock
  | ContactFormBlock
  | LogoCloudBlock
  | TextWithImageBlock;

export interface Page {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  blocks: PageBlock[];
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface SiteSettings {
  title: string;
  description: string;
  navigation: NavItem[];
  footerText?: string;
}
