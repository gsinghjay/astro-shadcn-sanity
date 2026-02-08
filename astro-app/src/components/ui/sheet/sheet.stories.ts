import SheetStory from './SheetStory.astro'

export default {
  title: 'UI/Sheet',
  component: SheetStory,
  tags: ['autodocs'],
  argTypes: {
    side: { control: 'select', options: ['right', 'left', 'top', 'bottom'] },
  },
}

export const Right = {
  args: {
    side: 'right',
    title: 'Navigation',
  },
}

export const Left = {
  args: {
    side: 'left',
    title: 'Menu',
  },
}

export const Bottom = {
  args: {
    side: 'bottom',
    title: 'Actions',
  },
}
