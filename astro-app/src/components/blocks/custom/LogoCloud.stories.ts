import LogoCloud from './LogoCloud.astro'

export default {
  title: 'Components/LogoCloud',
  component: LogoCloud,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Responsive grid of partner/media logos with subtle opacity treatment. Bordered section with up to 8 columns.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'marquee', 'tiered', 'grid-prominent'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    backgroundVariant: {
      control: { type: 'select' },
      options: ['white', 'light', 'dark', 'primary', 'hatched', 'hatched-light'],
      description: 'Background color theme',
    },
    spacing: {
      control: { type: 'select' },
      options: ['none', 'small', 'default', 'large'],
      description: 'Vertical padding',
    },
    maxWidth: {
      control: { type: 'select' },
      options: ['narrow', 'default', 'full'],
      description: 'Maximum content width',
    },
  },
}

export const WithLogos = {
  args: {
    _type: 'logoCloud',
    _key: 'story-logos-1',
    heading: 'Trusted by Leading Organizations',
    sponsors: [
      { _id: 'l1', name: 'Acme Corp', logo: { asset: { url: 'https://placehold.co/120x40/e2e8f0/475569?text=Acme' }, alt: 'Acme Corp logo' }, website: 'https://example.com' },
      { _id: 'l2', name: 'Ipsum Solutions', logo: { asset: { url: 'https://placehold.co/120x40/e2e8f0/475569?text=Ipsum' }, alt: 'Ipsum Solutions logo' }, website: 'https://example.com' },
      { _id: 'l3', name: 'Dolor Tech', logo: { asset: { url: 'https://placehold.co/120x40/e2e8f0/475569?text=Dolor' }, alt: 'Dolor Tech logo' }, website: 'https://example.com' },
      { _id: 'l4', name: 'Sit Amet Inc', logo: { asset: { url: 'https://placehold.co/120x40/e2e8f0/475569?text=Sit+Amet' }, alt: 'Sit Amet Inc logo' }, website: 'https://example.com' },
      { _id: 'l5', name: 'Magna Global', logo: { asset: { url: 'https://placehold.co/120x40/e2e8f0/475569?text=Magna' }, alt: 'Magna Global logo' } },
      { _id: 'l6', name: 'Aliqua Systems', logo: { asset: { url: 'https://placehold.co/120x40/e2e8f0/475569?text=Aliqua' }, alt: 'Aliqua Systems logo' } },
      { _id: 'l7', name: 'Veniam Group', logo: { asset: { url: 'https://placehold.co/120x40/e2e8f0/475569?text=Veniam' }, alt: 'Veniam Group logo' } },
      { _id: 'l8', name: 'Tempor Holdings', logo: { asset: { url: 'https://placehold.co/120x40/e2e8f0/475569?text=Tempor' }, alt: 'Tempor Holdings logo' } },
    ],
  },
}

export const TextOnly = {
  args: {
    _type: 'logoCloud',
    _key: 'story-logos-2',
    heading: 'Our Partners',
    sponsors: [
      { _id: 'l1', name: 'Acme Corp', website: 'https://example.com' },
      { _id: 'l2', name: 'Ipsum Solutions', website: 'https://example.com' },
      { _id: 'l3', name: 'Dolor Tech' },
      { _id: 'l4', name: 'Sit Amet Inc' },
      { _id: 'l5', name: 'Magna Global' },
      { _id: 'l6', name: 'Aliqua Systems' },
      { _id: 'l7', name: 'Veniam Group' },
      { _id: 'l8', name: 'Tempor Holdings' },
    ],
  },
}

