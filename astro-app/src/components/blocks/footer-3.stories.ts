import Footer3 from './footer-3.astro'

export default {
  title: 'Blocks/Footer/Footer3',
  component: Footer3,
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
    menus: [
        {
            text: "Products",
            href: "#",
            links: [
                {
                    text: "Analytics",
                    href: "#"
                },
                {
                    text: "Automation",
                    href: "#"
                }
            ]
        },
        {
            text: "Solutions",
            href: "#",
            links: [
                {
                    text: "Enterprise",
                    href: "#"
                },
                {
                    text: "Startups",
                    href: "#"
                }
            ]
        },
        {
            text: "Pricing",
            href: "/pricing"
        },
        {
            text: "About",
            href: "/about"
        }
    ],
    socials: [
        "https://twitter.com",
        "https://github.com",
        "https://linkedin.com"
    ]
},
}
