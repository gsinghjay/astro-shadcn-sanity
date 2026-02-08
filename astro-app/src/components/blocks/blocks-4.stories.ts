import Blocks4 from './blocks-4.astro'

export default {
  title: 'Blocks/Meta/Blocks4',
  component: Blocks4,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
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
