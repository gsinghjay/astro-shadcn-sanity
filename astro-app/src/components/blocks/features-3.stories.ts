import Features3 from './features-3.astro'

export default {
  title: 'Blocks/Features/Features3',
  component: Features3,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
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
