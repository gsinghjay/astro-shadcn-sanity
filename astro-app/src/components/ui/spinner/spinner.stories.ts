import Spinner from './spinner.astro'

export default {
  title: 'UI/Spinner',
  component: Spinner,
  tags: ['autodocs'],
}

export const Default = {
  args: {},
}

export const Large = {
  args: {
    class: 'size-8',
  },
}
