import type { Page } from '../types';

export const aboutPage: Page = {
  _id: 'about',
  title: 'About the Program',
  slug: '/about',
  description: 'Learn about the NJIT YWCC Industry Capstone Program',
  blocks: [
    {
      _type: 'heroBanner',
      _key: 'hero-1',
      headline: 'The Program',
      subheadline: 'A structured, year-long partnership between industry and academia that transforms real business challenges into professional-grade software solutions.',
      layout: 'centered',
    },
    {
      _type: 'textWithImage',
      _key: 'twi-1',
      label: 'Overview',
      headline: 'Bridging Industry and Education',
      body: 'The YWCC Industry Capstone is the culminating experience for computing students at NJIT. Senior teams of 4-6 students work directly with an industry sponsor to scope, design, build, and deliver a production-quality software system over two semesters. Faculty advisors provide technical mentorship while industry liaisons ensure business alignment. The result: deliverables that sponsors deploy, and students who graduate with genuine professional experience.',
      imageUrl: 'https://images.pexels.com/photos/3184328/pexels-photo-3184328.jpeg?auto=compress&cs=tinysrgb&w=800',
      imagePosition: 'right',
    },
    {
      _type: 'featureGrid',
      _key: 'features-1',
      label: 'Program Structure',
      headline: 'How It Works',
      columns: 2,
      features: [
        {
          _key: 'f1',
          title: 'Project Scoping',
          description: 'Sponsors submit a problem statement and desired outcomes. Program coordinators work with the sponsor to scope the project appropriately for a student team.',
        },
        {
          _key: 'f2',
          title: 'Team Assignment',
          description: 'Students are matched to projects based on technical skills, domain interest, and career goals. Each team includes a mix of CS, IS, and IT majors.',
        },
        {
          _key: 'f3',
          title: 'Agile Development',
          description: 'Teams follow agile methodology with two-week sprints, regular standups, and iterative demos. Sponsors participate in sprint reviews and provide feedback.',
        },
        {
          _key: 'f4',
          title: 'Professional Delivery',
          description: 'Final deliverables include working software, source code, technical documentation, user guides, and a recorded demo. All IP belongs to the sponsor.',
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
          question: 'What is the cost to sponsor a capstone team?',
          answer: 'The standard sponsorship fee is $5,000 per team per academic year. This covers program administration, faculty mentorship, computing resources, and the Capstone Expo event. Multi-team discounts are available.',
        },
        {
          _key: 'q2',
          question: 'What types of projects are suitable?',
          answer: 'Projects involving web/mobile application development, data analysis platforms, machine learning systems, cloud infrastructure, cybersecurity tools, and IoT applications are all excellent fits. Projects should be scoped for 4-6 students working 8-10 hours per week over 32 weeks.',
        },
        {
          _key: 'q3',
          question: 'How much time commitment is required from the sponsor?',
          answer: 'Sponsors designate a liaison who meets with the team weekly (30-60 minutes) and attends three formal milestone reviews per semester. Total time investment is approximately 3-4 hours per week.',
        },
        {
          _key: 'q4',
          question: 'Who owns the intellectual property?',
          answer: 'The sponsor retains full IP rights to all project deliverables. Students sign an IP agreement at the start of the project. NJIT retains the right to reference the project in academic and promotional materials without disclosing proprietary details.',
        },
        {
          _key: 'q5',
          question: 'What technical skills do students bring?',
          answer: 'Students are seniors in Computer Science, Information Systems, or Information Technology programs. They have completed coursework in data structures, databases, software engineering, and networking, plus chosen electives in areas like AI/ML, cloud computing, and cybersecurity.',
        },
        {
          _key: 'q6',
          question: 'Can we hire students after the project?',
          answer: 'Many sponsors use the capstone as an extended evaluation period. Approximately 68% of sponsors have hired at least one team member. There are no placement fees or restrictions on hiring capstone participants.',
        },
        {
          _key: 'q7',
          question: 'What happens at the Capstone Expo?',
          answer: 'The annual Capstone Expo is a public showcase where all teams present their projects through live demos and poster sessions. The event draws 500+ attendees including industry professionals, faculty, students, and university leadership. Awards are given for outstanding projects.',
        },
      ],
    },
    {
      _type: 'ctaBanner',
      _key: 'cta-1',
      headline: 'Have More Questions?',
      body: 'Our program coordinators are happy to discuss how the Industry Capstone can work for your organization.',
      ctaText: 'Contact Us',
      ctaUrl: '/contact',
      variant: 'light',
    },
  ],
};
