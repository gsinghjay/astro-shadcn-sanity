import CollapsibleStory from './CollapsibleStory.astro'

export default {
  title: 'UI/Collapsible',
  component: CollapsibleStory,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    triggerText: 'Show more details',
    content: 'This is the collapsible content that is hidden by default. Click the trigger to toggle visibility.',
  },
}

export const OpenByDefault = {
  args: {
    triggerText: 'Program requirements',
    content: 'Students must have completed core CS coursework including data structures, algorithms, and software engineering.',
    open: true,
  },
}
