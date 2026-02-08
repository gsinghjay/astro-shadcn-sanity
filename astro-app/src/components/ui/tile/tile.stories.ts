import TileStory from './TileStory.astro'

export default {
  title: 'UI/Tile',
  component: TileStory,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'floating'] },
  },
}

export const Default = {
  args: {
    title: 'Tile Title',
    description: 'A brief description of this tile content.',
    variant: 'default',
    showMedia: true,
  },
}

export const Floating = {
  args: {
    title: 'Floating Tile',
    description: 'A tile with the floating variant for elevated appearance.',
    variant: 'floating',
    showMedia: true,
  },
}

export const NoMedia = {
  args: {
    title: 'Text Only Tile',
    description: 'A tile without a media element, content only.',
    variant: 'default',
    showMedia: false,
  },
}

export const AsLink = {
  args: {
    title: 'Clickable Tile',
    description: 'This tile renders as a link and is interactive.',
    variant: 'floating',
    href: '/example',
    showMedia: true,
  },
}
