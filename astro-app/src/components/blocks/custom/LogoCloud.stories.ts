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
      label: 'Trusted by Industry Leaders',
      logos: [
        { _key: 'l1', name: 'Prudential', logoUrl: 'https://placehold.co/120x40/e2e8f0/475569?text=Prudential', website: 'https://example.com' },
        { _key: 'l2', name: 'ADP', logoUrl: 'https://placehold.co/120x40/e2e8f0/475569?text=ADP', website: 'https://example.com' },
        { _key: 'l3', name: 'Verizon', logoUrl: 'https://placehold.co/120x40/e2e8f0/475569?text=Verizon', website: 'https://example.com' },
        { _key: 'l4', name: 'Panasonic', logoUrl: 'https://placehold.co/120x40/e2e8f0/475569?text=Panasonic', website: 'https://example.com' },
        { _key: 'l5', name: 'BD', logoUrl: 'https://placehold.co/120x40/e2e8f0/475569?text=BD' },
        { _key: 'l6', name: 'Cognizant', logoUrl: 'https://placehold.co/120x40/e2e8f0/475569?text=Cognizant' },
        { _key: 'l7', name: 'Deloitte', logoUrl: 'https://placehold.co/120x40/e2e8f0/475569?text=Deloitte' },
        { _key: 'l8', name: 'NJIT', logoUrl: 'https://placehold.co/120x40/e2e8f0/475569?text=NJIT' },
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
        { _key: 'l1', name: 'Prudential', website: 'https://example.com' },
        { _key: 'l2', name: 'ADP', website: 'https://example.com' },
        { _key: 'l3', name: 'Verizon' },
        { _key: 'l4', name: 'Panasonic' },
        { _key: 'l5', name: 'BD' },
        { _key: 'l6', name: 'Cognizant' },
        { _key: 'l7', name: 'Deloitte' },
        { _key: 'l8', name: 'NJIT' },
      ],
    },
  },
}
