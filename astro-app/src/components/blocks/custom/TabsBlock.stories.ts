import TabsBlock from './TabsBlock.astro'

const sharedTabs = [
  {
    _key: 'tab-overview',
    label: 'Overview',
    content: 'Our platform provides a comprehensive suite of tools designed to streamline your workflow. From project management to analytics, everything is integrated into a single, intuitive interface that adapts to your team\'s needs.',
  },
  {
    _key: 'tab-features',
    label: 'Features',
    content: 'Key features include real-time collaboration, automated reporting, custom dashboards, role-based access control, and seamless third-party integrations. Built for teams of all sizes with enterprise-grade security.',
  },
  {
    _key: 'tab-pricing',
    label: 'Pricing',
    content: 'We offer flexible pricing tiers starting from $9/month for individuals. Team plans start at $29/month with volume discounts available. All plans include a 14-day free trial with no credit card required.',
  },
  {
    _key: 'tab-support',
    label: 'Support',
    content: 'Our support team is available 24/7 via email and chat. Priority support with guaranteed response times is included in Professional and Enterprise plans. Extensive documentation and community forums are available to all users.',
  },
]

export default {
  title: 'Components/TabsBlock',
  component: TabsBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Tabbed content block using the existing Tabs UI component with default, pills, and underline styling variants.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'pills', 'underline'],
      description: 'Tab style variant',
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
    _type: 'tabsBlock',
    _key: 'story-tabs-default',
    variant: 'default',
    heading: 'Learn More',
    tabs: sharedTabs,
  },
}

export const Pills = {
  args: {
    _type: 'tabsBlock',
    _key: 'story-tabs-pills',
    variant: 'pills',
    heading: 'Explore Topics',
    tabs: sharedTabs,
  },
}

export const Underline = {
  args: {
    _type: 'tabsBlock',
    _key: 'story-tabs-underline',
    variant: 'underline',
    heading: 'Product Details',
    tabs: sharedTabs,
  },
}
