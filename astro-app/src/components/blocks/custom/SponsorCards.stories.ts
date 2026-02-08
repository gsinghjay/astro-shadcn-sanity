import SponsorCards from './SponsorCards.astro'

export default {
  title: 'Blocks/SponsorCards',
  component: SponsorCards,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    block: {
      _type: 'sponsorCards',
      _key: 'story-sponsors-1',
      label: 'Our Sponsors',
      headline: 'Lorem Ipsum Partners',
      sponsors: [
        {
          _key: 'sp1',
          name: 'Acme Corp',
          tier: 'platinum',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
          website: 'https://example.com',
          yearJoined: 2020,
          projectThemes: ['Cloud Computing', 'Data Analytics', 'Web Development'],
        },
        {
          _key: 'sp2',
          name: 'Ipsum Solutions',
          tier: 'gold',
          description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.',
          website: 'https://example.com',
          yearJoined: 2021,
          projectThemes: ['Automation', 'DevOps'],
        },
        {
          _key: 'sp3',
          name: 'Dolor Tech',
          tier: 'gold',
          description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
          yearJoined: 2022,
          projectThemes: ['IoT', 'Mobile', 'Networking'],
        },
        {
          _key: 'sp4',
          name: 'Sit Amet Inc',
          tier: 'silver',
          description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.',
          projectThemes: ['Smart Systems', 'Sustainability'],
        },
      ],
    },
  },
}

export const Minimal = {
  args: {
    block: {
      _type: 'sponsorCards',
      _key: 'story-sponsors-2',
      headline: 'Our Partners',
      sponsors: [
        {
          _key: 'sp1',
          name: 'Magna Global',
          tier: 'silver',
          description: 'Lorem ipsum dolor sit amet consectetur.',
        },
        {
          _key: 'sp2',
          name: 'Veniam Group',
          tier: 'silver',
          description: 'Sed do eiusmod tempor incididunt.',
        },
      ],
    },
  },
}
