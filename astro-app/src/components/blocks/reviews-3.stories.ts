import Reviews3 from './reviews-3.astro'

export default {
  title: 'Blocks/Reviews/Reviews3',
  component: Reviews3,
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
            title: "Amazing product!",
            description: "This has completely changed how we work. Highly recommended.",
            rating: 5,
            item: {
                title: "Jane Smith",
                description: "CEO at TechCo",
                image: {
                    src: "https://placehold.co/40x40",
                    alt: "Jane"
                }
            }
        },
        {
            title: "Great experience",
            description: "The support team is fantastic and the product is solid.",
            rating: 4,
            item: {
                title: "Mike Johnson",
                description: "CTO at StartupX",
                image: {
                    src: "https://placehold.co/40x40",
                    alt: "Mike"
                }
            }
        },
        {
            title: "Exceeded expectations",
            description: "We saw results within the first week of using it.",
            rating: 5,
            item: {
                title: "Sarah Lee",
                description: "VP at BigCorp",
                image: {
                    src: "https://placehold.co/40x40",
                    alt: "Sarah"
                }
            }
        }
    ]
},
}
