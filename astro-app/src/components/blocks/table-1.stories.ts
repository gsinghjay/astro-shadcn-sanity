import Table1 from './table-1.astro'

export default {
  title: 'Blocks/Table/Table1',
  component: Table1,
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
    list: [
        "First benefit of this product",
        "Second benefit with details",
        "Third key advantage"
    ],
    items: [
        {
            title: "Feature",
            description: "Status"
        },
        {
            title: "Authentication",
            description: "Supported"
        },
        {
            title: "API Access",
            description: "Supported"
        },
        {
            title: "Custom Domains",
            description: "Pro Plan"
        },
        {
            title: "SSO",
            description: "Enterprise"
        }
    ]
},
}
