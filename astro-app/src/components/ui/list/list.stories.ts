import ListStory from './ListStory.astro'

export default {
  title: 'UI/List',
  component: ListStory,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    items: ['First item in the list', 'Second item in the list', 'Third item in the list'],
  },
}

export const Technologies = {
  args: {
    items: ['Astro 5 with static site generation', 'Tailwind CSS v4 with CSS-first config', 'Sanity CMS for content management', 'TypeScript for type safety'],
  },
}
