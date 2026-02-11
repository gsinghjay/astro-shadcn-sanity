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
      heading: 'Lorem Ipsum Dolor Sit',
      columns: 2,
      items: [
        { _key: 'f1', title: 'Consectetur Adipiscing', description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.' },
        { _key: 'f2', title: 'Elit Sed Do', description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.' },
      ],
    },
  },
}

export const ThreeColumn = {
  args: {
    block: {
      _type: 'featureGrid',
      _key: 'story-features-3col',
      heading: 'Lorem Ipsum Features',
      columns: 3,
      items: [
        { _key: 'f1', title: 'Consectetur Adipiscing', description: 'Duis aute irure dolor in reprehenderit' },
        { _key: 'f2', title: 'Elit Sed Do', description: 'Ut enim ad minim veniam quis nostrud' },
        { _key: 'f3', title: 'Eiusmod Tempor', description: 'Excepteur sint occaecat cupidatat non' },
      ],
    },
  },
}

export const FourColumn = {
  args: {
    block: {
      _type: 'featureGrid',
      _key: 'story-features-4col',
      heading: 'Lorem Highlights',
      columns: 4,
      items: [
        { _key: 'f1', title: 'Lorem Ipsum', description: 'Sed do eiusmod tempor incididunt ut labore.' },
        { _key: 'f2', title: 'Dolor Sit', description: 'Ut enim ad minim veniam quis nostrud exercitation.' },
        { _key: 'f3', title: 'Amet Consectetur', description: 'Duis aute irure dolor in reprehenderit in voluptate.' },
        { _key: 'f4', title: 'Adipiscing Elit', description: 'Excepteur sint occaecat cupidatat non proident sunt.' },
      ],
    },
  },
}
