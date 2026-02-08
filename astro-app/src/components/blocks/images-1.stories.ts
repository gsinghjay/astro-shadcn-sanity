import Images1 from './images-1.astro'

export default {
  title: 'Blocks/Images/Images1',
  component: Images1,
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
            title: "Project Alpha",
            image: {
                src: "https://placehold.co/600x400",
                alt: "Project A"
            }
        },
        {
            href: "#",
            title: "Project Beta",
            image: {
                src: "https://placehold.co/600x400",
                alt: "Project B"
            }
        },
        {
            href: "#",
            title: "Project Gamma",
            image: {
                src: "https://placehold.co/600x400",
                alt: "Project C"
            }
        },
        {
            href: "#",
            title: "Project Delta",
            image: {
                src: "https://placehold.co/600x400",
                alt: "Project D"
            }
        }
    ]
},
}
