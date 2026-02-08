import Stats2 from './stats-2.astro'

export default {
  title: 'Blocks/Stats/Stats2',
  component: Stats2,
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
            title: "10K+",
            description: "Active Users"
        },
        {
            title: "99.9%",
            description: "Uptime"
        },
        {
            title: "150+",
            description: "Countries"
        },
        {
            title: "24/7",
            description: "Support"
        }
    ]
},
}
