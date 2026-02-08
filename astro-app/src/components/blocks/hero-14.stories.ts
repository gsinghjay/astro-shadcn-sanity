import Hero14 from './hero-14.astro'

export default {
  title: 'Blocks/Hero/Hero14',
  component: Hero14,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    link: {
        text: "New Feature",
        href: "#"
    },
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
    }
},
}
