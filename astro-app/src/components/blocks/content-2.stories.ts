import Content2 from './content-2.astro'

export default {
  title: 'Blocks/Content/Content2',
  component: Content2,
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
