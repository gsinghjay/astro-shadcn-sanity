import SponsorCards from './SponsorCards.astro'

export default {
  title: 'Blocks/SponsorCards',
  component: SponsorCards,
  tags: ['autodocs'],
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
