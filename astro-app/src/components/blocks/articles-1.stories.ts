import Articles1 from './articles-1.astro'

export default {
  title: 'Blocks/Articles/Articles1',
  component: Articles1,
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
            href: "#",
            title: "Getting Started with Astro",
            description: "Learn how to build fast websites.",
            image: {
                src: "https://placehold.co/600x400",
                alt: "Article 1"
            },
            item: {
                image: {
                    src: "https://placehold.co/40x40",
                    alt: "Author"
                },
                title: "John Doe",
                description: "Feb 2026"
            }
        },
        {
            href: "#",
            title: "Advanced Tailwind Techniques",
            description: "Master utility-first CSS.",
            image: {
                src: "https://placehold.co/600x400",
                alt: "Article 2"
            },
            item: {
                image: {
                    src: "https://placehold.co/40x40",
                    alt: "Author"
                },
                title: "Jane Smith",
                description: "Jan 2026"
            }
        },
        {
            href: "#",
            title: "Component Architecture",
            description: "Building reusable UI systems.",
            image: {
                src: "https://placehold.co/600x400",
                alt: "Article 3"
            },
            item: {
                image: {
                    src: "https://placehold.co/40x40",
                    alt: "Author"
                },
                title: "Bob Wilson",
                description: "Dec 2025"
            }
        }
    ]
},
}
