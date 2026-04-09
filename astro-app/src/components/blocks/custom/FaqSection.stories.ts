import FaqSection from './FaqSection.astro'

export default {
  title: 'Components/FaqSection',
  component: FaqSection,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Accordion-based FAQ with numbered questions. Supports split (sticky heading), stacked, spread-header, and narrow layouts.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['split', 'stacked', 'spread-header', 'narrow', 'technical'],
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
    _type: 'faqSection',
    _key: 'story-faq-1',
    heading: 'Frequently Asked Questions',
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
}

export const ManyItems = {
  args: {
    _type: 'faqSection',
    _key: 'story-faq-many',
    heading: 'Comprehensive FAQ',
    items: [
      { _key: 'q1', question: 'What is the Real World Capstone program?', answer: 'A project-based learning initiative that pairs students with industry sponsors to solve real engineering challenges.' },
      { _key: 'q2', question: 'How long does a typical project last?', answer: 'Projects typically run for one academic semester (14-16 weeks), though some sponsors extend to two semesters.' },
      { _key: 'q3', question: 'What types of projects are available?', answer: 'Projects span full-stack web development, data engineering, cloud infrastructure, DevOps automation, and mobile application development.' },
      { _key: 'q4', question: 'How are teams assigned to projects?', answer: 'Students rank project preferences and teams are formed based on skills, interests, and sponsor requirements.' },
      { _key: 'q5', question: 'What is the time commitment for sponsors?', answer: 'Sponsors typically commit to a one-hour weekly meeting with the student team and periodic progress reviews.' },
      { _key: 'q6', question: 'Can sponsors provide their own tech stack?', answer: 'Yes, sponsors can specify preferred technologies. Teams adapt to the sponsor stack as part of the learning experience.' },
      { _key: 'q7', question: 'What happens to the code after the project ends?', answer: 'Sponsors retain full ownership of deliverables. Students retain portfolio rights to showcase their contributions.' },
      { _key: 'q8', question: 'How do I apply as a sponsor?', answer: 'Submit a project proposal through the sponsor portal. Our team reviews proposals and matches them with student teams.' },
      { _key: 'q9', question: 'Is there a cost to participate?', answer: 'Sponsorship tiers range from Silver to Platinum, each with different levels of engagement and deliverables.' },
      { _key: 'q10', question: 'Can international companies participate?', answer: 'Yes, we support remote collaboration with sponsors worldwide. All meetings are conducted via video conference.' },
    ],
  },
}

export const Minimal = {
  args: {
    _type: 'faqSection',
    _key: 'story-faq-2',
    heading: 'Questions',
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
}

export const Technical = {
  args: {
    _type: 'faqSection',
    _key: 'story-faq-technical',
    variant: 'technical',
    heading: 'Sponsor FAQ',
    backgroundVariant: 'hatched-light',
    items: [
      { _key: 'ft1', question: 'What is the minimum commitment for sponsors?', answer: 'Silver-tier sponsorship starts at $5,000 per semester and includes one capstone project with a dedicated student team of 4–6 members.' },
      { _key: 'ft2', question: 'Who owns the intellectual property?', answer: 'IP arrangements are flexible. Standard projects use an open-source license. Custom IP agreements can be negotiated for Gold and Platinum sponsors.' },
      { _key: 'ft3', question: 'How are student teams selected?', answer: 'Teams are assembled based on skill match to project requirements. Platinum sponsors get first-choice team selection; Gold sponsors get priority matching.' },
      { _key: 'ft4', question: 'What technologies do students work with?', answer: 'Our program covers full-stack development, ML/AI, cloud architecture, cybersecurity, mobile/IoT, and data engineering. Technology selection is driven by project requirements.' },
      { _key: 'ft5', question: 'Can we hire students after the project?', answer: 'Absolutely. All sponsors receive student resume access. Gold and Platinum sponsors get exclusive recruitment events and early access to top performers.' },
    ],
  },
}
