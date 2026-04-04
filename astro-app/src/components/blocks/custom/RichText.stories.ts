import RichText from './RichText.astro'

export default {
  title: 'Components/RichText',
  component: RichText,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Portable Text renderer for long-form content. Supports default and narrow (672px) widths.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['prose', 'narrow', 'wide'],
      description: 'Width variant',
    },
    backgroundVariant: {
      control: { type: 'select' },
      options: ['white', 'light', 'dark', 'primary'],
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
    _type: 'richText',
    _key: 'story-rt-1',
    content: [
      {
        _type: 'block',
        _key: 'b1',
        style: 'h2',
        children: [{ _type: 'span', text: 'Lorem Ipsum Dolor Sit Amet' }],
      },
      {
        _type: 'block',
        _key: 'b2',
        children: [{ _type: 'span', text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur.' }],
      },
      {
        _type: 'block',
        _key: 'b3',
        style: 'h3',
        children: [{ _type: 'span', text: 'Consectetur Adipiscing Elit' }],
      },
      {
        _type: 'block',
        _key: 'b4',
        children: [{ _type: 'span', text: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate.' }],
      },
      {
        _type: 'block',
        _key: 'b5',
        style: 'h4',
        children: [{ _type: 'span', text: 'Sed Do Eiusmod Tempor' }],
      },
      {
        _type: 'block',
        _key: 'b6',
        children: [{ _type: 'span', text: 'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est omnis dolor repellendus.' }],
      },
    ],
  },
}

export const Narrow = {
  args: {
    _type: 'richText',
    _key: 'story-rt-narrow',
    variant: 'narrow',
    content: [
      {
        _type: 'block',
        _key: 'b1',
        style: 'h2',
        children: [{ _type: 'span', text: 'Narrow Width Content' }],
      },
      {
        _type: 'block',
        _key: 'b2',
        children: [{ _type: 'span', text: 'This content is constrained to 672px maximum width, ideal for focused reading experiences. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.' }],
      },
      {
        _type: 'block',
        _key: 'b3',
        style: 'h3',
        children: [{ _type: 'span', text: 'Improved Readability' }],
      },
      {
        _type: 'block',
        _key: 'b4',
        children: [{ _type: 'span', text: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.' }],
      },
    ],
  },
}

export const ShortContent = {
  args: {
    _type: 'richText',
    _key: 'story-rt-2',
    content: [
      {
        _type: 'block',
        _key: 'b1',
        style: 'h2',
        children: [{ _type: 'span', text: 'Lorem Ipsum Notice' }],
      },
      {
        _type: 'block',
        _key: 'b2',
        children: [{ _type: 'span', text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' }],
      },
    ],
  },
}
