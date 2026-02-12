import LogoCloud from './LogoCloud.astro'

export default {
  title: 'Blocks/LogoCloud',
  component: LogoCloud,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
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
