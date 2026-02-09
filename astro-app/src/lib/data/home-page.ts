import type { Page } from '../types';

export const homePage: Page = {
  _id: 'home',
  title: 'Home',
  slug: '/',
  description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
  blocks: [
    {
      _type: 'heroBanner',
      _key: 'hero-1',
      heading: 'Lorem Ipsum Dolor Sit Amet',
      subheading: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
      ctaButtons: [
        { _key: 'b1', text: 'Get Started', url: '/contact' },
        { _key: 'b2', text: 'Learn More', url: '/projects', variant: 'outline' },
      ],
      alignment: 'center',
      backgroundImages: [
        {
          _key: 'bg1',
          asset: { _id: '', url: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=1920' },
          alt: 'Placeholder background image 1',
        },
        {
          _key: 'bg2',
          asset: { _id: '', url: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1920' },
          alt: 'Placeholder background image 2',
        },
        {
          _key: 'bg3',
          asset: { _id: '', url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920' },
          alt: 'Placeholder background image 3',
        },
        {
          _key: 'bg4',
          asset: { _id: '', url: 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=1920' },
          alt: 'Placeholder background image 4',
        },
      ],
    },
    {
      _type: 'statsRow',
      _key: 'stats-1',
      backgroundVariant: 'dark',
      stats: [
        { _key: 's1', value: '100+', label: 'Lorem Ipsum' },
        { _key: 's2', value: '50+', label: 'Dolor Sit' },
        { _key: 's3', value: '500+', label: 'Amet Consectetur' },
        { _key: 's4', value: '10', label: 'Adipiscing' },
      ],
    },
    {
      _type: 'featureGrid',
      _key: 'features-1',
      heading: 'Lorem Ipsum Dolor Sit Amet Consectetur',
      columns: 3,
      items: [
        {
          _key: 'f1',
          title: 'Consectetur Adipiscing',
          description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint.',
          icon: 'research',
        },
        {
          _key: 'f2',
          title: 'Elit Sed Do',
          description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
          icon: 'people',
        },
        {
          _key: 'f3',
          title: 'Eiusmod Tempor',
          description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
          icon: 'lightbulb',
        },
        {
          _key: 'f4',
          title: 'Incididunt Labore',
          description: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.',
          icon: 'chart',
        },
        {
          _key: 'f5',
          title: 'Dolore Magna',
          description: 'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit sed quia non numquam.',
          icon: 'shield',
        },
        {
          _key: 'f6',
          title: 'Aliqua Veniam',
          description: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur vel illum.',
          icon: 'award',
        },
      ],
    },
    {
      _type: 'textWithImage',
      _key: 'twi-1',
      heading: 'Lorem Ipsum Dolor Sit Amet Elit',
      image: { asset: { _id: '', url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800' }, alt: 'About us' },
      imagePosition: 'right',
    },
    {
      _type: 'logoCloud',
      _key: 'logos-1',
      heading: 'Trusted by Leading Organizations',
      sponsors: [
        { _id: 'l1', name: 'Acme Corp', website: 'https://example.com' },
        { _id: 'l2', name: 'Lorem Industries', website: 'https://example.com' },
        { _id: 'l3', name: 'Ipsum Solutions', website: 'https://example.com' },
        { _id: 'l4', name: 'Dolor Tech', website: 'https://example.com' },
        { _id: 'l5', name: 'Sit Amet Inc', website: 'https://example.com' },
        { _id: 'l6', name: 'Magna Global', website: 'https://example.com' },
        { _id: 'l7', name: 'Aliqua Systems', website: 'https://example.com' },
        { _id: 'l8', name: 'Veniam Group', website: 'https://example.com' },
      ],
    },
    {
      _type: 'sponsorSteps',
      _key: 'sponsor-steps-1',
      heading: 'How to Become a Sponsor',
      subheading: 'Follow these steps to begin your sponsorship journey with YWCC Capstone.',
      items: [
        {
          _key: 'ss1',
          title: 'Initial Inquiry',
          description: 'Submit your interest through our sponsorship form or contact our program director.',
          list: [
            'Provide company information',
            'Indicate areas of interest',
            'Describe your technical challenges',
          ],
        },
        {
          _key: 'ss2',
          title: 'Consultation Meeting',
          description: 'Schedule a meeting with our sponsorship team to discuss:',
          list: [
            'Your technical challenges and goals',
            'Available student teams and expertise',
            'Timeline and expectations',
            'Sponsorship benefits and commitments',
          ],
        },
        {
          _key: 'ss3',
          title: 'Project Proposal',
          description: 'Work with our team to develop a project proposal including:',
          list: [
            'Clear problem statement',
            'Desired outcomes and deliverables',
            'Technical requirements',
            'Resource commitments',
          ],
        },
        {
          _key: 'ss4',
          title: 'Agreement Signing',
          description: 'Complete the sponsorship process:',
          list: [
            'Review and sign sponsorship agreement',
            'Complete NDA if required',
            'No monetary cost — sponsorship is free',
            'Receive sponsor portal access',
          ],
        },
      ],
      ctaButtons: [
        { _key: 'b1', text: 'Become a Sponsor', url: '/contact' },
        { _key: 'b2', text: 'Learn More', url: '/sponsors', variant: 'outline' },
      ],
    },
    {
      _type: 'ctaBanner',
      _key: 'cta-1',
      heading: 'Lorem Ipsum Dolor Sit Amet?',
      description: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
      ctaButtons: [
        { _key: 'b1', text: 'Get Started', url: '/contact' },
        { _key: 'b2', text: 'Learn More', url: '/about', variant: 'outline' },
      ],
      backgroundVariant: 'primary',
    },
  ],
};
