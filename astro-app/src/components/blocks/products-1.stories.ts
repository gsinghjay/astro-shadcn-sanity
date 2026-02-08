import Products1 from './products-1.astro'

export default {
  title: 'Blocks/Products/Products1',
  component: Products1,
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
    items: [
        {
            title: "Product Alpha",
            description: "Our flagship product.",
            image: {
                src: "https://placehold.co/600x400",
                alt: "Product A"
            },
            price: 29,
            unit: "/mo",
            href: "#"
        },
        {
            title: "Product Beta",
            description: "Advanced features included.",
            image: {
                src: "https://placehold.co/600x400",
                alt: "Product B"
            },
            price: 49,
            unit: "/mo",
            href: "#"
        },
        {
            title: "Product Gamma",
            description: "Enterprise solution.",
            image: {
                src: "https://placehold.co/600x400",
                alt: "Product C"
            },
            price: 99,
            unit: "/mo",
            href: "#"
        }
    ]
},
}
