import Accordion from './Accordion.astro'

const sharedItems = [
  {
    _key: 'acc-1',
    title: 'What is included in the free plan?',
    content: 'The free plan includes up to 5 projects, 10 GB of storage, and access to community support. No credit card required to get started.',
  },
  {
    _key: 'acc-2',
    title: 'Can I upgrade or downgrade at any time?',
    content: 'Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades apply at the end of the current billing cycle.',
  },
  {
    _key: 'acc-3',
    title: 'How does billing work?',
    content: 'We offer monthly and annual billing options. Annual plans save you 20% compared to monthly pricing. All prices are in USD.',
  },
  {
    _key: 'acc-4',
    title: 'Is there a refund policy?',
    content: 'We offer a 30-day money-back guarantee for all paid plans. If you are not satisfied, contact support for a full refund.',
  },
  {
    _key: 'acc-5',
    title: 'Do you offer custom enterprise plans?',
    content: 'Absolutely. Contact our sales team for custom pricing, dedicated support, and tailored features for your organization.',
  },
]

export default {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'General-purpose collapsible content block using native details/summary elements for zero-JS accordion behavior.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'bordered', 'separated', 'technical'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    description: { control: 'text', description: 'Section description' },
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
    _type: 'accordion',
    _key: 'story-accordion-default',
    variant: 'default',
    heading: 'Frequently Asked Questions',
    description: 'Find answers to the most common questions about our platform.',
    items: sharedItems,
  },
}

export const Bordered = {
  args: {
    _type: 'accordion',
    _key: 'story-accordion-bordered',
    variant: 'bordered',
    heading: 'Knowledge Base',
    description: 'Browse topics below to learn more.',
    items: sharedItems,
  },
}

export const Separated = {
  args: {
    _type: 'accordion',
    _key: 'story-accordion-separated',
    variant: 'separated',
    heading: 'Help Center',
    description: 'Click a topic to expand.',
    items: sharedItems,
  },
}

export const Technical = {
  args: {
    _type: 'accordion',
    _key: 'story-accordion-technical',
    variant: 'technical',
    heading: 'Technical Specifications',
    description: 'Detailed program and project requirements.',
    backgroundVariant: 'hatched-light',
    items: [
      { _key: 'at1', title: 'Technology Stack Requirements', content: 'Teams must use production-grade frameworks: React/Next.js, Astro, or SvelteKit for frontend. Node.js, Python, or Go for backend. AWS, Azure, or GCP for cloud infrastructure. All code must pass CI/CD pipeline checks.' },
      { _key: 'at2', title: 'Deliverable Standards', content: 'All projects must include: documented API endpoints, unit test coverage above 80%, deployment runbook, architecture decision records (ADRs), and a 15-minute technical demo.' },
      { _key: 'at3', title: 'Timeline & Milestones', content: 'Week 1–2: Requirements and architecture. Week 3–8: Sprint cycles with bi-weekly demos. Week 9–10: Integration testing and documentation. Week 11–12: Final showcase preparation.' },
      { _key: 'at4', title: 'Team Composition', content: '4–6 students per team, cross-functional: at least one frontend specialist, one backend specialist, one DevOps/infrastructure lead, and one QA/testing lead.' },
      { _key: 'at5', title: 'Evaluation Criteria', content: 'Code quality (30%), functionality completeness (25%), documentation (20%), presentation (15%), sponsor satisfaction (10%).' },
    ],
  },
}
