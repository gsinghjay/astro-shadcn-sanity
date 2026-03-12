import type { SponsorshipTiersBlock } from '@/lib/types';

export const tiersFull: SponsorshipTiersBlock = {
  _type: 'sponsorshipTiers',
  _key: 'test-tiers-1',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  variant: null,
  heading: 'Sponsorship Tiers',
  description: 'Choose the sponsorship level that fits your organization.',
  tiers: [
    {
      _key: 'tier-1',
      name: 'Bronze',
      price: '$0',
      benefits: ['Logo on website', 'Newsletter mention'],
      highlighted: false,
      ctaButton: { text: 'Get Started', url: '/contact', variant: 'outline' },
    },
    {
      _key: 'tier-2',
      name: 'Gold',
      price: '$5,000',
      benefits: ['All Silver benefits', 'Dedicated project team', 'Priority support'],
      highlighted: true,
      ctaButton: { text: 'Contact Us', url: '/contact', variant: 'default' },
    },
    {
      _key: 'tier-3',
      name: 'Platinum',
      price: 'Custom',
      benefits: ['All Gold benefits', 'Custom project scope', 'Executive briefings'],
      highlighted: false,
      ctaButton: { text: 'Talk to Us', url: '/contact', variant: 'outline' },
    },
  ],
};

export const tiersMinimal: SponsorshipTiersBlock = {
  _type: 'sponsorshipTiers',
  _key: 'test-tiers-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  variant: null,
  heading: null,
  description: null,
  tiers: [
    {
      _key: 'tier-min-1',
      name: 'Free',
      price: '$0',
      benefits: ['Basic access'],
      highlighted: false,
      ctaButton: null,
    },
  ],
};
