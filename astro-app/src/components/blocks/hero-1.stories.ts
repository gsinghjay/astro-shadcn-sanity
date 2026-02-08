import Hero1 from './hero-1.astro'

export default {
  title: 'Blocks/Hero/Hero1',
  component: Hero1,
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
