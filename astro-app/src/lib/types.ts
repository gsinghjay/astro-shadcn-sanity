export interface SanityImage {
  _type: 'image';
  asset: { _ref: string };
  alt?: string;
}

export interface SanityImageWithAlt {
  _key?: string;
  asset: { _id: string; url: string };
  alt?: string;
}

export interface PortableTextBlock {
  _type: 'block';
  _key: string;
  children: Array<{ _type: 'span'; text: string; marks?: string[] }>;
  style?: string;
  markDefs?: Array<{ _key: string; _type: string; href?: string }>;
}

export interface ButtonObject {
  _key: string;
  text: string;
  url: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
}

export interface BlockBase {
  backgroundVariant?: 'white' | 'light' | 'dark' | 'primary';
  spacing?: 'none' | 'small' | 'default' | 'large';
  maxWidth?: 'narrow' | 'default' | 'full';
}

export interface HeroBannerBlock extends BlockBase {
  _type: 'heroBanner';
  _key: string;
  heading: string;
  subheading?: string;
  ctaButtons?: ButtonObject[];
  backgroundImages?: SanityImageWithAlt[];
  alignment?: 'left' | 'center' | 'right';
}

export interface FeatureItem {
  _key: string;
  title: string;
  description: string;
  icon?: string;
  image?: SanityImageWithAlt;
}

export interface FeatureGridBlock extends BlockBase {
  _type: 'featureGrid';
  _key: string;
  heading?: string;
  items: FeatureItem[];
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

export interface CtaBannerBlock extends BlockBase {
  _type: 'ctaBanner';
  _key: string;
  heading: string;
  description?: string;
  ctaButtons?: ButtonObject[];
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

export interface SponsorStepsBlock extends BlockBase {
  _type: 'sponsorSteps';
  _key: string;
  heading?: string;
  subheading?: string;
  items: SponsorStepsItem[];
  ctaButtons?: ButtonObject[];
}

export interface StatItem {
  _key: string;
  value: string;
  label: string;
  description?: string;
}

export interface StatsRowBlock extends BlockBase {
  _type: 'statsRow';
  _key: string;
  heading?: string;
  stats: StatItem[];
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

export interface SponsorRef {
  _id: string;
  name: string;
  slug?: string;
  logo?: SanityImageWithAlt;
  website?: string;
}

export interface LogoCloudBlock extends BlockBase {
  _type: 'logoCloud';
  _key: string;
  heading?: string;
  autoPopulate?: boolean;
  sponsors: SponsorRef[];
}

export interface TextWithImageBlock extends BlockBase {
  _type: 'textWithImage';
  _key: string;
  heading?: string;
  content?: PortableTextBlock[];
  image?: SanityImageWithAlt;
  imagePosition?: 'left' | 'right';
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
