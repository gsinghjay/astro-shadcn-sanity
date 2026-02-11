import type { SponsorStepsBlock } from '@/lib/types';

export const sponsorStepsFull: SponsorStepsBlock = {
  _type: 'sponsorSteps',
  _key: 'test-ss-1',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  heading: 'How to Become a Sponsor',
  subheading: 'Follow these simple steps',
  items: [
    {
      _key: 'step-1',
      title: 'Choose a Tier',
      description: 'Select the sponsorship level that works for you.',
      list: ['Platinum', 'Gold', 'Silver', 'Bronze'],
    },
    {
      _key: 'step-2',
      title: 'Contact Us',
      description: 'Reach out to our team.',
      list: null,
    },
  ],
  ctaButtons: [
    { _key: 'btn-1', text: 'Get Started', url: '/contact', variant: 'default' },
  ],
};

export const sponsorStepsMinimal: SponsorStepsBlock = {
  _type: 'sponsorSteps',
  _key: 'test-ss-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  heading: null,
  subheading: null,
  items: null,
  ctaButtons: null,
};
