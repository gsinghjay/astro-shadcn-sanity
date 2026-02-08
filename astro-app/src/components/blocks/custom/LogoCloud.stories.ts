import LogoCloud from './LogoCloud.astro'

export default {
  title: 'Blocks/LogoCloud',
  component: LogoCloud,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const WithLogos = {
  args: {
    block: {
      _type: 'logoCloud',
      _key: 'story-logos-1',
      label: 'Trusted by Leading Organizations',
      logos: [
        { _key: 'l1', name: 'Acme Corp', logoUrl: 'https://placehold.co/120x40/e2e8f0/475569?text=Acme', website: 'https://example.com' },
        { _key: 'l2', name: 'Ipsum Solutions', logoUrl: 'https://placehold.co/120x40/e2e8f0/475569?text=Ipsum', website: 'https://example.com' },
        { _key: 'l3', name: 'Dolor Tech', logoUrl: 'https://placehold.co/120x40/e2e8f0/475569?text=Dolor', website: 'https://example.com' },
        { _key: 'l4', name: 'Sit Amet Inc', logoUrl: 'https://placehold.co/120x40/e2e8f0/475569?text=Sit+Amet', website: 'https://example.com' },
        { _key: 'l5', name: 'Magna Global', logoUrl: 'https://placehold.co/120x40/e2e8f0/475569?text=Magna' },
        { _key: 'l6', name: 'Aliqua Systems', logoUrl: 'https://placehold.co/120x40/e2e8f0/475569?text=Aliqua' },
        { _key: 'l7', name: 'Veniam Group', logoUrl: 'https://placehold.co/120x40/e2e8f0/475569?text=Veniam' },
        { _key: 'l8', name: 'Tempor Holdings', logoUrl: 'https://placehold.co/120x40/e2e8f0/475569?text=Tempor' },
      ],
    },
  },
}

export const TextOnly = {
  args: {
    block: {
      _type: 'logoCloud',
      _key: 'story-logos-2',
      label: 'Our Partners',
      logos: [
        { _key: 'l1', name: 'Acme Corp', website: 'https://example.com' },
        { _key: 'l2', name: 'Ipsum Solutions', website: 'https://example.com' },
        { _key: 'l3', name: 'Dolor Tech' },
        { _key: 'l4', name: 'Sit Amet Inc' },
        { _key: 'l5', name: 'Magna Global' },
        { _key: 'l6', name: 'Aliqua Systems' },
        { _key: 'l7', name: 'Veniam Group' },
        { _key: 'l8', name: 'Tempor Holdings' },
      ],
    },
  },
}
