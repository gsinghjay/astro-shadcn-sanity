import type { Page } from '../types';

export const aboutPage: Page = {
  _id: 'about',
  title: 'About the Program',
  slug: '/about',
  description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod',
  blocks: [
    {
      _type: 'heroBanner',
      _key: 'hero-1',
      heading: 'About Us',
      subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      alignment: 'center',
    },
    {
      _type: 'textWithImage',
      _key: 'twi-1',
      heading: 'Lorem Ipsum Dolor Sit Amet',
      image: { asset: { _id: '', url: 'https://images.pexels.com/photos/3184328/pexels-photo-3184328.jpeg?auto=compress&cs=tinysrgb&w=800' }, alt: 'Overview' },
      imagePosition: 'right',
    },
    {
      _type: 'featureGrid',
      _key: 'features-1',
      heading: 'How It Works',
      columns: 2,
      items: [
        {
          _key: 'f1',
          title: 'Lorem Ipsum',
          description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat.',
        },
        {
          _key: 'f2',
          title: 'Dolor Sit Amet',
          description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute.',
        },
        {
          _key: 'f3',
          title: 'Consectetur Elit',
          description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum sed ut.',
        },
        {
          _key: 'f4',
          title: 'Adipiscing Tempor',
          description: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione.',
        },
      ],
    },
    {
      _type: 'faqSection',
      _key: 'faq-1',
      label: 'Common Questions',
      headline: 'Frequently Asked Questions',
      items: [
        {
          _key: 'q1',
          question: 'Lorem ipsum dolor sit amet consectetur?',
          answer: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
        },
        {
          _key: 'q2',
          question: 'Ut enim ad minim veniam quis nostrud?',
          answer: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.',
        },
        {
          _key: 'q3',
          question: 'Duis aute irure dolor in reprehenderit?',
          answer: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate.',
        },
        {
          _key: 'q4',
          question: 'Excepteur sint occaecat cupidatat non proident?',
          answer: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.',
        },
        {
          _key: 'q5',
          question: 'Sed do eiusmod tempor incididunt ut labore?',
          answer: 'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est omnis dolor repellendus.',
        },
        {
          _key: 'q6',
          question: 'Quis nostrud exercitation ullamco laboris?',
          answer: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur.',
        },
        {
          _key: 'q7',
          question: 'Nemo enim ipsam voluptatem quia voluptas?',
          answer: 'Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.',
        },
      ],
    },
    {
      _type: 'ctaBanner',
      _key: 'cta-1',
      heading: 'Lorem Ipsum Dolor Sit?',
      description: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam.',
      ctaButtons: [{ _key: 'b1', text: 'Contact Us', url: '/contact' }],
      backgroundVariant: 'light',
    },
  ],
};
