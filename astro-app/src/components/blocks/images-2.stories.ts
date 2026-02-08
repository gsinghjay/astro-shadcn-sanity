import Images2 from './images-2.astro'

export default {
  title: 'Blocks/Images/Images2',
  component: Images2,
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
