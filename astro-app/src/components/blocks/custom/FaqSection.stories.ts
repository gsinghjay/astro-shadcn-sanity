import FaqSection from './FaqSection.astro'

export default {
  title: 'Blocks/FaqSection',
  component: FaqSection,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    block: {
      _type: 'faqSection',
      _key: 'story-faq-1',
      label: 'FAQ',
      headline: 'Frequently Asked Questions',
      items: [
        {
          _key: 'q1',
          question: 'Lorem ipsum dolor sit amet consectetur?',
          answer: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae.',
        },
        {
          _key: 'q2',
          question: 'Ut enim ad minim veniam quis nostrud?',
          answer: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
        },
        {
          _key: 'q3',
          question: 'Duis aute irure dolor in reprehenderit?',
          answer: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores.',
        },
        {
          _key: 'q4',
          question: 'Excepteur sint occaecat cupidatat non proident?',
          answer: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur vel illum qui dolorem.',
        },
        {
          _key: 'q5',
          question: 'Sed do eiusmod tempor incididunt ut labore?',
          answer: 'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.',
        },
      ],
    },
  },
}

export const Minimal = {
  args: {
    block: {
      _type: 'faqSection',
      _key: 'story-faq-2',
      headline: 'Questions',
      items: [
        {
          _key: 'q1',
          question: 'Lorem ipsum dolor sit amet?',
          answer: 'Consectetur adipiscing elit sed do eiusmod tempor.',
        },
        {
          _key: 'q2',
          question: 'Ut enim ad minim veniam?',
          answer: 'Quis nostrud exercitation ullamco laboris nisi ut aliquip.',
        },
      ],
    },
  },
}
