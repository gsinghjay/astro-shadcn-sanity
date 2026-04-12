import SponsorCards from './SponsorCards.astro'

export default {
  title: 'Components/SponsorCards',
  component: SponsorCards,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Grid display of sponsor organization cards with logos, tiers, and metadata.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'showcase', 'brutalist-tier'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
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
    _type: 'sponsorCards',
    _key: 'story-sponsors-1',
    heading: 'Lorem Ipsum Partners',
    sponsors: [
      {
        _id: 'sp1',
        name: 'Acme Corp',
        tier: 'platinum',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
        website: 'https://example.com',
      },
      {
        _id: 'sp2',
        name: 'Ipsum Solutions',
        tier: 'gold',
        description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.',
        website: 'https://example.com',
      },
      {
        _id: 'sp3',
        name: 'Dolor Tech',
        tier: 'gold',
        description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
      },
      {
        _id: 'sp4',
        name: 'Sit Amet Inc',
        tier: 'silver',
        description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.',
      },
    ],
  },
}

export const Minimal = {
  args: {
    _type: 'sponsorCards',
    _key: 'story-sponsors-2',
    heading: 'Our Partners',
    sponsors: [
      {
        _id: 'sp1',
        name: 'Magna Global',
        tier: 'silver',
        description: 'Lorem ipsum dolor sit amet consectetur.',
      },
      {
        _id: 'sp2',
        name: 'Veniam Group',
        tier: 'silver',
        description: 'Sed do eiusmod tempor incididunt.',
      },
    ],
  },
}

export const Showcase = {
  args: {
    _type: 'sponsorCards',
    _key: 'story-sponsors-showcase',
    variant: 'showcase',
    heading: 'Our Industry Partners',
    sponsors: [
      {
        _id: 'sps1',
        name: 'Cisco',
        tier: 'platinum',
        description: '3 projects completed across network security and IoT domains. 12 students engaged over 2 semesters.',
        website: 'https://cisco.com',
        logo: { asset: { url: 'https://placehold.co/200x80/e2e8f0/475569?text=Cisco' }, alt: 'Cisco logo' },
      },
      {
        _id: 'sps2',
        name: 'Verizon',
        tier: 'platinum',
        description: '5G-enabled healthcare application and workforce optimization tools. Ongoing partnership since 2023.',
        website: 'https://verizon.com',
        logo: { asset: { url: 'https://placehold.co/200x80/e2e8f0/475569?text=Verizon' }, alt: 'Verizon logo' },
      },
      {
        _id: 'sps3',
        name: 'Bank of America',
        tier: 'gold',
        description: 'ML-powered article appeal prediction system. Deployed to production in Q4 2025.',
        website: 'https://bankofamerica.com',
        logo: { asset: { url: 'https://placehold.co/200x80/e2e8f0/475569?text=BofA' }, alt: 'Bank of America logo' },
      },
    ],
  },
}

export const BrutalistTier = {
  args: {
    _type: 'sponsorCards',
    _key: 'story-sponsors-brutalist',
    variant: 'brutalist-tier',
    heading: 'Sponsorship Partners',
    backgroundVariant: 'hatched-light',
    sponsors: [
      {
        _id: 'spb1',
        name: 'Cisco',
        tier: 'platinum',
        description: 'Global leader in networking and cybersecurity.',
        website: 'https://cisco.com',
      },
      {
        _id: 'spb2',
        name: 'Verizon',
        tier: 'platinum',
        description: 'Telecommunications and 5G innovation.',
        website: 'https://verizon.com',
      },
      {
        _id: 'spb3',
        name: 'Bank of America',
        tier: 'gold',
        description: 'Financial services and fintech solutions.',
        website: 'https://bankofamerica.com',
      },
      {
        _id: 'spb4',
        name: 'UPS',
        tier: 'gold',
        description: 'Logistics, supply chain, and automation.',
        website: 'https://ups.com',
      },
      {
        _id: 'spb5',
        name: 'Eco-Enterprise',
        tier: 'silver',
        description: 'Sustainability consulting and green technology.',
        website: 'https://eco-enterprise.com',
      },
    ],
  },
}
