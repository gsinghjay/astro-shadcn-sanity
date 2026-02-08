import Hero2 from './hero-2.astro'

export default {
  title: 'Blocks/Hero/Hero2',
  component: Hero2,
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
    item: {
        images: [
            {
                src: "https://placehold.co/44x44",
                alt: "User 1"
            },
            {
                src: "https://placehold.co/44x44",
                alt: "User 2"
            },
            {
                src: "https://placehold.co/44x44",
                alt: "User 3"
            }
        ],
        rating: 5,
        description: "Trusted by 10,000+ customers"
    }
},
}
