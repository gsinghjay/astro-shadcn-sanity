import type { Sponsor } from '@/lib/sanity';

export const sponsorCardsSponsors: Sponsor[] = [
  {
    _id: 'sponsor-1',
    name: 'Acme Corp',
    slug: 'acme-corp',
    logo: {
      asset: { _id: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-200x200-png', url: 'https://cdn.sanity.io/images/test-project/test-dataset/Tb9Ew8CXIwaY6R1kjMvI0uRR-200x200.png', metadata: null },
      alt: 'Acme logo',
      hotspot: null,
      crop: null,
    },
    tier: 'gold',
    description: 'Leading technology partner',
    website: 'https://acme.example.com',
    featured: true,
  },
  {
    _id: 'sponsor-2',
    name: 'Beta Inc',
    slug: 'beta-inc',
    logo: null,
    tier: 'silver',
    description: null,
    website: null,
    featured: false,
  },
];

export const sponsorCardsFull = {
  _type: 'sponsorCards' as const,
  _key: 'test-sc-1',
  backgroundVariant: null,
  spacing: 'default' as const,
  maxWidth: 'default' as const,
  heading: 'Our Sponsors',
  displayMode: 'all' as const,
  sponsors: sponsorCardsSponsors,
};

export const sponsorCardsMinimal = {
  _type: 'sponsorCards' as const,
  _key: 'test-sc-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  heading: null,
  displayMode: null,
  sponsors: undefined as Sponsor[] | undefined,
};
