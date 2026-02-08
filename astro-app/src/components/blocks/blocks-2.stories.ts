import Blocks2 from './blocks-2.astro'

export default {
  title: 'Blocks/Meta/Blocks2',
  component: Blocks2,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    title: "Section Title",
    description: "A short description that explains the value proposition of this section.",
    items: [
        {
            title: "Item One",
            description: "Description for item one."
        },
        {
            title: "Item Two",
            description: "Description for item two."
        },
        {
            title: "Item Three",
            description: "Description for item three."
        }
    ]
},
}
