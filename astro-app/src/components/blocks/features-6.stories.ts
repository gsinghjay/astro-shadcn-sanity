import Features6 from './features-6.astro'

export default {
  title: 'Blocks/Features/Features6',
  component: Features6,
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
            icon: "zap",
            title: "Lightning Fast",
            description: "Built for speed and performance.",
            href: "#"
        },
        {
            icon: "shield",
            title: "Secure by Default",
            description: "Enterprise-grade security built in.",
            href: "#"
        },
        {
            icon: "settings",
            title: "Customizable",
            description: "Tailor everything to your needs.",
            href: "#"
        }
    ]
},
}
