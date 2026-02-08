import EmptyStory from './EmptyStory.astro'

export default {
  title: 'UI/Empty',
  component: EmptyStory,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    title: 'No projects found',
    description: 'There are no projects matching your criteria.',
    buttonText: 'View all projects',
  },
}

export const NotFound = {
  args: {
    title: '404 - Page Not Found',
    description: 'The page you are looking for does not exist.',
    buttonText: 'Go home',
  },
}
