import RichText from './RichText.astro'

export default {
  title: 'Blocks/RichText',
  component: RichText,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    block: {
      _type: 'richText',
      _key: 'story-rt-1',
      content: [
        {
          _type: 'block',
          _key: 'b1',
          style: 'h2',
          children: [{ _type: 'span', text: 'About Our Capstone Program' }],
        },
        {
          _type: 'block',
          _key: 'b2',
          children: [{ _type: 'span', text: 'The YWCC Capstone program pairs senior computer science students with industry sponsors to deliver production-quality software over a full academic semester. Each team works in agile sprints with weekly standups, code reviews, and milestone demos.' }],
        },
        {
          _type: 'block',
          _key: 'b3',
          style: 'h3',
          children: [{ _type: 'span', text: 'How It Works' }],
        },
        {
          _type: 'block',
          _key: 'b4',
          children: [{ _type: 'span', text: 'Sponsors propose real business challenges. Faculty curate and scope the projects. Students form cross-functional teams and deliver working software by the end of the semester.' }],
        },
        {
          _type: 'block',
          _key: 'b5',
          style: 'h4',
          children: [{ _type: 'span', text: 'Eligibility Requirements' }],
        },
        {
          _type: 'block',
          _key: 'b6',
          children: [{ _type: 'span', text: 'Students must have completed core CS coursework including data structures, algorithms, and software engineering. Prior internship or project experience is recommended but not required.' }],
        },
      ],
    },
  },
}

export const ShortContent = {
  args: {
    block: {
      _type: 'richText',
      _key: 'story-rt-2',
      content: [
        {
          _type: 'block',
          _key: 'b1',
          style: 'h2',
          children: [{ _type: 'span', text: 'Important Notice' }],
        },
        {
          _type: 'block',
          _key: 'b2',
          children: [{ _type: 'span', text: 'Applications for the Spring 2027 cohort open on November 1st. Space is limited to 10 teams.' }],
        },
      ],
    },
  },
}
