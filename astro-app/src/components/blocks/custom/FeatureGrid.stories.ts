import FeatureGrid from './FeatureGrid.astro'

export default {
  title: 'Blocks/FeatureGrid',
  component: FeatureGrid,
  tags: ['autodocs'],
}

export const TwoColumn = {
  args: {
    block: {
      _type: 'featureGrid',
      _key: 'story-features-2col',
      label: 'Benefits',
      headline: 'Why Partner With Us',
      columns: 2,
      features: [
        { _key: 'f1', title: 'Real-World Projects', description: 'Students solve actual business problems with modern technology stacks.' },
        { _key: 'f2', title: 'Talent Pipeline', description: 'Connect with emerging developers before they hit the job market.' },
      ],
    },
  },
}

export const ThreeColumn = {
  args: {
    block: {
      _type: 'featureGrid',
      _key: 'story-features-3col',
      label: 'What We Offer',
      headline: 'Our Capstone Program',
      subtitle: 'A semester-long collaboration between students and industry partners.',
      columns: 3,
      features: [
        { _key: 'f1', title: 'Real-World Projects', description: 'Students solve actual business problems', stat: '50+ Projects' },
        { _key: 'f2', title: 'Talent Pipeline', description: 'Connect with emerging developers', stat: '200+ Students' },
        { _key: 'f3', title: 'Innovation', description: 'Fresh perspectives on your challenges', stat: '95% Satisfaction' },
      ],
    },
  },
}

export const FourColumn = {
  args: {
    block: {
      _type: 'featureGrid',
      _key: 'story-features-4col',
      headline: 'Program Highlights',
      columns: 4,
      features: [
        { _key: 'f1', title: 'Agile Teams', description: 'Students work in agile sprints with weekly standups.' },
        { _key: 'f2', title: 'Mentorship', description: 'Industry mentors guide each team throughout the semester.' },
        { _key: 'f3', title: 'Demo Day', description: 'Final presentations to sponsors and faculty.' },
        { _key: 'f4', title: 'Portfolio Ready', description: 'Students graduate with production-quality work samples.' },
      ],
    },
  },
}
