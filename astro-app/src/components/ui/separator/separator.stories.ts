import Separator from './separator.astro'

export default {
  title: 'UI/Separator',
  component: Separator,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
}

export const Horizontal = {
  args: {
    orientation: 'horizontal',
  },
}

export const Vertical = {
  args: {
    orientation: 'vertical',
    style: 'height: 100px;',
  },
}
