import Skeleton from './skeleton.astro'

export default {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    class: 'h-4 w-48',
  },
}

export const Square = {
  args: {
    class: 'h-12 w-12',
  },
}

export const Card = {
  args: {
    class: 'h-32 w-64 rounded-md',
  },
}
