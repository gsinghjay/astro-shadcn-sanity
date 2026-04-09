import SponsorshipTiers from './SponsorshipTiers.astro'

export default {
  title: 'Components/SponsorshipTiers',
  component: SponsorshipTiers,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Sponsorship tier comparison cards with benefit lists, pricing, and highlighted recommended tier. Used on sponsor-facing pages.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'brutalist'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    description: { control: 'text', description: 'Section description' },
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

export const Default = {
  args: {
    _type: 'sponsorshipTiers',
    _key: 'story-sptiers-default',
    heading: 'Partnership Levels',
    description: 'Invest in the next generation of tech talent.',
    tiers: [
      {
        _key: 'st-1',
        name: 'Silver',
        price: '$5,000',
        benefits: ['1 capstone project', 'Logo on website', 'Student resume access', 'Showcase attendance'],
        highlighted: false,
        ctaButton: { text: 'Get Started', url: '/contact' },
      },
      {
        _key: 'st-2',
        name: 'Gold',
        price: '$15,000',
        benefits: ['2 capstone projects', 'Priority project selection', 'Dedicated liaison', 'Recruitment events', 'Logo prominence'],
        highlighted: true,
        ctaButton: { text: 'Partner Now', url: '/contact' },
      },
      {
        _key: 'st-3',
        name: 'Platinum',
        price: '$30,000',
        benefits: ['Unlimited projects', 'Advisory board seat', 'Custom curriculum input', 'Exclusive recruitment', 'Annual showcase keynote', 'Research collaboration'],
        highlighted: false,
        ctaButton: { text: 'Contact Us', url: '/contact' },
      },
    ],
  },
}

export const Brutalist = {
  args: {
    _type: 'sponsorshipTiers',
    _key: 'story-sptiers-brutalist',
    variant: 'brutalist',
    heading: 'Investment Tiers',
    description: 'Enterprise-grade collaboration with NJIT\'s top STEM talent.',
    backgroundVariant: 'hatched-light',
    tiers: [
      {
        _key: 'stb-1',
        name: 'Silver',
        price: '$5,000',
        benefits: ['1 capstone project', 'Logo on website', 'Student resume access', 'Showcase attendance'],
        highlighted: false,
        ctaButton: { text: 'Get Started', url: '/contact' },
      },
      {
        _key: 'stb-2',
        name: 'Gold',
        price: '$15,000',
        benefits: ['2 capstone projects', 'Priority project selection', 'Dedicated liaison', 'Recruitment events', 'Logo prominence'],
        highlighted: true,
        ctaButton: { text: 'Partner Now', url: '/contact' },
      },
      {
        _key: 'stb-3',
        name: 'Platinum',
        price: '$30,000',
        benefits: ['Unlimited projects', 'Advisory board seat', 'Custom curriculum input', 'Exclusive recruitment', 'Annual showcase keynote', 'Research collaboration'],
        highlighted: false,
        ctaButton: { text: 'Contact Us', url: '/contact' },
      },
    ],
  },
}
