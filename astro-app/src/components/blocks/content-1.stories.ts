import Content1 from './content-1.astro'

export default {
  title: 'Blocks/Content/Content1',
  component: Content1,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    links: [
        {
            text: "Get Started",
            href: "#"
        },
        {
            text: "Learn More",
            href: "#"
        }
    ],
    image: {
        src: "https://placehold.co/800x400",
        alt: "Placeholder image"
    },
    list: [
        "First benefit of this product",
        "Second benefit with details",
        "Third key advantage"
    ]
},
}
