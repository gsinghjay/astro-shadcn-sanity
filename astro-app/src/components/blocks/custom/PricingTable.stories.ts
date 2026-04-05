import PricingTable from './PricingTable.astro'

const sharedTiers = [
  {
    _key: 'tier-1',
    name: 'Starter',
    price: '$9',
    interval: 'month',
    description: 'Perfect for individuals and small projects.',
    features: ['5 projects', '10 GB storage', 'Basic analytics', 'Email support'],
    ctaText: 'Get Started',
    ctaUrl: '/pricing/starter',
  },
  {
    _key: 'tier-2',
    name: 'Professional',
    price: '$29',
    interval: 'month',
    description: 'Best for growing teams and businesses.',
    features: ['Unlimited projects', '100 GB storage', 'Advanced analytics', 'Priority support', 'Custom integrations'],
    highlighted: true,
    ctaText: 'Get Started',
    ctaUrl: '/pricing/pro',
  },
  {
    _key: 'tier-3',
    name: 'Enterprise',
    price: '$99',
    interval: 'month',
    description: 'For large organizations with advanced needs.',
    features: ['Unlimited everything', '1 TB storage', 'Custom analytics', 'Dedicated support', 'SSO & SAML', 'SLA guarantee'],
    ctaText: 'Contact Sales',
    ctaUrl: '/pricing/enterprise',
  },
]

export default {
  title: 'Components/PricingTable',
  component: PricingTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Pricing tier comparison block with multiple layout variants for presenting subscription plans or service packages.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['simple', 'featured', 'comparison', 'brutalist'],
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

export const Simple = {
  args: {
    _type: 'pricingTable',
    _key: 'story-pricing-simple',
    variant: 'simple',
    heading: 'Simple, Transparent Pricing',
    description: 'Choose the plan that works best for you. All plans include a 14-day free trial.',
    tiers: sharedTiers,
  },
}

export const Featured = {
  args: {
    _type: 'pricingTable',
    _key: 'story-pricing-featured',
    variant: 'featured',
    heading: 'Find Your Perfect Plan',
    description: 'Start free and scale as you grow. No hidden fees.',
    tiers: sharedTiers,
  },
}

export const Comparison = {
  args: {
    _type: 'pricingTable',
    _key: 'story-pricing-comparison',
    variant: 'comparison',
    heading: 'Compare Plans',
    description: 'See which plan is right for your team.',
    tiers: sharedTiers,
  },
}

export const Brutalist = {
  args: {
    _type: 'pricingTable',
    _key: 'story-pricing-brutalist',
    variant: 'brutalist',
    heading: 'Sponsorship Investment',
    description: 'Choose the partnership level that aligns with your goals.',
    backgroundVariant: 'hatched-light',
    tiers: [
      {
        _key: 'tier-1',
        name: 'Silver',
        price: '$5,000',
        interval: 'per semester',
        description: 'Project mentorship and brand visibility.',
        features: ['1 capstone project', 'Logo on website', 'Student resume access', 'Showcase attendance'],
        highlighted: false,
        ctaText: 'Get Started',
        ctaUrl: '/contact',
      },
      {
        _key: 'tier-2',
        name: 'Gold',
        price: '$15,000',
        interval: 'per semester',
        description: 'Dedicated team and strategic partnership.',
        features: ['2 capstone projects', 'Priority project selection', 'Dedicated liaison', 'Recruitment events', 'Logo prominence'],
        highlighted: true,
        ctaText: 'Partner Now',
        ctaUrl: '/contact',
      },
      {
        _key: 'tier-3',
        name: 'Platinum',
        price: '$30,000',
        interval: 'per year',
        description: 'Enterprise-grade collaboration and talent pipeline.',
        features: ['Unlimited projects', 'Advisory board seat', 'Custom curriculum input', 'Exclusive recruitment', 'Annual showcase keynote', 'Research collaboration'],
        highlighted: false,
        ctaText: 'Contact Us',
        ctaUrl: '/contact',
      },
    ],
  },
}
