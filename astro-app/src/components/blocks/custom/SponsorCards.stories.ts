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
      headline: 'Industry Partners Making It Possible',
      sponsors: [
        {
          _key: 'sp1',
          name: 'Prudential Financial',
          tier: 'platinum',
          description: 'Global financial services leader supporting student innovation in fintech and data analytics.',
          website: 'https://example.com',
          yearJoined: 2019,
          projectThemes: ['FinTech', 'Data Analytics', 'Cloud Migration'],
        },
        {
          _key: 'sp2',
          name: 'ADP',
          tier: 'gold',
          description: 'HR technology company partnering on workforce management and payroll automation projects.',
          website: 'https://example.com',
          yearJoined: 2021,
          projectThemes: ['HR Tech', 'Automation'],
        },
        {
          _key: 'sp3',
          name: 'Verizon',
          tier: 'gold',
          description: 'Telecommunications giant collaborating on IoT and 5G application development.',
          yearJoined: 2022,
          projectThemes: ['IoT', '5G', 'Mobile'],
        },
        {
          _key: 'sp4',
          name: 'Panasonic',
          tier: 'silver',
          description: 'Electronics manufacturer exploring smart home and sustainability technology solutions.',
          projectThemes: ['Smart Home', 'Sustainability'],
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
          name: 'Acme Corp',
          tier: 'silver',
          description: 'Technology solutions provider.',
        },
        {
          _key: 'sp2',
          name: 'Beta Industries',
          tier: 'silver',
          description: 'Innovation-driven manufacturing.',
        },
      ],
    },
  },
}
