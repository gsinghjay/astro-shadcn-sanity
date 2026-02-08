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
          children: [{ _type: 'span', text: 'Lorem Ipsum Notice' }],
        },
        {
          _type: 'block',
          _key: 'b2',
          children: [{ _type: 'span', text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' }],
        },
      ],
    },
  },
}
