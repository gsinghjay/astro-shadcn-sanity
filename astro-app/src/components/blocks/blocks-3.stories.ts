import Blocks3 from './blocks-3.astro'

export default {
  title: 'Blocks/Meta/Blocks3',
  component: Blocks3,
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
