import Product1 from './product-1.astro'

export default {
  title: 'Blocks/Products/Product1',
  component: Product1,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    title: "Section Title",
    description: "A short description that explains the value proposition of this section.",
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
    list: [
        "First benefit of this product",
        "Second benefit with details",
        "Third key advantage"
    ],
    images: [
        {
            src: "https://placehold.co/800x600",
            alt: "Image 1"
        },
        {
            src: "https://placehold.co/800x600",
            alt: "Image 2"
        },
        {
            src: "https://placehold.co/800x600",
            alt: "Image 3"
        }
    ]
},
}
