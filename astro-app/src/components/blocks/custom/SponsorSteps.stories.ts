import SponsorSteps from './SponsorSteps.astro'

export default {
  title: 'Blocks/SponsorSteps',
  component: SponsorSteps,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    _type: 'sponsorSteps',
    _key: 'story-steps-1',
    headline: 'How to Become a Sponsor',
    subtitle: 'Follow these steps to begin your sponsorship journey.',
    items: [
      {
        _key: 'ss1',
        title: 'Initial Inquiry',
        description: 'Submit your interest through our sponsorship form.',
        list: [
          'Provide company information',
          'Indicate areas of interest',
        ],
      },
      {
        _key: 'ss2',
        title: 'Consultation Meeting',
        description: 'Schedule a meeting with our team to discuss goals.',
        list: [
          'Technical challenges and goals',
          'Timeline and expectations',
        ],
      },
      {
        _key: 'ss3',
        title: 'Agreement Signing',
        description: 'Complete the sponsorship process.',
        list: [
          'Review sponsorship agreement',
          'Finalize project scope',
        ],
      },
    ],
  },
}