export const Marquee = {
  args: {
    _type: 'logoCloud',
    _key: 'story-logos-marquee',
    variant: 'marquee',
    heading: 'Trusted by Industry Leaders',
    backgroundVariant: 'dark',
    sponsors: [
      { _id: 'lm1', name: 'Cisco', tier: 'platinum', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=Cisco' }, alt: 'Cisco logo' } },
      { _id: 'lm2', name: 'Verizon', tier: 'platinum', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=Verizon' }, alt: 'Verizon logo' } },
      { _id: 'lm3', name: 'Bank of America', tier: 'gold', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=BofA' }, alt: 'Bank of America logo' } },
      { _id: 'lm4', name: 'UPS', tier: 'gold', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=UPS' }, alt: 'UPS logo' } },
      { _id: 'lm5', name: 'Forbes', tier: 'gold', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=Forbes' }, alt: 'Forbes logo' } },
      { _id: 'lm6', name: 'Eco-Enterprise', tier: 'silver', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=Eco' }, alt: 'Eco-Enterprise logo' } },
      { _id: 'lm7', name: 'Angeles Foundation', tier: 'bronze', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=Angeles' }, alt: 'Angeles Foundation logo' } },
      { _id: 'lm8', name: 'Magna Global', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=Magna' }, alt: 'Magna Global logo' } },
      { _id: 'lm9', name: 'Tempor Holdings', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=Tempor' }, alt: 'Tempor Holdings logo' } },
      { _id: 'lm10', name: 'Veniam Group', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=Veniam' }, alt: 'Veniam Group logo' } },
    ],
  },
}

export const Tiered = {
  args: {
    _type: 'logoCloud',
    _key: 'story-logos-tiered',
    variant: 'tiered',
    heading: 'Our Sponsors',
    sponsors: [
      { _id: 'lt1', name: 'Cisco', tier: 'platinum', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=Cisco' }, alt: 'Cisco logo' }, website: 'https://cisco.com' },
      { _id: 'lt2', name: 'Verizon', tier: 'platinum', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=Verizon' }, alt: 'Verizon logo' }, website: 'https://verizon.com' },
      { _id: 'lt3', name: 'Bank of America', tier: 'gold', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=BofA' }, alt: 'Bank of America logo' }, website: 'https://bankofamerica.com' },
      { _id: 'lt4', name: 'UPS', tier: 'gold', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=UPS' }, alt: 'UPS logo' }, website: 'https://ups.com' },
      { _id: 'lt5', name: 'Forbes', tier: 'gold', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=Forbes' }, alt: 'Forbes logo' }, website: 'https://forbes.com' },
      { _id: 'lt6', name: 'Eco-Enterprise', tier: 'silver', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=Eco' }, alt: 'Eco-Enterprise logo' }, website: 'https://eco-enterprise.com' },
      { _id: 'lt7', name: 'Angeles Foundation', tier: 'bronze', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=Angeles' }, alt: 'Angeles Foundation logo' } },
    ],
  },
}

export const GridProminent = {
  args: {
    _type: 'logoCloud',
    _key: 'story-logos-prominent',
    variant: 'grid-prominent',
    heading: 'Partnership Network',
    backgroundVariant: 'hatched-light',
    sponsors: [
      { _id: 'lp1', name: 'Cisco', tier: 'platinum', logo: { asset: { url: 'https://placehold.co/200x80/e2e8f0/475569?text=Cisco' }, alt: 'Cisco logo' } },
      { _id: 'lp2', name: 'Verizon', tier: 'platinum', logo: { asset: { url: 'https://placehold.co/200x80/e2e8f0/475569?text=Verizon' }, alt: 'Verizon logo' } },
      { _id: 'lp3', name: 'Bank of America', tier: 'gold', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=BofA' }, alt: 'Bank of America logo' } },
      { _id: 'lp4', name: 'UPS', tier: 'gold', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=UPS' }, alt: 'UPS logo' } },
      { _id: 'lp5', name: 'Forbes', tier: 'gold', logo: { asset: { url: 'https://placehold.co/160x60/e2e8f0/475569?text=Forbes' }, alt: 'Forbes logo' } },
      { _id: 'lp6', name: 'Eco-Enterprise', tier: 'silver', logo: { asset: { url: 'https://placehold.co/120x40/e2e8f0/475569?text=Eco' }, alt: 'Eco-Enterprise logo' } },
    ],
  },
}
