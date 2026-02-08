import Cta3 from './cta-3.astro'

export default {
  title: 'Blocks/CTA/Cta3',
  component: Cta3,
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
