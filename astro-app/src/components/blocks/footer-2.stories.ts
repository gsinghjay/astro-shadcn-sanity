import Footer2 from './footer-2.astro'

export default {
  title: 'Blocks/Footer/Footer2',
  component: Footer2,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
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
    logo: {
        src: "https://placehold.co/32x32",
        alt: "Logo",
        text: "Acme Inc",
        href: "/"
    },
    socials: [
        "https://twitter.com",
        "https://github.com",
        "https://linkedin.com"
    ]
},
}
