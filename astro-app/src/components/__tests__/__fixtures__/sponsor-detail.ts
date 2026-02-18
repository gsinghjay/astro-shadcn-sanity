import type { SPONSOR_BY_SLUG_QUERY_RESULT } from '@/sanity.types';

type SponsorDetail = NonNullable<SPONSOR_BY_SLUG_QUERY_RESULT>;

export const sponsorDetailFull: SponsorDetail = {
  _id: 'sponsor-1',
  name: 'Acme Corp',
  slug: 'acme-corp',
  logo: {
    asset: {
      _id: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-200x200-png',
      url: 'https://cdn.sanity.io/images/test-project/test-dataset/Tb9Ew8CXIwaY6R1kjMvI0uRR-200x200.png',
      metadata: null,
    },
    alt: 'Acme logo',
  },
  tier: 'gold',
  description: 'Leading technology partner delivering innovative solutions.',
  website: 'https://acme.example.com',
  featured: true,
  industry: 'Technology',
  projects: [],
};

export const sponsorDetailMinimal: SponsorDetail = {
  _id: 'sponsor-2',
  name: 'Beta Inc',
  slug: 'beta-inc',
  logo: null,
  tier: null,
  description: null,
  website: null,
  featured: false,
  industry: null,
  projects: [],
};
