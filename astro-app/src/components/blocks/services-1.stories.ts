import Services1 from './services-1.astro'

export default {
  title: 'Blocks/Services/Services1',
  component: Services1,
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
            tagline: "Design",
            title: "UI/UX Design",
            description: "Beautiful interfaces that users love.",
            image: {
                src: "https://placehold.co/600x400",
                alt: "Design"
            },
            href: "#"
        },
        {
            tagline: "Development",
            title: "Web Development",
            description: "Scalable apps built with modern tools.",
            image: {
                src: "https://placehold.co/600x400",
                alt: "Development"
            },
            href: "#"
        },
        {
            tagline: "Strategy",
            title: "Digital Strategy",
            description: "Data-driven growth strategies.",
            image: {
                src: "https://placehold.co/600x400",
                alt: "Strategy"
            },
            href: "#"
        }
    ]
},
}
