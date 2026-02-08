import ItemStory from './ItemStory.astro'

export default {
  title: 'UI/Item',
  component: ItemStory,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'outline', 'muted'] },
  },
}

export const Default = {
  args: {
    title: 'Item Title',
    description: 'A brief description of this item and what it contains.',
    variant: 'default',
  },
}

export const Outline = {
  args: {
    title: 'Outlined Item',
    description: 'An item with an outline border variant.',
    variant: 'outline',
  },
}

export const Muted = {
  args: {
    title: 'Muted Item',
    description: 'An item with a muted background variant.',
    variant: 'muted',
  },
}

export const WithMedia = {
  args: {
    title: 'Item With Icon',
    description: 'An item that includes a media element on the left.',
    variant: 'default',
    showMedia: true,
  },
}

export const AsLink = {
  args: {
    title: 'Clickable Item',
    description: 'This item renders as a link and is interactive.',
    variant: 'outline',
    href: '/example',
  },
}
