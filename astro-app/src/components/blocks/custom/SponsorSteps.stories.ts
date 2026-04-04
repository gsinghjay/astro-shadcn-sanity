import SponsorSteps from './SponsorSteps.astro'

export default {
  title: 'Components/SponsorSteps',
  component: SponsorSteps,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Step-by-step process visualization for the sponsor onboarding flow. Numbered tiles with check-list items per step.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['steps', 'split', 'spread'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
  },
}

const sharedItems = [
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
]

export const Default = {
  args: {
    _type: 'sponsorSteps',
    _key: 'story-steps-1',
    headline: 'How to Become a Sponsor',
    subtitle: 'Follow these steps to begin your sponsorship journey.',
    items: sharedItems,
  },
}

export const Split = {
  args: {
    _type: 'sponsorSteps',
    _key: 'story-steps-split',
    variant: 'split',
    heading: 'How to Become a Sponsor',
    subheading: 'Two-column layout with steps on the right side.',
    items: sharedItems,
  },
}

export const Spread = {
  args: {
    _type: 'sponsorSteps',
    _key: 'story-steps-spread',
    variant: 'spread',
    heading: 'How to Become a Sponsor',
    subheading: 'Horizontal step cards across the full width.',
    items: sharedItems,
  },
}
