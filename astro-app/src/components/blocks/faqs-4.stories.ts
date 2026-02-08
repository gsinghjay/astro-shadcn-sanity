import Faqs4 from './faqs-4.astro'

export default {
  title: 'Blocks/FAQs/Faqs4',
  component: Faqs4,
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
            title: "What is this product?",
            description: "A comprehensive solution for building modern web applications with ease."
        },
        {
            title: "How does pricing work?",
            description: "We offer flexible plans starting from free tier up to enterprise. All plans include core features."
        },
        {
            title: "Is there a free trial?",
            description: "Yes! You can try all features free for 14 days, no credit card required."
        },
        {
            title: "How do I get support?",
            description: "Our support team is available 24/7 via chat, email, and phone for all paid plans."
        }
    ]
},
}
