import Stats3 from './stats-3.astro'

export default {
  title: 'Blocks/Stats/Stats3',
  component: Stats3,
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
