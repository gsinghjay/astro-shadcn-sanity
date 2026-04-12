import ColumnsBlock from './ColumnsBlock.astro'

export default {
  title: 'Components/ColumnsBlock',
  component: ColumnsBlock,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Two-column layout wrapper that places blocks side-by-side. Supports 5 column ratio variants (equal, wide-left, wide-right, sidebar-left, sidebar-right), vertical alignment, and mobile reverse ordering.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['equal', 'wide-left', 'wide-right', 'sidebar-left', 'sidebar-right'],
      description: 'Column ratio variant',
    },
    verticalAlign: {
      control: { type: 'select' },
      options: ['top', 'center', 'stretch'],
      description: 'Cross-axis alignment of the two columns',
    },
    reverseOnMobile: {
      control: 'boolean',
      description: 'When true, right column renders first on mobile',
    },
    // backgroundVariant, spacing, maxWidth are BlockWrapper props — applied by
    // BlockRenderer in production, not available in isolated Storybook renders.
  },
}

const richTextBlock = {
  _type: 'richText',
  _key: 'rt-left',
  content: [
    {
      _type: 'block',
      _key: 'b1',
      style: 'h3',
      children: [{ _type: 'span', _key: 's1', text: 'About Our Program' }],
    },
    {
      _type: 'block',
      _key: 'b2',
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: 's2',
          text: 'Our capstone program brings together students, sponsors, and industry professionals to create real-world solutions. Students gain hands-on experience working with cutting-edge technologies while sponsors benefit from fresh perspectives and innovative approaches.',
        },
      ],
    },
    {
      _type: 'block',
      _key: 'b3',
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: 's3',
          text: 'Each project is carefully scoped to deliver meaningful outcomes within the academic timeline, ensuring both educational value and practical impact.',
        },
      ],
    },
  ],
}

const richTextBlock2 = {
  _type: 'richText',
  _key: 'rt-right',
  content: [
    {
      _type: 'block',
      _key: 'b4',
      style: 'h3',
      children: [{ _type: 'span', _key: 's4', text: 'Get Involved' }],
    },
    {
      _type: 'block',
      _key: 'b5',
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: 's5',
          text: 'Whether you are a potential sponsor looking to support the next generation of engineers, or a student eager to apply your skills, we have a place for you.',
        },
      ],
    },
  ],
}

const statsBlock = {
  _type: 'statsRow',
  _key: 'stats-sidebar',
  heading: 'Quick Stats',
  stats: [
    { _key: 'st1', value: '50+', label: 'Projects', description: 'Completed to date' },
    { _key: 'st2', value: '120+', label: 'Students', description: 'Have participated' },
    { _key: 'st3', value: '30+', label: 'Sponsors', description: 'Industry partners' },
  ],
}

const newsletterBlock = {
  _type: 'newsletter',
  _key: 'nl-sidebar',
  heading: 'Stay Updated',
  description: 'Subscribe to our newsletter for the latest program updates.',
  inputPlaceholder: 'your@email.com',
  submitButtonLabel: 'Subscribe',
  privacyDisclaimerText: 'We respect your privacy.',
}

export const Equal = {
  args: {
    _type: 'columnsBlock',
    _key: 'story-cols-equal',
    variant: 'equal',
    verticalAlign: 'top',
    reverseOnMobile: false,
    leftBlocks: [richTextBlock],
    rightBlocks: [richTextBlock2],
  },
}

export const WideLeft = {
  args: {
    _type: 'columnsBlock',
    _key: 'story-cols-wide-left',
    variant: 'wide-left',
    verticalAlign: 'top',
    reverseOnMobile: false,
    leftBlocks: [richTextBlock],
    rightBlocks: [statsBlock],
  },
}

export const SidebarRight = {
  args: {
    _type: 'columnsBlock',
    _key: 'story-cols-sidebar-right',
    variant: 'sidebar-right',
    verticalAlign: 'top',
    reverseOnMobile: false,
    leftBlocks: [richTextBlock],
    rightBlocks: [newsletterBlock],
  },
}

export const MobileReversed = {
  args: {
    _type: 'columnsBlock',
    _key: 'story-cols-reversed',
    variant: 'sidebar-right',
    verticalAlign: 'top',
    reverseOnMobile: true,
    leftBlocks: [richTextBlock],
    rightBlocks: [statsBlock],
  },
}

export const CenterAligned = {
  args: {
    _type: 'columnsBlock',
    _key: 'story-cols-center',
    variant: 'equal',
    verticalAlign: 'center',
    reverseOnMobile: false,
    leftBlocks: [richTextBlock],
    rightBlocks: [statsBlock],
  },
}
