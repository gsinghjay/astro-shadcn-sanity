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
      headline: 'Common Questions',
      items: [
        {
          _key: 'q1',
          question: 'How long does the capstone program last?',
          answer: 'The program runs for one full academic semester, typically 15 weeks. Teams meet weekly with their sponsor and deliver incremental milestones throughout.',
        },
        {
          _key: 'q2',
          question: 'What kind of projects are available?',
          answer: 'Projects span web applications, mobile apps, data analytics platforms, and internal tools. Sponsors propose real business challenges that are scoped by faculty to be achievable within a semester.',
        },
        {
          _key: 'q3',
          question: 'Do students get paid?',
          answer: 'The capstone is an academic course, so students earn credit rather than compensation. However, many sponsors offer internship or full-time positions to outstanding team members after the program.',
        },
        {
          _key: 'q4',
          question: 'What technologies do teams use?',
          answer: 'Technology choices are driven by project requirements and sponsor preferences. Common stacks include React, Node.js, Python, and cloud platforms like AWS and Azure.',
        },
        {
          _key: 'q5',
          question: 'How are teams formed?',
          answer: 'Faculty assign teams based on student skills, interests, and project requirements. Each team typically has 4-5 members with complementary strengths.',
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
          question: 'When does the program start?',
          answer: 'The next cohort begins in September 2027.',
        },
        {
          _key: 'q2',
          question: 'How do I apply?',
          answer: 'Submit your application through the student portal by the posted deadline.',
        },
      ],
    },
  },
}
