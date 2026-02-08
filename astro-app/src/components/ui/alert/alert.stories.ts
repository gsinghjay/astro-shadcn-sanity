import AlertStory from './AlertStory.astro'

export default {
  title: 'UI/Alert',
  component: AlertStory,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'destructive'] },
  },
}

export const Default = {
  args: {
    title: 'Heads up!',
    description: 'You can add components to your app using the CLI.',
    variant: 'default',
  },
}

export const Destructive = {
  args: {
    title: 'Error',
    description: 'Your session has expired. Please log in again.',
    variant: 'destructive',
  },
}
