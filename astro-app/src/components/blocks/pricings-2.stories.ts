import Pricings2 from './pricings-2.astro'

export default {
  title: 'Blocks/Pricings/Pricings2',
  component: Pricings2,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    items: [
        {
            title: "Starter",
            description: "For individuals",
            price: 9,
            unit: "/mo",
            list: [
                "5 projects",
                "10GB storage",
                "Email support"
            ],
            links: [
                {
                    text: "Get Started",
                    href: "#"
                }
            ]
        },
        {
            title: "Pro",
            description: "For teams",
            price: 29,
            unit: "/mo",
            list: [
                "Unlimited projects",
                "100GB storage",
                "Priority support",
                "API access"
            ],
            links: [
                {
                    text: "Get Started",
                    href: "#"
                }
            ]
        },
        {
            title: "Enterprise",
            description: "For organizations",
            price: 99,
            unit: "/mo",
            list: [
                "Everything in Pro",
                "Custom integrations",
                "SLA guarantee",
                "Dedicated support"
            ],
            links: [
                {
                    text: "Contact Sales",
                    href: "#"
                }
            ]
        }
    ]
},
}
