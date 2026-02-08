import Features1 from './features-1.astro'

export default {
  title: 'Blocks/Features/Features1',
  component: Features1,
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
