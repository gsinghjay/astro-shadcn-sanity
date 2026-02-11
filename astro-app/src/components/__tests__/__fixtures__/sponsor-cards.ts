import type { SponsorCardsBlock } from '@/lib/types';

export const sponsorCardsFull: SponsorCardsBlock = {
  _type: 'sponsorCards',
  _key: 'test-sc-1',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  heading: 'Our Sponsors',
  displayMode: 'all',
  sponsors: [
    {
      _id: 'sponsor-1',
      name: 'Acme Corp',
      slug: 'acme-corp',
      logo: {
        asset: { _id: 'img-1', url: 'https://cdn.sanity.io/test/acme.png', metadata: null },
        alt: 'Acme logo',
      },
      tier: 'gold',
      description: 'Leading technology partner',
      website: 'https://acme.example.com',
    },
    {
      _id: 'sponsor-2',
      name: 'Beta Inc',
      slug: 'beta-inc',
      logo: null,
      tier: 'silver',
      description: null,
      website: null,
    },
  ],
};

export const sponsorCardsMinimal: SponsorCardsBlock = {
  _type: 'sponsorCards',
  _key: 'test-sc-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  heading: null,
  displayMode: null,
  sponsors: null,
};
